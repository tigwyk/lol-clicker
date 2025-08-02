"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Decimal from "break_eternity.js";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'progress' | 'upgrades' | 'efficiency' | 'legacy' | 'time' | 'special';
  criteria: {
    type: 'total_rp' | 'rank' | 'upgrade_count' | 'click_power' | 'passive_income' | 'prestige_count' | 'play_time' | 'special';
    target: Decimal | string | number;
    upgradeType?: string;
  };
  reward: {
    type: 'rp' | 'legacy_points' | 'multiplier';
    amount: Decimal;
  };
  unlocked: boolean;
  claimed: boolean;
}

interface CaseFile {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  type: 'multiple_choice' | 'sequence' | 'evidence';
  question: string;
  options?: string[];
  correctAnswer: number | string | number[];
  explanation: string;
  rewards: {
    rp: Decimal;
    experience?: number;
  };
  unlockRank: string;
  completed: boolean;
  timeLimit?: number; // in seconds
}

interface RandomEvent {
  id: string;
  title: string;
  description: string;
  type: 'crime_wave' | 'commendation' | 'equipment_found' | 'training_opportunity' | 'budget_cut' | 'overtime';
  effect: {
    type: 'rp_bonus' | 'click_multiplier' | 'passive_multiplier' | 'upgrade_discount' | 'rp_penalty' | 'upgrade_cost_increase';
    amount: number;
    duration: number; // in seconds
  };
  probability: number; // 0-1
  minRank?: string;
  isActive: boolean;
  startTime?: number;
}

interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  type: 'radio' | 'badge' | 'weapon' | 'vest' | 'vehicle' | 'gadget';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  effects: {
    clickPower?: number;
    passiveIncome?: number;
    upgradeCostReduction?: number;
    caseSuccessRate?: number;
    eventChance?: number;
  };
  unlockRank: string;
  icon: string;
  owned: boolean;
  equipped: boolean;
}

interface EquipmentSlots {
  radio: EquipmentItem | null;
  badge: EquipmentItem | null;
  weapon: EquipmentItem | null;
  vest: EquipmentItem | null;
  vehicle: EquipmentItem | null;
  gadget: EquipmentItem | null;
}

interface DepartmentBuilding {
  id: string;
  name: string;
  description: string;
  type: 'police_station' | 'training_facility' | 'forensics_lab' | 'dispatch_center' | 'armory' | 'motor_pool';
  level: number;
  maxLevel: number;
  cost: Decimal;
  costScaling: number;
  effects: {
    passiveIncome?: number;
    clickPower?: number;
    staffCapacity?: number;
    upgradeDiscount?: number;
    caseSuccessRate?: number;
    eventChance?: number;
  };
  unlockRank: string;
  staffed: number;
  icon: string;
}

interface StaffMember {
  id: string;
  name: string;
  type: 'officer' | 'detective' | 'technician' | 'dispatcher' | 'sergeant';
  level: number;
  experience: number;
  assignedBuilding: string | null;
  efficiency: number;
  cost: Decimal;
  skills: {
    investigation?: number;
    patrol?: number;
    technical?: number;
    leadership?: number;
  };
  unlockRank: string;
}

interface Department {
  buildings: DepartmentBuilding[];
  staff: StaffMember[];
  totalStaffCapacity: number;
  totalIncome: Decimal;
}

interface GameState {
  respectPoints: Decimal;
  clickValue: Decimal;
  rank: string;
  passiveIncome: Decimal;
  legacyPoints: Decimal;
  totalRP: Decimal; // Track lifetime RP for prestige calculation
  prestigeCount: Decimal;
  playTime: number; // in seconds
  upgrades: {
    equipment: Decimal;
    training: Decimal;
    partner: Decimal;
    patrol: Decimal;
    investigation: Decimal;
    precinct: Decimal;
    automation: Decimal;
  };
  legacyUpgrades: {
    efficiency: Decimal; // +10% income per level
    wisdom: Decimal;     // -2% costs per level 
    equipment: Decimal;  // Unlock upgrades earlier
  };
  achievements: Achievement[];
  caseFiles: CaseFile[];
  randomEvents: RandomEvent[];
  activeEffects: {
    clickMultiplier: number;
    passiveMultiplier: number;
    upgradeDiscount: number;
    endTime: number;
  }[];
  equipment: EquipmentItem[];
  equippedItems: EquipmentSlots;
  department: Department;
  soundSettings: {
    masterVolume: number;
    sfxEnabled: boolean;
    ambientEnabled: boolean;
    sfxVolume: number;
    ambientVolume: number;
  };
  themeSettings: {
    theme: 'light' | 'dark' | 'auto';
    customColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  statistics: {
    totalClicks: Decimal;
    totalUpgradesPurchased: Decimal;
    totalCasesSolved: Decimal;
    totalAchievementsUnlocked: Decimal;
    totalPrestigeCount: Decimal;
    sessionsPlayed: Decimal;
    currentStreak: Decimal;
    bestClicksPerSecond: number;
    totalTimeInRanks: { [rank: string]: number };
    firstPlayDate: number;
    lastPlayDate: number;
    totalRPEarned: Decimal;
    totalRPSpent: Decimal;
    averageSessionLength: number;
    longestSession: number;
  };
}

const RANKS = [
  { name: "Beat Cop", requirement: new Decimal(0) },
  { name: "Detective", requirement: new Decimal(100) },
  { name: "Sergeant", requirement: new Decimal(500) }, 
  { name: "Lieutenant", requirement: new Decimal(2000) },
  { name: "Captain", requirement: new Decimal(10000) },
  { name: "Chief", requirement: new Decimal(50000) }
];

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  // Radio Equipment
  {
    id: 'basic_radio',
    name: 'Basic Radio',
    description: 'Standard issue police radio for communication',
    type: 'radio',
    rarity: 'common',
    effects: { clickPower: 2, passiveIncome: 1 },
    unlockRank: 'Beat Cop',
    icon: '📻',
    owned: false,
    equipped: false
  },
  {
    id: 'digital_radio',
    name: 'Digital Radio',
    description: 'Enhanced digital radio with clearer signals',
    type: 'radio',
    rarity: 'uncommon',
    effects: { clickPower: 5, passiveIncome: 3, eventChance: 5 },
    unlockRank: 'Detective',
    icon: '📡',
    owned: false,
    equipped: false
  },
  {
    id: 'tactical_radio',
    name: 'Tactical Radio',
    description: 'Military-grade encrypted radio system',
    type: 'radio',
    rarity: 'rare',
    effects: { clickPower: 12, passiveIncome: 8, eventChance: 10 },
    unlockRank: 'Sergeant',
    icon: '🎙️',
    owned: false,
    equipped: false
  },

  // Badge Equipment
  {
    id: 'rookie_badge',
    name: 'Rookie Badge',
    description: 'Your first badge as a police officer',
    type: 'badge',
    rarity: 'common',
    effects: { clickPower: 1, caseSuccessRate: 5 },
    unlockRank: 'Beat Cop',
    icon: '🛡️',
    owned: true, // Starting equipment
    equipped: true
  },
  {
    id: 'detective_shield',
    name: 'Detective Shield',
    description: 'Distinguished detective identification',
    type: 'badge',
    rarity: 'uncommon',
    effects: { clickPower: 4, caseSuccessRate: 15, passiveIncome: 2 },
    unlockRank: 'Detective',
    icon: '🏅',
    owned: false,
    equipped: false
  },
  {
    id: 'gold_badge',
    name: 'Gold Badge',
    description: 'Prestigious gold badge for senior officers',
    type: 'badge',
    rarity: 'epic',
    effects: { clickPower: 15, caseSuccessRate: 25, passiveIncome: 10 },
    unlockRank: 'Captain',
    icon: '🥇',
    owned: false,
    equipped: false
  },

  // Weapon Equipment  
  {
    id: 'service_pistol',
    name: 'Service Pistol',
    description: 'Standard issue sidearm',
    type: 'weapon',
    rarity: 'common',
    effects: { clickPower: 3 },
    unlockRank: 'Beat Cop',
    icon: '🔫',
    owned: false,
    equipped: false
  },
  {
    id: 'tactical_rifle',
    name: 'Tactical Rifle',
    description: 'High-precision tactical weapon',
    type: 'weapon',
    rarity: 'rare',
    effects: { clickPower: 20, caseSuccessRate: 10 },
    unlockRank: 'Sergeant',
    icon: '🎯',
    owned: false,
    equipped: false
  },

  // Vest Equipment
  {
    id: 'kevlar_vest',
    name: 'Kevlar Vest',
    description: 'Bulletproof protection vest',
    type: 'vest',
    rarity: 'uncommon',
    effects: { passiveIncome: 5, caseSuccessRate: 10 },
    unlockRank: 'Detective',
    icon: '🦺',
    owned: false,
    equipped: false
  },
  {
    id: 'tactical_vest',
    name: 'Tactical Vest',
    description: 'Advanced tactical gear with utility pouches',
    type: 'vest',
    rarity: 'rare',
    effects: { passiveIncome: 12, caseSuccessRate: 20, upgradeCostReduction: 5 },
    unlockRank: 'Lieutenant',
    icon: '🛡️',
    owned: false,
    equipped: false
  },

  // Vehicle Equipment
  {
    id: 'patrol_car',
    name: 'Patrol Car',
    description: 'Standard police patrol vehicle',
    type: 'vehicle',
    rarity: 'common',
    effects: { passiveIncome: 8, clickPower: 4 },
    unlockRank: 'Beat Cop',
    icon: '🚔',
    owned: false,
    equipped: false
  },
  {
    id: 'suv_cruiser',
    name: 'SUV Cruiser',
    description: 'Heavy-duty police SUV',
    type: 'vehicle',
    rarity: 'uncommon',
    effects: { passiveIncome: 18, clickPower: 8, eventChance: 8 },
    unlockRank: 'Sergeant',
    icon: '🚙',
    owned: false,
    equipped: false
  },
  {
    id: 'helicopter',
    name: 'Police Helicopter',
    description: 'Aerial surveillance and response unit',
    type: 'vehicle',
    rarity: 'legendary',
    effects: { passiveIncome: 50, clickPower: 25, caseSuccessRate: 30, eventChance: 20 },
    unlockRank: 'Chief',
    icon: '🚁',
    owned: false,
    equipped: false
  },

  // Gadget Equipment
  {
    id: 'flashlight',
    name: 'LED Flashlight',
    description: 'High-powered LED flashlight',
    type: 'gadget',
    rarity: 'common',
    effects: { caseSuccessRate: 8 },
    unlockRank: 'Beat Cop',
    icon: '🔦',
    owned: false,
    equipped: false
  },
  {
    id: 'body_camera',
    name: 'Body Camera',
    description: 'Records interactions for evidence',
    type: 'gadget',
    rarity: 'uncommon',
    effects: { caseSuccessRate: 15, upgradeCostReduction: 3 },
    unlockRank: 'Detective',
    icon: '📹',
    owned: false,
    equipped: false
  },
  {
    id: 'forensic_kit',
    name: 'Forensic Kit',
    description: 'Advanced evidence collection tools',
    type: 'gadget',
    rarity: 'rare',
    effects: { caseSuccessRate: 35, clickPower: 8 },
    unlockRank: 'Lieutenant',
    icon: '🔬',
    owned: false,
    equipped: false
  },
  {
    id: 'drone',
    name: 'Surveillance Drone',
    description: 'Remote surveillance and reconnaissance',
    type: 'gadget',
    rarity: 'epic',
    effects: { passiveIncome: 20, caseSuccessRate: 25, eventChance: 15 },
    unlockRank: 'Captain',
    icon: '🛸',
    owned: false,
    equipped: false
  }
];

const INITIAL_CASE_FILES: CaseFile[] = [
  // Beat Cop Cases
  {
    id: 'traffic_stop',
    title: 'Traffic Stop Protocol',
    description: 'A routine traffic stop requires proper procedure',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: 'During a traffic stop, what should you do first?',
    options: [
      'Ask for license and registration immediately',
      'Call for backup',
      'Observe the vehicle and occupants for safety',
      'Start writing the ticket'
    ],
    correctAnswer: 2,
    explanation: 'Safety first! Always observe the vehicle and occupants to assess potential threats before proceeding.',
    rewards: { rp: new Decimal(50) },
    unlockRank: 'Beat Cop',
    completed: false,
    timeLimit: 30
  },
  {
    id: 'noise_complaint',
    title: 'Noise Complaint Investigation',
    description: 'Residents are complaining about loud music',
    difficulty: 'easy',
    type: 'sequence',
    question: 'Put these steps in the correct order for handling a noise complaint:',
    options: [
      'Document the incident',
      'Knock on the door and identify yourself',
      'Listen for the noise yourself',
      'Speak with the complainant'
    ],
    correctAnswer: [3, 2, 1, 0],
    explanation: 'Proper procedure: Speak with complainant → Listen for noise → Knock and identify → Document',
    rewards: { rp: new Decimal(75) },
    unlockRank: 'Beat Cop',
    completed: false
  },
  
  // Detective Cases
  {
    id: 'burglary_scene',
    title: 'Burglary Scene Analysis',
    description: 'A home has been burglarized, examine the evidence',
    difficulty: 'medium',
    type: 'evidence',
    question: 'Which piece of evidence should be prioritized for collection?',
    options: [
      'Fingerprints on the broken window',
      'Muddy footprints leading to the backyard',
      'Witnesses saw a suspicious van',
      'Missing jewelry from the bedroom'
    ],
    correctAnswer: 0,
    explanation: 'Fingerprints provide the most direct physical evidence linking a suspect to the crime scene.',
    rewards: { rp: new Decimal(200), experience: 10 },
    unlockRank: 'Detective',
    completed: false,
    timeLimit: 60
  },
  {
    id: 'fraud_investigation',
    title: 'Credit Card Fraud Case',
    description: 'Multiple fraudulent charges on stolen credit cards',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: 'What pattern suggests this is an organized fraud ring?',
    options: [
      'Random small purchases at different stores',
      'Large purchases at electronics stores within 2 hours',
      'Online purchases from home',
      'ATM withdrawals in the same neighborhood'
    ],
    correctAnswer: 1,
    explanation: 'Organized rings typically make large, quick purchases at high-value stores to maximize profit before cards are reported stolen.',
    rewards: { rp: new Decimal(300), experience: 15 },
    unlockRank: 'Detective',
    completed: false
  },
  
  // Sergeant Cases
  {
    id: 'drug_bust',
    title: 'Coordinated Drug Operation',
    description: 'Plan and execute a multi-location drug bust',
    difficulty: 'hard',
    type: 'sequence',
    question: 'Plan the operation timeline for maximum effectiveness:',
    options: [
      'Execute all warrants simultaneously',
      'Set up surveillance teams',
      'Brief all units on their roles',
      'Coordinate with district attorney'
    ],
    correctAnswer: [3, 1, 2, 0],
    explanation: 'Proper planning: DA coordination → Surveillance → Brief units → Execute simultaneously to prevent evidence destruction.',
    rewards: { rp: new Decimal(500), experience: 25 },
    unlockRank: 'Sergeant',
    completed: false,
    timeLimit: 90
  },
  
  // Lieutenant Cases
  {
    id: 'officer_misconduct',
    title: 'Internal Affairs Investigation',
    description: 'Handle allegations of officer misconduct properly',
    difficulty: 'hard',
    type: 'multiple_choice',
    question: 'What is the most critical first step in an IA investigation?',
    options: [
      'Interview the accused officer immediately',
      'Secure all relevant evidence and documentation',
      'Notify the police union',
      'Interview witnesses'
    ],
    correctAnswer: 1,
    explanation: 'Evidence preservation is crucial as it can be destroyed or tampered with if not secured immediately.',
    rewards: { rp: new Decimal(750), experience: 30 },
    unlockRank: 'Lieutenant',
    completed: false
  },
  
  // Captain Cases
  {
    id: 'budget_crisis',
    title: 'Department Budget Management',
    description: 'Allocate limited resources during budget cuts',
    difficulty: 'expert',
    type: 'multiple_choice',
    question: 'Which area should maintain funding priority during budget cuts?',
    options: [
      'Administrative staff',
      'Equipment upgrades',
      'Officer training programs',
      'Facility maintenance'
    ],
    correctAnswer: 2,
    explanation: 'Officer training directly impacts public safety and effectiveness, making it the top priority during cuts.',
    rewards: { rp: new Decimal(1000), experience: 40 },
    unlockRank: 'Captain',
    completed: false,
    timeLimit: 120
  },
  
  // Chief Cases
  {
    id: 'public_relations',
    title: 'Crisis Communication',
    description: 'Handle media during a controversial incident',
    difficulty: 'expert',
    type: 'sequence',
    question: 'Order these crisis communication steps:',
    options: [
      'Hold public press conference',
      'Gather all facts from the incident',
      'Prepare official statement',
      'Brief department leadership'
    ],
    correctAnswer: [1, 3, 2, 0],
    explanation: 'Crisis management: Gather facts → Brief leadership → Prepare statement → Public conference',
    rewards: { rp: new Decimal(1500), experience: 50 },
    unlockRank: 'Chief',
    completed: false
  }
];

const RANDOM_EVENTS: RandomEvent[] = [
  // Positive Events
  {
    id: 'commendation',
    title: '🏆 Commendation Received',
    description: 'Your excellent work has been recognized by the community!',
    type: 'commendation',
    effect: {
      type: 'rp_bonus',
      amount: 1.5,
      duration: 300 // 5 minutes
    },
    probability: 0.15,
    isActive: false
  },
  {
    id: 'equipment_found',
    title: '🔧 Equipment Cache Discovered',
    description: 'You found some abandoned but useful equipment!',
    type: 'equipment_found',
    effect: {
      type: 'click_multiplier',
      amount: 2.0,
      duration: 180 // 3 minutes
    },
    probability: 0.1,
    minRank: 'Detective',
    isActive: false
  },
  {
    id: 'training_opportunity',
    title: '📚 Training Seminar Available',
    description: 'Free advanced training improves your effectiveness!',
    type: 'training_opportunity',
    effect: {
      type: 'passive_multiplier',
      amount: 1.8,
      duration: 600 // 10 minutes
    },
    probability: 0.08,
    minRank: 'Sergeant',
    isActive: false
  },
  {
    id: 'overtime',
    title: '⏰ Overtime Shift',
    description: 'Extra shift means extra pay and experience!',
    type: 'overtime',
    effect: {
      type: 'rp_bonus',
      amount: 2.0,
      duration: 240 // 4 minutes
    },
    probability: 0.12,
    isActive: false
  },
  
  // Negative Events
  {
    id: 'crime_wave',
    title: '🚨 Crime Wave Emergency',
    description: 'Increased criminal activity strains resources.',
    type: 'crime_wave',
    effect: {
      type: 'upgrade_cost_increase',
      amount: 1.3,
      duration: 420 // 7 minutes
    },
    probability: 0.1,
    minRank: 'Detective',
    isActive: false
  },
  {
    id: 'budget_cut',
    title: '💰 Budget Cuts',
    description: 'City budget cuts affect department operations.',
    type: 'budget_cut',
    effect: {
      type: 'passive_multiplier',
      amount: 0.7,
      duration: 480 // 8 minutes
    },
    probability: 0.08,
    minRank: 'Lieutenant',
    isActive: false
  }
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // Progress Milestones
  {
    id: 'first_click',
    title: 'First Day on the Beat',
    description: 'Earn your first Respect Point',
    category: 'progress',
    criteria: { type: 'total_rp', target: new Decimal(1) },
    reward: { type: 'rp', amount: new Decimal(10) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'hundred_rp',
    title: 'Making Progress',
    description: 'Earn 100 Respect Points',
    category: 'progress',
    criteria: { type: 'total_rp', target: new Decimal(100) },
    reward: { type: 'rp', amount: new Decimal(50) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'detective_rank',
    title: 'Detective Shield',
    description: 'Reach Detective rank',
    category: 'progress',
    criteria: { type: 'rank', target: 'Detective' },
    reward: { type: 'rp', amount: new Decimal(100) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'chief_rank',
    title: 'Top of the Force',
    description: 'Reach Chief rank',
    category: 'progress',
    criteria: { type: 'rank', target: 'Chief' },
    reward: { type: 'legacy_points', amount: new Decimal(1) },
    unlocked: false,
    claimed: false
  },
  
  // Upgrade Mastery
  {
    id: 'first_upgrade',
    title: 'Self Improvement',
    description: 'Purchase your first upgrade',
    category: 'upgrades',
    criteria: { type: 'upgrade_count', target: new Decimal(1) },
    reward: { type: 'rp', amount: new Decimal(25) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'ten_partners',
    title: 'Squad Leader',
    description: 'Have 10 Partners',
    category: 'upgrades',
    criteria: { type: 'upgrade_count', target: new Decimal(10), upgradeType: 'partner' },
    reward: { type: 'rp', amount: new Decimal(200) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'automation_master',
    title: 'Tech Savvy',
    description: 'Purchase 5 AI Systems',
    category: 'upgrades',
    criteria: { type: 'upgrade_count', target: new Decimal(5), upgradeType: 'automation' },
    reward: { type: 'legacy_points', amount: new Decimal(1) },
    unlocked: false,
    claimed: false
  },
  
  // Efficiency Goals
  {
    id: 'strong_clicks',
    title: 'Power Patrol',
    description: 'Reach 100 click power',
    category: 'efficiency',
    criteria: { type: 'click_power', target: new Decimal(100) },
    reward: { type: 'rp', amount: new Decimal(500) },
    unlocked: false,
    claimed: false
  },
  {
    id: 'passive_income',
    title: 'Efficient Officer',
    description: 'Reach 50 passive income per second',
    category: 'efficiency',
    criteria: { type: 'passive_income', target: new Decimal(50) },
    reward: { type: 'rp', amount: new Decimal(1000) },
    unlocked: false,
    claimed: false
  },
  
  // Legacy Achievements
  {
    id: 'first_prestige',
    title: 'Retirement Ceremony',
    description: 'Complete your first prestige',
    category: 'legacy',
    criteria: { type: 'prestige_count', target: new Decimal(1) },
    reward: { type: 'legacy_points', amount: new Decimal(2) },
    unlocked: false,
    claimed: false
  },
  
  // Special Challenges
  {
    id: 'millionaire',
    title: 'Respected Veteran',
    description: 'Earn 1 Million total Respect Points',
    category: 'special',
    criteria: { type: 'total_rp', target: new Decimal(1000000) },
    reward: { type: 'legacy_points', amount: new Decimal(5) },
    unlocked: false,
    claimed: false
  }
];

const INITIAL_DEPARTMENT_BUILDINGS: DepartmentBuilding[] = [
  {
    id: 'police_station',
    name: 'Police Station',
    description: 'Main headquarters providing overall department coordination and basic operations',
    type: 'police_station',
    level: 0,
    maxLevel: 10,
    cost: new Decimal(500),
    costScaling: 2.0,
    effects: {
      passiveIncome: 10,
      staffCapacity: 5
    },
    unlockRank: 'Beat Cop',
    staffed: 0,
    icon: '🏛️'
  },
  {
    id: 'training_facility',
    name: 'Training Facility',
    description: 'Improves officer efficiency and unlocks advanced training programs',
    type: 'training_facility',
    level: 0,
    maxLevel: 8,
    cost: new Decimal(1000),
    costScaling: 2.2,
    effects: {
      upgradeDiscount: 5,
      staffCapacity: 3
    },
    unlockRank: 'Detective',
    staffed: 0,
    icon: '🎯'
  },
  {
    id: 'forensics_lab',
    name: 'Forensics Lab',
    description: 'Advanced crime scene analysis increases case success rates',
    type: 'forensics_lab',
    level: 0,
    maxLevel: 6,
    cost: new Decimal(2500),
    costScaling: 2.5,
    effects: {
      caseSuccessRate: 15,
      staffCapacity: 2
    },
    unlockRank: 'Sergeant',
    staffed: 0,
    icon: '🔬'
  },
  {
    id: 'dispatch_center',
    name: 'Dispatch Center',
    description: 'Central communication hub that coordinates emergency responses',
    type: 'dispatch_center',
    level: 0,
    maxLevel: 5,
    cost: new Decimal(5000),
    costScaling: 2.3,
    effects: {
      eventChance: 10,
      clickPower: 5
    },
    unlockRank: 'Lieutenant',
    staffed: 0,
    icon: '📡'
  },
  {
    id: 'armory',
    name: 'Armory',
    description: 'Equipment storage and maintenance facility',
    type: 'armory',
    level: 0,
    maxLevel: 4,
    cost: new Decimal(7500),
    costScaling: 2.8,
    effects: {
      clickPower: 10,
      staffCapacity: 2
    },
    unlockRank: 'Captain',
    staffed: 0,
    icon: '🔫'
  },
  {
    id: 'motor_pool',
    name: 'Motor Pool',
    description: 'Vehicle maintenance and dispatch center for patrol units',
    type: 'motor_pool',
    level: 0,
    maxLevel: 6,
    cost: new Decimal(10000),
    costScaling: 2.4,
    effects: {
      passiveIncome: 25,
      eventChance: 5
    },
    unlockRank: 'Chief',
    staffed: 0,
    icon: '🚗'
  }
];

const INITIAL_STAFF_TYPES: Omit<StaffMember, 'id' | 'assignedBuilding' | 'level' | 'experience'>[] = [
  {
    name: 'Patrol Officer',
    type: 'officer',
    efficiency: 1.0,
    cost: new Decimal(100),
    skills: {
      patrol: 3,
      investigation: 1
    },
    unlockRank: 'Beat Cop'
  },
  {
    name: 'Detective',
    type: 'detective',
    efficiency: 1.5,
    cost: new Decimal(250),
    skills: {
      investigation: 4,
      technical: 2
    },
    unlockRank: 'Detective'
  },
  {
    name: 'Forensic Technician',
    type: 'technician',
    efficiency: 1.2,
    cost: new Decimal(400),
    skills: {
      technical: 5,
      investigation: 2
    },
    unlockRank: 'Sergeant'
  },
  {
    name: 'Dispatcher',
    type: 'dispatcher',
    efficiency: 1.3,
    cost: new Decimal(300),
    skills: {
      technical: 3,
      leadership: 2
    },
    unlockRank: 'Lieutenant'
  },
  {
    name: 'Sergeant',
    type: 'sergeant',
    efficiency: 2.0,
    cost: new Decimal(800),
    skills: {
      leadership: 5,
      patrol: 3,
      investigation: 2
    },
    unlockRank: 'Captain'
  }
];

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    respectPoints: new Decimal(0),
    clickValue: new Decimal(1),
    rank: RANKS[0].name,
    passiveIncome: new Decimal(0),
    legacyPoints: new Decimal(0),
    totalRP: new Decimal(0),
    prestigeCount: new Decimal(0),
    playTime: 0,
    upgrades: {
      equipment: new Decimal(0),
      training: new Decimal(0),
      partner: new Decimal(0),
      patrol: new Decimal(0),
      investigation: new Decimal(0),
      precinct: new Decimal(0),
      automation: new Decimal(0)
    },
    legacyUpgrades: {
      efficiency: new Decimal(0),
      wisdom: new Decimal(0),
      equipment: new Decimal(0)
    },
    achievements: [...INITIAL_ACHIEVEMENTS],
    caseFiles: [...INITIAL_CASE_FILES],
    randomEvents: [...RANDOM_EVENTS],
    activeEffects: [],
    equipment: [...INITIAL_EQUIPMENT],
    equippedItems: {
      radio: null,
      badge: INITIAL_EQUIPMENT.find(e => e.id === 'rookie_badge') || null,
      weapon: null,
      vest: null,
      vehicle: null,
      gadget: null
    },
    department: {
      buildings: [...INITIAL_DEPARTMENT_BUILDINGS],
      staff: [],
      totalStaffCapacity: 0,
      totalIncome: new Decimal(0)
    },
    soundSettings: {
      masterVolume: 0.7,
      sfxEnabled: true,
      ambientEnabled: true,
      sfxVolume: 0.8,
      ambientVolume: 0.3
    },
    themeSettings: {
      theme: 'dark',
      customColors: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#fbbf24'
      }
    },
    statistics: {
      totalClicks: new Decimal(0),
      totalUpgradesPurchased: new Decimal(0),
      totalCasesSolved: new Decimal(0),
      totalAchievementsUnlocked: new Decimal(0),
      totalPrestigeCount: new Decimal(0),
      sessionsPlayed: new Decimal(1),
      currentStreak: new Decimal(0),
      bestClicksPerSecond: 0,
      totalTimeInRanks: {},
      firstPlayDate: Date.now(),
      lastPlayDate: Date.now(),
      totalRPEarned: new Decimal(0),
      totalRPSpent: new Decimal(0),
      averageSessionLength: 0,
      longestSession: 0
    }
  });

  const [clickAnimations, setClickAnimations] = useState<Array<{id: number, x: number, y: number, value?: Decimal}>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number | 'max'>(1);
  const [achievementNotifications, setAchievementNotifications] = useState<Achievement[]>([]);
  const [currentCase, setCurrentCase] = useState<CaseFile | null>(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [caseTimeLeft, setCaseTimeLeft] = useState(0);
  const [userAnswer, setUserAnswer] = useState<number | number[]>(0);
  const [caseResult, setCaseResult] = useState<{success: boolean, explanation: string} | null>(null);
  const [eventNotifications, setEventNotifications] = useState<RandomEvent[]>([]);
  const [sequenceAnswer, setSequenceAnswer] = useState<number[]>([]);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<'radio' | 'badge' | 'weapon' | 'vest' | 'vehicle' | 'gadget' | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');

  // Sound Management
  const audioContext = useRef<AudioContext | null>(null);
  const ambientAudio = useRef<HTMLAudioElement | null>(null);

  const initializeAudio = useCallback(() => {
    if (!audioContext.current) {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioContext.current = new AudioContextClass();
      }
    }
  }, []);

  const playSound = useCallback((type: 'click' | 'upgrade' | 'achievement' | 'case_success' | 'case_fail' | 'rank_up') => {
    if (!gameState.soundSettings.sfxEnabled || !isLoaded) return;
    
    initializeAudio();
    if (!audioContext.current) return;

    const volume = gameState.soundSettings.masterVolume * gameState.soundSettings.sfxVolume;
    
    // Create different sound frequencies for different actions
    const soundConfig = {
      click: { freq: 800, duration: 0.1, wave: 'sine' as OscillatorType },
      upgrade: { freq: 1000, duration: 0.3, wave: 'square' as OscillatorType },
      achievement: { freq: 1200, duration: 0.5, wave: 'sawtooth' as OscillatorType },
      case_success: { freq: 900, duration: 0.4, wave: 'triangle' as OscillatorType },
      case_fail: { freq: 400, duration: 0.3, wave: 'sawtooth' as OscillatorType },
      rank_up: { freq: 1500, duration: 0.6, wave: 'sine' as OscillatorType }
    };

    const config = soundConfig[type];
    if (!config) return;

    try {
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      oscillator.type = config.wave;
      oscillator.frequency.setValueAtTime(config.freq, audioContext.current.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.current.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + config.duration);
      
      oscillator.start(audioContext.current.currentTime);
      oscillator.stop(audioContext.current.currentTime + config.duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [gameState.soundSettings, isLoaded, initializeAudio]);

  const startAmbientAudio = useCallback(() => {
    if (!gameState.soundSettings.ambientEnabled || !isLoaded) return;
    
    if (!ambientAudio.current) {
      // Create a simple ambient sound using data URL (soft white noise)
      const ambientSound = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEASLsAAIhOAQACABAAZGF0YQAAAAA=";
      ambientAudio.current = new Audio(ambientSound);
      ambientAudio.current.loop = true;
      ambientAudio.current.volume = gameState.soundSettings.masterVolume * gameState.soundSettings.ambientVolume;
    }
    
    if (ambientAudio.current.paused) {
      ambientAudio.current.play().catch(e => console.warn('Ambient audio failed:', e));
    }
  }, [gameState.soundSettings, isLoaded]);

  const stopAmbientAudio = useCallback(() => {
    if (ambientAudio.current && !ambientAudio.current.paused) {
      ambientAudio.current.pause();
    }
  }, []);

  // Update ambient audio volume when settings change
  useEffect(() => {
    if (ambientAudio.current) {
      ambientAudio.current.volume = gameState.soundSettings.masterVolume * gameState.soundSettings.ambientVolume;
      
      if (gameState.soundSettings.ambientEnabled && isLoaded) {
        startAmbientAudio();
      } else {
        stopAmbientAudio();
      }
    }
  }, [gameState.soundSettings, isLoaded, startAmbientAudio, stopAmbientAudio]);

  // Theme Management
  const getEffectiveTheme = useCallback(() => {
    if (gameState.themeSettings.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return gameState.themeSettings.theme;
  }, [gameState.themeSettings.theme]);

  const isDarkTheme = getEffectiveTheme() === 'dark';

  // Apply theme to document
  useEffect(() => {
    const theme = getEffectiveTheme();
    const root = document.documentElement;
    
    // Set theme class
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${theme}`);
    
    // Set CSS custom properties for theme colors
    const colors = gameState.themeSettings.customColors;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    
    // Set theme-based color variables
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-tertiary', '#334155');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-color', '#475569');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#e2e8f0');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#334155');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-color', '#cbd5e1');
    }
  }, [gameState.themeSettings, getEffectiveTheme]);

  useEffect(() => {
    const savedGame = localStorage.getItem('cop-clicker-save');
    
    if (savedGame) {
      try {
        const loadedState = JSON.parse(savedGame);
        
        // Convert loaded numbers to Decimals
        const convertToDecimal = (value: unknown) => new Decimal(value as Decimal || 0);
        
        // Ensure all required properties exist and convert to Decimal
        if (!loadedState.upgrades) {
          loadedState.upgrades = { 
            equipment: new Decimal(0), 
            training: new Decimal(0), 
            partner: new Decimal(0), 
            patrol: new Decimal(0), 
            investigation: new Decimal(0), 
            precinct: new Decimal(0), 
            automation: new Decimal(0) 
          };
        } else {
          // Convert and add missing upgrade properties for backward compatibility
          loadedState.upgrades.equipment = convertToDecimal(loadedState.upgrades.equipment);
          loadedState.upgrades.training = convertToDecimal(loadedState.upgrades.training);
          loadedState.upgrades.partner = convertToDecimal(loadedState.upgrades.partner);
          loadedState.upgrades.patrol = convertToDecimal(loadedState.upgrades.patrol);
          loadedState.upgrades.investigation = convertToDecimal(loadedState.upgrades.investigation);
          loadedState.upgrades.precinct = convertToDecimal(loadedState.upgrades.precinct);
          loadedState.upgrades.automation = convertToDecimal(loadedState.upgrades.automation);
        }
        
        // Handle legacy upgrades for backward compatibility
        if (!loadedState.legacyUpgrades) {
          loadedState.legacyUpgrades = {
            efficiency: new Decimal(0),
            wisdom: new Decimal(0),
            equipment: new Decimal(0)
          };
        } else {
          loadedState.legacyUpgrades.efficiency = convertToDecimal(loadedState.legacyUpgrades.efficiency);
          loadedState.legacyUpgrades.wisdom = convertToDecimal(loadedState.legacyUpgrades.wisdom);
          loadedState.legacyUpgrades.equipment = convertToDecimal(loadedState.legacyUpgrades.equipment);
        }
        
        // Convert main state values to Decimal
        loadedState.respectPoints = convertToDecimal(loadedState.respectPoints);
        loadedState.legacyPoints = convertToDecimal(loadedState.legacyPoints);
        loadedState.totalRP = convertToDecimal(loadedState.totalRP);
        loadedState.prestigeCount = convertToDecimal(loadedState.prestigeCount);
        loadedState.playTime = loadedState.playTime || 0;
        
        // Handle achievements for backward compatibility
        if (!loadedState.achievements) {
          loadedState.achievements = [...INITIAL_ACHIEVEMENTS];
        } else {
          // Merge with new achievements while preserving progress
          const loadedAchievementIds = loadedState.achievements.map((a: Achievement) => a.id);
          const newAchievements = INITIAL_ACHIEVEMENTS.filter(a => !loadedAchievementIds.includes(a.id));
          loadedState.achievements = [...loadedState.achievements, ...newAchievements];
        }
        
        // Handle case files for backward compatibility
        if (!loadedState.caseFiles) {
          loadedState.caseFiles = [...INITIAL_CASE_FILES];
        } else {
          // Merge with new cases while preserving progress
          const loadedCaseIds = loadedState.caseFiles.map((c: CaseFile) => c.id);
          const newCases = INITIAL_CASE_FILES.filter(c => !loadedCaseIds.includes(c.id));
          loadedState.caseFiles = [...loadedState.caseFiles, ...newCases];
        }
        
        // Handle random events for backward compatibility
        if (!loadedState.randomEvents) {
          loadedState.randomEvents = [...RANDOM_EVENTS];
        }
        
        // Handle active effects for backward compatibility
        if (!loadedState.activeEffects) {
          loadedState.activeEffects = [];
        }
        
        // Handle equipment for backward compatibility
        if (!loadedState.equipment) {
          loadedState.equipment = [...INITIAL_EQUIPMENT];
        } else {
          // Merge with new equipment while preserving ownership
          const loadedEquipmentIds = loadedState.equipment.map((e: EquipmentItem) => e.id);
          const newEquipment = INITIAL_EQUIPMENT.filter(e => !loadedEquipmentIds.includes(e.id));
          loadedState.equipment = [...loadedState.equipment, ...newEquipment];
        }
        
        // Handle equipped items for backward compatibility
        if (!loadedState.equippedItems) {
          loadedState.equippedItems = {
            radio: null,
            badge: loadedState.equipment?.find((e: EquipmentItem) => e.id === 'rookie_badge') || null,
            weapon: null,
            vest: null,
            vehicle: null,
            gadget: null
          };
        }
        
        if (!loadedState.rank) {
          loadedState.rank = RANKS[0].name;
        }
        
        // Handle sound settings for backward compatibility
        if (!loadedState.soundSettings) {
          loadedState.soundSettings = {
            masterVolume: 0.7,
            sfxEnabled: true,
            ambientEnabled: true,
            sfxVolume: 0.8,
            ambientVolume: 0.3
          };
        }
        
        // Handle theme settings for backward compatibility
        if (!loadedState.themeSettings) {
          loadedState.themeSettings = {
            theme: 'dark',
            customColors: {
              primary: '#3b82f6',
              secondary: '#1e40af',
              accent: '#fbbf24'
            }
          };
        }
        
        // Handle statistics for backward compatibility
        if (!loadedState.statistics) {
          loadedState.statistics = {
            totalClicks: new Decimal(0),
            totalUpgradesPurchased: new Decimal(0),
            totalCasesSolved: new Decimal(0),
            totalAchievementsUnlocked: new Decimal(0),
            totalPrestigeCount: loadedState.prestigeCount || new Decimal(0),
            sessionsPlayed: new Decimal(1),
            currentStreak: new Decimal(0),
            bestClicksPerSecond: 0,
            totalTimeInRanks: {},
            firstPlayDate: Date.now(),
            lastPlayDate: Date.now(),
            totalRPEarned: loadedState.totalRP || new Decimal(0),
            totalRPSpent: new Decimal(0),
            averageSessionLength: 0,
            longestSession: 0
          };
        } else {
          // Convert Decimal fields if they exist
          loadedState.statistics.totalClicks = convertToDecimal(loadedState.statistics.totalClicks || 0);
          loadedState.statistics.totalUpgradesPurchased = convertToDecimal(loadedState.statistics.totalUpgradesPurchased || 0);
          loadedState.statistics.totalCasesSolved = convertToDecimal(loadedState.statistics.totalCasesSolved || 0);
          loadedState.statistics.totalAchievementsUnlocked = convertToDecimal(loadedState.statistics.totalAchievementsUnlocked || 0);
          loadedState.statistics.totalPrestigeCount = convertToDecimal(loadedState.statistics.totalPrestigeCount || 0);
          loadedState.statistics.sessionsPlayed = convertToDecimal(loadedState.statistics.sessionsPlayed || 1);
          loadedState.statistics.currentStreak = convertToDecimal(loadedState.statistics.currentStreak || 0);
          loadedState.statistics.totalRPEarned = convertToDecimal(loadedState.statistics.totalRPEarned || 0);
          loadedState.statistics.totalRPSpent = convertToDecimal(loadedState.statistics.totalRPSpent || 0);
          
          // Update session tracking
          loadedState.statistics.sessionsPlayed = loadedState.statistics.sessionsPlayed.add(1);
          loadedState.statistics.lastPlayDate = Date.now();
        }
        
        // Recalculate values to ensure consistency
        const rankIndex = RANKS.findIndex(rank => rank.name === loadedState.rank);
        const rankMultiplier = new Decimal(rankIndex >= 0 ? 1 + (rankIndex * 0.25) : 1);
        
        // Calculate click value with legacy bonuses
        const baseClickValue = new Decimal(1);
        const equipmentBonus = loadedState.upgrades.equipment.mul(1);
        const trainingBonus = loadedState.upgrades.training.mul(2);
        const legacyMultiplier = new Decimal(1).add((loadedState.legacyUpgrades?.efficiency || new Decimal(0)).mul(0.1));
        loadedState.clickValue = baseClickValue.add(equipmentBonus).add(trainingBonus).mul(rankMultiplier).mul(legacyMultiplier).floor();
        
        // Calculate passive income with legacy bonuses
        const partnerIncome = loadedState.upgrades.partner.mul(1);
        const patrolIncome = loadedState.upgrades.patrol.mul(3);
        const investigationIncome = loadedState.upgrades.investigation.mul(12);
        const precinctIncome = loadedState.upgrades.precinct.mul(50);
        const automationBonus = loadedState.upgrades.automation.gt(0) 
          ? new Decimal(1).add(loadedState.upgrades.automation.mul(0.5)) 
          : new Decimal(1);
        
        const totalPassiveIncome = partnerIncome.add(patrolIncome).add(investigationIncome).add(precinctIncome).mul(automationBonus);
        loadedState.passiveIncome = totalPassiveIncome.mul(rankMultiplier).mul(legacyMultiplier).floor();
        
        setGameState(loadedState);
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const autoSave = setInterval(() => {
        try {
          // Convert Decimals to numbers for JSON storage
          const saveState = {
            ...gameState,
            respectPoints: gameState.respectPoints.toString(),
            clickValue: gameState.clickValue.toString(),
            passiveIncome: gameState.passiveIncome.toString(),
            legacyPoints: gameState.legacyPoints.toString(),
            totalRP: gameState.totalRP.toString(),
            prestigeCount: gameState.prestigeCount.toString(),
            upgrades: {
              equipment: gameState.upgrades.equipment.toString(),
              training: gameState.upgrades.training.toString(),
              partner: gameState.upgrades.partner.toString(),
              patrol: gameState.upgrades.patrol.toString(),
              investigation: gameState.upgrades.investigation.toString(),
              precinct: gameState.upgrades.precinct.toString(),
              automation: gameState.upgrades.automation.toString(),
            },
            legacyUpgrades: {
              efficiency: gameState.legacyUpgrades.efficiency.toString(),
              wisdom: gameState.legacyUpgrades.wisdom.toString(),
              equipment: gameState.legacyUpgrades.equipment.toString(),
            }
          };
          localStorage.setItem('cop-clicker-save', JSON.stringify(saveState));
        } catch (e) {
          console.error('Failed to save game:', e);
        }
      }, 5000);

      return () => clearInterval(autoSave);
    }
  }, [gameState, isLoaded]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoaded) {
        const saveState = {
          ...gameState,
          respectPoints: gameState.respectPoints.toString(),
          clickValue: gameState.clickValue.toString(),
          passiveIncome: gameState.passiveIncome.toString(),
          legacyPoints: gameState.legacyPoints.toString(),
          totalRP: gameState.totalRP.toString(),
          prestigeCount: gameState.prestigeCount.toString(),
          upgrades: {
            equipment: gameState.upgrades.equipment.toString(),
            training: gameState.upgrades.training.toString(),
            partner: gameState.upgrades.partner.toString(),
            patrol: gameState.upgrades.patrol.toString(),
            investigation: gameState.upgrades.investigation.toString(),
            precinct: gameState.upgrades.precinct.toString(),
            automation: gameState.upgrades.automation.toString(),
          },
          legacyUpgrades: {
            efficiency: gameState.legacyUpgrades.efficiency.toString(),
            wisdom: gameState.legacyUpgrades.wisdom.toString(),
            equipment: gameState.legacyUpgrades.equipment.toString(),
          }
        };
        localStorage.setItem('cop-clicker-save', JSON.stringify(saveState));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState, isLoaded]);

  // Active effects helper function - defined early to be used in other hooks
  const getActiveMultipliers = useCallback(() => {
    const now = Date.now();
    const activeEffects = gameState.activeEffects.filter(effect => effect.endTime > now);
    
    // Update active effects if any expired
    if (activeEffects.length !== gameState.activeEffects.length) {
      setGameState(prev => ({
        ...prev,
        activeEffects: activeEffects
      }));
    }

    return {
      clickMultiplier: activeEffects.reduce((acc, effect) => acc * effect.clickMultiplier, 1),
      passiveMultiplier: activeEffects.reduce((acc, effect) => acc * effect.passiveMultiplier, 1),
      upgradeDiscount: activeEffects.reduce((acc, effect) => acc * effect.upgradeDiscount, 1)
    };
  }, [gameState.activeEffects, setGameState]);

  // Equipment bonuses calculation - defined early to be used in other hooks
  const getEquipmentBonuses = useCallback(() => {
    const bonuses = {
      clickPower: 0,
      passiveIncome: 0,
      upgradeCostReduction: 0,
      caseSuccessRate: 0,
      eventChance: 0
    };

    Object.values(gameState.equippedItems).forEach(item => {
      if (item) {
        bonuses.clickPower += item.effects.clickPower || 0;
        bonuses.passiveIncome += item.effects.passiveIncome || 0;
        bonuses.upgradeCostReduction += item.effects.upgradeCostReduction || 0;
        bonuses.caseSuccessRate += item.effects.caseSuccessRate || 0;
        bonuses.eventChance += item.effects.eventChance || 0;
      }
    });

    return bonuses;
  }, [gameState.equippedItems]);

  useEffect(() => {
    if (isLoaded && gameState.passiveIncome.gt(0)) {
      const passiveTimer = setInterval(() => {
        const multipliers = getActiveMultipliers();
        const equipmentBonuses = getEquipmentBonuses();
        const equipmentPassiveBonus = new Decimal(equipmentBonuses.passiveIncome);
        const finalPassiveIncome = gameState.passiveIncome.add(equipmentPassiveBonus).mul(multipliers.passiveMultiplier);
        
        setGameState(prev => ({
          ...prev,
          respectPoints: prev.respectPoints.add(finalPassiveIncome),
          totalRP: prev.totalRP.add(finalPassiveIncome)
        }));
      }, 1000);

      return () => clearInterval(passiveTimer);
    }
  }, [gameState.passiveIncome, isLoaded, getActiveMultipliers, getEquipmentBonuses]);

  // Track play time
  useEffect(() => {
    if (isLoaded) {
      const playTimer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          playTime: prev.playTime + 1
        }));
      }, 1000);

      return () => clearInterval(playTimer);
    }
  }, [isLoaded]);

  // Case-solving functions
  const getAvailableCases = (): CaseFile[] => {
    return gameState.caseFiles.filter(caseFile => {
      const rankIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
      const caseRankIndex = RANKS.findIndex(rank => rank.name === caseFile.unlockRank);
      return caseRankIndex <= rankIndex && !caseFile.completed;
    });
  };

  const startCase = (caseFile: CaseFile) => {
    setCurrentCase(caseFile);
    setShowCaseModal(true);
    setCaseTimeLeft(caseFile.timeLimit || 60);
    setUserAnswer(0);
    setSequenceAnswer([]);
    setCaseResult(null);
  };

  const submitCaseAnswer = () => {
    if (!currentCase) return;

    let isCorrect = false;
    
    if (currentCase.type === 'multiple_choice' || currentCase.type === 'evidence') {
      isCorrect = userAnswer === currentCase.correctAnswer;
    } else if (currentCase.type === 'sequence') {
      const correctSequence = currentCase.correctAnswer as number[];
      isCorrect = JSON.stringify(sequenceAnswer) === JSON.stringify(correctSequence);
    }

    // Apply equipment bonus to case success rate
    const equipmentBonuses = getEquipmentBonuses();
    const successBonus = equipmentBonuses.caseSuccessRate;
    
    // If the answer was wrong, give a small chance for equipment to help
    if (!isCorrect && successBonus > 0) {
      const bonusChance = Math.min(successBonus * 0.5, 25); // Max 25% bonus chance, half the equipment bonus
      if (Math.random() * 100 < bonusChance) {
        isCorrect = true;
        setCaseResult({
          success: true,
          explanation: `Your equipment helped you succeed! ${currentCase.explanation}`
        });
      } else {
        setCaseResult({
          success: false,
          explanation: currentCase.explanation
        });
      }
    } else {
      setCaseResult({
        success: isCorrect,
        explanation: currentCase.explanation
      });
    }
    
    // Play case result sound
    playSound(isCorrect ? 'case_success' : 'case_fail');

    if (isCorrect) {
      // Mark case as completed and give rewards
      setGameState(prev => {
        const updatedCases = prev.caseFiles.map(c => 
          c.id === currentCase.id ? { ...c, completed: true } : c
        );
        return {
          ...prev,
          caseFiles: updatedCases,
          respectPoints: prev.respectPoints.add(currentCase.rewards.rp),
          totalRP: prev.totalRP.add(currentCase.rewards.rp),
          statistics: {
            ...prev.statistics,
            totalCasesSolved: prev.statistics.totalCasesSolved.add(1),
            totalRPEarned: prev.statistics.totalRPEarned.add(currentCase.rewards.rp)
          }
        };
      });
    }

    // Close modal after showing result
    setTimeout(() => {
      setShowCaseModal(false);
      setCurrentCase(null);
      setCaseResult(null);
    }, 3000);
  };

  // Random event functions
  const triggerRandomEvent = useCallback(() => {
    if (Math.random() < 0.02) { // 2% chance per second
      const availableEvents = RANDOM_EVENTS.filter(event => {
        if (event.minRank) {
          const rankIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
          const eventRankIndex = RANKS.findIndex(rank => rank.name === event.minRank);
          return rankIndex >= eventRankIndex;
        }
        return true;
      });

      if (availableEvents.length > 0) {
        const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        if (Math.random() < randomEvent.probability) {
          activateEvent(randomEvent);
        }
      }
    }
  }, [gameState.rank]);

  const activateEvent = (event: RandomEvent) => {
    const newEffect = {
      clickMultiplier: event.effect.type === 'click_multiplier' ? event.effect.amount : 1,
      passiveMultiplier: event.effect.type === 'passive_multiplier' ? event.effect.amount : 1,
      upgradeDiscount: event.effect.type === 'upgrade_discount' ? event.effect.amount : 1,
      endTime: Date.now() + (event.effect.duration * 1000)
    };

    setGameState(prev => ({
      ...prev,
      activeEffects: [...prev.activeEffects, newEffect]
    }));

    setEventNotifications(prev => [...prev, event]);

    // Remove notification after 5 seconds
    setTimeout(() => {
      setEventNotifications(prev => prev.filter(e => e.id !== event.id));
    }, 5000);
  };

  // Case timer effect
  useEffect(() => {
    if (showCaseModal && caseTimeLeft > 0) {
      const timer = setTimeout(() => {
        setCaseTimeLeft(caseTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCaseModal && caseTimeLeft === 0) {
      // Time's up - show failure
      setCaseResult({
        success: false,
        explanation: "Time's up! " + (currentCase?.explanation || "")
      });
      setTimeout(() => {
        setShowCaseModal(false);
        setCurrentCase(null);
        setCaseResult(null);
      }, 3000);
    }
  }, [showCaseModal, caseTimeLeft, currentCase]);

  // Random event trigger
  useEffect(() => {
    if (isLoaded) {
      const eventTimer = setInterval(() => {
        triggerRandomEvent();
      }, 1000);
      return () => clearInterval(eventTimer);
    }
  }, [isLoaded, triggerRandomEvent]);

  // Equipment functions
  const getAvailableEquipment = useCallback((type: string) => {
    return gameState.equipment.filter(item => 
      item.type === type && 
      item.owned &&
      !item.equipped
    );
  }, [gameState.equipment]);

  const canUnlockEquipment = useCallback((item: EquipmentItem) => {
    const rankIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    const itemRankIndex = RANKS.findIndex(rank => rank.name === item.unlockRank);
    return rankIndex >= itemRankIndex;
  }, [gameState.rank]);

  const equipItem = useCallback((itemId: string) => {
    setGameState(prev => {
      const item = prev.equipment.find(e => e.id === itemId);
      if (!item || !item.owned) return prev;

      // Unequip current item of same type
      const currentEquipped = prev.equippedItems[item.type as keyof EquipmentSlots];
      
      const updatedEquipment = prev.equipment.map(e => {
        if (e.id === itemId) return { ...e, equipped: true };
        if (currentEquipped && e.id === currentEquipped.id) return { ...e, equipped: false };
        return e;
      });

      const updatedEquippedItems = {
        ...prev.equippedItems,
        [item.type]: item
      };

      return {
        ...prev,
        equipment: updatedEquipment,
        equippedItems: updatedEquippedItems
      };
    });
  }, [setGameState]);

  const unequipItem = useCallback((type: keyof EquipmentSlots) => {
    setGameState(prev => {
      const currentItem = prev.equippedItems[type];
      if (!currentItem) return prev;

      const updatedEquipment = prev.equipment.map(e => 
        e.id === currentItem.id ? { ...e, equipped: false } : e
      );

      const updatedEquippedItems = {
        ...prev.equippedItems,
        [type]: null
      };

      return {
        ...prev,
        equipment: updatedEquipment,
        equippedItems: updatedEquippedItems
      };
    });
  }, [setGameState]);

  const findEquipment = useCallback(() => {
    // Chance to find equipment based on rank and current equipment bonuses
    const equipmentBonuses = getEquipmentBonuses();
    const baseChance = 0.001; // 0.1% base chance per second
    const bonusChance = equipmentBonuses.eventChance * 0.0001; // Equipment can increase chance
    const totalChance = baseChance + bonusChance;

    if (Math.random() < totalChance) {
      const availableItems = gameState.equipment.filter(item => 
        !item.owned && canUnlockEquipment(item)
      );

      if (availableItems.length > 0) {
        // Weight by rarity (rarer items are less likely)
        const rarityWeights = {
          common: 50,
          uncommon: 30,
          rare: 15,
          epic: 4,
          legendary: 1
        };

        const weightedItems = availableItems.flatMap(item => 
          Array(rarityWeights[item.rarity]).fill(item)
        );

        if (weightedItems.length > 0) {
          const foundItem = weightedItems[Math.floor(Math.random() * weightedItems.length)];
          
          setGameState(prev => ({
            ...prev,
            equipment: prev.equipment.map(e => 
              e.id === foundItem.id ? { ...e, owned: true } : e
            )
          }));

          // Show notification
          setEventNotifications(prev => [...prev, {
            id: `equipment_found_${foundItem.id}`,
            title: `${foundItem.icon} Equipment Found!`,
            description: `You found: ${foundItem.name}`,
            type: 'equipment_found',
            effect: { type: 'rp_bonus', amount: 1, duration: 0 },
            probability: 1,
            isActive: false
          }]);

          setTimeout(() => {
            setEventNotifications(prev => prev.filter(e => e.id !== `equipment_found_${foundItem.id}`));
          }, 5000);
        }
      }
    }
  }, [gameState.equipment, getEquipmentBonuses, canUnlockEquipment, setGameState]);

  // Equipment finding timer
  useEffect(() => {
    if (isLoaded) {
      const equipmentTimer = setInterval(() => {
        findEquipment();
      }, 1000);
      return () => clearInterval(equipmentTimer);
    }
  }, [isLoaded, findEquipment]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const multipliers = getActiveMultipliers();
    const equipmentBonuses = getEquipmentBonuses();
    const equipmentClickBonus = new Decimal(equipmentBonuses.clickPower);
    const finalClickValue = gameState.clickValue.add(equipmentClickBonus).mul(multipliers.clickMultiplier);
    
    // Play click sound
    playSound('click');
    
    setGameState(prev => ({
      ...prev,
      respectPoints: prev.respectPoints.add(finalClickValue),
      totalRP: prev.totalRP.add(finalClickValue),
      statistics: {
        ...prev.statistics,
        totalClicks: prev.statistics.totalClicks.add(1),
        totalRPEarned: prev.statistics.totalRPEarned.add(finalClickValue)
      }
    }));

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newAnimation = {
      id: Date.now(),
      x,
      y,
      value: finalClickValue // Store the actual click value for display
    };
    
    setClickAnimations(prev => [...prev, newAnimation]);
    
    setTimeout(() => {
      setClickAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id));
    }, 1000);
  };

  const formatNumber = (num: Decimal | number) => {
    // Ensure we have a Decimal object
    const decimal = num instanceof Decimal ? num : new Decimal(num);
    
    if (decimal.gte(1e308)) return decimal.toExponential(2);
    if (decimal.gte(1e33)) return decimal.toExponential(2);
    if (decimal.gte(1e30)) return decimal.div(1e30).toFixed(1) + ' No';
    if (decimal.gte(1e27)) return decimal.div(1e27).toFixed(1) + ' Oc';
    if (decimal.gte(1e24)) return decimal.div(1e24).toFixed(1) + ' Sp';
    if (decimal.gte(1e21)) return decimal.div(1e21).toFixed(1) + ' Sx';
    if (decimal.gte(1e18)) return decimal.div(1e18).toFixed(1) + ' Qi';
    if (decimal.gte(1e15)) return decimal.div(1e15).toFixed(1) + ' Qa';
    if (decimal.gte(1e12)) return decimal.div(1e12).toFixed(1) + ' T';
    if (decimal.gte(1e9)) return decimal.div(1e9).toFixed(1) + ' B';
    if (decimal.gte(1e6)) return decimal.div(1e6).toFixed(1) + ' M';
    if (decimal.gte(1e3)) return decimal.div(1e3).toFixed(1) + ' K';
    return decimal.floor().toString();
  };

  const getUpgradeCost = (upgradeType: string, currentLevel: Decimal): Decimal => {
    const baseCosts = {
      equipment: new Decimal(10),
      training: new Decimal(25),
      partner: new Decimal(15),      // Much cheaper for first passive income
      patrol: new Decimal(50),
      investigation: new Decimal(200),
      precinct: new Decimal(1000),
      automation: new Decimal(5000)
    };
    
    const scalingFactors = {
      equipment: new Decimal(1.4),   // Gentler scaling
      training: new Decimal(1.6),
      partner: new Decimal(1.3),     // Very gentle scaling for early passive
      patrol: new Decimal(1.5),
      investigation: new Decimal(1.7),
      precinct: new Decimal(2.0),
      automation: new Decimal(2.5)
    };
    
    const baseCost = baseCosts[upgradeType as keyof typeof baseCosts] || new Decimal(10);
    const scaling = scalingFactors[upgradeType as keyof typeof scalingFactors] || new Decimal(1.5);
    const costReduction = getLegacyCostReduction();
    
    return baseCost.mul(Decimal.pow(scaling, currentLevel)).mul(costReduction).floor();
  };

  const getBulkUpgradeCost = (upgradeType: string, currentLevel: Decimal, quantity: Decimal): Decimal => {
    const baseCosts = {
      equipment: new Decimal(10),
      training: new Decimal(25),
      partner: new Decimal(15),
      patrol: new Decimal(50),
      investigation: new Decimal(200),
      precinct: new Decimal(1000),
      automation: new Decimal(5000)
    };
    
    const scalingFactors = {
      equipment: new Decimal(1.4),
      training: new Decimal(1.6),
      partner: new Decimal(1.3),
      patrol: new Decimal(1.5),
      investigation: new Decimal(1.7),
      precinct: new Decimal(2.0),
      automation: new Decimal(2.5)
    };
    
    const baseCost = baseCosts[upgradeType as keyof typeof baseCosts] || new Decimal(10);
    const scaling = scalingFactors[upgradeType as keyof typeof scalingFactors] || new Decimal(1.5);
    const costReduction = getLegacyCostReduction();
    
    // Calculate geometric series sum: baseCost * scaling^currentLevel * (scaling^quantity - 1) / (scaling - 1)
    if (scaling.eq(1)) {
      return baseCost.mul(currentLevel).mul(quantity).mul(costReduction);
    }
    
    const startCost = baseCost.mul(Decimal.pow(scaling, currentLevel));
    const scalingPowerQuantity = Decimal.pow(scaling, quantity);
    const geometricSum = startCost.mul(scalingPowerQuantity.sub(1)).div(scaling.sub(1));
    
    return geometricSum.mul(costReduction).floor();
  };

  const getMaxAffordableQuantity = (upgradeType: string, currentLevel: Decimal, availableMoney: Decimal): Decimal => {
    const baseCosts = {
      equipment: new Decimal(10),
      training: new Decimal(25),
      partner: new Decimal(15),
      patrol: new Decimal(50),
      investigation: new Decimal(200),
      precinct: new Decimal(1000),
      automation: new Decimal(5000)
    };
    
    const scalingFactors = {
      equipment: new Decimal(1.4),
      training: new Decimal(1.6),
      partner: new Decimal(1.3),
      patrol: new Decimal(1.5),
      investigation: new Decimal(1.7),
      precinct: new Decimal(2.0),
      automation: new Decimal(2.5)
    };
    
    const baseCost = baseCosts[upgradeType as keyof typeof baseCosts] || new Decimal(10);
    const scaling = scalingFactors[upgradeType as keyof typeof scalingFactors] || new Decimal(1.5);
    
    if (scaling.eq(1)) {
      return availableMoney.div(baseCost.mul(currentLevel)).floor();
    }
    
    const startCost = baseCost.mul(Decimal.pow(scaling, currentLevel));
    if (availableMoney.lt(startCost)) {
      return new Decimal(0);
    }
    
    // Binary search to find maximum affordable quantity
    let low = new Decimal(1);
    let high = new Decimal(1000); // Start with reasonable upper bound
    
    // Increase upper bound if needed
    while (getBulkUpgradeCost(upgradeType, currentLevel, high).lte(availableMoney)) {
      high = high.mul(10);
    }
    
    let result = new Decimal(0);
    
    // Binary search
    while (low.lte(high)) {
      const mid = low.add(high).div(2).floor();
      const cost = getBulkUpgradeCost(upgradeType, currentLevel, mid);
      
      if (cost.lte(availableMoney)) {
        result = mid;
        low = mid.add(1);
      } else {
        high = mid.sub(1);
      }
    }
    
    return result;
  };

  const getRankMultiplier = (): Decimal => {
    if (!gameState?.rank) return new Decimal(1);
    const rankIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    return rankIndex >= 0 ? new Decimal(1 + (rankIndex * 0.25)) : new Decimal(1); // 25% bonus per rank
  };

  const getLegacyMultiplier = (): Decimal => {
    if (!gameState?.legacyUpgrades) return new Decimal(1);
    // +10% per efficiency level
    return new Decimal(1).add(gameState.legacyUpgrades.efficiency.mul(0.1));
  };

  const getLegacyCostReduction = (): Decimal => {
    if (!gameState?.legacyUpgrades) return new Decimal(1);
    // -2% cost per wisdom level, minimum 10% cost
    const legacyReduction = gameState.legacyUpgrades.wisdom.mul(0.02);
    const equipmentReduction = getEquipmentBonuses().upgradeCostReduction * 0.01; // Convert percentage to decimal
    const totalReduction = legacyReduction.add(equipmentReduction);
    return Decimal.max(new Decimal(0.1), new Decimal(1).sub(totalReduction));
  };

  const getRankRequirementReduction = useCallback((): Decimal => {
    if (!gameState?.legacyUpgrades) return new Decimal(1);
    // -10% rank requirements per equipment level, minimum 10% requirements
    const multiplier = Decimal.pow(new Decimal(0.9), gameState.legacyUpgrades.equipment);
    return Decimal.max(new Decimal(0.1), multiplier);
  }, [gameState?.legacyUpgrades]);

  const calculatePrestigeGain = (): Decimal => {
    if (!gameState?.totalRP) return new Decimal(0);
    const prestigeThreshold = new Decimal(50000); // 50K RP
    if (gameState.totalRP.lt(prestigeThreshold)) return new Decimal(0);
    
    // Formula: sqrt(totalRP / 50000)
    return gameState.totalRP.div(prestigeThreshold).sqrt().floor();
  };

  const canPrestige = (): boolean => {
    return calculatePrestigeGain().gt(0) && gameState.rank === "Chief";
  };

  const performPrestige = () => {
    if (!canPrestige()) return;
    
    const legacyGain = calculatePrestigeGain();
    
    if (confirm(`Retire and gain ${legacyGain.toString()} Legacy Points? This will reset your progress but grant permanent bonuses.`)) {
      setGameState(prev => ({
        respectPoints: new Decimal(0),
        clickValue: new Decimal(1),
        rank: RANKS[0].name,
        passiveIncome: new Decimal(0),
        legacyPoints: prev.legacyPoints.add(legacyGain),
        totalRP: new Decimal(0), // Reset for next prestige
        prestigeCount: prev.prestigeCount.add(1),
        playTime: prev.playTime, // Keep play time
        upgrades: {
          equipment: new Decimal(0),
          training: new Decimal(0),
          partner: new Decimal(0),
          patrol: new Decimal(0),
          investigation: new Decimal(0),
          precinct: new Decimal(0),
          automation: new Decimal(0)
        },
        legacyUpgrades: prev.legacyUpgrades, // Keep legacy upgrades
        achievements: prev.achievements, // Keep achievements
        caseFiles: prev.caseFiles, // Keep case progress
        randomEvents: prev.randomEvents, // Keep events
        activeEffects: [], // Clear active effects on prestige
        equipment: prev.equipment, // Keep equipment collection
        equippedItems: prev.equippedItems, // Keep equipped items
        department: prev.department, // Keep department buildings and staff
        soundSettings: prev.soundSettings, // Keep sound settings
        themeSettings: prev.themeSettings, // Keep theme settings
        statistics: {
          ...prev.statistics,
          totalPrestigeCount: prev.statistics.totalPrestigeCount.add(1)
        } // Keep and update statistics
      }));
    }
  };

  const getLegacyUpgradeCost = (upgradeType: 'efficiency' | 'wisdom' | 'equipment'): Decimal => {
    const currentLevel = gameState.legacyUpgrades[upgradeType];
    const baseCost = new Decimal(1);
    const scaling = new Decimal(2); // 2x scaling for legacy upgrades
    return baseCost.mul(Decimal.pow(scaling, currentLevel));
  };

  const canAffordLegacyUpgrade = (upgradeType: 'efficiency' | 'wisdom' | 'equipment'): boolean => {
    return gameState.legacyPoints.gte(getLegacyUpgradeCost(upgradeType));
  };

  const buyLegacyUpgrade = (upgradeType: 'efficiency' | 'wisdom' | 'equipment') => {
    const cost = getLegacyUpgradeCost(upgradeType);
    
    if (gameState.legacyPoints.gte(cost)) {
      setGameState(prev => ({
        ...prev,
        legacyPoints: prev.legacyPoints.sub(cost),
        legacyUpgrades: {
          ...prev.legacyUpgrades,
          [upgradeType]: prev.legacyUpgrades[upgradeType].add(1)
        }
      }));
    }
  };

  const checkAchievements = () => {
    const newlyUnlocked: Achievement[] = [];
    
    setGameState(prev => {
      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.unlocked || achievement.claimed) return achievement;
        
        let shouldUnlock = false;
        
        switch (achievement.criteria.type) {
          case 'total_rp':
            shouldUnlock = prev.totalRP.gte(achievement.criteria.target as Decimal);
            break;
          case 'rank':
            shouldUnlock = prev.rank === achievement.criteria.target;
            break;
          case 'upgrade_count':
            if (achievement.criteria.upgradeType) {
              const upgradeLevel = prev.upgrades[achievement.criteria.upgradeType as keyof typeof prev.upgrades];
              shouldUnlock = upgradeLevel.gte(achievement.criteria.target as Decimal);
            } else {
              // Total upgrades count
              const totalUpgrades = Object.values(prev.upgrades).reduce((sum, level) => sum.add(level), new Decimal(0));
              shouldUnlock = totalUpgrades.gte(achievement.criteria.target as Decimal);
            }
            break;
          case 'click_power':
            shouldUnlock = prev.clickValue.gte(achievement.criteria.target as Decimal);
            break;
          case 'passive_income':
            shouldUnlock = prev.passiveIncome.gte(achievement.criteria.target as Decimal);
            break;
          case 'prestige_count':
            shouldUnlock = prev.prestigeCount.gte(achievement.criteria.target as Decimal);
            break;
          case 'play_time':
            shouldUnlock = prev.playTime >= (achievement.criteria.target as number);
            break;
        }
        
        if (shouldUnlock && !achievement.unlocked) {
          newlyUnlocked.push(achievement);
          return { ...achievement, unlocked: true };
        }
        
        return achievement;
      });
      
      return { ...prev, achievements: updatedAchievements };
    });
    
    // Show notifications for newly unlocked achievements
    if (newlyUnlocked.length > 0) {
      setAchievementNotifications(prev => [...prev, ...newlyUnlocked]);
    }
  };

  const claimAchievement = (achievementId: string) => {
    const achievement = gameState.achievements.find(a => a.id === achievementId);
    if (!achievement || !achievement.unlocked || achievement.claimed) return;
    
    // Play achievement sound
    playSound('achievement');
    
    setGameState(prev => {
      const updatedAchievements = prev.achievements.map(a => 
        a.id === achievementId ? { ...a, claimed: true } : a
      );
      
      let updatedState = { 
        ...prev, 
        achievements: updatedAchievements,
        statistics: {
          ...prev.statistics,
          totalAchievementsUnlocked: prev.statistics.totalAchievementsUnlocked.add(1)
        }
      };
      
      // Apply rewards
      switch (achievement.reward.type) {
        case 'rp':
          updatedState = {
            ...updatedState,
            respectPoints: updatedState.respectPoints.add(achievement.reward.amount),
            totalRP: updatedState.totalRP.add(achievement.reward.amount)
          };
          break;
        case 'legacy_points':
          updatedState = {
            ...updatedState,
            legacyPoints: updatedState.legacyPoints.add(achievement.reward.amount)
          };
          break;
      }
      
      return updatedState;
    });
  };

  const dismissNotification = (achievementId: string) => {
    setAchievementNotifications(prev => prev.filter(a => a.id !== achievementId));
  };

  // Check achievements whenever game state changes
  useEffect(() => {
    if (isLoaded) {
      checkAchievements();
    }
  }, [gameState.totalRP, gameState.rank, gameState.clickValue, gameState.passiveIncome, gameState.prestigeCount, gameState.upgrades, isLoaded]);

  const saveGame = () => {
    try {
      const saveState = {
        ...gameState,
        respectPoints: gameState.respectPoints.toString(),
        clickValue: gameState.clickValue.toString(),
        passiveIncome: gameState.passiveIncome.toString(),
        legacyPoints: gameState.legacyPoints.toString(),
        totalRP: gameState.totalRP.toString(),
        prestigeCount: gameState.prestigeCount.toString(),
        upgrades: {
          equipment: gameState.upgrades.equipment.toString(),
          training: gameState.upgrades.training.toString(),
          partner: gameState.upgrades.partner.toString(),
          patrol: gameState.upgrades.patrol.toString(),
          investigation: gameState.upgrades.investigation.toString(),
          precinct: gameState.upgrades.precinct.toString(),
          automation: gameState.upgrades.automation.toString(),
        },
        legacyUpgrades: {
          efficiency: gameState.legacyUpgrades.efficiency.toString(),
          wisdom: gameState.legacyUpgrades.wisdom.toString(),
          equipment: gameState.legacyUpgrades.equipment.toString(),
        }
      };
      localStorage.setItem('cop-clicker-save', JSON.stringify(saveState));
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  };

  const resetGame = () => {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone!')) {
      localStorage.removeItem('cop-clicker-save');
      setGameState({
        respectPoints: new Decimal(0),
        clickValue: new Decimal(1),
        rank: RANKS[0].name,
        passiveIncome: new Decimal(0),
        legacyPoints: new Decimal(0),
        totalRP: new Decimal(0),
        prestigeCount: new Decimal(0),
        playTime: 0,
        upgrades: {
          equipment: new Decimal(0),
          training: new Decimal(0),
          partner: new Decimal(0),
          patrol: new Decimal(0),
          investigation: new Decimal(0),
          precinct: new Decimal(0),
          automation: new Decimal(0)
        },
        legacyUpgrades: {
          efficiency: new Decimal(0),
          wisdom: new Decimal(0),
          equipment: new Decimal(0)
        },
        achievements: [...INITIAL_ACHIEVEMENTS],
        caseFiles: [...INITIAL_CASE_FILES],
        randomEvents: [...RANDOM_EVENTS],
        activeEffects: [],
        equipment: [...INITIAL_EQUIPMENT],
        equippedItems: {
          radio: null,
          badge: INITIAL_EQUIPMENT.find(e => e.id === 'rookie_badge') || null,
          weapon: null,
          vest: null,
          vehicle: null,
          gadget: null
        },
        department: {
          buildings: [...INITIAL_DEPARTMENT_BUILDINGS],
          staff: [],
          totalStaffCapacity: 0,
          totalIncome: new Decimal(0)
        },
        soundSettings: {
          masterVolume: 0.7,
          sfxEnabled: true,
          ambientEnabled: true,
          sfxVolume: 0.8,
          ambientVolume: 0.3
        },
        themeSettings: {
          theme: 'dark',
          customColors: {
            primary: '#3b82f6',
            secondary: '#1e40af',
            accent: '#fbbf24'
          }
        },
        statistics: {
          totalClicks: new Decimal(0),
          totalUpgradesPurchased: new Decimal(0),
          totalCasesSolved: new Decimal(0),
          totalAchievementsUnlocked: new Decimal(0),
          totalPrestigeCount: new Decimal(0),
          sessionsPlayed: new Decimal(1),
          currentStreak: new Decimal(0),
          bestClicksPerSecond: 0,
          totalTimeInRanks: {},
          firstPlayDate: Date.now(),
          lastPlayDate: Date.now(),
          totalRPEarned: new Decimal(0),
          totalRPSpent: new Decimal(0),
          averageSessionLength: 0,
          longestSession: 0
        }
      });
    }
  };

  // Export/Import Save Functionality
  const exportSave = useCallback(() => {
    try {
      // Helper function to safely serialize objects with Decimal values
      const serializeForExport = (obj: unknown): unknown => {
        if (obj && typeof obj === 'object') {
          if (obj.toString && typeof obj.toString === 'function' && obj.constructor && obj.constructor.name === 'Decimal') {
            return obj.toString();
          }
          if (Array.isArray(obj)) {
            return obj.map(serializeForExport);
          }
          const result: Record<string, unknown> = {};
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              result[key] = serializeForExport((obj as Record<string, unknown>)[key]);
            }
          }
          return result;
        }
        return obj;
      };

      const saveData = {
        respectPoints: gameState.respectPoints.toString(),
        clickValue: gameState.clickValue.toString(),
        rank: gameState.rank,
        passiveIncome: gameState.passiveIncome.toString(),
        legacyPoints: gameState.legacyPoints.toString(),
        totalRP: gameState.totalRP.toString(),
        prestigeCount: gameState.prestigeCount.toString(),
        playTime: gameState.playTime,
        upgrades: {
          equipment: gameState.upgrades.equipment.toString(),
          training: gameState.upgrades.training.toString(),
          partner: gameState.upgrades.partner.toString(),
          patrol: gameState.upgrades.patrol.toString(),
          investigation: gameState.upgrades.investigation.toString(),
          precinct: gameState.upgrades.precinct.toString(),
          automation: gameState.upgrades.automation.toString()
        },
        legacyUpgrades: {
          efficiency: gameState.legacyUpgrades.efficiency.toString(),
          wisdom: gameState.legacyUpgrades.wisdom.toString(),
          equipment: gameState.legacyUpgrades.equipment.toString()
        },
        achievements: serializeForExport(gameState.achievements),
        caseFiles: serializeForExport(gameState.caseFiles),
        randomEvents: serializeForExport(gameState.randomEvents),
        activeEffects: serializeForExport(gameState.activeEffects),
        equipment: serializeForExport(gameState.equipment),
        equippedItems: serializeForExport(gameState.equippedItems),
        soundSettings: gameState.soundSettings,
        themeSettings: gameState.themeSettings,
        statistics: {
          totalClicks: gameState.statistics.totalClicks.toString(),
          totalUpgradesPurchased: gameState.statistics.totalUpgradesPurchased.toString(),
          totalCasesSolved: gameState.statistics.totalCasesSolved.toString(),
          totalAchievementsUnlocked: gameState.statistics.totalAchievementsUnlocked.toString(),
          totalPrestigeCount: gameState.statistics.totalPrestigeCount.toString(),
          sessionsPlayed: gameState.statistics.sessionsPlayed.toString(),
          currentStreak: gameState.statistics.currentStreak.toString(),
          bestClicksPerSecond: gameState.statistics.bestClicksPerSecond,
          totalTimeInRanks: gameState.statistics.totalTimeInRanks,
          firstPlayDate: gameState.statistics.firstPlayDate,
          lastPlayDate: gameState.statistics.lastPlayDate,
          totalRPEarned: gameState.statistics.totalRPEarned.toString(),
          totalRPSpent: gameState.statistics.totalRPSpent.toString(),
          averageSessionLength: gameState.statistics.averageSessionLength,
          longestSession: gameState.statistics.longestSession
        },
        exportDate: Date.now(),
        version: '1.0'
      };
      
      // Test JSON serialization first
      const jsonString = JSON.stringify(saveData);
      
      // Use TextEncoder for proper Unicode handling instead of btoa
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(jsonString);
      
      // Convert to base64 using a safer method
      let binary = '';
      uint8Array.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
      const exportString = btoa(binary);
      
      // Create and trigger download
      const blob = new Blob([exportString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cop-clicker-save-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Save exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to export save data: ${errorMessage}. Please try again.`);
    }
  }, [gameState]);

  const importSave = useCallback(() => {
    if (!importData.trim()) {
      alert('Please paste your save data first.');
      return;
    }
    
    try {
      // Decode using the same method as export
      const binaryString = atob(importData.trim());
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      const decodedData = decoder.decode(uint8Array);
      const saveData = JSON.parse(decodedData);
      
      // Validate save data structure
      if (!saveData.respectPoints || !saveData.upgrades || !saveData.version) {
        throw new Error('Invalid save data format');
      }
      
      // Convert string values back to Decimals
      const convertToDecimal = (value: string) => new Decimal(value);
      
      const newGameState: GameState = {
        respectPoints: convertToDecimal(saveData.respectPoints),
        clickValue: convertToDecimal(saveData.clickValue),
        rank: saveData.rank,
        passiveIncome: convertToDecimal(saveData.passiveIncome),
        legacyPoints: convertToDecimal(saveData.legacyPoints),
        totalRP: convertToDecimal(saveData.totalRP),
        prestigeCount: convertToDecimal(saveData.prestigeCount),
        playTime: saveData.playTime,
        upgrades: {
          equipment: convertToDecimal(saveData.upgrades.equipment),
          training: convertToDecimal(saveData.upgrades.training),
          partner: convertToDecimal(saveData.upgrades.partner),
          patrol: convertToDecimal(saveData.upgrades.patrol),
          investigation: convertToDecimal(saveData.upgrades.investigation),
          precinct: convertToDecimal(saveData.upgrades.precinct),
          automation: convertToDecimal(saveData.upgrades.automation)
        },
        legacyUpgrades: {
          efficiency: convertToDecimal(saveData.legacyUpgrades.efficiency),
          wisdom: convertToDecimal(saveData.legacyUpgrades.wisdom),
          equipment: convertToDecimal(saveData.legacyUpgrades.equipment)
        },
        achievements: saveData.achievements || [...INITIAL_ACHIEVEMENTS],
        caseFiles: saveData.caseFiles || [...INITIAL_CASE_FILES],
        randomEvents: saveData.randomEvents || [...RANDOM_EVENTS],
        activeEffects: saveData.activeEffects || [],
        equipment: saveData.equipment || [...INITIAL_EQUIPMENT],
        equippedItems: saveData.equippedItems || {
          radio: null,
          badge: INITIAL_EQUIPMENT.find(e => e.id === 'rookie_badge') || null,
          weapon: null,
          vest: null,
          vehicle: null,
          gadget: null
        },
        soundSettings: saveData.soundSettings || {
          masterVolume: 0.7,
          sfxEnabled: true,
          ambientEnabled: true,
          sfxVolume: 0.8,
          ambientVolume: 0.3
        },
        themeSettings: saveData.themeSettings || {
          theme: 'dark',
          customColors: {
            primary: '#3b82f6',
            secondary: '#1e40af',
            accent: '#fbbf24'
          }
        },
        department: saveData.department || {
          buildings: [...INITIAL_DEPARTMENT_BUILDINGS],
          staff: [],
          totalStaffCapacity: 0,
          totalIncome: new Decimal(0)
        },
        statistics: {
          totalClicks: convertToDecimal(saveData.statistics?.totalClicks || '0'),
          totalUpgradesPurchased: convertToDecimal(saveData.statistics?.totalUpgradesPurchased || '0'),
          totalCasesSolved: convertToDecimal(saveData.statistics?.totalCasesSolved || '0'),
          totalAchievementsUnlocked: convertToDecimal(saveData.statistics?.totalAchievementsUnlocked || '0'),
          totalPrestigeCount: convertToDecimal(saveData.statistics?.totalPrestigeCount || '0'),
          sessionsPlayed: convertToDecimal(saveData.statistics?.sessionsPlayed || '1'),
          currentStreak: convertToDecimal(saveData.statistics?.currentStreak || '0'),
          bestClicksPerSecond: saveData.statistics?.bestClicksPerSecond || 0,
          totalTimeInRanks: saveData.statistics?.totalTimeInRanks || {},
          firstPlayDate: saveData.statistics?.firstPlayDate || Date.now(),
          lastPlayDate: Date.now(),
          totalRPEarned: convertToDecimal(saveData.statistics?.totalRPEarned || '0'),
          totalRPSpent: convertToDecimal(saveData.statistics?.totalRPSpent || '0'),
          averageSessionLength: saveData.statistics?.averageSessionLength || 0,
          longestSession: saveData.statistics?.longestSession || 0
        }
      };
      
      setGameState(newGameState);
      
      // Save to localStorage
      const saveState = {
        ...saveData,
        statistics: {
          ...saveData.statistics,
          lastPlayDate: Date.now()
        }
      };
      localStorage.setItem('cop-clicker-save', JSON.stringify(saveState));
      
      setShowImportModal(false);
      setImportData('');
      alert('Save imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import save data. Please check the format and try again.');
    }
  }, [importData, setGameState]);

  const buyUpgrade = (upgradeType: 'equipment' | 'training' | 'partner' | 'patrol' | 'investigation' | 'precinct' | 'automation') => {
    let quantity: Decimal;
    
    if (purchaseQuantity === 'max') {
      quantity = getMaxAffordableQuantity(upgradeType, gameState.upgrades[upgradeType], gameState.respectPoints);
    } else {
      quantity = new Decimal(purchaseQuantity);
    }
    
    if (quantity.lte(0)) return;
    
    const cost = getBulkUpgradeCost(upgradeType, gameState.upgrades[upgradeType], quantity);
    
    if (gameState.respectPoints.gte(cost)) {
      // Play upgrade sound
      playSound('upgrade');
      
      setGameState(prev => {
        const newState = {
          ...prev,
          respectPoints: prev.respectPoints.sub(cost),
          upgrades: {
            ...prev.upgrades,
            [upgradeType]: prev.upgrades[upgradeType].add(quantity)
          },
          statistics: {
            ...prev.statistics,
            totalUpgradesPurchased: prev.statistics.totalUpgradesPurchased.add(quantity),
            totalRPSpent: prev.statistics.totalRPSpent.add(cost)
          }
        };

        const rankMultiplier = getRankMultiplier();
        const legacyMultiplier = getLegacyMultiplier();

        // Calculate click value with legacy bonuses
        const baseClickValue = new Decimal(1);
        const equipmentBonus = newState.upgrades.equipment.mul(1);
        const trainingBonus = newState.upgrades.training.mul(2);
        newState.clickValue = baseClickValue.add(equipmentBonus).add(trainingBonus).mul(rankMultiplier).mul(legacyMultiplier).floor();
        
        // Calculate passive income with legacy bonuses
        const partnerIncome = newState.upgrades.partner.mul(1);
        const patrolIncome = newState.upgrades.patrol.mul(3);
        const investigationIncome = newState.upgrades.investigation.mul(12);
        const precinctIncome = newState.upgrades.precinct.mul(50);
        const automationBonus = newState.upgrades.automation.gt(0) 
          ? new Decimal(1).add(newState.upgrades.automation.mul(0.5)) 
          : new Decimal(1);
        
        const totalPassiveIncome = partnerIncome.add(patrolIncome).add(investigationIncome).add(precinctIncome).mul(automationBonus);
        newState.passiveIncome = totalPassiveIncome.mul(rankMultiplier).mul(legacyMultiplier).floor();

        return newState;
      });
      
      // Save immediately after important actions
      setTimeout(() => saveGame(), 100);
    }
  };

  const canAfford = (upgradeType: 'equipment' | 'training' | 'partner' | 'patrol' | 'investigation' | 'precinct' | 'automation') => {
    if (!gameState?.upgrades) return false;
    
    let quantity: Decimal;
    if (purchaseQuantity === 'max') {
      quantity = getMaxAffordableQuantity(upgradeType, gameState.upgrades[upgradeType], gameState.respectPoints);
      return quantity.gt(0);
    } else {
      quantity = new Decimal(purchaseQuantity);
    }
    
    const cost = getBulkUpgradeCost(upgradeType, gameState.upgrades[upgradeType], quantity);
    return gameState.respectPoints.gte(cost);
  };

  const updateRank = useCallback(() => {
    if (!gameState?.rank) return;
    const currentRankIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    const nextRankIndex = currentRankIndex + 1;
    
    // Apply legacy equipment reduction to rank requirements
    const rankReduction = getRankRequirementReduction();
    const adjustedRequirement = nextRankIndex < RANKS.length 
      ? RANKS[nextRankIndex].requirement.mul(rankReduction)
      : new Decimal(Infinity);
    
    if (nextRankIndex < RANKS.length && gameState.respectPoints.gte(adjustedRequirement)) {
      // Play rank up sound
      playSound('rank_up');
      
      setGameState(prev => {
        const newState = { ...prev, rank: RANKS[nextRankIndex].name };
        const rankMultiplier = new Decimal(1 + (nextRankIndex * 0.25));
        
        // Recalculate values with new rank bonus and legacy bonuses
        const legacyMultiplier = new Decimal(1).add((newState.legacyUpgrades?.efficiency || new Decimal(0)).mul(0.1));
        const baseClickValue = new Decimal(1);
        const equipmentBonus = newState.upgrades.equipment.mul(1);
        const trainingBonus = newState.upgrades.training.mul(2);
        newState.clickValue = baseClickValue.add(equipmentBonus).add(trainingBonus).mul(rankMultiplier).mul(legacyMultiplier).floor();
        
        // Calculate passive income with legacy bonuses
        const partnerIncome = newState.upgrades.partner.mul(1);
        const patrolIncome = newState.upgrades.patrol.mul(3);
        const investigationIncome = newState.upgrades.investigation.mul(12);
        const precinctIncome = newState.upgrades.precinct.mul(50);
        const automationBonus = newState.upgrades.automation.gt(0) 
          ? new Decimal(1).add(newState.upgrades.automation.mul(0.5)) 
          : new Decimal(1);
        
        const totalPassiveIncome = partnerIncome.add(patrolIncome).add(investigationIncome).add(precinctIncome).mul(automationBonus);
        newState.passiveIncome = totalPassiveIncome.mul(rankMultiplier).mul(legacyMultiplier).floor();
        
        return newState;
      });
    }
  }, [gameState, getRankRequirementReduction, setGameState, playSound]);

  const getCurrentRankInfo = () => {
    if (!gameState?.rank) return { current: RANKS[0], next: RANKS[1], progress: 0, adjustedRequirement: new Decimal(0) };
    const currentIndex = RANKS.findIndex(rank => rank.name === gameState.rank);
    const nextIndex = currentIndex + 1;
    
    const rankReduction = getRankRequirementReduction();
    const adjustedRequirement = nextIndex < RANKS.length 
      ? RANKS[nextIndex].requirement.mul(rankReduction)
      : new Decimal(0);
    
    return {
      current: RANKS[currentIndex] || RANKS[0],
      next: nextIndex < RANKS.length ? RANKS[nextIndex] : null,
      adjustedRequirement,
      progress: nextIndex < RANKS.length 
        ? Math.min(100, gameState.respectPoints.div(adjustedRequirement).mul(100).toNumber())
        : 100
    };
  };

  useEffect(() => {
    if (isLoaded) {
      updateRank();
    }
  }, [gameState.respectPoints, isLoaded, updateRank]);

  // Memoize expensive calculations
  const rankMultiplier = getRankMultiplier();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{
        background: 'linear-gradient(to bottom right, var(--bg-secondary), var(--bg-tertiary))',
        color: 'var(--text-primary)'
      }}>
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{
      background: 'linear-gradient(to bottom right, var(--bg-primary), var(--bg-secondary))',
      color: 'var(--text-primary)'
    }}>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <header className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Cop Clicker</h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Rise Through the Ranks</p>
        </header>

        {/* Achievement Notifications */}
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 space-y-2 max-w-[90vw] sm:max-w-sm">
          {/* Event Notifications */}
          {eventNotifications.map((event) => (
            <div
              key={event.id}
              className={`border rounded-lg p-4 shadow-lg animate-pulse max-w-sm ${
                event.type === 'commendation' || event.type === 'equipment_found' || event.type === 'training_opportunity' || event.type === 'overtime'
                  ? 'bg-green-600 border-green-400' 
                  : 'bg-red-600 border-red-400'
              }`}
            >
              <div className="font-bold text-sm">{event.title}</div>
              <div className="text-xs text-white">{event.description}</div>
              <div className="text-xs text-gray-200 mt-1">
                Duration: {Math.floor(event.effect.duration / 60)}m {event.effect.duration % 60}s
              </div>
            </div>
          ))}
          
          {achievementNotifications.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-gradient-to-r from-yellow-600 to-yellow-500 border border-yellow-400 rounded-lg p-4 shadow-2xl max-w-sm transform transition-all duration-300 hover:scale-105"
              style={{
                animation: 'pulse 1s infinite, glow 2s infinite'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">🏆 Achievement Unlocked!</div>
                  <div className="text-sm font-semibold">{achievement.title}</div>
                  <div className="text-xs text-yellow-100">{achievement.description}</div>
                  <div className="text-xs text-yellow-200 mt-1">
                    Reward: {achievement.reward.type === 'rp' ? `${formatNumber(achievement.reward.amount)} RP` : 
                             achievement.reward.type === 'legacy_points' ? `${formatNumber(achievement.reward.amount)} LP` : 
                             'Multiplier Bonus'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    claimAchievement(achievement.id);
                    dismissNotification(achievement.id);
                  }}
                  className="ml-2 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold"
                >
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-blue-800/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm border border-blue-600/30">
              <div className="text-center mb-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Current Rank: {gameState.rank}</h2>
                <div className="text-xl sm:text-2xl lg:text-3xl font-mono">
                  {formatNumber(gameState.respectPoints)} Respect Points
                </div>
                <div className="text-sm sm:text-base lg:text-lg text-blue-200 mt-2">
                  +{formatNumber(gameState.clickValue.add(new Decimal(getEquipmentBonuses().clickPower)))} per click
                  {(gameState.passiveIncome.gt(0) || getEquipmentBonuses().passiveIncome > 0) && (
                    <div className="text-sm text-green-300">
                      +{formatNumber(gameState.passiveIncome.add(new Decimal(getEquipmentBonuses().passiveIncome)))} per second
                    </div>
                  )}
                  {rankMultiplier.gt(1) && (
                    <div className="text-sm text-yellow-300">
                      Rank Bonus: +{rankMultiplier.sub(1).mul(100).toFixed(0)}%
                    </div>
                  )}
                  {gameState.legacyPoints.gt(0) && (
                    <div className="text-sm text-purple-300">
                      Legacy Bonus: +{getLegacyMultiplier().sub(1).mul(100).toFixed(0)}%
                    </div>
                  )}
                  {(() => {
                    const equipmentBonuses = getEquipmentBonuses();
                    const hasEquipmentBonuses = Object.values(equipmentBonuses).some(bonus => bonus > 0);
                    return hasEquipmentBonuses ? (
                      <div className="text-sm text-indigo-300">
                        Equipment: +{equipmentBonuses.clickPower} click, +{equipmentBonuses.passiveIncome} passive
                      </div>
                    ) : null;
                  })()}
                  {(() => {
                    const multipliers = getActiveMultipliers();
                    const hasActiveEffects = multipliers.clickMultiplier > 1 || multipliers.passiveMultiplier !== 1;
                    return hasActiveEffects ? (
                      <div className="text-sm text-orange-300">
                        Active Effects: 
                        {multipliers.clickMultiplier > 1 && ` Click ×${multipliers.clickMultiplier.toFixed(1)}`}
                        {multipliers.passiveMultiplier !== 1 && ` Passive ×${multipliers.passiveMultiplier.toFixed(1)}`}
                      </div>
                    ) : null;
                  })()}
                </div>
                
                {(() => {
                  const rankInfo = getCurrentRankInfo();
                  return rankInfo.next ? (
                    <div className="mt-4">
                      <div className="text-sm text-blue-200 mb-2">
                        Next: {rankInfo.next.name} ({formatNumber(rankInfo.adjustedRequirement)} RP)
                        {getRankRequirementReduction().lt(1) && (
                          <span className="text-purple-300 text-xs ml-1">
                            (was {formatNumber(rankInfo.next.requirement)})
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-blue-900/50 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${rankInfo.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-blue-300 mt-1">
                        {rankInfo.progress.toFixed(1)}% to promotion
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-yellow-300 font-bold">
                      🏆 Maximum Rank Achieved!
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleClick}
                className="relative bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all duration-150 transform hover:scale-105 active:scale-95 rounded-full w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 text-lg sm:text-xl font-bold shadow-2xl border-4 border-blue-400 overflow-hidden group"
                style={{
                  animation: getActiveMultipliers().clickMultiplier > 1 || getActiveMultipliers().passiveMultiplier > 1 ? 'glow 2s infinite' : 'none'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
                <div className="absolute inset-0 bg-blue-300/20 rounded-full scale-0 group-active:scale-100 transition-transform duration-150"></div>
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl lg:text-4xl">🚔</div>
                  <div className="text-xs sm:text-sm mt-1 sm:mt-2">CLICK TO PATROL</div>
                </div>
                
                {clickAnimations.map(anim => (
                  <div
                    key={anim.id}
                    className="absolute pointer-events-none font-bold text-lg"
                    style={{
                      left: anim.x - 10,
                      top: anim.y - 10,
                      animation: 'floatUp 1.5s ease-out forwards',
                      color: anim.value && anim.value.gte(1000) ? '#fbbf24' : 
                             anim.value && anim.value.gte(100) ? '#10b981' : '#60a5fa',
                      textShadow: '0 0 8px currentColor'
                    }}
                  >
                    +{anim.value ? formatNumber(anim.value) : gameState.clickValue.toString()}
                  </div>
                ))}
              </button>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-blue-800/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm border border-blue-600/30">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">👤 Click Upgrades</h3>
              
              <div className="mb-4">
                <div className="text-sm text-blue-200 mb-2">Purchase Quantity:</div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {([1, 10, 100, 1000, 'max'] as const).map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setPurchaseQuantity(qty)}
                      className={`px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm font-semibold transition-colors min-w-[40px] sm:min-w-[48px] ${
                        purchaseQuantity === qty
                          ? 'bg-blue-500 text-white border border-blue-300'
                          : 'bg-blue-700/50 text-blue-200 border border-blue-600/50 hover:bg-blue-600/50'
                      }`}
                    >
                      {qty === 'max' ? 'Max' : `${qty}x`}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={() => buyUpgrade('equipment')}
                  disabled={!canAfford('equipment')}
                  className={`w-full text-left p-2 sm:p-3 rounded border transition-all duration-300 ${
                    canAfford('equipment') 
                      ? 'bg-blue-700/50 hover:bg-blue-600/50 border-blue-500/30 cursor-pointer hover:scale-102 hover:shadow-lg' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                  style={{
                    animation: canAfford('equipment') ? 'pulse 2s infinite' : 'none'
                  }}
                >
                  <div className="font-semibold text-sm sm:text-base">🔧 Equipment ({gameState.upgrades.equipment.toString()})</div>
                  <div className="text-xs sm:text-sm text-blue-200">
                    {purchaseQuantity === 1 ? '+1 click value' : `+${purchaseQuantity === 'max' ? getMaxAffordableQuantity('equipment', gameState.upgrades.equipment, gameState.respectPoints).toString() : purchaseQuantity} click value`}
                  </div>
                  <div className="text-xs sm:text-sm text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('equipment', gameState.upgrades.equipment)
                        : getBulkUpgradeCost('equipment', gameState.upgrades.equipment, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('equipment', gameState.upgrades.equipment, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-blue-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('equipment', gameState.upgrades.equipment, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
                </button>
                
                <button 
                  onClick={() => buyUpgrade('training')}
                  disabled={!canAfford('training')}
                  className={`w-full text-left p-2 sm:p-3 rounded border transition-colors ${
                    canAfford('training') 
                      ? 'bg-blue-700/50 hover:bg-blue-600/50 border-blue-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm sm:text-base">📚 Training ({gameState.upgrades.training.toString()})</div>
                  <div className="text-xs sm:text-sm text-blue-200">
                    {purchaseQuantity === 1 ? '+2 click value' : `+${(purchaseQuantity === 'max' ? getMaxAffordableQuantity('training', gameState.upgrades.training, gameState.respectPoints) : new Decimal(purchaseQuantity)).mul(2).toString()} click value`}
                  </div>
                  <div className="text-xs sm:text-sm text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('training', gameState.upgrades.training)
                        : getBulkUpgradeCost('training', gameState.upgrades.training, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('training', gameState.upgrades.training, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-blue-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('training', gameState.upgrades.training, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-green-800/50 rounded-lg p-4 sm:p-6 backdrop-blur-sm border border-green-600/30">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">💰 Passive Rank</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => buyUpgrade('partner')}
                  disabled={!canAfford('partner')}
                  className={`w-full text-left p-2 sm:p-3 rounded border transition-colors ${
                    canAfford('partner') 
                      ? 'bg-green-700/50 hover:bg-green-600/50 border-green-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm sm:text-base">👮 Partner ({gameState.upgrades.partner.toString()})</div>
                  <div className="text-xs sm:text-sm text-green-200">
                    {purchaseQuantity === 1 ? '+1 RP/sec' : `+${purchaseQuantity === 'max' ? getMaxAffordableQuantity('partner', gameState.upgrades.partner, gameState.respectPoints).toString() : purchaseQuantity} RP/sec`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('partner', gameState.upgrades.partner)
                        : getBulkUpgradeCost('partner', gameState.upgrades.partner, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('partner', gameState.upgrades.partner, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-green-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('partner', gameState.upgrades.partner, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
                </button>
                
                <button 
                  onClick={() => buyUpgrade('patrol')}
                  disabled={!canAfford('patrol')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('patrol') 
                      ? 'bg-green-700/50 hover:bg-green-600/50 border-green-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">🚗 Patrol Unit ({gameState.upgrades.patrol.toString()})</div>
                  <div className="text-xs text-green-200">
                    {purchaseQuantity === 1 ? '+3 RP/sec' : `+${(purchaseQuantity === 'max' ? getMaxAffordableQuantity('patrol', gameState.upgrades.patrol, gameState.respectPoints) : new Decimal(purchaseQuantity)).mul(3).toString()} RP/sec`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('patrol', gameState.upgrades.patrol)
                        : getBulkUpgradeCost('patrol', gameState.upgrades.patrol, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('patrol', gameState.upgrades.patrol, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-green-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('patrol', gameState.upgrades.patrol, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
                </button>
                
                <button 
                  onClick={() => buyUpgrade('investigation')}
                  disabled={!canAfford('investigation')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('investigation') 
                      ? 'bg-green-700/50 hover:bg-green-600/50 border-green-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">🔍 Investigation ({gameState.upgrades.investigation.toString()})</div>
                  <div className="text-xs text-green-200">
                    {purchaseQuantity === 1 ? '+12 RP/sec' : `+${(purchaseQuantity === 'max' ? getMaxAffordableQuantity('investigation', gameState.upgrades.investigation, gameState.respectPoints) : new Decimal(purchaseQuantity)).mul(12).toString()} RP/sec`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('investigation', gameState.upgrades.investigation)
                        : getBulkUpgradeCost('investigation', gameState.upgrades.investigation, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('investigation', gameState.upgrades.investigation, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-green-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('investigation', gameState.upgrades.investigation, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
                </button>
                
                <button 
                  onClick={() => buyUpgrade('precinct')}
                  disabled={!canAfford('precinct')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('precinct') 
                      ? 'bg-green-700/50 hover:bg-green-600/50 border-green-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">🏢 Precinct ({gameState.upgrades.precinct.toString()})</div>
                  <div className="text-xs text-green-200">
                    {purchaseQuantity === 1 ? '+50 RP/sec' : `+${(purchaseQuantity === 'max' ? getMaxAffordableQuantity('precinct', gameState.upgrades.precinct, gameState.respectPoints) : new Decimal(purchaseQuantity)).mul(50).toString()} RP/sec`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('precinct', gameState.upgrades.precinct)
                        : getBulkUpgradeCost('precinct', gameState.upgrades.precinct, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('precinct', gameState.upgrades.precinct, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-green-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('precinct', gameState.upgrades.precinct, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-purple-800/50 rounded-lg p-6 backdrop-blur-sm border border-purple-600/30">
              <h3 className="text-xl font-bold mb-4">⚡ Automation</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => buyUpgrade('automation')}
                  disabled={!canAfford('automation')}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    canAfford('automation') 
                      ? 'bg-purple-700/50 hover:bg-purple-600/50 border-purple-500/30 cursor-pointer' 
                      : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-semibold text-sm">🤖 AI System ({gameState.upgrades.automation.toString()})</div>
                  <div className="text-xs text-purple-200">
                    {purchaseQuantity === 1 ? '+50% passive income' : `+${(purchaseQuantity === 'max' ? getMaxAffordableQuantity('automation', gameState.upgrades.automation, gameState.respectPoints) : new Decimal(purchaseQuantity)).mul(50).toString()}% passive rank`}
                  </div>
                  <div className="text-xs text-yellow-300">
                    Cost: {formatNumber(
                      purchaseQuantity === 1 
                        ? getUpgradeCost('automation', gameState.upgrades.automation)
                        : getBulkUpgradeCost('automation', gameState.upgrades.automation, 
                            purchaseQuantity === 'max' 
                              ? getMaxAffordableQuantity('automation', gameState.upgrades.automation, gameState.respectPoints)
                              : new Decimal(purchaseQuantity)
                          )
                    )} RP
                    {purchaseQuantity !== 1 && (
                      <span className="ml-1 text-purple-300">
                        ({purchaseQuantity === 'max' ? getMaxAffordableQuantity('automation', gameState.upgrades.automation, gameState.respectPoints).toString() : purchaseQuantity}x)
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {gameState.legacyPoints.gt(0) || canPrestige() ? (
              <div className="bg-purple-800/50 rounded-lg p-6 backdrop-blur-sm border border-purple-600/30 mb-6">
                <h3 className="text-xl font-bold mb-4">🏆 Legacy System</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Legacy Points:</span>
                    <span className="text-purple-300 font-bold">{formatNumber(gameState.legacyPoints)}</span>
                  </div>
                  {gameState.legacyPoints.gt(0) && (
                    <>
                      <div className="flex justify-between">
                        <span>Rank Gain Bonus:</span>
                        <span className="text-green-300">+{getLegacyMultiplier().sub(1).mul(100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost Reduction:</span>
                        <span className="text-blue-300">-{new Decimal(1).sub(getLegacyCostReduction()).mul(100).toFixed(0)}%</span>
                      </div>
                      {gameState.legacyUpgrades.equipment.gt(0) && (
                        <div className="flex justify-between">
                          <span>Rank Acceleration:</span>
                          <span className="text-orange-300">-{new Decimal(1).sub(getRankRequirementReduction()).mul(100).toFixed(1)}%</span>
                        </div>
                      )}
                    </>
                  )}
                  {canPrestige() && (
                    <div className="mt-4 pt-2 border-t border-purple-500/30">
                      <div className="text-center mb-2">
                        <div className="text-purple-200">Ready to Retire!</div>
                        <div className="text-sm text-purple-300">
                          Gain {formatNumber(calculatePrestigeGain())} Legacy Points
                        </div>
                      </div>
                      <button
                        onClick={performPrestige}
                        className="w-full p-2 bg-purple-600 hover:bg-purple-500 rounded text-sm font-semibold transition-colors"
                      >
                        🏆 Retire (Prestige)
                      </button>
                    </div>
                  )}
                  {!canPrestige() && gameState.rank !== "Chief" && (
                    <div className="text-xs text-gray-400 mt-2">
                      Reach Chief rank to unlock retirement
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {gameState.legacyPoints.gt(0) && (
              <div className="bg-purple-800/50 rounded-lg p-6 backdrop-blur-sm border border-purple-600/30 mb-6">
                <h3 className="text-xl font-bold mb-4">💎 Legacy Upgrades</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => buyLegacyUpgrade('efficiency')}
                    disabled={!canAffordLegacyUpgrade('efficiency')}
                    className={`w-full text-left p-2 rounded border transition-colors ${
                      canAffordLegacyUpgrade('efficiency') 
                        ? 'bg-purple-700/50 hover:bg-purple-600/50 border-purple-500/30 cursor-pointer' 
                        : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="font-semibold text-sm">⚡ Legacy Efficiency ({gameState.legacyUpgrades.efficiency.toString()})</div>
                    <div className="text-xs text-purple-200">+10% income per level</div>
                    <div className="text-xs text-yellow-300">Cost: {formatNumber(getLegacyUpgradeCost('efficiency'))} LP</div>
                  </button>
                  
                  <button 
                    onClick={() => buyLegacyUpgrade('wisdom')}
                    disabled={!canAffordLegacyUpgrade('wisdom')}
                    className={`w-full text-left p-2 rounded border transition-colors ${
                      canAffordLegacyUpgrade('wisdom') 
                        ? 'bg-purple-700/50 hover:bg-purple-600/50 border-purple-500/30 cursor-pointer' 
                        : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="font-semibold text-sm">🧠 Legacy Wisdom ({gameState.legacyUpgrades.wisdom.toString()})</div>
                    <div className="text-xs text-purple-200">-2% upgrade costs per level</div>
                    <div className="text-xs text-yellow-300">Cost: {formatNumber(getLegacyUpgradeCost('wisdom'))} LP</div>
                  </button>
                  
                  <button 
                    onClick={() => buyLegacyUpgrade('equipment')}
                    disabled={!canAffordLegacyUpgrade('equipment')}
                    className={`w-full text-left p-2 rounded border transition-colors ${
                      canAffordLegacyUpgrade('equipment') 
                        ? 'bg-purple-700/50 hover:bg-purple-600/50 border-purple-500/30 cursor-pointer' 
                        : 'bg-gray-600/50 border-gray-500/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="font-semibold text-sm">🔨 Legacy Equipment ({gameState.legacyUpgrades.equipment.toString()})</div>
                    <div className="text-xs text-purple-200">-10% rank requirements per level</div>
                    <div className="text-xs text-yellow-300">Cost: {formatNumber(getLegacyUpgradeCost('equipment'))} LP</div>
                    {gameState.legacyUpgrades.equipment.gt(0) && (
                      <div className="text-xs text-green-300">
                        Current: -{new Decimal(1).sub(getRankRequirementReduction()).mul(100).toFixed(1)}% requirements
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-yellow-800/50 rounded-lg p-6 backdrop-blur-sm border border-yellow-600/30 mb-6">
              <h3 className="text-xl font-bold mb-4">🏆 Achievements</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gameState.achievements.filter(a => a.unlocked).length > 0 ? (
                  gameState.achievements
                    .filter(a => a.unlocked)
                    .sort((a, b) => (b.claimed ? 0 : 1) - (a.claimed ? 0 : 1)) // Unclaimed first
                    .map(achievement => (
                      <div
                        key={achievement.id}
                        className={`p-2 rounded border transition-colors ${
                          achievement.claimed 
                            ? 'bg-gray-600/50 border-gray-500/30 opacity-60' 
                            : 'bg-yellow-700/50 border-yellow-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm flex items-center">
                              {achievement.claimed ? '✅' : '🏆'} {achievement.title}
                            </div>
                            <div className="text-xs text-yellow-200">{achievement.description}</div>
                            <div className="text-xs text-yellow-300">
                              Reward: {achievement.reward.type === 'rp' ? `${formatNumber(achievement.reward.amount)} RP` : 
                                       achievement.reward.type === 'legacy_points' ? `${formatNumber(achievement.reward.amount)} LP` : 
                                       'Multiplier Bonus'}
                            </div>
                          </div>
                          {!achievement.claimed && (
                            <button
                              onClick={() => claimAchievement(achievement.id)}
                              className="ml-2 bg-yellow-600 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold"
                            >
                              Claim
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center text-yellow-300 text-sm py-4">
                    No achievements unlocked yet. Keep playing to earn your first achievement!
                  </div>
                )}
                
                <div className="text-center text-xs text-yellow-400 mt-4">
                  {gameState.achievements.filter(a => a.unlocked).length} / {gameState.achievements.length} achievements unlocked
                </div>
              </div>
            </div>

            <div className="bg-orange-800/50 rounded-lg p-6 backdrop-blur-sm border border-orange-600/30 mb-6">
              <h3 className="text-xl font-bold mb-4">📋 Case Files</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getAvailableCases().length > 0 ? (
                  getAvailableCases().map(caseFile => (
                    <div
                      key={caseFile.id}
                      className="p-2 rounded border border-orange-500/30 bg-orange-700/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-sm flex items-center">
                            📁 {caseFile.title}
                            <span className={`ml-2 px-1 text-xs rounded ${
                              caseFile.difficulty === 'easy' ? 'bg-green-600' :
                              caseFile.difficulty === 'medium' ? 'bg-yellow-600' :
                              caseFile.difficulty === 'hard' ? 'bg-red-600' : 'bg-purple-600'
                            }`}>
                              {caseFile.difficulty.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-orange-200">{caseFile.description}</div>
                          <div className="text-xs text-green-300">
                            Reward: {formatNumber(caseFile.rewards.rp)} RP
                            {caseFile.timeLimit && ` • Time: ${caseFile.timeLimit}s`}
                          </div>
                        </div>
                        <button
                          onClick={() => startCase(caseFile)}
                          className="ml-2 bg-orange-600 hover:bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold"
                        >
                          Investigate
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-orange-300 text-sm py-4">
                    No cases available at your current rank. Complete more cases or advance your rank!
                  </div>
                )}
                
                <div className="text-center text-xs text-orange-400 mt-4">
                  {gameState.caseFiles.filter(c => c.completed).length} / {gameState.caseFiles.length} cases solved
                </div>
              </div>
            </div>

            <div className="bg-indigo-800/50 rounded-lg p-6 backdrop-blur-sm border border-indigo-600/30 mb-6">
              <h3 className="text-xl font-bold mb-4">⚔️ Equipment</h3>
              
              {/* Equipment Slots */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(gameState.equippedItems).map(([slotType, equippedItem]) => (
                  <div
                    key={slotType}
                    className="bg-indigo-700/50 border border-indigo-500/30 rounded p-2 text-center cursor-pointer hover:bg-indigo-600/50 transition-colors"
                    onClick={() => {
                      setSelectedEquipmentType(slotType as keyof EquipmentSlots);
                      setShowEquipmentModal(true);
                    }}
                  >
                    <div className="text-xs text-indigo-300 capitalize">{slotType}</div>
                    {equippedItem ? (
                      <div className="flex flex-col items-center">
                        <div className="text-lg">{equippedItem.icon}</div>
                        <div className="text-xs font-semibold truncate w-full">{equippedItem.name}</div>
                        <div className={`text-xs px-1 rounded ${
                          equippedItem.rarity === 'common' ? 'bg-gray-600' :
                          equippedItem.rarity === 'uncommon' ? 'bg-green-600' :
                          equippedItem.rarity === 'rare' ? 'bg-blue-600' :
                          equippedItem.rarity === 'epic' ? 'bg-purple-600' : 'bg-yellow-600'
                        }`}>
                          {equippedItem.rarity}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm py-2">Empty</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Equipment Bonuses Summary */}
              {(() => {
                const bonuses = getEquipmentBonuses();
                const hasAnyBonus = Object.values(bonuses).some(bonus => bonus > 0);
                return hasAnyBonus ? (
                  <div className="bg-indigo-900/50 rounded p-2 text-xs">
                    <div className="text-indigo-300 font-semibold mb-1">Equipment Bonuses:</div>
                    {bonuses.clickPower > 0 && <div>+{bonuses.clickPower} Click Power</div>}
                    {bonuses.passiveIncome > 0 && <div>+{bonuses.passiveIncome} Passive Income</div>}
                    {bonuses.caseSuccessRate > 0 && <div>+{bonuses.caseSuccessRate}% Case Success</div>}
                    {bonuses.upgradeCostReduction > 0 && <div>-{bonuses.upgradeCostReduction}% Upgrade Costs</div>}
                    {bonuses.eventChance > 0 && <div>+{bonuses.eventChance}% Event Chance</div>}
                  </div>
                ) : null;
              })()}

              {/* Equipment Collection Progress */}
              <div className="text-center text-xs text-indigo-400 mt-4">
                {gameState.equipment.filter(e => e.owned).length} / {gameState.equipment.length} equipment collected
              </div>
            </div>

            <div className="bg-blue-800/50 rounded-lg p-6 backdrop-blur-sm border border-blue-600/30">
              <h3 className="text-xl font-bold mb-4">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total RP:</span>
                  <span>{formatNumber(gameState.respectPoints)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Rank:</span>
                  <span>{gameState.rank}</span>
                </div>
                <div className="flex justify-between">
                  <span>Click Power:</span>
                  <span>{formatNumber(gameState.clickValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Passive Rank Gain:</span>
                  <span>{formatNumber(gameState.passiveIncome)}/sec</span>
                </div>
                <div className="flex justify-between">
                  <span>🔧 Equipment:</span>
                  <span>{gameState.upgrades.equipment.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>📚 Training:</span>
                  <span>{gameState.upgrades.training.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>👮 Partners:</span>
                  <span>{gameState.upgrades.partner.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>🚗 Patrol Units:</span>
                  <span>{gameState.upgrades.patrol.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>🔍 Investigations:</span>
                  <span>{gameState.upgrades.investigation.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>🏢 Precincts:</span>
                  <span>{gameState.upgrades.precinct.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>🤖 AI Systems:</span>
                  <span>{gameState.upgrades.automation.toString()}</span>
                </div>
                {gameState.legacyPoints.gt(0) && (
                  <>
                    <div className="border-t border-blue-500/30 pt-2 mt-2">
                      <div className="text-purple-200 font-semibold mb-1">Legacy Stats:</div>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Legacy Points:</span>
                      <span className="text-purple-300">{formatNumber(gameState.legacyPoints)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lifetime RP:</span>
                      <span>{formatNumber(gameState.totalRP)}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-4 space-y-4">
                {/* Sound Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-200">🔊 Sound Settings</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300">Master Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={gameState.soundSettings.masterVolume}
                        onChange={(e) => setGameState(prev => ({
                          ...prev,
                          soundSettings: {
                            ...prev.soundSettings,
                            masterVolume: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300">Sound Effects</label>
                      <button
                        onClick={() => setGameState(prev => ({
                          ...prev,
                          soundSettings: {
                            ...prev.soundSettings,
                            sfxEnabled: !prev.soundSettings.sfxEnabled
                          }
                        }))}
                        className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                          gameState.soundSettings.sfxEnabled 
                            ? 'bg-green-600 hover:bg-green-500 text-white' 
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                        }`}
                      >
                        {gameState.soundSettings.sfxEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300">Ambient Audio</label>
                      <button
                        onClick={() => setGameState(prev => ({
                          ...prev,
                          soundSettings: {
                            ...prev.soundSettings,
                            ambientEnabled: !prev.soundSettings.ambientEnabled
                          }
                        }))}
                        className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                          gameState.soundSettings.ambientEnabled 
                            ? 'bg-green-600 hover:bg-green-500 text-white' 
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                        }`}
                      >
                        {gameState.soundSettings.ambientEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300">Test Sound</label>
                      <button
                        onClick={() => playSound('achievement')}
                        className="px-2 py-1 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                      >
                        🔊 Test
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Theme Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-200">🎨 Theme Settings</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300">Theme Mode</label>
                      <select
                        value={gameState.themeSettings.theme}
                        onChange={(e) => setGameState(prev => ({
                          ...prev,
                          themeSettings: {
                            ...prev.themeSettings,
                            theme: e.target.value as 'light' | 'dark' | 'auto'
                          }
                        }))}
                        className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="space-y-1">
                        <label className="text-gray-400">Primary</label>
                        <input
                          type="color"
                          value={gameState.themeSettings.customColors.primary}
                          onChange={(e) => setGameState(prev => ({
                            ...prev,
                            themeSettings: {
                              ...prev.themeSettings,
                              customColors: {
                                ...prev.themeSettings.customColors,
                                primary: e.target.value
                              }
                            }
                          }))}
                          className="w-full h-6 rounded border border-gray-600 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400">Secondary</label>
                        <input
                          type="color"
                          value={gameState.themeSettings.customColors.secondary}
                          onChange={(e) => setGameState(prev => ({
                            ...prev,
                            themeSettings: {
                              ...prev.themeSettings,
                              customColors: {
                                ...prev.themeSettings.customColors,
                                secondary: e.target.value
                              }
                            }
                          }))}
                          className="w-full h-6 rounded border border-gray-600 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400">Accent</label>
                        <input
                          type="color"
                          value={gameState.themeSettings.customColors.accent}
                          onChange={(e) => setGameState(prev => ({
                            ...prev,
                            themeSettings: {
                              ...prev.themeSettings,
                              customColors: {
                                ...prev.themeSettings.customColors,
                                accent: e.target.value
                              }
                            }
                          }))}
                          className="w-full h-6 rounded border border-gray-600 cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300">Reset Theme</label>
                      <button
                        onClick={() => setGameState(prev => ({
                          ...prev,
                          themeSettings: {
                            theme: 'dark',
                            customColors: {
                              primary: '#3b82f6',
                              secondary: '#1e40af',
                              accent: '#fbbf24'
                            }
                          }
                        }))}
                        className="px-2 py-1 rounded text-xs font-semibold bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Save Management */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-200">💾 Save Management</h4>
                  
                  <div className="space-y-2">
                    <button
                      onClick={exportSave}
                      className="w-full p-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold transition-colors"
                    >
                      📤 Export Save
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="w-full p-2 bg-purple-600 hover:bg-purple-500 rounded text-sm font-semibold transition-colors"
                    >
                      📥 Import Save
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowStatsModal(true)}
                  className="w-full p-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-semibold transition-colors"
                >
                  📊 Statistics
                </button>
                <button
                  onClick={saveGame}
                  className="w-full p-2 bg-green-600 hover:bg-green-500 rounded text-sm font-semibold transition-colors"
                >
                  💾 Save Game
                </button>
                <button
                  onClick={() => {
                    setGameState(prev => ({
                      ...prev,
                      respectPoints: new Decimal("1e15")
                    }));
                  }}
                  className="w-full p-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm font-semibold transition-colors"
                >
                  🧪 Test Big Numbers
                </button>
                <button
                  onClick={resetGame}
                  className="w-full p-2 bg-red-600 hover:bg-red-500 rounded text-sm font-semibold transition-colors"
                >
                  🔄 Reset Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Modal */}
      {showCaseModal && currentCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-blue-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-600">
            {!caseResult ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">{currentCase.title}</h2>
                  <div className="text-yellow-300 font-bold">
                    ⏱️ {caseTimeLeft}s
                  </div>
                </div>
                
                <div className="text-blue-200 mb-4">{currentCase.description}</div>
                <div className="text-white mb-6">{currentCase.question}</div>
                
                {currentCase.type === 'multiple_choice' || currentCase.type === 'evidence' ? (
                  <div className="space-y-2 mb-6">
                    {currentCase.options?.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setUserAnswer(index)}
                        className={`w-full text-left p-3 rounded border transition-colors ${
                          userAnswer === index
                            ? 'bg-blue-600 border-blue-400'
                            : 'bg-blue-800/50 border-blue-600/50 hover:bg-blue-700/50'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    ))}
                  </div>
                ) : currentCase.type === 'sequence' && (
                  <div className="mb-6">
                    <div className="text-sm text-blue-300 mb-2">Click options in the correct order:</div>
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      {currentCase.options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (sequenceAnswer.includes(index)) {
                              setSequenceAnswer(sequenceAnswer.filter(i => i !== index));
                            } else {
                              setSequenceAnswer([...sequenceAnswer, index]);
                            }
                          }}
                          className={`text-left p-3 rounded border transition-colors ${
                            sequenceAnswer.includes(index)
                              ? 'bg-blue-600 border-blue-400'
                              : 'bg-blue-800/50 border-blue-600/50 hover:bg-blue-700/50'
                          }`}
                        >
                          {sequenceAnswer.includes(index) && (
                            <span className="text-yellow-300 font-bold mr-2">
                              {sequenceAnswer.indexOf(index) + 1}.
                            </span>
                          )}
                          {option}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-blue-300">
                      Selected order: {sequenceAnswer.map(i => currentCase.options?.[i]).join(' → ')}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setShowCaseModal(false);
                      setCurrentCase(null);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitCaseAnswer}
                    disabled={currentCase.type === 'sequence' && sequenceAnswer.length !== currentCase.options?.length}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white font-semibold"
                  >
                    Submit Answer
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className={`text-2xl font-bold mb-4 ${caseResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {caseResult.success ? '✅ Case Solved!' : '❌ Case Failed!'}
                </div>
                <div className="text-white mb-4">{caseResult.explanation}</div>
                {caseResult.success && (
                  <div className="text-green-300 font-semibold">
                    Reward: {formatNumber(currentCase.rewards.rp)} RP
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && selectedEquipmentType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-indigo-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-indigo-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white capitalize">{selectedEquipmentType} Equipment</h2>
              <button
                onClick={() => {
                  setShowEquipmentModal(false);
                  setSelectedEquipmentType(null);
                }}
                className="text-gray-300 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Currently Equipped */}
            {gameState.equippedItems[selectedEquipmentType] && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-indigo-300 mb-2">Currently Equipped:</h3>
                <div className="bg-indigo-800/50 border border-indigo-500/30 rounded p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{gameState.equippedItems[selectedEquipmentType]!.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold">{gameState.equippedItems[selectedEquipmentType]!.name}</div>
                      <div className="text-sm text-indigo-200">{gameState.equippedItems[selectedEquipmentType]!.description}</div>
                      <div className="text-xs text-indigo-300">
                        {Object.entries(gameState.equippedItems[selectedEquipmentType]!.effects).map(([effect, value]) => 
                          value ? <span key={effect} className="mr-2">+{value} {effect.replace(/([A-Z])/g, ' $1').toLowerCase()}</span> : null
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => unequipItem(selectedEquipmentType)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                    >
                      Unequip
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Available Equipment */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-indigo-300 mb-2">Available Equipment:</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getAvailableEquipment(selectedEquipmentType).length > 0 ? (
                  getAvailableEquipment(selectedEquipmentType).map(item => (
                    <div
                      key={item.id}
                      className="bg-indigo-800/50 border border-indigo-500/30 rounded p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{item.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2">
                            {item.name}
                            <span className={`text-xs px-1 rounded ${
                              item.rarity === 'common' ? 'bg-gray-600' :
                              item.rarity === 'uncommon' ? 'bg-green-600' :
                              item.rarity === 'rare' ? 'bg-blue-600' :
                              item.rarity === 'epic' ? 'bg-purple-600' : 'bg-yellow-600'
                            }`}>
                              {item.rarity}
                            </span>
                          </div>
                          <div className="text-sm text-indigo-200">{item.description}</div>
                          <div className="text-xs text-green-300">
                            {Object.entries(item.effects).map(([effect, value]) => 
                              value ? <span key={effect} className="mr-2">+{value} {effect.replace(/([A-Z])/g, ' $1').toLowerCase()}</span> : null
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => equipItem(item.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-sm"
                        >
                          Equip
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-indigo-300 text-sm py-4">
                    No {selectedEquipmentType} equipment available. Find more equipment through gameplay!
                  </div>
                )}
              </div>
            </div>

            {/* All Equipment Collection */}
            <div>
              <h3 className="text-lg font-semibold text-indigo-300 mb-2">Collection ({selectedEquipmentType}):</h3>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {gameState.equipment
                  .filter(item => item.type === selectedEquipmentType)
                  .map(item => (
                    <div
                      key={item.id}
                      className={`border rounded p-2 text-xs ${
                        item.owned 
                          ? 'bg-indigo-700/50 border-indigo-500/30' 
                          : 'bg-gray-700/50 border-gray-600/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-base">{item.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{item.name}</div>
                          <div className={`text-xs px-1 rounded ${
                            item.rarity === 'common' ? 'bg-gray-600' :
                            item.rarity === 'uncommon' ? 'bg-green-600' :
                            item.rarity === 'rare' ? 'bg-blue-600' :
                            item.rarity === 'epic' ? 'bg-purple-600' : 'bg-yellow-600'
                          }`}>
                            {item.rarity}
                          </div>
                          {!item.owned && canUnlockEquipment(item) && (
                            <div className="text-yellow-300 text-xs">Available to find</div>
                          )}
                          {!item.owned && !canUnlockEquipment(item) && (
                            <div className="text-red-300 text-xs">Requires {item.unlockRank}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-600">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">📊 Statistics & Analytics</h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Core Performance Metrics */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-blue-400 mb-3">🎯 Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Clicks:</span>
                    <span className="text-white font-semibold">{formatNumber(gameState.statistics.totalClicks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total RP Earned:</span>
                    <span className="text-green-400 font-semibold">{formatNumber(gameState.statistics.totalRPEarned)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total RP Spent:</span>
                    <span className="text-red-400 font-semibold">{formatNumber(gameState.statistics.totalRPSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Net Worth:</span>
                    <span className="text-yellow-400 font-semibold">{formatNumber(gameState.statistics.totalRPEarned.sub(gameState.statistics.totalRPSpent))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Click Efficiency:</span>
                    <span className="text-blue-400 font-semibold">
                      {gameState.statistics.totalClicks.gt(0) 
                        ? formatNumber(gameState.statistics.totalRPEarned.div(gameState.statistics.totalClicks))
                        : '0'} RP/click
                    </span>
                  </div>
                </div>
              </div>

              {/* Progression Metrics */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-green-400 mb-3">📈 Progression</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Current Rank:</span>
                    <span className="text-yellow-400 font-semibold">{gameState.rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Upgrades Purchased:</span>
                    <span className="text-white font-semibold">{formatNumber(gameState.statistics.totalUpgradesPurchased)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cases Solved:</span>
                    <span className="text-blue-400 font-semibold">{formatNumber(gameState.statistics.totalCasesSolved)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Achievements:</span>
                    <span className="text-purple-400 font-semibold">{formatNumber(gameState.statistics.totalAchievementsUnlocked)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Prestiges:</span>
                    <span className="text-orange-400 font-semibold">{formatNumber(gameState.statistics.totalPrestigeCount)}</span>
                  </div>
                </div>
              </div>

              {/* Session Statistics */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-purple-400 mb-3">⏱️ Sessions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sessions Played:</span>
                    <span className="text-white font-semibold">{formatNumber(gameState.statistics.sessionsPlayed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Play Time:</span>
                    <span className="text-blue-400 font-semibold">
                      {Math.floor(gameState.playTime / 3600)}h {Math.floor((gameState.playTime % 3600) / 60)}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">First Played:</span>
                    <span className="text-gray-400 font-semibold">
                      {new Date(gameState.statistics.firstPlayDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Last Played:</span>
                    <span className="text-gray-400 font-semibold">
                      {new Date(gameState.statistics.lastPlayDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Avg Session:</span>
                    <span className="text-green-400 font-semibold">
                      {gameState.statistics.averageSessionLength > 0 
                        ? `${Math.floor(gameState.statistics.averageSessionLength / 60)}m ${gameState.statistics.averageSessionLength % 60}s`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Efficiency Analysis */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 md:col-span-2">
                <h3 className="text-lg font-bold text-orange-400 mb-3">🚀 Efficiency Analysis</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-300 mb-2">Current Income Breakdown:</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Click Value:</span>
                        <span className="text-white">{formatNumber(gameState.clickValue)} RP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Passive Income:</span>
                        <span className="text-green-400">{formatNumber(gameState.passiveIncome)} RP/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Passive vs Click Ratio:</span>
                        <span className="text-blue-400">
                          {gameState.clickValue.gt(0) 
                            ? `${gameState.passiveIncome.div(gameState.clickValue).toFixed(2)}:1`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-300 mb-2">Optimization Insights:</div>
                    <div className="space-y-1 text-xs">
                      {gameState.passiveIncome.div(gameState.clickValue).lt(10) && (
                        <div className="text-yellow-400">💡 Consider investing in passive income generators</div>
                      )}
                      {gameState.statistics.totalCasesSolved.lt(5) && (
                        <div className="text-blue-400">🔍 Try solving more cases for bonus rewards</div>
                      )}
                      {gameState.statistics.totalUpgradesPurchased.lt(20) && (
                        <div className="text-green-400">⬆️ More upgrades = better progression</div>
                      )}
                      {gameState.legacyPoints.gt(0) && gameState.statistics.totalPrestigeCount.eq(0) && (
                        <div className="text-purple-400">🔄 Consider your first prestige for permanent bonuses</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Progress */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-bold text-yellow-400 mb-3">🏆 Achievements</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Completion Rate:</span>
                    <span className="text-yellow-400 font-semibold">
                      {((gameState.achievements.filter(a => a.unlocked).length / gameState.achievements.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(gameState.achievements.filter(a => a.unlocked).length / gameState.achievements.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {gameState.achievements.filter(a => a.unlocked).length} / {gameState.achievements.length} unlocked
                  </div>
                  <div className="text-gray-400 text-xs">
                    {gameState.achievements.filter(a => a.claimed).length} / {gameState.achievements.filter(a => a.unlocked).length} claimed
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Save Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-gray-600">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-white">📥 Import Save Data</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                }}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Save Data:
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your exported save data here..."
                  className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
              
              <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3">
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2">⚠️</span>
                  <div className="text-yellow-200 text-sm">
                    <strong>Warning:</strong> Importing save data will completely replace your current progress. 
                    Make sure to export your current save first if you want to keep it.
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData('');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={importSave}
                  disabled={!importData.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white font-semibold transition-colors"
                >
                  Import Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Mobile-specific improvements */
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          /* Improve touch targets for mobile */
          button {
            min-height: 44px;
          }
          
          /* Prevent zoom on input focus */
          input, select, textarea {
            font-size: 16px;
          }
          
          /* Better spacing for mobile modals */
          .modal-content {
            margin: 1rem;
            max-height: 90vh;
            overflow-y: auto;
          }
        }
        
        /* Prevent horizontal scroll on mobile */
        body {
          overflow-x: hidden;
        }
        
        @keyframes fadeUpOut {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
        
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          25% {
            transform: translateY(-15px) scale(1.1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.8);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.3);
          }
        }
        
        /* Theme transition styles */
        * {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        
        /* Custom scrollbar for dark theme */
        .theme-dark ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .theme-dark ::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }
        
        .theme-dark ::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }
        
        .theme-dark ::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
        
        /* Custom scrollbar for light theme */
        .theme-light ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .theme-light ::-webkit-scrollbar-track {
          background: var(--bg-tertiary);
        }
        
        .theme-light ::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }
        
        .theme-light ::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
