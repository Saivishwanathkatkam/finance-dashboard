
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import IncomeDashboard from './sections/income/IncomeDashboard';
import BankDashboard from './sections/bank/BankDashboard';
import InvestmentsDashboard from './sections/investments/InvestmentsDashboard';
import { Page } from './types';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('Income');
  const [isLoginView, setIsLoginView] = useState(true);

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'Income': return <IncomeDashboard />;
      case 'Bank Statement': return <BankDashboard />;
      case 'Investments': return <InvestmentsDashboard />;
      default: return <IncomeDashboard />;
    }
  }, [currentPage]);

  if (!isLoggedIn) {
    return isLoginView
      ? <LoginPage onSwitchToSignup={() => setIsLoginView(false)} />
      : <SignupPage onSwitchToLogin={() => setIsLoginView(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;