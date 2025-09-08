import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // 解决 buffer 等 Node.js 核心模块的问题
      buffer: 'buffer',
      process: 'process/browser',
      'iconv-lite': 'iconv-lite/lib/index.js'
    },
  },
  define: {
    global: 'globalThis',
    process: {
      env: {},
      browser: true
    }
  },
  build: {
    // 禁用 HTML 入口点
    rollupOptions: {
      input: resolve(__dirname, 'utils/print_cpcl.js'),
      output: {
        entryFileNames: 'utils/print_cpcl.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'cjs',
        exports: 'default'
      },
      external: []
    },
    target: 'es2015',
    lib: {
      entry: resolve(__dirname, 'utils/print_cpcl.js'),
      name: 'PrintCPCL',
      formats: ['cjs'],
      fileName: () => 'utils/print_cpcl.js'
    },
    outDir: 'dist',
    emptyOutDir: true,
    // 确保依赖项被打包进去
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'iconv-lite']
  }
});
