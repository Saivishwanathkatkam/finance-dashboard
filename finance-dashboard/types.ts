
export type Page = 'Income' | 'Bank Statement' | 'Investments';

export interface IncomeRecord {
  _id: string;
  userId: string;
  date: string; // ISO string
  source: string;
  category: string;
  amount: number;
  notes?: string;
}

export interface BankAccount {
  _id: string;
  userId: string;
  accountName: string;
  accountNumber: string;
  isActive: boolean;
}

export interface BankTransaction {
  _id: string;
  userId: string;
  accountId: string;
  date: string; // ISO string
  details: string;
  debit: number;
  credit: number;
  balance: number;
  source: 'CSV' | 'MANUAL';
}

export type SummaryCardData = {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
};

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};