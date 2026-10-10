import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const DEFAULT_DATABASE_URL = "postgresql://neondb_owner:npg_CjIFNkea6v1c@ep-lucky-dawn-b54ac9t2-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function initDatabase() {
  console.log('🔄 Initializing Neon PostgreSQL Database tables...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Hotel Profile table (tracks first-time registration and settings)
    await client.query(`
      CREATE TABLE IF NOT EXISTS hotel_profile (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        whatsapp_number VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        hotel_license_number VARCHAR(100),
        police_station_name VARCHAR(255),
        police_station_whatsapp VARCHAR(50),
        police_station_email VARCHAR(255),
        police_station_incharge VARCHAR(255),
        upi_id VARCHAR(100),
        is_registered BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Rooms inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(50) PRIMARY KEY,
        room_number VARCHAR(20) NOT NULL,
        type VARCHAR(50) NOT NULL,
        base_price NUMERIC NOT NULL,
        default_ota_price NUMERIC NOT NULL,
        floor VARCHAR(20),
        capacity INT DEFAULT 2,
        amenities JSONB DEFAULT '[]'::jsonb,
        is_maintenance BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(50) PRIMARY KEY,
        room_id VARCHAR(50),
        room_number VARCHAR(20) NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        guest_email VARCHAR(255),
        check_in_date VARCHAR(20) NOT NULL,
        check_in_time VARCHAR(20),
        check_out_date VARCHAR(20) NOT NULL,
        check_out_time VARCHAR(20),
        total_amount NUMERIC NOT NULL,
        advance_paid NUMERIC DEFAULT 0,
        balance_due NUMERIC DEFAULT 0,
        channel VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        special_requests TEXT,
        ota_sync_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Police guest verifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS guest_verifications (
        id VARCHAR(50) PRIMARY KEY,
        booking_id VARCHAR(50),
        room_number VARCHAR(20) NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        age INT,
        gender VARCHAR(20),
        dob VARCHAR(50),
        id_type VARCHAR(50) NOT NULL,
        id_number VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        nationality VARCHAR(100) DEFAULT 'Indian',
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        check_in_date VARCHAR(20) NOT NULL,
        check_in_time VARCHAR(20),
        check_out_date VARCHAR(20) NOT NULL,
        purpose_of_visit VARCHAR(100),
        vehicle_number VARCHAR(50),
        id_photo_url TEXT,
        police_report_status VARCHAR(50) DEFAULT 'pending',
        dispatch_method VARCHAR(50),
        submitted_at VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Accounting Expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        amount NUMERIC NOT NULL,
        category VARCHAR(100) NOT NULL,
        date VARCHAR(20) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        notes TEXT,
        bill_number VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. System settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Neon PostgreSQL tables verified & ready!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization error:', err);
    throw err;
  } finally {
    client.release();
  }
}
