import { GRID_ROWS } from '../constants';
import { Plant } from '../entities/Plant';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { Mower } from '../entities/Mower';
import { ParticleSystem } from './ParticleSystem';
import { SoundSystem } from '../audio/SoundSystem';
import { WaveSystem } from './WaveSystem';

export class CombatSystem {
  private particles: ParticleSystem;
  private sound: SoundSystem;
  private waveSystem: WaveSystem;

  constructor(particles: ParticleSystem, sound: SoundSystem, waveSystem: WaveSystem) {
    this.particles = particles;
    this.sound = sound;
    this.waveSystem = waveSystem;
  }

  // Returns true if an enemy has breached the house porch and caused Game Over
  public update(
    plants: Plant[],
    enemies: Enemy[],
    projectiles: Projectile[],
    mowers: (Mower | null)[]
  ): { gameOverBreach: boolean; enemiesKilledCount: number; scoreEarned: number } {
    let gameOverBreach = false;
    let enemiesKilledCount = 0;
    let scoreEarned = 0;

    // 1. Partition entities by lane for O(N) lane-based collision checks
    const enemiesByLane: Enemy[][] = Array.from({ length: GRID_ROWS }, () => []);
    const projectilesByLane: Projectile[][] = Array.from({ length: GRID_ROWS }, () => []);
    const plantsByLane: Plant[][] = Array.from({ length: GRID_ROWS }, () => []);

    for (const e of enemies) {
      if (e.active && !e.isDying && e.lane >= 0 && e.lane < GRID_ROWS) {
        enemiesByLane[e.lane].push(e);
      }
    }

    for (const p of projectiles) {
      if (p.active && p.lane >= 0 && p.lane < GRID_ROWS) {
        projectilesByLane[p.lane].push(p);
      }
    }

    for (const pl of plants) {
      if (pl.active && pl.lane >= 0 && pl.lane < GRID_ROWS) {
        plantsByLane[pl.lane].push(pl);
      }
    }

    // 2. Projectiles vs Enemies (lane-partitioned)
    for (let lane = 0; lane < GRID_ROWS; lane++) {
      const laneProjectiles = projectilesByLane[lane];
      const laneEnemies = enemiesByLane[lane];

      for (const proj of laneProjectiles) {
        if (!proj.active) continue;

        // Find the frontmost (leftmost) enemy that this projectile has reached
        let hitEnemy: Enemy | null = null;
        let minX = Infinity;

        for (const enemy of laneEnemies) {
          if (!enemy.active || enemy.isDying) continue;
          // Hit check: projectile x has reached enemy body
          if (proj.x >= enemy.x - 25 && proj.x <= enemy.x + 35) {
            if (enemy.x < minX) {
              minX = enemy.x;
              hitEnemy = enemy;
            }
          }
        }

        if (hitEnemy) {
          proj.active = false;
          const damageResult = hitEnemy.takeDamage(proj.damage, proj.isFrost);

          // Audio & Particle FX
          this.sound.playHit();

          if (proj.isFrost) {
            // Ice crystal burst
            this.particles.emitBurst(proj.x, proj.y, '#38bdf8', 10, 140, 4, 'snow');
            this.particles.addFloatingText(hitEnemy.x, hitEnemy.y - 25, `-${proj.damage}`, '#7dd3fc', 1.0);
          } else {
            // Green leaf / botanical spark
            this.particles.emitBurst(proj.x, proj.y, '#86efac', 7, 120, 3, 'leaf');
            this.particles.addFloatingText(hitEnemy.x, hitEnemy.y - 25, `-${proj.damage}`, '#ffffff', 1.0);
          }

          // Did helmet armor break?
          if (damageResult.armorBroke) {
            this.sound.playHit();
            this.particles.emitBurst(hitEnemy.x, hitEnemy.y - 30, '#f59e0b', 16, 180, 5, 'rock');
            this.particles.addFloatingText(hitEnemy.x, hitEnemy.y - 45, 'ARMOR BROKE!', '#f59e0b', 1.2);
          }

          // Did enemy die?
          if (damageResult.died) {
            this.particles.emitBurst(hitEnemy.x, hitEnemy.y, '#84cc16', 18, 160, 5, 'circle');
            this.waveSystem.notifyEnemyKilled();
            enemiesKilledCount++;
            scoreEarned += hitEnemy.scoreValue;
          }
        }
      }
    }

    // 3. Enemies vs Plants (eating / chewing)
    for (let lane = 0; lane < GRID_ROWS; lane++) {
      const laneEnemies = enemiesByLane[lane];
      const lanePlants = plantsByLane[lane];

      for (const enemy of laneEnemies) {
        if (!enemy.active || enemy.isDying) continue;

        // If enemy is currently attacking a plant that died, resume walking
        if (enemy.isAttacking) {
          if (!enemy.targetPlant || !enemy.targetPlant.active || enemy.targetPlant.hp <= 0) {
            enemy.isAttacking = false;
            enemy.targetPlant = null;
          } else {
            // Play crunch sound periodically
            if (enemy.attackTimer === 0) {
              this.sound.playCrunch();
              this.particles.emitBurst(enemy.targetPlant.x + 15, enemy.targetPlant.y, '#4ade80', 3, 60, 3, 'leaf');
            }
          }
          continue;
        }

        // If not attacking, search for a plant directly in front of this enemy
        for (const plant of lanePlants) {
          if (!plant.active || plant.hp <= 0) continue;
          // Enemy is walking left, touches plant
          if (enemy.x > plant.x - 15 && enemy.x < plant.x + 40) {
            enemy.isAttacking = true;
            enemy.targetPlant = plant;
            enemy.attackTimer = 0; // Immediate first bite
            plant.damage(enemy.damagePerBite);
            this.sound.playCrunch();
            this.particles.emitBurst(plant.x + 10, plant.y, '#4ade80', 4, 70, 3, 'leaf');
            break;
          }
        }
      }
    }

    // 4. Enemies vs Emergency Lawn Mowers
    for (let lane = 0; lane < GRID_ROWS; lane++) {
      const mower = mowers[lane];
      const laneEnemies = enemiesByLane[lane];

      if (mower && mower.active) {
        // Check if idle mower is touched by an approaching enemy
        if (!mower.isTriggered) {
          for (const enemy of laneEnemies) {
            if (!enemy.active || enemy.isDying) continue;
            if (enemy.x <= mower.x + 40) {
              mower.trigger();
              this.sound.playMower();
              this.particles.emitBurst(mower.x, mower.y, '#ea580c', 20, 200, 5, 'spark');
              this.particles.addFloatingText(mower.x + 20, mower.y - 20, 'ROBO-CUTTER ENGAGED!', '#f97316', 1.2);
              break;
            }
          }
        }

        // If mower is rolling, it crushes all enemies in its path
        if (mower.isTriggered) {
          for (const enemy of laneEnemies) {
            if (!enemy.active || enemy.isDying) continue;
            if (enemy.x <= mower.x + 55 && enemy.x >= mower.x - 40) {
              enemy.hp = 0;
              enemy.isDying = true;
              this.waveSystem.notifyEnemyKilled();
              enemiesKilledCount++;
              scoreEarned += enemy.scoreValue;
              this.particles.emitBurst(enemy.x, enemy.y, '#ef4444', 24, 220, 6, 'circle');
              this.particles.addFloatingText(enemy.x, enemy.y - 20, 'SQUISH!', '#ef4444', 1.2);
            }
          }
        }
      }

      // 5. Check if any enemy reached the house porch without a defending mower
      for (const enemy of laneEnemies) {
        if (!enemy.active || enemy.isDying) continue;
        // The house porch threshold is x = 125
        if (enemy.x < 125) {
          // If mower was already consumed or gone, game over!
          if (!mower || !mower.active || (mower.isTriggered && mower.x > enemy.x)) {
            gameOverBreach = true;
          }
        }
      }
    }

    return { gameOverBreach, enemiesKilledCount, scoreEarned };
  }
}
