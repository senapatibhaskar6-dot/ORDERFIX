import React, { useState, useRef } from 'react';
import { Booking, Room, HotelProfile, GuestVerificationData, IdDocumentType } from '../types';
import { formatDateShort, formatDateFull } from '../utils/bookingEngine';
import {
  generateDailyPoliceWhatsAppMessage,
  generateSingleGuestPoliceWhatsAppMessage,
  generatePoliceEmailPayload,
  SAMPLE_ID_PRESETS
} from '../utils/policeReport';
import {
  ShieldCheck,
  Camera,
  Upload,
  MessageCircle,
  Mail,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  FileText,
  AlertTriangle,
  Search,
  Sparkles,
  Phone,
  Trash2,
  Edit3,
  Settings,
  X,
  ExternalLink,
  Info,
  Car,
  Eye,
  Check,
  Layers
} from 'lucide-react';

interface PoliceVerificationViewProps {
  hotel: HotelProfile;
  bookings: Booking[];
  rooms: Room[];
  verifications: GuestVerificationData[];
  onAddVerification: (verification: GuestVerificationData) => void;
  onUpdateVerification: (verification: GuestVerificationData) => void;
  onDeleteVerification: (id: string) => void;
  onUpdateHotelProfile: (updated: HotelProfile) => void;
}

export const PoliceVerificationView: React.FC<PoliceVerificationViewProps> = ({
  hotel,
  bookings,
  rooms,
  verifications,
  onAddVerification,
  onUpdateVerification,
  onDeleteVerification,
  onUpdateHotelProfile
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [previewGuest, setPreviewGuest] = useState<GuestVerificationData | null>(null);

  // Thana Settings Form State
  const [thanaName, setThanaName] = useState(hotel.policeStationName || 'Dispur Police Station, Guwahati');
  const [thanaWhatsApp, setThanaWhatsApp] = useState(hotel.policeStationWhatsApp || '+91 94350 12345');
  const [thanaEmail, setThanaEmail] = useState(hotel.policeStationEmail || 'dispur-ps@assampolice.gov.in');
  const [thanaIncharge, setThanaIncharge] = useState(hotel.policeStationIncharge || 'Officer-in-Charge, Local PS');
  const [hotelLicense, setHotelLicense] = useState(hotel.hotelLicenseNumber || 'ASM/GHY/HTL/2024-912');

  // Scanner Form State
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  // Form Fields
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>(rooms[0]?.roomNumber || '101');
  const [guestName, setGuestName] = useState<string>('');
  const [age, setAge] = useState<string | number>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState<string>('');
  const [idType, setIdType] = useState<IdDocumentType>('aadhaar');
  const [idNumber, setIdNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [nationality, setNationality] = useState<string>('Indian');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>(today);
  const [checkInTime, setCheckInTime] = useState<string>('12:00 PM');
  const [checkOutDate, setCheckOutDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [purposeOfVisit, setPurposeOfVisit] = useState<GuestVerificationData['purposeOfVisit']>('Tourism / Leisure');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered List
  const filteredVerifications = verifications.filter((v) => {
    // Date match: checkInDate or checkOutDate
    const matchesDate = !selectedDate || v.checkInDate === selectedDate || v.checkOutDate === selectedDate;
    if (!matchesDate) return false;

    if (filterStatus === 'pending' && v.policeReportStatus !== 'pending') return false;
    if (filterStatus === 'submitted' && v.policeReportStatus !== 'submitted') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = v.guestName.toLowerCase().includes(q);
      const matchRoom = v.roomNumber.toLowerCase().includes(q);
      const matchPhone = v.phone.toLowerCase().includes(q);
      const matchId = v.idNumber.toLowerCase().includes(q);
      const matchAddress = v.address.toLowerCase().includes(q);
      return matchName || matchRoom || matchPhone || matchId || matchAddress;
    }

    return true;
  });

  const pendingCount = verifications.filter((v) => v.policeReportStatus === 'pending').length;
  const submittedCount = verifications.filter((v) => v.policeReportStatus === 'submitted').length;

  // Handle OCR image scan using /api/extract-id with fallback
  const handleImageSelected = async (file: File) => {
    if (!file) return;

    setIsScanning(true);
    setScanError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setUploadedImagePreview(base64Data);

      try {
        const response = await fetch('/api/extract-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg'
          })
        });

        const result = await response.json();

        if (result.success && result.data) {
          const d = result.data;
          if (d.guestName) setGuestName(d.guestName);
          if (d.idType) setIdType(d.idType);
          if (d.idNumber) setIdNumber(d.idNumber);
          if (d.gender) setGender(d.gender);
          if (d.age) setAge(d.age);
          if (d.dob) setDob(d.dob);
          if (d.address) setAddress(d.address);
          if (d.nationality) setNationality(d.nationality);
          if (d.phone) setPhone(d.phone);
        } else {
          // If server key is missing or fallback
          setScanError(result.error || 'AI OCR could not structure document automatically. Please fill details or test with demo preset.');
        }
      } catch (err: any) {
        console.warn('OCR fetch error:', err);
        setScanError('Scanner server offline. You can manually enter details or use the 1-click sample presets below.');
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Populate from preset sample ID card
  const handleApplyPreset = (preset: typeof SAMPLE_ID_PRESETS[0]) => {
    const s = preset.sample;
    if (s.guestName) setGuestName(s.guestName);
    if (s.idType) setIdType(s.idType);
    if (s.idNumber) setIdNumber(s.idNumber);
    if (s.age) setAge(s.age);
    if (s.gender) setGender(s.gender);
    if (s.dob) setDob(s.dob);
    if (s.address) setAddress(s.address);
    if (s.nationality) setNationality(s.nationality);
    if (s.phone) setPhone(s.phone);
    if (s.purposeOfVisit) setPurposeOfVisit(s.purposeOfVisit);
    if (s.vehicleNumber) setVehicleNumber(s.vehicleNumber);
    setScanError(null);
  };

  // Populate from existing active booking
  const handleSelectBooking = (bkId: string) => {
    setSelectedBookingId(bkId);
    const bk = bookings.find((b) => b.id === bkId);
    if (bk) {
      setGuestName(bk.guestName);
      setPhone(bk.guestPhone);
      if (bk.guestEmail) setEmail(bk.guestEmail);
      setRoomNumber(bk.roomNumber);
      setCheckInDate(bk.checkInDate);
      if (bk.checkInTime) setCheckInTime(bk.checkInTime);
      setCheckOutDate(bk.checkOutDate);
    }
  };

  // Submit new / updated verification
  const handleSaveVerification = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim() || !idNumber.trim()) {
      alert('Please provide Guest Full Name and ID Document Number.');
      return;
    }

    const newVerification: GuestVerificationData = {
      id: `ver-${Date.now()}`,
      bookingId: selectedBookingId || undefined,
      roomNumber,
      guestName: guestName.trim(),
      age: age ? Number(age) : undefined,
      gender,
      dob: dob || undefined,
      idType,
      idNumber: idNumber.trim(),
      address: address.trim() || 'Address as per ID document',
      nationality: nationality.trim() || 'Indian',
      phone: phone.trim(),
      email: email.trim() || undefined,
      checkInDate,
      checkInTime,
      checkOutDate,
      purposeOfVisit,
      vehicleNumber: vehicleNumber.trim() || undefined,
      idPhotoUrl: uploadedImagePreview || undefined,
      policeReportStatus: 'pending',
      notes: notes.trim() || undefined
    };

    onAddVerification(newVerification);
    resetScannerForm();
    setIsScanModalOpen(false);
  };

  const resetScannerForm = () => {
    setUploadedImagePreview(null);
    setGuestName('');
    setAge('');
    setDob('');
    setIdNumber('');
    setAddress('');
    setPhone('');
    setEmail('');
    setVehicleNumber('');
    setNotes('');
    setScanError(null);
  };

  // One-Click WhatsApp Dispatch to Local Police Station
  const handleDispatchDailyWhatsApp = () => {
    const rawNumber = hotel.policeStationWhatsApp || '9435012345';
    const cleanNumber = rawNumber.replace(/\D/g, '');
    const message = generateDailyPoliceWhatsAppMessage(hotel, filteredVerifications, selectedDate);
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    // Mark active filtered guests as submitted
    filteredVerifications.forEach((v) => {
      onUpdateVerification({
        ...v,
        policeReportStatus: 'submitted',
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        dispatchMethod: 'whatsapp'
      });
    });

    window.open(waUrl, '_blank');
  };

  // One-Click Email Dispatch to Thana
  const handleDispatchDailyEmail = () => {
    const emailPayload = generatePoliceEmailPayload(hotel, filteredVerifications, selectedDate);

    filteredVerifications.forEach((v) => {
      onUpdateVerification({
        ...v,
        policeReportStatus: 'submitted',
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        dispatchMethod: 'email'
      });
    });

    window.location.href = emailPayload.mailToUrl;
  };

  // Single Guest WhatsApp Dispatch
  const handleDispatchSingleWhatsApp = (v: GuestVerificationData) => {
    const rawNumber = hotel.policeStationWhatsApp || '9435012345';
    const cleanNumber = rawNumber.replace(/\D/g, '');
    const message = generateSingleGuestPoliceWhatsAppMessage(hotel, v);
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    onUpdateVerification({
      ...v,
      policeReportStatus: 'submitted',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      dispatchMethod: 'whatsapp'
    });

    window.open(waUrl, '_blank');
  };

  // Save Thana Settings
  const handleSaveThanaSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHotelProfile({
      ...hotel,
      policeStationName: thanaName.trim(),
      policeStationWhatsApp: thanaWhatsApp.trim(),
      policeStationEmail: thanaEmail.trim(),
      policeStationIncharge: thanaIncharge.trim(),
      hotelLicenseNumber: hotelLicense.trim()
    });
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Top Police Compliance Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] via-[#123966] to-[#0A223E] text-white p-4 sm:p-6 rounded-3xl shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                পুলিচ ভেৰিফিকেচন পৰ্টেল (Police Verification)
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-400" />
                {hotel.policeStationName || 'Dispur Police Station, Guwahati'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              অতিথিৰ আই-ডি ভেৰিফিকেচন আৰু থানা ৰিপৰ্ট (Guest Reporting Log)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              আধাকুছি / আধাৰ, পাছপ’ৰ্ট বা ভোটাৰ কাৰ্ড স্কেন কৰি ১-ক্লিকত স্থানীয় থানালৈ হোৱাটছএপ বা ইমেইলযোগে দৈনিক অতিথি খতিয়ান (C-Form / Guest Log) প্ৰেৰণ কৰক।
            </p>
          </div>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                resetScannerForm();
                setIsScanModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>+ আই-ডি স্কেন কৰক (Scan Guest ID)</span>
            </button>

            <button
              onClick={handleDispatchDailyWhatsApp}
              disabled={filteredVerifications.length === 0}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all active:scale-95 cursor-pointer ${
                filteredVerifications.length === 0
                  ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed'
                  : 'bg-[#25D366] hover:bg-[#20ba5a]'
              }`}
              title="Send formatted guest log to local police station on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>থানালৈ পঠাওক (WhatsApp)</span>
            </button>

            <button
              onClick={handleDispatchDailyEmail}
              disabled={filteredVerifications.length === 0}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs border border-white/20 transition-all cursor-pointer ${
                filteredVerifications.length === 0
                  ? 'bg-white/5 text-slate-400 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Send via Email to Thana"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">ইমেইল</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              title="Print Police Verification Register"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              title="Police Station Contact Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date & Quick Status Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-bold">তাৰিখ বাছনি:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 text-xs font-bold rounded-lg bg-slate-900/80 border border-white/20 text-white focus:outline-hidden cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              সকলো ({verifications.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterStatus === 'pending'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-amber-300 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>বাকী ({pendingCount})</span>
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterStatus === 'submitted'
                  ? 'bg-emerald-400 text-slate-950 font-black shadow-xs'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>প্ৰেৰিত ({submittedCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Police Station Profile Header Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-rose-700" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm">
              {hotel.policeStationName || 'Dispur Police Station, Guwahati'}
            </div>
            <div className="text-slate-500 text-[11px]">
              ইনচাৰ্জ: {hotel.policeStationIncharge || 'OC'} • হোৱাটছএপ: <span className="font-mono text-emerald-700 font-bold">{hotel.policeStationWhatsApp || '+91 94350 12345'}</span> • লাইচেঞ্চ: {hotel.hotelLicenseNumber || 'N/A'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="self-end sm:self-auto text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer text-xs"
        >
          থানা সবিশেষ সলনি কৰক ⚙️
        </button>
      </div>

      {/* GUEST LOG REGISTER TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>দৈনিক অতিথি পঞ্জীয়ন বহী (Daily Guest Register / C-Form)</span>
              <span className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-bold">
                {filteredVerifications.length} অতিথি
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              ভাৰতীয় নাগৰিক আৰু বিদেশী পৰ্যটকৰ চৰকাৰী নিয়ম অনুসৰি সত্যাপিত তালিকা
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="অতিথিৰ নাম, ৰূম, আধাৰ বা ফোন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => {
                resetScannerForm();
                setIsScanModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>+ নতুন স্কেন</span>
            </button>
          </div>
        </div>

        {/* Mobile Native Card View (md:hidden) for smartphones */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredVerifications.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-slate-700 text-sm">এই তাৰিখত কোনো অতিথিৰ তথ্য নাই</div>
              <div className="text-xs text-slate-400 mt-1 mb-4">
                তলৰ বুটাম টিপি আধাৰ কাৰ্ড বা পাছপ’ৰ্ট কেমেৰাৰে স্কেন কৰক
              </div>
              <button
                onClick={() => {
                  resetScannerForm();
                  setIsScanModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md"
              >
                <Camera className="w-4 h-4" />
                <span>+ আই-ডি স্কেন কৰক</span>
              </button>
            </div>
          ) : (
            filteredVerifications.map((v) => (
              <div key={v.id} className="p-3.5 space-y-2.5 bg-white hover:bg-slate-50 transition-colors">
                
                {/* Card Top: Room, Name & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                      Room {v.roomNumber}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {v.guestName}
                      </h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="uppercase font-bold text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {v.idType === 'aadhaar' ? 'Aadhaar' : v.idType === 'voter_id' ? 'Voter ID' : v.idType.toUpperCase()}
                        </span>
                        <span className="font-mono text-slate-700 font-semibold">{v.idNumber}</span>
                      </div>
                    </div>
                  </div>

                  {v.policeReportStatus === 'submitted' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      প্ৰেৰিত
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                      <Clock className="w-3 h-3 text-amber-600" />
                      বাকী
                    </span>
                  )}
                </div>

                {/* Card Details: Phone, Address, Dates */}
                <div className="bg-slate-50/80 rounded-xl p-2.5 space-y-1.5 text-xs text-slate-600 border border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">আগমন / প্ৰস্থান:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDateShort(v.checkInDate)} {v.checkInTime || ''} ➔ {formatDateShort(v.checkOutDate)}
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-[11px] gap-2">
                    <span className="text-slate-500 shrink-0">স্থায়ী ঠিকনা:</span>
                    <span className="font-medium text-slate-700 text-right line-clamp-1 truncate max-w-[200px]" title={v.address}>
                      {v.address}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">ফোন:</span>
                      <a
                        href={`tel:${v.phone}`}
                        className="font-mono font-bold text-teal-700 underline"
                      >
                        {v.phone}
                      </a>
                    </div>
                    {v.vehicleNumber && (
                      <span className="font-mono text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded font-bold">
                        🚗 {v.vehicleNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Touch Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleDispatchSingleWhatsApp(v)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-black text-xs shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>থানালৈ পঠাওক (WhatsApp)</span>
                  </button>

                  <button
                    onClick={() => setPreviewGuest(v)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete verification record for ${v.guestName}?`)) {
                        onDeleteVerification(v.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3">ক্ৰমিক (Sl)</th>
                <th className="py-2.5 px-3">ৰূম (Room)</th>
                <th className="py-2.5 px-3">অতিথিৰ নাম (Guest Name)</th>
                <th className="py-2.5 px-3">আই-ডি প্ৰকাৰ আৰু নম্বৰ (ID Document)</th>
                <th className="py-2.5 px-3">বয়স/লিংগ</th>
                <th className="py-2.5 px-3">স্থায়ী ঠিকনা (Address)</th>
                <th className="py-2.5 px-3">ফোন নম্বৰ</th>
                <th className="py-2.5 px-3">আগমন / প্ৰস্থান</th>
                <th className="py-2.5 px-3">উদ্দেশ্য & বাহন</th>
                <th className="py-2.5 px-3">পুলিচ স্থিতি</th>
                <th className="py-2.5 px-3 text-right">ব্যৱস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVerifications.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-bold text-slate-700 text-xs">এই তাৰিখত কোনো অতিথিৰ তথ্য পোৱা নগ'ল</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ওপৰৰ &quot;+ আই-ডি স্কেন কৰক&quot; বুটামত টিপি আধাৰ বা পাছপ’ৰ্ট স্কেন কৰক।
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVerifications.map((v, idx) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {v.roomNumber}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{v.guestName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {v.nationality || 'Indian'}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-bold text-xs uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-800">
                        {v.idType}
                      </span>
                      <div className="font-mono text-slate-900 font-bold mt-0.5">
                        {v.idNumber}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-700">
                      {v.age ? `${v.age} yrs` : 'N/A'} • {v.gender || 'M'}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 max-w-[180px] truncate" title={v.address}>
                      {v.address}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-800 font-semibold whitespace-nowrap">
                      {v.phone}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 text-[11px]">
                      <div>{formatDateShort(v.checkInDate)} {v.checkInTime || ''}</div>
                      <div className="text-slate-500">যাব: {formatDateShort(v.checkOutDate)}</div>
                    </td>

                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <div>{v.purposeOfVisit || 'Tourism'}</div>
                      {v.vehicleNumber && (
                        <div className="font-mono text-[10px] text-teal-800 font-bold">
                          🚗 {v.vehicleNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      {v.policeReportStatus === 'submitted' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          প্ৰেৰিত ({v.dispatchMethod || 'WhatsApp'})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          <Clock className="w-3 h-3 text-amber-600" />
                          বাকী (Pending)
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDispatchSingleWhatsApp(v)}
                          className="p-1 rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Send individual guest details to Police WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setPreviewGuest(v)}
                          className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View complete verification file"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete verification record for ${v.guestName}?`)) {
                              onDeleteVerification(v.id);
                            }
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete record"
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

      {/* ========================================================= */}
      {/* 1. GUEST ID SCANNER & AI EXTRACTION MODAL */}
      {/* ========================================================= */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0B2545] to-[#123661] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-[#00E5A3]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    আই-ডি স্কেনাৰ আৰু তথ্য নিষ্কাষণ (Guest ID Scanner)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    আধাৰ, পাছপ’ৰ্ট বা ভোটাৰ কাৰ্ড স্কেন কৰি ১ মিনিটত তথ্য সংগ্ৰহ কৰক
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsScanModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveVerification} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
                
                {/* Scanner Actions Card */}
                <div className="p-3.5 bg-slate-50 border-2 border-dashed border-teal-400/80 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        <span>আই-ডি স্কেন বা ফটো তুলক (Capture / Upload ID)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Aadhaar, Passport, Voter ID বা Driving License-ৰ স্পষ্ট ছবি দিয়ক
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={cameraInputRef}
                        onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>কেমেৰা (Camera)</span>
                      </button>

                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>ফাইল (Upload)</span>
                      </button>
                    </div>
                  </div>

                  {/* Scanning Animation / Indicator */}
                  {isScanning && (
                    <div className="p-3 bg-teal-50 border border-teal-300 rounded-xl flex items-center gap-2.5 text-teal-900 animate-pulse font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
                      <span>Gemini AI দ্বাৰা আই-ডি বিশ্লেষণ কৰি নাম, আধাৰ আৰু ঠিকনা উলিওৱা হৈ আছে...</span>
                    </div>
                  )}

                  {scanError && (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-[11px]">
                      {scanError}
                    </div>
                  )}

                  {/* 1-Click Demo Presets for Hotel Staff */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      ১-ক্লিকত নমুনা আই-ডি পৰীক্ষা কৰক (Demo Presets):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_ID_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleApplyPreset(p)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-teal-500 hover:bg-teal-50 text-[11px] font-bold text-slate-800 transition-colors cursor-pointer"
                        >
                          ⚡ {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {uploadedImagePreview && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                      <img
                        src={uploadedImagePreview}
                        alt="Uploaded ID Preview"
                        className="w-16 h-12 object-cover rounded-lg border border-slate-300 shrink-0"
                      />
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-900 block">ফটো সংলগ্ন কৰা হ'ল ✓</span>
                        <span className="text-slate-500">পুলিচ খতিয়ানৰ বাবে এই ছবি সংৰক্ষিত থাকিব।</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Link to Existing Booking Dropdown */}
                {bookings.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      বৰ্তমানৰ চেক-ইন বুকিঙৰ সৈতে সংযোগ কৰক (Link Booking - Optional)
                    </label>
                    <select
                      value={selectedBookingId}
                      onChange={(e) => handleSelectBooking(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-slate-900 font-medium bg-white"
                    >
                      <option value="">-- নতুন অতিথি হিচাপে প্ৰবিষ্ট কৰক --</option>
                      {bookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          Room {b.roomNumber} - {b.guestName} ({b.checkInDate})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Extracted Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      অতিথিৰ সম্পূৰ্ণ নাম (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhaskar Jyoti Baruah"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      কোঠা নম্বৰ (Room Number) *
                    </label>
                    <select
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-extrabold bg-white"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.roomNumber}>
                          Room {r.roomNumber} ({r.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      আই-ডি প্ৰকাৰ (ID Type) *
                    </label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value as IdDocumentType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold bg-white"
                    >
                      <option value="aadhaar">Aadhaar Card (আধাৰ কাৰ্ড)</option>
                      <option value="passport">Passport (পাছপ’ৰ্ট)</option>
                      <option value="voter_id">Voter ID (ভোটাৰ কাৰ্ড)</option>
                      <option value="driving_license">Driving License (ড্ৰাইভিং লাইচেঞ্চ)</option>
                      <option value="other">Other Official Govt ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      আই-ডি নম্বৰ (ID Document Number) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 7823 4519 8832 or Z5819420"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        বয়স (Age)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 34"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        লিংগ (Gender)
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-2 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold bg-white"
                      >
                        <option value="Male">পুৰুষ (Male)</option>
                        <option value="Female">মহিলা (Female)</option>
                        <option value="Other">অন্যান্য (Other)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      মোবাইল নম্বৰ (Phone) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      স্থায়ী ঠিকনা (Permanent Address) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Full residential address as written on ID card"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      আগমনৰ তাৰিখ (Check-in)
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      প্ৰস্থানৰ তাৰিখ (Check-out)
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ভ্ৰমণৰ উদ্দেশ্য (Purpose of Visit)
                    </label>
                    <select
                      value={purposeOfVisit}
                      onChange={(e) => setPurposeOfVisit(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium"
                    >
                      <option value="Tourism / Leisure">Tourism / Leisure (ভ্ৰমণ/ছুটী)</option>
                      <option value="Business / Work">Business / Work (ব্যৱসায়/কৰ্ম)</option>
                      <option value="Medical / Treatment">Medical / Treatment (চিকিৎসা)</option>
                      <option value="Family / Personal">Family / Personal (পৰিয়াল/ব্যক্তিগত)</option>
                      <option value="Transit">Transit (যাত্ৰাৰ পথত)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      বাহন নম্বৰ (Vehicle No - Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AS-01-EF-4921"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono"
                    />
                  </div>
                </div>

              </div>

              {/* Sticky Submit Footer */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between gap-2 z-20 shadow-md">
                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল (Cancel)
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-teal-400 hover:bg-teal-500 active:scale-95 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>পুলিচ বহীত সংৰক্ষণ কৰক (Save to Police Log)</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. POLICE STATION SETTINGS MODAL */}
      {/* ========================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-[#0B2545] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00E5A3]" />
                <h3 className="font-bold text-sm sm:text-base">
                  স্থানীয় থানা আৰু পুলিচ যোগাযোগ (Police Station Setup)
                </h3>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveThanaSettings} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  থানাৰ নাম (Local Police Station / Thana) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dispur Police Station, Guwahati"
                  value={thanaName}
                  onChange={(e) => setThanaName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  থানাৰ অফিচিয়েল হোৱাটছএপ নম্বৰ (Police WhatsApp Number) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 94350 12345"
                  value={thanaWhatsApp}
                  onChange={(e) => setThanaWhatsApp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  ১-ক্লিকত দৈনিক অতিথি খতিয়ান এই নম্বৰলৈ হোৱাটছএপ মেছেজ হৈ যাব।
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  থানা / এছ.পি কাৰ্যালয়ৰ ইমেইল (Police Official Email) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="dispur-ps@assampolice.gov.in"
                  value={thanaEmail}
                  onChange={(e) => setThanaEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ভাৰপ্ৰাপ্ত বিষয়া (OC / Beat Officer)
                  </label>
                  <input
                    type="text"
                    placeholder="Inspector B. Borah"
                    value={thanaIncharge}
                    onChange={(e) => setThanaIncharge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    হোটেল লাইচেঞ্চ নম্বৰ (Reg No)
                  </label>
                  <input
                    type="text"
                    placeholder="ASM/GHY/HTL/2024-912"
                    value={hotelLicense}
                    onChange={(e) => setHotelLicense(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  সংৰক্ষণ কৰক (Save Settings)
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. GUEST VERIFICATION DOSSIER PREVIEW MODAL */}
      {/* ========================================================= */}
      {previewGuest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-[#0B2545] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-300">Police Verification Dossier</span>
                <h3 className="font-bold text-base text-white">
                  Room {previewGuest.roomNumber} • {previewGuest.guestName}
                </h3>
              </div>
              <button onClick={() => setPreviewGuest(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">আই-ডি প্ৰকাৰ</span>
                  <span className="font-bold text-slate-900 uppercase">{previewGuest.idType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">আই-ডি নম্বৰ</span>
                  <span className="font-mono font-bold text-slate-900">{previewGuest.idNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">বয়স আৰু লিংগ</span>
                  <span className="font-bold text-slate-900">{previewGuest.age || 'N/A'} yrs • {previewGuest.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">মোবাইল নম্বৰ</span>
                  <span className="font-mono font-bold text-slate-900">{previewGuest.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold block mb-0.5">স্থায়ী ঠিকনা (Permanent Address)</span>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                  {previewGuest.address}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">চেক-ইন</span>
                  <span className="font-bold text-slate-900">{formatDateShort(previewGuest.checkInDate)} {previewGuest.checkInTime}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">চেক-আউট</span>
                  <span className="font-bold text-slate-900">{formatDateShort(previewGuest.checkOutDate)}</span>
                </div>
              </div>

              {previewGuest.vehicleNumber && (
                <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                  <span className="font-bold text-teal-900">পঞ্জীভুক্ত বাহন (Vehicle):</span>
                  <span className="font-mono font-black text-teal-950">{previewGuest.vehicleNumber}</span>
                </div>
              )}

              {previewGuest.idPhotoUrl && (
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">স্কেন কৰা আই-ডি কাৰ্ডৰ ফটো:</span>
                  <img
                    src={previewGuest.idPhotoUrl}
                    alt="ID Document"
                    className="w-full max-h-48 object-contain rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              )}

              <div className="pt-2 border-t flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    handleDispatchSingleWhatsApp(previewGuest);
                    setPreviewGuest(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>থানালৈ পঠাওক (WhatsApp)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewGuest(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বন্ধ কৰক
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. PRINTABLE OFFICIAL POLICE REGISTER SHEET (PRINT ONLY) */}
      {/* ========================================================= */}
      <div id="printable-police-report" className="hidden print:block p-8 bg-white text-slate-900 font-serif">
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
          <h1 className="text-xl font-bold uppercase tracking-wider">
            {hotel.name}
          </h1>
          <p className="text-sm">
            {hotel.address}, {hotel.city}, {hotel.state} - {hotel.pincode}
          </p>
          <p className="text-xs mt-1">
            Govt. Reg / Trade License No: <strong>{hotel.hotelLicenseNumber || 'ASM/GHY/HTL/2024-912'}</strong> • Phone: {hotel.phone}
          </p>
          <div className="mt-2 text-sm font-bold uppercase underline">
            Daily Guest Verification Register / Form C Report (Rule 14 of Foreigners Order & Local Police Directives)
          </div>
          <div className="text-xs mt-1 font-semibold">
            To: The Officer-in-Charge, <strong>{hotel.policeStationName || 'Dispur Police Station'}</strong> • Date of Report: {formatDateFull(selectedDate)}
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs border border-slate-400 mb-6">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400 text-[11px] font-bold">
              <th className="border border-slate-400 p-2">Sl</th>
              <th className="border border-slate-400 p-2">Room</th>
              <th className="border border-slate-400 p-2">Guest Full Name</th>
              <th className="border border-slate-400 p-2">Age/Sex</th>
              <th className="border border-slate-400 p-2">ID Type & Document No.</th>
              <th className="border border-slate-400 p-2">Permanent Residential Address</th>
              <th className="border border-slate-400 p-2">Nationality</th>
              <th className="border border-slate-400 p-2">Phone</th>
              <th className="border border-slate-400 p-2">Arrival</th>
              <th className="border border-slate-400 p-2">Departure</th>
              <th className="border border-slate-400 p-2">Purpose / Vehicle</th>
            </tr>
          </thead>
          <tbody>
            {filteredVerifications.map((v, i) => (
              <tr key={v.id} className="border-b border-slate-300">
                <td className="border border-slate-400 p-2 text-center">{i + 1}</td>
                <td className="border border-slate-400 p-2 font-bold">{v.roomNumber}</td>
                <td className="border border-slate-400 p-2 font-bold">{v.guestName}</td>
                <td className="border border-slate-400 p-2">{v.age || 'N/A'}/{v.gender?.[0] || 'M'}</td>
                <td className="border border-slate-400 p-2 uppercase font-mono">{v.idType} - {v.idNumber}</td>
                <td className="border border-slate-400 p-2">{v.address}</td>
                <td className="border border-slate-400 p-2">{v.nationality}</td>
                <td className="border border-slate-400 p-2 font-mono">{v.phone}</td>
                <td className="border border-slate-400 p-2">{v.checkInDate}</td>
                <td className="border border-slate-400 p-2">{v.checkOutDate}</td>
                <td className="border border-slate-400 p-2">{v.purposeOfVisit || 'Tourism'} {v.vehicleNumber ? `(${v.vehicleNumber})` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 pt-4 border-t border-slate-400 flex justify-between items-end text-xs">
          <div>
            <p className="font-bold">Official Declaration:</p>
            <p className="max-w-md text-[11px] text-slate-700 mt-1">
              I hereby declare that all guest particulars mentioned above have been verified by me against original government-issued photo identification cards presented at the time of check-in, as required under local police regulations.
            </p>
          </div>

          <div className="text-center">
            <div className="w-48 border-b border-slate-900 pb-1 mb-1"></div>
            <p className="font-bold">Authorized Signatory / Manager</p>
            <p className="text-[11px]">{hotel.name}</p>
            <p className="text-[10px] text-slate-500">Date: {selectedDate}</p>
          </div>
        </div>
      </div>

    </div>
  );
};
