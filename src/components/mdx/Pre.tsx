import React from "react";
import type { BundledLanguage } from "shiki";
import { getHighlighter } from "@/lib/blog";
import { CopyButton } from "./CopyButton";

type HastNode = {
  children?: HastNode[];
  properties?: Record<string, unknown>;
  tagName?: string;
  type: "element" | "root" | "text";
  value?: string;
};

function parseInlineStyle(styleValue: string): React.CSSProperties {
  const styles: Record<string, string> = {};

  for (const declaration of styleValue.split(";")) {
    const trimmed = declaration.trim();
    if (!trimmed) continue;

    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) continue;

    const property = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!property || !value) continue;

    styles[property] = value;
  }

  return styles as React.CSSProperties;
}

function toReactProps(properties: Record<string, unknown> = {}) {
  const props: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (key === "class") {
      props.className = value;
    } else if (key === "style" && typeof value === "string") {
      props.style = parseInlineStyle(value);
    } else if (key === "tabindex") {
      props.tabIndex = Number(value);
    } else {
      props[key] = value;
    }
  }

  return props;
}

function renderHastNode(node: HastNode, key: string): React.ReactNode {
  if (node.type === "text") {
    return node.value ?? "";
  }

  if (node.type === "root") {
    return node.children?.map((child, index) => renderHastNode(child, `${key}-${index}`)) ?? null;
  }

  if (!node.tagName) return null;

  const children =
    node.children?.map((child, index) => renderHastNode(child, `${key}-${index}`)) ?? undefined;

  return React.createElement(node.tagName, { key, ...toReactProps(node.properties) }, children);
}

/** Recursively extract plain text from React children. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(node: any): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node && node.props?.children)
    return extractText(node.props.children);
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Pre = async ({ children, ...props }: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codeProps = (children as any)?.props || {};
  const className = codeProps.className || "";
  const lang = className.replace("language-", "") || "text";

  const text = extractText(codeProps.children);

  if (!text) {
    return (
      <div className="code-block-wrapper relative group my-1.5 sm:my-2">
        <pre {...props} className="!m-0">
          {children}
        </pre>
      </div>
    );
  }

  const highlighter = await getHighlighter();

  let resolvedLang = lang;
  try {
    const loaded = highlighter.getLoadedLanguages();
    if (!loaded.includes(resolvedLang)) {
      await highlighter.loadLanguage(resolvedLang as BundledLanguage);
    }
  } catch {
    resolvedLang = "text";
  }

  try {
    const hast = highlighter.codeToHast(text, {
      lang: resolvedLang,
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
    });
    return (
      <div className="code-block-wrapper relative group my-1.5 sm:my-2">
        <CopyButton text={text} />
        <div className="[&>pre]:!m-0">{renderHastNode(hast as HastNode, "code")}</div>
      </div>
    );
  } catch (e) {
    console.error("[Pre] Shiki highlight error:", e);
    return (
      <div className="code-block-wrapper relative group my-1.5 sm:my-2">
        <CopyButton text={text} />
        <pre {...props} className="!m-0">
          {children}
        </pre>
      </div>
    );
  }
};
