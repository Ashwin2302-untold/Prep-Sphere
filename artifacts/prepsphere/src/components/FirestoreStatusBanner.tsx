import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, RefreshCw, Wifi, WifiOff, X } from "lucide-react";
import { useState } from "react";
import type { FirestoreStatus } from "@/hooks/useDashboardData";

interface Props {
  status: FirestoreStatus;
  onRetry: () => void;
}

const MESSAGES: Record<FirestoreStatus, { icon: typeof WifiOff; color: string; border: string; title: string; body: string } | null> = {
  ok: null,
  connecting: null,
  not_found: {
    icon: AlertTriangle,
    color: "text-amber-300",
    border: "border-amber-500/30 bg-amber-500/10",
    title: "Firestore database not found",
    body: 'Go to Firebase Console → your project → Firestore Database → click "Create database". Choose production or test mode, then click Retry below. Your progress is saved locally until then.',
  },
  offline: {
    icon: WifiOff,
    color: "text-orange-300",
    border: "border-orange-500/30 bg-orange-500/10",
    title: "Firestore is unreachable",
    body: "Working in offline mode. Your changes are saved locally and will sync when the connection is restored.",
  },
  error: {
    icon: AlertTriangle,
    color: "text-red-300",
    border: "border-red-500/30 bg-red-500/10",
    title: "Firestore connection error",
    body: "Could not connect to your database. Data is saved locally. Check your Firebase config and security rules.",
  },
};

export default function FirestoreStatusBanner({ status, onRetry }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const config = MESSAGES[status];

  if (!config || dismissed) return null;

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className={`relative rounded-xl border p-4 mb-6 ${config.border}`}
      >
        <button
          data-testid="button-dismiss-banner"
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-3 pr-6">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.color}`} />
          <div>
            <p className={`font-semibold text-sm ${config.color}`}>{config.title}</p>
            <p className="text-white/50 text-xs mt-1 leading-relaxed">{config.body}</p>

            {status === "not_found" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-firebase-console"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/30 transition-colors"
                >
                  Open Firebase Console
                </a>
                <button
                  data-testid="button-retry-firestore"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/60 border border-white/10 text-xs font-medium hover:bg-white/15 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry connection
                </button>
              </div>
            )}

            {status === "offline" && (
              <button
                data-testid="button-retry-firestore"
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/60 border border-white/10 text-xs font-medium hover:bg-white/15 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry connection
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
