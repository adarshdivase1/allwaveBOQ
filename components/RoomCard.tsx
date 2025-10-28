import React, { useState } from 'react';
import type { Room, Currency } from '../types';
import ImagePreviewModal from './ImagePreviewModal';
import ImageIcon from './icons/ImageIcon';
import { CURRENCIES } from '../types';

interface RoomCardProps {
  room: Room;
  allRooms: Room[];
  onBoqUpdate: (updatedRooms: Room[]) => void;
  isLoading: boolean;
  currency: Currency;
  exchangeRate: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, allRooms, onBoqUpdate, isLoading, currency, exchangeRate }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleQuantityChange = (itemIndex: number, newQuantity: number) => {
    const updatedBoq = [...room.boq];
    updatedBoq[itemIndex] = { ...updatedBoq[itemIndex], quantity: Math.max(0, newQuantity) };
    
    const updatedRooms = allRooms.map(r => 
      r.id === room.id ? { ...r, boq: updatedBoq } : r
    );
    onBoqUpdate(updatedRooms);
  };
  
  const handleItemDelete = (itemIndex: number) => {
    const updatedBoq = room.boq.filter((_, index) => index !== itemIndex);

    const updatedRooms = allRooms.map(r => 
      r.id === room.id ? { ...r, boq: updatedBoq } : r
    );
    onBoqUpdate(updatedRooms);
  };
  
  const roomTotal = room.boq.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * exchangeRate;
  const currencyInfo = CURRENCIES.find(c => c.value === currency) || CURRENCIES[0];
  const currencySymbol = currencyInfo.label.split(' ')[1]?.replace(/[()]/g, '') || '$';

  return (
    <div className="bg-slate-900/70 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-4 bg-slate-800">
        <h3 className="text-xl font-bold text-white">{room.name}</h3>
        <p className="text-sm text-slate-400 mt-1">{room.requirements}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800/50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Item Name & Brand</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white hidden lg:table-cell">Description</th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-white">Qty</th>
              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-white hidden sm:table-cell">Unit Price</th>
              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-white">Total Price</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900">
            {room.boq.map((item, index) => (
              <tr key={`${room.id}-${item.modelNumber}-${index}`}>
                <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-white sm:w-auto sm:max-w-none sm:pl-6">
                  {item.itemName}
                  <dl className="font-normal lg:hidden">
                    <dt className="sr-only">Brand</dt>
                    <dd className="mt-1 truncate text-slate-400">{item.brand} - {item.modelNumber}</dd>
                  </dl>
                </td>
                <td className="px-3 py-4 text-sm text-slate-400 hidden lg:table-cell">{item.description}</td>
                <td className="px-3 py-4 text-sm text-slate-300 text-center">
                   <input 
                     type="number"
                     value={item.quantity}
                     onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                     className="w-16 bg-slate-800 border border-slate-700 rounded-md text-center py-1 disabled:opacity-50"
                     disabled={isLoading}
                   />
                </td>
                <td className="px-3 py-4 text-sm text-slate-300 text-right hidden sm:table-cell">
                    {currencySymbol}{(item.unitPrice * exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-4 text-sm font-medium text-white text-right">
                    {currencySymbol}{(item.quantity * item.unitPrice * exchangeRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-6">
                  <div className="flex justify-center items-center space-x-2">
                    {item.imageUrl && (
                      <button onClick={() => setImagePreviewUrl(item.imageUrl)} className="text-blue-400 hover:text-blue-300 disabled:opacity-50" disabled={isLoading} title="View Image">
                        <ImageIcon />
                      </button>
                    )}
                    <button onClick={() => handleItemDelete(index)} className="text-red-500 hover:text-red-400 disabled:opacity-50" disabled={isLoading} title="Delete Item">
                      &times;
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-800/50">
              <td colSpan={3} className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6 hidden sm:table-cell">Room Total</td>
              <td className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6 sm:hidden table-cell" colSpan={2}>Total</td>
              <td className="px-3 py-2 text-right text-sm font-semibold text-white">
                {currencySymbol}{roomTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-2 pl-3 pr-4 sm:pr-6"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      {imagePreviewUrl && (
          <ImagePreviewModal
            imageUrl={imagePreviewUrl}
            onClose={() => setImagePreviewUrl(null)}
          />
      )}
    </div>
  );
};

export default RoomCard;
