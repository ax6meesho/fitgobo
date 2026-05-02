import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { GlassCard, AnimatedButton, GradientText } from '../components/ui/Layout';
import { Dumbbell, Mail, Lock, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0F1115] overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/10 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-brand/20 mb-4 animate-float">
            <Dumbbell className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-brand">
            Fit<span className="text-white">GOBO</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-black">Premium Fitness Coaching</p>
        </motion.div>

        <GlassCard className="border-white/10 bg-white/5 backdrop-blur-3xl">
          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? 'login' : 'signup'}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              className="space-y-4"
              onSubmit={handleAuth}
            >
              <h2 className="text-xl font-bold mb-6 text-slate-200">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand/50 transition-all text-slate-200 placeholder:text-slate-600"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand/50 transition-all text-slate-200 placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-rose-500 text-xs mt-2 font-bold tracking-tight">{error}</p>}

              <AnimatedButton className="w-full mt-2" isLoading={loading}>
                {isLogin ? 'SIGN IN' : 'GET STARTED'}
              </AnimatedButton>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-transparent px-2 text-slate-600">Or continue with</span></div>
              </div>

              <AnimatedButton 
                type="button" 
                variant="secondary" 
                className="w-full"
                onClick={signInWithGoogle}
              >
                <Chrome className="w-5 h-5 mr-2" />
                GOOGLE
              </AnimatedButton>

              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand transition-colors mt-4"
              >
                {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
              </button>
            </motion.form>
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}
