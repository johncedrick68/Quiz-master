import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './Button';

interface CardProps extends Omit<HTMLMotionProps<"div">, "className"> {
  className?: string;
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hoverEffect = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : undefined}
        className={cn(
          'bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-xl',
          hoverEffect && 'hover:border-primary-500/50 hover:shadow-primary-500/10 transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';
