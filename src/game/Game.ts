import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_ROWS, INITIAL_SUN, SKY_SUN_MIN_INTERVAL, SKY_SUN_MAX_INTERVAL, MOWER_X, PLANT_CONFIGS } from './constants';
import { GameState, PlantType, EnemyType } from './types';
import { SoundSystem } from './audio/SoundSystem';
import { ParticleSystem } from './systems/ParticleSystem';
import { GridSystem } from './systems/GridSystem';
import { WaveSystem } from './systems/WaveSystem';
import { CombatSystem } from './systems/CombatSystem';
import { CardBar } from './ui/CardBar';
import { HUD } from './ui/HUD';
import { ModalOverlay } from './ui/ModalOverlay';

import { Plant } from './entities/Plant';
import { Enemy } from './entities/Enemy';
import { Projectile } from './entities/Projectile';
import { Sun } from './entities/Sun';
import { Mower } from './entities/Mower';

import { SolarBloom } from './plants/SolarBloom';
import { SeedShooter } from './plants/SeedShooter';
import { DoubleShooter } from './plants/DoubleShooter';
import { StoneRoot } from './plants/StoneRoot';
import { FrostFlower } from './plants/FrostFlower';

import { Walker } from './enemies/Walker';
import { Runner } from './enemies/Runner';
import { Tank } from './enemies/Tank';
import { HelmetEnemy } from './enemies/HelmetEnemy';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Core Engine Systems
  public sound: SoundSystem;
  public particles: ParticleSystem;
  public grid: GridSystem;
  public waveSystem: WaveSystem;
  public combatSystem: CombatSystem;

  // UI Components
  public cardBar: CardBar;
  public hud: HUD;
  public modal: ModalOverlay;

  // Game State
  public state: GameState = 'START';
  public isDebug: boolean = false;
  public sunEnergy: number = INITIAL_SUN;
  public totalSunHarvested: number = 0;
  public totalEnemiesKilled: number = 0;
  public score: number = 0;

  // Entities
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public suns: Sun[] = [];
  public mowers: (Mower | null)[] = [];

  // Sky Sun Drop Timer
  private skySunTimer: number = 0;
  private nextSkySunInterval: number = 7.0;

  // Virtual mouse coordinates
  private mouseX: number = 0;
  private mouseY: number = 0;
  private hoveredCell: { col: number; row: number } | null = null;

  // Loop & FPS timing
  private lastTime: number = 0;
  private fps: number = 60;
  private frameCount: number = 0;
  private fpsTimer: number = 0;
  private globalAnimTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;

    this.sound = new SoundSystem();
    this.particles = new ParticleSystem();
    this.grid = new GridSystem();
    this.waveSystem = new WaveSystem();
    this.combatSystem = new CombatSystem(this.particles, this.sound, this.waveSystem);

    this.cardBar = new CardBar();
    this.hud = new HUD();
    this.modal = new ModalOverlay();

    this.setupEventListeners();
    this.handleResize();
    this.resetGame();
  }

  public resetGame() {
    this.sunEnergy = INITIAL_SUN;
    this.totalSunHarvested = 0;
    this.totalEnemiesKilled = 0;
    this.score = 0;
    this.enemies = [];
    this.projectiles = [];
    this.suns = [];
    this.particles.clear();
    this.grid.reset();
    this.cardBar.reset();
    this.waveSystem.reset();

    // Initialize 1 emergency Robo-Cutter mower per lane
    this.mowers = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const center = this.grid.getCellCenter(r, 0);
      this.mowers.push(new Mower(MOWER_X, center.y - 10, r));
    }

    this.skySunTimer = 0;
    this.nextSkySunInterval = 7.0;
  }

  public start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(now: number) {
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    // Cap delta time to prevent large jumps when switching tabs
    const dt = Math.min(rawDt, 0.1);

    // FPS calculation
    this.frameCount++;
    this.fpsTimer += rawDt;
    if (this.fpsTimer >= 0.5) {
      this.fps = Math.round((this.frameCount / this.fpsTimer));
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    this.globalAnimTimer += dt;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(dt: number) {
    if (this.state === 'START' || this.state === 'PAUSED' || this.state === 'VICTORY' || this.state === 'GAME_OVER') {
      return;
    }

    // 1. UI & Particles Update
    this.cardBar.update(dt);
    this.hud.update(dt);
    this.particles.update(dt);

    // 2. Wave System Spawns
    const livingEnemiesCount = this.enemies.filter((e) => e.active && !e.isDying).length;
    const spawnData = this.waveSystem.update(dt, livingEnemiesCount);
    if (spawnData) {
      this.spawnEnemy(spawnData.type, spawnData.lane);
    }
    if (this.waveSystem.isWarningActive && spawnData?.isLargeWaveAlert) {
      this.sound.playWaveHorn();
    }

    // Check Victory
    if (this.waveSystem.isAllWavesCompleted && livingEnemiesCount === 0) {
      this.state = 'VICTORY';
      this.sound.playVictory();
      return;
    }

    // 3. Sky Sun Drop System
    this.skySunTimer += dt;
    if (this.skySunTimer >= this.nextSkySunInterval) {
      this.skySunTimer = 0;
      this.nextSkySunInterval = SKY_SUN_MIN_INTERVAL + Math.random() * (SKY_SUN_MAX_INTERVAL - SKY_SUN_MIN_INTERVAL);
      this.spawnSkySun();
    }

    // 4. Update Plants (Sun production and shooting)
    const plants = this.grid.getAllPlants();
    for (const plant of plants) {
      plant.update(dt);

      if (plant instanceof SolarBloom) {
        const newSun = plant.checkProduceSun(dt);
        if (newSun) {
          this.suns.push(newSun);
          this.particles.emitBurst(plant.x, plant.y - 15, '#facc15', 10, 100, 3, 'circle');
        }
      } else if (plant instanceof SeedShooter || plant instanceof DoubleShooter || plant instanceof FrostFlower) {
        // Check if any enemy is ahead in the same lane
        const hasEnemyInLane = this.enemies.some(
          (e) => e.active && !e.isDying && e.lane === plant.gridRow && e.x > plant.x
        );
        const bullet = plant.checkShoot(dt, hasEnemyInLane);
        if (bullet) {
          this.projectiles.push(bullet);
          if (bullet.isFrost) {
            this.sound.playFrostShoot();
            this.particles.emitBurst(bullet.x, bullet.y, '#38bdf8', 4, 80, 2, 'snow');
          } else {
            this.sound.playShoot();
            this.particles.emitBurst(bullet.x, bullet.y, '#86efac', 4, 70, 2, 'leaf');
          }
        }
      }
    }

    // Remove dead plants from grid
    const deadPlants = this.grid.removeDeadPlants();
    for (const dp of deadPlants) {
      this.particles.emitBurst(dp.x, dp.y, '#65a30d', 14, 120, 4, 'leaf');
    }

    // 5. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt);
      if (!enemy.active) {
        this.enemies.splice(i, 1);
      }
    }

    // 6. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt);
      if (!proj.active) {
        this.projectiles.splice(i, 1);
      }
    }

    // 7. Update Suns
    for (let i = this.suns.length - 1; i >= 0; i--) {
      const sun = this.suns[i];
      sun.update(dt);
      if (!sun.active) {
        this.suns.splice(i, 1);
      }
    }

    // 8. Update Mowers
    for (let r = 0; r < GRID_ROWS; r++) {
      const mower = this.mowers[r];
      if (mower && mower.active) {
        mower.update(dt);
        if (!mower.active) {
          this.mowers[r] = null;
        }
      }
    }

    // 9. Combat System (Hits, chewing, mower crushes, porch breach)
    const combatResult = this.combatSystem.update(plants, this.enemies, this.projectiles, this.mowers);
    this.totalEnemiesKilled += combatResult.enemiesKilledCount;
    this.score += combatResult.scoreEarned;

    if (combatResult.gameOverBreach) {
      this.state = 'GAME_OVER';
      this.sound.playGameOver();
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Render Garden Terrain & Grid Highlight
    let isPlacementValid: boolean | null = null;
    if (this.hoveredCell && this.cardBar.selectedCard) {
      if (this.cardBar.selectedCard === 'shovel') {
        const hasPlant = !!this.grid.getPlant(this.hoveredCell.row, this.hoveredCell.col);
        isPlacementValid = hasPlant;
      } else {
        const canAfford = this.cardBar.isCardReady(this.cardBar.selectedCard, this.sunEnergy);
        const cellOccupied = !!this.grid.getPlant(this.hoveredCell.row, this.hoveredCell.col);
        isPlacementValid = canAfford && !cellOccupied;
      }
    }
    this.grid.renderLawn(this.ctx, this.hoveredCell, isPlacementValid);

    // 2. Render Emergency Mowers
    for (const mower of this.mowers) {
      if (mower && mower.active) {
        mower.render(this.ctx);
      }
    }

    // 3. Render Living Plants
    const plants = this.grid.getAllPlants();
    // Sort plants by row for proper depth layering
    plants.sort((a, b) => a.gridRow - b.gridRow);
    for (const plant of plants) {
      plant.render(this.ctx);
    }

    // 4. Render Plant Placement Cursor Preview
    if (this.hoveredCell && this.cardBar.selectedCard && this.cardBar.selectedCard !== 'shovel') {
      const center = this.grid.getCellCenter(this.hoveredCell.row, this.hoveredCell.col);
      this.renderGhostPlantPreview(this.ctx, this.cardBar.selectedCard, center.x, center.y, isPlacementValid === true);
    }

    // 5. Render Enemies (sorted by Y for correct visual overlap)
    const sortedEnemies = [...this.enemies].sort((a, b) => a.y - b.y);
    for (const enemy of sortedEnemies) {
      enemy.render(this.ctx);
    }

    // 6. Render Projectiles
    for (const proj of this.projectiles) {
      proj.render(this.ctx);
    }

    // 7. Render Sun Orbs
    for (const sun of this.suns) {
      sun.render(this.ctx);
    }

    // 8. Render Particles & Floating Combat Text
    this.particles.render(this.ctx);

    // 9. Render HUD & Card Deck
    this.cardBar.render(this.ctx, this.sunEnergy);
    this.hud.render(
      this.ctx,
      this.sunEnergy,
      this.waveSystem.getCurrentWaveNumber(),
      this.waveSystem.getTotalWaves(),
      this.waveSystem.getWaveProgress(),
      this.sound.isMuted(),
      this.state === 'PAUSED',
      this.isDebug
    );

    // 10. Large Wave Alert Banner
    if (this.waveSystem.isWarningActive && this.state === 'PLAYING') {
      this.modal.renderWaveWarning(this.ctx, this.waveSystem.warningMessage, this.waveSystem.warningTimer);
    }

    // 11. Modal Overlays (Start, Pause, Victory, Game Over)
    if (this.state === 'START') {
      this.modal.renderStartScreen(this.ctx, this.globalAnimTimer);
    } else if (this.state === 'PAUSED') {
      this.modal.renderPauseScreen(this.ctx);
    } else if (this.state === 'VICTORY') {
      this.modal.renderVictoryScreen(this.ctx, this.totalEnemiesKilled, this.totalSunHarvested, this.score);
    } else if (this.state === 'GAME_OVER') {
      this.modal.renderGameOverScreen(this.ctx, this.waveSystem.getCurrentWaveNumber(), this.totalEnemiesKilled, this.score);
    }

    // 12. Debug Overlay
    if (this.isDebug) {
      this.renderDebugOverlay();
    }
  }

  private renderGhostPlantPreview(
    ctx: CanvasRenderingContext2D,
    type: PlantType,
    x: number,
    y: number,
    isValid: boolean
  ) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.translate(x, y);

    if (!isValid) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    }

    // Quick silhouette outline
    ctx.strokeStyle = isValid ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -10, 26, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emojiMap: Record<PlantType, string> = {
      'solar-bloom': '🌻',
      'seed-shooter': '🌱',
      'double-shooter': '🌿',
      'stone-root': '🥔',
      'frost-flower': '❄️',
    };
    ctx.fillText(emojiMap[type] || '🌱', 0, -10);

    ctx.restore();
  }

  private renderDebugOverlay() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.beginPath();
    this.ctx.roundRect(14, 105, 210, 160, 8);
    this.ctx.fill();

    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.font = '13px monospace';
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    const plantsCount = this.grid.getAllPlants().length;
    const lines = [
      `[DEBUG MODE]`,
      `FPS: ${this.fps}`,
      `State: ${this.state}`,
      `Enemies: ${this.enemies.length}`,
      `Plants: ${plantsCount}`,
      `Bullets: ${this.projectiles.length}`,
      `Suns: ${this.suns.length}`,
      `Wave: ${this.waveSystem.getCurrentWaveNumber()} / 10`,
      `Score: ${this.score}`,
    ];

    lines.forEach((l, idx) => {
      this.ctx.fillText(l, 24, 114 + idx * 16);
    });

    // Draw lane lines and entity bounding boxes
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    this.ctx.lineWidth = 1;
    for (let r = 0; r < GRID_ROWS; r++) {
      const c = this.grid.getCellCenter(r, 0);
      this.ctx.beginPath();
      this.ctx.moveTo(130, c.y);
      this.ctx.lineTo(1280, c.y);
      this.ctx.stroke();
    }

    // Enemy bounding boxes & HP
    this.ctx.strokeStyle = '#f87171';
    for (const e of this.enemies) {
      const b = e.getBounds();
      this.ctx.strokeRect(b.x, b.y, b.width, b.height);
      this.ctx.fillText(`HP:${e.hp}`, b.x, b.y - 12);
    }

    // Plant bounding boxes
    this.ctx.strokeStyle = '#4ade80';
    for (const pl of this.grid.getAllPlants()) {
      const b = pl.getBounds();
      this.ctx.strokeRect(b.x, b.y, b.width, b.height);
    }

    this.ctx.restore();
  }

  private spawnEnemy(type: EnemyType, lane: number) {
    const center = this.grid.getCellCenter(lane, 8);
    const spawnX = 1320; // Just off the right edge
    const spawnY = center.y + 5;

    let enemy: Enemy;
    switch (type) {
      case 'walker':
        enemy = new Walker(spawnX, spawnY, lane);
        break;
      case 'runner':
        enemy = new Runner(spawnX, spawnY, lane);
        break;
      case 'tank':
        enemy = new Tank(spawnX, spawnY - 6, lane);
        break;
      case 'helmet':
        enemy = new HelmetEnemy(spawnX, spawnY, lane);
        break;
    }
    this.enemies.push(enemy);
  }

  private spawnSkySun() {
    const spawnX = 280 + Math.random() * 780;
    const targetY = 180 + Math.random() * 420;
    this.suns.push(new Sun(spawnX, -30, targetY, true));
  }

  private placePlant(type: PlantType, row: number, col: number) {
    const cost = PLANT_CONFIGS[type].cost;
    if (this.sunEnergy < cost) {
      this.particles.addFloatingText(this.mouseX, this.mouseY, `Need ${cost} Sun!`, '#ef4444', 1.2);
      return;
    }

    if (this.grid.getPlant(row, col)) {
      this.particles.addFloatingText(this.mouseX, this.mouseY, 'Occupied!', '#ef4444', 1.0);
      return;
    }

    const center = this.grid.getCellCenter(row, col);
    let newPlant: Plant;

    switch (type) {
      case 'solar-bloom':
        newPlant = new SolarBloom(center.x, center.y, row, col);
        break;
      case 'seed-shooter':
        newPlant = new SeedShooter(center.x, center.y, row, col);
        break;
      case 'double-shooter':
        newPlant = new DoubleShooter(center.x, center.y, row, col);
        break;
      case 'stone-root':
        newPlant = new StoneRoot(center.x, center.y, row, col);
        break;
      case 'frost-flower':
        newPlant = new FrostFlower(center.x, center.y, row, col);
        break;
    }

    // Deduct cost and apply cooldown
    this.sunEnergy -= cost;
    this.cardBar.triggerCooldown(type);
    this.grid.setPlant(row, col, newPlant);
    this.cardBar.selectedCard = null; // Deselect after planting

    // Audio & particles
    this.sound.playPlantPlace();
    this.particles.emitBurst(center.x, center.y + 20, '#65a30d', 15, 120, 4, 'leaf');
    this.particles.emitBurst(center.x, center.y + 25, '#4a2c11', 10, 80, 4, 'rock');
    this.particles.addFloatingText(center.x, center.y - 20, `-${cost} ☀️`, '#ef4444', 1.1);
  }

  private shovelPlant(row: number, col: number) {
    const plant = this.grid.getPlant(row, col);
    if (!plant) {
      this.particles.addFloatingText(this.mouseX, this.mouseY, 'No plant here!', '#94a3b8', 1.0);
      return;
    }

    this.grid.setPlant(row, col, null);
    this.cardBar.selectedCard = null;
    this.sound.playPlantPlace();
    this.particles.emitBurst(plant.x, plant.y, '#84cc16', 16, 140, 5, 'leaf');
    this.particles.addFloatingText(plant.x, plant.y - 15, 'REMOVED', '#f8fafc', 1.1);
  }

  // Handle pointer down / clicks
  private handlePointerDown(e: MouseEvent) {
    // Resume audio context on user gesture
    this.sound.init();

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Right click cancels selection
    if (e.button === 2) {
      this.cardBar.selectedCard = null;
      return;
    }

    // Modal click handling
    if (this.state === 'START') {
      if (this.modal.isInside(x, y, this.modal.startBtn)) {
        this.sound.playButtonClick();
        this.state = 'PLAYING';
      }
      return;
    }

    if (this.state === 'PAUSED') {
      if (this.modal.isInside(x, y, this.modal.resumeBtn)) {
        this.sound.playButtonClick();
        this.state = 'PLAYING';
      } else if (this.modal.isInside(x, y, this.modal.pauseRestartBtn)) {
        this.sound.playButtonClick();
        this.resetGame();
        this.state = 'PLAYING';
      }
      return;
    }

    if (this.state === 'VICTORY' || this.state === 'GAME_OVER') {
      if (this.modal.isInside(x, y, this.modal.endPlayAgainBtn)) {
        this.sound.playButtonClick();
        this.resetGame();
        this.state = 'PLAYING';
      }
      return;
    }

    // HUD Buttons click
    const hudAction = this.hud.handleClick(x, y);
    if (hudAction) {
      this.sound.playButtonClick();
      if (hudAction === 'SOUND') {
        this.sound.toggleMute();
      } else if (hudAction === 'PAUSE') {
        this.state = this.state === 'PLAYING' ? 'PAUSED' : 'PLAYING';
      } else if (hudAction === 'DEBUG') {
        this.isDebug = !this.isDebug;
      } else if (hudAction === 'RESTART') {
        this.resetGame();
        this.state = 'PLAYING';
      }
      return;
    }

    // Sun Click check (highest priority in gameplay)
    for (const sun of this.suns) {
      if (sun.isClicked(x, y)) {
        sun.collect();
        this.sunEnergy += sun.value;
        this.totalSunHarvested += sun.value;
        this.sound.playSunCollect();
        this.hud.triggerSunPulse();
        this.particles.emitBurst(x, y, '#facc15', 12, 140, 4, 'spark');
        this.particles.addFloatingText(x, y - 20, `+${sun.value} ☀️`, '#facc15', 1.25);
        return;
      }
    }

    // Card Bar click check
    const cardResult = this.cardBar.handleClick(x, y, this.sunEnergy);
    if (cardResult.error) {
      this.particles.addFloatingText(x, y - 20, cardResult.error, '#ef4444', 1.1);
      return;
    }
    if (cardResult.type !== null) {
      this.sound.playButtonClick();
      return;
    }

    // Grid Cell placement / shovel click check
    if (this.cardBar.selectedCard && this.hoveredCell) {
      if (this.cardBar.selectedCard === 'shovel') {
        this.shovelPlant(this.hoveredCell.row, this.hoveredCell.col);
      } else {
        this.placePlant(this.cardBar.selectedCard, this.hoveredCell.row, this.hoveredCell.col);
      }
    }
  }

  private handlePointerMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    this.mouseX = (e.clientX - rect.left) * scaleX;
    this.mouseY = (e.clientY - rect.top) * scaleY;

    this.cardBar.handleMouseMove(this.mouseX, this.mouseY);
    this.hoveredCell = this.grid.screenToGrid(this.mouseX, this.mouseY);
  }

  private handleKeyDown(e: KeyboardEvent) {
    // Prevent default scrolling for Space/Arrow keys
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }

    if (e.key === 'Escape') {
      if (this.cardBar.selectedCard) {
        this.cardBar.selectedCard = null;
      } else if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
      }
      return;
    }

    if (e.key.toLowerCase() === 'p') {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
      }
      return;
    }

    if (e.key.toLowerCase() === 'd') {
      this.isDebug = !this.isDebug;
      return;
    }

    if (e.key.toLowerCase() === 'm') {
      this.sound.toggleMute();
      return;
    }

    if (e.key.toLowerCase() === 's') {
      this.cardBar.selectedCard = this.cardBar.selectedCard === 'shovel' ? null : 'shovel';
      this.sound.playButtonClick();
      return;
    }

    // Hotkeys 1-5 for plant selection
    const num = parseInt(e.key, 10);
    if (!isNaN(num) && num >= 1 && num <= 5 && this.state === 'PLAYING') {
      const res = this.cardBar.selectHotkey(num, this.sunEnergy);
      if (res.error) {
        this.particles.addFloatingText(this.mouseX, this.mouseY, res.error, '#ef4444', 1.1);
      } else if (res.type) {
        this.sound.playButtonClick();
      }
    }
  }

  private setupEventListeners() {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    this.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.cardBar.selectedCard = null;
    });
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  // Responsive canvas resizing maintaining 16:9 aspect ratio
  private handleResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const contW = container.clientWidth;
    const contH = container.clientHeight;
    const targetAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
    const contAspect = contW / contH;

    let displayW: number;
    let displayH: number;

    if (contAspect > targetAspect) {
      displayH = contH;
      displayW = contH * targetAspect;
    } else {
      displayW = contW;
      displayH = contW / targetAspect;
    }

    this.canvas.style.width = `${Math.floor(displayW)}px`;
    this.canvas.style.height = `${Math.floor(displayH)}px`;
  }
}
