"use client";

import { motion } from "framer-motion";

const Heading = ({ title, subtitle }) => {


  return (
    <header className="text-center my-8">
      {/* Motion Heading */}
      <motion.h1
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-4xl md:text-3xl font-bold mb-4 tracking-tight text-gray-900"
      >
        {title}
      </motion.h1>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-2 text-lg md:text-base text-gray-600 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </header>
  );
};

export default Heading;
