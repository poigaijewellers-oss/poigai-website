import { defaultClientConditions, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Background removal loads its WebAssembly from a CDN on demand, so keep the 30 MB file out of the site build.
    conditions: ['onnxruntime-web-use-extern-wasm', ...defaultClientConditions],
  },
});
