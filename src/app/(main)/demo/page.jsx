"use client";
import React from "react";

const Demo = () => {
  const handelSubmit = async (e) => {
    e.preventDefault();
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
    <div className="flex flex-col justify-center items-center">
      <h1>Pay Now</h1>
      <button
        onClick={handelSubmit}
        type="submit"
        className="px-6 py-3 bg-primary text-white rounded"
      >
        Pay Now
      </button>
    </div>
  );
};

export default Demo;
