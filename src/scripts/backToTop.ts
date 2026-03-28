const BUTTON_SELECTOR = "#back-to-top";
const PROGRESS_RING_SELECTOR = "#scroll-progress-ring";
const CIRCUMFERENCE = 125.66;

export function initBackToTop() {
  window.__backToTopCleanup?.();

  const backToTopBtn = document.querySelector<HTMLButtonElement>(BUTTON_SELECTOR);
  const progressRing = document.querySelector<SVGCircleElement>(PROGRESS_RING_SELECTOR);

  const handleAfterSwap = () => {
    initBackToTop();
  };

  if (!backToTopBtn || !progressRing) {
    document.addEventListener("astro:after-swap", handleAfterSwap);
    window.__backToTopCleanup = () => {
      document.removeEventListener("astro:after-swap", handleAfterSwap);
    };
    return;
  }

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

    progressRing.style.strokeDashoffset = String(offset);

    if (scrollTop > 300) {
      backToTopBtn.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
      backToTopBtn.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
      return;
    }

    backToTopBtn.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
    backToTopBtn.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
  };

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  backToTopBtn.addEventListener("click", handleClick);
  document.addEventListener("astro:after-swap", handleAfterSwap);

  updateProgress();

  window.__backToTopCleanup = () => {
    window.removeEventListener("scroll", updateProgress);
    backToTopBtn.removeEventListener("click", handleClick);
    document.removeEventListener("astro:after-swap", handleAfterSwap);
  };
}
