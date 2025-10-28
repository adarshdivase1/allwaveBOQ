
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              <span className="text-blue-400">Gen</span>BOQ
            </h1>
            <p className="ml-4 text-sm text-slate-400 hidden md:block">
              AI-Powered AV Bill of Quantities Generator
            </p>
          </div>
          {/* Future placeholder for other nav items if needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
