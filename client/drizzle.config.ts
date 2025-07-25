import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle', // Directory for generated files
  schema: './drizzle/schema.ts', // Schema file to be generated
  dialect: 'postgresql', // Database dialect
  dbCredentials: {
    url: 'postgresql://admin:password@localhost:5432/rively?sslmode=disable',
  },
});
