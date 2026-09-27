import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

import { prerenderMarketingSite } from './scripts/prerender-marketing.mjs';

function prerenderMarketingPlugin(): Plugin {
  return {
    name: 'prerender-marketing',
    apply: 'build',
    async closeBundle() {
      await prerenderMarketingSite();
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), prerenderMarketingPlugin()],
});
