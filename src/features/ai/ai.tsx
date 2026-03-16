"use client";

import { useEffect, useState } from "react";

function Ai() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({
            message: "I have skin rash and itching",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setStatus("done");
      } catch (error) {
        console.error("AI request failed:", error);
        setStatus("error");
      }
    };

    run();
  }, []);

  return <div>{status === "loading" ? "ai loading..." : "ai"}</div>;
}

export default Ai;
