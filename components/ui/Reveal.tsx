"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/* Scroll reveal. One IntersectionObserver per element is plenty at this
   page size, and it keeps the animation declarative in CSS. */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  mode = "up",
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  mode?: "up" | "wipe";
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const attr = mode === "wipe" ? "data-reveal-x" : "data-reveal";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Safety net: anything already on screen at mount is shown immediately,
    // without waiting for an observer callback. IntersectionObserver is
    // suspended while a tab is hidden, and a reveal that never fires is a
    // blank page rather than a missing animation.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      el.setAttribute(attr, "in");
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.setAttribute(attr, "in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [attr]);

  const props = {
    ref,
    className,
    style: { ...style, ["--d" as string]: `${delay}ms` },
    [attr]: "out",
  } as Record<string, unknown>;

  return <Tag {...props}>{children}</Tag>;
}
