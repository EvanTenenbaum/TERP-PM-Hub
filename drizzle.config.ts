import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Detect dialect from connection string
const dialect = connectionString.startsWith('file:') ? 'sqlite' : 'mysql';

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: dialect as 'mysql' | 'sqlite',
  dbCredentials: dialect === 'sqlite' 
    ? { url: connectionString.replace('file:', '') }
    : { url: connectionString },
});
