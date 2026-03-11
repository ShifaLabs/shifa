"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  CallControls,
  SpeakerLayout,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

export default function DemoVideoCallPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [callInfo, setCallInfo] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Initialize demo call
  useEffect(() => {
    if (status === "authenticated") {
      initDemoCall();
    }
  }, [status]);

  const initDemoCall = async () => {
    try {
      const response = await fetch("/api/video/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "init" }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize demo call");
      }

      const data = await response.json();
      setCallInfo(data);
    } catch (err) {
      console.error("Error initializing demo call:", err);
      setError(err.message || "Failed to initialize demo call");
    }
  };

  const handleJoinCall = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError("");

      // Get token to join
      const tokenRes = await fetch("/api/video/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      });

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json();
        throw new Error(errorData?.error || "Unable to join call");
      }

      const tokenData = await tokenRes.json();

      // Create Stream Video client
      const streamClient = new StreamVideoClient({
        apiKey: tokenData.apiKey,
        user: {
          id: session.user.id,
          name: session.user.name || "Demo User",
          role: session.user.role,
        },
        token: tokenData.token,
      });

      // Get or create the call
      const streamCall = streamClient.call("default", tokenData.callId);
      await streamCall.join({ create: true });

      setClient(streamClient);
      setCall(streamCall);
      setHasJoined(true);
    } catch (err) {
      console.error("Error joining call:", err);
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCall = async () => {
    if (call) {
      await call.leave();
    }
    if (client) {
      await client.disconnectUser();
    }
    setClient(null);
    setCall(null);
    setHasJoined(false);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Video Call Demo</h1>
          <p className="text-gray-600">
            Test the video calling functionality. Open this page in two
            different browsers (or incognito mode) with different user roles to
            test the functionality.
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{session.user.name || "Demo User"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{session.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium capitalize">
                {session.user.role || "user"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Join Call Section */}
        {!hasJoined ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Ready to join?</h3>
              <p className="text-gray-600 mb-6">
                Click the button below to join the demo video consultation
              </p>
            </div>
            <button
              onClick={handleJoinCall}
              disabled={loading}
              className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Joining Call..." : "Join Call"}
            </button>
          </div>
        ) : (
          /* Video Call Interface */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {client && call ? (
              <StreamVideo client={client}>
                <StreamCall call={call}>
                  <div className="relative">
                    <div className="min-h-150 bg-gray-900">
                      <SpeakerLayout />
                    </div>
                    <div className="bg-white border-t p-4">
                      <CallControls onLeave={handleLeaveCall} />
                    </div>
                  </div>
                </StreamCall>
              </StreamVideo>
            ) : (
              <div className="flex items-center justify-center min-h-100">
                <p className="text-gray-600">Initializing video call...</p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">
            Testing Instructions
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Open this page in two different browsers or use incognito mode
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Log in with different accounts (one as doctor, one as patient)
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Click &ldquo;Join Call&rdquo; on both browsers to start the
                video session
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Test video, audio, and call controls functionality</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
