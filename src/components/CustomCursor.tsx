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
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    let started = false;
    let lastPointerCheck = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // First move: place both elements at the pointer so nothing flies in from 0,0
      if (!started) {
        started = true;
        dotX = ringX = mouseX;
        dotY = ringY = mouseY;
      }

      // Detect pointer cursor (throttled — getComputedStyle is expensive)
      const now = e.timeStamp;
      if (now - lastPointerCheck > 80) {
        lastPointerCheck = now;
        const target = e.target as HTMLElement;
        const isLink =
          target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          !!target.closest("a") ||
          !!target.closest("button") ||
          getComputedStyle(target).cursor === "pointer";
        setIsPointer(isLink);
      }
    };

    const lerp = (start: number, end: number, amt: number) =>
      (1 - amt) * start + amt * end;

    const animate = () => {
      // Dot follows very closely, ring trails a little — both eased every frame
      dotX = lerp(dotX, mouseX, 0.45);
      dotY = lerp(dotY, mouseY, 0.45);
      ringX = lerp(ringX, mouseX, 0.22);
      ringY = lerp(ringY, mouseY, 0.22);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
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
      {/* Inner dot — eased, follows closely */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-primary transition-[width,height,opacity,background-color] duration-200 ease-out will-change-transform ${
          isHidden ? "opacity-0" : "opacity-100"
        } ${
          isPointer ? "h-2 w-2 opacity-0" : isClicking ? "h-1.5 w-1.5" : "h-2 w-2"
        }`}
      />

      {/* Outer ring — trails smoothly */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border border-primary/60 transition-[width,height,opacity,background-color,border-color] duration-200 ease-out will-change-transform ${
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
