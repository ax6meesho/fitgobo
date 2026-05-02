import { useState, useEffect } from 'react';
import { GlassCard, AnimatedButton, GradientText } from '../components/ui/Layout';
import { Utensils, ArrowLeft, Sparkles, ChevronRight, Apple, Soup, Sandwich, Pizza } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { generateDietSuggestions } from '../lib/gemini';

export default function DietSuggestions() {
  const [loading, setLoading] = useState(false);
  const [diet, setDiet] = useState<any>(null);
  const navigate = useNavigate();

  const fetchDiet = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    const userPath = `users/${auth.currentUser.uid}`;
    try {
      const userDoc = await getDoc(doc(db, userPath)).catch(e => handleFirestoreError(e, OperationType.GET, userPath));
      if (userDoc && userDoc.exists()) {
        const { goal } = userDoc.data();
        const result = await generateDietSuggestions(goal);
        setDiet(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiet();
  }, []);

  const getMealIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('breakfast')) return <Apple className="w-6 h-6 text-brand" />;
    if (t.includes('lunch')) return <Sandwich className="w-6 h-6 text-orange-400" />;
    if (t.includes('snack')) return <Pizza className="w-6 h-6 text-cyan-400" />;
    if (t.includes('dinner')) return <Soup className="w-6 h-6 text-rose-400" />;
    return <Utensils className="w-6 h-6 text-slate-500" />;
  };

  if (loading) return (
    <div className="h-screen bg-[#0F1115] flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 3 }}
        className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mb-6"
      >
        <Utensils className="w-10 h-10 text-brand" />
      </motion.div>
      <h2 className="text-2xl font-black uppercase tracking-widest text-[#D9FF00]">Analyzing Biosignals</h2>
      <p className="text-slate-500 mt-2 font-medium italic">Our AI is designing a nutritional foundation for your goal.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1115] p-6 pb-24">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black uppercase tracking-tighter">Dietary <GradientText>Architecture</GradientText></h1>
      </div>

      {!diet ? (
        <div className="text-center py-12 flex flex-col items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
            <Utensils className="w-10 h-10 text-slate-700" />
          </div>
          <AnimatedButton onClick={fetchDiet} size="lg" className="w-full">
            GENERATE PROTOCOL <Sparkles className="w-5 h-5 ml-2" />
          </AnimatedButton>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="px-2">
            <h2 className="text-3xl font-black text-slate-200 uppercase tracking-tighter">{diet.planName}</h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed font-medium capitalize">{diet.description}</p>
          </div>

          <div className="space-y-4">
            {diet.meals.map((meal: any, i: number) => (
              <motion.div
                key={meal.mealType}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-5 flex items-start gap-5 border-white/5 bg-white/[0.02]">
                  <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                    {getMealIcon(meal.mealType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-500">{meal.mealType}</h3>
                      {meal.nutrients && <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-lg font-bold tracking-widest">{meal.nutrients}</span>}
                    </div>
                    <p className="font-bold text-lg mt-1 text-slate-200 leading-tight">{meal.suggestion}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <GlassCard className="bg-gradient-to-br from-brand/10 to-transparent border-brand/20 flex items-center gap-4 py-8">
            <Sparkles className="w-10 h-10 text-brand shrink-0" />
            <p className="text-sm font-medium italic text-slate-400">
              "Nutrition is 70% of the battle. Follow this protocol to accelerate your {diet.planName.toLowerCase()} targets."
            </p>
          </GlassCard>

          <AnimatedButton onClick={fetchDiet} variant="outline" className="w-full">
            REGENERATE PROTOCOL
          </AnimatedButton>
        </div>
      )}
    </div>
  );
}
