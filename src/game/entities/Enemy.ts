import { Entity } from './Entity';
import { EnemyType } from '../types';
import { Plant } from './Plant';

export abstract class Enemy extends Entity {
  public enemyType: EnemyType;
  public hp: number;
  public maxHp: number;
  public armorHp: number = 0;
  public maxArmorHp: number = 0;
  public baseSpeed: number;
  public speed: number;
  public damagePerBite: number;
  public attackInterval: number;
  public attackTimer: number = 0;
  public slowTimer: number = 0;
  public hitFlashTimer: number = 0;
  public isAttacking: boolean = false;
  public targetPlant: Plant | null = null;
  public walkAnimTimer: number = Math.random() * 10;
  public chewAnimTimer: number = 0;
  public deathTimer: number = 0;
  public isDying: boolean = false;
  public scoreValue: number = 100;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    lane: number,
    type: EnemyType,
    hp: number,
    speed: number,
    damage: number,
    attackInterval: number,
    scoreValue: number,
    armorHp: number = 0
  ) {
    super(x, y, width, height, lane);
    this.enemyType = type;
    this.hp = hp;
    this.maxHp = hp;
    this.armorHp = armorHp;
    this.maxArmorHp = armorHp;
    this.baseSpeed = speed;
    this.speed = speed;
    this.damagePerBite = damage;
    this.attackInterval = attackInterval;
    this.scoreValue = scoreValue;
  }

  // Returns { armorBroke: boolean, died: boolean }
  public takeDamage(amount: number, isFrost: boolean = false): { armorBroke: boolean; died: boolean } {
    this.hitFlashTimer = 0.12;
    let armorBroke = false;

    if (isFrost) {
      this.slowTimer = 3.5; // Slow down for 3.5 seconds
    }

    if (this.armorHp > 0) {
      this.armorHp -= amount;
      if (this.armorHp <= 0) {
        armorBroke = true;
        const remaining = -this.armorHp;
        this.armorHp = 0;
        this.hp -= remaining;
      }
    } else {
      this.hp -= amount;
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDying = true;
      return { armorBroke, died: true };
    }

    return { armorBroke, died: false };
  }

  public override update(dt: number) {
    // If dying, play death anim and remove
    if (this.isDying) {
      this.deathTimer += dt;
      if (this.deathTimer > 0.45) {
        this.active = false;
      }
      return;
    }

    // Slow effect decay
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      this.speed = this.baseSpeed * 0.5; // 50% slow
    } else {
      this.speed = this.baseSpeed;
    }

    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }

    // Target plant check
    if (this.targetPlant && (!this.targetPlant.active || this.targetPlant.hp <= 0)) {
      this.targetPlant = null;
      this.isAttacking = false;
    }

    if (this.isAttacking && this.targetPlant) {
      this.chewAnimTimer += dt;
      this.attackTimer += dt;
      if (this.attackTimer >= this.attackInterval) {
        this.attackTimer = 0;
        this.targetPlant.damage(this.damagePerBite);
      }
    } else {
      // Walk leftwards
      this.x -= this.speed * dt;
      this.walkAnimTimer += dt * (this.speed / 25);
    }
  }

  // Mini health bar display when damaged
  protected renderHealthBar(ctx: CanvasRenderingContext2D) {
    const totalCurrent = this.hp + this.armorHp;
    const totalMax = this.maxHp + this.maxArmorHp;

    // Only render if damaged or if armor exists
    if (totalCurrent >= totalMax && this.maxArmorHp === 0) return;

    const barW = 54;
    const barH = 7;
    const barX = this.x - barW / 2;
    const barY = this.y - this.height * 0.58;

    ctx.save();
    // Background shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 4);
    ctx.fill();

    // Red missing health background
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 3);
    ctx.fill();

    // HP portion (green)
    const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
    const baseHpBarW = barW * (this.maxHp / totalMax);
    const currentHpBarW = baseHpBarW * hpRatio;

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(barX, barY, currentHpBarW, barH, 3);
    ctx.fill();

    // Armor portion (metallic bronze/copper) if applicable
    if (this.maxArmorHp > 0 && this.armorHp > 0) {
      const armorRatio = Math.max(0, Math.min(1, this.armorHp / this.maxArmorHp));
      const armorMaxBarW = barW * (this.maxArmorHp / totalMax);
      const currentArmorBarW = armorMaxBarW * armorRatio;

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(barX + currentHpBarW, barY, currentArmorBarW, barH, 3);
      ctx.fill();
    }

    ctx.restore();
  }

  protected renderShadow(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 20, 10, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.height * 0.42, this.width * 0.4, this.height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
