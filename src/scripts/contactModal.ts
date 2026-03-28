const MODAL_SELECTOR = "#contact-modal";
const PANEL_SELECTOR = "#contact-modal-panel";
const BACKDROP_SELECTOR = "[data-contact-modal-backdrop]";
const CLOSE_BUTTON_SELECTOR = "[data-contact-modal-close]";
const FORM_SELECTOR = "[data-contact-modal-form]";
const SUBMIT_SELECTOR = "[data-contact-modal-submit]";

type ContactPayload = {
  message?: FormDataEntryValue;
  qq?: FormDataEntryValue;
};

export function initContactModal() {
  window.__contactModalCleanup?.();

  const modal = document.querySelector<HTMLDivElement>(MODAL_SELECTOR);
  const backdrop = modal?.querySelector<HTMLDivElement>(BACKDROP_SELECTOR) ?? null;
  const closeBtn = modal?.querySelector<HTMLButtonElement>(CLOSE_BUTTON_SELECTOR) ?? null;
  const modalPanel = document.querySelector<HTMLDivElement>(PANEL_SELECTOR);
  const form = modal?.querySelector<HTMLFormElement>(FORM_SELECTOR) ?? null;
  const submitBtn = modal?.querySelector<HTMLButtonElement>(SUBMIT_SELECTOR) ?? null;

  const resetFormState = () => {
    form?.reset();
    submitBtn?.removeAttribute("disabled");
    if (submitBtn) {
      submitBtn.textContent = "发送";
    }
  };

  const openModal = () => {
    modal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      backdrop?.classList.remove("opacity-0");
      backdrop?.classList.add("opacity-100");
      modalPanel?.classList.remove("is-closing");
      modalPanel?.classList.remove("translate-y-3", "scale-[0.97]");
      modalPanel?.classList.add("translate-y-0", "scale-100", "is-opening");
    });
  };

  const closeModal = () => {
    backdrop?.classList.remove("opacity-100");
    backdrop?.classList.add("opacity-0");
    modalPanel?.classList.remove("is-opening");
    modalPanel?.classList.add("is-closing");
    modalPanel?.classList.remove("translate-y-0", "scale-100");
    modalPanel?.classList.add("translate-y-3", "scale-[0.97]");
    document.body.style.overflow = "";

    window.setTimeout(() => {
      modal?.classList.add("hidden");
      modalPanel?.classList.remove("is-closing");
      resetFormState();
    }, 300);
  };

  const onOpen = () => {
    openModal();
  };

  const onSubmit = async (event: Event) => {
    event.preventDefault();

    if (!submitBtn || !form) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "发送中...";

    const data = Object.fromEntries(new FormData(form).entries()) as ContactPayload;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { error?: string; success?: boolean };

      if (result.success) {
        submitBtn.textContent = "已发送 ✓";
        window.setTimeout(closeModal, 1500);
        return;
      }

      submitBtn.textContent = result.error || "发送失败";
    } catch {
      submitBtn.textContent = "网络错误";
    }

    window.setTimeout(() => {
      if (!submitBtn) return;

      submitBtn.textContent = "发送";
      submitBtn.disabled = false;
    }, 2000);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !modal?.classList.contains("hidden")) {
      closeModal();
    }
  };

  const handleAfterSwap = () => {
    initContactModal();
  };

  document.addEventListener("open-contact-modal", onOpen);
  backdrop?.addEventListener("click", closeModal);
  closeBtn?.addEventListener("click", closeModal);
  form?.addEventListener("submit", onSubmit);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("astro:after-swap", handleAfterSwap);

  window.__contactModalCleanup = () => {
    document.removeEventListener("open-contact-modal", onOpen);
    backdrop?.removeEventListener("click", closeModal);
    closeBtn?.removeEventListener("click", closeModal);
    form?.removeEventListener("submit", onSubmit);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("astro:after-swap", handleAfterSwap);
  };
}
