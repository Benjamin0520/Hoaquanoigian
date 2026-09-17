import { Rect } from '../types';

export abstract class Entity {
  public x: number = 0;
  public y: number = 0;
  public width: number = 60;
  public height: number = 60;
  public lane: number = 0;
  public active: boolean = true;

  constructor(x: number, y: number, width: number, height: number, lane: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.lane = lane;
  }

  public getBounds(): Rect {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  public abstract update(dt: number): void;
  public abstract render(ctx: CanvasRenderingContext2D): void;
}
