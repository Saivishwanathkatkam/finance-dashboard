
import React from 'react';
import { SummaryCardData } from '../types';
import { ChevronUp, ChevronDown } from './icons';

interface CardProps {
  data: SummaryCardData;
}

const Card: React.FC<CardProps> = ({ data }) => {
  const { title, value, change, changeType } = data;
  const isIncrease = changeType === 'increase';

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="text-3xl font-semibold text-white mt-2">{value}</p>
      {change && (
        <div className="flex items-center mt-2">
          <span className={`flex items-center text-sm font-medium ${isIncrease ? 'text-green-400' : 'text-red-400'}`}>
            {isIncrease ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            {change}
          </span>
          <span className="text-xs text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default Card;
