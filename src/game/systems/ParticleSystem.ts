import { Particle, DamageText } from '../types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private damageTexts: DamageText[] = [];
  private nextTextId: number = 1;

  public addParticle(p: Particle) {
    this.particles.push(p);
  }

  public emitBurst(
    x: number,
    y: number,
    color: string,
    count: number = 8,
    speed: number = 120,
    size: number = 4,
    type: Particle['type'] = 'circle'
  ) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      const maxLife = 0.3 + Math.random() * 0.35;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: size * (0.6 + Math.random() * 0.8),
        color,
        alpha: 1,
        maxLife,
        life: 0,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
        type,
      });
    }
  }

  // Floating text like "+25", "-20", "BLOCKED"
  public addFloatingText(x: number, y: number, text: string, color: string = '#fef08a', scale: number = 1.0) {
    this.damageTexts.push({
      id: this.nextTextId++,
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      text,
      color,
      alpha: 1.0,
      scale,
      life: 0,
      maxLife: 1.1,
    });
  }

  public update(dt: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Light gravity / friction
      p.vy += 120 * dt;
      p.vx *= (1 - 1.5 * dt);
      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot * dt;
      }
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
    }

    // Update floating damage / resource texts
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const t = this.damageTexts[i];
      t.life += dt;
      if (t.life >= t.maxLife) {
        this.damageTexts.splice(i, 1);
        continue;
      }
      t.y -= 38 * dt; // Float upwards
      const progress = t.life / t.maxLife;
      // Pop scale in first 15%, then stabilize and fade
      if (progress < 0.15) {
        t.scale = 1.0 + (progress / 0.15) * 0.3;
      } else {
        t.scale = 1.0 + 0.3 * (1 - (progress - 0.15) / 0.85);
      }
      t.alpha = Math.max(0, 1 - Math.pow(progress, 2));
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Render particles
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'leaf') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.8, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'snow') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'rock') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.rect(-p.size / 2, -p.size / 2, p.size * 1.2, p.size * 0.9);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Render floating texts
    ctx.save();
    ctx.font = 'bold 20px "Outfit", "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const t of this.damageTexts) {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      // Text stroke for crisp visibility
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      ctx.strokeText(t.text, 0, 0);

      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  public clear() {
    this.particles = [];
    this.damageTexts = [];
  }
}
