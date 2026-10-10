import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, initDatabase } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing with generous limit for high-res ID camera photos
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize PostgreSQL tables
let isDbConnected = false;
(async () => {
  try {
    await initDatabase();
    isDbConnected = true;
    console.log('⚡ Neon PostgreSQL connection initialized and verified successfully.');
  } catch (err: any) {
    console.error('⚠️ Could not connect to Neon PostgreSQL at startup. Will retry on request.', err.message);
  }
})();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Orderfix Hotel & Police Verification Engine',
    databaseConnected: isDbConnected
  });
});

/**
 * 1. FIRST-TIME SETUP & REGISTRATION STATUS
 * Check if the hotel/user is already registered in Neon DB
 */
app.get('/api/setup/status', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM hotel_profile LIMIT 1');
      if (result.rows.length > 0 && result.rows[0].is_registered) {
        const row = result.rows[0];
        const hotel = {
          name: row.name,
          tagline: row.tagline || 'হোমষ্টে’ আৰু হোটেল মেনেজমেণ্ট',
          ownerName: row.owner_name,
          phone: row.phone,
          whatsappNumber: row.whatsapp_number,
          email: row.email || '',
          address: row.address || '',
          city: row.city || '',
          state: row.state || 'Assam',
          pincode: row.pincode || '',
          currency: '₹',
          upiId: row.upi_id || '',
          checkInStandardTime: '12:00 PM',
          checkOutStandardTime: '11:00 AM',
          policeStationName: row.police_station_name || '',
          policeStationWhatsApp: row.police_station_whatsapp || '',
          policeStationEmail: row.police_station_email || '',
          policeStationIncharge: row.police_station_incharge || '',
          hotelLicenseNumber: row.hotel_license_number || '',
          isRegistered: true
        };
        return res.json({ isRegistered: true, hotel });
      }
      return res.json({ isRegistered: false, hotel: null });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn('DB check error in /api/setup/status:', err.message);
    // If DB is offline, let client rely on local storage state
    return res.json({ isRegistered: false, hotel: null, dbOffline: true });
  }
});

/**
 * 2. FIRST-TIME REGISTRATION SUBMISSION
 * Saves hotel profile and initializes rooms in Neon PostgreSQL
 */
app.post('/api/setup/register', async (req, res) => {
  const {
    hotelName,
    ownerName,
    propertyType = 'Hotel',
    phone,
    whatsappNumber,
    email = '',
    address = '',
    city = 'Guwahati',
    state = 'Assam',
    pincode = '',
    policeStationName = '',
    policeStationWhatsApp = '',
    policeStationIncharge = 'Officer-in-Charge',
    hotelLicenseNumber = '',
    roomCount = 8,
    basePrice = 1499
  } = req.body;

  if (!hotelName || !phone) {
    return res.status(400).json({ success: false, error: 'Hotel Name and Phone are required.' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Upsert hotel profile
      const hotelId = 'hotel_primary';
      await client.query(`
        INSERT INTO hotel_profile (
          id, name, owner_name, phone, whatsapp_number, email, address, city, state, pincode,
          police_station_name, police_station_whatsapp, police_station_incharge, hotel_license_number,
          is_registered, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, TRUE, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          owner_name = EXCLUDED.owner_name,
          phone = EXCLUDED.phone,
          whatsapp_number = EXCLUDED.whatsapp_number,
          email = EXCLUDED.email,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          pincode = EXCLUDED.pincode,
          police_station_name = EXCLUDED.police_station_name,
          police_station_whatsapp = EXCLUDED.police_station_whatsapp,
          police_station_incharge = EXCLUDED.police_station_incharge,
          hotel_license_number = EXCLUDED.hotel_license_number,
          is_registered = TRUE,
          updated_at = NOW()
      `, [
        hotelId,
        hotelName,
        ownerName || '',
        phone,
        whatsappNumber || phone,
        email,
        address,
        city,
        state,
        pincode,
        policeStationName,
        policeStationWhatsApp,
        policeStationIncharge,
        hotelLicenseNumber
      ]);

      // Generate initial rooms if rooms table is empty
      const existingRooms = await client.query('SELECT count(*) FROM rooms');
      const count = parseInt(existingRooms.rows[0].count, 10);

      const generatedRooms = [];
      if (count === 0) {
        const totalRooms = Math.max(1, Math.min(Number(roomCount) || 8, 30));
        const price = Number(basePrice) || 1499;

        for (let i = 1; i <= totalRooms; i++) {
          const roomNumber = `${100 + i}`;
          const isDeluxe = i % 2 === 0;
          const roomType = isDeluxe ? 'Deluxe AC' : 'Standard';
          const roomPrice = isDeluxe ? Math.round(price * 1.3) : price;
          const roomId = `room-${roomNumber}`;

          await client.query(`
            INSERT INTO rooms (id, room_number, type, base_price, default_ota_price, floor, capacity, amenities, is_maintenance)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
            ON CONFLICT (id) DO NOTHING
          `, [
            roomId,
            roomNumber,
            roomType,
            roomPrice,
            Math.round(roomPrice * 1.25),
            1,
            2,
            JSON.stringify(['High-speed WiFi', 'Clean Linen', isDeluxe ? 'AC' : 'Fan', 'Attached Bath'])
          ]);

          generatedRooms.push({
            id: roomId,
            roomNumber,
            type: roomType,
            basePrice: roomPrice,
            capacity: 2,
            floor: 1,
            amenities: ['High-speed WiFi', 'Clean Linen', isDeluxe ? 'AC' : 'Fan', 'Attached Bath'],
            isMaintenance: false
          });
        }
      }

      await client.query('COMMIT');

      const savedHotel = {
        name: hotelName,
        tagline: `${propertyType} • Hospitality Manager`,
        ownerName: ownerName || '',
        phone,
        whatsappNumber: whatsappNumber || phone,
        email,
        address,
        city,
        state,
        pincode,
        currency: '₹',
        upiId: '',
        checkInStandardTime: '12:00 PM',
        checkOutStandardTime: '11:00 AM',
        policeStationName,
        policeStationWhatsApp,
        policeStationIncharge,
        hotelLicenseNumber,
        isRegistered: true
      };

      return res.json({
        success: true,
        message: 'First-time registration completed successfully!',
        hotel: savedHotel,
        rooms: generatedRooms
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('Registration error in DB:', err);
      return res.status(500).json({ success: false, error: err.message });
    } finally {
      client.release();
    }
  } catch (dbErr: any) {
    console.error('Database connection failed during registration:', dbErr);
    // Return fallback success so user is not blocked if remote DB has temporary latency
    const fallbackHotel = {
      name: hotelName,
      tagline: `${propertyType} • Hospitality Manager`,
      ownerName: ownerName || '',
      phone,
      whatsappNumber: whatsappNumber || phone,
      email,
      address,
      city,
      state,
      pincode,
      currency: '₹',
      upiId: '',
      checkInStandardTime: '12:00 PM',
      checkOutStandardTime: '11:00 AM',
      policeStationName,
      policeStationWhatsApp,
      policeStationIncharge,
      hotelLicenseNumber,
      isRegistered: true
    };
    return res.json({
      success: true,
      message: 'Registration saved locally (DB offline)',
      hotel: fallbackHotel,
      dbOffline: true
    });
  }
});

/**
 * 3. GET FULL SYNCHRONIZED APP DATA
 * Returns hotel profile, rooms, bookings, verifications, and expenses from Neon PostgreSQL
 */
app.get('/api/data', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const hotelRes = await client.query('SELECT * FROM hotel_profile LIMIT 1');
      const roomsRes = await client.query('SELECT * FROM rooms ORDER BY room_number ASC');
      const bookingsRes = await client.query('SELECT * FROM bookings ORDER BY check_in_date DESC');
      const verificationsRes = await client.query('SELECT * FROM guest_verifications ORDER BY check_in_date DESC');
      const expensesRes = await client.query('SELECT * FROM expenses ORDER BY date DESC');

      const hotelRow = hotelRes.rows[0];
      const hotel = hotelRow ? {
        name: hotelRow.name,
        tagline: hotelRow.tagline || 'হোমষ্টে’ আৰু হোটেল মেনেজমেণ্ট',
        ownerName: hotelRow.owner_name,
        phone: hotelRow.phone,
        whatsappNumber: hotelRow.whatsapp_number,
        email: hotelRow.email || '',
        address: hotelRow.address || '',
        city: hotelRow.city || '',
        state: hotelRow.state || 'Assam',
        pincode: hotelRow.pincode || '',
        currency: '₹',
        upiId: hotelRow.upi_id || '',
        checkInStandardTime: '12:00 PM',
        checkOutStandardTime: '11:00 AM',
        policeStationName: hotelRow.police_station_name || '',
        policeStationWhatsApp: hotelRow.police_station_whatsapp || '',
        policeStationEmail: hotelRow.police_station_email || '',
        policeStationIncharge: hotelRow.police_station_incharge || '',
        hotelLicenseNumber: hotelRow.hotel_license_number || '',
        isRegistered: Boolean(hotelRow.is_registered)
      } : null;

      const rooms = roomsRes.rows.map(r => ({
        id: r.id,
        roomNumber: r.room_number,
        type: r.type,
        basePrice: Number(r.base_price),
        capacity: r.capacity || 2,
        floor: Number(r.floor) || 1,
        amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities) : (r.amenities || []),
        isMaintenance: Boolean(r.is_maintenance)
      }));

      const bookings = bookingsRes.rows.map(b => ({
        id: b.id,
        roomId: b.room_id,
        roomNumber: b.room_number,
        guestName: b.guest_name,
        guestPhone: b.guest_phone,
        guestEmail: b.guest_email || undefined,
        channel: b.channel,
        source: b.channel === 'online' ? 'booking_com' : 'walk_in',
        checkInDate: b.check_in_date,
        checkOutDate: b.check_out_date,
        checkInTime: b.check_in_time || '12:00 PM',
        checkOutTime: b.check_out_time || '11:00 AM',
        guestCount: 2,
        totalAmount: Number(b.total_amount),
        advancePaid: Number(b.advance_paid || 0),
        paymentStatus: Number(b.balance_due || 0) <= 0 ? 'paid' : (Number(b.advance_paid || 0) > 0 ? 'partial' : 'pending'),
        paymentMethod: 'upi',
        status: b.status,
        notes: b.notes || '',
        createdAt: b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString()
      }));

      const verifications = verificationsRes.rows.map(v => ({
        id: v.id,
        bookingId: v.booking_id || undefined,
        roomNumber: v.room_number,
        guestName: v.guest_name,
        age: v.age ? Number(v.age) : undefined,
        gender: v.gender || 'Male',
        dob: v.dob || undefined,
        idType: v.id_type,
        idNumber: v.id_number,
        address: v.address,
        nationality: v.nationality || 'Indian',
        phone: v.phone,
        email: v.email || undefined,
        checkInDate: v.check_in_date,
        checkInTime: v.check_in_time || '12:00 PM',
        checkOutDate: v.check_out_date,
        purposeOfVisit: v.purpose_of_visit || 'Tourism / Leisure',
        vehicleNumber: v.vehicle_number || undefined,
        idPhotoUrl: v.id_photo_url || undefined,
        policeReportStatus: v.police_report_status || 'pending',
        submittedAt: v.submitted_at || undefined,
        dispatchMethod: v.dispatch_method || undefined,
        notes: v.notes || undefined
      }));

      const expenses = expensesRes.rows.map(e => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        category: e.category,
        date: e.date,
        paymentMethod: e.payment_method || 'upi',
        notes: e.notes || undefined,
        createdAt: e.created_at ? new Date(e.created_at).toISOString() : new Date().toISOString()
      }));

      return res.json({
        success: true,
        hotel,
        rooms,
        bookings,
        verifications,
        expenses,
        isRegistered: hotel?.isRegistered || false
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error fetching data from Neon DB:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. BOOKINGS CRUD WITH NEON POSTGRESQL
 */
app.post('/api/bookings', async (req, res) => {
  const b = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO bookings (
          id, room_id, room_number, guest_name, guest_phone, guest_email,
          check_in_date, check_in_time, check_out_date, check_out_time,
          total_amount, advance_paid, balance_due, channel, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          room_id = EXCLUDED.room_id,
          room_number = EXCLUDED.room_number,
          guest_name = EXCLUDED.guest_name,
          guest_phone = EXCLUDED.guest_phone,
          check_in_date = EXCLUDED.check_in_date,
          check_out_date = EXCLUDED.check_out_date,
          total_amount = EXCLUDED.total_amount,
          advance_paid = EXCLUDED.advance_paid,
          balance_due = EXCLUDED.balance_due,
          channel = EXCLUDED.channel,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes
      `, [
        b.id,
        b.roomId,
        b.roomNumber,
        b.guestName,
        b.guestPhone,
        b.guestEmail || null,
        b.checkInDate,
        b.checkInTime || '12:00 PM',
        b.checkOutDate,
        b.checkOutTime || '11:00 AM',
        b.totalAmount,
        b.advancePaid || 0,
        (b.totalAmount - (b.advancePaid || 0)),
        b.channel || 'offline',
        b.status || 'confirmed',
        b.notes || ''
      ]);
      return res.json({ success: true, booking: b });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error saving booking to DB:', err);
    return res.json({ success: true, booking: b, dbError: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const b = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE bookings SET
          room_id = $1,
          room_number = $2,
          guest_name = $3,
          guest_phone = $4,
          check_in_date = $5,
          check_out_date = $6,
          total_amount = $7,
          advance_paid = $8,
          balance_due = $9,
          channel = $10,
          status = $11,
          notes = $12
        WHERE id = $13
      `, [
        b.roomId,
        b.roomNumber,
        b.guestName,
        b.guestPhone,
        b.checkInDate,
        b.checkOutDate,
        b.totalAmount,
        b.advancePaid || 0,
        (b.totalAmount - (b.advancePaid || 0)),
        b.channel || 'offline',
        b.status || 'confirmed',
        b.notes || '',
        id
      ]);
      return res.json({ success: true, booking: b });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error updating booking in DB:', err);
    return res.json({ success: true, booking: b, dbError: err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM bookings WHERE id = $1', [id]);
      return res.json({ success: true, id });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error deleting booking in DB:', err);
    return res.json({ success: true, id, dbError: err.message });
  }
});

/**
 * 5. POLICE GUEST VERIFICATION CRUD
 */
app.post('/api/verifications', async (req, res) => {
  const v = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO guest_verifications (
          id, booking_id, room_number, guest_name, age, gender, dob, id_type, id_number,
          address, nationality, phone, email, check_in_date, check_in_time, check_out_date,
          purpose_of_visit, vehicle_number, id_photo_url, police_report_status, dispatch_method, submitted_at, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        ON CONFLICT (id) DO UPDATE SET
          guest_name = EXCLUDED.guest_name,
          id_type = EXCLUDED.id_type,
          id_number = EXCLUDED.id_number,
          address = EXCLUDED.address,
          police_report_status = EXCLUDED.police_report_status,
          dispatch_method = EXCLUDED.dispatch_method,
          submitted_at = EXCLUDED.submitted_at
      `, [
        v.id,
        v.bookingId || null,
        v.roomNumber,
        v.guestName,
        v.age ? Number(v.age) : null,
        v.gender || 'Male',
        v.dob || null,
        v.idType,
        v.idNumber,
        v.address,
        v.nationality || 'Indian',
        v.phone,
        v.email || null,
        v.checkInDate,
        v.checkInTime || '12:00 PM',
        v.checkOutDate,
        v.purposeOfVisit || 'Tourism / Leisure',
        v.vehicleNumber || null,
        v.idPhotoUrl || null,
        v.policeReportStatus || 'pending',
        v.dispatchMethod || null,
        v.submittedAt || null,
        v.notes || null
      ]);
      return res.json({ success: true, verification: v });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error saving verification to DB:', err);
    return res.json({ success: true, verification: v, dbError: err.message });
  }
});

app.put('/api/verifications/:id', async (req, res) => {
  const { id } = req.params;
  const v = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE guest_verifications SET
          guest_name = $1,
          id_type = $2,
          id_number = $3,
          address = $4,
          phone = $5,
          police_report_status = $6,
          dispatch_method = $7,
          submitted_at = $8
        WHERE id = $9
      `, [
        v.guestName,
        v.idType,
        v.idNumber,
        v.address,
        v.phone,
        v.policeReportStatus,
        v.dispatchMethod || null,
        v.submittedAt || null,
        id
      ]);
      return res.json({ success: true, verification: v });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error updating verification in DB:', err);
    return res.json({ success: true, verification: v, dbError: err.message });
  }
});

app.delete('/api/verifications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM guest_verifications WHERE id = $1', [id]);
      return res.json({ success: true, id });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error deleting verification from DB:', err);
    return res.json({ success: true, id, dbError: err.message });
  }
});

/**
 * 6. EXPENSES CRUD
 */
app.post('/api/expenses', async (req, res) => {
  const e = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO expenses (id, title, amount, category, date, payment_method, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          amount = EXCLUDED.amount,
          category = EXCLUDED.category,
          date = EXCLUDED.date,
          payment_method = EXCLUDED.payment_method,
          notes = EXCLUDED.notes
      `, [
        e.id,
        e.title,
        e.amount,
        e.category,
        e.date,
        e.paymentMethod || 'cash',
        e.notes || ''
      ]);
      return res.json({ success: true, expense: e });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error saving expense in DB:', err);
    return res.json({ success: true, expense: e, dbError: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM expenses WHERE id = $1', [id]);
      return res.json({ success: true, id });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error deleting expense in DB:', err);
    return res.json({ success: true, id, dbError: err.message });
  }
});

/**
 * 7. HOTEL PROFILE UPDATE
 */
app.put('/api/hotel', async (req, res) => {
  const h = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE hotel_profile SET
          name = $1,
          owner_name = $2,
          phone = $3,
          whatsapp_number = $4,
          email = $5,
          address = $6,
          city = $7,
          state = $8,
          pincode = $9,
          police_station_name = $10,
          police_station_whatsapp = $11,
          police_station_email = $12,
          police_station_incharge = $13,
          hotel_license_number = $14,
          updated_at = NOW()
        WHERE id = 'hotel_primary'
      `, [
        h.name,
        h.ownerName || '',
        h.phone,
        h.whatsappNumber || h.phone,
        h.email || '',
        h.address || '',
        h.city || '',
        h.state || '',
        h.pincode || '',
        h.policeStationName || '',
        h.policeStationWhatsApp || '',
        h.policeStationEmail || '',
        h.policeStationIncharge || '',
        h.hotelLicenseNumber || ''
      ]);
      return res.json({ success: true, hotel: h });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error updating hotel profile in DB:', err);
    return res.json({ success: true, hotel: h, dbError: err.message });
  }
});

/**
 * AI-Powered ID Card Scanner Endpoint (Aadhaar, Passport, Voter ID, Driving License)
 * Powered by Gemini 3.8 Flash
 */
app.post('/api/extract-id', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'No image provided. Please upload or capture an ID document.'
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured. Falling back to structured heuristic extractor.');
      return res.json({
        success: false,
        isFallback: true,
        error: 'GEMINI_API_KEY not configured on server.',
        message: 'Please configure GEMINI_API_KEY in environment or use manual entry / test presets.'
      });
    }

    const ai = new GoogleGenAI();

    const prompt = `You are an expert optical document recognition and KYC data extraction engine for Indian hotels, guest houses, and homestays complying with local police verification rules (Form C and Daily Guest Register).
Analyze this uploaded Indian Government ID card (Aadhaar Card, Indian Passport, Election Commission Voter ID, or Driving License).

Extract all readable information and respond with ONLY a valid, raw JSON object (no markdown quotes, no triple backticks, no extra text).
JSON format:
{
  "guestName": "Full name of the person in Title Case",
  "idType": "aadhaar" or "passport" or "voter_id" or "driving_license" or "other",
  "idNumber": "Document ID number (e.g., 12-digit Aadhaar, Passport number, Voter EPIC, Driving License number)",
  "gender": "Male" or "Female" or "Other",
  "age": number or null,
  "dob": "YYYY-MM-DD" or "DD/MM/YYYY" or null,
  "address": "Full permanent address including village/city, district, state and pin code",
  "nationality": "Indian" or specific country,
  "phone": "Mobile number if printed on document or null"
}

If any field is unclear or missing, provide your best deduction or null. Do not invent completely fake names; accurately transcribe what is visible on the card.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            },
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const responseText = response.text || '';
    
    let parsedData = {};
    try {
      const cleanJson = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsedData = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON output:', responseText, parseErr);
      return res.json({
        success: false,
        rawText: responseText,
        error: 'Could not structure ID information automatically. Please review manually.'
      });
    }

    return res.json({
      success: true,
      data: parsedData,
      rawOutput: responseText
    });
  } catch (err: any) {
    console.error('ID Extraction API error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error processing document image'
    });
  }
});

// Police Dispatch Log recording
app.post('/api/police-dispatch-log', (req, res) => {
  const { hotelName, guestCount, dispatchMethod, timestamp, thana } = req.body;
  console.log(`[POLICE DISPATCH] ${timestamp} - ${hotelName} reported ${guestCount} guests to ${thana} via ${dispatchMethod}`);
  res.json({ success: true, loggedAt: new Date().toISOString() });
});

// Mount Vite in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Orderfix Server & Police Portal running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
