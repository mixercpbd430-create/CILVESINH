const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_MVY6oR5bqLpZ@ep-dark-hall-a18niv4v-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS cleaning_records (
        id SERIAL PRIMARY KEY,
        equipment_id VARCHAR(50) NOT NULL,
        worker_name VARCHAR(100) NOT NULL,
        photo_data TEXT,
        notes TEXT,
        cleaned_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_equipment (
        id SERIAL PRIMARY KEY,
        equipment_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) NOT NULL,
        category VARCHAR(50) NOT NULL,
        instructions TEXT DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS equipment_overrides (
        equipment_id VARCHAR(50) PRIMARY KEY,
        instructions TEXT,
        is_hidden BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cleaning_records_equipment 
      ON cleaning_records(equipment_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cleaning_records_cleaned_at 
      ON cleaning_records(cleaned_at);
    `);
    
    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
