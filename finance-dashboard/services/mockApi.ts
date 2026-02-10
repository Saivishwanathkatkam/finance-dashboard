
import { IncomeRecord, BankAccount, BankTransaction } from '../types';

const API_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("No auth token found. Please log in.");
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

const handleResponse = async (response: Response) => {
    if (response.status === 204) return { success: true }; // Handle No Content responses
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
    return data;
}

// --- Auth API ---
export const login = (credentials: any) => fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }).then(handleResponse);
export const signup = (credentials: any) => fetch(`${API_URL}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }).then(handleResponse);

// --- Income API ---
export const getIncomeRecords = (): Promise<IncomeRecord[]> => fetch(`${API_URL}/income`, { headers: getAuthHeaders() }).then(handleResponse);
export const addIncomeRecord = (record: Omit<IncomeRecord, '_id' | 'userId'>): Promise<IncomeRecord> => fetch(`${API_URL}/income`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(record) }).then(handleResponse);
export const uploadIncomeCSV = (csv: string): Promise<{ insertedCount: number }> => fetch(`${API_URL}/income/upload`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ csv }) }).then(handleResponse);
export const updateIncomeRecord = (record: Omit<IncomeRecord, 'userId'>): Promise<IncomeRecord> => fetch(`${API_URL}/income/${record._id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(record) }).then(handleResponse);
export const deleteIncomeRecord = async (id: string): Promise<{ success: boolean }> => {
    await fetch(`${API_URL}/income/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    return { success: true };
};

// --- Bank Accounts API ---
export const getBankAccounts = (): Promise<BankAccount[]> => fetch(`${API_URL}/bank-accounts`, { headers: getAuthHeaders() }).then(handleResponse);
export const addBankAccount = (account: Omit<BankAccount, '_id' | 'userId'>): Promise<BankAccount> => fetch(`${API_URL}/bank-accounts`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(account) }).then(handleResponse);
export const deleteBankAccount = (id: string): Promise<{ success: boolean }> => fetch(`${API_URL}/bank-accounts/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse);

// --- Bank Transactions API ---
export const getBankTransactions = (accountId: string): Promise<BankTransaction[]> => fetch(`${API_URL}/transactions?accountId=${accountId}`, { headers: getAuthHeaders() }).then(handleResponse);
export const addBankTransaction = (transaction: Omit<BankTransaction, '_id' | 'userId'>): Promise<BankTransaction> => fetch(`${API_URL}/transactions`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(transaction) }).then(handleResponse);
export const uploadBankTransactionsCSV = (csv: string, accountId: string): Promise<{ insertedCount: number, deletedCount: number }> => fetch(`${API_URL}/transactions/upload`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ csv, accountId }) }).then(handleResponse);
export const updateBankTransaction = (transaction: Omit<BankTransaction, 'userId'>): Promise<BankTransaction> => fetch(`${API_URL}/transactions/${transaction._id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(transaction) }).then(handleResponse);
export const deleteBankTransaction = (id: string): Promise<{ success: boolean }> => fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse);
export const deleteBulkBankTransactions = (ids: string[]): Promise<{ success: boolean }> => fetch(`${API_URL}/transactions/bulk-delete`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ ids }) }).then(handleResponse);
