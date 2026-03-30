import { useState, useEffect, useRef } from "react";

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface Props {
  headings: Heading[];
  hideTitle?: boolean;
}

export default function TableOfContents({ headings, hideTitle = false }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) {
              setActiveId(id);
              // 自动滚动侧边栏使得激活项尽可能靠顶部展示
              const scrollArea = scrollAreaRef.current;
              const linkLi = itemsRef.current[id];
              if (scrollArea && linkLi) {
                const offsetTop = linkLi.offsetTop;
                scrollArea.scrollTo({
                  top: offsetTop > 20 ? offsetTop - 20 : 0,
                  behavior: "smooth"
                });
              }
            }
          }
        });
      },
      {
        rootMargin: "-10% 0px -80% 0px",
      }
    );

    const article = document.getElementById("article");
    if (article) {
      const hTags = article.querySelectorAll("h2, h3, h4");
      hTags.forEach((heading) => observer.observe(heading));
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <nav className="toc-container">
      {!hideTitle && <h2 className="text-[0.9rem] font-semibold mb-2 text-foreground/90">目录</h2>}
      <div
        ref={scrollAreaRef}
        className={`toc-scroll-area overflow-y-auto [&::-webkit-scrollbar]:hidden ${
          hideTitle ? "max-h-[72vh] pr-4" : "max-h-[40vh]"
        }`}
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)",
        } as React.CSSProperties}
      >
        <ul className="relative border-l border-foreground/10 flex flex-col gap-1 text-[0.8rem] pb-24">
          {headings.map((heading) => {
            const isActive = activeId === heading.slug;
            return (
              <li
                key={heading.slug}
                ref={(el) => {
                  itemsRef.current[heading.slug] = el;
                }}
                className={`toc-item ${heading.depth === 3 ? "ml-3" : ""} ${
                  isActive ? "border-l-2 border-accent -ml-[1px]" : ""
                }`}
              >
                <a
                  href={`#${heading.slug}`}
                  data-slug={heading.slug}
                  className={`block pl-3 py-[2px] hover:text-accent transition-all duration-300 toc-link transform origin-left ${
                    isActive
                      ? "text-accent font-medium whitespace-normal scale-105 text-[0.85rem]"
                      : "text-foreground/60 truncate text-[0.8rem]"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
