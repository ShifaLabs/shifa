"use client";

import { motion } from "framer-motion";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} // Starts invisible and slightly lower
      animate={{ opacity: 1, y: 0 }} // Fades in and moves to position
      exit={{ opacity: 0, y: -10 }} // Optional: Fades out and moves up
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
