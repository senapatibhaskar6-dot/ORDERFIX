import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const DEFAULT_DATABASE_URL = "postgresql://neondb_owner:npg_CjIFNkea6v1c@ep-lucky-dawn-b54ac9t2-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

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
  console.log('🔄 Initializing Neon PostgreSQL Database tables & schemas...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Users Table (Authentication for Hotel Owners, Customers & Platform Admin)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255),
        phone VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'owner', -- 'owner' | 'customer' | 'admin'
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Hotel Owners Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hotel_owners (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        hotel_id VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        whatsapp VARCHAR(50),
        email VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Customers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Hotels & Guest Houses Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        property_type VARCHAR(50) NOT NULL DEFAULT 'Hotel', -- 'Hotel' | 'Homestay' | 'Resort' | 'Guest House' | 'Registration Hall'
        owner_name VARCHAR(255),
        owner_id VARCHAR(50),
        phone VARCHAR(50) NOT NULL,
        whatsapp_number VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100) DEFAULT 'Assam',
        pincode VARCHAR(20),
        description TEXT,
        images JSONB DEFAULT '[]'::jsonb,
        amenities JSONB DEFAULT '[]'::jsonb,
        entry_fee_paid BOOLEAN DEFAULT TRUE,
        entry_fee_amount NUMERIC DEFAULT 99,
        entry_fee_txnid VARCHAR(100),
        subscription_plan VARCHAR(50) DEFAULT 'trial_free_month',
        subscription_expires_at VARCHAR(50),
        trial_days_left INT DEFAULT 30,
        police_station_name VARCHAR(255),
        police_station_whatsapp VARCHAR(50),
        police_station_incharge VARCHAR(255),
        hotel_license_number VARCHAR(100),
        is_registered BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Backward compatibility table view / alias
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
        is_registered BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Rooms Inventory Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(50) PRIMARY KEY,
        hotel_id VARCHAR(50),
        room_number VARCHAR(20) NOT NULL,
        type VARCHAR(50) NOT NULL,
        base_price NUMERIC NOT NULL,
        default_ota_price NUMERIC DEFAULT 0,
        floor VARCHAR(20),
        capacity INT DEFAULT 2,
        amenities JSONB DEFAULT '[]'::jsonb,
        is_maintenance BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. Bookings Table (With 5% Online Commission vs 0% Offline Walk-in Split)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(50) PRIMARY KEY,
        hotel_id VARCHAR(50),
        customer_id VARCHAR(50),
        room_id VARCHAR(50),
        room_number VARCHAR(20) NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        guest_email VARCHAR(255),
        channel VARCHAR(50) NOT NULL DEFAULT 'offline', -- 'online' | 'offline'
        source VARCHAR(50) NOT NULL DEFAULT 'walk_in',
        portal_booking_id VARCHAR(100),
        check_in_date VARCHAR(20) NOT NULL,
        check_in_time VARCHAR(20),
        check_out_date VARCHAR(20) NOT NULL,
        check_out_time VARCHAR(20),
        nights INT DEFAULT 1,
        guest_count INT DEFAULT 2,
        room_charge NUMERIC NOT NULL,
        platform_commission NUMERIC DEFAULT 0, -- 5% for online, 0 for offline
        hotel_payout_amount NUMERIC NOT NULL,
        total_amount NUMERIC NOT NULL,
        advance_paid NUMERIC DEFAULT 0,
        balance_due NUMERIC DEFAULT 0,
        payment_status VARCHAR(50) DEFAULT 'paid',
        payment_method VARCHAR(50) DEFAULT 'cash',
        status VARCHAR(50) DEFAULT 'confirmed',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 7. Subscriptions Table (Tracks ₹99 Onboarding & 1-Month Free Trial)
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(50) PRIMARY KEY,
        hotel_id VARCHAR(50) NOT NULL,
        plan VARCHAR(50) NOT NULL DEFAULT 'trial_free_month',
        amount NUMERIC NOT NULL DEFAULT 99,
        is_trial BOOLEAN DEFAULT TRUE,
        expires_at VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 8. Accounting Expenses Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(50) PRIMARY KEY,
        hotel_id VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        amount NUMERIC NOT NULL,
        category VARCHAR(100) NOT NULL,
        date VARCHAR(20) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 9. Police Guest Verifications Table (Form C compliance)
    await client.query(`
      CREATE TABLE IF NOT EXISTS guest_verifications (
        id VARCHAR(50) PRIMARY KEY,
        booking_id VARCHAR(50),
        hotel_id VARCHAR(50),
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

    // 10. Cashfree Orders Log Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cashfree_orders (
        order_id VARCHAR(100) PRIMARY KEY,
        hotel_id VARCHAR(50),
        customer_phone VARCHAR(50),
        order_amount NUMERIC NOT NULL,
        order_currency VARCHAR(10) DEFAULT 'INR',
        order_purpose VARCHAR(100), -- 'entry_fee' | 'room_booking'
        payment_session_id TEXT,
        order_status VARCHAR(50) DEFAULT 'CREATED',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 11. Invoices & Billing Management Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(50) PRIMARY KEY,
        invoice_number VARCHAR(100) NOT NULL UNIQUE,
        booking_id VARCHAR(50),
        hotel_id VARCHAR(50) NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        guest_email VARCHAR(255),
        room_number VARCHAR(50) NOT NULL,
        room_type VARCHAR(100),
        check_in_date VARCHAR(20) NOT NULL,
        check_out_date VARCHAR(20) NOT NULL,
        nights INT DEFAULT 1,
        room_rate NUMERIC NOT NULL,
        room_total NUMERIC NOT NULL,
        extra_charges JSONB DEFAULT '[]'::jsonb,
        extra_charges_total NUMERIC DEFAULT 0,
        discount_amount NUMERIC DEFAULT 0,
        tax_rate NUMERIC DEFAULT 12,
        cgst_amount NUMERIC DEFAULT 0,
        sgst_amount NUMERIC DEFAULT 0,
        tax_total NUMERIC DEFAULT 0,
        subtotal NUMERIC NOT NULL,
        grand_total NUMERIC NOT NULL,
        advance_paid NUMERIC DEFAULT 0,
        balance_due NUMERIC DEFAULT 0,
        payment_method VARCHAR(50) DEFAULT 'cash',
        payment_status VARCHAR(50) DEFAULT 'paid',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('✅ All Neon PostgreSQL database tables verified & ready!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization error:', err);
    throw err;
  } finally {
    client.release();
  }
}
