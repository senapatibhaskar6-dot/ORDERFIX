import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Printer,
  Send,
  Mail,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  DollarSign,
  TrendingUp,
  Percent,
  Download,
  Building2,
  Phone
} from 'lucide-react';
import { Invoice, HotelProfile, Booking } from '../types';
import { LanguageCode, getTranslations } from '../utils/translations';

interface BillingInvoiceViewProps {
  invoices: Invoice[];
  hotel: HotelProfile;
  bookings: Booking[];
  onOpenInvoiceModal: (invoice?: Invoice | null, booking?: Booking | null) => void;
  onDeleteInvoice: (id: string) => void;
  language?: LanguageCode;
}

export const BillingInvoiceView: React.FC<BillingInvoiceViewProps> = ({
  invoices,
  hotel,
  bookings,
  onOpenInvoiceModal,
  onDeleteInvoice,
  language = 'en'
}) => {
  const t = getTranslations(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Filter invoices for current hotel
  const hotelInvoices = useMemo(() => {
    return invoices.filter((inv) => !inv.hotelId || inv.hotelId === hotel.id);
  }, [invoices, hotel.id]);

  // Aggregate Metrics
  const totalInvoicedRevenue = useMemo(() => {
    return hotelInvoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
  }, [hotelInvoices]);

  const totalGSTCollected = useMemo(() => {
    return hotelInvoices.reduce((sum, inv) => sum + Number(inv.taxTotal || 0), 0);
  }, [hotelInvoices]);

  const totalPaidRevenue = useMemo(() => {
    return hotelInvoices
      .filter((inv) => inv.paymentStatus === 'paid')
      .reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
  }, [hotelInvoices]);

  const totalOutstandingDue = useMemo(() => {
    return hotelInvoices.reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0);
  }, [hotelInvoices]);

  // Filtered List
  const filteredInvoices = useMemo(() => {
    return hotelInvoices.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.guestName.toLowerCase().includes(q) ||
        inv.guestPhone.includes(q) ||
        inv.roomNumber.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
      const matchesMonth = selectedMonth === 'all' || (inv.createdAt && inv.createdAt.startsWith(selectedMonth));

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [hotelInvoices, searchQuery, statusFilter, selectedMonth]);

  // Quick Action: WhatsApp Send
  const handleQuickWhatsApp = (inv: Invoice) => {
    const cleanPhone = inv.guestPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message = `🧾 *INVOICE #${inv.invoiceNumber} - ${hotel.name.toUpperCase()}*\n\n` +
      `Dear *${inv.guestName}*,\n` +
      `Thank you for staying with us at ${hotel.name}.\n` +
      `• Room: ${inv.roomNumber} (${inv.nights} Nights)\n` +
      `• Dates: ${inv.checkInDate} to ${inv.checkOutDate}\n` +
      `• Total Amount: *₹${inv.grandTotal.toLocaleString('en-IN')}*\n` +
      `• Status: *${inv.paymentStatus.toUpperCase()} (${inv.paymentMethod.toUpperCase()})*\n\n` +
      `We look forward to hosting you again in Assam. Safe travels!`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-5">
      
      {/* 1. Header Banner & Quick Action */}
      <div className="bg-gradient-to-r from-[#0B2545] via-[#133A69] to-[#0B2545] text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/20 text-[#00E5A3] border border-teal-400/30">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {language === 'as' ? 'চালান আৰু বিলিং মেনেজমেন্ট (Billing & Invoices)' : 'Billing & Invoice Management System'}
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {language === 'as'
              ? 'অতিথিৰ কোঠাৰ মাচুল, খাদ্য, লণ্ড্ৰী আৰু অন্যান্য সেৱাৰ বাবে জিএছটি সহ অফিচিয়েল এ৪/থাৰ্মেল চালান প্ৰস্তুত আৰু হোৱাটছএপত প্ৰেৰণ কৰক।'
              : 'Generate professional GST tax invoices for room charges, dining, and extra services. Instantly print or send via WhatsApp & Email.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenInvoiceModal(null, null)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-md cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Custom Invoice</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Invoiced Volume */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Total Invoiced</span>
            <div className="p-1.5 rounded-xl bg-teal-50 text-teal-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-950">
            ₹{totalInvoicedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Across {hotelInvoices.length} invoices generated
          </div>
        </div>

        {/* GST Tax Collected */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">GST Tax Collected</span>
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">
            ₹{totalGSTCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            CGST + SGST statutory total
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Paid Amount</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            ₹{totalPaidRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Fully collected & settled
          </div>
        </div>

        {/* Balance Due */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Balance Due</span>
            <div className="p-1.5 rounded-xl bg-rose-50 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black ${totalOutstandingDue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            ₹{totalOutstandingDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Pending customer collections
          </div>
        </div>

      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice #, guest name, phone, room..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white focus:outline-hidden"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid (পৰিশোধিত)</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 sm:px-4">Invoice # & Date</th>
                <th className="py-3 px-3">Guest Details</th>
                <th className="py-3 px-3">Room & Stay</th>
                <th className="py-3 px-3 text-right">Subtotal (₹)</th>
                <th className="py-3 px-3 text-right">GST (₹)</th>
                <th className="py-3 px-3 text-right">Grand Total (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div>No invoices found matching your criteria.</div>
                    <button
                      type="button"
                      onClick={() => onOpenInvoiceModal(null, null)}
                      className="mt-2 text-teal-600 font-bold hover:underline"
                    >
                      + Generate your first invoice
                    </button>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Invoice Number & Date */}
                    <td className="py-3 px-3 sm:px-4 font-mono font-bold text-teal-950 whitespace-nowrap">
                      <div>{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN') : inv.checkInDate}
                      </div>
                    </td>

                    {/* Guest Name & Phone */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{inv.guestName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{inv.guestPhone}</div>
                      {inv.guestEmail && (
                        <div className="text-[10px] text-sky-600 truncate max-w-xs">{inv.guestEmail}</div>
                      )}
                    </td>

                    {/* Room & Dates */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800">Room #{inv.roomNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        {inv.nights} night{inv.nights > 1 ? 's' : ''} ({inv.checkInDate})
                      </div>
                    </td>

                    {/* Subtotal */}
                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      ₹{inv.subtotal.toLocaleString('en-IN')}
                    </td>

                    {/* GST Amount */}
                    <td className="py-3 px-3 text-right font-medium text-amber-700">
                      {inv.isTaxEnabled ? `₹${inv.taxTotal.toLocaleString('en-IN')} (${inv.taxRate}%)` : '₹0 (Exempt)'}
                    </td>

                    {/* Grand Total */}
                    <td className="py-3 px-3 text-right font-black text-slate-950 text-sm">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>

                    {/* Payment Status Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                          inv.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.paymentStatus === 'partial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {inv.paymentStatus === 'paid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        <span>{inv.paymentStatus}</span>
                      </span>
                      <div className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">{inv.paymentMethod}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenInvoiceModal(inv, null)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="View & Edit Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickWhatsApp(inv)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                          title="Send to Guest WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
