import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Touch devices: keep the native behaviour, no custom cursor
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setIsFinePointer(true);

    // Hide default cursor
    document.body.style.cursor = "none";

    let rafId: number;
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Update dot instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }

      // Detect pointer cursor
      const target = e.target as HTMLElement;
      const isLink =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        getComputedStyle(target).cursor === "pointer";
      setIsPointer(!!isLink);
    };

    const lerp = (start: number, end: number, amt: number) =>
      (1 - amt) * start + amt * end;

    const animate = () => {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    const onMouseLeave = () => setIsHidden(true);
    const onMouseEnter = () => setIsHidden(false);
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.body.style.cursor = "";
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <>
      {/* Inner dot — snaps instantly */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-all duration-150 ${
          isHidden ? "opacity-0" : "opacity-100"
        } ${
          isPointer ? "h-2 w-2 opacity-0" : isClicking ? "h-1.5 w-1.5" : "h-2 w-2"
        }`}
      />

      {/* Outer ring — lerps smoothly */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/60 transition-all duration-200 ${
          isHidden ? "opacity-0" : "opacity-100"
        } ${
          isPointer
            ? "h-10 w-10 border-primary/80 bg-primary/5"
            : isClicking
            ? "h-5 w-5 bg-primary/10"
            : "h-7 w-7"
        }`}
      />
    </>
  );
}
