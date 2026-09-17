import { Plant } from '../entities/Plant';
import { Projectile } from '../entities/Projectile';

export class DoubleShooter extends Plant {
  public shootTimer: number = 0;
  public readonly shootInterval: number = 1.4;
  public readonly damageValue: number = 20;
  private burstPending: boolean = false;
  private burstTimer: number = 0;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 70, 80, row, col, 'double-shooter', 300);
    this.shootTimer = Math.random() * 0.4;
  }

  public checkShoot(dt: number, hasEnemyInLane: boolean): Projectile | null {
    // Check second bullet in burst
    if (this.burstPending) {
      this.burstTimer += dt;
      if (this.burstTimer >= 0.16) {
        this.burstPending = false;
        this.burstTimer = 0;
        this.attackAnimTimer = 0.18;
        return new Projectile(this.x + 36, this.y - 12, this.gridRow, this.damageValue, false);
      }
      return null;
    }

    this.shootTimer += dt;
    if (!hasEnemyInLane) {
      return null;
    }

    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      this.burstPending = true;
      this.burstTimer = 0;
      this.attackAnimTimer = 0.18;
      return new Projectile(this.x + 36, this.y - 12, this.gridRow, this.damageValue, false);
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

    const idleSway = Math.sin(this.idleAnimTimer * 3.5) * 0.05;
    const recoilX = this.attackAnimTimer > 0 ? -Math.sin((this.attackAnimTimer / 0.18) * Math.PI) * 8 : 0;

    // Stem
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.quadraticCurveTo(-6, 10, recoilX, -2);
    ctx.stroke();

    // Leaves
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(-20, 16, 17, 8, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(15, 22, 15, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(recoilX, -8);
    ctx.rotate(idleSway);

    // Double Crest / Spikes behind head
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(-28, -18);
    ctx.lineTo(-20, -6);
    ctx.lineTo(-30, 2);
    ctx.lineTo(-12, 6);
    ctx.closePath();
    ctx.fill();

    // Twin Snout Barrel
    const snoutGrad = ctx.createLinearGradient(0, -14, 28, 8);
    snoutGrad.addColorStop(0, '#22c55e');
    snoutGrad.addColorStop(1, '#166534');

    ctx.fillStyle = snoutGrad;
    // Upper snout
    ctx.beginPath();
    ctx.moveTo(6, -14);
    ctx.lineTo(26, -16);
    ctx.lineTo(26, -4);
    ctx.lineTo(6, -2);
    ctx.closePath();
    ctx.fill();

    // Lower snout
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.lineTo(26, -2);
    ctx.lineTo(26, 10);
    ctx.lineTo(6, 8);
    ctx.closePath();
    ctx.fill();

    // Double nozzle rims
    ctx.fillStyle = '#052e16';
    ctx.beginPath();
    ctx.ellipse(26, -10, 3, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(26, 4, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head Sphere
    const headGrad = ctx.createRadialGradient(-5, -6, 4, 0, -2, 23);
    headGrad.addColorStop(0, '#86efac');
    headGrad.addColorStop(0.5, '#16a34a');
    headGrad.addColorStop(1, '#14532d');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, -2, 21, 0, Math.PI * 2);
    ctx.fill();

    // Tactical Headband (Leaf camo band)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.rect(-18, -14, 32, 6);
    ctx.fill();

    // Headband ribbon tails
    ctx.beginPath();
    ctx.moveTo(-18, -12);
    ctx.lineTo(-30, -18);
    ctx.lineTo(-26, -10);
    ctx.lineTo(-32, -6);
    ctx.closePath();
    ctx.fill();

    // Fierce Focused Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(8, -5, 5, 6, 0.15, 0, Math.PI * 2);
    ctx.ellipse(-2, -5, 4.5, 5.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(9, -7, 1.8, 0, Math.PI * 2);
    ctx.arc(-1, -7, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
