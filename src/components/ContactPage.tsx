import React from 'react';
import { motion } from 'motion/react';
import { Phone, MapPin, Mail, ArrowLeft, MessageCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COMPANY_INFO } from '../constants';
import { cn } from '../lib/utils';

export const ContactPage = () => {
  const navigate = useNavigate();

  const contactMethods = [
    {
      icon: Phone,
      label: 'Call Us',
      value: COMPANY_INFO.phone,
      action: `tel:${COMPANY_INFO.phone.replace(/\s+/g, '')}`,
      color: 'bg-blue-50 text-blue-500',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: 'Chat with us',
      action: `https://wa.me/${COMPANY_INFO.phone.replace(/[^0-9]/g, '')}`,
      color: 'bg-green-50 text-green-500',
    },
    {
      icon: Mail,
      label: 'Email Us',
      value: COMPANY_INFO.email,
      action: `mailto:${COMPANY_INFO.email}`,
      color: 'bg-pink-50 text-pink-500',
    },
    {
      icon: MapPin,
      label: 'Visit Us',
      value: COMPANY_INFO.address,
      action: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY_INFO.address)}`,
      color: 'bg-purple-50 text-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-24 px-4">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-50">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Contact Us</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-xl shadow-pink-100">
            <MessageCircle size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight uppercase">Get in Touch</h2>
          <p className="text-gray-500 text-sm max-w-[250px] mx-auto font-medium leading-relaxed">
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-4">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.label}
              href={method.action}
              target={method.label === 'Visit Us' || method.label === 'WhatsApp' ? '_blank' : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", method.color)}>
                <method.icon size={24} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{method.label}</p>
                <p className="text-sm font-bold text-gray-800 leading-tight">{method.value}</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Business Hours */}
        <div className="p-6 bg-gray-900 rounded-3xl text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} className="text-pink-500" />
            <h3 className="text-sm font-black uppercase tracking-widest">Business Hours</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white/50 uppercase tracking-tighter">Mon - Fri</span>
              <span>08:00 AM - 05:00 PM</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white/50 uppercase tracking-tighter">Saturday</span>
              <span>09:00 AM - 01:00 PM</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white/50 uppercase tracking-tighter">Sunday</span>
              <span className="text-pink-500">Closed</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
