import { Plant } from '../entities/Plant';

export class StoneRoot extends Plant {
  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 76, 90, row, col, 'stone-root', 4000);
  }

  public override render(ctx: CanvasRenderingContext2D) {
    this.renderBase(ctx);

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.hitFlashTimer > 0) {
      ctx.filter = 'brightness(1.8) saturate(0.5)';
    }

    // Gentle breathing scale
    const breath = 1.0 + Math.sin(this.idleAnimTimer * 2) * 0.02;
    ctx.scale(breath, 2.0 - breath);

    const hpPercent = this.hp / this.maxHp;

    // Rock body gradient
    const rockGrad = ctx.createRadialGradient(-10, -15, 6, 0, 5, 42);
    rockGrad.addColorStop(0, '#a8a29e');
    rockGrad.addColorStop(0.5, '#78716c');
    rockGrad.addColorStop(1, '#44403c');

    // Solid Root-Rock Body
    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    ctx.moveTo(-28, 28);
    ctx.quadraticCurveTo(-36, -8, -22, -32);
    ctx.quadraticCurveTo(0, -42, 22, -32);
    ctx.quadraticCurveTo(36, -8, 28, 28);
    ctx.quadraticCurveTo(0, 36, -28, 28);
    ctx.closePath();
    ctx.fill();

    // Moss patches on top head
    ctx.fillStyle = '#65a30d';
    ctx.beginPath();
    ctx.ellipse(-10, -36, 12, 7, -0.2, 0, Math.PI * 2);
    ctx.ellipse(12, -35, 10, 6, 0.2, 0, Math.PI * 2);
    ctx.ellipse(0, -38, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cracks depending on HP
    if (hpPercent < 0.67) {
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2.5;
      // Light crack on top-right
      ctx.beginPath();
      ctx.moveTo(10, -30);
      ctx.lineTo(16, -18);
      ctx.lineTo(12, -8);
      ctx.stroke();
    }

    if (hpPercent < 0.34) {
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 3.5;
      // Deep heavy crack across left side
      ctx.beginPath();
      ctx.moveTo(-18, -25);
      ctx.lineTo(-12, -10);
      ctx.lineTo(-22, 5);
      ctx.lineTo(-16, 22);
      ctx.stroke();

      // Additional hairline crack
      ctx.beginPath();
      ctx.moveTo(-12, -10);
      ctx.lineTo(-4, -4);
      ctx.stroke();
    }

    // Big expressive cartoon eyes
    ctx.fillStyle = '#1c1917';
    // Eye whites
    ctx.fillStyle = '#f5f5f4';
    ctx.beginPath();
    ctx.ellipse(-12, -10, 8, 11, -0.05, 0, Math.PI * 2);
    ctx.ellipse(12, -10, 8, 11, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Eye pupils (look rightwards towards incoming enemies)
    ctx.fillStyle = '#0c0a09';
    ctx.beginPath();
    ctx.arc(-9, -9, 4.5, 0, Math.PI * 2);
    ctx.arc(15, -9, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-8, -11, 1.8, 0, Math.PI * 2);
    ctx.arc(16, -11, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows & Mouth reflecting HP state
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2.5;

    if (hpPercent >= 0.67) {
      // Proud & happy eyebrows
      ctx.beginPath();
      ctx.moveTo(-18, -24);
      ctx.quadraticCurveTo(-12, -26, -6, -22);
      ctx.moveTo(6, -22);
      ctx.quadraticCurveTo(12, -26, 18, -24);
      ctx.stroke();

      // Content smile
      ctx.beginPath();
      ctx.arc(0, 8, 8, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else if (hpPercent >= 0.34) {
      // Worried sloped eyebrows
      ctx.beginPath();
      ctx.moveTo(-18, -22);
      ctx.lineTo(-6, -26);
      ctx.moveTo(6, -26);
      ctx.lineTo(18, -22);
      ctx.stroke();

      // Wavy worried mouth
      ctx.beginPath();
      ctx.moveTo(-10, 10);
      ctx.quadraticCurveTo(0, 6, 10, 10);
      ctx.stroke();
    } else {
      // Determined grimace / grit teeth
      ctx.beginPath();
      ctx.moveTo(-18, -26);
      ctx.lineTo(-6, -21);
      ctx.moveTo(6, -21);
      ctx.lineTo(18, -26);
      ctx.stroke();

      // Gritted teeth
      ctx.fillStyle = '#f5f5f4';
      ctx.beginPath();
      ctx.roundRect(-12, 6, 24, 10, 3);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-12, 11);
      ctx.lineTo(12, 11);
      ctx.moveTo(-4, 6);
      ctx.lineTo(-4, 16);
      ctx.moveTo(4, 6);
      ctx.lineTo(4, 16);
      ctx.stroke();
    }

    ctx.restore();
  }
}
