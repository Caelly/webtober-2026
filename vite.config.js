import { defineConfig } from 'vite';
import { readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const days = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name) && existsSync(resolve(root, entry.name, 'index.html')));

function dayRoutes() {
  const apply = (server) => {
    server.middlewares.use((request, response, next) => {
      const [path, query = ''] = String(request.url || '').split('?');
      if (!/^\/\d+(?:\/\d+)?$/.test(path)) return next();
      response.statusCode = 302;
      response.setHeader('Location', `${path}/${query ? `?${query}` : ''}`);
      response.end();
    });
  };
  return { name: 'day-routes', configureServer: apply, configurePreviewServer: apply };
}

export default defineConfig({
  root,
  publicDir: resolve(root, '1/public'),
  plugins: [dayRoutes()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  build: {
    rollupOptions: {
      input: Object.fromEntries([
        ['index', resolve(root, 'index.html')],
        ...days.map((day) => [`day-${day.name}`, resolve(root, day.name, 'index.html')]),
        ...days.flatMap(day=>readdirSync(resolve(root,day.name),{withFileTypes:true})
          .filter(entry=>entry.isDirectory()&&/^\d+$/.test(entry.name)&&existsSync(resolve(root,day.name,entry.name,'index.html')))
          .map(entry=>[`day-${day.name}-${entry.name}`,resolve(root,day.name,entry.name,'index.html')])),
      ]),
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
});
