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

    // Anything already on screen is shown immediately, without waiting for an
    // observer callback.
    const onScreen = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92 && r.bottom > 0;
    };

    if (onScreen()) {
      el.setAttribute(attr, "in");
      return;
    }

    let io: IntersectionObserver | null = null;

    function stop() {
      io?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    }

    function check() {
      if (!el || !onScreen()) return;
      el.setAttribute(attr, "in");
      stop();
    }

    io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.setAttribute(attr, "in");
          stop();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);

    // Safety net. An IntersectionObserver is suspended while a tab is hidden,
    // and its geometry is clipped by any ancestor overflow or clip-path — so a
    // reveal that never fires is a blank section rather than a missing
    // animation. Scroll position is the ground truth; this cannot get stuck.
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });

    return stop;
  }, [attr]);

  const props = {
    ref,
    className,
    style: { ...style, ["--d" as string]: `${delay}ms` },
    [attr]: "out",
  } as Record<string, unknown>;

  return <Tag {...props}>{children}</Tag>;
}
