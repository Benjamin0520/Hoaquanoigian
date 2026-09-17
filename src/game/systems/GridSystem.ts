import { GRID_ROWS, GRID_COLS, GRID_X, GRID_Y, CELL_WIDTH, CELL_HEIGHT } from '../constants';
import { Plant } from '../entities/Plant';
import { Point, Rect } from '../types';

export class GridSystem {
  // 2D grid matrix of plants [row][col]
  private grid: (Plant | null)[][] = [];

  constructor() {
    this.reset();
  }

  public reset() {
    this.grid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.grid[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        this.grid[r][c] = null;
      }
    }
  }

  public getPlant(row: number, col: number): Plant | null {
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return null;
    return this.grid[row][col];
  }

  public setPlant(row: number, col: number, plant: Plant | null) {
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
      this.grid[row][col] = plant;
    }
  }

  public removeDeadPlants(): Plant[] {
    const removed: Plant[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const p = this.grid[r][c];
        if (p && (!p.active || p.hp <= 0)) {
          removed.push(p);
          this.grid[r][c] = null;
        }
      }
    }
    return removed;
  }

  public getAllPlants(): Plant[] {
    const list: Plant[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const p = this.grid[r][c];
        if (p && p.active) {
          list.push(p);
        }
      }
    }
    return list;
  }

  // Converts canvas (x, y) coordinates to cell indices (col, row)
  public screenToGrid(x: number, y: number): { col: number; row: number } | null {
    if (
      x < GRID_X ||
      x >= GRID_X + GRID_COLS * CELL_WIDTH ||
      y < GRID_Y ||
      y >= GRID_Y + GRID_ROWS * CELL_HEIGHT
    ) {
      return null;
    }
    const col = Math.floor((x - GRID_X) / CELL_WIDTH);
    const row = Math.floor((y - GRID_Y) / CELL_HEIGHT);
    return { col, row };
  }

  // Gets center canvas coordinates of a cell
  public getCellCenter(row: number, col: number): Point {
    return {
      x: GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2,
      y: GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2 + 10,
    };
  }

  // Gets rectangular bounds of a cell
  public getCellBounds(row: number, col: number): Rect {
    return {
      x: GRID_X + col * CELL_WIDTH,
      y: GRID_Y + row * CELL_HEIGHT,
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
    };
  }

  // Render lush garden background
  public renderLawn(ctx: CanvasRenderingContext2D, hoveredCell: { col: number; row: number } | null, isPlacementValid: boolean | null) {
    ctx.save();

    // 1. Garden background grass (checkerboard pattern)
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cellX = GRID_X + c * CELL_WIDTH;
        const cellY = GRID_Y + r * CELL_HEIGHT;

        // Alternating lush garden green shades
        const isDark = (r + c) % 2 === 0;
        ctx.fillStyle = isDark ? '#3b7a48' : '#458c54';
        ctx.fillRect(cellX, cellY, CELL_WIDTH, CELL_HEIGHT);

        // Subtle grass texture flecks
        ctx.fillStyle = isDark ? '#478f56' : '#529f63';
        ctx.beginPath();
        ctx.rect(cellX + 18, cellY + 22, 6, 3);
        ctx.rect(cellX + 65, cellY + 70, 7, 3);
        ctx.rect(cellX + 80, cellY + 28, 5, 2.5);
        ctx.fill();

        // Subtle cell grid divider line
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(cellX, cellY, CELL_WIDTH, CELL_HEIGHT);
      }
    }

    // 2. Left side: House Porch / Cobblestone defense terrace
    const terraceX = 130;
    const terraceW = GRID_X - terraceX;
    const terraceH = GRID_ROWS * CELL_HEIGHT;

    // Cobblestone patio base
    ctx.fillStyle = '#64748b';
    ctx.fillRect(terraceX, GRID_Y, terraceW, terraceH);

    // Stone tile grooves
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    for (let r = 0; r <= GRID_ROWS; r++) {
      const y = GRID_Y + r * CELL_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(terraceX, y);
      ctx.lineTo(GRID_X, y);
      ctx.stroke();
    }

    // Brick texture details
    ctx.fillStyle = '#94a3b8';
    for (let r = 0; r < GRID_ROWS; r++) {
      const cy = GRID_Y + r * CELL_HEIGHT + CELL_HEIGHT / 2;
      ctx.beginPath();
      ctx.roundRect(terraceX + 20, cy - 8, 48, 16, 3);
      ctx.fill();
    }

    // Leftmost safety barrier (white picket garden fence)
    ctx.fillStyle = '#f8fafc';
    for (let y = GRID_Y - 20; y < GRID_Y + terraceH + 20; y += 36) {
      // Picket post
      ctx.beginPath();
      ctx.moveTo(110, y + 30);
      ctx.lineTo(110, y + 8);
      ctx.lineTo(118, y);
      ctx.lineTo(126, y + 8);
      ctx.lineTo(126, y + 30);
      ctx.closePath();
      ctx.fill();
    }
    // Horizontal fence beams
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(105, GRID_Y + 15, 25, 8);
    ctx.fillRect(105, GRID_Y + terraceH - 35, 25, 8);

    // 3. Right side: Dirt enemy approach lane
    const dirtX = GRID_X + GRID_COLS * CELL_WIDTH;
    const dirtW = 1280 - dirtX;
    const dirtGrad = ctx.createLinearGradient(dirtX, 0, 1280, 0);
    dirtGrad.addColorStop(0, '#5c3d1f');
    dirtGrad.addColorStop(1, '#3b2512');

    ctx.fillStyle = dirtGrad;
    ctx.fillRect(dirtX, GRID_Y, dirtW, terraceH);

    // Pebbles in dirt path
    ctx.fillStyle = '#78542c';
    for (let r = 0; r < GRID_ROWS; r++) {
      const py = GRID_Y + r * CELL_HEIGHT + 30;
      ctx.beginPath();
      ctx.arc(dirtX + 25, py, 4, 0, Math.PI * 2);
      ctx.arc(dirtX + 55, py + 35, 6, 0, Math.PI * 2);
      ctx.arc(dirtX + 70, py + 15, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Hovered cell highlight preview
    if (hoveredCell) {
      const cellBounds = this.getCellBounds(hoveredCell.row, hoveredCell.col);
      ctx.save();
      if (isPlacementValid === true) {
        // Green highlight
        ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
        ctx.strokeStyle = '#22c55e';
      } else if (isPlacementValid === false) {
        // Red highlight
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.strokeStyle = '#ef4444';
      } else {
        // Neutral white hover
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      }
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cellBounds.x + 2, cellBounds.y + 2, cellBounds.width - 4, cellBounds.height - 4, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
