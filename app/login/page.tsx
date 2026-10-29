
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isSignup
        ? "/api/auth/signup"
        : "/api/auth/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong.");
        setMessageType("error");
        return;
      }

      if (isSignup) {
        setMessage("Account created successfully! Please log in.");
        setMessageType("success");
        setIsSignup(false);
        setPassword("");
      } else {
        router.replace("/");
        router.refresh();
      }
    } catch {
      setMessage("Unable to connect to the server. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b1120] px-5 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111827] p-8 shadow-2xl">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl">
            🚘
          </div>

          <h1 className="text-3xl font-bold tracking-wider">
            ROAD<span className="text-blue-400">WISE</span>
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Smart Car Rental & Vehicle Telemetry
          </p>
        </div>

        {/* Heading */}
        <h2 className="mb-2 text-xl font-semibold">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>

        <p className="mb-6 text-sm text-slate-400">
          {isSignup
            ? "Create an account to access ROADWISE."
            : "Log in to manage your rental operations."}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium">
              Username
            </label>

            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              required
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_]{3,50}"
              title="Use 3–50 letters, numbers, or underscores."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 outline-none transition focus:border-blue-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="Enter your password"
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 outline-none transition focus:border-blue-400"
            />
          </div>

          {message && (
            <p
              role="status"
              className={`rounded-lg p-3 text-sm ${
                messageType === "error"
                  ? "bg-red-950 text-red-300"
                  : "bg-green-950 text-green-300"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Log In"}
          </button>
        </form>

        {/* Switch between Login and Sign Up */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {isSignup
            ? "Already have an account?"
            : "New to ROADWISE?"}{" "}

          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
              setPassword("");
            }}
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Secure access · Role-based accounts
        </p>
      </div>
    </main>
  );
}
