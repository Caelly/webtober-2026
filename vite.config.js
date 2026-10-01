import { defineConfig } from 'vite';
import { readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const days = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name) && existsSync(resolve(root, entry.name, 'index.html')));

export default defineConfig({
  root,
  publicDir: resolve(root, '1/public'),
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  build: {
    rollupOptions: {
      input: Object.fromEntries([
        ['index', resolve(root, 'index.html')],
        ...days.map((day) => [`day-${day.name}`, resolve(root, day.name, 'index.html')]),
      ]),
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
});
