// Path: backend\check_db.js
import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

const tables = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name;
`);

const columns = await client.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'conversation_members'
  ORDER BY ordinal_position;
`);

console.log("CONVERSATION MEMBERS COLUMNS:");
console.table(columns.rows);

console.log("TABLES:");
console.table(tables.rows);

const migrations = await client.query(`
  SELECT *
  FROM drizzle.__drizzle_migrations;
`);

console.log("DRIZZLE MIGRATIONS:");
console.table(migrations.rows);

await client.end();