export interface BoqItem {
  category: string;
  itemName: string;
  brand: string;
  modelNumber: string;
  description: string;
  quantity: number;
  unitPrice: number; // Stored in USD from AI
  imageUrl: string;
  notes: string;
}

export interface Room {
  id: string;
  name: string;
  requirements: string;
  boq: BoqItem[];
}

export interface QuestionnaireOption {
  label: string;
  value: string;
}

export interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: 'text' | 'number' | 'select' | 'multiple-choice';
  options?: QuestionnaireOption[];
}

export interface QuestionnaireSection {
  title: string;
  questions: QuestionnaireQuestion[];
}

export interface ClientDetails {
  projectName: string;
  clientName: string;
  preparedBy: string;
  date: string;
  designEngineer: string;
  accountManager: string;
  keyClientPersonnel: string;
  location: string;
  keyComments: string;
  budget?: number;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';

export const CURRENCIES: { label: string; value: Currency }[] = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'INR (₹)', value: 'INR' },
];
