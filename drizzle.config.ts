import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Enable WebSocket constructor for Neon in Node.js environments
// This allows drizzle-kit to connect using @neondatabase/serverless during migrations
neonConfig.webSocketConstructor = ws as any;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
