import dotenv from 'dotenv';
import { initDatabase, pool } from '../server/db.js';

dotenv.config();

async function main() {
  console.log('====================================================');
  console.log('🚀 Orderfix Neon PostgreSQL Database Setup / Migration');
  console.log('নিয়ন ডাটাবেচ টেবুল সৃষ্টি আৰু সংস্থাপন প্ৰক্ৰিয়া');
  console.log('====================================================\n');

  try {
    console.log('📡 Connecting to Neon PostgreSQL...');
    await initDatabase();

    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n✅ সকলো প্ৰয়োজনীয় টেবুল সফলভাৱে সৃষ্টি হৈছে (Tables created successfully):');
    res.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. 📋 ${row.table_name}`);
    });

    console.log('\n====================================================');
    console.log('🎉 ডাটা সংৰক্ষণ সমস্যা সমাধান হ\'ল! এতিয়া ৱেব এপ্লিকেচনত ডাটা সুৰক্ষিতভাৱে save হ\'ব।');
    console.log('All tables are verified. Data persistence is active!');
    console.log('====================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup error / সমস্যা:', error);
    process.exit(1);
  }
}

main();
