import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Logo } from "../components/common/Logo";
import { AlertMessage } from "../components/common/AlertMessage";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const locationState = (location.state as { from?: string } | null) ?? null;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    try {
      await login({ identifier, password });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel hidden rounded-[2rem] p-8 shadow-soft xl:block"
          >
            <Logo showTagline />
            <h1 className="headline-font mt-8 max-w-xl text-5xl font-semibold leading-tight text-text">
              Step back into your aesthetic social world.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Vibly gives you a polished public feed, protected social actions, smooth conversations,
              and a soft glassmorphism interface designed for modern creators.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {["Public home feed", "Animated reactions", "Profile-first experience"].map((item) => (
                <div key={item} className="rounded-[1.6rem] bg-white/75 p-4 text-sm font-medium text-text">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="glass-panel-strong rounded-[2rem] p-6 shadow-glow sm:p-8"
          >
            <Logo compact className="mb-6 xl:hidden" />
            <div>
              <h2 className="headline-font text-3xl font-semibold text-text">Login</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Use your email or username and password to enter your dashboard.
              </p>
              {locationState?.from && (
                <p className="mt-2 text-xs font-medium text-primary">
                  Continue back to: {locationState.from}
                </p>
              )}
            </div>
            {error && <AlertMessage message={error} className="mt-5" />}
            <div className="mt-6 space-y-4">
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Email or username"
                className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow"
              />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Password"
                className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow"
              />
            </div>
            <div className="mt-4 rounded-[1.4rem] bg-sky-50/80 px-4 py-3 text-sm text-sky-700">
              Demo login: <span className="font-semibold">ariana.glow</span> /{" "}
              <span className="font-semibold">demo12345</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-[1.6rem] bg-gradient-to-r from-indigo-600 via-violet-500 to-pink-500 px-4 py-4 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-70"
            >
              {isSubmitting ? "Logging you in..." : "Login"}
            </button>
          </motion.form>
        </div>
      </div>
    </Layout>
  );
}
