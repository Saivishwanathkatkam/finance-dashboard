

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { BankAccount, BankTransaction, SummaryCardData } from '../../types';
import { getBankAccounts, getBankTransactions, addBankTransaction, updateBankTransaction, deleteBankTransaction, uploadBankTransactionsCSV, deleteBulkBankTransactions } from '../../services/mockApi';
import AccountManager from './AccountManager';
import Button from '../../components/Button';
import { PlusIcon, UploadIcon, EditIcon, TrashIcon, UserIcon } from '../../components/icons';
import Modal from '../../components/Modal';
import TransactionForm from './TransactionForm';
import Spinner from '../../components/Spinner';
import Card from '../../components/Card';

const BankDashboard: React.FC = () => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<BankTransaction | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const fetchAccounts = useCallback(async () => {
        setLoadingAccounts(true);
        const accs = await getBankAccounts();
        setAccounts(accs);
        if (accs.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accs[0]._id);
        }
        setLoadingAccounts(false);
    }, [selectedAccountId]);
    
    const fetchTransactions = useCallback(async () => {
        if (!selectedAccountId) {
            setTransactions([]);
            return;
        };
        setLoadingTransactions(true);
        const trans = await getBankTransactions(selectedAccountId);
        setTransactions(trans);
        setLoadingTransactions(false);
    }, [selectedAccountId]);

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const searchMatch = t.details.toLowerCase().includes(searchTerm.toLowerCase());
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            const endDate = dateRange.end ? new Date(dateRange.end) : null;
            const transactionDate = new Date(t.date);

            if (startDate) startDate.setHours(0, 0, 0, 0);
            if (endDate) endDate.setHours(23, 59, 59, 999);

            const dateMatch = (!startDate || transactionDate >= startDate) && (!endDate || transactionDate <= endDate);
            return searchMatch && dateMatch;
        });
    }, [transactions, searchTerm, dateRange]);

    const { summaryCards, monthlySpendingData, debitCreditData } = useMemo(() => {
        const totalDebits = filteredTransactions.reduce((acc, t) => acc + t.debit, 0);
        const totalCredits = filteredTransactions.reduce((acc, t) => acc + t.credit, 0);
        const netBalance = totalCredits - totalDebits;

        const monthlySpending: { [key: string]: number } = {};
        filteredTransactions.forEach(t => {
            if (t.debit > 0) {
                const month = new Date(t.date).toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
                monthlySpending[month] = (monthlySpending[month] || 0) + t.debit;
            }
        });

        return {
            summaryCards: [
                { title: 'Total Debits', value: `₹${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                { title: 'Total Credits', value: `₹${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
                { title: 'Net Balance', value: `${netBalance < 0 ? '-' : ''}₹${Math.abs(netBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            ],
            monthlySpendingData: Object.entries(monthlySpending).map(([name, spending]) => ({ name, spending })).reverse(),
            debitCreditData: [{ name: 'Comparison', debit: totalDebits, credit: totalCredits }],
        };
    }, [filteredTransactions]);

    const handleSelect = (id: string) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id);
        } else {
            newSelectedIds.add(id);
        }
        setSelectedIds(newSelectedIds);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredTransactions.map(t => t._id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} transactions?`)) {
            await deleteBulkBankTransactions(Array.from(selectedIds));
            setSelectedIds(new Set());
            fetchTransactions();
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedAccountId) {
            setLoadingTransactions(true);
            const reader = new FileReader();
            reader.onload = async (e) => {
                const csv = e.target?.result as string;
                if (csv) {
                    try {
                        await uploadBankTransactionsCSV(csv, selectedAccountId);
                        await fetchTransactions();
                    } catch (error) {
                        console.error("Error uploading CSV:", error);
                        alert("Failed to upload CSV file.");
                        setLoadingTransactions(false);
                    }
                }
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                alert("Failed to read file.");
                setLoadingTransactions(false);
            };
            reader.readAsText(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleAdd = () => { setEditingTransaction(null); setIsModalOpen(true); };
    const handleEdit = (transaction: BankTransaction) => { setEditingTransaction(transaction); setIsModalOpen(true); };
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            await deleteBankTransaction(id);
            fetchTransactions();
        }
    };
    const handleFormSubmit = async (transactionData: Omit<BankTransaction, 'userId' | 'accountId'> | Omit<BankTransaction, '_id' | 'userId' | 'accountId'>) => {
        if (!selectedAccountId) return;
        const dataToSubmit = { ...transactionData, accountId: selectedAccountId };
        if ('_id' in dataToSubmit) {
            await updateBankTransaction(dataToSubmit);
        } else {
            await addBankTransaction(dataToSubmit);
        }
        fetchTransactions();
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    if (loadingAccounts) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div className="space-y-6">
            <AccountManager accounts={accounts} selectedAccountId={selectedAccountId} onSelectAccount={setSelectedAccountId} onAccountUpdate={fetchAccounts} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryCards.map((data, index) => <Card key={index} data={data} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 h-80">
                    <h3 className="text-lg font-semibold text-white mb-4">Monthly Spending</h3>
                    <ResponsiveContainer width="100%" height="90%"><AreaChart data={monthlySpendingData}><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="name" stroke="#9ca3af" /><YAxis stroke="#9ca3af" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Area type="monotone" dataKey="spending" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} /></AreaChart></ResponsiveContainer>
                </div>
                 <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 h-80">
                    <h3 className="text-lg font-semibold text-white mb-4">Debits vs. Credits</h3>
                    <ResponsiveContainer width="100%" height="90%"><BarChart data={debitCreditData}><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="name" stroke="#9ca3af" /><YAxis stroke="#9ca3af" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Legend /><Bar dataKey="debit" fill="#ef4444" /><Bar dataKey="credit" fill="#22c55e" /></BarChart></ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                        <input type="search" placeholder="Search details..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]" />
                        <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
                        <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div className="flex items-center gap-2">
                        {selectedIds.size > 0 && <Button variant="danger" onClick={handleBulkDelete}>Delete ({selectedIds.size})</Button>}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={!selectedAccountId}><UploadIcon className="mr-2" /> Upload CSV</Button>
                        <Button onClick={handleAdd} disabled={!selectedAccountId}><PlusIcon className="mr-2" /> Add</Button>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                {loadingTransactions ? (<div className="flex justify-center items-center h-64"><Spinner /></div>) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size > 0 && selectedIds.size === filteredTransactions.length} className="bg-gray-600 border-gray-500 rounded" /></th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Details</th>
                                <th scope="col" className="px-6 py-3 text-right">Debit</th>
                                <th scope="col" className="px-6 py-3 text-right">Credit</th>
                                <th scope="col" className="px-6 py-3 text-right">Balance</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((t) => (
                                <tr key={t._id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.has(t._id)} onChange={() => handleSelect(t._id)} className="bg-gray-600 border-gray-500 rounded" /></td>
                                    <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">{t.details} {t.source === 'MANUAL' && <span title="Manual Entry"><UserIcon className="text-blue-400" /></span>}</td>
                                    <td className="px-6 py-4 text-right text-red-400">{t.debit > 0 ? `₹${t.debit.toFixed(2)}` : '-'}</td>
                                    <td className="px-6 py-4 text-right text-green-400">{t.credit > 0 ? `₹${t.credit.toFixed(2)}` : '-'}</td>
                                    <td className="px-6 py-4 text-right text-white">₹${t.balance.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-2"><button onClick={() => handleEdit(t)} className="text-blue-400 hover:text-blue-300 p-1"><EditIcon /></button><button onClick={() => handleDelete(t._id)} className="text-red-400 hover:text-red-300 p-1"><TrashIcon /></button></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (<div className="text-center py-10 text-gray-500">{transactions.length > 0 ? 'No transactions match your filters.' : (selectedAccountId ? 'No transactions found.' : 'Please select an account.')}</div>)}
                </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}>
                <TransactionForm onSubmit={handleFormSubmit} transaction={editingTransaction} />
            </Modal>
        </div>
    );
};

export default BankDashboard;
