import React, { useState } from 'react';
import SparklesIcon from './icons/SparklesIcon';
import LoaderIcon from './icons/LoaderIcon';

interface RequirementInputProps {
  onSubmit: (requirements: string) => void;
  isLoading: boolean;
}

const RequirementInput: React.FC<RequirementInputProps> = ({ onSubmit, isLoading }) => {
  const [requirements, setRequirements] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requirements.trim()) {
      onSubmit(requirements);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="requirements" className="block text-md font-medium text-slate-300 mb-2">
          Describe the Room Requirements
        </label>
        <textarea
          id="requirements"
          rows={10}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 text-slate-200 placeholder-slate-500"
          placeholder="e.g., A medium-sized boardroom for 12 people. Needs a large 4K display, wireless presentation capabilities, and ceiling microphones for video conferencing with a Crestron control system."
          disabled={isLoading}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !requirements.trim()}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <><LoaderIcon />Generating...</> : <><SparklesIcon />Generate BOQ from Text</>}
        </button>
      </div>
    </form>
  );
};

export default RequirementInput;