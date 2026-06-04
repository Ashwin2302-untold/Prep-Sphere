import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, FileText, Lightbulb } from "lucide-react";

interface NoteModalProps {
  open: boolean;
  chapterName: string;
  subjectIcon: string;
  initialNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
}

const FORMULA_HINTS = [
  "Tip: Use **bold** markers to highlight key formulas",
  "Tip: List important values on separate lines for quick scanning",
  "Tip: Start with 'Why it matters:' to add context to formulas",
  "Tip: Add [EXAM] tags for exam-specific points",
];

export default function NoteModal({ open, chapterName, subjectIcon, initialNote, onSave, onClose }: NoteModalProps) {
  const [text, setText] = useState(initialNote);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hint = FORMULA_HINTS[Math.floor(Math.random() * FORMULA_HINTS.length)];

  useEffect(() => {
    setText(initialNote);
    setSaved(false);
  }, [initialNote, open]);

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 150);
  }, [open]);

  const handleSave = () => {
    onSave(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleClear = () => {
    setText("");
    onSave("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") onClose();
  };

  const charCount = text.length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-[#0d0d1a] border-l border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
              <span className="text-2xl">{subjectIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-0.5">Notes & Formulae</p>
                <h2 className="text-sm font-bold text-white truncate">{chapterName}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hint bar */}
            <div className="flex items-start gap-2 px-5 py-2.5 bg-violet-500/8 border-b border-violet-500/15">
              <Lightbulb className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-violet-300/70">{hint}</p>
            </div>

            {/* Textarea */}
            <div className="flex-1 flex flex-col px-5 py-4 min-h-0">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => { setText(e.target.value); setSaved(false); }}
                onKeyDown={handleKeyDown}
                placeholder={`Write key formulas, derivations, or revision notes for ${chapterName}…\n\nExamples:\n• F = ma (Newton's 2nd law)\n• Impulse-momentum theorem: J = Δp\n• Remember: check sign convention for work done`}
                className="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/7 leading-relaxed font-mono transition-colors min-h-0"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-white/20">{charCount} chars · Ctrl+S to save</span>
                {text !== initialNote && !saved && (
                  <span className="text-[10px] text-amber-400/70">Unsaved changes</span>
                )}
                {saved && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] text-emerald-400"
                  >
                    Saved ✓
                  </motion.span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-5 py-4 border-t border-white/8">
              {text.length > 0 && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-400/70 border border-red-500/20 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  saved
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-violet-600 hover:bg-violet-500 text-white border border-violet-500"
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                {saved ? "Saved!" : "Save Note"}
              </button>
            </div>

            {/* Saved notes preview strip (if note exists) */}
            {initialNote.trim().length > 0 && (
              <div className="px-5 pb-4">
                <div className="rounded-lg bg-white/4 border border-white/8 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="w-3 h-3 text-white/30" />
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">Current saved note</span>
                  </div>
                  <p className="text-xs text-white/40 line-clamp-3 font-mono leading-relaxed whitespace-pre-wrap">{initialNote}</p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
