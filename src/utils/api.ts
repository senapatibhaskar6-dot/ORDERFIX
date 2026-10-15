import { Booking, Room, HotelProfile, GuestVerificationData, Expense, Invoice } from '../types';

export async function checkServerSetupStatus(): Promise<{
  isRegistered: boolean;
  hotel: HotelProfile | null;
}> {
  try {
    const res = await fetch('/api/setup/status');
    if (res.ok) {
      const data = await res.json();
      return {
        isRegistered: Boolean(data.isRegistered),
        hotel: data.hotel || null
      };
    }
  } catch (err) {
    console.warn('Could not contact /api/setup/status:', err);
  }
  return { isRegistered: false, hotel: null };
}

export async function fetchAllServerData(): Promise<{
  hotel?: HotelProfile;
  rooms?: Room[];
  bookings?: Booking[];
  verifications?: GuestVerificationData[];
  expenses?: Expense[];
  isRegistered?: boolean;
} | null> {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not contact /api/data:', err);
  }
  return null;
}

export async function syncBookingToDB(booking: Booking): Promise<void> {
  try {
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
  } catch (err) {
    console.warn('Failed to sync booking to DB:', err);
  }
}

export async function updateBookingInDB(booking: Booking): Promise<void> {
  try {
    await fetch(`/api/bookings/${booking.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
  } catch (err) {
    console.warn('Failed to update booking in DB:', err);
  }
}

export async function deleteBookingFromDB(id: string): Promise<void> {
  try {
    await fetch(`/api/bookings/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Failed to delete booking from DB:', err);
  }
}

export async function syncVerificationToDB(v: GuestVerificationData): Promise<void> {
  try {
    await fetch('/api/verifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    });
  } catch (err) {
    console.warn('Failed to sync verification to DB:', err);
  }
}

export async function updateVerificationInDB(v: GuestVerificationData): Promise<void> {
  try {
    await fetch(`/api/verifications/${v.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    });
  } catch (err) {
    console.warn('Failed to update verification in DB:', err);
  }
}

export async function deleteVerificationFromDB(id: string): Promise<void> {
  try {
    await fetch(`/api/verifications/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Failed to delete verification from DB:', err);
  }
}

export async function syncExpenseToDB(e: Expense): Promise<void> {
  try {
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(e)
    });
  } catch (err) {
    console.warn('Failed to sync expense to DB:', err);
  }
}

export async function deleteExpenseFromDB(id: string): Promise<void> {
  try {
    await fetch(`/api/expenses/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Failed to delete expense from DB:', err);
  }
}

export async function syncHotelToDB(hotel: HotelProfile): Promise<void> {
  try {
    await fetch('/api/hotel', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotel)
    });
  } catch (err) {
    console.warn('Failed to sync hotel profile to DB:', err);
  }
}

export async function syncInvoiceToDB(invoice: Invoice): Promise<void> {
  try {
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });
  } catch (err) {
    console.warn('Failed to sync invoice to DB:', err);
  }
}

export async function deleteInvoiceFromDB(id: string): Promise<void> {
  try {
    await fetch(`/api/invoices/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Failed to delete invoice from DB:', err);
  }
}

export async function sendInvoiceEmailAPI(invoice: Invoice, recipientEmail: string, hotelName: string): Promise<boolean> {
  try {
    const res = await fetch('/api/invoices/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice, recipientEmail, hotelName })
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to call /api/invoices/send-email:', err);
    return false;
  }
}
