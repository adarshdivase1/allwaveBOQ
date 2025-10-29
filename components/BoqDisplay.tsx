import React, { useState, useEffect, useMemo } from 'react';
import { Boq, BoqItem, Currency, CURRENCIES } from '../types';
import { getExchangeRates } from '../utils/currency';

import CurrencySelector from './CurrencySelector';
import RefineModal from './RefineModal';
import WebSearchModal from './WebSearchModal';
import ImagePreviewModal from './ImagePreviewModal';

import DownloadIcon from './icons/DownloadIcon';
import WandIcon from './icons/WandIcon';
import ImageIcon from './icons/ImageIcon';
import SearchIcon from './icons/SearchIcon';


interface BoqDisplayProps {
  boq: Boq;
  onRefine: (refinementPrompt: string) => void;
  isRefining: boolean;
  onExport: () => void;
}

const BoqDisplay: React.FC<BoqDisplayProps> = ({ boq, onRefine, isRefining, onExport }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number> | null>(null);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [isWebSearchModalOpen, setIsWebSearchModalOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<BoqItem | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      const rates = await getExchangeRates();
      setExchangeRates(rates);
    };
    fetchRates();
  }, []);

  const currencySymbol = useMemo(() => {
    return CURRENCIES.find(c => c.value === selectedCurrency)?.symbol || '$';
  }, [selectedCurrency]);

  const convertedBoq = useMemo(() => {
    if (!exchangeRates || !boq) return [];
    const rate = exchangeRates[selectedCurrency] || 1;
    return boq.map(item => ({
      ...item,
      unitPrice: item.unitPrice * rate,
      totalPrice: item.totalPrice * rate,
    }));
  }, [boq, selectedCurrency, exchangeRates]);

  const grandTotal = useMemo(() => {
    return convertedBoq.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [convertedBoq]);
  
  const handleAddProductFromSearch = (productName: string) => {
    const prompt = `Add one unit of a product matching "${productName}" to the BOQ. Place it in the most relevant category or a 'Miscellaneous' category if unsure. Provide a realistic brand, model, and price. Ensure all prices and the grand total are updated.`;
    onRefine(prompt);
    setIsWebSearchModalOpen(false); // Close the modal after initiating the action
  };

  const handleFetchDetails = (item: BoqItem) => {
    setSelectedProduct(item);
    setIsWebSearchModalOpen(true);
  };
  
  const handleOpenWebSearch = () => {
    setSelectedProduct(null); // No product is pre-selected
    setIsWebSearchModalOpen(true);
  };

  const handleImageClick = (item: BoqItem) => {
    setSelectedProduct(item);
    setIsImagePreviewOpen(true);
  };
  
  if (!boq || boq.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
          <h3 className="text-lg font-semibold">No Bill of Quantities to display.</h3>
          <p>Please complete the questionnaire to generate a BOQ.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold text-white">Generated Bill of Quantities</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <CurrencySelector selectedCurrency={selectedCurrency} onCurrencyChange={setSelectedCurrency} disabled={!exchangeRates} />
            <button
                onClick={handleOpenWebSearch}
                className="inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
            >
                <SearchIcon className="h-5 w-5 mr-2" /> Web Search
            </button>
            <button
                onClick={() => setIsRefineModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
            >
                <WandIcon /> Refine with AI
            </button>
            <button
                onClick={onExport}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500"
            >
                <DownloadIcon /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900">
              <tr>
                {['Category', 'Item Description', 'Brand', 'Model', 'Qty', 'Unit Price', 'Total Price', 'Actions'].map(header => (
                  <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {convertedBoq.map((item, index) => (
                <tr key={index} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.category}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-slate-300">{item.itemDescription}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 text-center">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 text-right">{currencySymbol}{item.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 text-right font-semibold">{currencySymbol}{item.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 space-x-2 flex items-center">
                    <button onClick={() => handleImageClick(item)} className="p-1 hover:text-blue-400" title="Preview Image"><ImageIcon /></button>
                    <button onClick={() => handleFetchDetails(item)} className="p-1 hover:text-green-400" title="Fetch Details"><SearchIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900">
                <tr>
                    <td colSpan={6} className="px-6 py-3 text-right text-sm font-bold text-white uppercase">Grand Total</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-white">{currencySymbol}{grandTotal.toFixed(2)}</td>
                    <td></td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <RefineModal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        onSubmit={(prompt) => {
          onRefine(prompt);
          setIsRefineModalOpen(false);
        }}
        isLoading={isRefining}
      />
      <WebSearchModal
        isOpen={isWebSearchModalOpen}
        onClose={() => setIsWebSearchModalOpen(false)}
        initialProductName={selectedProduct ? `${selectedProduct.brand} ${selectedProduct.model}` : ''}
        onAdd={handleAddProductFromSearch}
      />
       {isImagePreviewOpen && selectedProduct && (
        <ImagePreviewModal
          imageUrl={`https://source.unsplash.com/800x600/?${encodeURIComponent(selectedProduct.itemDescription)}`}
          onClose={() => setIsImagePreviewOpen(false)}
        />
      )}
    </>
  );
};

export default BoqDisplay;