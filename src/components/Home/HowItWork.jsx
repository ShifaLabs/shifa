import React from "react";
import { UserPlus, Stethoscope, Calendar, FileText } from "lucide-react";
import Heading from "../Shared/Heading/Heading";
import MotionDiv from "../Shared/MotionDiv/MotionDiv";

const steps = [
  {
    icon: <UserPlus size={32} />,
    title: "অ্যাকাউন্ট তৈরি করুন",
    description:
      "Shifa প্ল্যাটফর্মে সহজভাবে নিবন্ধন করুন এবং প্রোফাইল সম্পূর্ণ করে আপনার স্বাস্থ্য সম্পর্কিত তথ্য দিন। এটি নিশ্চিত করে ডাক্তাররা আপনার স্বাস্থ্য ইতিহাস জানতে পারবেন।",
  },
  {
    icon: <Stethoscope size={32} />,
    title: "ডাক্তার নির্বাচন করুন",
    description:
      "আপনার রোগ অনুযায়ী বিশেষজ্ঞ ডাক্তার খুঁজুন। ডাক্তারদের প্রোফাইল, রেটিং এবং অভিজ্ঞতা দেখে সঠিক চিকিৎসক নির্বাচন করুন।",
  },
  {
    icon: <Calendar size={32} />,
    title: "অ্যাপয়েন্টমেন্ট বুক করুন",
    description:
      "ডাক্তারের উপলব্ধ সময় অনুযায়ী অ্যাপয়েন্টমেন্ট বুক করুন। সময় সাশ্রয় এবং দ্রুত চিকিৎসা নিশ্চিত করতে সহজ বুকিং সিস্টেম ব্যবহার করুন।",
  },
  {
    icon: <FileText size={32} />,
    title: "কনসালটেশন ও প্রেসক্রিপশন",
    description:
      "ভিডিও বা চ্যাটের মাধ্যমে অনলাইনে কনসালটেশন নিন। প্রয়োজন অনুযায়ী ডাক্তার ডিজিটাল প্রেসক্রিপশন প্রদান করবেন যা আপনার প্রোফাইলে সংরক্ষিত থাকবে।",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16">
      <Heading title="Shifa কিভাবে কাজ করে" />

      <div className="grid md:grid-cols-4 gap-2">
        {steps.map((step, index) => (
          <MotionDiv key={index}>
            <div className="p-6 rounded-xl shadow-lg border hover:shadow-2xl transition duration-300 text-center">
              <div className="flex justify-center mb-4 text-blue-600">
                {step.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              <div className="mt-4 inline-block px-4 py-1 bg-blue-100 text-blue-800 font-bold rounded-full">
                Step {index + 1}
              </div>
            </div>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
