import { Rect } from '../types';

export class ModalOverlay {
  // Start screen button
  public readonly startBtn: Rect = { x: 490, y: 550, width: 300, height: 64 };

  // Pause screen buttons
  public readonly resumeBtn: Rect = { x: 490, y: 340, width: 300, height: 56 };
  public readonly pauseRestartBtn: Rect = { x: 490, y: 420, width: 300, height: 56 };

  // End screen buttons (Victory / Game Over)
  public readonly endPlayAgainBtn: Rect = { x: 490, y: 520, width: 300, height: 64 };

  public isInside(x: number, y: number, r: Rect): boolean {
    return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
  }

  // 1. Start Screen
  public renderStartScreen(ctx: CanvasRenderingContext2D, animTimer: number) {
    ctx.save();

    // Dark backdrop with subtle green hue
    ctx.fillStyle = 'rgba(12, 20, 14, 0.92)';
    ctx.fillRect(0, 0, 1280, 720);

    // Decorative Sun Rays in background
    ctx.save();
    ctx.translate(640, 220);
    ctx.rotate(animTimer * 0.2);
    ctx.fillStyle = 'rgba(234, 179, 8, 0.05)';
    for (let i = 0; i < 16; i++) {
      ctx.rotate((Math.PI * 2) / 16);
      ctx.beginPath();
      ctx.moveTo(-40, 0);
      ctx.lineTo(0, -600);
      ctx.lineTo(40, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Main Modal Frame
    const frameX = 280;
    const frameY = 60;
    const frameW = 720;
    const frameH = 580;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, frameW, frameH, 20);
    ctx.fill();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Title Banner
    ctx.save();
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 24;
    ctx.font = 'bold 54px "Fredoka", sans-serif';
    ctx.fillStyle = '#4ade80';
    ctx.textAlign = 'center';
    ctx.fillText('🌻 GARDEN DEFENSE 🌻', 640, 130);
    ctx.shadowBlur = 0;

    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Tactical Lane Defense Strategy', 640, 170);
    ctx.restore();

    // Instructions Box
    const boxX = 330;
    const boxY = 205;
    const boxW = 620;
    const boxH = 310;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 12);
    ctx.fill();

    const rules = [
      { icon: '☀️', title: 'Collect Sun Energy', desc: 'Click falling sun or plant Solar Blooms to generate resources.' },
      { icon: '🌱', title: 'Deploy Botanical Defenses', desc: 'Place shooters, slowing frost flowers, and sturdy stone blockers.' },
      { icon: '👾', title: 'Stop 10 Monster Waves', desc: 'Enemies invade along 5 lanes. Defeat them before they reach your house.' },
      { icon: '🚜', title: 'Robo-Cutter Last Resort', desc: 'Each lane has 1 emergency cutter. If it triggers, that lane has no more backup!' },
      { icon: '⌨️', title: 'Controls & Hotkeys', desc: 'Keys [1-5] select plants, [ESC / Right-Click] cancels, [P] pauses.' },
    ];

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    rules.forEach((item, idx) => {
      const y = boxY + 18 + idx * 56;
      ctx.font = '24px sans-serif';
      ctx.fillText(item.icon, boxX + 18, y + 2);

      ctx.font = 'bold 16px "Fredoka", sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText(item.title, boxX + 58, y);

      ctx.font = '13px "Outfit", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(item.desc, boxX + 58, y + 22);
    });

    // Start Button
    const btnPulse = 1.0 + Math.sin(animTimer * 4) * 0.03;
    ctx.save();
    ctx.translate(this.startBtn.x + this.startBtn.width / 2, this.startBtn.y + this.startBtn.height / 2);
    ctx.scale(btnPulse, btnPulse);

    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 18;

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect(-this.startBtn.width / 2, -this.startBtn.height / 2, this.startBtn.width, this.startBtn.height, 12);
    ctx.fill();

    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 26px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START GAME ▶', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  // 2. Large Wave Warning Banner
  public renderWaveWarning(ctx: CanvasRenderingContext2D, message: string, timer: number) {
    ctx.save();

    const bannerY = 320;
    const bannerH = 90;

    // Pulsing alpha
    const alpha = 0.85 + Math.sin(timer * 10) * 0.15;
    ctx.fillStyle = `rgba(185, 28, 28, ${alpha})`;
    ctx.fillRect(0, bannerY, 1280, bannerH);

    // Hazard borders
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, bannerY, 1280, 6);
    ctx.fillRect(0, bannerY + bannerH - 6, 1280, 6);

    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.font = 'bold 36px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⚠️ ${message.toUpperCase()} ⚠️`, 640, bannerY + bannerH / 2);

    ctx.restore();
  }

  // 3. Pause Screen
  public renderPauseScreen(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, 1280, 720);

    const boxW = 440;
    const boxH = 360;
    const boxX = (1280 - boxW) / 2;
    const boxY = (720 - boxH) / 2;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16);
    ctx.fill();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 38px "Fredoka", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText('GAME PAUSED', 640, boxY + 60);

    // Resume Button
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(this.resumeBtn.x, this.resumeBtn.y, this.resumeBtn.width, this.resumeBtn.height, 10);
    ctx.fill();
    ctx.font = 'bold 22px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('RESUME ▶', 640, this.resumeBtn.y + 35);

    // Restart Button
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(this.pauseRestartBtn.x, this.pauseRestartBtn.y, this.pauseRestartBtn.width, this.pauseRestartBtn.height, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('RESTART ↺', 640, this.pauseRestartBtn.y + 35);

    ctx.restore();
  }

  // 4. Victory Screen
  public renderVictoryScreen(
    ctx: CanvasRenderingContext2D,
    enemiesKilled: number,
    sunHarvested: number,
    score: number
  ) {
    ctx.save();
    ctx.fillStyle = 'rgba(6, 46, 21, 0.9)';
    ctx.fillRect(0, 0, 1280, 720);

    const boxW = 560;
    const boxH = 480;
    const boxX = (1280 - boxW) / 2;
    const boxY = (720 - boxH) / 2;

    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 18);
    ctx.fill();

    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 44px "Fredoka", sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 VICTORY! 🏆', 640, boxY + 70);
    ctx.shadowBlur = 0;

    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillStyle = '#bbf7d0';
    ctx.fillText('You protected the garden through all 10 waves!', 640, boxY + 115);

    // Stats Box
    const sBoxY = boxY + 145;
    ctx.fillStyle = '#052e16';
    ctx.beginPath();
    ctx.roundRect(boxX + 40, sBoxY, boxW - 80, 180, 12);
    ctx.fill();

    ctx.font = '18px "Outfit", sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.textAlign = 'left';

    const statRows = [
      { label: 'Waves Cleared:', val: '10 / 10' },
      { label: 'Monsters Vanquished:', val: `${enemiesKilled}` },
      { label: 'Sun Energy Gathered:', val: `${sunHarvested} ☀️` },
      { label: 'Final Score:', val: `${score} pts` },
    ];

    statRows.forEach((row, i) => {
      ctx.fillText(row.label, boxX + 70, sBoxY + 36 + i * 36);
      ctx.textAlign = 'right';
      ctx.font = 'bold 18px "Outfit", sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText(row.val, boxX + boxW - 70, sBoxY + 36 + i * 36);
      ctx.textAlign = 'left';
      ctx.font = '18px "Outfit", sans-serif';
      ctx.fillStyle = '#f1f5f9';
    });

    // Play Again Button
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect(this.endPlayAgainBtn.x, this.endPlayAgainBtn.y, this.endPlayAgainBtn.width, this.endPlayAgainBtn.height, 12);
    ctx.fill();
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 26px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('PLAY AGAIN ↺', 640, this.endPlayAgainBtn.y + 40);

    ctx.restore();
  }

  // 5. Game Over Screen
  public renderGameOverScreen(
    ctx: CanvasRenderingContext2D,
    waveReached: number,
    enemiesKilled: number,
    score: number
  ) {
    ctx.save();
    ctx.fillStyle = 'rgba(45, 10, 10, 0.92)';
    ctx.fillRect(0, 0, 1280, 720);

    const boxW = 560;
    const boxH = 480;
    const boxX = (1280 - boxW) / 2;
    const boxY = (720 - boxH) / 2;

    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 18);
    ctx.fill();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 44px "Fredoka", sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText('💀 GARDEN OVERRUN! 💀', 640, boxY + 70);
    ctx.shadowBlur = 0;

    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.fillStyle = '#fecaca';
    ctx.fillText('The monsters breached your defenses!', 640, boxY + 115);

    // Stats Box
    const sBoxY = boxY + 145;
    ctx.fillStyle = '#200505';
    ctx.beginPath();
    ctx.roundRect(boxX + 40, sBoxY, boxW - 80, 180, 12);
    ctx.fill();

    ctx.font = '18px "Outfit", sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.textAlign = 'left';

    const statRows = [
      { label: 'Wave Reached:', val: `${waveReached} / 10` },
      { label: 'Monsters Vanquished:', val: `${enemiesKilled}` },
      { label: 'Final Score:', val: `${score} pts` },
    ];

    statRows.forEach((row, i) => {
      ctx.fillText(row.label, boxX + 70, sBoxY + 45 + i * 40);
      ctx.textAlign = 'right';
      ctx.font = 'bold 18px "Outfit", sans-serif';
      ctx.fillStyle = '#f87171';
      ctx.fillText(row.val, boxX + boxW - 70, sBoxY + 45 + i * 40);
      ctx.textAlign = 'left';
      ctx.font = '18px "Outfit", sans-serif';
      ctx.fillStyle = '#f1f5f9';
    });

    // Try Again Button
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(this.endPlayAgainBtn.x, this.endPlayAgainBtn.y, this.endPlayAgainBtn.width, this.endPlayAgainBtn.height, 12);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 26px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('TRY AGAIN ↺', 640, this.endPlayAgainBtn.y + 40);

    ctx.restore();
  }
}
