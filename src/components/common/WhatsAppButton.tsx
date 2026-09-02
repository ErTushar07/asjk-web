import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useDatabase();
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const rawPhone = settings.emergencyPhone || settings.phone || '+919419301319';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  const handleClick = () => {
    const message = encodeURIComponent('Hello Al Shujaiat Foundation, I have an inquiry regarding your humanitarian programs.');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-20 right-5 z-40 animate-fadeIn">
      <button
        onClick={handleClick}
        aria-label={t('common.whatsapp_chat', 'Chat on WhatsApp')}
        title={t('common.whatsapp_chat', 'Chat on WhatsApp')}
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
        
        {/* Tooltip */}
        <span className="hidden group-hover:block absolute right-14 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-md pointer-events-none">
          {t('common.whatsapp_chat', 'Chat on WhatsApp')}
        </span>
      </button>
    </div>
  );
};
