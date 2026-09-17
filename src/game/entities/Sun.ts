import { Entity } from './Entity';
import { SUN_VALUE, SUN_LIFETIME } from '../constants';

export class Sun extends Entity {
  public value: number = SUN_VALUE;
  public targetY: number;
  public isFromSky: boolean;
  public state: 'FALLING' | 'HOVERING' | 'COLLECTING' = 'FALLING';
  public lifeTimer: number = 0;
  public animTimer: number = Math.random() * 5;
  public rayRotation: number = 0;
  
  // Plant jump physics
  private vx: number = 0;
  private vy: number = 0;

  // Collection animation
  private collectTargetX: number = 95;
  private collectTargetY: number = 48;
  private collectProgress: number = 0;
  private startCollectX: number = 0;
  private startCollectY: number = 0;

  constructor(x: number, y: number, targetY: number, isFromSky: boolean = true) {
    super(x, y, 64, 64, -1);
    this.targetY = targetY;
    this.isFromSky = isFromSky;

    if (!isFromSky) {
      // Plant pop arc
      this.vx = (Math.random() - 0.5) * 60;
      this.vy = -180;
    }
  }

  public collect() {
    if (this.state === 'COLLECTING') return;
    this.state = 'COLLECTING';
    this.startCollectX = this.x;
    this.startCollectY = this.y;
    this.collectProgress = 0;
  }

  public isClicked(px: number, py: number): boolean {
    if (this.state === 'COLLECTING' || !this.active) return false;
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= 40 * 40; // 40px radius click area
  }

  public override update(dt: number) {
    this.animTimer += dt;
    this.rayRotation += dt * 1.5;

    if (this.state === 'COLLECTING') {
      this.collectProgress += dt * 3.2; // Fly quickly to HUD
      if (this.collectProgress >= 1.0) {
        this.active = false;
        return;
      }
      // Smooth ease-in-out quadratic bezier curve to HUD
      const t = this.collectProgress;
      const controlX = Math.min(this.startCollectX, this.collectTargetX) - 50;
      const controlY = Math.min(this.startCollectY, this.collectTargetY) - 50;

      const oneMinusT = 1 - t;
      this.x = oneMinusT * oneMinusT * this.startCollectX + 2 * oneMinusT * t * controlX + t * t * this.collectTargetX;
      this.y = oneMinusT * oneMinusT * this.startCollectY + 2 * oneMinusT * t * controlY + t * t * this.collectTargetY;
      return;
    }

    if (this.state === 'FALLING') {
      if (this.isFromSky) {
        this.y += 85 * dt;
        if (this.y >= this.targetY) {
          this.y = this.targetY;
          this.state = 'HOVERING';
        }
      } else {
        // Jumping out of plant with parabolic arc
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 450 * dt; // Gravity
        if (this.y >= this.targetY) {
          this.y = this.targetY;
          this.state = 'HOVERING';
        }
      }
    } else if (this.state === 'HOVERING') {
      // Gentle floating bob
      this.lifeTimer += dt;
      if (this.lifeTimer >= SUN_LIFETIME) {
        this.active = false;
      }
    }
  }

  public override render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Scale and opacity if expiring
    let alpha = 1.0;
    if (this.state === 'HOVERING' && this.lifeTimer > SUN_LIFETIME - 2.5) {
      // Blink warning before expiring
      const blink = Math.sin(this.lifeTimer * 12);
      alpha = blink > 0 ? 0.9 : 0.35;
    } else if (this.state === 'COLLECTING') {
      alpha = Math.max(0.2, 1 - this.collectProgress * 0.4);
    }
    ctx.globalAlpha = alpha;

    // Bobbing offset
    const bobY = this.state === 'HOVERING' ? Math.sin(this.animTimer * 3) * 4 : 0;
    const renderY = this.y + bobY;

    // Drop shadow
    if (this.state === 'HOVERING') {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.targetY + 22, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.translate(this.x, renderY);

    // Warm Sun Aura
    const pulseScale = 1.0 + Math.sin(this.animTimer * 5) * 0.08;
    ctx.scale(pulseScale, pulseScale);

    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 18;

    // Rotating Sun Rays (8 rays)
    ctx.save();
    ctx.rotate(this.rayRotation);
    ctx.fillStyle = '#f59e0b';
    for (let i = 0; i < 8; i++) {
      ctx.rotate((Math.PI * 2) / 8);
      ctx.beginPath();
      ctx.moveTo(-7, -20);
      ctx.lineTo(0, -32);
      ctx.lineTo(7, -20);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Outer warm gold circle
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright yellow radiant core
    const coreGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 18);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, '#fef08a');
    coreGrad.addColorStop(1, '#facc15');

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Cute facial expression
    ctx.fillStyle = '#78350f';
    // Left eye
    ctx.beginPath();
    ctx.arc(-6, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.arc(6, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Cute smile
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 3, 5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(-9, 3, 3, 0, Math.PI * 2);
    ctx.arc(9, 3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
