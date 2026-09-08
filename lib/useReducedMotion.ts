"use client";

import { useSyncExternalStore } from "react";

/* Read prefers-reduced-motion during render rather than syncing it into state
   from an effect — a setState in an effect body just to learn a media query
   costs a second render on every mount. */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false, // the server cannot know; assume motion is fine and let the client correct it
  );
}
