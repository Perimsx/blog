export const slugifyStr = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
