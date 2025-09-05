import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      preview: {
        host: '0.0.0.0',
        port: process.env.PORT || 8080,
        allowedHosts: true,
      },
      define: {
        'process.env.API_KEY': JSON.stringify('AIzaSyCRpTSz4nFY-XWZtjGOKustJ3vN4OfZ0eg'),
        'process.env.GEMINI_API_KEY': JSON.stringify('AIzaSyCRpTSz4nFY-XWZtjGOKustJ3vN4OfZ0eg')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
