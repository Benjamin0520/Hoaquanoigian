import { Entity } from './Entity';

export class Projectile extends Entity {
  public damage: number;
  public speed: number = 380;
  public isFrost: boolean;
  public rotation: number = 0;

  constructor(x: number, y: number, lane: number, damage: number = 20, isFrost: boolean = false) {
    super(x, y, 20, 20, lane);
    this.damage = damage;
    this.isFrost = isFrost;
  }

  public override update(dt: number) {
    this.x += this.speed * dt;
    this.rotation += dt * 8;

    if (this.x > 1300) {
      this.active = false;
    }
  }

  public override render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.isFrost) {
      // Glowing cyan frost crystal
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;

      // Outer diamond
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(9, 0);
      ctx.lineTo(0, 9);
      ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fill();

      // Inner diamond
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 5);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();

      // Core star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Crisp botanical seed shooter pea
      ctx.shadowColor = 'rgba(74, 222, 128, 0.4)';
      ctx.shadowBlur = 8;

      // Base circle with gradient
      const grad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 8);
      grad.addColorStop(0, '#86efac');
      grad.addColorStop(0.5, '#22c55e');
      grad.addColorStop(1, '#15803d');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Gleam highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-2.5, -2.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
