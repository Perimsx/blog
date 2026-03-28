function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractCodeBlockTitle(meta) {
  if (!meta) return undefined;

  const patterns = [
    /\b(?:title|filename|file)="([^"]+)"/,
    /\b(?:title|filename|file)='([^']+)'/,
    /\b(?:title|filename|file)=([^\s]+)/
  ];

  for (const pattern of patterns) {
    const match = meta.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

function visitChildren(node) {
  if (!node || !Array.isArray(node.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (child?.type === "code") {
      const title = extractCodeBlockTitle(child.meta);
      if (title) {
        node.children.splice(index, 0, {
          type: "html",
          value: `<div class="code-block-title">${escapeHtml(title)}</div>`
        });
        index += 1;
      }
    }

    visitChildren(child);
  }
}

export function remarkCodeBlockTitle() {
  return tree => {
    visitChildren(tree);
  };
}
