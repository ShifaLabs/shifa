import { authOptions } from "@/features/Auth/auth.config";
import { hindSiliguri } from "../layout";
import { getServerSession } from "next-auth";

const page = async () => {
  const session = await getServerSession(authOptions);
  console.log(session);

  return (
    <div className=" h-screen  w-full align-middle items-center text-3xl flex justify-center flex-col">
      <h1 className=" text-center font-bold ">
        Welcome to SHIFA from the developer team!
      </h1>
      <p
        className={`${hindSiliguri.className} text-2xl font-semibold mt-4 text-center`}
      >
        উন্নত ও সহজলভ্য স্বাস্থ্যসেবার জন্য আপনার নির্ভরযোগ্য টেলিমেডিসিন
        প্ল্যাটফর্ম।
      </p>
    </div>
  );
};

export default page;
