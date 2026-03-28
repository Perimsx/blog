const MENU_BUTTON_SELECTOR = "#menu-btn";
const MENU_ITEMS_SELECTOR = "#menu-items";
const MENU_ICON_SELECTOR = "#menu-icon";
const CLOSE_ICON_SELECTOR = "#close-icon";
const CONTACT_BUTTON_SELECTOR = "#contact-btn";
const SEARCH_BUTTON_SELECTOR = "#search-btn";

export function initHeaderInteractions() {
  window.__headerCleanup?.();

  const menuBtn = document.querySelector<HTMLButtonElement>(MENU_BUTTON_SELECTOR);
  const menuItems = document.querySelector<HTMLElement>(MENU_ITEMS_SELECTOR);
  const menuIcon = document.querySelector<HTMLElement>(MENU_ICON_SELECTOR);
  const closeIcon = document.querySelector<HTMLElement>(CLOSE_ICON_SELECTOR);
  const contactBtn = document.querySelector<HTMLButtonElement>(CONTACT_BUTTON_SELECTOR);
  const searchBtn = document.querySelector<HTMLButtonElement>(SEARCH_BUTTON_SELECTOR);

  const onMenuClick = () => {
    if (!menuBtn || !menuItems || !menuIcon || !closeIcon) return;

    const openMenu = menuBtn.getAttribute("aria-expanded") === "true";

    menuBtn.setAttribute("aria-expanded", openMenu ? "false" : "true");
    menuBtn.setAttribute("aria-label", openMenu ? "Open Menu" : "Close Menu");
    menuItems.classList.toggle("hidden");
    menuIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
  };

  const openContactModal = () => {
    document.dispatchEvent(new CustomEvent("open-contact-modal"));
  };

  const openSearchModal = () => {
    document.dispatchEvent(new CustomEvent("open-search-modal"));
  };

  const handleAfterSwap = () => {
    initHeaderInteractions();
  };

  menuBtn?.addEventListener("click", onMenuClick);
  contactBtn?.addEventListener("click", openContactModal);
  searchBtn?.addEventListener("click", openSearchModal);
  document.addEventListener("astro:after-swap", handleAfterSwap);

  window.__headerCleanup = () => {
    menuBtn?.removeEventListener("click", onMenuClick);
    contactBtn?.removeEventListener("click", openContactModal);
    searchBtn?.removeEventListener("click", openSearchModal);
    document.removeEventListener("astro:after-swap", handleAfterSwap);
  };
}
