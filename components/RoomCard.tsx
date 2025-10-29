import React from 'react';
import { Room } from '../types';
import LoaderIcon from './icons/LoaderIcon';
import TrashIcon from './icons/TrashIcon';

interface RoomCardProps {
  room: Room;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, isActive, onSelect, onDelete, onUpdateName }) => {
  const activeClasses = 'bg-slate-700 border-blue-500';
  const inactiveClasses = 'bg-slate-800 border-slate-700 hover:bg-slate-700/50';

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateName(room.id, e.target.value);
  };
  
  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer flex justify-between items-center ${isActive ? activeClasses : inactiveClasses}`}>
      <div onClick={() => onSelect(room.id)} className="flex-grow">
        <input
            type="text"
            value={room.name}
            onChange={handleNameChange}
            onClick={(e) => e.stopPropagation()} // Prevent card selection when editing name
            className="text-lg font-semibold bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1 text-white"
        />
        {room.isLoading && <div className="text-xs text-slate-400 flex items-center mt-1"><LoaderIcon /> Generating...</div>}
        {room.error && <div className="text-xs text-red-400 mt-1">{room.error}</div>}
        {room.boq && !room.isLoading && <div className="text-xs text-green-400 mt-1">{room.boq.length} items generated.</div>}
      </div>
      <button 
        onClick={() => onDelete(room.id)} 
        className="ml-4 text-slate-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-700"
        aria-label="Delete room"
      >
        <TrashIcon />
      </button>
    </div>
  );
};

export default RoomCard;
