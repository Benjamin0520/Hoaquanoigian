import { Enemy } from '../entities/Enemy';
import { ENEMY_CONFIGS } from '../constants';

export class Tank extends Enemy {
  constructor(x: number, y: number, lane: number) {
    const cfg = ENEMY_CONFIGS['tank'];
    super(x, y, 84, 100, lane, 'tank', cfg.hp, cfg.speed, cfg.damage, cfg.attackInterval, cfg.scoreValue);
  }

  public override render(ctx: CanvasRenderingContext2D) {
    this.renderShadow(ctx);

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.hitFlashTimer > 0) {
      ctx.filter = 'brightness(1.9) saturate(0.4)';
    }

    if (this.isDying) {
      const progress = this.deathTimer / 0.45;
      ctx.rotate(progress * Math.PI * 2);
      ctx.scale(1 - progress, 1 - progress);
      ctx.globalAlpha = 1 - progress;
    }

    // Heavy stomping walk bob
    const stompBob = Math.abs(Math.sin(this.walkAnimTimer * 3.5)) * 5;
    const stompWobble = Math.sin(this.walkAnimTimer * 3.5) * 0.05;
    ctx.translate(0, -stompBob);
    ctx.rotate(stompWobble);

    if (this.slowTimer > 0) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
    }

    // Heavy Stone Legs
    const legPhase = Math.sin(this.walkAnimTimer * 3.5);
    ctx.fillStyle = '#334155';
    // Back leg
    ctx.beginPath();
    ctx.roundRect(-18 - legPhase * 10, 26, 16, 26, 5);
    ctx.fill();
    // Front leg
    ctx.beginPath();
    ctx.roundRect(4 + legPhase * 10, 26, 16, 26, 5);
    ctx.fill();

    // Massive Armored Torso
    const torsoGrad = ctx.createLinearGradient(-26, -10, 26, 26);
    torsoGrad.addColorStop(0, '#64748b');
    torsoGrad.addColorStop(1, '#334155');

    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.roundRect(-26, -6, 52, 36, 8);
    ctx.fill();

    // Iron chest plate rivets
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(-18, 4, 3, 0, Math.PI * 2);
    ctx.arc(18, 4, 3, 0, Math.PI * 2);
    ctx.arc(-18, 20, 3, 0, Math.PI * 2);
    ctx.arc(18, 20, 3, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Boulder Pauldrons (Shoulders)
    ctx.fillStyle = '#475569';
    // Left shoulder
    ctx.beginPath();
    ctx.roundRect(-36, -16, 18, 22, 6);
    ctx.fill();
    // Right shoulder
    ctx.beginPath();
    ctx.roundRect(18, -16, 18, 22, 6);
    ctx.fill();

    // Spiked Fists
    const armSwing = this.isAttacking ? Math.sin(this.chewAnimTimer * 8) * 14 : Math.cos(this.walkAnimTimer * 3.5) * 12;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-30, 20 + armSwing * 0.4, 12, 0, Math.PI * 2);
    ctx.arc(24 - armSwing * 0.4, 20, 12, 0, Math.PI * 2);
    ctx.fill();

    // Huge Brutish Head
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(-18, -32, 36, 30, 8);
    ctx.fill();

    // Glowing Red Eyes
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.rect(-12, -26, 8, 5);
    ctx.rect(4, -26, 8, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Heavy Stone Jaw & Chomp
    const jawOpen = this.isAttacking ? Math.abs(Math.sin(this.chewAnimTimer * 8)) * 10 : 3;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.rect(-14, -14, 28, jawOpen + 6);
    ctx.fill();

    // Blunt tusks / teeth
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-12, -14 + jawOpen);
    ctx.lineTo(-8, -18);
    ctx.lineTo(-4, -14 + jawOpen);
    ctx.moveTo(4, -14 + jawOpen);
    ctx.lineTo(8, -18);
    ctx.lineTo(12, -14 + jawOpen);
    ctx.closePath();
    ctx.fill();

    if (this.slowTimer > 0) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
      ctx.beginPath();
      ctx.arc(-16, -10, 4, 0, Math.PI * 2);
      ctx.arc(14, -4, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    this.renderHealthBar(ctx);
  }
}
