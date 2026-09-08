import { useState } from "react";

interface LeadCaptureProps {
  estimateMin: number;
  estimateMax: number;
  projectType: string;
}

export function LeadCapture({ estimateMin, estimateMax, projectType }: LeadCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Build a mailto link with the estimate pre-filled
    const subject = encodeURIComponent(`New Project Inquiry from ${name} — ${projectType}`);
    const body = encodeURIComponent(
      `Hi Ahmad,\n\nMy name is ${name}.\n\nProject Type: ${projectType}\nEstimate Range: ${estimateMin} - ${estimateMax} JOD\n\nDetails:\n${details}\n\nBest regards,\n${name}\nEmail: ${email}`
    );

    window.open(`mailto:ahmad000haddad@gmail.com?subject=${subject}&body=${body}`);

    // Also copy summary to clipboard as fallback
    await navigator.clipboard.writeText(
      `Name: ${name}\nEmail: ${email}\nProject: ${projectType}\nEstimate: ${estimateMin} - ${estimateMax} JOD\nDetails: ${details}`
    ).catch(() => {});

    setSending(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setIsOpen(false);
      setName(""); setEmail(""); setDetails("");
    }, 3000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full rounded-lg border border-primary/40 bg-primary/5 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-primary transition-all duration-300 hover:bg-primary/15 hover:border-primary hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
      >
        [ Start Your Project → ]
      </button>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-primary/30 bg-card/80 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-primary/5 px-5 py-3 flex items-center justify-between border-b border-border">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">
          Start Your Project
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      {sent ? (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="text-4xl">✓</div>
          <p className="text-sm font-bold text-foreground">Message sent!</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            I'll get back to you within 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 p-5">
          {/* Pre-filled estimate banner */}
          <div className="rounded-lg bg-foreground/5 px-4 py-3 text-[9px] uppercase tracking-widest text-muted-foreground">
            Estimate attached: <span className="font-bold text-primary">{estimateMin} - {estimateMax} JOD</span>
          </div>

          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-muted-foreground">Your Name *</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ahmad..."
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-muted-foreground">Email *</label>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label className="mb-1 block text-[9px] uppercase tracking-widest text-muted-foreground">Project Details</label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={3}
              placeholder="Tell me more about your project..."
              className="w-full resize-none rounded-lg border border-border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-primary py-3.5 text-[10px] font-bold uppercase tracking-[0.3em] text-background transition-all duration-300 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {sending ? "Sending..." : "[ Send to Ahmad ]"}
          </button>

          <p className="text-center text-[8px] uppercase tracking-widest text-muted-foreground/50">
            No spam. Reply within 24h guaranteed.
          </p>
        </form>
      )}
    </div>
  );
}
