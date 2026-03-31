import React from 'react';
import { TopNavBar } from '../components/TopNavBar';
import { BrandingPanel } from '../components/BrandingPanel';
import { LoginForm } from '../components/LoginForm';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <main className="flex-1 pt-16 flex flex-col md:flex-row bg-surface">
        <BrandingPanel variant="login" />
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
};
