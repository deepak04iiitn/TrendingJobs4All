import { motion, useReducedMotion } from 'framer-motion';

/** Shared easing - soft deceleration, never snappy */
export const easeOut = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

/**
 * One-shot scroll reveal. Keeps motion light and consistent across Home.
 */
export function Reveal({
  children,
  className = '',
  as = 'div',
  delay = 0,
  y = 22,
  once = true,
  amount = 0.25,
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.65, delay, ease: easeOut }}
    >
      {children}
    </MotionTag>
  );
}
