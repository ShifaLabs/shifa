"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Heading from "@/shared/components/Shared/Heading/Heading";
import MotionDiv from "@/shared/components/Shared/MotionDiv/MotionDiv";

const faqs = [
  {
    question: "How can I book an appointment with a doctor?",
    answer:
      "You can book an appointment by selecting a doctor and clicking the 'Book Appointment' button. Fill in your details and confirm.",
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "Yes! Our app is available on both Android and iOS. You can download it from Google Play Store or the Apple App Store.",
  },
  {
    question: "Are the doctors verified?",
    answer:
      "Absolutely. All our doctors are verified and licensed professionals with their credentials available on their profiles.",
  },
  {
    question: "Can I consult online?",
    answer:
      "Yes, our platform supports online consultations via video call, chat, or voice call depending on the doctor's availability.",
  },
  {
    question: "What is the average waiting time?",
    answer:
      "The average waiting time to get an appointment is around 8 minutes.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Heading title="প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী" />

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <MotionDiv key={index}>
            <div className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200">
              <div
                className="flex justify-between items-center"
                onClick={() => toggle(index)}
              >
                <h3 className="font-medium text-lg">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
              {openIndex === index && (
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              )}
            </div>
          </MotionDiv>
        ))}
      </div>
    </div>
  );
}
