import type { CommentRecord, CommentTreeItem } from "./types";

const commentDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function buildQqAvatarUrl(qq?: string | null) {
  if (!qq || !/^\d{5,12}$/.test(qq)) {
    return "";
  }

  return `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`;
}

export function formatCommentTime(value: string) {
  return commentDateFormatter.format(new Date(value));
}

export function countComments(items: CommentTreeItem[]): number {
  return items.reduce((total, item) => total + 1 + countComments(item.replies), 0);
}

export function buildCommentTree(records: CommentRecord[]) {
  const sortedRecords = [...records].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

  const nodeMap = new Map<string, CommentTreeItem>();
  const roots: CommentTreeItem[] = [];

  for (const record of sortedRecords) {
    nodeMap.set(record.id, {
      ...record,
      replies: [],
    });
  }

  for (const node of nodeMap.values()) {
    if (!node.parentId) {
      roots.push(node);
      continue;
    }

    const parent = nodeMap.get(node.parentId);
    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  roots.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
  return roots;
}
