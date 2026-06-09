import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Coffee, Tractor, Mountain } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation after 2 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2000);

    // Complete after exit animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Floating particles for ambient effect
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 3 + Math.random() * 2,
    size: 8 + Math.random() * 12,
  }));

  const Icons = [Leaf, Coffee, Tractor, Mountain];

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Background gradient with shimmer */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-maroon-950 to-maroon-900">
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-gold-500/5 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>

          {/* Floating ambient particles */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((particle) => {
              const IconComponent = Icons[particle.id % Icons.length];
              return (
                <motion.div
                  key={particle.id}
                  className="absolute text-gold-400/20"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0.3, 0.3, 0],
                    scale: [0, 1, 1, 0.5],
                    y: [0, -30, -60],
                    rotate: [0, 10, -10],
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <IconComponent size={particle.size} />
                </motion.div>
              );
            })}
          </div>

          {/* Main content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
            {/* Logo with staggered entrance */}
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Icon container with pulsing glow */}
              <motion.div
                className="relative"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 blur-xl bg-gold-400/30 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <Leaf
                  size={80}
                  className="relative text-gold-400 drop-shadow-lg"
                  strokeWidth={1.5}
                />
              </motion.div>
            </motion.div>

            {/* Brand name with letter-by-letter reveal */}
            <motion.div className="text-center overflow-hidden">
              <motion.div
                className="flex items-baseline justify-center gap-2"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.span
                  className="text-4xl md:text-5xl font-bold text-gold-300 tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  Roots
                </motion.span>
                <motion.span
                  className="text-4xl md:text-5xl font-light text-gold-400/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  of
                </motion.span>
              </motion.div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.span
                  className="text-4xl md:text-5xl font-bold text-gold-300 tracking-tight"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  Araku
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Tagline with fade-in */}
            <motion.p
              className="mt-4 text-gold-400/60 text-sm md:text-base tracking-widest uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Premium Coffee from the Hills
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              className="mt-10 flex gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.3 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gold-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
