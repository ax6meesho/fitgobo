import React, { useState } from 'react';
import { GlassCard, AnimatedButton, GradientText } from '../components/ui/Layout';
import { Calculator, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // to meters
    if (w > 0 && h > 0) {
      const result = w / (h * h);
      setBmi(Number(result.toFixed(1)));
      
      if (result < 18.5) setCategory('Underweight');
      else if (result < 25) setCategory('Normal');
      else if (result < 30) setCategory('Overweight');
      else setCategory('Obese');
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Normal': return 'text-[#D9FF00]';
      case 'Underweight': return 'text-cyan-400';
      case 'Overweight': return 'text-orange-400';
      case 'Obese': return 'text-rose-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] p-6 pb-24">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black uppercase tracking-tighter">BMI <GradientText>Calculator</GradientText></h1>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <GlassCard className="border-white/5">
          <form onSubmit={calculateBMI} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-[0.2em]">Weight (kg)</label>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand/50 transition-all text-xl font-bold text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-[0.2em]">Height (cm)</label>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-brand/50 transition-all text-xl font-bold text-slate-200"
                  required
                />
              </div>
            </div>

            <AnimatedButton className="w-full h-16 text-lg font-black uppercase tracking-widest">
              CALCULATE INDEX
            </AnimatedButton>
          </form>
        </GlassCard>

        <AnimatePresence>
          {bmi && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6"
            >
              <GlassCard className="text-center py-10 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-2">Metrics Analysis</p>
                <div className="text-6xl font-black mb-4 text-slate-200">{bmi}</div>
                <div className={cn("text-xl font-black uppercase tracking-tight", getCategoryColor(category))}>
                  {category}
                </div>
              </GlassCard>

              <GlassCard className="flex items-start gap-4 py-6 border-white/5 bg-brand/[0.02]">
                <div className="p-3 rounded-2xl bg-brand/10 text-brand shadow-[0_0_15px_rgba(217,255,0,0.1)]">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-slate-200">Vitality Insight</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {category === 'Normal' 
                      ? "Optimal index achieved. Maintain current activity levels and balanced macronutrient distribution."
                      : category === 'Underweight'
                      ? "Focus on surplus caloric intake with hyper-density nutrients and hyperbolic strength training."
                      : "Consider adjusting aerobic volume and monitoring consistent step counts for metabolic optimization."}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 text-slate-700 text-[10px] font-black uppercase tracking-widest py-4">
          <HelpCircle className="w-3 h-3" />
          <span>VITALITY OS Indexing Standard</span>
        </div>
      </div>
    </div>
  );
}
