import { Socials } from "@/components/Socials";

interface FooterProps {
  noMarginTop?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ noMarginTop = false }) => {
  return (
    <footer className={["w-full", !noMarginTop ? "mt-auto" : "mt-0"].join(" ")}>
      <div className="flex flex-col items-center justify-between pt-0 pb-4 sm:flex-row-reverse sm:gap-0 gap-5">
        <Socials centered compactOnMobile />
        <div className="flex flex-col items-center whitespace-nowrap text-[0.8rem] text-foreground/50 sm:items-start gap-1.5">
          <a
            href="https://github.com/Perimsx/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors duration-200 font-medium"
          >
            CC BY 4.0 · Code MIT
          </a>
          <div className="flex flex-col items-center gap-1.5 opacity-80 sm:flex-row sm:gap-3 text-[0.75rem]">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors duration-200"
            >
              鄂ICP备2025157857号
            </a>
            <a
              href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42018502008592"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors duration-200"
            >
              鄂公网安备 42018502008592号
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
