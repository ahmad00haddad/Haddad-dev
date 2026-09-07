import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ScrambleText } from "@/components/ScrambleText";

export const Route = createFileRoute("/calculator")({
  component: CalculatorPage,
});

function CalculatorPage() {
  const [projectType, setProjectType] = useState("landing");
  const [pages, setPages] = useState<number>(1);
  const [designNeeded, setDesignNeeded] = useState(false);
  const [isRush, setIsRush] = useState(false);
  const [maintenance, setMaintenance] = useState("none");
  const [copied, setCopied] = useState(false);

  const calculatePrice = () => {
    let baseMin = 0;
    let baseMax = 0;

    switch (projectType) {
      case "landing":
        baseMin = 350;
        baseMax = 600;
        break;
      case "corporate":
        baseMin = 700;
        baseMax = 1200;
        break;
      case "ecommerce":
        baseMin = 800;
        baseMax = 1500;
        break;
      case "webapp":
        baseMin = 1500;
        baseMax = 3500;
        break;
    }

    // Add for extra pages
    if (pages > 5 && projectType !== "landing") {
      baseMin += (pages - 5) * 25;
      baseMax += (pages - 5) * 40;
    } else if (pages > 1 && projectType === "landing") {
      baseMin += (pages - 1) * 35;
      baseMax += (pages - 1) * 50;
    }

    // Multipliers
    if (designNeeded) {
      baseMin *= 1.2;
      baseMax *= 1.2;
    }

    if (isRush) {
      baseMin *= 1.3;
      baseMax *= 1.3;
    }

    return { min: Math.round(baseMin), max: Math.round(baseMax) };
  };

  const { min: calcMin, max: calcMax } = calculatePrice();
  const min = calcMin.toLocaleString("en-US");
  const max = calcMax.toLocaleString("en-US");

  let monthly = 0;
  if (maintenance === "standard") monthly = 30;
  if (maintenance === "premium") monthly = 100;

  const getInfrastructureCosts = () => {
    let monthly = 0;
    let annual = 15; // Standard Domain Name (approx JOD)
    
    if (projectType === "landing") {
      monthly = 0; // Vercel Free Tier
    } else if (projectType === "corporate") {
      monthly = 5; // Basic hosting / CMS
    } else if (projectType === "ecommerce") {
      monthly = 25; // Hosting + E-commerce DB
    } else if (projectType === "webapp") {
      monthly = 45; // Supabase Pro ($25) + Vercel Pro ($20) + AI APIs
    }
    
    return { monthly, annual };
  };
  const infra = getInfrastructureCosts();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="olive-glow pointer-events-none fixed inset-0 opacity-40" aria-hidden="true" />

      <header className="mx-auto flex max-w-7xl items-center justify-end px-5 py-6 sm:px-8 relative z-50">
        <nav className="flex items-center gap-5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:gap-8 sm:text-xs">
          <Link to="/" className="transition-all duration-300 hover:text-foreground hover:-translate-y-1 hover:scale-110 active:scale-95">
            Home
          </Link>
          <Link to="/calculator" className="text-primary transition-all duration-300 hover:text-primary/80 hover:-translate-y-1 hover:scale-110 active:scale-95">
            [ Calculator ]
          </Link>
          <a className="transition-all duration-300 hover:text-foreground hover:-translate-y-1 hover:scale-110 active:scale-95" href="/#work">
            Projects
          </a>
          <a className="transition-all duration-300 hover:text-foreground hover:-translate-y-1 hover:scale-110 active:scale-95" href="/#contact">
            Contact
          </a>
        </nav>
      </header>
      
      <div className="relative mx-auto max-w-4xl p-6 pt-12 sm:p-12">
        <header className="mb-12 border-b border-border pb-6">
          <div className="flex items-center justify-between">
            <div>
                <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.85] tracking-tighter sm:text-[4rem]">
                  <span className="block"><ScrambleText text="Project" /></span>
                  <span className="block font-serif italic normal-case text-primary/80">Estimator</span>
                </h1>
                <p className="mt-6 text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Intelligent Pricing Engine</p>
              </div>
            <Link to="/" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
              [ Back to Home ]
            </Link>
          </div>
        </header>

        <div className="grid gap-12 md:grid-cols-[1fr_350px]">
          {/* Controls */}
          <div className="space-y-10">
            {/* Project Type */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">1. Project Type</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                {[
                  { id: "landing", label: "Landing Page", desc: "Single page overview" },
                  { id: "corporate", label: "Corporate Site", desc: "Multi-page business site" },
                  { id: "ecommerce", label: "E-Commerce", desc: "Online store (Cart, Checkout)" },
                  { id: "webapp", label: "Web Application", desc: "Complex logic, auth, database" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setProjectType(type.id)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all ${
                      projectType === type.id
                        ? "border-primary bg-primary/5 shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_15%,transparent)_inset] text-primary scale-[1.02]"
                        : "border-border bg-card/20 hover:border-border/80 hover:bg-card/40"
                    }`}
                  >
                    <span className="font-mono text-sm font-semibold">{type.label}</span>
                    <span className="text-[10px] text-muted-foreground">{type.desc}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Scope */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">2. Scope & Complexity</h2>
              <div className="rounded-xl border border-border bg-card/20 p-5 backdrop-blur-sm">
                <label className="flex items-center justify-between text-sm">
                  <span className="font-mono">Number of Pages / Views</span>
                  <span className="text-primary font-bold">{pages}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value))}
                  className="mt-4 w-full accent-primary"
                />
              </div>
            </section>

            {/* Add-ons */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">3. Requirements</h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card/10 p-4 transition-all hover:bg-card/30 hover:border-border/50 focus-within:border-primary">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm">UI/UX Concept Creation</span>
                    <span className="text-[10px] text-muted-foreground">Design from scratch (+20%)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={designNeeded}
                    onChange={(e) => setDesignNeeded(e.target.checked)}
                    className="h-5 w-5 rounded border-border bg-background accent-primary"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card/10 p-4 transition-all hover:bg-card/30 hover:border-border/50 focus-within:border-primary">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm">Rush Delivery</span>
                    <span className="text-[10px] text-muted-foreground">Expedited timeline (+30%)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isRush}
                    onChange={(e) => setIsRush(e.target.checked)}
                    className="h-5 w-5 rounded border-border bg-background accent-primary"
                  />
                </label>
              </div>
            </section>

            {/* Retainer */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">4. Maintenance Retainer</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "none", label: "None" },
                  { id: "standard", label: "Standard" },
                  { id: "premium", label: "Premium" },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setMaintenance(plan.id)}
                    className={`rounded-lg border p-3 text-center text-xs font-mono transition-all ${
                      maintenance === plan.id
                        ? "border-primary bg-primary/5 shadow-[0_0_15px_color-mix(in_oklab,var(--primary)_15%,transparent)_inset] text-primary scale-[1.02]"
                        : "border-border bg-card/20 text-muted-foreground hover:bg-card/40"
                    }`}
                  >
                    {plan.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Results Panel */}
          <div className="relative">
            <div className="sticky top-12 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
              
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Estimated Investment</h3>
              
              <div className="my-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-extrabold text-foreground sm:text-5xl">{min}</span>
                  <span className="text-xl text-muted-foreground">-</span>
                  <span className="font-display text-4xl font-extrabold text-foreground sm:text-5xl">{max}</span>
                </div>
                <div className="mt-1 text-sm font-mono text-primary">JOD (One-time)</div>
              </div>

              {/* 3rd Party Costs */}
              <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-500/70 mb-2">3rd-Party Infrastructure</div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Hosting, DB, API:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-sm font-bold text-foreground">~{infra.monthly}</span>
                      <span className="text-[10px] text-muted-foreground">JOD/mo</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Domain Name:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-sm font-bold text-foreground">~{infra.annual}</span>
                      <span className="text-[10px] text-muted-foreground">JOD/yr</span>
                    </div>
                  </div>
                </div>
              </div>

              {monthly > 0 && (
                <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary/70">Developer Retainer</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold">{monthly}</span>
                    <span className="text-xs text-muted-foreground">JOD / month</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Base Type:</span>
                  <span className="font-mono text-foreground capitalize">{projectType}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pages:</span>
                  <span className="font-mono text-foreground">{pages}</span>
                </div>
                {designNeeded && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Custom UI/UX:</span>
                    <span className="font-mono text-primary">Included</span>
                  </div>
                )}
                {isRush && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Timeline:</span>
                    <span className="font-mono text-primary">Expedited</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Estimate: ${min} - ${max} JOD`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`mt-10 w-full border py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 ${
                  copied 
                    ? "border-green-500 bg-green-500/10 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]" 
                    : "border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground"
                }`}
              >
                {copied ? "[ ESTIMATE COPIED ✓ ]" : "Copy Estimate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
