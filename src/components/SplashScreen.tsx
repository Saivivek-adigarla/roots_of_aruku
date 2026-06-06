import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.5 },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.5, rotateZ: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateZ: 0,
      transition: {
        delay: 0.3,
        duration: 1,
        type: 'spring',
        stiffness: 80,
        damping: 15,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-black via-maroon-900 to-maroon-800 flex items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-80 h-80 bg-gold-400 rounded-full opacity-10 blur-3xl"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -50, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-80 h-80 bg-warm-500 rounded-full opacity-10 blur-3xl"
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-300 rounded-full opacity-5 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo with glow effect */}
        <motion.div
          className="relative mb-12"
          variants={logoVariants}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-gold-400 to-warm-400 rounded-2xl opacity-0 blur-2xl"
            animate={{
              opacity: [0, 0.3, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.img
            src="/image.png"
            alt="Roots of Araku Logo"
            className="h-64 w-auto mx-auto drop-shadow-2xl relative z-10"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.div
          variants={textVariants}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-light text-gold-300 tracking-wide mb-2">
            Premium Organic Products
          </h2>
          <p className="text-warm-300 text-lg font-light">
            From tribal farmers to your table
          </p>
        </motion.div>

        {/* Loading animation */}
        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-gold-400 to-warm-400 rounded-full"
              animate={{
                y: [0, -12, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom text with animation */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8 }}
      >
        <motion.p
          className="text-warm-300 text-sm font-light"
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          Preparing authentic organic excellence...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

