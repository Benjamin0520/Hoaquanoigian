# 🌻 Garden Defense - Lane Defense Strategy Web Game

A complete, responsive lane-defense web game built from the ground up using **Vite**, **TypeScript**, and **HTML5 Canvas**, inspired by the core mechanics of lane-defense classics with 100% original procedural artwork and Web Audio procedural sound synthesis (no copyrighted assets, sprites, or trademarks).

---

## 🎮 Game Overview

* **Battlefield**: 5 lanes × 9 columns garden grid.
* **Objective**: Defend your house porch against 10 escalating waves of invading monsters using sun-powered defensive plants.
* **Emergency Defense**: Each lane is equipped with a high-speed **Robo-Cutter** mower that crushes all monsters in that lane if they breach your garden. Once triggered, that lane has no further backup!

---

## 🚀 Installation & Running

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18+ recommended)
* npm (bundled with Node)

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
```

Once running, open your browser at the local URL displayed in the terminal:
```
http://localhost:5173/
```

### Production Build
To create an optimized production build:
```bash
npm run build
npm run preview
```

---

## ⌨️ Controls & Shortcuts

| Action | Control |
| :--- | :--- |
| **Select Plant Card** | Left Click card in top deck or press **`1`** – **`5`** |
| **Place Plant** | Left Click an empty lawn cell |
| **Cancel Selection** | **Right Click** anywhere or press **`Escape`** |
| **Dig Up / Remove Plant** | Click **Shovel** tool in top deck or press **`S`**, then click plant |
| **Collect Sun Energy** | Left Click falling or flower-produced sun orbs |
| **Pause / Resume** | Click **`⏸️`** button or press **`P`** / **`Escape`** |
| **Mute / Unmute Sound** | Click **`🔊`** button or press **`M`** |
| **Debug Mode Toggle** | Click **`🛠️`** button or press **`D`** |

---

## 🌿 Plants (Defense Roster)

1. **Solar Bloom** (Cost: 50 ☀️ | HP: 300)
   * Generates +25 Sun Energy periodically (initial burst in 4s, then every 18s).
   * Petals spin and center pulses with warm light before producing sun.
2. **Seed Shooter** (Cost: 100 ☀️ | HP: 300 | DMG: 20 | Rate: 1.4s)
   * Botanical cannon that fires seed projectiles rightward when enemies are detected in its lane.
3. **Double Shooter** (Cost: 175 ☀️ | HP: 300 | DMG: 20 × 2 | Rate: 1.4s)
   * Rapid-fire repeater with camouflage headband that fires two consecutive seeds in quick bursts.
4. **Stone Root** (Cost: 75 ☀️ | HP: 4000)
   * Tough mossy boulder barrier that blocks monsters.
   * Features progressive visual states: smiling, hairline cracks at 66% HP, and determined grit teeth with heavy cracks at 33% HP.
5. **Frost Flower** (Cost: 150 ☀️ | HP: 300 | DMG: 20 | Rate: 1.5s)
   * Fires icy crystal shards that damage and slow enemy movement speed by 50% for 3.5 seconds.

---

## 👾 Enemies (Monster Roster)

1. **Walker** (HP: 200 | SPD: 24 px/s | DMG: 25/bite)
   * Standard cartoon garden goblin with jagged teeth and animated walking/chewing cycles.
2. **Runner** (HP: 130 | SPD: 55 px/s | DMG: 20/bite)
   * Swift orange imp with red headband sprinting rapidly towards your defenses.
3. **Tank Brute** (HP: 850 | SPD: 15 px/s | DMG: 40/bite)
   * Massive stone-pauldrons behemoth with red glowing eyes and heavy ground-shaking footsteps.
4. **Helmet Fiend** (HP: 200 + Armor: 380 | SPD: 22 px/s | DMG: 25/bite)
   * Goblin protected by a gleaming copper helmet. Helmet absorbs 380 damage before shattering with metallic sparks, exposing the goblin.

---

## 🌊 Wave Progression (10 Waves)

* **Waves 1–3**: Scouts and early runners to establish your sun economy.
* **Waves 4–6**: Introduction of armored Helmet Fiends, culminating in the first **Huge Wave** at Wave 5 with warning siren banners.
* **Waves 7–9**: Heavy pressure featuring slow Tank Brutes supported by fast sprinting Runners.
* **Wave 10**: The **Final Massive Wave** testing full garden defenses across all 5 lanes.

---

## 🏗️ Project Architecture

```
d:/ANTIGRAVITY/
├── index.html                  # HTML5 Canvas viewport container
├── package.json                # Scripts and dependencies (TypeScript + Vite)
├── tsconfig.json               # Strict TypeScript configuration
├── vite.config.ts              # Vite server & build configuration
├── README.md                   # Documentation and customization guide
└── src/
    ├── main.ts                 # App entry point and canvas bootstrap
    ├── style.css               # Responsive canvas styling and font declarations
    └── game/
        ├── constants.ts        # Grid dimensions, costs, enemy stats & wave configs
        ├── types.ts            # Type declarations & interfaces
        ├── Game.ts             # Master game loop, coordinates & state manager
        ├── audio/
            └── SoundSystem.ts  # Procedural Web Audio API sound synthesizer
        ├── entities/
            ├── Entity.ts       # Abstract base entity
            ├── Plant.ts        # Base plant class (HP, shadow, damage reactions)
            ├── Enemy.ts        # Base enemy class (movement, bite attack, armor, health bar)
            ├── Projectile.ts   # Seed bullets and frost crystals
            ├── Sun.ts          # Falling and plant-spawned sun orbs
            └── Mower.ts        # Emergency Robo-Cutter lane defense
        ├── plants/
            ├── SolarBloom.ts
            ├── SeedShooter.ts
            ├── DoubleShooter.ts
            ├── StoneRoot.ts
            └── FrostFlower.ts
        ├── enemies/
            ├── Walker.ts
            ├── Runner.ts
            ├── Tank.ts
            └── HelmetEnemy.ts
        ├── systems/
            ├── GridSystem.ts     # Cell mapping, occupancy and garden terrain rendering
            ├── CombatSystem.ts   # Lane-partitioned O(N) collision detection
            ├── WaveSystem.ts     # 10-wave scheduler and alert management
            └── ParticleSystem.ts # Particle bursts and floating damage numbers
        └── ui/
            ├── CardBar.ts        # Seed packet cards, cooldown swipes, tooltips & shovel
            ├── HUD.ts            # Sun counter, wave meter, pause/mute/debug buttons
            └── ModalOverlay.ts   # Start, Pause, Victory, and Game Over screens
```

---

## 🛠️ How to Extend & Customize

### 1. Adding a New Plant
1. In `src/game/types.ts`: Add your plant key to the `PlantType` union.
2. In `src/game/constants.ts`: Add its configuration in `PLANT_CONFIGS` (name, cost, hp, cooldown, attack details).
3. In `src/game/plants/`: Create a new class extending `Plant` (e.g. `CherryBomb.ts`). Implement custom canvas rendering and actions.
4. In `src/game/Game.ts`: Import the class, instantiate it in `placePlant()`, and register it in `CardBar.ts`.

### 2. Adding a New Enemy
1. In `src/game/types.ts`: Add your enemy key to `EnemyType`.
2. In `src/game/constants.ts`: Add its base stats in `ENEMY_CONFIGS` (hp, speed, damage, etc.).
3. In `src/game/enemies/`: Create a new class extending `Enemy`. Implement `render()` with procedural graphics.
4. In `src/game/Game.ts`: Handle instantiation in `spawnEnemy()`.
5. In `src/game/constants.ts`: Add the enemy to any wave spawn in `WAVES`.

### 3. Tuning Balance & Difficulty
All balance values are centralized in `src/game/constants.ts`:
* **Starting Sun & Production**: Modify `INITIAL_SUN`, `SUN_VALUE`, `SKY_SUN_MIN_INTERVAL`, `SKY_SUN_MAX_INTERVAL`.
* **Plant Costs & Cooldowns**: Adjust `PLANT_CONFIGS`.
* **Enemy Speed & HP**: Adjust `ENEMY_CONFIGS`.
* **Wave Composition**: Adjust spawn intervals, enemy types, and wave sizes in `WAVES`.

### 4. Replacing Graphics / Audio Assets
* **Graphics**: Currently drawn procedurally using Canvas 2D methods in each entity's `render()` method. To use PNG/SVG sprite sheets instead, load images with `new Image()` in a loader class and call `ctx.drawImage(img, ...)` inside `render()`.
* **Audio**: `src/game/audio/SoundSystem.ts` uses Web Audio oscillators. You can replace the oscillator methods with `new Audio('/assets/sound.mp3').play()` if external audio assets are preferred.

---

## 📜 License
MIT License. Created for learning, entertainment, and strategy gaming.
