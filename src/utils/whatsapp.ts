import { Booking, HotelProfile } from '../types';
import { formatDateFull, formatSourceName } from './bookingEngine';

export interface WhatsAppMessagePayload {
  recipientPhone: string;
  messageText: string;
  whatsappUrl: string;
}

/**
 * Cleans phone number to international WhatsApp format (defaulting to +91 if 10 digits)
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return '91' + digits;
  }
  return digits;
}

/**
 * Generates official booking confirmation message for guests
 */
export function generateConfirmationMessage(
  booking: Booking,
  hotel: HotelProfile
): string {
  const balance = booking.totalAmount - (booking.advancePaid || 0);
  const paymentText =
    booking.paymentStatus === 'paid'
      ? '✅ Paid in Full'
      : booking.paymentStatus === 'partial'
      ? `Advance: ₹${booking.advancePaid.toLocaleString('en-IN')} | Balance Due: ₹${balance.toLocaleString('en-IN')}`
      : `⚠️ Payment Due at Check-in: ₹${booking.totalAmount.toLocaleString('en-IN')}`;

  const channelText =
    booking.channel === 'online'
      ? `Portal: ${formatSourceName(booking.source)} (Ref: ${booking.portalBookingId || 'Direct Sync'})`
      : `Channel: Direct Offline (${formatSourceName(booking.source)})`;

  return `*${hotel.name.toUpperCase()}* 🌴
*Official Booking Confirmation*

Dear *${booking.guestName}*,
Thank you for choosing ${hotel.name}! Your reservation has been verified and confirmed without double-booking risk via Orderfix.

━━━━━━━━━━━━━━━━━━━
📌 *BOOKING DETAILS*
━━━━━━━━━━━━━━━━━━━
• *Reservation ID:* #${booking.id.slice(-6).toUpperCase()}
• *Room Number:* Room ${booking.roomNumber}
• *Guests:* ${booking.guestCount} Guest(s)
• *Check-in:* ${formatDateFull(booking.checkInDate)} (From ${hotel.checkInStandardTime})
• *Check-out:* ${formatDateFull(booking.checkOutDate)} (By ${hotel.checkOutStandardTime})
• *Source:* ${channelText}

━━━━━━━━━━━━━━━━━━━
💳 *TARIFF & PAYMENT*
━━━━━━━━━━━━━━━━━━━
• *Total Stay Amount:* ₹${booking.totalAmount.toLocaleString('en-IN')}
• *Payment Status:* ${paymentText}
${hotel.upiId ? `• *UPI ID for payments:* ${hotel.upiId}` : ''}

━━━━━━━━━━━━━━━━━━━
📍 *PROPERTY LOCATION*
━━━━━━━━━━━━━━━━━━━
${hotel.address}, ${hotel.city}, ${hotel.state} - ${hotel.pincode}
📞 Front Desk: ${hotel.phone}
💬 WhatsApp Help: ${hotel.whatsappNumber}

${booking.notes ? `*Special Request:* "${booking.notes}"\n\n` : ''}We look forward to hosting you! Safe travels.
_Powered by Orderfix - Smart Homestay Sync_`;
}

/**
 * Generates check-in reminder message
 */
export function generateCheckInReminder(
  booking: Booking,
  hotel: HotelProfile
): string {
  return `*Reminder from ${hotel.name}* 🛎️

Hello *${booking.guestName}*,
We are getting Room *${booking.roomNumber}* ready for your arrival on *${formatDateFull(booking.checkInDate)}*!

Standard check-in begins at *${hotel.checkInStandardTime}*.
If you need early check-in or driving directions to ${hotel.city}, feel free to reply directly to this message.

Front Desk contact: ${hotel.phone}
Have a pleasant journey!`;
}

/**
 * Generates check-out thank you message
 */
export function generateThankYouMessage(
  booking: Booking,
  hotel: HotelProfile
): string {
  return `*Thank you from ${hotel.name}!* ✨

Dear *${booking.guestName}*,
It was our absolute pleasure hosting you in Room *${booking.roomNumber}*. We hope you enjoyed your stay and warm hospitality.

We would love to welcome you back anytime you visit ${hotel.city}!
Have a safe journey home. 🙏`;
}

/**
 * Creates the complete WhatsApp link
 */
export function getWhatsAppLink(
  booking: Booking,
  hotel: HotelProfile,
  type: 'confirmation' | 'reminder' | 'thankyou' = 'confirmation'
): WhatsAppMessagePayload {
  let message = '';
  if (type === 'reminder') {
    message = generateCheckInReminder(booking, hotel);
  } else if (type === 'thankyou') {
    message = generateThankYouMessage(booking, hotel);
  } else {
    message = generateConfirmationMessage(booking, hotel);
  }

  const cleanPhone = cleanPhoneNumber(booking.guestPhone);
  const encoded = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

  return {
    recipientPhone: cleanPhone,
    messageText: message,
    whatsappUrl
  };
}
