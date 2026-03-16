"use client";
import { CreditCard } from "lucide-react";
import { useState } from "react";

const AppointmentPayNowButton = ({ appointment }) => {
  const [loading, setLoading] = useState(false);
  const payableAmount = Number(appointment?.payment?.amount || 0);
  const payableCurrency = appointment?.payment?.currency || "BDT";

  const handlePay = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment?._id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to payment page
      } else {
        alert(data?.error || "Payment initiation failed. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting payment:", err);
      alert("Something went wrong while initiating payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePay}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer rounded-xl bg-primary text-white hover:bg-primary/90 transition"
      >
        <CreditCard size={16} />
        {loading
          ? "Processing..."
          : `Pay ${payableCurrency} ${payableAmount.toFixed(2)}`}
      </button>
    </>
  );
};

export default AppointmentPayNowButton;
