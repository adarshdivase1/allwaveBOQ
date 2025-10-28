
import React, { useState } from 'react';
import type { QuestionnaireSection } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import LoaderIcon from './icons/LoaderIcon';

interface QuestionnaireProps {
  questionnaire: QuestionnaireSection[];
  onSubmit: (requirements: string) => void;
  isLoading: boolean;
  onAnswerChange: (questionId: string, value: string) => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ questionnaire, onSubmit, isLoading, onAnswerChange }) => {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    onAnswerChange(questionId, value);
  };

  const handleMultiChoiceChange = (questionId: string, value: string) => {
    const currentAnswers = (answers[questionId] as string[] | undefined) || [];
    const newAnswers = currentAnswers.includes(value)
      ? currentAnswers.filter(v => v !== value)
      : [...currentAnswers, value];
    setAnswers(prev => ({ ...prev, [questionId]: newAnswers }));
    // Note: onAnswerChange is not called for multi-choice as a single name isn't applicable
  };

  const generatePrompt = () => {
    let prompt = "Generate a Bill of Quantities for an AV installation based on the following requirements:\n";
    questionnaire.forEach(section => {
      const sectionHasAnswer = section.questions.some(q => {
        const answer = answers[q.id];
        return answer && ((typeof answer === 'string' && answer.length > 0) || (Array.isArray(answer) && answer.length > 0));
      });

      if (sectionHasAnswer) {
        prompt += `\n- Section: ${section.title}\n`;
        section.questions.forEach(q => {
          const answer = answers[q.id];
          if (answer && ( (typeof answer === 'string' && answer.length > 0) || (Array.isArray(answer) && answer.length > 0) )) {
            const selectedOptionLabels = Array.isArray(answer)
              ? answer.map(val => q.options?.find(opt => opt.value === val)?.label || val).join(', ')
              : q.options?.find(opt => opt.value === answer)?.label || answer;
            prompt += `  - ${q.text}: ${selectedOptionLabels}\n`;
          }
        });
      }
    });
    return prompt;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = generatePrompt();
    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {questionnaire.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-400 border-b border-slate-700 pb-2">{section.title}</h3>
          {section.questions.map(q => (
            <div key={q.id} className="ml-4">
              <label className="block text-md font-medium text-slate-300 mb-2">{q.text}</label>
              {q.type === 'text' && (
                <input
                  type="text"
                  onChange={e => handleAnswerChange(q.id, e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 text-slate-200 placeholder-slate-500"
                  disabled={isLoading}
                />
              )}
              {q.type === 'number' && (
                <input
                  type="number"
                  onChange={e => handleAnswerChange(q.id, e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 text-slate-200 placeholder-slate-500"
                  disabled={isLoading}
                />
              )}
              {q.type === 'select' && q.options && (
                <select
                  onChange={e => handleAnswerChange(q.id, e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 text-slate-200"
                  disabled={isLoading}
                  defaultValue=""
                >
                  <option value="" disabled>Select an option</option>
                  {q.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              )}
              {q.type === 'multiple-choice' && q.options && (
                <div className="space-y-2">
                  {q.options.map(opt => (
                    <label key={opt.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-blue-600 focus:ring-blue-500"
                        onChange={() => handleMultiChoiceChange(q.id, opt.value)}
                        disabled={isLoading}
                      />
                      <span className="text-slate-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
       <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading || Object.values(answers).every(a => (Array.isArray(a) ? a.length === 0 : !a))}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? <><LoaderIcon />Generating...</> : <><SparklesIcon />Generate BOQ from Answers</>}
          </button>
        </div>
    </form>
  );
};

export default Questionnaire;