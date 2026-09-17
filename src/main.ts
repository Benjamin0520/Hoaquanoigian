import './style.css';
import { Game } from './game/Game';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    console.error('Canvas element #game-canvas not found!');
    return;
  }

  const game = new Game(canvas);
  game.start();

  // Expose game instance to window for debugging / inspection if needed
  (window as unknown as { game: Game }).game = game;
});
