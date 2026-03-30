"use client";

import { useEffect } from "react";

interface PostArticleContentProps {
  html: string;
}

function extractYouTubeId(input: string): string {
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
}

const YOUTUBE_SHORTCODE_PATTERN = /\{% youtube (https:\/\/[^\s]+|[a-zA-Z0-9_-]+) %\}/g;

export function PostArticleContent({ html }: PostArticleContentProps) {
  useEffect(() => {
    const article = document.getElementById("article");
    if (!article) return;

    const headings = Array.from(article.querySelectorAll<HTMLElement>("h2, h3, h4, h5, h6"));
    for (const heading of headings) {
      if (heading.querySelector(".heading-link")) continue;

      heading.classList.add("group");
      const link = document.createElement("a");
      link.className = "heading-link ml-2 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100";
      link.href = `#${heading.id}`;

      const span = document.createElement("span");
      span.setAttribute("aria-hidden", "true");
      span.innerText = "#";
      link.appendChild(span);
      heading.appendChild(link);
    }

    // 2. Add copy buttons to code blocks
    const codeBlocks = Array.from(article.querySelectorAll<HTMLElement>("pre"));
    for (const codeBlock of codeBlocks) {
      if (codeBlock.dataset.copyEnhanced === "true") continue;

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";

      const copyButton = document.createElement("button");
      copyButton.className = "copy-code absolute right-3 -top-3 rounded bg-muted px-2 py-1 text-xs font-medium leading-4 text-foreground";
      copyButton.innerHTML = "Copy";
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
          copyButton.innerText = "Copy";
        }, 700);
      });
    }

    // 3. Add lazy loading to images
    const images = article.querySelectorAll<HTMLImageElement>("img:not([loading])");
    images.forEach((img) => {
      img.setAttribute("loading", "lazy");
    });

    // 4. Process YouTube embeds
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

    // Also check text nodes for any remaining {% youtube %} shortcodes
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
      const newHtml = textContent.replace(YOUTUBE_SHORTCODE_PATTERN, (_match, rawVideoId: string) => {
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
      tempDiv.innerHTML = newHtml;

      const parent = textNode.parentNode;
      if (!parent) return;

      while (tempDiv.firstChild) {
        parent.insertBefore(tempDiv.firstChild, textNode);
      }
      parent.removeChild(textNode);
    });
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}
