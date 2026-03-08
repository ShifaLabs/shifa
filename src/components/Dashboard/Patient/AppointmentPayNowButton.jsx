"use client";
import { CreditCard } from "lucide-react";

const AppointmentPayNowButton = () => {
  const handlePay = async () => {
    try {
      const response = await fetch("/api/payment/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 500,
          customerName: "Sourov",
          // Include other necessary fields...
        }),
      });
      console.log(response);

      const data = await response.json();
      console.log(data);

      if (data.url) {
        window.location.href = data.url; // Redirect to payment page
      } else {
        alert("Payment initiation failed. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting payment:", err);
    }
  };
  return (
    <>
      <button
        onClick={handlePay}
        className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer rounded-xl bg-primary text-white hover:bg-primary/90 transition"
      >
        <CreditCard size={16} />
        Pay Now
      </button>
    </>
  );
};

export default AppointmentPayNowButton;
