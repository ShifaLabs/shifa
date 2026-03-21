"use client";
import React from "react";
import Link from "next/link";

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

      const data = await response.json();

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
    <div className="flex flex-col justify-center items-center min-h-screen gap-8 p-8">
      <h1 className="text-3xl font-bold">Demo & Testing</h1>

      {/* Payment Demo */}
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Payment Demo</h2>
        <p className="text-gray-600 mb-4">Test the payment integration</p>
        <button
          onClick={handelSubmit}
          type="submit"
          className="w-full px-6 py-3 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
        >
          Pay Now
        </button>
      </div>

      {/* Video Call Demo */}
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Video Call Demo</h2>
        <p className="text-gray-600 mb-4">
          Test the video consultation functionality with multiple users
        </p>
        <Link
          href="/demo/video-call"
          className="block w-full px-6 py-3 bg-green-600 text-white rounded text-center hover:bg-green-700 transition-colors"
        >
          Try Video Call
        </Link>
      </div>
    </div>
  );
};

export default Demo;
