import { Entity } from './Entity';
import { PlantType } from '../types';

export abstract class Plant extends Entity {
  public plantType: PlantType;
  public gridRow: number;
  public gridCol: number;
  public hp: number;
  public maxHp: number;
  public hitFlashTimer: number = 0;
  public idleAnimTimer: number = Math.random() * 10;
  public attackAnimTimer: number = 0;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    row: number,
    col: number,
    plantType: PlantType,
    hp: number
  ) {
    super(x, y, width, height, row);
    this.gridRow = row;
    this.gridCol = col;
    this.plantType = plantType;
    this.hp = hp;
    this.maxHp = hp;
  }

  public damage(amount: number) {
    this.hp -= amount;
    this.hitFlashTimer = 0.12; // Flash for 120ms
    if (this.hp <= 0) {
      this.hp = 0;
      this.active = false;
    }
  }

  public override update(dt: number) {
    this.idleAnimTimer += dt;
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
    }
    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= dt;
    }
  }

  // Common plant base render: shadow, soil hillock, hit flash tint
  protected renderBase(ctx: CanvasRenderingContext2D) {
    // Soft drop shadow
    ctx.save();
    ctx.fillStyle = 'rgba(10, 25, 12, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.height * 0.38, this.width * 0.45, this.height * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Small mound of rich garden soil
    ctx.fillStyle = '#4a2c11';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.height * 0.35, this.width * 0.32, this.height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6b421a';
    ctx.beginPath();
    ctx.ellipse(this.x - 2, this.y + this.height * 0.34, this.width * 0.22, this.height * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
