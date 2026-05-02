import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard, AnimatedButton, GradientText } from '../components/ui/Layout';
import { Target, Activity, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

const steps = [
  {
    id: 'goal',
    title: 'What is your goal?',
    options: [
      { id: 'Fat Loss', label: 'Fat Loss', icon: '🔥' },
      { id: 'Muscle Gain', label: 'Muscle Gain', icon: '💪' },
      { id: 'Strength', label: 'Strength', icon: '⚡' },
      { id: 'Home Fitness', label: 'Home Fitness', icon: '🏠' },
    ]
  },
  {
    id: 'level',
    title: 'Fitness level?',
    options: [
      { id: 'Beginner', label: 'Beginner', desc: 'New to working out' },
      { id: 'Intermediate', label: 'Intermediate', desc: '1-2 years experience' },
      { id: 'Advanced', label: 'Advanced', desc: 'Heavy lifter' },
    ]
  },
  {
    id: 'time',
    title: 'Workout duration?',
    options: [
      { id: '15', label: '15 min', desc: 'Quick session' },
      { id: '30', label: '30 min', desc: 'Standard workout' },
      { id: '45', label: '45 min', desc: 'Deep focus' },
      { id: '60', label: '60 min', desc: 'Full performance' },
    ]
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    goal: '',
    level: '',
    time: ''
  });
  const navigate = useNavigate();

  const handleSelection = (value: string) => {
    const key = steps[currentStep].id;
    setSelections(prev => ({ ...prev, [key]: value }));
    
    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const finishOnboarding = async () => {
    if (!auth.currentUser) return;
    const userPath = `users/${auth.currentUser.uid}`;
    try {
      await setDoc(doc(db, userPath), {
        ...selections,
        onboarded: true,
        createdAt: new Date().toISOString()
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, userPath));
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const stepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-[#0F1115] p-6 flex flex-col justify-center">
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[120px] rounded-full" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-cyan/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-sm mx-auto space-y-12 relative z-10">
        <div className="space-y-6">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full bg-white/5 overflow-hidden`}
              >
                {i <= currentStep && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="h-full bg-brand shadow-[0_0_10px_rgba(217,255,0,0.5)]"
                  />
                )}
              </div>
            ))}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-200">{stepData.title}</h1>
        </div>

        <div className="space-y-4">
          {stepData.options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelection(option.id)}
              className={`w-full p-6 bg-white/5 border-2 rounded-3xl text-left transition-all flex items-center justify-between ${
                selections[stepData.id as keyof typeof selections] === option.id 
                ? 'border-brand bg-brand/10' 
                : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                {'icon' in option && <span className="text-2xl">{option.icon}</span>}
                <div>
                  <div className="font-bold text-lg text-slate-200 leading-tight">{option.label}</div>
                  {'desc' in option && <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">{option.desc}</div>}
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-slate-700 transition-transform ${
                selections[stepData.id as keyof typeof selections] === option.id ? 'translate-x-1 text-brand' : ''
              }`} />
            </motion.button>
          ))}
        </div>

        {currentStep === steps.length - 1 && selections.time && (
          <AnimatedButton onClick={finishOnboarding} className="w-full py-5 text-lg font-black uppercase tracking-tighter">
            FINALIZE PROFILE
          </AnimatedButton>
        )}
      </div>
      <div className="fixed bottom-10 left-0 right-0 text-center text-[10px] uppercase font-black tracking-[0.3em] text-slate-800">
        FitGOBO · Initialization Phase
      </div>
    </div>
  );
}
