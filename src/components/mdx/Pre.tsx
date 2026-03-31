import React from "react";
import { getHighlighter } from "@/lib/blog";
import { CopyButton } from "./CopyButton";

/** Recursively extract plain text from React children (string | element | array). */
function extractText(node: any): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node.props?.children) return extractText(node.props.children);
  return "";
}

export const Pre = async ({ children, ...props }: any) => {
  const codeProps = children?.props || {};
  const className = codeProps.className || "";
  const lang = className.replace("language-", "") || "text";

  const text = extractText(codeProps.children);

  if (!text) {
    return (
      <div className="code-block-wrapper relative group my-2">
        <pre {...props} className="!m-0">{children}</pre>
      </div>
    );
  }

  const highlighter = await getHighlighter();

  let resolvedLang = lang;
  try {
    const loaded = highlighter.getLoadedLanguages();
    if (!loaded.includes(resolvedLang)) {
      await highlighter.loadLanguage(resolvedLang as any);
    }
  } catch {
    // Unknown language, fall back to plaintext
    resolvedLang = "text";
  }

  try {
    const html = highlighter.codeToHtml(text, {
      lang: resolvedLang,
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
    });
    return (
      <div className="code-block-wrapper relative group my-2">
        <CopyButton text={text} />
        <div
          className="[&>pre]:!m-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  } catch (e) {
    console.error("[Pre] Shiki highlight error:", e);
    return (
      <div className="code-block-wrapper relative group my-2">
        <CopyButton text={text} />
        <pre {...props} className="!m-0">{children}</pre>
      </div>
    );
  }
};


