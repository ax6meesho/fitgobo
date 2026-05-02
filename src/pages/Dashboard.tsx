import { useState, useEffect } from 'react';
import { GlassCard, AnimatedButton, GradientText } from '../components/ui/Layout';
import { 
  Activity, 
  Calendar, 
  TrendingUp, 
  Play, 
  Calculator, 
  History as HistoryIcon,
  User,
  LogOut,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../lib/firebase';

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userPath = `users/${auth.currentUser.uid}`;
        const userDoc = await getDoc(doc(db, userPath)).catch(e => handleFirestoreError(e, OperationType.GET, userPath));
        if (userDoc && userDoc.exists()) {
          const data = userDoc.data();
          if (!data.onboarded) navigate('/onboarding');
          setUserData(data);
        } else {
          navigate('/onboarding');
        }

        const historyPath = `users/${auth.currentUser.uid}/history`;
        const q = query(
          collection(db, historyPath),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q).catch(e => handleFirestoreError(e, OperationType.GET, historyPath));
        if (snapshot) {
          setRecentWorkouts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24">
      <header className="p-6 flex items-center justify-between sticky top-0 z-30 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center border border-brand/10">
            <User className="w-6 h-6 text-brand" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Level {userData?.level || '1'}</p>
            <p className="font-bold text-slate-200">{auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0]}</p>
          </div>
        </div>
        <button onClick={() => signOut(auth)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
          <LogOut className="w-6 h-6" />
        </button>
      </header>

      <main className="p-6 space-y-8">
        <GlassCard className="from-brand/10 to-brand/0 bg-gradient-to-br">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Your Current Goal</p>
              <h2 className="text-3xl font-black mt-1"><GradientText>{userData?.goal || 'Analyze Goal'}</GradientText></h2>
            </div>
            <div className="bg-brand p-3 rounded-2xl shadow-[0_0_20px_rgba(217,255,0,0.4)]">
              <Activity className="w-6 h-6 text-black" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Weekly Training</p>
              <p className="text-xs font-black text-brand">{recentWorkouts.length}/4 Days</p>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((recentWorkouts.length / 4) * 100, 100)}%` }}
                className="h-full bg-brand shadow-[0_0_10px_rgba(217,255,0,0.5)]"
              />
            </div>
          </div>
        </GlassCard>

        <section className="grid grid-cols-2 gap-4">
          <Link to="/workout" className="col-span-2">
            <GlassCard className="flex items-center justify-between border-brand/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shadow-[0_0_15px_rgba(217,255,0,0.2)]">
                  <Play className="w-6 h-6 fill-black text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">Daily Workout</h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">AI Generated Plan</p>
                </div>
              </div>
              <ChevronRight className="text-slate-600" />
            </GlassCard>
          </Link>
          <Link to="/bmi">
            <GlassCard className="h-full flex flex-col justify-between py-5 border-white/5">
              <Calculator className="w-6 h-6 text-rose-400 mb-4" />
              <div>
                <h3 className="font-bold text-sm text-slate-200">BMI Calc</h3>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Body Index</p>
              </div>
            </GlassCard>
          </Link>
          <Link to="/diet">
            <GlassCard className="h-full flex flex-col justify-between py-5 border-white/5">
              <Utensils className="w-6 h-6 text-brand mb-4" />
              <div>
                <h3 className="font-bold text-sm text-slate-200">Diet AI</h3>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Plan Meals</p>
              </div>
            </GlassCard>
          </Link>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-black text-xl uppercase tracking-tighter text-slate-200">Recent Activity</h3>
            <Link to="/history" className="text-[10px] text-brand font-black uppercase tracking-[0.2em]">See All</Link>
          </div>
          <div className="space-y-3">
            {recentWorkouts.length > 0 ? recentWorkouts.map((workout, i) => (
              <motion.div
                key={workout.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-4 flex items-center justify-between border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{workout.workoutName}</h4>
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{new Date(workout.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-brand uppercase">{workout.duration}m</p>
                  </div>
                </GlassCard>
              </motion.div>
            )) : (
              <div className="text-center py-12 text-slate-600 font-medium italic">
                No sessions recorded yet
              </div>
            )}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-black/60 backdrop-blur-2xl rounded-full flex items-center justify-around px-8 shadow-2xl z-50 border-white/10">
        <Link to="/" className="text-brand"><TrendingUp className="w-6 h-6 border-b-2 border-brand pb-1" /></Link>
        <Link to="/workout" className="p-4 bg-brand rounded-full -mt-12 shadow-lg shadow-brand/40 text-black border-4 border-[#0F1115] hover:scale-110 transition-transform"><Play className="w-6 h-6 fill-black" /></Link>
        <Link to="/history" className="text-slate-500 hover:text-white"><HistoryIcon className="w-6 h-6 font-bold" /></Link>
      </nav>
    </div>
  );
}
