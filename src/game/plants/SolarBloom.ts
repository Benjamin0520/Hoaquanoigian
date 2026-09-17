import { Plant } from '../entities/Plant';
import { Sun } from '../entities/Sun';

export class SolarBloom extends Plant {
  public sunTimer: number = 4.0; // Spawns first sun reasonably quickly (4s after planting)
  public readonly sunInterval: number = 18.0; // Then every 18s
  public glowIntensity: number = 0;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 70, 80, row, col, 'solar-bloom', 300);
  }

  // Returns a newly produced Sun if ready
  public checkProduceSun(dt: number): Sun | null {
    this.sunTimer += dt;

    // Glow builds up in last 2 seconds
    const timeUntilSun = this.sunInterval - this.sunTimer;
    if (timeUntilSun <= 2.0 && timeUntilSun > 0) {
      this.glowIntensity = (2.0 - timeUntilSun) / 2.0;
    } else {
      this.glowIntensity = 0;
    }

    if (this.sunTimer >= this.sunInterval) {
      this.sunTimer = 0;
      this.glowIntensity = 0;
      // Spawn Sun directly beside/above the bloom
      const targetY = this.y + 15;
      return new Sun(this.x, this.y - 20, targetY, false);
    }
    return null;
  }

  public override render(ctx: CanvasRenderingContext2D) {
    this.renderBase(ctx);

    ctx.save();
    ctx.translate(this.x, this.y);

    // Hit flash tint
    if (this.hitFlashTimer > 0) {
      ctx.filter = 'brightness(1.8) saturate(0.5)';
    }

    // Swaying stem
    const sway = Math.sin(this.idleAnimTimer * 2.5) * 0.08;
    ctx.rotate(sway);

    // Green Stem
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.quadraticCurveTo(-4, 10, 0, -5);
    ctx.stroke();

    // Leaves
    ctx.fillStyle = '#22c55e';
    // Left leaf
    ctx.beginPath();
    ctx.ellipse(-16, 18, 14, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Right leaf
    ctx.beginPath();
    ctx.ellipse(16, 20, 14, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Solar Glow before spawning sun
    if (this.glowIntensity > 0) {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 25 * this.glowIntensity;
    }

    // Rotating Petal Ring (12 petals)
    ctx.save();
    ctx.translate(0, -8);
    const petalRotation = this.idleAnimTimer * 0.5;
    ctx.rotate(petalRotation);

    ctx.fillStyle = '#f59e0b';
    for (let i = 0; i < 12; i++) {
      ctx.rotate((Math.PI * 2) / 12);
      ctx.beginPath();
      ctx.ellipse(0, -24, 7, 13, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Face Disk
    ctx.translate(0, -8);
    const faceGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 19);
    faceGrad.addColorStop(0, '#fef08a');
    faceGrad.addColorStop(0.6, '#facc15');
    faceGrad.addColorStop(1, '#eab308');

    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.fill();

    // Happy eyes
    ctx.fillStyle = '#713f12';
    ctx.beginPath();
    ctx.arc(-6, -2, 2.8, 0, Math.PI * 2);
    ctx.arc(6, -2, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-7, -3, 1, 0, Math.PI * 2);
    ctx.arc(5, -3, 1, 0, Math.PI * 2);
    ctx.fill();

    // Cheerful Smile
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 3, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Rosy Cheeks
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.arc(-10, 3, 3.5, 0, Math.PI * 2);
    ctx.arc(10, 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
