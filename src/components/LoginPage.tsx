import React from 'react';
import { motion } from 'motion/react';
import { LogIn, User, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export const LoginPage = () => {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user && !loading) {
      const from = (location.state as any)?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20 pb-24 px-6 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-72 h-72 bg-pink-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-pink-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-pink-200 mb-8 rotate-12"
        >
          <Sparkles size={48} className="text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-3">
            WELCOME TO <span className="text-pink-500">GLACIOUS</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-[280px] mx-auto leading-relaxed">
            Join our community of trendsetters and get exclusive access to the latest fashion.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-12 space-y-4"
        >
          <button
            onClick={signIn}
            className="w-full bg-white border-2 border-gray-100 p-4 rounded-2xl flex items-center justify-between group hover:border-pink-500 transition-all shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-5 h-5"
                />
              </div>
              <span className="font-black text-gray-800 tracking-tight">CONTINUE WITH GOOGLE</span>
            </div>
            <ArrowRight size={20} className="text-gray-300 group-hover:text-pink-500 transition-colors" />
          </button>

          <div className="pt-8 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl text-left">
              <ShieldCheck size={24} className="text-pink-500 mb-2" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Secure</h3>
              <p className="text-[10px] text-gray-400 font-bold leading-tight">Your data is protected with industry standards.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl text-left">
              <User size={24} className="text-pink-500 mb-2" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Personal</h3>
              <p className="text-[10px] text-gray-400 font-bold leading-tight">Get recommendations tailored to your style.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-auto text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
          By continuing, you agree to Glacious'<br />
          <span className="text-gray-600 underline">Terms of Service</span> and <span className="text-gray-600 underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};
