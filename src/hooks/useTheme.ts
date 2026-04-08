"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";

/**
 * Initializes the system theme listener.
 * Must be called once at the app root level (e.g., inside a Client Component that wraps the app).
 * Handles the 24-hour expiration mechanism: if the user manually set a theme more than 24 hours ago,
 * the preference is cleared and the system theme is respected again.
 */
function initSystemThemeListener() {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    let userHasManuallySetTheme = false;
    const themeSetTimestamp = localStorage.getItem("themeSetTimestamp");
    if (themeSetTimestamp) {
      const hoursSinceSet = (Date.now() - parseInt(themeSetTimestamp, 10)) / (1000 * 60 * 60);
      if (hoursSinceSet < 24) {
        userHasManuallySetTheme = true;
      } else {
        localStorage.removeItem("theme");
        localStorage.removeItem("themeSetTimestamp");
      }
    }

    if (!userHasManuallySetTheme) {
      const newTheme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      document.body.style.colorScheme = newTheme;
    }
  };

  mediaQuery.addEventListener("change", handleSystemThemeChange);
}

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return (document.documentElement.getAttribute("data-theme") as Theme) || "light";
  });

  // Initialize system theme listener once.
  useEffect(() => {
    initSystemThemeListener();
  }, []);

  const toggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const currentTheme = document.documentElement.getAttribute("data-theme") as Theme || "light";
    const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";
    const toggleButton = e.currentTarget;

    const setPreference = () => {
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      localStorage.setItem("themeSetTimestamp", Date.now().toString());
      if (document.body) {
        document.body.style.colorScheme = nextTheme;
      }
      setTheme(nextTheme);
    };

    const runFallbackAnimation = () => {
      document.documentElement.classList.add("theme-animating");
      toggleButton.classList.add("is-animating");
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-animating");
        toggleButton.classList.remove("is-animating");
      }, 360);
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Provide untyped cast for startViewTransition API checking
    const doc = document as any;

    if (!doc.startViewTransition || prefersReducedMotion.matches) {
      setPreference();
      runFallbackAnimation();
      return;
    }

    const rect = toggleButton.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY)
    );

    toggleButton.classList.add("is-animating");

    const transition = doc.startViewTransition(() => {
      setPreference();
    });

    transition.ready
      .then(() => {
        const reveal = [
          `circle(0px at ${originX}px ${originY}px)`,
          `circle(${endRadius}px at ${originX}px ${originY}px)`,
        ];

        document.documentElement.animate(
          { clipPath: reveal },
          {
            duration: 520,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );

        document.documentElement.animate(
          { opacity: [1, 0.88] },
          { duration: 220, easing: "ease-out", pseudoElement: "::view-transition-old(root)" }
        );
      })
      .catch(() => {
        runFallbackAnimation();
      })
      .finally(() => {
        window.setTimeout(() => {
          toggleButton.classList.remove("is-animating");
        }, 420);
      });
  }, []);

  return { theme, toggle };
}
