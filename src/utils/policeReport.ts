import { HotelProfile, GuestVerificationData } from '../types';
import { formatDateFull, formatDateShort } from './bookingEngine';

/**
 * Compiles a structured, formal daily police report formatted for WhatsApp dispatch
 * compliant with Assam Police & local Thana guest reporting regulations.
 */
export function generateDailyPoliceWhatsAppMessage(
  hotel: HotelProfile,
  verifications: GuestVerificationData[],
  reportDate: string
): string {
  const station = hotel.policeStationName || 'Local Police Station';
  const total = verifications.length;

  let msg = `🚨 *DAILY GUEST LOG & POLICE VERIFICATION REPORT*\n`;
  msg += `🏨 *Property:* ${hotel.name}\n`;
  if (hotel.hotelLicenseNumber) {
    msg += `📜 *Reg/License No:* ${hotel.hotelLicenseNumber}\n`;
  }
  msg += `📍 *Address:* ${hotel.address}, ${hotel.city}, ${hotel.state} - ${hotel.pincode}\n`;
  msg += `👮 *To:* The Officer-in-Charge, ${station}\n`;
  msg += `📅 *Date of Report:* ${formatDateFull(reportDate)}\n`;
  msg += `👥 *Total Guests Logged:* ${total}\n`;
  msg += `────────────────────────────\n\n`;

  if (verifications.length === 0) {
    msg += `_No new guest check-ins or active verifications for this date._\n\n`;
  } else {
    verifications.forEach((v, index) => {
      msg += `*GUEST #${index + 1}: ${v.guestName.toUpperCase()}* (Room: *${v.roomNumber}*)\n`;
      msg += `• *Age / Gender:* ${v.age || 'N/A'} yrs / ${v.gender || 'N/A'}\n`;
      msg += `• *ID Type:* ${v.idType.toUpperCase()} | *ID No:* ${v.idNumber}\n`;
      msg += `• *Phone:* ${v.phone}\n`;
      if (v.email) msg += `• *Email:* ${v.email}\n`;
      msg += `• *Permanent Address:* ${v.address}\n`;
      msg += `• *Nationality:* ${v.nationality || 'Indian'}\n`;
      msg += `• *Arrival:* ${formatDateShort(v.checkInDate)} ${v.checkInTime || ''}\n`;
      msg += `• *Expected Departure:* ${formatDateShort(v.checkOutDate)}\n`;
      if (v.purposeOfVisit) msg += `• *Purpose of Visit:* ${v.purposeOfVisit}\n`;
      if (v.vehicleNumber) msg += `• *Vehicle No:* ${v.vehicleNumber}\n`;
      msg += `────────────────────────────\n`;
    });
  }

  msg += `\n*DECLARATION:*\n`;
  msg += `All identity particulars have been physically verified against original government-issued photo identity cards in compliance with local police directives.\n\n`;
  msg += `*Submitted by:* Front Desk / Manager, ${hotel.name}\n`;
  msg += `*Contact:* ${hotel.phone} / ${hotel.whatsappNumber}`;

  return msg;
}

/**
 * Single guest police verification report for instant dispatch upon check-in
 */
export function generateSingleGuestPoliceWhatsAppMessage(
  hotel: HotelProfile,
  v: GuestVerificationData
): string {
  const station = hotel.policeStationName || 'Local Police Station';

  let msg = `🚨 *POLICE GUEST VERIFICATION INTIMATION*\n`;
  msg += `🏨 *Hotel:* ${hotel.name} (${hotel.city})\n`;
  if (hotel.hotelLicenseNumber) msg += `📜 *License:* ${hotel.hotelLicenseNumber}\n`;
  msg += `👮 *To:* ${station}\n\n`;

  msg += `*GUEST DETAILS:*\n`;
  msg += `• *Full Name:* ${v.guestName.toUpperCase()}\n`;
  msg += `• *Room Allocated:* Room ${v.roomNumber}\n`;
  msg += `• *Age / Gender:* ${v.age || 'N/A'} / ${v.gender || 'N/A'}\n`;
  msg += `• *ID Document:* ${v.idType.toUpperCase()} (${v.idNumber})\n`;
  msg += `• *Contact:* ${v.phone}\n`;
  msg += `• *Address:* ${v.address}\n`;
  msg += `• *Nationality:* ${v.nationality || 'Indian'}\n`;
  msg += `• *Check-in Date & Time:* ${formatDateShort(v.checkInDate)} ${v.checkInTime || ''}\n`;
  msg += `• *Check-out Date:* ${formatDateShort(v.checkOutDate)}\n`;
  if (v.purposeOfVisit) msg += `• *Purpose:* ${v.purposeOfVisit}\n`;
  if (v.vehicleNumber) msg += `• *Vehicle No:* ${v.vehicleNumber}\n\n`;

  msg += `*Verification:* Original ID verified by reception.\n`;
  msg += `*Hotel Reception:* ${hotel.phone}`;

  return msg;
}

/**
 * Creates email payload for sending to the local police station
 */
export function generatePoliceEmailPayload(
  hotel: HotelProfile,
  verifications: GuestVerificationData[],
  reportDate: string
) {
  const subject = `Daily Guest Verification Register - ${hotel.name} - ${reportDate}`;
  const station = hotel.policeStationName || 'Local Police Station';

  let body = `To,\nThe Officer-in-Charge,\n${station}\n\n`;
  body += `Subject: Submission of Daily Guest Verification Sheet as per Hotel Regulations\n\n`;
  body += `Respected Sir/Madam,\n\n`;
  body += `Please find below the record of in-house guests at ${hotel.name} (${hotel.address}, ${hotel.city}) for ${reportDate}.\n\n`;

  verifications.forEach((v, idx) => {
    body += `[GUEST ${idx + 1}] Room: ${v.roomNumber}\n`;
    body += `Name: ${v.guestName}\n`;
    body += `Age/Gender: ${v.age || 'N/A'} / ${v.gender || 'N/A'}\n`;
    body += `ID: ${v.idType.toUpperCase()} - ${v.idNumber}\n`;
    body += `Phone: ${v.phone}\n`;
    body += `Address: ${v.address}\n`;
    body += `Nationality: ${v.nationality}\n`;
    body += `Stay: ${v.checkInDate} to ${v.checkOutDate}\n`;
    body += `Purpose: ${v.purposeOfVisit || 'Tourism'}\n`;
    body += `Vehicle: ${v.vehicleNumber || 'N/A'}\n\n`;
  });

  body += `All guest identities have been physically inspected against original government documents.\n\n`;
  body += `Warm regards,\nManager / Front Desk\n${hotel.name}\nPhone: ${hotel.phone}`;

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  const toEmail = hotel.policeStationEmail || 'dispur-ps@assampolice.gov.in';

  return {
    subject,
    body,
    mailToUrl: `mailto:${toEmail}?subject=${encodedSubject}&body=${encodedBody}`
  };
}

/**
 * Quick sample preset documents for receptionist testing and demo
 */
export const SAMPLE_ID_PRESETS: {
  id: string;
  name: string;
  type: GuestVerificationData['idType'];
  sample: Partial<GuestVerificationData>;
}[] = [
  {
    id: 'aadhaar_card',
    name: 'Aadhaar Card (আধাৰ কাৰ্ড)',
    type: 'aadhaar',
    sample: {
      guestName: 'Bhaskar Jyoti Baruah',
      age: 34,
      gender: 'Male',
      dob: '1992-06-18',
      idType: 'aadhaar',
      idNumber: '8912 3456 7890',
      address: 'House No. 18, Bye Lane 3, Tarun Nagar, Guwahati, Kamrup Metro, Assam - 781005',
      nationality: 'Indian',
      phone: '9864012345',
      purposeOfVisit: 'Business / Work',
      vehicleNumber: 'AS-01-AK-7844'
    }
  },
  {
    id: 'passport',
    name: 'Passport (পাছপ’ৰ্ট)',
    type: 'passport',
    sample: {
      guestName: 'Ananya Sengupta',
      age: 28,
      gender: 'Female',
      dob: '1998-11-04',
      idType: 'passport',
      idNumber: 'M7849123',
      address: '42 Lake View Road, South Kolkata, West Bengal - 700029',
      nationality: 'Indian',
      phone: '9830114455',
      purposeOfVisit: 'Tourism / Leisure'
    }
  },
  {
    id: 'voter_id',
    name: 'Voter ID (ভোটাৰ পৰিচয় পত্ৰ)',
    type: 'voter_id',
    sample: {
      guestName: 'Dipankar Saikia',
      age: 42,
      gender: 'Male',
      dob: '1984-02-15',
      idType: 'voter_id',
      idNumber: 'GHY9482103',
      address: 'Village: Jalukbari, PO: Gauhati University, Dist: Kamrup, Assam - 781014',
      nationality: 'Indian',
      phone: '9435098765',
      purposeOfVisit: 'Medical / Treatment',
      vehicleNumber: 'AS-01-BV-2021'
    }
  },
  {
    id: 'driving_license',
    name: 'Driving License (ড্ৰাইভিং লাইচেঞ্চ)',
    type: 'driving_license',
    sample: {
      guestName: 'Manish Kumar Verma',
      age: 36,
      gender: 'Male',
      dob: '1990-08-22',
      idType: 'driving_license',
      idNumber: 'AS-0120150039281',
      address: 'Christian Basti, GS Road, Guwahati, Assam - 781005',
      nationality: 'Indian',
      phone: '9706044321',
      purposeOfVisit: 'Transit'
    }
  }
];
