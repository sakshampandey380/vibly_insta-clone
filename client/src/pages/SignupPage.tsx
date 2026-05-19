import { motion } from "framer-motion";
import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Logo } from "../components/common/Logo";
import { AlertMessage } from "../components/common/AlertMessage";
import { useAuth } from "../contexts/AuthContext";

export function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    bio: ""
  });
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<Key extends keyof typeof form>(field: Key, value: (typeof form)[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    try {
      await signup(form);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel hidden rounded-[2rem] p-8 shadow-soft xl:block"
          >
            <Logo showTagline />
            <h1 className="headline-font mt-8 max-w-lg text-5xl font-semibold leading-tight text-text">
              Build your presence with a profile that already feels premium.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              Usernames, email, phone, and verification-ready account fields are structured from the first phase,
              so your app can scale cleanly into a real platform.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="glass-panel-strong rounded-[2rem] p-6 shadow-glow sm:p-8"
          >
            <Logo compact className="mb-6 xl:hidden" />
            <div>
              <h2 className="headline-font text-3xl font-semibold text-text">Create Account</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Start with the essentials and land directly on your own profile after signup.
              </p>
            </div>
            {error && <AlertMessage message={error} className="mt-5" />}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} placeholder="Full name" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
              <input value={form.username} onChange={(event) => setField("username", event.target.value)} placeholder="Username" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
              <input value={form.email} onChange={(event) => setField("email", event.target.value)} placeholder="Email" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
              <input value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="Phone number" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
              <input value={form.password} onChange={(event) => setField("password", event.target.value)} type="password" placeholder="Password" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
              <input value={form.confirmPassword} onChange={(event) => setField("confirmPassword", event.target.value)} type="password" placeholder="Confirm password" className="w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow" />
            </div>
            <textarea
              value={form.bio}
              onChange={(event) => setField("bio", event.target.value)}
              placeholder="Bio (optional)"
              rows={4}
              className="mt-4 w-full rounded-[1.6rem] border border-white/70 bg-white/80 px-4 py-4 text-sm outline-none transition focus:border-primary/30 focus:shadow-glow"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-[1.6rem] bg-gradient-to-r from-indigo-600 via-violet-500 to-pink-500 px-4 py-4 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-70"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </motion.form>
        </div>
      </div>
    </Layout>
  );
}

