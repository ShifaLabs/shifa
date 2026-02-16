import MyComponent from "@/components/Navigation/Navbar/Header/MobileMenu/RightDrawer";
import { Button, Drawer } from "@/components/ui/drawer";
import React from "react";

const page = () => {
  return (
    <div className=" h-screen w-full align-middle items-center text-3xl flex justify-center">
      <h1 className=" text-center font-bold ">
        Welcome to SHIFA from the developer team!
      </h1>
      <MyComponent />
    </div>
  );
};

export default page;
