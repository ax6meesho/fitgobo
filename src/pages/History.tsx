import { useState, useEffect } from 'react';
import { GlassCard, GradientText } from '../components/ui/Layout';
import { 
  Calendar, 
  Clock, 
  Activity, 
  ArrowLeft, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function History() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) return;
      const historyPath = `users/${auth.currentUser.uid}/history`;
      try {
        const q = query(
          collection(db, historyPath),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q).catch(e => handleFirestoreError(e, OperationType.GET, historyPath));
        if (snapshot) {
          setWorkouts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalMinutes = workouts.reduce((acc, curr) => acc + (curr.duration || 0), 0);

  return (
    <div className="min-h-screen bg-[#0F1115] p-6 pb-24">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-200">Activity <GradientText>Log</GradientText></h1>
      </div>

      {loading ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Retrieving Vault Data</p>
        </div>
      ) : workouts.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
            <Activity className="w-10 h-10 text-slate-700" />
          </div>
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest leading-relaxed">No sessions found in history.<br/>Your evolution is awaiting initialization.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="py-5 text-center border-white/5 bg-white/[0.02]">
              <TrendingUp className="w-5 h-5 text-brand mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-200">{workouts.length}</div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sessions</p>
            </GlassCard>
            <GlassCard className="py-5 text-center border-white/5 bg-white/[0.02]">
              <Award className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-200">{totalMinutes}</div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Minutes</p>
            </GlassCard>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-2">Evolution Journey</h3>
            {workouts.map((workout, i) => (
              <motion.div
                key={workout.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard 
                  className="p-4 flex items-center justify-between cursor-pointer active:scale-95 transition-transform border-white/5 bg-white/[0.02]"
                  onClick={() => setSelectedWorkout(selectedWorkout?.id === workout.id ? null : workout)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">{workout.workoutName}</h4>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                        {new Date(workout.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-black text-brand uppercase tracking-widest">{workout.duration}m</p>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 text-slate-700 transition-transform", selectedWorkout?.id === workout.id ? "rotate-90" : "")} />
                  </div>
                </GlassCard>

                <AnimatePresence>
                  {selectedWorkout?.id === workout.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2 px-2"
                    >
                      <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4 shadow-inner">
                        <section>
                          <h5 className="text-[9px] font-black text-brand uppercase tracking-[0.2em] mb-3">Protocol Matrix</h5>
                          <ul className="space-y-2">
                            {workout.mainExercises?.map((ex: any, idx: number) => (
                              <li key={idx} className="text-xs text-slate-400 flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium">{ex.exercise}</span>
                                <span className="font-black text-slate-200 bg-white/5 px-2 py-0.5 rounded tracking-widest">{ex.sets}x{ex.reps}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
