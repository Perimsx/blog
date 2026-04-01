"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/config";
import { Hr as HrComponent } from "@/components/Hr";
import { IconMenuDeep, IconSearch, IconMoon, IconSunHigh, IconX } from "@/components/icons";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleOpenContact = () => {
      document.dispatchEvent(new CustomEvent("open-contact-modal"));
    };
    const handleOpenSearch = () => {
      document.dispatchEvent(new CustomEvent("open-search-modal"));
    };

    document.addEventListener("open-contact-modal", handleOpenContact);
    document.addEventListener("open-search-modal", handleOpenSearch);
    
    // System Theme Listener (replicating Astro implementation)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      let userHasManuallySetTheme = false;
      const themeSetTimestamp = localStorage.getItem("themeSetTimestamp");
      if (themeSetTimestamp) {
        const hoursSinceSet = (Date.now() - parseInt(themeSetTimestamp)) / (1000 * 60 * 60);
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
      document.removeEventListener("open-contact-modal", handleOpenContact);
      document.removeEventListener("open-search-modal", handleOpenSearch);
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

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
          { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
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

  const currentPath = pathname?.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname ?? "";

  const isActive = (path: string) => {
    const currentArray = currentPath.split("/").filter(Boolean);
    const pathArray = path.split("/").filter(Boolean);
    return currentPath === path || currentArray[0] === pathArray[0];
  };

  return (
    <>
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
              className="font-logo absolute py-1 text-2xl leading-7 whitespace-nowrap sm:static"
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
                    className={`block px-4 py-2 text-center font-medium hover:text-accent sm:px-2 sm:py-1 ${isActive("/posts") ? "active-nav" : ""}`}
                  >
                    Posts
                  </Link>
                </li>
                <li className="col-span-2">
                  <Link
                    href="/tags"
                    className={`block px-4 py-2 text-center font-medium hover:text-accent sm:px-2 sm:py-1 ${isActive("/tags") ? "active-nav" : ""}`}
                  >
                    Tags
                  </Link>
                </li>
                <li className="col-span-2">
                  <Link
                    href="/about"
                    className={`block px-4 py-2 text-center font-medium hover:text-accent sm:px-2 sm:py-1 ${isActive("/about") ? "active-nav" : ""}`}
                  >
                    About
                  </Link>
                </li>
                <li className="col-span-2 flex items-center justify-center gap-3 py-1.5 sm:gap-x-5 sm:py-0">
                  <button
                    id="contact-btn"
                    className="flex size-10 cursor-pointer items-center justify-center p-2.5 transition-all hover:brightness-110 active:scale-95 sm:size-8 sm:p-1"
                    title="联系站长"
                    aria-label="联系站长"
                    onClick={() => document.dispatchEvent(new CustomEvent("open-contact-modal"))}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" fill="#e4393c" />
                      <path d="M22 4l-10 8L2 4" stroke="white" strokeWidth="2" />
                      <path d="M2 20l8-8m4 0l8 8" stroke="white" strokeWidth="1.5" opacity="0.4" />
                    </svg>
                  </button>

                  <button
                    id="search-btn"
                    className="focus-outline flex cursor-pointer p-2.5 sm:p-1"
                    aria-label="搜索"
                    title="搜索"
                    type="button"
                    onClick={() => document.dispatchEvent(new CustomEvent("open-search-modal"))}
                  >
                    <IconSearch />
                  </button>

                  {SITE.lightAndDarkMode && (
                    <button
                      id="theme-btn"
                      className="theme-toggle-btn focus-outline relative size-10 p-3 sm:size-8 hover:[&>svg]:stroke-accent"
                      title="Toggles light & dark"
                      aria-label="auto"
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
    </>
  );
};
