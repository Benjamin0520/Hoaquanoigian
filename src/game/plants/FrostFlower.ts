import { Plant } from '../entities/Plant';
import { Projectile } from '../entities/Projectile';

export class FrostFlower extends Plant {
  public shootTimer: number = 0;
  public readonly shootInterval: number = 1.5;
  public readonly damageValue: number = 20;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 70, 80, row, col, 'frost-flower', 300);
    this.shootTimer = Math.random() * 0.4;
  }

  public checkShoot(dt: number, hasEnemyInLane: boolean): Projectile | null {
    this.shootTimer += dt;

    if (!hasEnemyInLane) {
      return null;
    }

    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.attackAnimTimer = 0.22;
      return new Projectile(this.x + 32, this.y - 12, this.gridRow, this.damageValue, true);
    }
    return null;
  }

  public override render(ctx: CanvasRenderingContext2D) {
    this.renderBase(ctx);

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.hitFlashTimer > 0) {
      ctx.filter = 'brightness(1.8) saturate(0.5)';
    }

    const idleSway = Math.sin(this.idleAnimTimer * 2.8) * 0.06;
    const recoilX = this.attackAnimTimer > 0 ? -Math.sin((this.attackAnimTimer / 0.22) * Math.PI) * 7 : 0;

    // Chilled Cyan Glow Aura
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;

    // Frosted Cyan/Teal Stem
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.quadraticCurveTo(-4, 10, recoilX, -2);
    ctx.stroke();

    // Frost crystalline leaves
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(-18, 16, 15, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(15, 22, 13, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(recoilX, -8);
    ctx.rotate(idleSway);

    // Icy Crystal Petal Crown (6 crystalline petals around head)
    ctx.save();
    ctx.rotate(this.idleAnimTimer * 0.3);
    ctx.fillStyle = '#7dd3fc';
    for (let i = 0; i < 6; i++) {
      ctx.rotate((Math.PI * 2) / 6);
      ctx.beginPath();
      ctx.moveTo(-6, -14);
      ctx.lineTo(0, -32);
      ctx.lineTo(6, -14);
      ctx.closePath();
      ctx.fill();

      // White crystal edge
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    // Ice Cannon Snout
    const snoutGrad = ctx.createLinearGradient(0, -10, 24, 6);
    snoutGrad.addColorStop(0, '#0284c7');
    snoutGrad.addColorStop(1, '#0369a1');

    ctx.fillStyle = snoutGrad;
    ctx.beginPath();
    ctx.moveTo(6, -10);
    ctx.lineTo(24, -13);
    ctx.lineTo(24, 5);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();

    // Rim
    ctx.fillStyle = '#075985';
    ctx.beginPath();
    ctx.ellipse(24, -4, 4, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Frosted Head
    const headGrad = ctx.createRadialGradient(-5, -6, 3, 0, -3, 20);
    headGrad.addColorStop(0, '#e0f2fe');
    headGrad.addColorStop(0.5, '#38bdf8');
    headGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, -4, 20, 0, Math.PI * 2);
    ctx.fill();

    // Frost crystalline eyebrows
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.ellipse(8, -14, 5, 2, 0.2, 0, Math.PI * 2);
    ctx.ellipse(-2, -14, 4.5, 2, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.ellipse(8, -7, 4.5, 6, 0.1, 0, Math.PI * 2);
    ctx.ellipse(-2, -7, 4, 5.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(9, -9, 1.8, 0, Math.PI * 2);
    ctx.arc(-1, -9, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
