import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // 解决 buffer 等 Node.js 核心模块的问题
      buffer: require.resolve('buffer/'),
      process: 'process/browser',
    },
  },
  build: {
    rollupOptions: {
      external: ['buffer', 'process'],
    },
  },
});