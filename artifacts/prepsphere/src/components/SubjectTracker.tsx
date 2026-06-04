import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, StickyNote } from "lucide-react";
import { Chapter, ChapterStatus } from "@/hooks/useDashboardData";
import NoteModal from "@/components/NoteModal";

const STATUS_CONFIG: Record<ChapterStatus, { label: string; color: string; dot: string }> = {
  not_started: { label: "Not Started", color: "bg-white/10 text-white/55 border-white/15", dot: "bg-white/40" },
  in_progress: { label: "In Progress", color: "bg-yellow-500/25 text-yellow-200 border-yellow-500/35", dot: "bg-yellow-400" },
  completed:   { label: "Completed",   color: "bg-emerald-500/25 text-emerald-200 border-emerald-500/35", dot: "bg-emerald-400" },
  revised:     { label: "Revised",     color: "bg-purple-500/25 text-purple-200 border-purple-500/35", dot: "bg-purple-400" },
};

const STATUSES: ChapterStatus[] = ["not_started", "in_progress", "completed", "revised"];

interface SubjectTrackerProps {
  subject: string;
  subjectKey: string;
  icon: string;
  color: string;
  chapters: Chapter[];
  notes: Record<string, string>;
  onStatusChange: (index: number, status: ChapterStatus) => void;
  onSaveNote: (chapterIndex: number, note: string) => void;
}

export default function SubjectTracker({
  subject, subjectKey, icon, color, chapters, notes, onStatusChange, onSaveNote,
}: SubjectTrackerProps) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<ChapterStatus | "all">("all");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteChapterIdx, setNoteChapterIdx] = useState<number | null>(null);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = chapters.filter(c => c.status === s).length;
    return acc;
  }, {} as Record<ChapterStatus, number>);

  const progress = Math.round((counts.completed + counts.revised) / chapters.length * 100);
  const filtered = filter === "all" ? chapters : chapters.filter(c => c.status === filter);

  const openNote = (e: React.MouseEvent, realIdx: number) => {
    e.stopPropagation();
    setNoteChapterIdx(realIdx);
    setNoteOpen(true);
  };

  const activeChapter = noteChapterIdx !== null ? chapters[noteChapterIdx] : null;
  const activeNoteKey = noteChapterIdx !== null ? `${subjectKey}_${noteChapterIdx}` : "";
  const activeNote = activeNoteKey ? (notes[activeNoteKey] ?? "") : "";
  const totalNotes = Object.keys(notes).filter(k => k.startsWith(`${subjectKey}_`)).length;

  return (
    <>
      <div className="rounded-2xl card-glass overflow-hidden">
        <button
          data-testid={`subject-expand-${subject.toLowerCase()}`}
          className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-2xl">{icon}</span>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white subheading-shadow">{subject}</h3>
                {totalNotes > 0 && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    <StickyNote className="w-2.5 h-2.5" />
                    {totalNotes}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white/70">{counts.completed + counts.revised}/{chapters.length} done</span>
                {expanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
              </div>
            </div>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <div className="mt-1.5 flex gap-3 text-xs">
              <span className="text-yellow-300 font-medium">{counts.in_progress} in progress</span>
              <span className="text-emerald-300 font-medium">{counts.completed} done</span>
              <span className="text-purple-300 font-medium">{counts.revised} revised</span>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {(["all", ...STATUSES] as const).map(s => (
                    <button
                      key={s}
                      data-testid={`filter-${subject.toLowerCase()}-${s}`}
                      onClick={() => setFilter(s)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${
                        filter === s
                          ? "bg-white/25 text-white border-white/40 font-semibold"
                          : "bg-white/8 text-white/60 border-white/15 hover:border-white/30 hover:text-white/80"
                      }`}
                    >
                      {s === "all" ? "All" : STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 max-h-72 overflow-y-auto pr-1 custom-scroll">
                  {filtered.map((chapter) => {
                    const realIdx = chapters.indexOf(chapter);
                    const noteKey = `${subjectKey}_${realIdx}`;
                    const hasNote = !!(notes[noteKey]?.trim());
                    return (
                      <div
                        key={realIdx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/8 hover:bg-white/12 transition-colors group border border-white/8"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[chapter.status].dot}`} />
                          <span className="text-sm text-white/90 truncate">{chapter.name}</span>
                          {hasNote && (
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400" title="Has note" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <button
                            onClick={e => openNote(e, realIdx)}
                            title={hasNote ? "Edit note" : "Add note"}
                            className={`p-1.5 rounded-lg border transition-all ${
                              hasNote
                                ? "bg-violet-500/20 text-violet-300 border-violet-500/30 opacity-100"
                                : "bg-white/5 text-white/30 border-white/10 opacity-0 group-hover:opacity-100 hover:text-violet-300 hover:bg-violet-500/15 hover:border-violet-500/25"
                            }`}
                          >
                            <StickyNote className="w-3.5 h-3.5" />
                          </button>
                          <select
                            data-testid={`chapter-status-${realIdx}`}
                            value={chapter.status}
                            onChange={e => onStatusChange(realIdx, e.target.value as ChapterStatus)}
                            className="text-xs bg-white/12 border border-white/15 text-white/90 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:border-purple-400/60"
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s} className="bg-slate-900">{STATUS_CONFIG[s].label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeChapter && (
        <NoteModal
          open={noteOpen}
          chapterName={activeChapter.name}
          subjectIcon={icon}
          initialNote={activeNote}
          onSave={note => { if (noteChapterIdx !== null) onSaveNote(noteChapterIdx, note); }}
          onClose={() => setNoteOpen(false)}
        />
      )}
    </>
  );
}
