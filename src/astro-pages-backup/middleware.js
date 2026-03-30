export const onRequest = async (context, next) => {
  const url = new URL(context.request.url);
  const { pathname, search } = url;

  // Normalize stale Pagefind URLs that may include the client output prefix.
  if (pathname === "/client" || pathname.startsWith("/client/")) {
    const normalizedPath = pathname === "/client" ? "/" : pathname.slice("/client".length);
    return context.redirect(`${normalizedPath || "/"}${search}`, 301);
  }

  // Normalize trailing slashes globally for trailingSlash: "never".
  if (
    pathname.length > 1 &&
    pathname.endsWith("/") &&
    !pathname.startsWith("/pagefind/") &&
    !/\.[a-z0-9]+$/i.test(pathname)
  ) {
    return context.redirect(`${pathname.slice(0, -1)}${search}`, 301);
  }

  // Normalize the posts index URL for trailingSlash: "never"
  if (pathname === "/posts/") {
    return context.redirect("/posts", 301);
  }

  // Redirect /blog/ paths to /posts/
  if (pathname.startsWith("/blog/")) {
    return context.redirect("/posts/" + pathname.slice(6), 301);
  }

  // Redirect /blog to /posts
  if (pathname === "/blog" || pathname === "/blog/") {
    return context.redirect("/posts", 301);
  }

  return next();
};
