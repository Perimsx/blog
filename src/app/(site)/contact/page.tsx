export default function ContactPage() {
  return (
    <main id="main-content" className="ui-page layout-frame page-shell">
      <h1 className="mt-6 text-[1.75rem] font-semibold tracking-tight sm:mt-8 sm:text-3xl">
        Contact
      </h1>
      <p className="mt-2 mb-5 text-sm italic sm:mb-6">Reach me directly ...</p>

      <div className="space-y-7 sm:space-y-8">
        <p className="text-[0.95rem] leading-7 text-foreground/80 sm:text-base">
          联系表单和站内投递功能已经下线。如果你想联系我，可以直接通过下面这些方式。
        </p>

        <div className="flex flex-wrap gap-3 sm:gap-4">
          <a
            href="https://wpa.qq.com/msgrd?v=3&uin=1722288011&site=qq&menu=yes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2.5 text-[0.95rem] text-white transition-opacity hover:opacity-90 sm:w-auto sm:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.38 0 2.5 1.12 2.5 2.5 0 .65-.25 1.24-.66 1.67-.41.43-.66 1.02-.66 1.67 0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5c0-.65.25-1.24.66-1.67.41-.43.66-1.02.66-1.67C14.5 6.12 13.38 5 12 5z" />
              <path d="M7.88 11.67c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4.12 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
            </svg>
            QQ 联系
          </a>
          <a
            href="https://github.com/Perimsx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-muted px-4 py-2.5 text-[0.95rem] text-foreground transition-colors hover:bg-accent/20 sm:w-auto sm:text-base"
          >
            GitHub
          </a>
        </div>

        <hr className="border-border" />

        <section className="max-w-lg rounded-xl border border-border/70 bg-muted/15 px-4 py-4 sm:px-5">
          <h2 className="text-[1rem] font-semibold text-foreground sm:text-[1.05rem]">
            当前联系说明
          </h2>
          <p className="mt-2 text-[0.92rem] leading-7 text-foreground/72 sm:text-[0.96rem]">
            站内留言和邮箱投递功能已经移除，主要是为了减少无效函数部署和维护成本。现在更推荐通过 QQ
            或 GitHub 与我联系。
          </p>
        </section>
      </div>
    </main>
  );
}
