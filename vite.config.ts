import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Robustly try to find the key with different common names
  const apiKey = env.VITE_API_KEY || env.API_KEY || env.GOOGLE_API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // This maps process.env.API_KEY in your code to the string value of the key.
      // We use JSON.stringify to ensure it's wrapped in quotes in the final JS.
      // If no key is found, it defaults to "" (empty string) to prevent 'process is not defined' errors.
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});