import React from 'react';
import type { ClientDetails as ClientDetailsType, Currency } from '../types';
import { CURRENCIES } from '../types';

interface ClientDetailsProps {
  details: ClientDetailsType;
  onDetailsChange: (details: ClientDetailsType) => void;
  disabled: boolean;
  currency: Currency;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ details, onDetailsChange, disabled, currency }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onDetailsChange({ ...details, [e.target.name]: e.target.value });
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onDetailsChange({ ...details, budget: value === '' ? undefined : Number(value) });
  };
  
  const currencySymbol = CURRENCIES.find(c => c.value === currency)?.label.split(' ')[1]?.replace(/[()]/g, '') || '$';

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Project Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-slate-300">Project Name</label>
            <input type="text" name="projectName" id="projectName" value={details.projectName} onChange={handleChange} disabled={disabled} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-slate-300">Client Name</label>
            <input type="text" name="clientName" id="clientName" value={details.clientName} onChange={handleChange} disabled={disabled} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
           <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-300">Location</label>
            <input type="text" name="location" id="location" value={details.location} onChange={handleChange} disabled={disabled} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
        </div>
        
        {/* Column 2 */}
        <div className="space-y-6">
          <div>
            <label htmlFor="designEngineer" className="block text-sm font-medium text-slate-300">Design Engineer</label>
            <input type="text" name="designEngineer" id="designEngineer" value={details.designEngineer} onChange={handleChange} disabled={disabled} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="accountManager" className="block text-sm font-medium text-slate-300">Account Manager</label>
            <input type="text" name="accountManager" id="accountManager" value={details.accountManager} onChange={handleChange} disabled={disabled} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="keyClientPersonnel" className="block text-sm font-medium text-slate-300">Key Client Personnel</label>
            <input type="text" name="keyClientPersonnel" id="keyClientPersonnel" value={details.keyClientPersonnel} onChange={handleChange} disabled={disabled} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-6">
           <div>
            <label htmlFor="budget" className="block text-sm font-medium text-slate-300">Project Budget (Optional)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <span className="text-gray-400 sm:text-sm">{currencySymbol}</span>
                </div>
                <input type="number" name="budget" id="budget" value={details.budget || ''} onChange={handleBudgetChange} disabled={disabled} className="block w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-7 pr-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g., 50000" />
            </div>
          </div>
           <div className="md:col-span-2 lg:col-span-1">
            <label htmlFor="keyComments" className="block text-sm font-medium text-slate-300">Key Comments</label>
            <textarea name="keyComments" id="keyComments" value={details.keyComments} onChange={handleChange} disabled={disabled} rows={4} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;