import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageTitle from './PageTitle';

const app_name = 'cop4331-11-domain.xyz';

function buildPath(route: string): string {
  if (import.meta.env.MODE !== 'development') {
    return 'http://' + app_name + ':5000/' + route;
  } else {
    return 'http://localhost:5000/' + route;
  }
}

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(buildPath('api/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('Password updated! Please log in.');
        navigate('/');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <h2 className="text-xl font-bold text-error">Invalid or missing reset token.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="mb-8"><PageTitle /></div>
      <div className="w-full max-w-md bg-surface-container-low p-8 rounded-2xl shadow-xl border border-outline-variant/10">
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">Create New Password</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-surface border-none rounded-lg py-4 px-4 focus:ring-2 focus:ring-primary/20"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-surface border-none rounded-lg py-4 px-4 focus:ring-2 focus:ring-primary/20"
            required
          />
          <button type="submit" className="w-full gold-gradient-btn text-white font-headline font-black py-4 rounded-lg uppercase tracking-wider">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};