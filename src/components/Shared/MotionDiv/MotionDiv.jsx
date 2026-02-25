"use client";

import { motion } from "framer-motion";

export default function MotionDiv({ children }) {
  const defaultAnimation = {
    initial: { opacity: 0, y: 100 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 1, ease: "easeOut" },
  };

  const motionProps = defaultAnimation;

  return <motion.div {...motionProps}>{children}</motion.div>;
}
