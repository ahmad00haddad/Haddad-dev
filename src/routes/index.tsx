import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getProjects, SKILLS, type Project } from "../data";
import { CustomCursor } from "@/components/CustomCursor";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ahmad Haddad - Computer Engineer & Web Developer" },
      {
        name: "description",
        content:
          "Ahmad Haddad, Computer Engineer and Web Developer building AI-powered web experiences. Selected work, projects and contact.",
      },
      { property: "og:title", content: "Ahmad Haddad - Computer Engineer & Web Developer" },
      {
        property: "og:description",
        content: "Computer Engineer & Web Developer utilizing AI to build web experiences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [randomProjects, setRandomProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const MARQUEE_ITEMS = [...SKILLS, ...SKILLS];
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const hasLoadedInitially = typeof window !== "undefined" ? !!sessionStorage.getItem("has_loaded_canvas") : false;

  return () => window.removeEventListener("scroll", onScroll);
  }, []);



  useEffect(() => {
    getProjects().then((data) => {
      setProjectsData(data);
      if (data.length > 0) {
        let selected6 = [];
        const cached = sessionStorage.getItem("cached_random_projects");
        if (cached) {
          try {
            selected6 = JSON.parse(cached);
          } catch(e) {}
        }
        
        if (!selected6 || selected6.length === 0) {
          const filteredData = data.filter(p => !p.repo.includes("Haddad-dev") && !p.repo.includes("ahmadhaddad"));
          const shuffled = [...filteredData].sort(() => 0.5 - Math.random());
          while (shuffled.length < 6) {
            shuffled.push(...filteredData);
          }
          selected6 = shuffled.slice(0, 6);
          sessionStorage.setItem("cached_random_projects", JSON.stringify(selected6));
        }
        setRandomProjects(selected6);

        // If already loaded in this session, skip the visual preloader wait
        if (sessionStorage.getItem('has_loaded_canvas')) {
          setIsLoading(false);
          setLoadProgress(100);
          return;
        }


        // Preload exactly the 6 images that will be rendered
        const imagesToLoad = [
          selected6[0]?.image || hero1,
          selected6[1]?.image || hero2,
          selected6[2]?.image || work2,
          selected6[3]?.image || work1,
          selected6[4]?.image || work2,
          selected6[5]?.image || work3,
        ];

        let loadedCount = 0;
        imagesToLoad.forEach(src => {
          const img = new window.Image();
          img.src = src;
          const updateProgress = () => {
            loadedCount++;
            setLoadProgress(Math.round((loadedCount / imagesToLoad.length) * 100));
            if (loadedCount === imagesToLoad.length) {
              sessionStorage.setItem('has_loaded_canvas', 'true');
              setTimeout(() => setIsLoading(false), 500); // Wait half a second at 100% for aesthetic effect
            }
          };
          img.onload = updateProgress;
          img.onerror = updateProgress;
        });

      } else {
        setIsLoading(false);
      }
    }).catch(() => {
      setProjectsData([]);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    const hasLoadedInitially = typeof window !== "undefined" ? !!sessionStorage.getItem("has_loaded_canvas") : false;

  return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const hasLoadedInitially = typeof window !== "undefined" ? !!sessionStorage.getItem("has_loaded_canvas") : false;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
        <CustomCursor />
      {/* Preloader */}
      <div 
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background ${hasLoadedInitially ? "hidden" : "transition-opacity duration-1000 ease-in-out"} ${isLoading ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="text-center font-display">
          <div className="mb-6 text-xs font-bold tracking-[0.4em] text-muted-foreground uppercase">
            // Loading Canvas //
          </div>
          <div className="relative text-7xl font-extrabold tracking-tighter text-foreground sm:text-9xl">
            {loadProgress}<span className="absolute -right-12 top-4 text-3xl text-primary sm:-right-16 sm:top-8 sm:text-5xl">%</span>
          </div>
          <div className="mx-auto mt-12 h-[2px] w-64 overflow-hidden rounded-full bg-foreground/10">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out" 
              style={{ width: `${loadProgress}%` }} 
            />
          </div>
        </div>
      </div>
      <div className="olive-glow pointer-events-none fixed inset-0 opacity-70" aria-hidden="true" />

      {/* Floating Hover Image */}
      {hoveredImage && (
        <div 
          className="pointer-events-none fixed z-40 hidden overflow-hidden rounded-xl shadow-2xl transition-all duration-75 ease-out md:block"
          style={{ 
            left: mousePos.x, 
            top: mousePos.y, 
            transform: "translate(20px, -50%)",
            width: "280px",
            height: "180px"
          }}
        >
          <img src={hoveredImage} className="h-full w-full object-cover object-top" alt="Preview" />
        </div>
      )}

      {/* Side Panel Modal */}
      {selectedProject && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm transition-opacity" 
            onClick={() => { setSelectedProject(null); setIsZoomed(false); }} 
          />
          <div className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col overflow-y-auto overscroll-contain border-l border-border/50 bg-card/95 p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] shadow-2xl backdrop-blur-xl animate-in slide-in-from-right sm:p-8">
            <button 
              onClick={() => { setSelectedProject(null); setIsZoomed(false); }}
              className="absolute right-6 top-6 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              [ Close ]
            </button>
            
            <div className="mt-8 flex-1">
              <div className="overflow-hidden rounded-lg">
                <img src={selectedProject.image} className="h-48 w-full object-cover object-top" alt={selectedProject.name} />
              </div>
              
              <h2 className="mt-8 font-display text-4xl tracking-tight">{selectedProject.name}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedProject.tech.map((t) => (
                  <span key={t} className="glass-pill rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.2em]">
                    {t}
                  </span>
                ))}
              </div>

              {selectedProject.estimatedPrice && (
                <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 font-mono text-xs font-bold text-primary">
                  <span className="opacity-70">EST. VALUE:</span> {selectedProject.estimatedPrice}
                </div>
              )}
              
              <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
                {selectedProject.desc}
              </p>
            </div>
            
            <div className="mt-12 flex flex-col gap-3">
              <a 
                href={selectedProject.url} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full rounded-full bg-foreground py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-background transition-transform hover:scale-[1.02] hover:opacity-90"
              >
                Visit Live Site ↗
              </a>
              {selectedProject.repo && (
                <a 
                  href={`https://github.com/${selectedProject.repo.replace(/^\//, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  [ View Source on GitHub ]
                </a>
              )}
            </div>
          </div>
        </>
      )}

      <div className="relative z-10">
        {/* Nav */}
        <div className={`sticky top-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isScrolled ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
          <header className="mx-auto flex max-w-7xl items-center justify-end px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-8 sm:py-6">
            <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:gap-8 sm:text-xs sm:tracking-[0.18em]">
              <Link to="/calculator" className="text-primary transition-all duration-300 hover:text-primary/80 hover:-translate-y-1 hover:scale-110 active:scale-95">
                [ Calculator ]
              </Link>
              <a className="transition-all duration-300 hover:text-foreground hover:-translate-y-1 hover:scale-110 active:scale-95" href="#work">
                Projects
              </a>
              <a className="transition-all duration-300 hover:text-foreground hover:-translate-y-1 hover:scale-110 active:scale-95" href="#about">
                About Me
              </a>
              <a className="transition-all duration-300 hover:text-foreground hover:-translate-y-1 hover:scale-110 active:scale-95" href="#contact">
                Contact
              </a>
            </nav>
          </header>
        </div>

        {/* Hero */}
        <section 
          id="top" 
          className="mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 sm:pt-16 relative"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 25;
            const y = (e.clientY - rect.top - rect.height / 2) / 25;
            setMousePos({ x, y });
          }}
          onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        >
          <div className="relative">
                        <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block">
              <img
                src={randomProjects[0]?.image || hero1}
                alt="Project 1"
                width={900}
                height={1200}
                className="absolute left-[4%] top-[20%] h-56 w-40 rounded-sm object-cover object-top opacity-[0.6] brightness-[0.7] saturate-[0.7] shadow-2xl transition-all duration-700 lg:h-72 lg:w-52"
              />
              <img
                src={randomProjects[1]?.image || hero2}
                alt="Project 2"
                width={1200}
                height={800}
                className="absolute right-[2%] top-[45%] h-40 w-64 rounded-sm object-cover object-top opacity-[0.6] brightness-[0.7] saturate-[0.7] shadow-2xl transition-all duration-700 lg:h-52 lg:w-80"
              />
              <img
                src={randomProjects[2]?.image || work2}
                alt="Project 3"
                loading="lazy"
                width={900}
                height={1100}
                className="absolute bottom-[-15%] left-[45%] h-40 w-32 rounded-sm object-cover object-top opacity-[0.6] brightness-[0.7] saturate-[0.7] shadow-2xl transition-all duration-700 lg:h-52 lg:w-40"
              />
            </div>

            <h1 className="relative z-20 text-center font-display font-extrabold uppercase leading-[0.82] tracking-tighter">
              <span className="block text-[10.5vw] lg:text-[8.6rem]">
                <ScrambleText text="Creative" />
              </span>
              <span className="block text-[10.5vw] italic lg:text-[8.6rem]">
                <span className="font-serif normal-case">Dev</span>
              </span>
            </h1>

            <div className="mt-10 grid gap-8 md:mt-16 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <p className="relative z-20 max-w-md text-sm leading-relaxed text-foreground/90 font-medium tracking-wide shadow-black drop-shadow-lg">
                <span className="mr-2 inline-block font-serif text-5xl leading-none text-foreground/60 align-middle animate-breathe">
                  (
                </span>
                HELLO! I&apos;m Ahmad Haddad, a Computer Engineer &amp; Web Developer utilizing AI
                to build web experiences.
                <span className="ml-2 inline-block font-serif text-5xl leading-none text-foreground/60 align-middle animate-breathe" style={{ animationDelay: "2s" }}>
                  )
                </span>
              </p>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:text-right">
                Amman, Jordan
                <span className="mx-2 text-primary">/</span>
                Available
              </div>
            </div>

            {/* Mobile image column */}
            <div className="mt-10 grid grid-cols-2 gap-3 md:hidden pointer-events-none">
              <img
                src={randomProjects[0]?.image || hero1}
                alt="Project 1"
                width={900}
                height={1200}
                className="h-44 w-full rounded-sm object-cover object-top opacity-[0.6] brightness-[0.7] saturate-[0.7] transition-all duration-700"
              />
              <img
                src={randomProjects[1]?.image || hero2}
                alt="Project 2"
                width={1200}
                height={800}
                className="h-44 w-full rounded-sm object-cover object-top opacity-[0.6] brightness-[0.7] saturate-[0.7] transition-all duration-700"
              />
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="grid gap-6 border-y border-border py-10 md:grid-cols-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              /01 - About
            </p>
            <p className="font-display text-2xl leading-snug tracking-tight sm:text-3xl md:col-span-2">
              Engineering meets <span className="font-serif italic">taste</span> - I design and ship
              fast, modern products with AI in the loop.
            </p>
          </div>
        </section>

        {/* Work */}
        <section id="work" className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-6 select-none text-center font-display text-[15vw] font-extrabold uppercase leading-none tracking-[0.18em] text-foreground/[0.05]"
          >
            Work
          </div>

          <span className="pointer-events-none absolute -left-6 top-1/3 hidden rotate-90 origin-left text-[10px] uppercase tracking-[0.35em] text-muted-foreground lg:block">
            UX / UI
          </span>
          <span className="pointer-events-none absolute -right-6 top-1/2 hidden -rotate-90 origin-right text-[10px] uppercase tracking-[0.35em] text-muted-foreground lg:block">
            Since 2024
          </span>

          <div className="relative z-10 pt-24">
            <div className="md:relative md:h-[860px]">
              <div className="cursor-pointer md:absolute md:left-0 md:top-0 md:w-[54%]" onClick={() => setSelectedProject(randomProjects[3] ?? projectsData[0] ?? null)}>
                <Card
                  src={randomProjects[3]?.image || work1}
                  alt={randomProjects[3]?.name || "Memoria"}
                  tags={randomProjects[3]?.tech?.slice(0, 2) || ["REACT", "SUPABASE"]}
                  index="01"
                  title={randomProjects[3]?.name || "Memoria"}
                  ratio="aspect-[16/10]"
                />
              </div>
              <div className="mt-8 cursor-pointer md:absolute md:right-[2%] md:top-[16%] md:mt-0 md:w-[32%]" onClick={() => setSelectedProject(randomProjects[4] ?? projectsData[1] ?? null)}>
                <Card
                  src={randomProjects[4]?.image || work2}
                  alt={randomProjects[4]?.name || "Nas Irbid"}
                  tags={randomProjects[4]?.tech?.slice(0, 2) || ["REACT", "MAPS"]}
                  index="02"
                  title={randomProjects[4]?.name || "Nas Irbid"}
                  ratio="aspect-[4/5]"
                />
              </div>
              <div className="mt-8 cursor-pointer md:absolute md:bottom-0 md:left-[30%] md:mt-0 md:w-[44%]" onClick={() => setSelectedProject(randomProjects[5] ?? projectsData[6] ?? null)}>
                <Card
                  src={randomProjects[5]?.image || work3}
                  alt={randomProjects[5]?.name || "Faii House"}
                  tags={randomProjects[5]?.tech?.slice(0, 2) || ["GSAP", "JS"]}
                  index="03"
                  title={randomProjects[5]?.name || "Faii House"}
                  ratio="aspect-[16/10]"
                />
              </div>
            </div>

            {/* Repo list */}
            <div className="mt-16 rounded-xl border border-border bg-card/40 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-border px-5 py-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                <span>Repositories</span>
                <span>{projectsData.length}</span>
              </div>
              <ul className="relative">
                {projectsData.slice(0, visibleCount).map((project) => (
                  <li 
                    key={project.repo} 
                    className="border-b border-border last:border-b-0"
                    onMouseEnter={() => setHoveredImage(project.image)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-foreground/5"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                      <span className="truncate font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground sm:text-sm">
                        {project.repo.replace("ahmad00haddad", "")}
                      </span>
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-transform group-hover:translate-x-1">
                        ↗
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {visibleCount < projectsData.length && (
                <div className="border-t border-border p-4 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                    className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View More +
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Skills Marquee */}
        <section className="relative overflow-hidden border-y border-border bg-card/20 py-8 group cursor-pointer">
            {/* Smart Marquee Hint */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:scale-95">
              <span className="rounded-full bg-foreground/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-background shadow-2xl backdrop-blur-md">
                [ Hold to Pause ]
              </span>
            </div>
          <div className="flex w-max animate-marquee items-center gap-16 pr-16 hover:[animation-play-state:paused]">
            {MARQUEE_ITEMS.map((skill, i) => (
              <span 
                key={i} 
                className="whitespace-nowrap font-display text-4xl font-extrabold uppercase tracking-tight text-foreground/10 transition-colors hover:text-foreground/40 sm:text-6xl"
              >
                {skill} <span className="mx-4 text-primary/40">✦</span>
              </span>
            ))}
          </div>
        </section>

        {/* Contact */}
        <footer id="contact" className="mx-auto max-w-7xl px-5 pb-[calc(4rem+env(safe-area-inset-bottom))] pt-24 sm:px-8 relative">
          <h2 className="font-display text-[18vw] font-extrabold uppercase leading-[0.82] tracking-tighter sm:text-[14vw] relative z-10">
            Let&apos;s <span className="font-serif italic normal-case relative group">
              Talk
              {/* Live Signature SVG */}
              <svg className="absolute -bottom-10 right-0 h-24 w-64 text-primary opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 200 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M40,50 Q60,20 80,45 T110,40 Q130,20 150,45" className="animate-[draw_3s_ease-out_forwards] drop-shadow-[0_0_10px_var(--primary)]" style={{ strokeDasharray: 300, strokeDashoffset: 300 }} />
                <path d="M30,30 L50,70" className="animate-[draw_3s_ease-out_forwards_0.5s] drop-shadow-[0_0_10px_var(--primary)]" style={{ strokeDasharray: 100, strokeDashoffset: 100 }} />
                <path d="M100,20 L110,60" className="animate-[draw_3s_ease-out_forwards_1s] drop-shadow-[0_0_10px_var(--primary)]" style={{ strokeDasharray: 100, strokeDashoffset: 100 }} />
              </svg>
            </span>
          </h2>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border sm:grid-cols-3">
            <ContactItem
              label="LinkedIn"
              value="/in/ahmad00haddad"
              href="https://www.linkedin.com/in/ahmad00haddad/"
            />
            <ContactItem
              label="Email"
              value="ahmad000haddad@gmail.com"
              href="mailto:ahmad000haddad@gmail.com"
              copyable={true}
            />
            <ContactItem
              label="WhatsApp"
              value="00962 79 925 6345"
              href="https://wa.me/962799256345"
              copyable={true}
            />
          </div>

          <p className="mt-10 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            © {new Date().getFullYear()} Ahmad Haddad
          </p>
        </footer>
      </div>
    </div>
  );
}

function ScrambleText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");
  const chars = "!<>-_\\\\/[]{}—=+*^?#________";
  
  useEffect(() => {
    let iteration = 0;
    let interval: ReturnType<typeof setInterval>;
    
    interval = setInterval(() => {
      setDisplayText(
        text.split("").map((letter, index) => {
          if (index < iteration) {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      
      if (iteration >= text.length) {
        clearInterval(interval);
      }
      
      iteration += 1 / 3;
    }, 30);
    
    const hasLoadedInitially = typeof window !== "undefined" ? !!sessionStorage.getItem("has_loaded_canvas") : false;

  return () => clearInterval(interval);
  }, [text]);
  
  return <>{displayText || text}</>;
}

function Card({
  src,
  alt,
  tags,
  index,
  title,
  className,
  ratio,
}: {
  src: string;
  alt: string;
  tags: string[];
  index: string;
  title: string;
  className?: string;
  ratio: string;
}) {
  const hasLoadedInitially = typeof window !== "undefined" ? !!sessionStorage.getItem("has_loaded_canvas") : false;

  return (
    <figure className={`group relative ${className ?? ""}`}>
      <div className={`relative overflow-hidden rounded-sm ${ratio}`}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="glass-pill rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <span className="truncate font-display text-xs tracking-tight text-foreground">
          {title}
        </span>
        <span>/{index}</span>
      </figcaption>
    </figure>
  );
}

function ContactItem({ label, value, href, copyable = false }: { label: string; value: string; href: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    if (copyable) {
      e.preventDefault();
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasLoadedInitially = typeof window !== "undefined" ? !!sessionStorage.getItem("has_loaded_canvas") : false;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCopied(false); }}
      className="group relative bg-card/40 p-6 backdrop-blur-md transition-colors hover:bg-foreground/5 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
        {copyable && isHovered && (
          <span className="animate-in fade-in text-[9px] uppercase tracking-[0.2em] text-primary">
            {copied ? "Copied! ✔" : "Click to copy"}
          </span>
        )}
      </div>
      <p className="mt-3 truncate text-sm text-foreground transition-colors group-hover:text-primary">
        {value}
      </p>
    </a>
  );
}
