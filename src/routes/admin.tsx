import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getProjects,
  saveProjects,
  deleteProject,
  uploadProjectImage,
  resolveImageUrl,
  type Project,
} from "../data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard - Ahmad Haddad Portfolio" },
      { name: "description", content: "Private dashboard to manage the portfolio projects." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checkingSession) return null;
  if (!session) return <LoginScreen />;
  return <Dashboard />;
}

function LoginScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) setMessage(error.message);
      else if (!data.session) setMessage("Check your email to confirm your account, then sign in.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8 text-foreground font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-md">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Restricted</h1>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {mode === "signin" ? "Sign in to manage the portfolio" : "Create your admin account"}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {message && <p className="text-xs leading-relaxed text-yellow-400">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:scale-[1.02] hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(null); }}
          className="mt-6 w-full text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadId = useRef<string | null>(null);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProjects(projects);
      alert("Saved to the database.");
    } catch (err: unknown) {
      alert("Could not save: " + (err instanceof Error ? err.message : String(err)));
    }
    setSaving(false);
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index]!, [field]: value };
    setProjects(updated);
  };

  const handleTechChange = (index: number, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index]!, tech: value.split(",").map((t) => t.trim()) };
    setProjects(updated);
  };

  const persistOrder = async (updated: Project[]) => {
    setProjects(updated);
    try {
      await saveProjects(updated);
    } catch (err: unknown) {
      alert("Could not update order: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...projects];
    const temp = updated[index - 1]!;
    updated[index - 1] = updated[index]!;
    updated[index] = temp;
    void persistOrder(updated);
  };

  const moveDown = (index: number) => {
    if (index === projects.length - 1) return;
    const updated = [...projects];
    const temp = updated[index + 1]!;
    updated[index + 1] = updated[index]!;
    updated[index] = temp;
    void persistOrder(updated);
  };

  const addNewProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: "New Project",
        repo: "username/new-repo",
        desc: "Project description goes here.",
        tech: ["REACT"],
        url: "https://github.com",
        order_index: -1,
      })
      .select()
      .single();

    if (error || !data) {
      alert("Could not add project: " + (error?.message ?? "unknown error"));
      return;
    }

    const created: Project = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      repo: data.repo,
      url: data.url,
      desc: data.desc,
      tech: (data.tech ?? []) as string[],
      image_url: data.image_url,
      order_index: data.order_index,
      image: await resolveImageUrl(data.image_url, 0, data.url),
    };
    void persistOrder([created, ...projects]);
  };

  const removeProject = async (index: number) => {
    const target = projects[index];
    if (!target) return;
    if (!confirm("Are you sure you want to remove this project?")) return;
    try {
      await deleteProject(target.id);
      setProjects(projects.filter((_, i) => i !== index));
    } catch (err: unknown) {
      alert("Could not remove: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const openImagePicker = (id: string) => {
    pendingUploadId.current = id;
    fileInputRef.current?.click();
  };


const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else reject(new Error("Canvas to Blob failed"));
          },
          "image/webp",
          quality
        );
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const projectId = pendingUploadId.current;
    e.target.value = "";
    if (!file || !projectId) return;

    setUploadingId(projectId);
    try {
      const compressedFile = await compressImage(file);
      const path = await uploadProjectImage(projectId, compressedFile);
      const project = projects.find(p => p.id === projectId);
      const preview = await resolveImageUrl(path, 0, project?.url);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, image_url: path, image: preview } : p)),
      );
    } catch (err: unknown) {
      alert("Upload failed: " + (err instanceof Error ? err.message : String(err)));
    }
    setUploadingId(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background p-8 text-foreground font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="mx-auto max-w-5xl">
        
        <header className="mb-12 flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">System Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground uppercase tracking-[0.2em]">Manage Portfolio Data</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSignOut}
              className="rounded-full border border-border bg-card/40 px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
            >
              Sign Out
            </button>
            <button
              onClick={addNewProject}
              className="rounded-full border border-border bg-card/40 px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground/5"
            >
              + Add Project
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-primary px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </header>
        
        <div className="mb-10 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6 backdrop-blur-md">
          <p className="text-sm leading-relaxed text-yellow-200/80">
            <strong className="text-yellow-400">Live Database:</strong> Changes are stored in the cloud database and appear on the homepage for everyone.
            Click a project image to upload a new one.
          </p>
        </div>

        <div className="space-y-6">
          {projects.map((proj: Project, idx: number) => (
            <div key={proj.id} className="group relative rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-sm transition-colors hover:border-border/80">
              <div className="absolute right-6 top-6 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => moveUp(idx)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-foreground/10">↑</button>
                <button onClick={() => moveDown(idx)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-foreground/10">↓</button>
                <button onClick={() => removeProject(idx)} className="flex h-8 w-8 items-center justify-center rounded-full border border-destructive/50 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20">✕</button>
              </div>
              
              <div className="mb-6 flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5 font-mono text-xs text-muted-foreground">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                  className="bg-transparent font-display text-2xl font-bold focus:outline-none"
                  placeholder="Project Name"
                />
              </div>

              <div className="mb-6">
                <div className="mb-6 relative">
                  <button
                    onClick={() => openImagePicker(proj.id)}
                    className="group/img relative block h-40 w-full overflow-hidden rounded-xl border border-border bg-background/50"
                  >
                    <img src={proj.image} alt={proj.name} className="h-full w-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105" />
                    <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-[10px] uppercase tracking-[0.2em] text-foreground opacity-0 transition-opacity group-hover/img:opacity-100">
                      {uploadingId === proj.id ? "Uploading..." : "Click to upload image"}
                    </span>
                  </button>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!proj.url) return alert("Please enter a LIVE URL first!");
                      const autoUrl = `https://api.microlink.io/?screenshot=true&meta=false&embed=screenshot.url&screenshot.type=webp&viewport.width=1024&viewport.height=640&waitForTimeout=1500&url=${proj.url}`;
                      try {
                        const { error } = await supabase.from("projects").update({ image_url: autoUrl }).eq("id", proj.id);
                        if (error) throw error;
                        setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, image_url: autoUrl, image: autoUrl } : p));
                      } catch (err: any) { alert("Failed: " + err.message); }
                    }}
                    className="absolute left-2 top-2 z-10 rounded-md bg-primary/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground backdrop-blur-md transition-transform hover:scale-105"
                  >
                    🚀 Auto Fetch Thumbnail
                  </button>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">GitHub Repo Slug</label>
                  <input
                    type="text"
                    value={proj.repo}
                    onChange={(e) => handleProjectChange(idx, "repo", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Live URL</label>
                  <input
                    type="text"
                    value={proj.url}
                    onChange={(e) => handleProjectChange(idx, "url", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    value={(proj.tech || []).join(", ")}
                    onChange={(e) => handleTechChange(idx, e.target.value)}
                    className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Description</label>
                  <textarea
                    value={proj.desc}
                    onChange={(e) => handleProjectChange(idx, "desc", e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background/50 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
