import React from 'react';
import { ProductDetails } from '../types';
import LoaderIcon from './icons/LoaderIcon';

interface WebSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  productDetails: ProductDetails | null;
  productName: string;
}

const WebSearchModal: React.FC<WebSearchModalProps> = ({ isOpen, onClose, productDetails, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl p-6 border border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Product Details: {productName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        {productDetails ? (
          <div>
            {productDetails.imageUrl && (
              <img src={productDetails.imageUrl} alt={productName} className="w-full h-64 object-contain rounded-lg mb-4 bg-slate-700" />
            )}
            <p className="text-slate-300 mb-4">{productDetails.description}</p>
            {productDetails.sources && productDetails.sources.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Sources</h3>
                <ul className="list-disc list-inside space-y-1">
                  {productDetails.sources.map((source, index) => (
                    <li key={index} className="text-sm text-slate-400">
                      {source.web && (
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 hover:underline">
                          {source.web.title || 'Web Source'}
                        </a>
                      )}
                       {source.maps && (
                        <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 hover:underline">
                          {source.maps.title || 'Map Source'}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-400 p-8 flex flex-col items-center justify-center">
            <LoaderIcon />
            <p className="mt-2">Loading details...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default WebSearchModal;
