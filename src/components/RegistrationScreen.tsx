import React, { useState } from 'react';
import {
  HotelProfile,
  Room,
  FirstTimeRegistrationPayload
} from '../types';
import {
  Building2,
  User,
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  BedDouble,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Hotel,
  Home,
  Waves,
  Briefcase,
  Image as ImageIcon,
  Upload,
  Check,
  Plus,
  Trash2,
  Lock,
  Camera,
  Layers
} from 'lucide-react';
import { EntryFeePaymentModal } from './EntryFeePaymentModal';
import { SAMPLE_HOTEL_IMAGES, KAZIRANGA_HOTEL_IMAGES } from '../utils/storage';

interface RegistrationScreenProps {
  onCompleteRegistration: (
    hotelData: HotelProfile,
    roomsData: Room[]
  ) => void;
  onCancel?: () => void;
}

const AVAILABLE_AMENITIES = [
  'AC (Air Conditioning)',
  'Free High-speed Wi-Fi',
  'Free Parking',
  'Geyser / 24x7 Hot Water',
  'Smart TV / Cable',
  'Private Balcony',
  'Power Backup / Inverter',
  'In-house Restaurant / Dining',
  '24/7 Room Service',
  'Attached Western Bathroom',
  'Work Desk & Chair',
  'Electric Tea/Coffee Maker'
];

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onCompleteRegistration,
  onCancel
}) => {
  // Form States
  const [hotelName, setHotelName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [propertyType, setPropertyType] = useState<'Hotel' | 'Homestay' | 'Resort' | 'Guest House' | 'Lodge'>('Homestay');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Guwahati');
  const [state, setState] = useState('Assam');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('781001');
  const [policeStationName, setPoliceStationName] = useState('Dispur Police Station, Guwahati');
  const [policeStationWhatsApp, setPoliceStationWhatsApp] = useState('+91 94350 12345');
  const [policeStationIncharge, setPoliceStationIncharge] = useState('Inspector B. Borah, OC Dispur');
  const [hotelLicenseNumber, setHotelLicenseNumber] = useState('ASM/HTL/2026-01');

  // 4 Property/Room Images
  const [images, setImages] = useState<string[]>([
    SAMPLE_HOTEL_IMAGES[0],
    SAMPLE_HOTEL_IMAGES[1],
    SAMPLE_HOTEL_IMAGES[2],
    SAMPLE_HOTEL_IMAGES[3]
  ]);

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'AC (Air Conditioning)',
    'Free High-speed Wi-Fi',
    'Free Parking',
    'Geyser / 24x7 Hot Water',
    'Smart TV / Cable',
    'Private Balcony'
  ]);

  // Rooms & Rates
  const [roomCount, setRoomCount] = useState<number>(8);
  const [basePrice, setBasePrice] = useState<number>(1800);

  // ₹99 Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleImageChange = (index: number, newUrl: string) => {
    const updated = [...images];
    updated[index] = newUrl;
    setImages(updated);
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleImageChange(index, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickFillSample = () => {
    setHotelName('Brahmaputra Heritage Homestay & Resort');
    setOwnerName('Dipankar Saikia');
    setPropertyType('Homestay');
    setDescription('Cozy heritage homestay on the scenic banks of Brahmaputra with river-view balconies, authentic home-cooked Assamese meals, and 24x7 hot water.');
    setPhone('9864012345');
    setWhatsappNumber('9864012345');
    setEmail('stay@brahmaputraheritage.in');
    setCity('Guwahati');
    setState('Assam');
    setAddress('MG Road, Near Uzan Bazar Ghat');
    setPincode('781001');
    setPoliceStationName('Panbazar Police Station, Guwahati');
    setPoliceStationWhatsApp('+91 94350 98765');
    setPoliceStationIncharge('OC Panbazar');
    setHotelLicenseNumber('ASM/KAM/HTL/2026-442');
    setRoomCount(8);
    setBasePrice(2000);
    setImages(SAMPLE_HOTEL_IMAGES);
    setErrorMsg(null);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hotelName.trim()) {
      setErrorMsg('অনুগ্ৰহ কৰি হোটেল বা হোমষ্টে’ৰ নাম লিখক (Hotel Name is required)');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('অনুগ্ৰহ কৰি মোবাইল নম্বৰ লিখক (Mobile Phone is required)');
      return;
    }
    if (images.length < 1 || !images[0]) {
      setErrorMsg('অনুগ্ৰহ কৰি অতি কমেও এটা ফটো আপলোড কৰক (Upload at least 1 image)');
      return;
    }

    setErrorMsg(null);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (txnId: string) => {
    setShowPaymentModal(false);

    const effectiveWhatsApp = sameAsPhone ? phone : (whatsappNumber || phone);
    const hotelId = `htl-${Date.now().toString().slice(-6)}`;

    // Prepare client-side hotel object with 1 Month Free Subscription & Paid Entry Fee
    const newHotelProfile: HotelProfile = {
      id: hotelId,
      name: hotelName.trim(),
      tagline: `${propertyType} • Hospitality & Verified Safe Stay`,
      description: description.trim() || `${propertyType} in ${city}, ${state} offering comfortable stays with modern facilities.`,
      ownerName: ownerName.trim() || 'Hotel Owner',
      phone: phone.trim(),
      whatsappNumber: effectiveWhatsApp.trim(),
      email: email.trim() || 'info@hotel.com',
      address: address.trim() || `${city}, ${state}`,
      city: city.trim() || 'Guwahati',
      state: state.trim() || 'Assam',
      pincode: pincode.trim(),
      currency: '₹',
      upiId: `${phone.trim()}@upi`,
      checkInStandardTime: '12:00 PM',
      checkOutStandardTime: '11:00 AM',
      images: images.slice(0, 4),
      amenities: selectedAmenities,
      entryFeePaid: true,
      entryFeeAmount: 99,
      entryFeeTxnId: txnId,
      entryFeePaidAt: new Date().toISOString().split('T')[0],
      subscriptionPlan: 'trial_free_month',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      trialDaysLeft: 30, // 1st Month Free
      policeStationName: policeStationName.trim(),
      policeStationWhatsApp: policeStationWhatsApp.trim(),
      policeStationIncharge,
      hotelLicenseNumber,
      isRegistered: true,
      createdAt: new Date().toISOString()
    };

    // Generate initial rooms
    const generatedRooms: Room[] = [];
    const count = Math.max(1, Math.min(Number(roomCount) || 8, 30));
    const price = Number(basePrice) || 1800;

    for (let i = 1; i <= count; i++) {
      const roomNumber = `${100 + i}`;
      const isDeluxe = i % 2 === 0;
      generatedRooms.push({
        id: `room-${hotelId}-${roomNumber}`,
        hotelId,
        roomNumber,
        type: isDeluxe ? 'Deluxe AC' : 'Standard',
        floor: 1,
        basePrice: isDeluxe ? Math.round(price * 1.3) : price,
        capacity: 2,
        amenities: selectedAmenities.slice(0, 4),
        isMaintenance: false
      });
    }

    onCompleteRegistration(newHotelProfile, generatedRooms);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071E3D] via-[#0B2545] to-[#0A192F] text-white flex flex-col justify-center items-center px-3 py-6 sm:p-8 font-sans">
      
      {/* Container Card */}
      <div className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0B2545] via-[#133E6D] to-[#08203E] text-white p-5 sm:p-7 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-teal-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                মাল্টি-ভেণ্ডৰ পঞ্জীয়ন পেনেল (Multi-Vendor Hotel Onboarding)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickFillSample}
                  className="text-[11px] text-teal-300 hover:text-white font-bold underline cursor-pointer bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 transition-colors"
                  title="নমুনা তথ্যৰে ফৰ্ম পূৰণ কৰক"
                >
                  ⚡ নমুনা তথ্য (Quick Fill Demo)
                </button>

                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-white/10"
                  >
                    বাতিল (Close)
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-teal-400 shrink-0" />
              <span>নিয়ন্ত্ৰিত হোটেল আৰু হোমষ্টে’ পঞ্জীয়ন</span>
            </h1>

            {/* Special Pricing & Trial Badge */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-teal-500/20 border border-teal-400/40 rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                  ₹৯৯
                </div>
                <div>
                  <div className="font-extrabold text-teal-200 text-xs">প্ৰৱেশ মাচুল (Entry Fee): ₹৯৯</div>
                  <div className="text-[10px] text-slate-300">অ-ঘূৰাইযোগ্য নিৰাপদ পঞ্জীয়ন মাচুল</div>
                </div>
              </div>

              <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                  FREE
                </div>
                <div>
                  <div className="font-extrabold text-emerald-200 text-xs">১ম মাহ সম্পূৰ্ণ বিনামূলীয়া (30 Days Free)</div>
                  <div className="text-[10px] text-slate-300">প্ৰথম ৩০ দিনৰ পিছতহে চাবস্ক্ৰিপচন আৰম্ভ হ'ব</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleProceedToPayment} className="p-4 sm:p-7 space-y-6">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Property Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>১. প্ৰতিষ্ঠান আৰু মালিকৰ তথ্য (Property & Owner Details)</span>
            </h3>

            {/* Property Type Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                প্ৰতিষ্ঠানৰ ধৰণ (Property Type) *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'Homestay', label: 'হোমষ্টে’', icon: Home },
                  { id: 'Hotel', label: 'হোটেল', icon: Hotel },
                  { id: 'Resort', label: 'ৰিজৰ্ট', icon: Waves },
                  { id: 'Guest House', label: 'গেষ্ট হাউচ', icon: Building2 },
                  { id: 'Lodge', label: 'লজ', icon: Briefcase }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = propertyType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPropertyType(item.id as any)}
                      className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#0B2545] text-white border-[#0B2545] font-black shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                      <span className="text-[11px] leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hotel Name & Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  হোটেল বা হোমষ্টে’ৰ নাম (Hotel Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brahmaputra Heritage Homestay"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  মালিকৰ নাম (Owner Name) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dipankar Saikia"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                বিৱৰণ (Property Description)
              </label>
              <textarea
                rows={2}
                placeholder="হোটেলৰ বিশেষত্ব, পৰিবেশ আৰু অৱস্থানৰ চমু বৰ্ণনা..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  যোগাযোগৰ ফোন নম্বৰ (Mobile Phone) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Mobile Number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (sameAsPhone) setWhatsappNumber(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    হোৱাটছএপ নম্বৰ (WhatsApp No) *
                  </label>
                  <label className="text-[10px] text-teal-700 font-semibold flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        setSameAsPhone(e.target.checked);
                        if (e.target.checked) setWhatsappNumber(phone);
                      }}
                      className="rounded text-teal-600"
                    />
                    <span>ফোনৰ সৈতে একে</span>
                  </label>
                </div>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    disabled={sameAsPhone}
                    placeholder="WhatsApp Mobile"
                    value={sameAsPhone ? phone : whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden ${
                      sameAsPhone ? 'bg-slate-100 border-slate-200 text-slate-500' : 'border-slate-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Location & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ঠিকনা (Address / Landmark)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. MG Road, Near Uzan Bazar"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  চহৰ আৰু ৰাজ্য (City, State)
                </label>
                <input
                  type="text"
                  placeholder="Guwahati, Assam"
                  value={`${city}, ${state}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setCity(parts[0]?.trim() || '');
                    if (parts[1]) setState(parts[1]?.trim());
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: 4 High-Quality Property Images Upload */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>২. হোটেল/ৰূমৰ ৪খন ফটো (4 Property & Room Images) *</span>
              </h3>
              <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                গ্ৰাহক পোৰ্টেলত প্ৰদৰ্শিত হ'ব
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((idx) => {
                const img = images[idx];
                const labels = ['১. মূল কোঠা (Main Room)', '২. বিছনা/সজ্জা (Bedroom)', '৩. বেলকনি/দৃশ্য (Balcony)', '৪. বাথৰূম (Bathroom)'];
                return (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-600 block truncate">
                      {labels[idx]}
                    </span>

                    <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-xs">
                      {img ? (
                        <img
                          src={img}
                          alt={`Hotel ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                          <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                          <span className="text-[10px]">ফটো নাই</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        <label className="text-[10px] font-bold bg-white text-slate-900 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-100 flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>আপলোড</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(idx, e)}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Image URL..."
                        value={img || ''}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        className="w-full text-[10px] font-mono px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Preset Selector */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-[10px] font-bold text-slate-500">নমুনা ফটো বাছনি:</span>
              <button
                type="button"
                onClick={() => setImages(SAMPLE_HOTEL_IMAGES)}
                className="text-[10px] font-bold text-teal-700 hover:underline bg-teal-50 px-2 py-0.5 rounded cursor-pointer"
              >
                হোটেল ডিলাক্স চেট
              </button>
              <button
                type="button"
                onClick={() => setImages(KAZIRANGA_HOTEL_IMAGES)}
                className="text-[10px] font-bold text-teal-700 hover:underline bg-teal-50 px-2 py-0.5 rounded cursor-pointer"
              >
                ৰিজৰ্ট কটেজ চেট
              </button>
            </div>
          </div>

          {/* Section 3: Facilities & Amenities Checkboxes */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>৩. হোটেলৰ সুবিধাসমূহ (Amenities & Facilities)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-teal-50/80 border-teal-500 text-teal-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] leading-tight">{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Initial Room Setup & Tariff */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5 pb-1 border-b border-teal-100">
              <BedDouble className="w-3.5 h-3.5 text-teal-600" />
              <span>৪. কোঠাৰ তালিকা আৰু ভাড়া (Rooms & Pricing)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  মুঠ কোঠাৰ সংখ্যা (Total Rooms)
                </label>
                <select
                  value={roomCount}
                  onChange={(e) => setRoomCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-black text-xs"
                >
                  <option value={4}>৪ টা কোঠা (Rooms 101 to 104)</option>
                  <option value={6}>৬ টা কোঠা (Rooms 101 to 106)</option>
                  <option value={8}>৮ টা কোঠা (Rooms 101 to 108)</option>
                  <option value={10}>১০ টা কোঠা (Rooms 101 to 110)</option>
                  <option value={15}>১৫ টা কোঠা (Rooms 101 to 115)</option>
                  <option value={20}>২০ টা কোঠা (Rooms 101 to 120)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  প্ৰতি নিশাৰ আৰম্ভণি ভাড়া (Base Rate / Night)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-black text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fee Notice & Action Button */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">
                  ₹৯৯ প্ৰৱেশ মাচুল পৰিশোধৰ পিছতহে হোটেল তালিকাভুক্ত হ'ব:
                </span>
                <span className="text-[11px] text-amber-800">
                  পৰৱৰ্তী স্তৰত নিৰাপদ UPI/কাৰ্ডৰ জৰিয়তে ₹৯৯ পৰিশোধ কৰক। লগে লগে আপোনাৰ একাউণ্ট সক্ৰিয় হ'ব আৰু প্ৰথম ১ মাহ (৩০ দিন) কোনো অতিৰিক্ত মাহেকীয়া মাচুল দিব নালাগে।
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 text-center sm:text-left">
                🔒 ৫% প্লেটফৰ্ম কমিছন আৰু ৯৫% হোটেল পেমেন্ট সুৰক্ষা সমৰ্থিত।
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>₹৯৯ মাচুল পৰিশোধলৈ আগবাঢ়ক (Proceed to Pay ₹99)</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* ₹99 Secure Payment Gateway Modal */}
      {showPaymentModal && (
        <EntryFeePaymentModal
          hotelName={hotelName}
          ownerName={ownerName}
          phone={phone}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}

    </div>
  );
};
