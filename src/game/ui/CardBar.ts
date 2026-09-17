import { PLANT_CONFIGS } from '../constants';
import { PlantType, Rect } from '../types';

export interface CardState {
  type: PlantType;
  cooldownTimer: number; // remaining cooldown in seconds
  totalCooldown: number;
}

export class CardBar {
  public cards: CardState[] = [];
  public selectedCard: PlantType | 'shovel' | null = null;
  public hoveredCard: PlantType | 'shovel' | null = null;

  // Deck position
  private readonly startX = 240;
  private readonly startY = 8;
  private readonly cardW = 90;
  private readonly cardH = 92;
  private readonly cardGap = 10;

  // Shovel tool position
  private readonly shovelX = 840;
  private readonly shovelY = 12;
  private readonly shovelW = 75;
  private readonly shovelH = 84;

  constructor() {
    this.reset();
  }

  public reset() {
    this.selectedCard = null;
    this.hoveredCard = null;
    this.cards = [
      { type: 'solar-bloom', cooldownTimer: 0, totalCooldown: PLANT_CONFIGS['solar-bloom'].cooldown },
      { type: 'seed-shooter', cooldownTimer: 0, totalCooldown: PLANT_CONFIGS['seed-shooter'].cooldown },
      { type: 'double-shooter', cooldownTimer: 0, totalCooldown: PLANT_CONFIGS['double-shooter'].cooldown },
      { type: 'stone-root', cooldownTimer: 0, totalCooldown: PLANT_CONFIGS['stone-root'].cooldown },
      { type: 'frost-flower', cooldownTimer: 0, totalCooldown: PLANT_CONFIGS['frost-flower'].cooldown },
    ];
  }

  public update(dt: number) {
    for (const card of this.cards) {
      if (card.cooldownTimer > 0) {
        card.cooldownTimer = Math.max(0, card.cooldownTimer - dt);
      }
    }
  }

  public triggerCooldown(type: PlantType) {
    const card = this.cards.find((c) => c.type === type);
    if (card) {
      card.cooldownTimer = card.totalCooldown;
    }
  }

  public isCardReady(type: PlantType, currentSun: number): boolean {
    const card = this.cards.find((c) => c.type === type);
    if (!card) return false;
    const cost = PLANT_CONFIGS[type].cost;
    return card.cooldownTimer <= 0 && currentSun >= cost;
  }

  public getCardBounds(index: number): Rect {
    return {
      x: this.startX + index * (this.cardW + this.cardGap),
      y: this.startY,
      width: this.cardW,
      height: this.cardH,
    };
  }

  public getShovelBounds(): Rect {
    return {
      x: this.shovelX,
      y: this.shovelY,
      width: this.shovelW,
      height: this.shovelH,
    };
  }

  public handleMouseMove(x: number, y: number) {
    this.hoveredCard = null;

    // Check cards
    for (let i = 0; i < this.cards.length; i++) {
      const b = this.getCardBounds(i);
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        this.hoveredCard = this.cards[i].type;
        return;
      }
    }

    // Check shovel
    const sb = this.getShovelBounds();
    if (x >= sb.x && x <= sb.x + sb.width && y >= sb.y && y <= sb.y + sb.height) {
      this.hoveredCard = 'shovel';
    }
  }

  // Returns action on click: 'solar-bloom' | 'seed-shooter' ... | 'shovel' | null
  public handleClick(x: number, y: number, currentSun: number): { type: PlantType | 'shovel' | null; error?: string } {
    // Check cards
    for (let i = 0; i < this.cards.length; i++) {
      const b = this.getCardBounds(i);
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        const card = this.cards[i];
        const cost = PLANT_CONFIGS[card.type].cost;

        if (card.cooldownTimer > 0) {
          return { type: null, error: 'Recharging...' };
        }
        if (currentSun < cost) {
          return { type: null, error: `Need ${cost} Sun!` };
        }

        // Toggle selection
        if (this.selectedCard === card.type) {
          this.selectedCard = null;
        } else {
          this.selectedCard = card.type;
        }
        return { type: this.selectedCard };
      }
    }

    // Check shovel
    const sb = this.getShovelBounds();
    if (x >= sb.x && x <= sb.x + sb.width && y >= sb.y && y <= sb.y + sb.height) {
      this.selectedCard = this.selectedCard === 'shovel' ? null : 'shovel';
      return { type: this.selectedCard };
    }

    return { type: null };
  }

  public selectHotkey(num: number, currentSun: number): { type: PlantType | 'shovel' | null; error?: string } {
    if (num >= 1 && num <= this.cards.length) {
      const card = this.cards[num - 1];
      const cost = PLANT_CONFIGS[card.type].cost;
      if (card.cooldownTimer > 0) return { type: null, error: 'Recharging...' };
      if (currentSun < cost) return { type: null, error: `Need ${cost} Sun!` };
      this.selectedCard = card.type;
      return { type: card.type };
    }
    return { type: null };
  }

  public render(ctx: CanvasRenderingContext2D, currentSun: number) {
    ctx.save();

    // 1. Render Plant Cards
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      const cfg = PLANT_CONFIGS[card.type];
      const b = this.getCardBounds(i);
      const isSelected = this.selectedCard === card.type;
      const isHovered = this.hoveredCard === card.type;
      const hasSun = currentSun >= cfg.cost;
      const isCooling = card.cooldownTimer > 0;

      // Outer Card Frame
      ctx.save();
      ctx.translate(b.x, b.y);

      // Selected glow
      if (isSelected) {
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 14;
      }

      // Card Background (Wooden / Seed Packet style)
      ctx.fillStyle = isSelected ? '#fed7aa' : '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(0, 0, b.width, b.height, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = isSelected ? '#ea580c' : isHovered ? '#64748b' : '#94a3b8';
      ctx.lineWidth = isSelected ? 3.5 : 2;
      ctx.stroke();

      // Inner art frame
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(5, 5, b.width - 10, 48, 5);
      ctx.fill();

      // Hotkey badge (top left)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.beginPath();
      ctx.roundRect(7, 7, 16, 15, 3);
      ctx.fill();
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, 15, 15);

      // Plant Icon / Mini Graphic
      this.renderMiniPlantIcon(ctx, card.type, b.width / 2, 28);

      // Plant Name
      ctx.font = 'bold 10px "Fredoka", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cfg.name, b.width / 2, 60);

      // Cost Badge (bottom right)
      ctx.fillStyle = hasSun ? '#15803d' : '#991b1b';
      ctx.beginPath();
      ctx.roundRect(b.width / 2 - 28, 70, 56, 16, 4);
      ctx.fill();

      // Sun icon & cost text
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`☀️ ${cfg.cost}`, b.width / 2, 78);

      // Cooldown Swipe Overlay (shades down from top)
      if (isCooling) {
        const cooldownRatio = card.cooldownTimer / card.totalCooldown;
        const overlayH = b.height * cooldownRatio;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.beginPath();
        ctx.roundRect(0, 0, b.width, overlayH, 8);
        ctx.fill();

        // Seconds remaining
        ctx.font = 'bold 14px "Outfit", sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(`${card.cooldownTimer.toFixed(1)}s`, b.width / 2, b.height / 2);
        ctx.shadowBlur = 0;
      } else if (!hasSun) {
        // Red tint if not enough sun
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.beginPath();
        ctx.roundRect(0, 0, b.width, b.height, 8);
        ctx.fill();
      }

      ctx.restore();
    }

    // 2. Render Shovel Tool
    const sb = this.getShovelBounds();
    const isShovelSelected = this.selectedCard === 'shovel';
    const isShovelHovered = this.hoveredCard === 'shovel';

    ctx.save();
    ctx.translate(sb.x, sb.y);

    if (isShovelSelected) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
    }

    // Shovel Card Background
    ctx.fillStyle = isShovelSelected ? '#bae6fd' : '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(0, 0, sb.width, sb.height, 8);
    ctx.fill();

    ctx.strokeStyle = isShovelSelected ? '#0284c7' : isShovelHovered ? '#64748b' : '#94a3b8';
    ctx.lineWidth = isShovelSelected ? 3.5 : 2;
    ctx.stroke();

    // Shovel Graphic
    ctx.save();
    ctx.translate(sb.width / 2, 34);
    ctx.rotate(-0.4);

    // Handle
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 10);
    ctx.stroke();

    // Grip
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(-6, -22, 12, 6, 2);
    ctx.fill();

    // Spade blade
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(-9, 10);
    ctx.lineTo(9, 10);
    ctx.lineTo(7, 24);
    ctx.lineTo(0, 28);
    ctx.lineTo(-7, 24);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Label
    ctx.font = 'bold 12px "Fredoka", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Dig Up', sb.width / 2, 70);

    ctx.restore();

    // 3. Render Tooltip if hovered
    if (this.hoveredCard && this.hoveredCard !== 'shovel') {
      const cfg = PLANT_CONFIGS[this.hoveredCard];
      this.renderTooltip(ctx, cfg.name, cfg.cost, cfg.description);
    } else if (this.hoveredCard === 'shovel') {
      this.renderTooltip(ctx, 'Shovel', 0, 'Remove any plant from your garden to free its space.');
    }

    ctx.restore();
  }

  private renderMiniPlantIcon(ctx: CanvasRenderingContext2D, type: PlantType, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    if (type === 'solar-bloom') {
      // Little sunflower
      ctx.fillStyle = '#f59e0b';
      for (let i = 0; i < 8; i++) {
        ctx.rotate((Math.PI * 2) / 8);
        ctx.beginPath();
        ctx.ellipse(0, -12, 4, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'seed-shooter') {
      // Little green shooter
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.moveTo(3, -4);
      ctx.lineTo(13, -7);
      ctx.lineTo(13, 3);
      ctx.lineTo(3, 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(3, -2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'double-shooter') {
      // Double shooter with red headband
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.rect(4, -8, 11, 4);
      ctx.rect(4, 0, 11, 4);
      ctx.fill();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-8, -6, 16, 3);
    } else if (type === 'stone-root') {
      // Nut rock
      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.ellipse(0, -11, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0c0a09';
      ctx.beginPath();
      ctx.arc(-2, -3, 1.8, 0, Math.PI * 2);
      ctx.arc(4, -3, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'frost-flower') {
      // Ice crystal flower
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 6; i++) {
        ctx.rotate((Math.PI * 2) / 6);
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.lineTo(4, -4);
        ctx.lineTo(-4, -4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderTooltip(ctx: CanvasRenderingContext2D, title: string, cost: number, desc: string) {
    const boxX = 240;
    const boxY = 104;
    const boxW = 420;
    const boxH = 50;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 14px "Fredoka", sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${title} ${cost > 0 ? `(Cost: ${cost} ☀️)` : ''}`, boxX + 12, boxY + 8);

    ctx.font = '12px "Outfit", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(desc, boxX + 12, boxY + 28);

    ctx.restore();
  }
}
