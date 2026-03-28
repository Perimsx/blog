const ARTICLE_SELECTOR = "#article";
const NAV_SELECTOR = "[data-prev-url]";
const PROGRESS_CONTAINER_ID = "article-progress-container";
const PROGRESS_BAR_ID = "article-progress-bar";
const HEADING_SELECTOR = "h2, h3, h4, h5, h6";
const YOUTUBE_SHORTCODE_PATTERN = /\{% youtube (https:\/\/[^\s]+|[a-zA-Z0-9_-]+) %\}/g;

// 进度条节点会在 Astro 局部导航后被重复初始化，这里优先复用已存在节点。
const ensureProgressBar = () => {
  let progressContainer = document.getElementById(PROGRESS_CONTAINER_ID) as HTMLDivElement | null;
  let progressBar = document.getElementById(PROGRESS_BAR_ID) as HTMLDivElement | null;

  if (!progressContainer || !progressBar) {
    progressContainer = document.createElement("div");
    progressContainer.id = PROGRESS_CONTAINER_ID;
    progressContainer.className = "progress-container fixed top-0 z-10 h-1 w-full bg-background";

    progressBar = document.createElement("div");
    progressBar.id = PROGRESS_BAR_ID;
    progressBar.className = "progress-bar h-1 w-0 bg-accent";

    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
  }

  return { progressBar, progressContainer };
};

const updateScrollProgress = (progressBar: HTMLDivElement) => {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = height > 0 ? (winScroll / height) * 100 : 0;

  progressBar.style.width = `${scrolled}%`;
};

const addHeadingLinks = (article: HTMLElement) => {
  const headings = Array.from(article.querySelectorAll<HTMLElement>(HEADING_SELECTOR));

  for (const heading of headings) {
    if (heading.querySelector(".heading-link")) continue;

    heading.classList.add("group");

    const link = document.createElement("a");
    link.className =
      "heading-link ml-2 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100";
    link.href = `#${heading.id}`;

    const span = document.createElement("span");
    span.ariaHidden = "true";
    span.innerText = "#";
    link.appendChild(span);
    heading.appendChild(link);
  }
};

const attachCopyButtons = (article: HTMLElement) => {
  const copyButtonLabel = "Copy";
  const codeBlocks = Array.from(article.querySelectorAll<HTMLElement>("pre"));

  for (const codeBlock of codeBlocks) {
    if (codeBlock.dataset.copyEnhanced === "true") continue;

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    const copyButton = document.createElement("button");
    copyButton.className =
      "copy-code absolute right-3 -top-3 rounded bg-muted px-2 py-1 text-xs font-medium leading-4 text-foreground";
    copyButton.innerHTML = copyButtonLabel;
    codeBlock.setAttribute("tabindex", "0");
    codeBlock.dataset.copyEnhanced = "true";
    codeBlock.appendChild(copyButton);

    codeBlock.parentNode?.insertBefore(wrapper, codeBlock);
    wrapper.appendChild(codeBlock);

    copyButton.addEventListener("click", async () => {
      const code = codeBlock.querySelector<HTMLElement>("code");
      const text = code?.innerText ?? "";

      await navigator.clipboard.writeText(text);
      copyButton.innerText = "Copied";

      window.setTimeout(() => {
        copyButton.innerText = copyButtonLabel;
      }, 700);
    });
  }
};

const addLazyLoading = (article: HTMLElement) => {
  const images = article.querySelectorAll<HTMLImageElement>("img:not([loading])");
  images.forEach((img) => {
    img.setAttribute("loading", "lazy");
  });
};

const extractYouTubeId = (input: string) => {
  let videoId = input;

  try {
    if (videoId.includes("youtube.com/watch")) {
      const url = new URL(videoId);
      videoId = url.searchParams.get("v") || "";
    } else if (videoId.includes("youtu.be/")) {
      videoId = videoId.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (videoId.includes("youtube.com/embed/")) {
      videoId = videoId.split("youtube.com/embed/")[1]?.split("?")[0] || "";
    }
  } catch {
    return input;
  }

  return videoId;
};

// 先处理整段短码，再兜底扫描残留文本节点，兼容 MDX 渲染后的不同结构。
const processEmbeds = (article: HTMLElement) => {
  const paragraphs = article.querySelectorAll<HTMLParagraphElement>("p");

  paragraphs.forEach((paragraph) => {
    const text = (paragraph.textContent || "").trim();
    const videoMatch = text.match(/\{% youtube (https:\/\/[^\s]+|[a-zA-Z0-9_-]+) %\}/);
    if (!videoMatch?.[1]) return;

    const videoId = extractYouTubeId(videoMatch[1]);
    const container = document.createElement("div");
    container.className = "youtube-embed-container";
    container.innerHTML = `
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/${videoId}"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    `;
    paragraph.replaceWith(container);
  });

  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  const textNodes: Node[] = [];
  let node = walker.nextNode();

  while (node) {
    textNodes.push(node);
    node = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const textContent = textNode.textContent;
    if (!textContent || !textContent.includes("{% youtube ")) return;

    let hasChanges = false;
    const html = textContent.replace(YOUTUBE_SHORTCODE_PATTERN, (_match, rawVideoId: string) => {
      hasChanges = true;
      const videoId = extractYouTubeId(rawVideoId);

      return `<div class="youtube-embed-container">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/${videoId}"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>`;
    });

    if (!hasChanges) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const parent = textNode.parentNode;
    if (!parent) return;

    while (tempDiv.firstChild) {
      parent.insertBefore(tempDiv.firstChild, textNode);
    }
    parent.removeChild(textNode);
  });
};

// J/K 只在非输入场景下接管翻页，避免和搜索、评论等输入行为冲突。
const setupKeyboardNavigation = (navContainer: HTMLElement | null) => {
  if (!navContainer) return () => {};

  const prevUrl = navContainer.getAttribute("data-prev-url");
  const nextUrl = navContainer.getAttribute("data-next-url");

  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      target.matches('input, textarea, [contenteditable="true"]')
    ) {
      return;
    }

    if (event.key === "j" && nextUrl) {
      window.location.href = nextUrl;
    } else if (event.key === "k" && prevUrl) {
      window.location.href = prevUrl;
    }
  };

  document.addEventListener("keydown", onKeyDown);

  return () => {
    document.removeEventListener("keydown", onKeyDown);
  };
};

export function initPostDetailsPage() {
  window.__postDetailsCleanup?.();

  const article = document.querySelector<HTMLElement>(ARTICLE_SELECTOR);
  const navContainer = document.querySelector<HTMLElement>(NAV_SELECTOR);
  const { progressBar, progressContainer } = ensureProgressBar();

  if (!article) {
    progressContainer.remove();
    return;
  }

  const handleScroll = () => {
    updateScrollProgress(progressBar);
  };

  // 这些增强都要保证幂等，重复进入文章页时不能给同一节点叠加多次行为。
  addHeadingLinks(article);
  attachCopyButtons(article);
  addLazyLoading(article);
  processEmbeds(article);

  window.addEventListener("scroll", handleScroll, { passive: true });
  const cleanupKeyboardNavigation = setupKeyboardNavigation(navContainer);

  handleScroll();

  window.__postDetailsCleanup = () => {
    window.removeEventListener("scroll", handleScroll);
    cleanupKeyboardNavigation();
    progressContainer.remove();
  };
}
