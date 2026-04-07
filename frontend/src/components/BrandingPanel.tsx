import React from 'react';
import ucfr1 from '../assets/UCFR1.jpg';

interface BrandingPanelProps {
  variant: 'login' | 'register';
}

export const BrandingPanel: React.FC<BrandingPanelProps> = ({ variant }) => {
  if (variant === 'login') {
    return (
      <section className="hidden md:flex md:w-1/2 academic-gradient relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <img alt="" className="w-full h-full object-cover" src={ucfr1} />
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="mb-8">
            <span className="material-symbols-outlined text-[#ffc909] text-6xl mb-4">account_balance</span>
            <h1 className="font-headline text-5xl font-extrabold text-white tracking-tighter leading-tight mb-6">
              Advancing Global <span className="text-[#ffc909]">Knowledge</span> Through Collaboration.
            </h1>
            <p className="text-white/80 text-lg font-body leading-relaxed mb-8">
              Welcome to Knight Lab, where curiosity meets collaboration. UCFs Research Hub for faculty and Students to collaborate on research projects.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-[#ffc909] font-headline font-black text-2xl">1.9k+</p>
              <p className="text-white/60 text-xs font-label tracking-widest uppercase">Active Researchers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-[#ffc909] font-headline font-black text-2xl">~250</p>
              <p className="text-white/60 text-xs font-label tracking-widest uppercase">Research Labs</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Register variant
  return (
    <section className="relative hidden md:flex w-full md:w-1/2 min-h-[400px] md:min-h-0 items-end p-12 overflow-hidden bg-inverse-surface">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay">
        <img alt="" className="w-full h-full object-cover" src={ucfr1} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-on-background via-transparent to-transparent opacity-60">
      </div>
      <div className="relative z-10 max-w-lg mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-surface tracking-tighter leading-none mb-6">
          Pioneer New <br /><span className="text-primary-container">Frontiers.</span>
        </h1>
        <p className="text-surface-variant text-lg font-light leading-relaxed mb-8 opacity-90">
          Join an elite community of scholars. Access global data, collaborate on cross-disciplinary papers,
          and accelerate your research journey.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-4">
            <img alt="User 1" className="w-10 h-10 rounded-full border-2 border-inverse-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY-PPuy54YyCL0YAuIBkYyLKB_mil8DBtQ8mEQ-Qnb5cTkvl6fsn_4Mcw1RxLTI5GYe1YyeuxOCT4Q3YajHvs5i34KXMBDz8Z9flrwXjBXIHDCRgZ5QbI1l6MvNnWKt7ENd0ZQS0W3iIVfBOcy2eUy6FCfNWblLU9pbaMbDloRLNP8jJpzX4yWJriZTSa_CA_SPZxrhUS83qCslFHUzz93VMNO6yiERwIkm3LAUl332UzGpTolSAj4hOsRSQXY_hETmXjRPge5AOM" />
            <img alt="User 2" className="w-10 h-10 rounded-full border-2 border-inverse-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIOMgUsaacgl85iKHOtQxesHr0OrQI4QEy3ftRV07z0-IVz2smZKrRpIq5i4y2sqvIWL7JTx8nJ8MMCoK2CyM7oRMf3VCxKWhzY_DFKg-P7pNFZsGxHquvUo82jYSBZCUoZSBQU1ytBmfMAscnuo21Va7iLh3fbRSQyvVCKV4xZrUmuUavOIZi_vTZsUFlO9Caafdx3Ti-lzF5k7UFv_T4Bkvwma5_7zDVyhGolpHpeAg9CCazwOTxYzw5qb7AEYtIDmZH9VJdee4" />
            <img alt="User 3" className="w-10 h-10 rounded-full border-2 border-inverse-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD60Cu1P4X0f2X0YAZtbtl1VXLsMaC2a5OKgXoVd_w-W_GxkZ_-qoEG9k837jCwg5PtR6Gqg9psxsmo6HkUklRBQb4-PP9Tt2hnLjkx9hdA_3GlHal74vvm1ibOzxkp1T4faCGngC4cMBE8DDtxB-Ijnu-1_SuJpskygxq-MaTgV-lRxCVUxA5mEti4SnSTQMLWN6r64MGyJelVmWlHWXRjAQX56rM_qlXumV2f2MNQdHFZrVFj1KhW0zxakVJwbpZpOtXUUCXeaFI" />
          </div>
          <span className="text-surface-container-high text-sm font-medium tracking-wide">+2.4k researchers active today</span>
        </div>
      </div>
    </section>
  );
};
