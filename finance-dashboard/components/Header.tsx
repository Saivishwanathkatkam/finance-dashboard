
import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4 shadow-md">
      <h1 className="text-xl font-bold text-white">{currentPage} Dashboard</h1>
    </header>
  );
};

export default Header;
