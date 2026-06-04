import type { DashboardData } from "@/hooks/useDashboardData";

interface ExamDef {
  title: string;
  targetDate: string;
  subjects: string[];
}

function daysBetween(dateStr: string) {
  return Math.max(0, Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

function daysStuck(ts: string) {
  return Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
}

function pct(n: number, d: number) {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

function barHTML(value: number, color: string) {
  const safe = Math.min(Math.max(value, 0), 100);
  return `<div style="background:#1e1e2e;border-radius:4px;height:6px;overflow:hidden;margin-top:4px;">
    <div style="width:${safe}%;height:100%;background:${color};border-radius:4px;"></div>
  </div>`;
}

export function generateReport(data: DashboardData, exams: ExamDef[], userName: string): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const subjects = ["physics", "chemistry", "mathematics", "biology"] as const;
  const subjectMeta: Record<string, { label: string; icon: string; color: string }> = {
    physics:     { label: "Physics",     icon: "⚛️",  color: "#60a5fa" },
    chemistry:   { label: "Chemistry",   icon: "🧪", color: "#34d399" },
    mathematics: { label: "Mathematics", icon: "📐", color: "#fbbf24" },
    biology:     { label: "Biology",     icon: "🧬", color: "#f472b6" },
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  let totalCh = 0, doneCh = 0, inProgressCh = 0;
  subjects.forEach(sub => {
    data[sub].chapters.forEach(ch => {
      totalCh++;
      if (ch.status === "completed" || ch.status === "revised") doneCh++;
      if (ch.status === "in_progress") inProgressCh++;
    });
  });
  const completionPct = pct(doneCh, totalCh);

  const tests = data.mockTests ?? [];
  const avgScore = tests.length > 0
    ? Math.round(tests.reduce((s, t) => s + pct(t.score, t.total), 0) / tests.length)
    : null;

  const notesCount = Object.keys(data.chapterNotes ?? {}).filter(k => (data.chapterNotes[k] ?? "").trim()).length;

  // Streak
  const start = new Date(data.streakStartDate ?? now);
  const streak = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));

  // ── Weak topics ────────────────────────────────────────────────────────────
  const weakTopics: { subject: string; name: string; days: number }[] = [];
  subjects.forEach(sub => {
    data[sub].chapters.forEach((ch, idx) => {
      if (ch.status !== "in_progress") return;
      const key = `${sub}_${idx}`;
      const ts = data.chapterTimestamps?.[key];
      if (!ts) return;
      const days = daysStuck(ts);
      if (days < 7) return;
      const snoozedUntil = data.snoozedChapters?.[key];
      if (snoozedUntil && new Date(snoozedUntil) > now) return;
      weakTopics.push({ subject: subjectMeta[sub].label, name: ch.name, days });
    });
  });
  weakTopics.sort((a, b) => b.days - a.days);

  // ── Per-subject rows ───────────────────────────────────────────────────────
  const subjectRows = subjects.map(sub => {
    const chs = data[sub].chapters;
    const done = chs.filter(c => c.status === "completed" || c.status === "revised").length;
    const ip = chs.filter(c => c.status === "in_progress").length;
    const p = pct(done, chs.length);
    const noteCount = Object.keys(data.chapterNotes ?? {}).filter(k => k.startsWith(`${sub}_`) && (data.chapterNotes[k] ?? "").trim()).length;
    const m = subjectMeta[sub];
    return `
      <tr>
        <td style="padding:10px 12px;font-size:13px;">${m.icon} ${m.label}</td>
        <td style="padding:10px 12px;text-align:center;font-size:13px;">${chs.length}</td>
        <td style="padding:10px 12px;text-align:center;font-size:13px;color:#34d399;font-weight:600;">${done}</td>
        <td style="padding:10px 12px;text-align:center;font-size:13px;color:#fbbf24;">${ip}</td>
        <td style="padding:10px 12px;min-width:120px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:12px;color:${m.color};font-weight:700;min-width:32px;">${p}%</span>
            ${barHTML(p, m.color)}
          </div>
        </td>
        <td style="padding:10px 12px;text-align:center;font-size:13px;color:#a78bfa;">${noteCount}</td>
      </tr>`;
  }).join("");

  // ── Mock test rows ─────────────────────────────────────────────────────────
  const mockRows = tests.slice(-8).reverse().map(t => {
    const p2 = pct(t.score, t.total);
    const color = p2 >= 75 ? "#34d399" : p2 >= 50 ? "#fbbf24" : "#f87171";
    return `<tr>
      <td style="padding:8px 12px;font-size:12px;">${new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}</td>
      <td style="padding:8px 12px;font-size:12px;">${t.exam}</td>
      <td style="padding:8px 12px;text-align:center;font-size:12px;font-weight:700;color:${color};">${t.score}/${t.total}</td>
      <td style="padding:8px 12px;text-align:center;font-size:12px;font-weight:700;color:${color};">${p2}%</td>
    </tr>`;
  }).join("");

  // ── Exam countdown rows ────────────────────────────────────────────────────
  const examRows = exams.map(e => {
    const days = daysBetween(e.targetDate);
    const urgency = days < 90 ? "#f87171" : days < 180 ? "#fbbf24" : "#34d399";
    return `<tr>
      <td style="padding:8px 12px;font-size:12px;font-weight:600;">${e.title}</td>
      <td style="padding:8px 12px;font-size:12px;">${new Date(e.targetDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</td>
      <td style="padding:8px 12px;text-align:center;font-size:13px;font-weight:700;color:${urgency};">${days}d</td>
    </tr>`;
  }).join("");

  // ── Weak topics list ───────────────────────────────────────────────────────
  const weakRows = weakTopics.length > 0
    ? weakTopics.map(w => {
        const color = w.days >= 21 ? "#f87171" : w.days >= 14 ? "#fb923c" : "#fbbf24";
        return `<tr>
          <td style="padding:8px 12px;font-size:12px;">${w.name}</td>
          <td style="padding:8px 12px;font-size:12px;">${w.subject}</td>
          <td style="padding:8px 12px;text-align:center;font-size:12px;font-weight:700;color:${color};">${w.days}d stuck</td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="3" style="padding:12px;text-align:center;font-size:12px;color:#6b7280;">No weak topics — great work! 🎉</td></tr>`;

  // ── Notes preview ──────────────────────────────────────────────────────────
  const noteEntries = Object.entries(data.chapterNotes ?? {})
    .filter(([, v]) => v?.trim())
    .slice(0, 6);

  const notesSection = noteEntries.length > 0
    ? noteEntries.map(([key, note]) => {
        const [sub, idx] = key.split("_");
        const subData = data[sub as typeof subjects[number]];
        const chName = subData?.chapters[Number(idx)]?.name ?? key;
        const m = subjectMeta[sub] ?? { icon: "📖", label: sub, color: "#a78bfa" };
        const preview = note.length > 200 ? note.slice(0, 200) + "…" : note;
        return `<div style="margin-bottom:10px;padding:10px 12px;background:#12121f;border-radius:8px;border-left:3px solid ${m.color};">
          <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">${m.icon} ${m.label} · ${chName}</div>
          <div style="font-size:12px;color:#cbd5e1;white-space:pre-wrap;font-family:monospace;line-height:1.6;">${preview}</div>
        </div>`;
      }).join("")
    : `<p style="font-size:12px;color:#6b7280;text-align:center;padding:12px;">No notes saved yet.</p>`;

  // ── Full HTML ──────────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>PrepSphere Report — ${userName} — ${dateStr}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a14; color: #e2e8f0; font-family: 'Segoe UI', system-ui, sans-serif; padding: 32px; }
  h1, h2, h3 { line-height: 1.2; }
  table { width: 100%; border-collapse: collapse; }
  tr:nth-child(even) { background: #0f0f1e; }
  th { background: #12121f; color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; padding: 8px 12px; text-align: left; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 10px; }
  .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .card { background: #12121f; border-radius: 10px; padding: 14px; border: 1px solid #1e1e2e; }
  .card-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 4px; }
  .card-value { font-size: 24px; font-weight: 800; line-height: 1; }
  .card-sub { font-size: 11px; color: #6b7280; margin-top: 3px; }
  .table-wrap { background: #12121f; border-radius: 10px; overflow: hidden; border: 1px solid #1e1e2e; }
  @media print {
    body { background: #fff; color: #1e293b; padding: 16px; }
    .card { background: #f8fafc; border-color: #e2e8f0; }
    th { background: #f1f5f9; color: #64748b; }
    tr:nth-child(even) { background: #f8fafc; }
    .table-wrap { background: #fff; border-color: #e2e8f0; }
    .card-grid { grid-template-columns: repeat(6,1fr); }
  }
</style>
</head>
<body>
<!-- Header -->
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #1e1e2e;">
  <div>
    <div style="font-size:11px;color:#7c3aed;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">PrepSphere · Mission 2027</div>
    <h1 style="font-size:22px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Progress Report</h1>
    <div style="font-size:12px;color:#6b7280;margin-top:4px;">${userName} · Generated ${dateStr}</div>
  </div>
  <div style="text-align:right;">
    <div style="font-size:11px;color:#6b7280;">Overall Completion</div>
    <div style="font-size:36px;font-weight:900;color:#a78bfa;">${completionPct}%</div>
    <div style="font-size:11px;color:#6b7280;">${doneCh} of ${totalCh} chapters</div>
  </div>
</div>

<!-- Quick Stats -->
<div class="section">
  <div class="section-title">Quick Stats</div>
  <div class="card-grid" style="grid-template-columns:repeat(6,1fr);">
    <div class="card">
      <div class="card-label">Done</div>
      <div class="card-value" style="color:#34d399;">${doneCh}/${totalCh}</div>
      <div class="card-sub">${completionPct}% complete</div>
    </div>
    <div class="card">
      <div class="card-label">In Progress</div>
      <div class="card-value" style="color:#fbbf24;">${inProgressCh}</div>
      <div class="card-sub">chapters</div>
    </div>
    <div class="card">
      <div class="card-label">Weak Topics</div>
      <div class="card-value" style="color:#f87171;">${weakTopics.length}</div>
      <div class="card-sub">need attention</div>
    </div>
    <div class="card">
      <div class="card-label">Mock Avg</div>
      <div class="card-value" style="color:${avgScore !== null ? (avgScore >= 75 ? "#34d399" : avgScore >= 50 ? "#fbbf24" : "#f87171") : "#6b7280"};">${avgScore !== null ? avgScore + "%" : "—"}</div>
      <div class="card-sub">${tests.length} test${tests.length !== 1 ? "s" : ""}</div>
    </div>
    <div class="card">
      <div class="card-label">Streak</div>
      <div class="card-value" style="color:#fb923c;">${streak}</div>
      <div class="card-sub">days</div>
    </div>
    <div class="card">
      <div class="card-label">Notes</div>
      <div class="card-value" style="color:#a78bfa;">${notesCount}</div>
      <div class="card-sub">chapters</div>
    </div>
  </div>
</div>

<!-- Subject Progress -->
<div class="section">
  <div class="section-title">Subject Progress</div>
  <div class="table-wrap">
    <table>
      <thead><tr>
        <th>Subject</th><th style="text-align:center;">Total</th>
        <th style="text-align:center;">Done</th>
        <th style="text-align:center;">In Progress</th>
        <th>Completion</th>
        <th style="text-align:center;">Notes</th>
      </tr></thead>
      <tbody>${subjectRows}</tbody>
    </table>
  </div>
</div>

<!-- Exam Countdowns + Mock Tests (side by side) -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px;">
  <div>
    <div class="section-title">Exam Countdowns</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Exam</th><th>Date</th><th style="text-align:center;">Days Left</th></tr></thead>
        <tbody>${examRows}</tbody>
      </table>
    </div>
  </div>
  <div>
    <div class="section-title">Recent Mock Tests</div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Exam</th><th style="text-align:center;">Score</th><th style="text-align:center;">%</th></tr></thead>
        <tbody>${mockRows || `<tr><td colspan="4" style="padding:12px;text-align:center;font-size:12px;color:#6b7280;">No tests recorded yet.</td></tr>`}</tbody>
      </table>
    </div>
  </div>
</div>

<!-- Weak Topics -->
<div class="section">
  <div class="section-title">⚠️ Weak Topics (In Progress 7+ Days)</div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Chapter</th><th>Subject</th><th style="text-align:center;">Status</th></tr></thead>
      <tbody>${weakRows}</tbody>
    </table>
  </div>
</div>

<!-- Notes Preview -->
<div class="section">
  <div class="section-title">📝 Notes & Formulae Preview (first 6)</div>
  ${notesSection}
</div>

<!-- Footer -->
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #1e1e2e;display:flex;justify-content:space-between;align-items:center;">
  <div style="font-size:11px;color:#4b5563;">PrepSphere Mission 2027 — Keep pushing, astronaut 🚀</div>
  <div style="font-size:11px;color:#4b5563;">${dateStr}</div>
</div>

<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("Please allow pop-ups to export the report."); return; }
  win.document.write(html);
  win.document.close();
}
