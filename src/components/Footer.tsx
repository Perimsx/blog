import { Socials } from "@/components/Socials";

function Hr({ noPadding = false }: { noPadding?: boolean }) {
  return (
    <div className={`max-w-3xl mx-auto ${noPadding ? "px-0" : "px-4"}`}>
      <hr className="border-border" aria-hidden />
    </div>
  );
}

interface FooterProps {
  noMarginTop?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ noMarginTop = false }) => {
  return (
    <footer className={["w-full", !noMarginTop ? "mt-auto" : ""].join(" ")}>
      <Hr noPadding />
      <div className="flex flex-col items-center justify-between py-3 sm:flex-row-reverse sm:py-4">
        <Socials centered compactOnMobile />
        <div className="my-2 flex flex-col items-center whitespace-nowrap text-[0.82rem] sm:items-start sm:text-sm">
          <a
            href="https://github.com/Perimsx/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            CC BY 4.0 · Code MIT
          </a>
          <div className="mt-1.5 flex flex-col items-center gap-1 text-[0.72rem] opacity-70 sm:mt-1 sm:flex-row sm:gap-3 sm:text-xs">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              鄂ICP备2025157857号
            </a>
            <a
              href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42018502008592"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent flex items-center gap-1 sm:mt-0"
            >
              <img
                src="https://img.alicdn.com/tfs/TB1..50QpXXXXX7XpXXXXXXXXXX-20-20.png"
                alt="公安备案图标"
                className="w-3.5 h-3.5"
              />
              鄂公网安备42018502008592号
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
