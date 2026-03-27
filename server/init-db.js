import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function initDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');
    const schema = fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');
    await client.query(schema);
    console.log('Schema created successfully');
  } catch (err) {
    console.error('Error creating schema', err);
  } finally {
    await client.end();
  }
}

initDB();
