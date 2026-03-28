import { visit } from "unist-util-visit";
import { shouldProxyExternalImage, toImageProxyUrl } from "./imageProxy.mjs";

function findAttribute(node, name) {
  return node.attributes?.find((attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === name);
}

function upsertStringAttribute(node, name, value) {
  const existing = findAttribute(node, name);
  if (existing) {
    if (typeof existing.value === "string" || existing.value === null) {
      existing.value = value;
    }
    return;
  }

  node.attributes = node.attributes || [];
  node.attributes.push({
    type: "mdxJsxAttribute",
    name,
    value,
  });
}

export function remarkProxyExternalImages() {
  return (tree) => {
    visit(tree, "image", (node) => {
      if (typeof node.url === "string" && shouldProxyExternalImage(node.url)) {
        node.url = toImageProxyUrl(node.url);
      }
    });

    visit(tree, (node) => node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement", (node) => {
      if (!["img", "AdaptiveImage"].includes(node.name)) return;

      const srcAttribute = findAttribute(node, "src");
      if (!srcAttribute || typeof srcAttribute.value !== "string") return;

      if (shouldProxyExternalImage(srcAttribute.value)) {
        srcAttribute.value = toImageProxyUrl(srcAttribute.value);
      }

      if (node.name === "img" && !findAttribute(node, "loading")) {
        upsertStringAttribute(node, "loading", "lazy");
      }
    });
  };
}

