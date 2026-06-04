import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mountain, Leaf, Droplet } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5 + i * 0.2,
        duration: 0.6,
        type: 'spring',
        stiffness: 100,
      },
    }),
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        delay: 2,
      },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-maroon-700 via-maroon-800 to-maroon-900 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 bg-gold-400 rounded-full opacity-10 blur-3xl"
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -30, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 bg-warm-500 rounded-full opacity-10 blur-3xl"
          animate={{
            x: [0, -30, 30, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icons Row */}
        <motion.div className="flex justify-center gap-6 mb-8">
          <motion.div
            custom={0}
            variants={iconVariants}
            className="text-gold-400"
          >
            <Mountain size={40} />
          </motion.div>
          <motion.div
            custom={1}
            variants={iconVariants}
            className="text-warm-400"
          >
            <Droplet size={40} />
          </motion.div>
          <motion.div
            custom={2}
            variants={iconVariants}
            className="text-green-400"
          >
            <Leaf size={40} />
          </motion.div>
        </motion.div>

        {/* Main Title */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
            Roots of Araku
          </h1>
          <p className="text-gold-300 text-lg font-light tracking-wider">
            Premium Organic Products
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-warm-200 text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed"
        >
          From tribal farmers to your table
        </motion.p>

        {/* Loading animation */}
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gold-400 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>

        {/* Pulse effect on main container */}
        <motion.div
          className="absolute inset-0 border-2 border-gold-400 rounded-2xl opacity-0"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        />
      </motion.div>

      {/* Bottom text */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <p className="text-warm-200 text-sm">Loading authentic organic goodness...</p>
      </motion.div>
    </motion.div>
  );
}
