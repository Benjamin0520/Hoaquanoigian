import { Rect } from '../types';

export class HUD {
  public sunPulseTimer: number = 0;

  // HUD Action Button bounds
  private readonly soundBtn: Rect = { x: 935, y: 55, width: 44, height: 36 };
  private readonly pauseBtn: Rect = { x: 987, y: 55, width: 44, height: 36 };
  private readonly debugBtn: Rect = { x: 1039, y: 55, width: 44, height: 36 };
  private readonly restartBtn: Rect = { x: 1091, y: 55, width: 80, height: 36 };

  public triggerSunPulse() {
    this.sunPulseTimer = 0.25;
  }

  public update(dt: number) {
    if (this.sunPulseTimer > 0) {
      this.sunPulseTimer -= dt;
    }
  }

  // Returns action if HUD button was clicked
  public handleClick(x: number, y: number): 'SOUND' | 'PAUSE' | 'DEBUG' | 'RESTART' | null {
    if (this.isInside(x, y, this.soundBtn)) return 'SOUND';
    if (this.isInside(x, y, this.pauseBtn)) return 'PAUSE';
    if (this.isInside(x, y, this.debugBtn)) return 'DEBUG';
    if (this.isInside(x, y, this.restartBtn)) return 'RESTART';
    return null;
  }

  private isInside(x: number, y: number, r: Rect): boolean {
    return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    sun: number,
    waveNum: number,
    totalWaves: number,
    waveProgress: number,
    isMuted: boolean,
    isPaused: boolean,
    isDebug: boolean
  ) {
    ctx.save();

    // 1. Sun Bank (Top Left)
    const bankX = 14;
    const bankY = 10;
    const bankW = 210;
    const bankH = 88;

    // Wood frame
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(bankX, bankY, bankW, bankH, 10);
    ctx.fill();

    // Inner plate
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.roundRect(bankX + 4, bankY + 4, bankW - 8, bankH - 8, 8);
    ctx.fill();

    // Sun Icon (Rotates & pulses)
    ctx.save();
    ctx.translate(bankX + 44, bankY + 44);
    const pulse = this.sunPulseTimer > 0 ? 1.25 : 1.0;
    ctx.scale(pulse, pulse);

    // Glowing rays
    ctx.fillStyle = '#f59e0b';
    for (let i = 0; i < 8; i++) {
      ctx.rotate((Math.PI * 2) / 8);
      ctx.beginPath();
      ctx.ellipse(0, -22, 4.5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Cute sun face
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(-5, -2, 2, 0, Math.PI * 2);
    ctx.arc(5, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    ctx.restore();

    // Text: SUN ENERGY
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.fillStyle = '#92400e';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('SUN ENERGY', bankX + 88, bankY + 16);

    // Sun Amount number
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.fillText(`${sun}`, bankX + 88, bankY + 34);

    // 2. Wave Progress Bar & Buttons (Top Right)
    const waveBoxX = 925;
    const waveBoxY = 10;
    const waveBoxW = 345;
    const waveBoxH = 88;

    // Wood frame
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(waveBoxX, waveBoxY, waveBoxW, waveBoxH, 10);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(waveBoxX + 3, waveBoxY + 3, waveBoxW - 6, waveBoxH - 6, 8);
    ctx.fill();

    // Wave number text
    ctx.font = 'bold 15px "Fredoka", sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Wave ${waveNum} of ${totalWaves}`, waveBoxX + 16, waveBoxY + 12);

    // Progress Bar Track
    const barX = waveBoxX + 16;
    const barY = waveBoxY + 32;
    const barW = waveBoxW - 32;
    const barH = 15;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 6);
    ctx.fill();

    // Progress Bar Fill (Smooth gradient)
    const fillW = Math.max(8, barW * Math.min(1.0, Math.max(0, waveProgress)));
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    fillGrad.addColorStop(0, '#22c55e');
    fillGrad.addColorStop(0.7, '#eab308');
    fillGrad.addColorStop(1, '#ef4444');

    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillW, barH, 6);
    ctx.fill();

    // Milestone flags at wave 5 and 10
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚩', barX + barW * 0.45 - 6, barY + 2);
    ctx.fillText('💀', barX + barW - 14, barY + 2);

    // 3. Control Buttons below Progress Bar
    // Sound Button
    this.renderButton(ctx, this.soundBtn, isMuted ? '🔇' : '🔊', '#475569');
    // Pause Button
    this.renderButton(ctx, this.pauseBtn, isPaused ? '▶️' : '⏸️', '#475569');
    // Debug Button
    this.renderButton(ctx, this.debugBtn, '🛠️', isDebug ? '#2563eb' : '#475569');
    // Restart Button
    this.renderButton(ctx, this.restartBtn, 'Restart', '#b91c1c', '13px');

    ctx.restore();
  }

  private renderButton(
    ctx: CanvasRenderingContext2D,
    rect: Rect,
    label: string,
    bgColor: string,
    fontSize: string = '16px'
  ) {
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 6);
    ctx.fill();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `bold ${fontSize} "Outfit", system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2);
    ctx.restore();
  }
}
