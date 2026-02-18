"use client";
import { useState } from "react";

const faqs = [
  {
    question: "How fast does Shifa respond?",
    answer: "Our team usually responds within 24 hours.",
  },
  {
    question: "কি আমি জরুরি চিকিৎসা এখানে পেতে পারি?",
    answer: "না। জীবন-ঝুঁকিপূর্ণ অবস্থার জন্য নিকটস্থ হাসপাতালে যান।",
  },
  {
    question: "Is my medical data secure?",
    answer: "Yes. All communications are encrypted and securely stored.",
  },
];

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="bg-muted/40 py-20 mt-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-6 cursor-pointer"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <h3 className="font-medium">{faq.question}</h3>

              {openIndex === index && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
