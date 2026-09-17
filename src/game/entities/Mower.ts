import { Entity } from './Entity';
import { MOWER_SPEED } from '../constants';

export class Mower extends Entity {
  public isTriggered: boolean = false;
  public bladeAngle: number = 0;
  public wheelAnim: number = 0;
  public idleBobTimer: number = Math.random() * 5;

  constructor(x: number, y: number, lane: number) {
    super(x, y, 70, 50, lane);
  }

  public trigger() {
    if (this.isTriggered) return;
    this.isTriggered = true;
  }

  public override update(dt: number) {
    this.idleBobTimer += dt;
    this.bladeAngle += dt * (this.isTriggered ? 35 : 4);

    if (this.isTriggered) {
      this.x += MOWER_SPEED * dt;
      this.wheelAnim += dt * 25;

      if (this.x > 1320) {
        this.active = false;
      }
    }
  }

  public override render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Subtle vibration when idle, intense shake when rolling
    const shake = this.isTriggered ? (Math.random() - 0.5) * 3 : Math.sin(this.idleBobTimer * 5) * 0.8;
    ctx.translate(0, shake);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 34, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Robot Wheels (Treads / Dual rubber tires)
    ctx.fillStyle = '#1e293b';
    // Back wheel
    ctx.beginPath();
    ctx.arc(-22, 16, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(-22, 16, 6, 0, Math.PI * 2);
    ctx.fill();

    // Front wheel
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(14, 16, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(14, 16, 5, 0, Math.PI * 2);
    ctx.fill();

    // Main Chassis: Aerodynamic orange/red wedge engine
    const chassisGrad = ctx.createLinearGradient(-30, -15, 25, 15);
    chassisGrad.addColorStop(0, '#ea580c');
    chassisGrad.addColorStop(1, '#c2410c');

    ctx.fillStyle = chassisGrad;
    ctx.beginPath();
    ctx.moveTo(-28, 14);
    ctx.lineTo(-24, -12);
    ctx.lineTo(10, -10);
    ctx.lineTo(26, 10);
    ctx.lineTo(22, 16);
    ctx.closePath();
    ctx.fill();

    // Side safety stripes (black/yellow hazard stripes)
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, 4);
    ctx.lineTo(2, -4);
    ctx.moveTo(0, 4);
    ctx.lineTo(12, -4);
    ctx.stroke();

    // Steel Motor Hood / Exhaust
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(-22, -18, 16, 8, 2);
    ctx.fill();

    // Small exhaust pipe
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.rect(-20, -26, 5, 10);
    ctx.fill();

    // Front Buzz Saw / Rotary Blade Cutter
    ctx.save();
    ctx.translate(28, 10);
    ctx.rotate(this.bladeAngle);

    // Blade disc
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Sharp saw teeth
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 6; i++) {
      ctx.rotate((Math.PI * 2) / 6);
      ctx.beginPath();
      ctx.moveTo(14, -4);
      ctx.lineTo(21, 0);
      ctx.lineTo(14, 4);
      ctx.closePath();
      ctx.fill();
    }

    // Center blade nut
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Glowing LED alert light on top
    const ledColor = this.isTriggered ? '#ef4444' : '#22c55e';
    ctx.fillStyle = ledColor;
    ctx.shadowColor = ledColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(5, -14, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
