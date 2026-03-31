import React from 'react';
import { TopNavBar } from '../components/TopNavBar';
import { BrandingPanel } from '../components/BrandingPanel';
import { RegisterForm } from '../components/RegisterForm';
import { Footer } from '../components/Footer';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <main className="flex-1 pt-16 flex flex-col md:flex-row bg-surface">
        <BrandingPanel variant="register" />
        <RegisterForm />
      </main>
      <Footer />
    </div>
  );
};
