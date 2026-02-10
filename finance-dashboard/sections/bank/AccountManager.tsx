
import React, { useState } from 'react';
import { BankAccount } from '../../types';
import { addBankAccount, deleteBankAccount } from '../../services/mockApi';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { PlusIcon, TrashIcon } from '../../components/icons';

interface AccountManagerProps {
  accounts: BankAccount[];
  selectedAccountId: string | null;
  onSelectAccount: (id: string) => void;
  onAccountUpdate: () => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({ accounts, selectedAccountId, onSelectAccount, onAccountUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountName && newAccountNumber) {
      await addBankAccount({ accountName: newAccountName, accountNumber: newAccountNumber, isActive: true });
      setNewAccountName('');
      setNewAccountNumber('');
      setIsModalOpen(false);
      onAccountUpdate();
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account and all its transactions?')) {
      await deleteBankAccount(id);
      onAccountUpdate();
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {accounts.map(account => (
            <div key={account._id} className="flex-shrink-0 relative group">
              <button
                onClick={() => onSelectAccount(account._id)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedAccountId === account._id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {account.accountName}
              </button>
              <button onClick={() => handleDeleteAccount(account._id)} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <TrashIcon className="w-3 h-3"/>
              </button>
            </div>
          ))}
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="secondary">
          <PlusIcon className="mr-2" /> Add Account
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Bank Account">
        <form onSubmit={handleAddAccount} className="space-y-4">
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-300">Account Name</label>
            <input type="text" id="accountName" value={newAccountName} onChange={e => setNewAccountName(e.target.value)} required
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
          </div>
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300">Account Number (Last 4 digits)</label>
            <input type="text" id="accountNumber" value={newAccountNumber} onChange={e => setNewAccountNumber(e.target.value)} required
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white p-2" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccountManager;
