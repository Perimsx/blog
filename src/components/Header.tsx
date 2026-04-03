"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Hr as HrComponent } from "@/components/Hr";
import {
  IconMenuDeep,
  IconMonitor,
  IconMoon,
  IconSearch,
  IconSunHigh,
  IconX,
} from "@/components/icons";
import { SITE } from "@/lib/config";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // System Theme Listener (replicating Astro implementation)
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

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    if (pathname == null) return;
    setMenuOpen(false);
  }, [pathname]);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    const toggleButton = e.currentTarget;

    const setPreference = () => {
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      localStorage.setItem("themeSetTimestamp", Date.now().toString());
      if (document.body) {
        document.body.style.colorScheme = nextTheme;
      }
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
  };

  const currentPath =
    pathname?.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : (pathname ?? "");

  const isActive = (path: string) => {
    const currentArray = currentPath.split("/").filter(Boolean);
    const pathArray = path.split("/").filter(Boolean);
    return currentPath === path || currentArray[0] === pathArray[0];
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header>
      <div
        id="nav-container"
        className="layout-frame flex flex-col items-center justify-between sm:flex-row"
      >
        <div
          id="top-nav-wrap"
          className="relative flex w-full items-baseline justify-between bg-background py-3 sm:items-center sm:py-6"
        >
          <Link
            href="/"
            className="font-wordmark absolute py-1 text-2xl leading-7 whitespace-nowrap sm:static"
          >
            {SITE.title}
          </Link>
          <nav
            id="nav-menu"
            className="flex w-full flex-col items-center sm:ml-2 sm:flex-row sm:justify-end sm:space-x-4 sm:py-0"
          >
            <button
              id="menu-btn"
              className="focus-outline self-end p-2 sm:hidden"
              aria-label={menuOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={menuOpen}
              aria-controls="menu-items"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <IconX /> : <IconMenuDeep />}
            </button>
            <ul
              id="menu-items"
              className={[
                "mt-2.5 grid w-40 grid-cols-2 place-content-center gap-1.5",
                "[&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-2 [&>li>a]:text-center [&>li>a]:font-medium [&>li>a]:hover:text-accent sm:[&>li>a]:px-2 sm:[&>li>a]:py-1",
                menuOpen ? "" : "hidden",
                "sm:mt-0 sm:ml-0 sm:flex sm:w-auto sm:gap-x-5 sm:gap-y-0",
              ].join(" ")}
            >
              <li className="col-span-2">
                <Link
                  href="/posts"
                  onClick={closeMenu}
                  className={`block px-4 py-2 text-center font-medium hover:text-accent sm:px-2 sm:py-1 ${isActive("/posts") ? "active-nav" : ""}`}
                >
                  Posts
                </Link>
              </li>
              <li className="col-span-2">
                <Link
                  href="/tags"
                  onClick={closeMenu}
                  className={`block px-4 py-2 text-center font-medium hover:text-accent sm:px-2 sm:py-1 ${isActive("/tags") ? "active-nav" : ""}`}
                >
                  Tags
                </Link>
              </li>
              <li className="col-span-2">
                <Link
                  href="/about"
                  onClick={closeMenu}
                  className={`block px-4 py-2 text-center font-medium hover:text-accent sm:px-2 sm:py-1 ${isActive("/about") ? "active-nav" : ""}`}
                >
                  About
                </Link>
              </li>
              <li className="col-span-2 mx-auto grid w-[10.5rem] grid-cols-3 justify-items-center py-1.5 sm:flex sm:w-auto sm:items-center sm:justify-center sm:gap-x-5 sm:py-0">
                <Link
                  href="/monitor"
                  onClick={closeMenu}
                  className={`focus-outline flex size-10 items-center justify-center hover:text-accent sm:size-8 sm:p-1 ${isActive("/monitor") ? "text-accent" : ""}`}
                  aria-label="监控面板"
                  title="监控面板"
                >
                  <IconMonitor />
                  <span className="sr-only">Monitor</span>
                </Link>

                <button
                  id="search-btn"
                  className="focus-outline flex size-10 items-center justify-center sm:size-8 sm:p-1"
                  aria-label="搜索"
                  title="搜索"
                  type="button"
                  onClick={() => {
                    closeMenu();
                    document.dispatchEvent(new CustomEvent("open-search-modal"));
                  }}
                >
                  <IconSearch />
                </button>

                {SITE.lightAndDarkMode && (
                  <button
                    id="theme-btn"
                    className="theme-toggle-btn focus-outline relative size-10 p-3 sm:size-8 hover:[&>svg]:stroke-accent"
                    title="Toggles light & dark"
                    aria-label="auto"
                    type="button"
                    onClick={toggleTheme}
                  >
                    <IconMoon className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <IconSunHigh className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  </button>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <HrComponent />
    </header>
  );
};
