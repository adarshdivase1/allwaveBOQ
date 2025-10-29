import React from 'react';
import { ClientDetails as ClientDetailsType } from '../types';

interface ClientDetailsProps {
  details: ClientDetailsType;
  onDetailsChange: (details: ClientDetailsType) => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ details, onDetailsChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDetailsChange({
      ...details,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-4">Project & Client Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-slate-300">
            Client Name
          </label>
          <input
            type="text"
            name="clientName"
            id="clientName"
            value={details.clientName}
            onChange={handleChange}
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-slate-300">
            Project Name
          </label>
          <input
            type="text"
            name="projectName"
            id="projectName"
            value={details.projectName}
            onChange={handleChange}
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="preparedBy" className="block text-sm font-medium text-slate-300">
            Prepared By
          </label>
          <input
            type="text"
            name="preparedBy"
            id="preparedBy"
            value={details.preparedBy}
            onChange={handleChange}
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-300">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            value={details.date}
            onChange={handleChange}
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
