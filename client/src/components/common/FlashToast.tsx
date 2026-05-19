import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, OctagonAlert, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/cn";

const toneStyles = {
  success: "border-emerald-200 bg-emerald-50/95 text-emerald-800",
  error: "border-rose-200 bg-rose-50/95 text-rose-800",
  info: "border-sky-200 bg-sky-50/95 text-sky-800"
} as const;

const toneIcons = {
  success: CheckCircle2,
  error: OctagonAlert,
  info: Info
} as const;

export function FlashToast() {
  const { flashMessage, dismissFlashMessage } = useAuth();

  return (
    <AnimatePresence>
      {flashMessage ? (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div
            className={cn(
              "glass-panel flex w-full max-w-md items-start gap-3 rounded-[1.5rem] border p-4 shadow-2xl",
              toneStyles[flashMessage.tone]
            )}
          >
            <div className="mt-0.5 rounded-full bg-white/75 p-1.5">
              {(() => {
                const Icon = toneIcons[flashMessage.tone];
                return <Icon className="h-4 w-4" />;
              })()}
            </div>
            <p className="flex-1 text-sm font-medium">{flashMessage.message}</p>
            <button type="button" onClick={dismissFlashMessage} className="rounded-full bg-white/75 p-1.5">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
