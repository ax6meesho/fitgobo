import { useState, useEffect } from 'react';
import { GlassCard, AnimatedButton, GradientText } from '../components/ui/Layout';
import { 
  Sparkles, 
  Dumbbell, 
  Clock, 
  Activity,
  CheckCircle2, 
  Timer, 
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { generateWorkout } from '../lib/gemini';
import { cn } from '../lib/utils';
import { Play } from 'lucide-react';

export default function WorkoutGenerator() {
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<any>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>('main');
  const navigate = useNavigate();

  const fetchGeneratorData = async () => {
    setLoading(true);
    const userPath = `users/${auth.currentUser!.uid}`;
    try {
      const userDoc = await getDoc(doc(db, userPath)).catch(e => handleFirestoreError(e, OperationType.GET, userPath));
      if (userDoc && userDoc.exists()) {
        const { goal, level, time } = userDoc.data()!;
        const result = await generateWorkout(goal, level, Number(time));
        setWorkout(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async () => {
    const historyPath = `users/${auth.currentUser!.uid}/history`;
    try {
      await addDoc(collection(db, historyPath), {
        ...workout,
        createdAt: new Date().toISOString(),
        completedAt: serverTimestamp(),
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, historyPath));
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleExercise = (name: string) => {
    setCompletedExercises(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  if (loading) return (
    <div className="h-screen bg-[#0F1115] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-t-2 border-r-2 border-brand rounded-full"
        />
        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-brand animate-pulse" />
      </div>
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Crafting Your Plan</h2>
        <p className="text-slate-500 mt-2 font-medium">Our AI is analyzing your goals to generate the perfect workout sequence.</p>
      </div>
    </div>
  );

  if (!workout) return (
    <div className="min-h-screen bg-[#0F1115] p-6 flex flex-col items-center justify-center space-y-8">
      <div className="p-8 rounded-full bg-white/5 border border-white/5">
        <Dumbbell className="w-16 h-16 text-slate-700" />
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-black italic tracking-tighter">READY FOR <GradientText>EVOLUTION?</GradientText></h1>
        <p className="text-slate-500 mt-3 max-w-xs mx-auto text-sm font-medium uppercase tracking-widest">Generate a personalized workout session powered by FitGOBO Intelligence.</p>
      </div>
      <AnimatedButton onClick={fetchGeneratorData} size="lg" className="w-full">
        GENERATE PLAN <Sparkles className="w-5 h-5 ml-2" />
      </AnimatedButton>
      <button onClick={() => navigate('/')} className="text-slate-500 font-black uppercase tracking-widest text-[10px] flex items-center hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1115] pb-32">
      <div className="p-6 sticky top-0 bg-[#0F1115]/80 backdrop-blur-xl z-30 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-bold text-lg leading-tight uppercase tracking-tighter text-[#D9FF00]">{workout.workoutName}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center text-[10px] uppercase font-black text-slate-500">
                <Clock className="w-3 h-3 mr-1 text-brand" /> {workout.duration}m
              </span>
              <span className="flex items-center text-[10px] uppercase font-black text-slate-500">
                <Activity className="w-3 h-3 mr-1 text-cyan-400" /> {workout.difficulty}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-brand uppercase tracking-widest">{completedExercises.length}/{workout.warmup.length + workout.mainExercises.length + workout.coolDown.length}</p>
        </div>
      </div>

      <main className="p-6 space-y-6">
        {[
          { id: 'warmup', title: 'Warm-up', items: workout.warmup, color: 'text-cyan-400' },
          { id: 'main', title: 'Main Exercises', items: workout.mainExercises, color: 'text-[#D9FF00]' },
          { id: 'cooldown', title: 'Cool Down', items: workout.coolDown, color: 'text-rose-400' }
        ].map((section) => (
          <div key={section.id} className="space-y-4">
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-2"
            >
              <h3 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded-lg bg-white/5", section.color)}>{section.items.length}</span> {section.title}
              </h3>
              {expandedSection === section.id ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
            </button>

            <AnimatePresence>
              {expandedSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-3"
                >
                  {section.items.map((item: any, i: number) => (
                    <GlassCard 
                      key={item.exercise + i}
                      className={cn(
                        "p-4 flex items-center gap-4 transition-all duration-300 border-white/5",
                        completedExercises.includes(item.exercise) ? "opacity-30 grayscale blur-[1px]" : ""
                      )}
                    >
                      <button 
                        onClick={() => toggleExercise(item.exercise)}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                          completedExercises.includes(item.exercise) ? "bg-brand text-black" : "bg-black/40 border border-white/10"
                        )}
                      >
                        {completedExercises.includes(item.exercise) ? <CheckCircle2 className="w-6 h-6" /> : <Play className="w-5 h-5 text-brand" />}
                      </button>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-200">{item.exercise}</h4>
                        <div className="flex gap-3 mt-1 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          {item.sets && <span>{item.sets} Sets</span>}
                          {item.reps && <span>{item.reps} Reps</span>}
                          {item.duration && <span>{item.duration}</span>}
                          {item.rest && <span>{item.rest} Rest</span>}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F1115] to-transparent z-40">
        <AnimatedButton 
          onClick={saveWorkout} 
          className="w-full h-16 text-lg font-black uppercase tracking-tighter"
          disabled={completedExercises.length === 0}
        >
          FINISH SESSION
        </AnimatedButton>
      </div>
    </div>
  );
}
