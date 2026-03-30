import React from "react";
import { getHighlighter } from "@/lib/blog";
import { CopyButton } from "./CopyButton";

export const Pre = async ({ children, ...props }: any) => {
  // Extracts the `<code>` element
  const codeProps = children?.props || {};
  const className = codeProps.className || "";
  const lang = className.replace("language-", "") || "text";
  
  // MDX passes children as a string inside the code tag
  const text = typeof codeProps.children === "string" ? codeProps.children : "";

  if (!text) {
    return (
      <div className="code-block-wrapper relative group my-6">
        <pre {...props} className="!m-0">{children}</pre>
      </div>
    );
  }

  const highlighter = await getHighlighter();

  try {
    const html = highlighter.codeToHtml(text, {
      lang,
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
    });
    return (
      <div className="code-block-wrapper relative group my-6">
        <CopyButton text={text} />
        <div
          // we use [&>pre]:!m-0 to eliminate the inner <pre>'s default margin 
          // because we already applied my-6 (margin-y) on the wrapper!
          className="[&>pre]:!m-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  } catch (e) {
    return (
      <div className="code-block-wrapper relative group my-6">
        <CopyButton text={text} />
        <pre {...props} className="!m-0">{children}</pre>
      </div>
    );
  }
};
