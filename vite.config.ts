import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Đảm bảo đường dẫn tương đối để chạy được trên GitHub Pages
  server: {
    port: 5173,
    host: true
  }
});
