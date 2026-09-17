import { Plant } from '../entities/Plant';
import { Projectile } from '../entities/Projectile';

export class SeedShooter extends Plant {
  public shootTimer: number = 0;
  public readonly shootInterval: number = 1.4;
  public readonly damageValue: number = 20;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 70, 80, row, col, 'seed-shooter', 300);
    this.shootTimer = Math.random() * 0.5; // Slight initial offset
  }

  // Returns new Projectile if condition met and cooldown elapsed
  public checkShoot(dt: number, hasEnemyInLane: boolean): Projectile | null {
    this.shootTimer += dt;

    if (!hasEnemyInLane) {
      return null;
    }

    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.attackAnimTimer = 0.2; // 200ms recoil
      return new Projectile(this.x + 32, this.y - 12, this.gridRow, this.damageValue, false);
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

    // Idle breathing & recoil animation
    const idleSway = Math.sin(this.idleAnimTimer * 3) * 0.05;
    const recoilX = this.attackAnimTimer > 0 ? -Math.sin((this.attackAnimTimer / 0.2) * Math.PI) * 7 : 0;
    const recoilSquish = this.attackAnimTimer > 0 ? 1.15 : 1.0;

    // Stem
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.quadraticCurveTo(-4, 10, recoilX, -2);
    ctx.stroke();

    // Stem Leaves
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(-18, 16, 16, 7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(14, 22, 14, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Head positioning with recoil and sway
    ctx.translate(recoilX, -8);
    ctx.rotate(idleSway);

    // Back Leaf Crest
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.quadraticCurveTo(-28, -12, -26, 6);
    ctx.quadraticCurveTo(-18, 2, -12, 4);
    ctx.closePath();
    ctx.fill();

    // Cannon Snout / Barrel (Shoots to the right)
    const snoutGrad = ctx.createLinearGradient(0, -10, 24, 6);
    snoutGrad.addColorStop(0, '#22c55e');
    snoutGrad.addColorStop(1, '#15803d');

    ctx.fillStyle = snoutGrad;
    ctx.beginPath();
    ctx.moveTo(6, -10);
    ctx.lineTo(24, -14 * recoilSquish);
    ctx.lineTo(24, 6 * recoilSquish);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();

    // Snout Rim opening
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.ellipse(24, -4, 4, 10 * recoilSquish, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head Sphere
    const headGrad = ctx.createRadialGradient(-5, -8, 4, 0, -4, 22);
    headGrad.addColorStop(0, '#86efac');
    headGrad.addColorStop(0.5, '#22c55e');
    headGrad.addColorStop(1, '#16a34a');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, -4, 20, 0, Math.PI * 2);
    ctx.fill();

    // Big expressive black eyes
    ctx.fillStyle = '#0f172a';
    // Right eye (closer)
    ctx.beginPath();
    ctx.ellipse(8, -8, 5, 7, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Left eye
    ctx.beginPath();
    ctx.ellipse(-2, -8, 4.5, 6.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight pupils
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(9, -10, 2, 0, Math.PI * 2);
    ctx.arc(-1, -10, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
