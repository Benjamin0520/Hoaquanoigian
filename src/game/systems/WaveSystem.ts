import { WAVES } from '../constants';
import { WaveConfig, WaveSpawnItem, EnemyType } from '../types';

export class WaveSystem {
  public currentWaveIndex: number = 0;
  public waveTimer: number = 0;
  public isWarningActive: boolean = false;
  public warningTimer: number = 0;
  public warningMessage: string = '';
  
  public isAllWavesCompleted: boolean = false;
  public intermissionTimer: number = 0;
  public isIntermission: boolean = false;

  private currentWaveConfig: WaveConfig;
  private pendingSpawns: WaveSpawnItem[] = [];
  private totalEnemiesInWave: number = 0;
  private enemiesSpawnedThisWave: number = 0;
  private enemiesDefeatedThisWave: number = 0;

  constructor() {
    this.currentWaveConfig = WAVES[0];
    this.reset();
  }

  public reset() {
    this.currentWaveIndex = 0;
    this.isAllWavesCompleted = false;
    this.isIntermission = false;
    this.intermissionTimer = 0;
    this.isWarningActive = false;
    this.startWave(0);
  }

  public getCurrentWaveNumber(): number {
    return this.currentWaveIndex + 1;
  }

  public getTotalWaves(): number {
    return WAVES.length;
  }

  public getCurrentWaveConfig(): WaveConfig {
    return this.currentWaveConfig;
  }

  private startWave(waveIndex: number) {
    this.currentWaveIndex = waveIndex;
    this.currentWaveConfig = WAVES[waveIndex];
    this.waveTimer = 0;
    this.pendingSpawns = [...this.currentWaveConfig.spawns].sort((a, b) => a.delaySec - b.delaySec);
    this.totalEnemiesInWave = this.pendingSpawns.length;
    this.enemiesSpawnedThisWave = 0;
    this.enemiesDefeatedThisWave = 0;
    this.isIntermission = false;

    if (this.currentWaveConfig.isLargeWave) {
      this.isWarningActive = true;
      this.warningTimer = 3.2; // Show alert banner for 3.2s
      this.warningMessage = this.currentWaveConfig.message || 'A LARGE WAVE IS APPROACHING!';
    } else {
      this.isWarningActive = false;
      this.warningTimer = 0;
    }
  }

  // Returns enemy to spawn, or null
  public update(dt: number, activeEnemyCount: number): { type: EnemyType; lane: number; isLargeWaveAlert: boolean } | null {
    if (this.isAllWavesCompleted) return null;

    let triggeredAlert = false;

    // Warning banner timer
    if (this.isWarningActive) {
      this.warningTimer -= dt;
      if (this.warningTimer <= 0) {
        this.isWarningActive = false;
      }
    }

    // Intermission between waves
    if (this.isIntermission) {
      this.intermissionTimer -= dt;
      if (this.intermissionTimer <= 0) {
        if (this.currentWaveIndex + 1 < WAVES.length) {
          this.startWave(this.currentWaveIndex + 1);
          if (this.currentWaveConfig.isLargeWave) {
            triggeredAlert = true;
          }
        } else {
          this.isAllWavesCompleted = true;
        }
      }
      return null;
    }

    this.waveTimer += dt;

    // Check if next enemy is ready to spawn
    if (this.pendingSpawns.length > 0) {
      const nextSpawn = this.pendingSpawns[0];
      if (this.waveTimer >= nextSpawn.delaySec) {
        this.pendingSpawns.shift();
        this.enemiesSpawnedThisWave++;

        // Random lane 0-4 unless designated
        const lane = nextSpawn.lane !== undefined ? nextSpawn.lane : Math.floor(Math.random() * 5);
        return {
          type: nextSpawn.enemyType,
          lane,
          isLargeWaveAlert: triggeredAlert,
        };
      }
    }

    // If all spawned and no active enemies remain, complete the wave
    if (this.pendingSpawns.length === 0 && activeEnemyCount === 0 && this.enemiesSpawnedThisWave >= this.totalEnemiesInWave) {
      if (this.currentWaveIndex + 1 >= WAVES.length) {
        this.isAllWavesCompleted = true;
      } else {
        // Start intermission before next wave
        this.isIntermission = true;
        this.intermissionTimer = 4.0; // 4 seconds peaceful breather
      }
    }

    return null;
  }

  public notifyEnemyKilled() {
    this.enemiesDefeatedThisWave++;
  }

  // Computes progress from 0.0 to 1.0 for the current wave progress bar
  public getWaveProgress(): number {
    if (this.totalEnemiesInWave === 0) return 1.0;
    // 50% based on spawns, 50% based on defeats
    const spawnRatio = Math.min(1.0, this.enemiesSpawnedThisWave / this.totalEnemiesInWave);
    const killRatio = Math.min(1.0, this.enemiesDefeatedThisWave / this.totalEnemiesInWave);
    return Math.min(1.0, spawnRatio * 0.4 + killRatio * 0.6);
  }
}
