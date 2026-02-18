"use client"; // For Framer Motion animations

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HeartPulse,
  ShieldCheck,
  Users,
  Video,
  Clock,
  FileText,
  ChevronRight,
  Stethoscope,
  Lock,
  Activity,
} from "lucide-react";

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

export default function AboutPage() {
  return (
    <main className="bg-background min-h-screen xl:px-20 lg:px-16 md:px-10 sm:px-6 px-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-primary bg-primary/10 border-primary/20 hover:bg-primary/20 transition-colors"
            >
              Shifa — আপনার ডিজিটাল স্বাস্থ্যসাথী
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              প্রযুক্তির মাধ্যমে{" "}
              <span className="text-primary italic mr-1">স্বাস্থ্যসেবাকে </span>{" "}
              সহজ করছি
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Shifa একটি আধুনিক টেলিমেডিসিন প্ল্যাটফর্ম যা প্রযুক্তির মাধ্যমে
              স্বাস্থ্যসেবাকে সহজ, দ্রুত এবং নির্ভরযোগ্য করার লক্ষ্য নিয়ে তৈরি
              করা হয়েছে।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                className="rounded-full px-10 py-7 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                ডাক্তার খুঁজুন <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-10 py-7 text-lg border-2"
              >
                আমাদের সম্পর্কে
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="max-w-7xl mx-auto px-4 ">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 p-8 md:p-12 bg-secondary/50 rounded-[2.5rem] border border-primary/5 backdrop-blur-sm"
        >
          {[
            {
              label: "সন্তুষ্ট রোগী",
              value: "১০,০০০+",
              icon: <Users className="w-5 h-5" />,
            },
            {
              label: "বিশেষজ্ঞ ডাক্তার",
              value: "৫০০+",
              icon: <Stethoscope className="w-5 h-5" />,
            },
            {
              label: "সফল কনসাল্টেশন",
              value: "৫০,০০০+",
              icon: <Activity className="w-5 h-5" />,
            },
            {
              label: "সাপোর্ট",
              value: "২৪/৭",
              icon: <Clock className="w-5 h-5" />,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              className="flex flex-col items-center text-center space-y-2"
            >
              <div className="p-3 bg-white rounded-2xl shadow-sm text-primary mb-2">
                {stat.icon}
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-primary tracking-tighter">
                {stat.value}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground font-semibold uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Core Services - Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 py-24 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
            আমাদের সেবাসমূহ
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            আধুনিক প্রযুক্তির সমন্বয়ে আমরা দিচ্ছি আপনার প্রয়োজনীয় সকল
            স্বাস্থ্যসেবা।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceCard
            className="md:col-span-2 bg-primary text-white"
            icon={<Video className="w-10 h-10 text-white" />}
            title="ভিডিও কনসাল্টেশন"
            desc="সরাসরি ভিডিও কলের মাধ্যমে দেশের শীর্ষস্থানীয় এবং অভিজ্ঞ চিকিৎসকের পরামর্শ নিন আপনার ঘরে বসেই। কোনো যাতায়াত ঝামেলা ছাড়াই।"
            light
          />
          <ServiceCard
            icon={<FileText className="w-10 h-10 text-primary" />}
            title="ডিজিটাল প্রেসক্রিপশন"
            desc="আপনার সকল প্রেসক্রিপশন এখন এক জায়গায়। আজীবনের জন্য সুরক্ষিত থাকবে আমাদের ক্লাউডে।"
          />
          <ServiceCard
            icon={<Clock className="w-10 h-10 text-primary" />}
            title="২৪/৭ ইমার্জেন্সি সাপোর্ট"
            desc="মধ্যরাতে প্রয়োজন? আমাদের ডাক্তাররা ২৪ ঘণ্টা আপনার সেবায় নিয়োজিত।"
          />
          <ServiceCard
            className="md:col-span-2"
            icon={<ShieldCheck className="w-10 h-10 text-primary" />}
            title="স্মার্ট হেলথ মনিটরিং"
            desc="আপনার স্বাস্থ্যের নিয়মিত আপডেট রাখুন এবং অটোমেটেড রিপোর্ট জেনারেট করুন সরাসরি অ্যাপ থেকেই।"
          />
        </div>
      </section>

      {/* Trust & Security */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-slate-900 rounded-[3rem] overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="flex flex-col lg:flex-row items-center gap-12 p-8 md:p-20 relative z-10">
            <div className="lg:w-1/2 space-y-8">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Data Privacy Verified
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                আপনার সুরক্ষা ও গোপনীয়তা আমাদের মূল লক্ষ্য
              </h2>
              <div className="grid gap-6">
                <div className="flex gap-5 group">
                  <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <Lock className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      এন্ড-টু-এন্ড এনক্রিপশন
                    </h4>
                    <p className="text-slate-400">
                      আপনার ভিডিও কল এবং চ্যাট সম্পূর্ণ এনক্রিপ্টেড থাকে।
                    </p>
                  </div>
                </div>
                <div className="flex gap-5 group">
                  <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <ShieldCheck className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      বিএমডিসি নিবন্ধিত ডাক্তার
                    </h4>
                    <p className="text-slate-400">
                      প্রতিটি ডাক্তার ভেরিফাইড এবং সরকারি নিবন্ধনপ্রাপ্ত
                      বিশেষজ্ঞ।
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full aspect-square lg:aspect-video bg-linear-to-br from-primary/20 to-primary/5 rounded-3xl border border-white/10 flex items-center justify-center">
              <HeartPulse size={120} className="text-primary animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  className?: string;
  light?: boolean;
}

function ServiceCard({
  icon,
  title,
  desc,
  className,
  light = false,
}: ServiceCardProps) {
  return (
    <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
      <Card
        className={`h-full border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden ${className}`}
      >
        <CardContent className="p-10 space-y-6">
          <div
            className={`p-4 w-fit rounded-2xl ${light ? "bg-white/20" : "bg-primary/10"}`}
          >
            {icon}
          </div>
          <div className="space-y-3">
            <h3
              className={`text-2xl font-bold ${light ? "text-white" : "text-slate-900"}`}
            >
              {title}
            </h3>
            <p
              className={`leading-relaxed ${light ? "text-white/80" : "text-muted-foreground"}`}
            >
              {desc}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
