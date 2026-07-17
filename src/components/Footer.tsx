import { Instagram, Facebook, Twitter, ShieldCheck } from "lucide-react";

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  setUserRole: (role: string) => void;
}

export default function Footer({ setCurrentTab, setUserRole }: FooterProps) {
  return (
    <footer className="bg-[#1A202C] text-slate-300 py-16 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#2B6CB0] flex items-center justify-center">
              <span className="font-serif text-white font-bold text-lg">A</span>
            </div>
            <h2 className="font-serif font-bold text-lg text-white">
              AURA <span className="text-[#4299E1]">GOURMET</span>
            </h2>
          </div>
          <p className="text-sm text-slate-400 font-sans leading-relaxed">
            Experience gourmet burgers crafted with passion, dry-aged Wagyu beef, and rare culinary elements.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-[#4299E1] transition-all hover:-translate-y-1 shadow-sm">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-[#4299E1] transition-all hover:-translate-y-1 shadow-sm">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-[#4299E1] transition-all hover:-translate-y-1 shadow-sm">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-serif font-medium text-white mb-6 text-sm uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            {["Home", "Menu", "Blog", "About", "Contact"].map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => {
                    setCurrentTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#4299E1] text-slate-300 transition-colors hover:translate-x-1 duration-200 inline-block text-left"
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Operational Roles for Quick Access */}
        <div>
          <h3 className="font-serif font-medium text-white mb-6 text-sm uppercase tracking-wider">Employee Access</h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              <button 
                onClick={() => { setUserRole("waiter"); setCurrentTab("Dashboard"); }}
                className="hover:text-[#4299E1] text-left transition-colors flex items-center space-x-1.5 text-slate-300 font-medium"
              >
                <span>Staff Terminal Portal</span>
              </button>
              <p className="text-[10px] text-slate-500 font-sans mt-1">Secure access. Requires employee ID and secret authentication PIN.</p>
            </li>
          </ul>
        </div>

        {/* Location Hours */}
        <div className="space-y-3 text-sm">
          <h3 className="font-serif font-medium text-white mb-6 text-sm uppercase tracking-wider">Liaison Hours</h3>
          <p className="text-gray-400 font-sans leading-relaxed">
            123 Gourmet Avenue, Culinary District, New York, NY 10001
          </p>
          <p className="font-mono text-xs text-gray-500">
            Mon - Fri: 11:00 AM - 11:00 PM<br />
            Sat - Sun: 10:00 AM - 12:00 AM
          </p>
          <div className="flex items-center space-x-2 text-xs text-green-500 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            <span>Gourmet Liaison is Online</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-none pt-8 mt-12 text-center text-xs text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Aura Gourmet. Elegant Craftsmanship. All rights reserved.</p>
        <p className="flex items-center space-x-1.5 text-gray-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ISO 27001 Secure Enterprise</span>
        </p>
      </div>
    </footer>
  );
}
