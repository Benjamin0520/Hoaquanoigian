import { Enemy } from '../entities/Enemy';
import { ENEMY_CONFIGS } from '../constants';

export class Walker extends Enemy {
  constructor(x: number, y: number, lane: number) {
    const cfg = ENEMY_CONFIGS['walker'];
    super(x, y, 64, 85, lane, 'walker', cfg.hp, cfg.speed, cfg.damage, cfg.attackInterval, cfg.scoreValue);
  }

  public override render(ctx: CanvasRenderingContext2D) {
    this.renderShadow(ctx);

    ctx.save();
    ctx.translate(this.x, this.y);

    // Hit flash
    if (this.hitFlashTimer > 0) {
      ctx.filter = 'brightness(1.9) saturate(0.4)';
    }

    // Chilled / Frozen visual tint
    if (this.slowTimer > 0) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.strokeStyle = '#38bdf8';
    }

    // Death animation: spin and shrink
    if (this.isDying) {
      const progress = this.deathTimer / 0.45;
      ctx.rotate(progress * Math.PI * 2);
      ctx.scale(1 - progress, 1 - progress);
      ctx.globalAlpha = 1 - progress;
    }

    // Walking wobble
    const walkBob = Math.abs(Math.sin(this.walkAnimTimer * 5)) * 4;
    const walkTilt = Math.sin(this.walkAnimTimer * 5) * 0.08;
    ctx.translate(0, -walkBob);
    ctx.rotate(walkTilt);

    // Chilled icy aura indicator
    if (this.slowTimer > 0) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
    }

    // Legs
    const legPhase = Math.sin(this.walkAnimTimer * 5);
    ctx.fillStyle = '#334155';
    // Back leg
    ctx.beginPath();
    ctx.roundRect(-10 - legPhase * 8, 24, 8, 18, 4);
    ctx.fill();
    // Front leg
    ctx.beginPath();
    ctx.roundRect(4 + legPhase * 8, 24, 8, 18, 4);
    ctx.fill();

    // Body (Ragged tunic over goblin skin)
    ctx.fillStyle = '#64748b'; // Worn gray-blue shirt
    ctx.beginPath();
    ctx.roundRect(-16, -2, 32, 28, 6);
    ctx.fill();

    // Goblin arms
    const armSwing = this.isAttacking ? Math.sin(this.chewAnimTimer * 10) * 12 : Math.cos(this.walkAnimTimer * 5) * 10;
    ctx.fillStyle = '#65a30d'; // Olive goblin skin
    // Left arm
    ctx.beginPath();
    ctx.roundRect(-22, 2 + armSwing * 0.4, 7, 16, 3);
    ctx.fill();
    // Right arm reaching forward
    ctx.beginPath();
    ctx.roundRect(-14 - armSwing * 0.5, 6, 16, 7, 3);
    ctx.fill();

    // Goblin Head
    ctx.fillStyle = '#84cc16'; // Bright olive green
    ctx.beginPath();
    ctx.ellipse(0, -18, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pointy Goblin Ears
    ctx.fillStyle = '#65a30d';
    // Left ear
    ctx.beginPath();
    ctx.moveTo(-16, -18);
    ctx.lineTo(-26, -24);
    ctx.lineTo(-14, -12);
    ctx.closePath();
    ctx.fill();
    // Right ear
    ctx.beginPath();
    ctx.moveTo(16, -18);
    ctx.lineTo(26, -24);
    ctx.lineTo(14, -12);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fef08a'; // Yellow monster eyes
    ctx.beginPath();
    ctx.ellipse(-7, -20, 5, 6, -0.1, 0, Math.PI * 2);
    ctx.ellipse(5, -20, 5, 6, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Pupils (looking leftwards towards house)
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(-8, -20, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth / Chewing animation
    const mouthOpen = this.isAttacking ? Math.abs(Math.sin(this.chewAnimTimer * 10)) * 8 : 2;
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.ellipse(-2, -9, 8, mouthOpen + 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jagged teeth
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-7, -9 - mouthOpen / 2);
    ctx.lineTo(-5, -6);
    ctx.lineTo(-3, -9 - mouthOpen / 2);
    ctx.lineTo(-1, -6);
    ctx.lineTo(1, -9 - mouthOpen / 2);
    ctx.closePath();
    ctx.fill();

    // Frost overlay ice crystals if slowed
    if (this.slowTimer > 0) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
      ctx.beginPath();
      ctx.arc(-4, -14, 3, 0, Math.PI * 2);
      ctx.arc(8, -8, 2.5, 0, Math.PI * 2);
      ctx.arc(-8, 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Health bar above head
    this.renderHealthBar(ctx);
  }
}
