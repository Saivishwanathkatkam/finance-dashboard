
import React from 'react';
import { Page } from '../types';
import { IncomeIcon, BankIcon, InvestmentIcon } from './icons';
import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
  label: Page;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const { logout } = useAuth();
  const navItems: { label: Page; icon: React.ReactNode }[] = [
    { label: 'Income', icon: <IncomeIcon className="w-5 h-5" /> },
    { label: 'Bank Statement', icon: <BankIcon className="w-5 h-5" /> },
    { label: 'Investments', icon: <InvestmentIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex-shrink-0 flex flex-col">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-xl">F</div>
        <h1 className="text-2xl font-bold text-white ml-3">FinDash</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            isActive={currentPage === item.label}
            onClick={() => setCurrentPage(item.label)}
          />
        ))}
      </nav>
      <div className="mt-auto">
        <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span className="ml-3">Logout</span>
        </button>
        <p className="text-center text-gray-500 text-xs mt-4">&copy; 2023 FinDash Inc.</p>
      </div>
    </aside>
  );
};

export default Sidebar;