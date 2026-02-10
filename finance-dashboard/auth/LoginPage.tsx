
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

interface LoginPageProps {
  onSwitchToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, authError, clearAuthError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearAuthError();
    try {
      await login({ email, password });
    } catch (error) {
      // Error is handled in context, just stop loading
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-gray-400">Log in to your FinDash account</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {authError && <p className="text-red-400 text-center">{authError}</p>}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password"className="text-sm font-medium text-gray-300">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              {isLoading ? <Spinner /> : 'Log In'}
            </Button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-400">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="font-medium text-blue-400 hover:text-blue-300">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;