
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RequirementInput from './components/RequirementInput';
import BoqDisplay from './components/BoqDisplay';
import ClientDetails from './components/ClientDetails';
import TabButton from './components/TabButton';
import Questionnaire from './components/Questionnaire';
import AuthGate from './components/AuthGate';
import { questionnaire as questionnaireData } from './data/questionnaireData';
import { generateBoqFromRequirements, refineBoq } from './services/geminiService';
import { getExchangeRates } from './utils/currency';
import type { Room, ClientDetails as ClientDetailsType, Currency } from './types';
import CurrencySelector from './components/CurrencySelector';

type InputMode = 'text' | 'questionnaire';

function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [clientDetails, setClientDetails] = useState<ClientDetailsType>({
    projectName: '',
    clientName: '',
    preparedBy: 'GenBOQ AI Assistant',
    date: new Date().toISOString().split('T')[0],
    designEngineer: '',
    accountManager: '',
    keyClientPersonnel: '',
    location: '',
    keyComments: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>({ USD: 1, EUR: 1, GBP: 1, INR: 1 });
  const [exchangeRate, setExchangeRate] = useState(1);
  
  // Fetch exchange rates on component mount
  useEffect(() => {
    const fetchRates = async () => {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
    };
    fetchRates();
  }, []);

  // Update exchange rate when currency changes
  useEffect(() => {
      setExchangeRate(exchangeRates[selectedCurrency] || 1);
  }, [selectedCurrency, exchangeRates]);

  const handleGenerateBoq = async (requirements: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newRooms = await generateBoqFromRequirements(requirements, clientDetails);
      setRooms(newRooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefineBoq = async (refinementPrompt: string) => {
    if (rooms.length === 0) {
      setError("Cannot refine an empty BOQ. Please generate a BOQ first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const refinedRooms = await refineBoq(rooms, refinementPrompt);
      setRooms(refinedRooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleQuestionnaireAnswer = (questionId: string, value: string) => {
    // This could be used to pre-fill client details in the future
    if (questionId === 'clientName') {
      setClientDetails(prev => ({...prev, clientName: value}));
    }
  }

  return (
    <AuthGate>
      <div className="bg-slate-900 text-slate-200 min-h-screen font-sans">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <ClientDetails 
              details={clientDetails}
              onDetailsChange={setClientDetails}
              disabled={isLoading}
              currency={selectedCurrency}
            />

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
              <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                  <div className="flex space-x-1">
                      <TabButton isActive={inputMode === 'text'} onClick={() => setInputMode('text')}>
                          Describe Requirements
                      </TabButton>
                      <TabButton isActive={inputMode === 'questionnaire'} onClick={() => setInputMode('questionnaire')}>
                          Guided Questionnaire
                      </TabButton>
                  </div>
                  <CurrencySelector 
                    selectedCurrency={selectedCurrency}
                    onCurrencyChange={setSelectedCurrency}
                    disabled={isLoading}
                  />
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {inputMode === 'text' ? (
                <RequirementInput onSubmit={handleGenerateBoq} isLoading={isLoading} />
              ) : (
                <Questionnaire 
                  questionnaire={questionnaireData}
                  onSubmit={handleGenerateBoq}
                  isLoading={isLoading}
                  onAnswerChange={handleQuestionnaireAnswer}
                />
              )}
            </div>

            {rooms.length > 0 && (
              <BoqDisplay
                rooms={rooms}
                clientDetails={clientDetails}
                onBoqUpdate={setRooms}
                onRefine={handleRefineBoq}
                isLoading={isLoading}
                currency={selectedCurrency}
                exchangeRate={exchangeRate}
              />
            )}
          </div>
        </main>
        <footer className="text-center py-4 text-xs text-slate-500">
          GenBOQ - AI-Powered AV Solutions. All prices and models are estimates.
        </footer>
      </div>
    </AuthGate>
  );
}

export default App;
