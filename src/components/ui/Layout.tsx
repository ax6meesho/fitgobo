import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  animate?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  [key: string]: any; 
}

export const GlassCard = ({ children, className, animate = true, ...props }: CardProps) => {
  const content = (
    <div 
      className={cn(
        "bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
  
  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {content}
    </motion.div>
  );
};

interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  [key: string]: any;
}

export const AnimatedButton = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  isLoading,
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: "bg-[#D9FF00] text-black hover:bg-[#c4e600] shadow-[0_0_20px_rgba(217,255,0,0.3)] font-bold",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md",
    outline: "border-2 border-[#D9FF00]/50 text-[#D9FF00] hover:bg-[#D9FF00]/10",
    ghost: "text-slate-500 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] uppercase tracking-widest font-black",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg font-bold",
    icon: "p-3 rounded-full",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
};

export const GradientText = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("bg-gradient-to-r from-[#D9FF00] to-cyan-400 bg-clip-text text-transparent", className)}>
    {children}
  </span>
);
