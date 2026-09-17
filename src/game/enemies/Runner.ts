import { Enemy } from '../entities/Enemy';
import { ENEMY_CONFIGS } from '../constants';

export class Runner extends Enemy {
  constructor(x: number, y: number, lane: number) {
    const cfg = ENEMY_CONFIGS['runner'];
    super(x, y, 64, 80, lane, 'runner', cfg.hp, cfg.speed, cfg.damage, cfg.attackInterval, cfg.scoreValue);
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

    // Sprinting forward lean
    const sprintLean = this.isAttacking ? 0 : -0.22;
    const runBob = Math.abs(Math.sin(this.walkAnimTimer * 10)) * 5;
    ctx.translate(0, -runBob);
    ctx.rotate(sprintLean);

    if (this.slowTimer > 0) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
    }

    // Rapid Sprinting Legs
    const legPhase = Math.sin(this.walkAnimTimer * 12);
    ctx.fillStyle = '#dc2626'; // Red running shorts
    ctx.beginPath();
    ctx.roundRect(-12, 14, 24, 12, 3);
    ctx.fill();

    // Fast running sneakers
    ctx.fillStyle = '#f97316'; // Orange skin legs
    ctx.beginPath();
    ctx.roundRect(-12 - legPhase * 14, 24, 7, 18, 3);
    ctx.roundRect(4 + legPhase * 14, 24, 7, 18, 3);
    ctx.fill();

    // Red sneakers
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(-16 - legPhase * 14, 40, 7, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(0 + legPhase * 14, 40, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Athletic tank top)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-14, -2, 28, 22, 5);
    ctx.fill();

    // Pumping arms
    const armSwing = Math.sin(this.walkAnimTimer * 12) * 14;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(-18 + armSwing * 0.4, 2, 6, 14, 3);
    ctx.roundRect(10 - armSwing * 0.4, 2, 6, 14, 3);
    ctx.fill();

    // Head
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, -18, 16, 0, Math.PI * 2);
    ctx.fill();

    // Runner Headband
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.rect(-16, -26, 32, 7);
    ctx.fill();

    // Flying headband tails
    ctx.beginPath();
    ctx.moveTo(16, -24);
    ctx.lineTo(30, -28);
    ctx.lineTo(26, -20);
    ctx.closePath();
    ctx.fill();

    // Focused Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-6, -18, 4.5, 5, -0.1, 0, Math.PI * 2);
    ctx.ellipse(4, -18, 4.5, 5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-8, -18, 2.2, 0, Math.PI * 2);
    ctx.arc(2, -18, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Determined mouth / chomping
    const mouthOpen = this.isAttacking ? Math.abs(Math.sin(this.chewAnimTimer * 12)) * 7 : 2;
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.ellipse(-2, -9, 7, mouthOpen + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.slowTimer > 0) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
      ctx.beginPath();
      ctx.arc(-6, -14, 2.5, 0, Math.PI * 2);
      ctx.arc(6, -6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    this.renderHealthBar(ctx);
  }
}
