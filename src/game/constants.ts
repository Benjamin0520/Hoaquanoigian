import { PlantConfig, EnemyConfig, WaveConfig } from './types';

// Virtual resolution
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

// Grid layout
export const GRID_ROWS = 5;
export const GRID_COLS = 9;
export const GRID_X = 240;
export const GRID_Y = 110;
export const CELL_WIDTH = 100;
export const CELL_HEIGHT = 115;

// Lawn mower position
export const MOWER_X = 160;
export const MOWER_SPEED = 750; // px/sec

// Resource balance
export const INITIAL_SUN = 150;
export const SUN_VALUE = 25;
export const SKY_SUN_MIN_INTERVAL = 6.5; // seconds
export const SKY_SUN_MAX_INTERVAL = 10.0;
export const SUN_LIFETIME = 11.0; // seconds before fading

// Plant configurations
export const PLANT_CONFIGS: Record<string, PlantConfig> = {
  'solar-bloom': {
    type: 'solar-bloom',
    name: 'Solar Bloom',
    cost: 50,
    hp: 300,
    cooldown: 7.5,
    description: 'Generates 25 Sun Energy periodically.',
  },
  'seed-shooter': {
    type: 'seed-shooter',
    name: 'Seed Shooter',
    cost: 100,
    hp: 300,
    cooldown: 7.5,
    shootInterval: 1.4,
    attackDamage: 20,
    description: 'Fires botanical seeds at enemies in its lane.',
  },
  'double-shooter': {
    type: 'double-shooter',
    name: 'Double Shooter',
    cost: 175,
    hp: 300,
    cooldown: 7.5,
    shootInterval: 1.4,
    attackDamage: 20,
    description: 'Fires two rapid seeds per volley.',
  },
  'stone-root': {
    type: 'stone-root',
    name: 'Stone Root',
    cost: 75,
    hp: 4000,
    cooldown: 22.0,
    description: 'High HP barrier to block and delay incoming enemies.',
  },
  'frost-flower': {
    type: 'frost-flower',
    name: 'Frost Flower',
    cost: 150,
    hp: 300,
    cooldown: 7.5,
    shootInterval: 1.5,
    attackDamage: 20,
    description: 'Shoots icy shards that damage and slow enemies by 50%.',
  },
};

// Enemy configurations
export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  'walker': {
    type: 'walker',
    name: 'Walker',
    hp: 200,
    speed: 24, // px/sec
    damage: 25,
    attackInterval: 0.5, // bites every 0.5s = 50 DPS
    scoreValue: 100,
  },
  'runner': {
    type: 'runner',
    name: 'Runner',
    hp: 130,
    speed: 55, // fast!
    damage: 20,
    attackInterval: 0.4,
    scoreValue: 150,
  },
  'tank': {
    type: 'tank',
    name: 'Tank Brute',
    hp: 850,
    speed: 15, // slow
    damage: 40,
    attackInterval: 0.6,
    scoreValue: 300,
  },
  'helmet': {
    type: 'helmet',
    name: 'Helmet Fiend',
    hp: 200,
    armorHp: 380, // absorbs 380 before HP drops
    speed: 22,
    damage: 25,
    attackInterval: 0.5,
    scoreValue: 250,
  },
};

// 10 Balanced Waves
export const WAVES: WaveConfig[] = [
  // Wave 1: Gentle tutorial, 3 walkers spaced out
  {
    waveNumber: 1,
    isLargeWave: false,
    message: 'Wave 1: Scout Approaching!',
    spawns: [
      { enemyType: 'walker', delaySec: 6.0, lane: 2 },
      { enemyType: 'walker', delaySec: 18.0 },
      { enemyType: 'walker', delaySec: 30.0 },
    ],
  },
  // Wave 2: Intro to lane variety
  {
    waveNumber: 2,
    isLargeWave: false,
    message: 'Wave 2: More Monsters Sighted',
    spawns: [
      { enemyType: 'walker', delaySec: 4.0 },
      { enemyType: 'walker', delaySec: 14.0 },
      { enemyType: 'walker', delaySec: 22.0 },
      { enemyType: 'walker', delaySec: 30.0 },
    ],
  },
  // Wave 3: Runner introduced
  {
    waveNumber: 3,
    isLargeWave: false,
    message: 'Wave 3: Fast Enemies Detected!',
    spawns: [
      { enemyType: 'walker', delaySec: 3.0 },
      { enemyType: 'runner', delaySec: 12.0 },
      { enemyType: 'walker', delaySec: 18.0 },
      { enemyType: 'runner', delaySec: 26.0 },
      { enemyType: 'walker', delaySec: 32.0 },
    ],
  },
  // Wave 4: Helmet enemy introduced
  {
    waveNumber: 4,
    isLargeWave: false,
    message: 'Wave 4: Armored Fiends Approaching',
    spawns: [
      { enemyType: 'walker', delaySec: 3.0 },
      { enemyType: 'helmet', delaySec: 10.0 },
      { enemyType: 'runner', delaySec: 18.0 },
      { enemyType: 'walker', delaySec: 24.0 },
      { enemyType: 'helmet', delaySec: 30.0 },
      { enemyType: 'walker', delaySec: 36.0 },
    ],
  },
  // Wave 5: First Huge Wave!
  {
    waveNumber: 5,
    isLargeWave: true,
    message: 'A HUGE WAVE OF MONSTERS IS APPROACHING!',
    spawns: [
      { enemyType: 'walker', delaySec: 2.0, lane: 0 },
      { enemyType: 'walker', delaySec: 2.5, lane: 2 },
      { enemyType: 'walker', delaySec: 3.0, lane: 4 },
      { enemyType: 'runner', delaySec: 7.0 },
      { enemyType: 'helmet', delaySec: 10.0 },
      { enemyType: 'runner', delaySec: 14.0 },
      { enemyType: 'helmet', delaySec: 18.0 },
      { enemyType: 'walker', delaySec: 22.0 },
      { enemyType: 'runner', delaySec: 25.0 },
      { enemyType: 'walker', delaySec: 28.0 },
    ],
  },
  // Wave 6: Tank introduced
  {
    waveNumber: 6,
    isLargeWave: false,
    message: 'Wave 6: Heavy Brutes Spotted!',
    spawns: [
      { enemyType: 'tank', delaySec: 4.0 },
      { enemyType: 'runner', delaySec: 12.0 },
      { enemyType: 'walker', delaySec: 18.0 },
      { enemyType: 'helmet', delaySec: 24.0 },
      { enemyType: 'walker', delaySec: 30.0 },
      { enemyType: 'runner', delaySec: 35.0 },
    ],
  },
  // Wave 7: Mixed pressure
  {
    waveNumber: 7,
    isLargeWave: false,
    message: 'Wave 7: The Swarm Grows',
    spawns: [
      { enemyType: 'helmet', delaySec: 3.0 },
      { enemyType: 'runner', delaySec: 8.0 },
      { enemyType: 'tank', delaySec: 15.0 },
      { enemyType: 'runner', delaySec: 20.0 },
      { enemyType: 'walker', delaySec: 25.0 },
      { enemyType: 'helmet', delaySec: 30.0 },
      { enemyType: 'tank', delaySec: 36.0 },
    ],
  },
  // Wave 8: High intensity runner assault
  {
    waveNumber: 8,
    isLargeWave: false,
    message: 'Wave 8: Speed Attack!',
    spawns: [
      { enemyType: 'runner', delaySec: 2.0 },
      { enemyType: 'runner', delaySec: 5.0 },
      { enemyType: 'tank', delaySec: 10.0 },
      { enemyType: 'helmet', delaySec: 15.0 },
      { enemyType: 'runner', delaySec: 20.0 },
      { enemyType: 'helmet', delaySec: 25.0 },
      { enemyType: 'tank', delaySec: 28.0 },
      { enemyType: 'runner', delaySec: 34.0 },
      { enemyType: 'walker', delaySec: 38.0 },
    ],
  },
  // Wave 9: Heavy fortification test
  {
    waveNumber: 9,
    isLargeWave: false,
    message: 'Wave 9: Iron Vanguard',
    spawns: [
      { enemyType: 'tank', delaySec: 2.0 },
      { enemyType: 'helmet', delaySec: 6.0 },
      { enemyType: 'helmet', delaySec: 12.0 },
      { enemyType: 'tank', delaySec: 18.0 },
      { enemyType: 'runner', delaySec: 22.0 },
      { enemyType: 'runner', delaySec: 26.0 },
      { enemyType: 'helmet', delaySec: 30.0 },
      { enemyType: 'walker', delaySec: 34.0 },
      { enemyType: 'tank', delaySec: 38.0 },
    ],
  },
  // Wave 10: Final Massive Wave
  {
    waveNumber: 10,
    isLargeWave: true,
    message: 'FINAL WAVE! PROTECT THE GARDEN AT ALL COSTS!',
    spawns: [
      // Wave front
      { enemyType: 'tank', delaySec: 2.0, lane: 1 },
      { enemyType: 'tank', delaySec: 3.0, lane: 3 },
      { enemyType: 'walker', delaySec: 3.5, lane: 0 },
      { enemyType: 'walker', delaySec: 4.0, lane: 2 },
      { enemyType: 'walker', delaySec: 4.5, lane: 4 },
      // Fast runners
      { enemyType: 'runner', delaySec: 8.0 },
      { enemyType: 'runner', delaySec: 10.0 },
      { enemyType: 'runner', delaySec: 12.0 },
      // Heavy helmet brigade
      { enemyType: 'helmet', delaySec: 16.0 },
      { enemyType: 'helmet', delaySec: 18.0 },
      { enemyType: 'helmet', delaySec: 21.0 },
      { enemyType: 'tank', delaySec: 24.0 },
      // Final swarm
      { enemyType: 'runner', delaySec: 27.0 },
      { enemyType: 'runner', delaySec: 30.0 },
      { enemyType: 'helmet', delaySec: 33.0 },
      { enemyType: 'walker', delaySec: 36.0 },
    ],
  },
];
