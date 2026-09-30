import { Booking, Room, ConflictResult } from '../types';

/**
 * Checks if two date ranges overlap.
 * In hospitality: Check-in on Date X and Check-out on Date Y occupies nights [X, Y).
 * Therefore, a guest checking out on Date Y does NOT clash with another guest checking in on Date Y.
 */
export function areDatesOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && endA > startB;
}

/**
 * Checks if a room has a booking conflict for given dates.
 */
export function checkBookingConflict(
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  bookings: Booking[],
  excludeBookingId?: string
): ConflictResult {
  if (!checkInDate || !checkOutDate || checkInDate >= checkOutDate) {
    return {
      hasConflict: true,
      message: 'Check-out date must be strictly after check-in date.'
    };
  }

  // Filter out cancelled bookings and the booking being edited
  const activeRoomBookings = bookings.filter(
    (b) =>
      b.roomId === roomId &&
      b.status !== 'cancelled' &&
      b.id !== excludeBookingId
  );

  for (const booking of activeRoomBookings) {
    if (
      areDatesOverlapping(
        checkInDate,
        checkOutDate,
        booking.checkInDate,
        booking.checkOutDate
      )
    ) {
      const sourceLabel =
        booking.channel === 'online'
          ? `Online Portal (${formatSourceName(booking.source)})`
          : `Offline (${formatSourceName(booking.source)})`;

      return {
        hasConflict: true,
        conflictingBooking: booking,
        message: `Double-booking conflict! Room is already reserved by ${booking.guestName} via ${sourceLabel} from ${formatDateShort(booking.checkInDate)} to ${formatDateShort(booking.checkOutDate)}.`
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Returns the status of a room on a given target date.
 */
export function getRoomStatusForDate(
  room: Room,
  dateString: string,
  bookings: Booking[]
): {
  status: 'available' | 'offline_booked' | 'online_booked' | 'maintenance';
  booking?: Booking;
} {
  if (room.isMaintenance) {
    return { status: 'maintenance' };
  }

  // Find if there is an active booking where dateString is within [checkInDate, checkOutDate)
  const activeBooking = bookings.find(
    (b) =>
      b.roomId === room.id &&
      b.status !== 'cancelled' &&
      b.status !== 'checked_out' &&
      dateString >= b.checkInDate &&
      dateString < b.checkOutDate
  );

  if (!activeBooking) {
    return { status: 'available' };
  }

  return {
    status: activeBooking.channel === 'online' ? 'online_booked' : 'offline_booked',
    booking: activeBooking
  };
}

/**
 * Calculates number of nights between two dates
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });
}

export function formatDateFull(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatSourceName(source: string): string {
  const map: Record<string, string> = {
    walk_in: 'Walk-in Guest',
    phone_call: 'Phone Booking',
    whatsapp: 'WhatsApp Direct',
    direct_ref: 'Direct Reference',
    booking_com: 'Booking.com',
    makemytrip: 'MakeMyTrip',
    agoda: 'Agoda',
    airbnb: 'Airbnb',
    goibibo: 'Goibibo',
    expedia: 'Expedia',
    other: 'Other Portal'
  };
  return map[source] || source;
}
