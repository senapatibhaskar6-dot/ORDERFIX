import React, { useState } from 'react';
import { Room } from '../types';
import { X, Plus, Wrench, Trash2, CheckCircle2, BedDouble } from 'lucide-react';

interface RoomManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  onUpdateRooms: (rooms: Room[]) => void;
}

export const RoomManagerModal: React.FC<RoomManagerModalProps> = ({
  isOpen,
  onClose,
  rooms,
  onUpdateRooms
}) => {
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState<Room['type']>('Deluxe AC');
  const [newFloor, setNewFloor] = useState(1);
  const [newPrice, setNewPrice] = useState(2000);
  const [newCapacity, setNewCapacity] = useState(2);

  if (!isOpen) return null;

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;

    if (rooms.some((r) => r.roomNumber === newRoomNumber.trim())) {
      alert('Room number already exists!');
      return;
    }

    const newRoom: Room = {
      id: newRoomNumber.trim(),
      roomNumber: newRoomNumber.trim(),
      type: newRoomType,
      floor: Number(newFloor) || 1,
      basePrice: Number(newPrice) || 1500,
      capacity: Number(newCapacity) || 2,
      amenities: ['AC', 'Free Wi-Fi', 'Attached Bath']
    };

    onUpdateRooms([...rooms, newRoom]);
    setNewRoomNumber('');
  };

  const handleToggleMaintenance = (roomId: string) => {
    const updated = rooms.map((r) =>
      r.id === roomId ? { ...r, isMaintenance: !r.isMaintenance } : r
    );
    onUpdateRooms(updated);
  };

  const handleUpdatePrice = (roomId: string, price: number) => {
    const updated = rooms.map((r) =>
      r.id === roomId ? { ...r, basePrice: price } : r
    );
    onUpdateRooms(updated);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm('Delete this room from inventory?')) {
      onUpdateRooms(rooms.filter((r) => r.id !== roomId));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B2545] to-[#123661] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <BedDouble className="w-4 h-4 text-[#00E5A3]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Room & Inventory Manager</h3>
              <p className="text-xs text-slate-300">
                Configure room numbers, categories, and nightly tariff
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Add Room Quick Form */}
          <form onSubmit={handleAddRoom} className="p-3.5 sm:p-4 bg-teal-50/60 border-2 border-teal-300 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-teal-950 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-teal-700" />
                <span>নতুন কোঠা যোগ কৰক (+ Add New Room)</span>
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ৰূম নম্বৰ (Room #)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 109"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  প্ৰকাৰ (Type)
                </label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as Room['type'])}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white font-medium"
                >
                  <option value="Deluxe AC">Deluxe AC</option>
                  <option value="Standard">Standard Non-AC</option>
                  <option value="Premium Sea View">Sea View</option>
                  <option value="Family Suite">Family Suite</option>
                  <option value="Cottage">Cottage</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  মহলা (Floor)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={10}
                  value={newFloor}
                  onChange={(e) => setNewFloor(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ভাৰা (Tariff ₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={500}
                  step={100}
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-900 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-700/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>এই কোঠাটো যোগ কৰক (+ Add This Room)</span>
            </button>
          </form>

          {/* Rooms List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Current Property Rooms ({rooms.length})
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {rooms.map((r) => (
                <div
                  key={r.id}
                  className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-slate-100 font-black text-sm flex items-center justify-center text-slate-800 border border-slate-200">
                      {r.roomNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">
                          {r.name || `Room ${r.roomNumber}`}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                          {r.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Floor {r.floor} • Max {r.capacity} Guests
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">
                        ₹{r.basePrice}
                      </span>
                      <span className="text-[10px] text-slate-500 block">/night</span>
                    </div>

                    {/* Maintenance toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleMaintenance(r.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        r.isMaintenance
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={r.isMaintenance ? 'Under maintenance' : 'Mark for maintenance'}
                    >
                      <Wrench className="w-4 h-4" />
                    </button>

                    {/* Delete room */}
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(r.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
