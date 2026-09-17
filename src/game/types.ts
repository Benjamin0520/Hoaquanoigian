export type GameState = 
  | 'START'
  | 'PLAYING'
  | 'PAUSED'
  | 'WAVE_WARNING'
  | 'VICTORY'
  | 'GAME_OVER';

export type PlantType = 
  | 'solar-bloom'
  | 'seed-shooter'
  | 'double-shooter'
  | 'stone-root'
  | 'frost-flower';

export type EnemyType = 
  | 'walker'
  | 'runner'
  | 'tank'
  | 'helmet';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlantConfig {
  type: PlantType;
  name: string;
  cost: number;
  hp: number;
  cooldown: number; // seconds
  description: string;
  shootInterval?: number;
  attackDamage?: number;
}

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  hp: number;
  armorHp?: number;
  speed: number; // pixels per second
  damage: number; // damage per bite
  attackInterval: number; // seconds per bite
  scoreValue: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  rotation?: number;
  vRot?: number;
  type?: 'circle' | 'leaf' | 'spark' | 'snow' | 'rock';
}

export interface DamageText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
}

export interface WaveSpawnItem {
  enemyType: EnemyType;
  delaySec: number; // Delay in seconds from start of wave
  lane?: number; // Optional forced lane (0-4), else random
}

export interface WaveConfig {
  waveNumber: number;
  isLargeWave: boolean;
  message?: string;
  spawns: WaveSpawnItem[];
}
