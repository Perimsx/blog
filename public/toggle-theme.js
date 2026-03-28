/* eslint-env browser */

// Get theme data from local storage
let currentTheme = localStorage.getItem("theme");
let themeSetTimestamp = localStorage.getItem("themeSetTimestamp");
let userHasManuallySetTheme = false;

// Check if manual theme preference has expired (24 hours)
if (themeSetTimestamp) {
  const now = Date.now();
  const setTime = parseInt(themeSetTimestamp);
  const hoursSinceSet = (now - setTime) / (1000 * 60 * 60);
  
  if (hoursSinceSet < 24) {
    userHasManuallySetTheme = true;
  } else {
    // Expired - clear manual settings
    localStorage.removeItem("theme");
    localStorage.removeItem("themeSetTimestamp");
    currentTheme = null;
  }
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getPreferredTheme() {
  // If user manually set a theme, use it
  if (userHasManuallySetTheme && currentTheme) {
    return currentTheme;
  }
  
  // Otherwise, follow system preference
  return getSystemTheme();
}

let themeValue = getPreferredTheme();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setPreference(isManualChange = false) {
  if (isManualChange) {
    // User clicked the toggle button
    localStorage.setItem("theme", themeValue);
    localStorage.setItem("themeSetTimestamp", Date.now().toString());
    userHasManuallySetTheme = true;
  } else if (!userHasManuallySetTheme) {
    // System changed and user hasn't manually set theme
    // Don't save to localStorage, just update the display
  }
  reflectPreference();
}

function runFallbackAnimation(trigger) {
  const root = document.documentElement;
  const toggleButton = trigger instanceof HTMLElement ? trigger : null;

  root.classList.add("theme-animating");
  toggleButton?.classList.add("is-animating");

  window.clearTimeout(window.__themeAnimationTimeout);
  window.__themeAnimationTimeout = window.setTimeout(() => {
    root.classList.remove("theme-animating");
    toggleButton?.classList.remove("is-animating");
  }, 360);
}

function animateThemeTransition(trigger) {
  const toggleButton = trigger instanceof HTMLElement ? trigger : document.querySelector("#theme-btn");

  if (!document.startViewTransition || prefersReducedMotion.matches) {
    setPreference(true);
    runFallbackAnimation(toggleButton);
    return;
  }

  const rect = toggleButton?.getBoundingClientRect();
  const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(originX, window.innerWidth - originX),
    Math.max(originY, window.innerHeight - originY),
  );

  toggleButton?.classList.add("is-animating");

  const transition = document.startViewTransition(() => {
    setPreference(true);
  });

  transition.ready
    .then(() => {
      const reveal = [
        `circle(0px at ${originX}px ${originY}px)`,
        `circle(${endRadius}px at ${originX}px ${originY}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: reveal,
        },
        {
          duration: 520,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );

      document.documentElement.animate(
        {
          opacity: [1, 0.88],
        },
        {
          duration: 220,
          easing: "ease-out",
          pseudoElement: "::view-transition-old(root)",
        },
      );
    })
    .catch(() => {
      runFallbackAnimation(toggleButton);
    })
    .finally(() => {
      window.setTimeout(() => {
        toggleButton?.classList.remove("is-animating");
      }, 420);
    });
}

function reflectPreference() {
  document.documentElement.setAttribute("data-theme", themeValue);

  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);

  // Get a reference to the body element
  const body = document.body;

  // Check if the body element exists before using it
  if (body) {
    // Set the `color-scheme` CSS property to the current theme
    body.style.colorScheme = themeValue;
  }
}

// set early so no page flashes / CSS is made aware
reflectPreference();

window.onload = () => {
  function setThemeFeature() {
    // set on load so screen readers can get the latest value on the button
    reflectPreference();

    // now this script can find and listen for clicks on the control
    const themeButton = document.querySelector("#theme-btn");
    if (!themeButton) return;

    themeButton.onclick = () => {
      themeValue = themeValue === "light" ? "dark" : "light";
      animateThemeTransition(themeButton);
    };
  }

  setThemeFeature();

  // Runs on view transitions navigation
  document.addEventListener("astro:after-swap", setThemeFeature);
};

// sync with system changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    const newSystemTheme = isDark ? "dark" : "light";
    
    // If user hasn't manually set theme, follow system
    if (!userHasManuallySetTheme) {
      themeValue = newSystemTheme;
      setPreference(false); // false = system change
    }
  });
