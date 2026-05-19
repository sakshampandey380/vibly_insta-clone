import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface AlertMessageProps {
  message: string;
  tone?: "danger" | "success" | "info";
  className?: string;
}

const styles = {
  danger: {
    icon: AlertTriangle,
    className: "border-rose-200 bg-rose-50/90 text-rose-700"
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50/90 text-emerald-700"
  },
  info: {
    icon: Sparkles,
    className: "border-sky-200 bg-sky-50/90 text-sky-700"
  }
};

export function AlertMessage({ message, tone = "danger", className }: AlertMessageProps) {
  const Icon = styles[tone].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{
        opacity: 1,
        y: 0,
        x: tone === "danger" ? [0, -5, 5, -4, 4, 0] : 0
      }}
      transition={{ duration: 0.45 }}
      className={cn(
        "rounded-3xl border px-4 py-3 text-sm font-medium shadow-soft",
        styles[tone].className,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
    </motion.div>
  );
}

