import { Enemy } from '../entities/Enemy';
import { ENEMY_CONFIGS } from '../constants';

export class HelmetEnemy extends Enemy {
  constructor(x: number, y: number, lane: number) {
    const cfg = ENEMY_CONFIGS['helmet'];
    super(x, y, 64, 88, lane, 'helmet', cfg.hp, cfg.speed, cfg.damage, cfg.attackInterval, cfg.scoreValue, cfg.armorHp);
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

    const walkBob = Math.abs(Math.sin(this.walkAnimTimer * 4.5)) * 4;
    const walkTilt = Math.sin(this.walkAnimTimer * 4.5) * 0.07;
    ctx.translate(0, -walkBob);
    ctx.rotate(walkTilt);

    if (this.slowTimer > 0) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
    }

    // Legs
    const legPhase = Math.sin(this.walkAnimTimer * 4.5);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-10 - legPhase * 8, 24, 8, 18, 4);
    ctx.roundRect(4 + legPhase * 8, 24, 8, 18, 4);
    ctx.fill();

    // Body
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(-16, -2, 32, 28, 6);
    ctx.fill();

    // Arms
    const armSwing = this.isAttacking ? Math.sin(this.chewAnimTimer * 9) * 12 : Math.cos(this.walkAnimTimer * 4.5) * 10;
    ctx.fillStyle = '#65a30d';
    ctx.beginPath();
    ctx.roundRect(-22, 2 + armSwing * 0.4, 7, 16, 3);
    ctx.roundRect(-14 - armSwing * 0.5, 6, 16, 7, 3);
    ctx.fill();

    // Goblin Head
    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.ellipse(0, -18, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(-7, -18, 5, 6, -0.1, 0, Math.PI * 2);
    ctx.ellipse(5, -18, 5, 6, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(-8, -18, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -18, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth / Chomp
    const mouthOpen = this.isAttacking ? Math.abs(Math.sin(this.chewAnimTimer * 9)) * 8 : 2;
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.ellipse(-2, -8, 8, mouthOpen + 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-6, -8 - mouthOpen / 2);
    ctx.lineTo(-4, -5);
    ctx.lineTo(-2, -8 - mouthOpen / 2);
    ctx.lineTo(0, -5);
    ctx.lineTo(2, -8 - mouthOpen / 2);
    ctx.closePath();
    ctx.fill();

    // Armor Helmet (Copper / Bronze battle pot) if armor > 0
    if (this.armorHp > 0) {
      ctx.save();
      // Armor vibration when taking hit
      if (this.hitFlashTimer > 0) {
        ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2);
      }

      // Copper Helmet Body
      const helmetGrad = ctx.createLinearGradient(-22, -42, 22, -14);
      helmetGrad.addColorStop(0, '#f59e0b');
      helmetGrad.addColorStop(0.5, '#d97706');
      helmetGrad.addColorStop(1, '#92400e');

      ctx.fillStyle = helmetGrad;
      ctx.beginPath();
      ctx.moveTo(-20, -18);
      ctx.lineTo(-22, -38);
      ctx.quadraticCurveTo(0, -46, 22, -38);
      ctx.lineTo(20, -18);
      ctx.closePath();
      ctx.fill();

      // Rim
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(-24, -20, 48, 6, 3);
      ctx.fill();

      // Metallic gleam highlight
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, -38);
      ctx.quadraticCurveTo(0, -43, 16, -38);
      ctx.stroke();

      // Helmet visor slit / rivet
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(0, -32, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    if (this.slowTimer > 0) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
      ctx.beginPath();
      ctx.arc(-8, -12, 3, 0, Math.PI * 2);
      ctx.arc(8, -6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    this.renderHealthBar(ctx);
  }
}
