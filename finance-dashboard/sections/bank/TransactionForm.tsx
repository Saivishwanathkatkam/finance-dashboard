
import React, { useState, useEffect } from 'react';
import { BankTransaction } from '../../types';
import Button from '../../components/Button';

interface TransactionFormProps {
  // FIX: Update onSubmit prop to expect data without userId and accountId, matching what the form provides.
  onSubmit: (data: Omit<BankTransaction, 'userId' | 'accountId'> | Omit<BankTransaction, '_id' | 'userId' | 'accountId'>) => void;
  transaction: BankTransaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, transaction }) => {
  const [formData, setFormData] = useState({
    date: '',
    details: '',
    debit: '',
    credit: '',
    balance: ''
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: new Date(transaction.date).toISOString().split('T')[0],
        details: transaction.details,
        debit: String(transaction.debit || ''),
        credit: String(transaction.credit || ''),
        balance: String(transaction.balance)
      });
    } else {
      setFormData({ date: new Date().toISOString().split('T')[0], details: '', debit: '', credit: '', balance: '' });
    }
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      date: new Date(formData.date).toISOString(),
      details: formData.details,
      debit: parseFloat(formData.debit) || 0,
      credit: parseFloat(formData.credit) || 0,
      balance: parseFloat(formData.balance),
    };
    if (transaction) {
      // FIX: The submitted object for an update should not include userId or accountId.
      onSubmit({ ...submissionData, _id: transaction._id, source: transaction.source });
    } else {
      // FIX: The submitted object for a new transaction should not include userId or accountId.
      onSubmit({ ...submissionData, source: 'MANUAL' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date</label>
        <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
      </div>
      <div>
        <label htmlFor="details" className="block text-sm font-medium text-gray-300">Details</label>
        <input type="text" id="details" name="details" value={formData.details} onChange={handleChange} required
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="debit" className="block text-sm font-medium text-gray-300">Debit</label>
          <input type="number" id="debit" name="debit" value={formData.debit} onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
        </div>
        <div>
          <label htmlFor="credit" className="block text-sm font-medium text-gray-300">Credit</label>
          <input type="number" id="credit" name="credit" value={formData.credit} onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
        </div>
      </div>
      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-gray-300">Balance</label>
        <input type="number" id="balance" name="balance" value={formData.balance} onChange={handleChange} required
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
      </div>
      <div className="flex justify-end">
        <Button type="submit">
          {transaction ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;