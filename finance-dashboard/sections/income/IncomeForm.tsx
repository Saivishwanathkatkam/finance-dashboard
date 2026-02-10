
import React, { useState, useEffect } from 'react';
import { IncomeRecord } from '../../types';
import Button from '../../components/Button';

interface IncomeFormProps {
  // FIX: Update onSubmit prop to expect data without userId, which matches what the form can provide.
  onSubmit: (data: Omit<IncomeRecord, '_id' | 'userId'> | Omit<IncomeRecord, 'userId'>) => void;
  record: IncomeRecord | null;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onSubmit, record }) => {
  const [formData, setFormData] = useState({
    date: '',
    source: '',
    category: '',
    amount: '',
    notes: ''
  });

  useEffect(() => {
    if (record) {
      setFormData({
        date: new Date(record.date).toISOString().split('T')[0],
        source: record.source,
        category: record.category,
        amount: String(record.amount),
        notes: record.notes || ''
      });
    } else {
        setFormData({ date: new Date().toISOString().split('T')[0], source: '', category: '', amount: '', notes: '' });
    }
  }, [record]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      date: new Date(formData.date).toISOString(),
      source: formData.source,
      category: formData.category,
      amount: parseFloat(formData.amount),
      notes: formData.notes,
    };
    if (record) {
      // FIX: The submitted object for an update should not include userId.
      onSubmit({ ...submissionData, _id: record._id });
    } else {
      // FIX: The submitted object for a new record should not include userId.
      onSubmit(submissionData);
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
        <label htmlFor="source" className="block text-sm font-medium text-gray-300">Source</label>
        <input type="text" id="source" name="source" value={formData.source} onChange={handleChange} required
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
      </div>
       <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
        <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
        <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} required
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
      </div>
       <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300">Notes</label>
        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3}
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
      </div>
      <div className="flex justify-end">
        <Button type="submit">
          {record ? 'Update Record' : 'Add Record'}
        </Button>
      </div>
    </form>
  );
};

export default IncomeForm;