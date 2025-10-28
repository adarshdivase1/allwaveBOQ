import React, { useState } from 'react';
import type { Room, ClientDetails, Currency } from '../types';
import RoomCard from './RoomCard';
import RefineModal from './RefineModal';
import DownloadIcon from './icons/DownloadIcon';
import WandIcon from './icons/WandIcon';
import { exportToXlsx } from '../utils/exportToXlsx';
import { CURRENCIES } from '../types';

interface BoqDisplayProps {
  rooms: Room[];
  clientDetails: ClientDetails;
  onBoqUpdate: (updatedRooms: Room[]) => void;
  onRefine: (refinementPrompt: string) => void;
  isLoading: boolean;
  currency: Currency;
  exchangeRate: number;
}

const BoqDisplay: React.FC<BoqDisplayProps> = ({
  rooms,
  clientDetails,
  onBoqUpdate,
  onRefine,
  isLoading,
  currency,
  exchangeRate
}) => {
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  
  const handleExport = () => {
    exportToXlsx(rooms, clientDetails, currency, exchangeRate);
  };
  
  const handleRefineSubmit = (prompt: string) => {
    onRefine(prompt);
    setIsRefineModalOpen(false);
  };

  const grandTotal = rooms.reduce((total, room) => {
    const roomTotal = room.boq.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return total + roomTotal;
  }, 0) * exchangeRate;
  
  const currencyInfo = CURRENCIES.find(c => c.value === currency) || CURRENCIES[0];

  return (
    <div className="space-y-8">
      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Generated Bill of Quantities</h2>
            <p className="text-slate-400 mt-1">Review the items below. You can edit quantities, remove items, or use AI to refine the entire BOQ.</p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-x-3">
             <button
              onClick={() => setIsRefineModalOpen(true)}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              <WandIcon />
              Refine with AI
            </button>
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:opacity-50"
            >
              <DownloadIcon />
              Export to XLSX
            </button>
          </div>
        </div>
        
        <div className="text-right mb-6">
            <p className="text-slate-400">Project Grand Total (Est.)</p>
            <p className="text-3xl font-bold text-white">
                {currencyInfo.label.split(' ')[1]?.replace(/[()]/g, '') || '$'}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </div>

        <div className="space-y-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBoqUpdate={onBoqUpdate}
              allRooms={rooms}
              isLoading={isLoading}
              currency={currency}
              exchangeRate={exchangeRate}
            />
          ))}
        </div>
      </div>
      <RefineModal 
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        onSubmit={handleRefineSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default BoqDisplay;
