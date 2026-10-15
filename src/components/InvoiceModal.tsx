import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Send,
  Mail,
  CheckCircle2,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  User,
  Phone,
  BedDouble,
  Receipt,
  FileText,
  Percent,
  Sparkles,
  Building2,
  Share2
} from 'lucide-react';
import {
  Booking,
  HotelProfile,
  Invoice,
  InvoiceExtraCharge,
  PaymentMethod,
  PaymentStatus
} from '../types';
import { generateUniqueInvoiceNumber } from '../utils/storage';
import { LanguageCode, getTranslations } from '../utils/translations';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  existingInvoice?: Invoice | null;
  hotel: HotelProfile;
  onSaveInvoice: (invoice: Invoice, markBookingBilled: boolean) => void;
  language?: LanguageCode;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  booking,
  existingInvoice,
  hotel,
  onSaveInvoice,
  language = 'en'
}) => {
  const t = getTranslations(language);

  // Form States
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('Deluxe AC');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [nights, setNights] = useState(1);
  const [roomRate, setRoomRate] = useState(2000);
  
  // Extra Services / Line items
  const [extraCharges, setExtraCharges] = useState<InvoiceExtraCharge[]>([]);
  const [newChargeTitle, setNewChargeTitle] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');

  // Financial adjustments
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isTaxEnabled, setIsTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState(12); // 12% GST (6% CGST + 6% SGST)
  const [advancePaid, setAdvancePaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');

  // UI state
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);

  // Initialize or Pre-fill when opened
  useEffect(() => {
    if (!isOpen) return;

    if (existingInvoice) {
      setInvoiceNumber(existingInvoice.invoiceNumber);
      setGuestName(existingInvoice.guestName);
      setGuestPhone(existingInvoice.guestPhone);
      setGuestEmail(existingInvoice.guestEmail || '');
      setRoomNumber(existingInvoice.roomNumber);
      setRoomType(existingInvoice.roomType || 'Standard');
      setCheckInDate(existingInvoice.checkInDate);
      setCheckOutDate(existingInvoice.checkOutDate);
      setNights(existingInvoice.nights);
      setRoomRate(existingInvoice.roomRate);
      setExtraCharges(existingInvoice.extraCharges || []);
      setDiscountAmount(existingInvoice.discountAmount || 0);
      setIsTaxEnabled(existingInvoice.isTaxEnabled);
      setTaxRate(existingInvoice.taxRate);
      setAdvancePaid(existingInvoice.advancePaid || 0);
      setPaymentMethod(existingInvoice.paymentMethod || 'cash');
      setPaymentStatus(existingInvoice.paymentStatus || 'paid');
      setNotes(existingInvoice.notes || '');
    } else if (booking) {
      setInvoiceNumber(generateUniqueInvoiceNumber());
      setGuestName(booking.guestName || '');
      setGuestPhone(booking.guestPhone || '');
      setGuestEmail(booking.guestEmail || '');
      setRoomNumber(booking.roomNumber || '101');
      setRoomType('Standard / Deluxe');
      setCheckInDate(booking.checkInDate || new Date().toISOString().split('T')[0]);
      setCheckOutDate(booking.checkOutDate || new Date().toISOString().split('T')[0]);
      
      const calculatedNights = Math.max(
        1,
        Math.round(
          (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) || 1
      );
      setNights(calculatedNights);
      
      const rate = booking.totalAmount ? Math.round(booking.totalAmount / calculatedNights) : 2000;
      setRoomRate(rate);
      setAdvancePaid(booking.advancePaid || 0);
      setPaymentMethod(booking.paymentMethod || 'cash');
      setPaymentStatus('paid'); // When generating final bill, default to paid
      setNotes('Thank you for choosing our hospitality! We look forward to welcoming you again.');
      
      // Default common extra charges list
      setExtraCharges([]);
      setDiscountAmount(0);
      setIsTaxEnabled(true);
      setTaxRate(12);
    } else {
      setInvoiceNumber(generateUniqueInvoiceNumber());
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setRoomNumber('101');
      setRoomType('Deluxe Room');
      const today = new Date().toISOString().split('T')[0];
      setCheckInDate(today);
      setCheckOutDate(today);
      setNights(1);
      setRoomRate(1800);
      setExtraCharges([]);
      setDiscountAmount(0);
      setIsTaxEnabled(true);
      setTaxRate(12);
      setAdvancePaid(0);
      setPaymentMethod('cash');
      setPaymentStatus('paid');
      setNotes('Thank you for staying with us!');
    }
  }, [isOpen, booking, existingInvoice]);

  if (!isOpen) return null;

  // Real-time Calculations
  const roomTotal = Math.max(0, roomRate * nights);
  const extraChargesTotal = extraCharges.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const subtotalBeforeDiscount = roomTotal + extraChargesTotal;
  const subtotal = Math.max(0, subtotalBeforeDiscount - discountAmount);

  // GST Calculation (CGST 50% + SGST 50%)
  const taxMultiplier = isTaxEnabled ? taxRate / 100 : 0;
  const taxTotal = Math.round(subtotal * taxMultiplier);
  const cgstAmount = Math.round(taxTotal / 2);
  const sgstAmount = taxTotal - cgstAmount;

  const grandTotal = subtotal + taxTotal;
  const balanceDue = Math.max(0, grandTotal - advancePaid);

  // Add Custom Extra Charge
  const handleAddCharge = () => {
    if (!newChargeTitle.trim() || !newChargeAmount || Number(newChargeAmount) <= 0) return;
    const newCharge: InvoiceExtraCharge = {
      id: `chg-${Date.now()}`,
      title: newChargeTitle.trim(),
      amount: Number(newChargeAmount)
    };
    setExtraCharges((prev) => [...prev, newCharge]);
    setNewChargeTitle('');
    setNewChargeAmount('');
  };

  const handleQuickAdd = (title: string, amount: number) => {
    const newCharge: InvoiceExtraCharge = {
      id: `chg-${Date.now()}`,
      title,
      amount
    };
    setExtraCharges((prev) => [...prev, newCharge]);
  };

  const handleRemoveCharge = (id: string) => {
    setExtraCharges((prev) => prev.filter((item) => item.id !== id));
  };

  // Compile final invoice object
  const compiledInvoice: Invoice = {
    id: existingInvoice?.id || `inv-${Date.now()}`,
    invoiceNumber,
    bookingId: booking?.id || existingInvoice?.bookingId,
    hotelId: hotel.id,
    guestName,
    guestPhone,
    guestEmail: guestEmail.trim() || undefined,
    roomNumber,
    roomType,
    checkInDate,
    checkOutDate,
    nights,
    roomRate,
    roomTotal,
    extraCharges,
    extraChargesTotal,
    discountAmount,
    isTaxEnabled,
    taxRate: isTaxEnabled ? taxRate : 0,
    cgstAmount,
    sgstAmount,
    taxTotal,
    subtotal,
    grandTotal,
    advancePaid,
    balanceDue,
    paymentMethod,
    paymentStatus,
    notes,
    createdAt: existingInvoice?.createdAt || new Date().toISOString()
  };

  // 1. PRINT INVOICE ACTION
  const handlePrint = () => {
    window.print();
  };

  // 2. WHATSAPP INVOICE ACTION
  const handleSendWhatsApp = () => {
    const cleanPhone = guestPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    let itemsBreakdown = `• Room Charge (${nights}N @ ₹${roomRate}): ₹${roomTotal}\n`;
    if (extraCharges.length > 0) {
      itemsBreakdown += `• Extra Services: ₹${extraChargesTotal}\n`;
      extraCharges.forEach((c) => {
        itemsBreakdown += `   - ${c.title}: ₹${c.amount}\n`;
      });
    }
    if (discountAmount > 0) {
      itemsBreakdown += `• Discount Applied: -₹${discountAmount}\n`;
    }
    if (isTaxEnabled) {
      itemsBreakdown += `• GST (${taxRate}% - CGST+SGST): ₹${taxTotal}\n`;
    }

    const message = `🧾 *OFFICIAL INVOICE - ${hotel.name.toUpperCase()}*\n\n` +
      `Dear *${guestName || 'Valued Guest'}*,\n` +
      `Thank you for staying with us! Here is your verified room reservation bill:\n\n` +
      `📄 *Invoice No:* ${invoiceNumber}\n` +
      `📅 *Dates:* ${checkInDate} to ${checkOutDate} (${nights} Night${nights > 1 ? 's' : ''})\n` +
      `🛏️ *Room:* ${roomNumber} (${roomType})\n\n` +
      `*BILL SUMMARY:*\n` +
      itemsBreakdown +
      `\n*TOTAL AMOUNT: ₹${grandTotal.toLocaleString('en-IN')}*\n` +
      `• Advance Paid: ₹${advancePaid.toLocaleString('en-IN')}\n` +
      `• Balance Due: ₹${balanceDue.toLocaleString('en-IN')}\n` +
      `• Payment Status: *${paymentStatus.toUpperCase()} (${paymentMethod.toUpperCase()})*\n\n` +
      `📍 *Location:* ${hotel.address}, ${hotel.city}, ${hotel.state}\n` +
      `📞 *Contact:* ${hotel.phone}\n\n` +
      `_We hope you enjoyed your stay in Assam. Have a safe journey ahead!_`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // 3. SEND EMAIL ACTION
  const handleSendEmail = async () => {
    if (!guestEmail || !guestEmail.includes('@')) {
      alert(language === 'as' ? 'অনুগ্ৰহ কৰি অতিথিৰ বৈধ ই-মেইল ঠিকনা দিয়ক।' : 'Please enter a valid guest email address.');
      return;
    }

    setIsEmailSending(true);
    setEmailStatusMessage(null);

    try {
      const res = await fetch('/api/invoices/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: compiledInvoice,
          recipientEmail: guestEmail,
          hotelName: hotel.name,
          hotelPhone: hotel.phone
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatusMessage(language === 'as' ? `✅ চালান #${invoiceNumber} সফলভাৱে ${guestEmail} লৈ প্ৰেৰণ কৰা হ’ল!` : `✅ Invoice #${invoiceNumber} emailed successfully to ${guestEmail}!`);
      } else {
        setEmailStatusMessage(`Simulated: Invoice sent to ${guestEmail}`);
      }
    } catch (err) {
      setEmailStatusMessage(`Simulated: Invoice sent to ${guestEmail}`);
    } finally {
      setIsEmailSending(false);
      setTimeout(() => setEmailStatusMessage(null), 4000);
    }
  };

  // 4. SAVE INVOICE & MARK BOOKING BILLED
  const handleSave = () => {
    onSaveInvoice(compiledInvoice, paymentStatus === 'paid');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[95vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0B2545] via-[#123661] to-[#0B2545] text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-[#00E5A3] shadow-inner">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {language === 'as' ? 'চালান আৰু বিল প্ৰস্তুতি (Billing & Invoice)' : 'Billing & Invoice Generation'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-400 text-slate-950 font-black text-[10px] uppercase font-mono">
                  {invoiceNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {hotel.name} • {hotel.city}, {hotel.state}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-800">
          
          {emailStatusMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{emailStatusMessage}</span>
            </div>
          )}

          {/* PRINTABLE INVOICE SHEET (Styled for both Dashboard view and Print) */}
          <div id="printable-invoice" className="border border-slate-200 rounded-2xl p-4 sm:p-6 bg-white shadow-xs print:border-none print:shadow-none print:p-0">
            
            {/* Invoice Top Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0B2545] text-white flex items-center justify-center font-black text-sm">
                    ⚡
                  </div>
                  <h2 className="text-xl font-black text-slate-950 tracking-tight">
                    {hotel.name}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {hotel.address}, {hotel.city}, {hotel.state} - {hotel.pincode}
                </p>
                <div className="text-xs text-slate-600 font-semibold mt-1">
                  Phone: {hotel.phone} • WhatsApp: {hotel.whatsappNumber || hotel.phone}
                </div>
                {hotel.hotelLicenseNumber && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    GSTIN / License: <span className="font-mono font-bold text-slate-600">{hotel.hotelLicenseNumber}</span>
                  </div>
                )}
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  Tax Invoice
                </span>
                <div className="text-lg font-black text-slate-900 mt-1.5 font-mono">
                  {invoiceNumber}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Guest & Stay Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
              
              {/* Guest Details */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Billed To (Guest Details)
                </span>
                <div>
                  <label className="text-[10px] text-slate-400 print:hidden">Guest Full Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Guest Name"
                    className="w-full font-bold text-slate-900 text-sm bg-transparent border-b border-dashed border-slate-300 focus:border-teal-500 focus:outline-hidden py-0.5 print:border-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 print:hidden">Phone</label>
                    <input
                      type="text"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="Phone"
                      className="w-full text-xs font-semibold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-teal-500 focus:outline-hidden py-0.5 print:border-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 print:hidden">Email</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="w-full text-xs font-semibold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-teal-500 focus:outline-hidden py-0.5 print:border-none"
                    />
                  </div>
                </div>
              </div>

              {/* Stay & Room Details */}
              <div className="space-y-1.5 sm:text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Stay & Reservation Details
                </span>
                <div className="flex sm:justify-end items-center gap-2">
                  <span className="text-slate-500">Room:</span>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="font-bold text-slate-900 text-xs w-20 text-left sm:text-right border-b border-dashed border-slate-300 focus:outline-hidden py-0.5 print:border-none"
                  />
                  <span className="text-slate-400">({roomType})</span>
                </div>
                <div className="flex sm:justify-end items-center gap-2">
                  <span className="text-slate-500">Check-In:</span>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="font-semibold text-slate-800 text-xs border-b border-dashed border-slate-300 focus:outline-hidden py-0.5 print:border-none"
                  />
                </div>
                <div className="flex sm:justify-end items-center gap-2">
                  <span className="text-slate-500">Check-Out:</span>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="font-semibold text-slate-800 text-xs border-b border-dashed border-slate-300 focus:outline-hidden py-0.5 print:border-none"
                  />
                </div>
              </div>

            </div>

            {/* Line Items Table */}
            <div className="py-4 border-b border-slate-200">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Nights / Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-2 text-center print:hidden w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {/* Primary Room Charge Row */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">Room Accommodation Tariff</div>
                      <div className="text-[11px] text-slate-400">Room #{roomNumber} ({roomType})</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={nights}
                        onChange={(e) => setNights(Math.max(1, Number(e.target.value) || 1))}
                        className="w-12 text-center font-bold border border-slate-200 rounded-md py-0.5 print:border-none"
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={roomRate}
                        onChange={(e) => setRoomRate(Math.max(0, Number(e.target.value) || 0))}
                        className="w-20 text-right font-bold border border-slate-200 rounded-md py-0.5 print:border-none"
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ₹{roomTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-2 print:hidden"></td>
                  </tr>

                  {/* Extra Services / Add-ons Rows */}
                  {extraCharges.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 group">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {item.title}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-400">1</td>
                      <td className="py-2 px-3 text-right text-slate-600">₹{item.amount.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-2 text-center print:hidden">
                        <button
                          type="button"
                          onClick={() => handleRemoveCharge(item.id)}
                          className="text-rose-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>

              {/* Add Custom Extra Charges Row (Dashboard Only) */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 print:hidden space-y-2">
                <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-teal-600" />
                  <span>Add Additional Services / Food / Laundry</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    value={newChargeTitle}
                    onChange={(e) => setNewChargeTitle(e.target.value)}
                    placeholder="e.g. Traditional Assamese Lunch, Laundry, Airport Taxi"
                    className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-teal-500"
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      value={newChargeAmount}
                      onChange={(e) => setNewChargeAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:border-teal-500 font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCharge}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Quick Add Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 font-bold">Quick Add:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd('Assamese Thali Meal', 350)}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    + Thali (₹350)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd('Laundry Wash & Iron', 200)}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    + Laundry (₹200)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd('Extra Bed Mattress', 500)}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    + Extra Bed (₹500)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd('Airport Pickup Taxi', 1200)}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    + Airport Taxi (₹1200)
                  </button>
                </div>
              </div>

            </div>

            {/* Calculations & GST Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
              
              {/* Payment Details & Notes */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Payment Method & Terms
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="cash">Cash Payment</option>
                      <option value="upi">UPI / GPay / PhonePe</option>
                      <option value="card">Credit / Debit Card</option>
                      <option value="online_portal">Online Portal</option>
                    </select>

                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="paid">PAID (সম্পূৰ্ণ পৰিশোধিত)</option>
                      <option value="partial">PARTIAL (আধা পৰিশোধিত)</option>
                      <option value="pending">PENDING (বাকী আছে)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Invoice Notes / Guest Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Standard check-out time is 11:00 AM."
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div className="text-[11px] text-slate-400 italic">
                  * This is a computer-generated tax invoice verified by {hotel.name}.
                </div>
              </div>

              {/* Total Summary Breakdown Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                
                <div className="flex items-center justify-between text-slate-600">
                  <span>Room Charges Total:</span>
                  <span className="font-semibold text-slate-900">₹{roomTotal.toLocaleString('en-IN')}</span>
                </div>

                {extraChargesTotal > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Extra Services & Dining:</span>
                    <span className="font-semibold text-slate-900">+₹{extraChargesTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Discount Row */}
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <span>Special Discount:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">-₹</span>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                      className="w-16 text-right font-bold border border-slate-200 rounded px-1 py-0.5 text-xs text-rose-600 print:border-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-700 font-bold pt-1 border-t border-slate-200">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {/* GST Toggle & Breakdown */}
                <div className="pt-1 border-t border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
                      <input
                        type="checkbox"
                        checked={isTaxEnabled}
                        onChange={(e) => setIsTaxEnabled(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Apply GST Tax</span>
                    </label>

                    {isTaxEnabled && (
                      <select
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="text-xs font-bold border border-slate-200 rounded px-1.5 py-0.5 bg-white"
                      >
                        <option value={5}>5% GST (2.5% + 2.5%)</option>
                        <option value={12}>12% GST (6% + 6%)</option>
                        <option value={18}>18% GST (9% + 9%)</option>
                      </select>
                    )}
                  </div>

                  {isTaxEnabled && (
                    <div className="text-[11px] text-slate-500 pl-4 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span>• CGST ({taxRate / 2}%):</span>
                        <span>₹{cgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• SGST ({taxRate / 2}%):</span>
                        <span>₹{sgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="flex items-center justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-300">
                  <span>Grand Total:</span>
                  <span className="text-teal-700 text-lg">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Advance & Balance */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  <span>Advance / Deposit Paid:</span>
                  <div className="flex items-center gap-1">
                    <span>₹</span>
                    <input
                      type="number"
                      min="0"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Math.max(0, Number(e.target.value) || 0))}
                      className="w-16 text-right font-bold border border-slate-200 rounded px-1 py-0.5 text-xs text-slate-800 print:border-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-slate-200">
                  <span className={balanceDue > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                    {balanceDue > 0 ? 'Balance Due:' : 'All Paid / Balance: ₹0'}
                  </span>
                  <span className={`text-sm ${balanceDue > 0 ? 'text-amber-700 font-black' : 'text-emerald-700'}`}>
                    ₹{balanceDue.toLocaleString('en-IN')}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer / Action Toolbar */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-2 flex-wrap shrink-0 print:hidden">
          
          {/* Left: Communication Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Print standard A4 / Thermal Receipt"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Invoice</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
              title="Send bill breakdown via WhatsApp to guest"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isEmailSending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Email invoice to guest"
            >
              <Mail className="w-4 h-4" />
              <span>{isEmailSending ? 'Sending...' : 'Send Email'}</span>
            </button>
          </div>

          {/* Right: Save & Complete Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 text-xs font-black shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Mark as Billed</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
