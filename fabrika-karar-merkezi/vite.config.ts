import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Tek dosya çıktısı: CSS, JS ve veri HTML'in içine gömülür; sunucusuz açılır.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    outDir: 'cikti',
    emptyOutDir: true,
    chunkSizeWarningLimit: 10000,
    cssCodeSplit: false,
  },
});
