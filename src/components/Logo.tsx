import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showText?: boolean;
  onClick?: () => void;
}

export default function Logo({ size = 'md', animated = false, showText = true, onClick }: LogoProps) {
  const sizeMap = {
    sm: { icon: 20, text: 'text-sm' },
    md: { icon: 32, text: 'text-base' },
    lg: { icon: 48, text: 'text-lg' },
    xl: { icon: 64, text: 'text-2xl' },
  };

  const iconSize = sizeMap[size].icon;
  const textSize = sizeMap[size].text;

  const iconVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    hover: animated ? { y: -4 } : {},
    bounce: animated ? {
      y: [0, -8, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    } : {},
  };

  return (
    <div onClick={onClick} className={animated ? 'cursor-pointer' : ''}>
      <div className="flex items-center gap-2">
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate={animated ? ['animate', 'bounce'] : 'animate'}
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <Leaf size={iconSize} className="text-gold-400" strokeWidth={1.5} />
        </motion.div>

        {showText && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className={`font-bold text-gold-300 ${textSize}`}>
              Roots of
              <br />
              Araku
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
