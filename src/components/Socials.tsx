import React from "react";
import Link from "next/link";
import { SOCIALS } from "@/lib/config";
import {
  IconGitHub,
  IconBrandX,
  IconBlueSky,
  IconLinkedin,
  IconMail,
  IconBilibili,
  IconDouyin,
} from "@/components/icons";

interface SocialsProps {
  centered?: boolean;
  compactOnMobile?: boolean;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  github: IconGitHub,
  twitter: IconBrandX,
  bluesky: IconBlueSky,
  linkedin: IconLinkedin,
  mail: IconMail,
  bilibili: IconBilibili,
  douyin: IconDouyin,
};

export const Socials: React.FC<SocialsProps> = ({ centered = false, compactOnMobile = false }) => {
  return (
    <div
      className={[
        "flex flex-wrap items-center",
        compactOnMobile ? "gap-2 sm:gap-1" : "gap-3 sm:gap-2",
        centered ? "justify-center" : "justify-center sm:justify-start",
      ].join(" ")}
    >
      {SOCIALS.filter((social) => social.active).map((social) => {
        const IconComponent = iconMap[social.icon];
        return (
          <Link
            key={social.name}
            href={social.href}
            className={[
              "group inline-block hover:text-accent hover:rotate-6",
              compactOnMobile ? "p-2 sm:p-1" : "p-2.5 sm:p-1",
            ].join(" ")}
            title={social.linkTitle}
          >
            {IconComponent && (
              <IconComponent
                className={[
                  "inline-block fill-transparent stroke-current stroke-2 opacity-90 group-hover:fill-transparent",
                  compactOnMobile
                    ? "size-5 scale-105 sm:size-6 sm:scale-110"
                    : "size-6 scale-125 sm:scale-110",
                ].join(" ")}
              />
            )}
            <span className="sr-only">{social.linkTitle}</span>
          </Link>
        );
      })}
    </div>
  );
};
