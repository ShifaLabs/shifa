import Container from "@/components/Navigation/Navbar/Container/Container";
import { authOptions } from "@/features/Auth/auth.config";

import { getServerSession } from "next-auth";

async function page() {
  const session = await getServerSession(authOptions);
  console.log("session", session);
  return (
    <Container>
      <section className="py-16 px-6 md:px-0">
        {/* Page Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-bold">Shifa সম্পর্কে</h1>
          <p className="mt-4 text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Shifa একটি আধুনিক টেলিমেডিসিন প্ল্যাটফর্ম যা প্রযুক্তির মাধ্যমে
            স্বাস্থ্যসেবাকে সহজ, দ্রুত এবং নির্ভরযোগ্য করার লক্ষ্য নিয়ে তৈরি করা
            হয়েছে। Shifa বিশ্বাস করে প্রত্যেক মানুষ মানসম্মত চিকিৎসা সেবা পাওয়ার
            অধিকার রাখে এবং সেই লক্ষ্যেই আমরা কাজ করে যাচ্ছি।
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">
            Shifa প্ল্যাটফর্ম সম্পর্কে
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Shifa এমনভাবে ডিজাইন করা হয়েছে যাতে রোগীরা ঘরে বসেই অভিজ্ঞ
            চিকিৎসকদের সাথে সহজে যোগাযোগ করতে পারেন। দূরত্ব, সময় এবং যাতায়াতের
            সীমাবদ্ধতা দূর করে Shifa স্বাস্থ্যসেবাকে সবার কাছে পৌঁছে দিতে কাজ
            করছে।
          </p>
          <p className="text-gray-600 leading-relaxed">
            Shifa ব্যবহারকারীদের ভিডিও কনসাল্টেশন, অডিও কনসাল্টেশন, ডিজিটাল
            প্রেসক্রিপশন এবং প্রয়োজনীয় স্বাস্থ্য পরামর্শ প্রদান করে। আধুনিক
            প্রযুক্তির মাধ্যমে Shifa রোগী এবং চিকিৎসকের মধ্যে একটি কার্যকর ও
            নির্ভরযোগ্য সংযোগ তৈরি করেছে।
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Shifa এর লক্ষ্য</h3>
            <p className="text-gray-600 leading-relaxed">
              প্রযুক্তির মাধ্যমে স্বাস্থ্যসেবাকে আরও সহজলভ্য এবং কার্যকর করা
              Shifa এর প্রধান লক্ষ্য। আমরা এমন একটি ডিজিটাল প্ল্যাটফর্ম গড়ে
              তুলতে চাই যেখানে রোগীরা সহজেই চিকিৎসকের সাথে যোগাযোগ করতে পারবেন
              এবং দ্রুত প্রয়োজনীয় স্বাস্থ্যসেবা গ্রহণ করতে পারবেন।
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Shifa এর ভিশন</h3>
            <p className="text-gray-600 leading-relaxed">
              Shifa একটি প্রযুক্তিনির্ভর স্বাস্থ্যসেবা ব্যবস্থা গড়ে তুলতে চায়
              যেখানে রোগী ও চিকিৎসকের মধ্যে যোগাযোগ হবে নিরাপদ, দ্রুত এবং
              নির্ভরযোগ্য। ভবিষ্যতে Shifa উন্নত ডিজিটাল স্বাস্থ্যসেবা প্রদান এবং
              আন্তর্জাতিক পর্যায়ে সেবা সম্প্রসারণের লক্ষ্য নিয়ে কাজ করছে।
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Shifa এর সেবাসমূহ</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h4 className="font-semibold text-lg mb-3">
                অনলাইন ডাক্তার পরামর্শ
              </h4>
              <p className="text-gray-600">
                Shifa এর মাধ্যমে রোগীরা ঘরে বসেই অভিজ্ঞ চিকিৎসকদের কাছ থেকে
                চিকিৎসা পরামর্শ নিতে পারেন।
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <h4 className="font-semibold text-lg mb-3">
                ভিডিও ও অডিও কনসাল্টেশন
              </h4>
              <p className="text-gray-600">
                Shifa রোগীদের সরাসরি ভিডিও বা অডিও মাধ্যমে চিকিৎসকের সাথে
                যোগাযোগের সুবিধা প্রদান করে।
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <h4 className="font-semibold text-lg mb-3">
                ডিজিটাল প্রেসক্রিপশন
              </h4>
              <p className="text-gray-600">
                Shifa চিকিৎসকের দেওয়া প্রেসক্রিপশন নিরাপদভাবে সংরক্ষণ এবং
                ভবিষ্যতে পুনরায় ব্যবহারের সুযোগ দেয়।
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">
            কেন Shifa ব্যবহার করবেন
          </h2>

          <ul className="space-y-4 text-gray-600 leading-relaxed">
            <li>
              Shifa একটি সহজ এবং ব্যবহারবান্ধব প্ল্যাটফর্ম যা সকল বয়সের মানুষের
              জন্য উপযোগী।
            </li>
            <li>
              Shifa অভিজ্ঞ ও বিশেষজ্ঞ চিকিৎসকদের মাধ্যমে মানসম্মত চিকিৎসা সেবা
              প্রদান করে।
            </li>
            <li>
              Shifa ব্যবহারকারীর ব্যক্তিগত তথ্য ও স্বাস্থ্য তথ্য সর্বোচ্চ
              নিরাপত্তায় সংরক্ষণ করে।
            </li>
            <li>
              Shifa দ্রুত চিকিৎসা সেবা গ্রহণের সুযোগ তৈরি করে যা সময় এবং খরচ
              সাশ্রয় করে।
            </li>
          </ul>
        </div>

        {/* Commitment */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Shifa এর প্রতিশ্রুতি</h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Shifa সর্বদা ব্যবহারকারীদের জন্য নিরাপদ, নির্ভরযোগ্য এবং মানসম্মত
            স্বাস্থ্যসেবা নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। প্রযুক্তির উন্নয়নের সাথে
            সাথে Shifa নিয়মিত তার সেবার মান উন্নত করার জন্য কাজ করে যাচ্ছে।
          </p>
        </div>
      </section>
    </Container>
  );
}

export default page;
