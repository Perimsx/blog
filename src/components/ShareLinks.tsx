"use client";

import React, { useState } from "react";
import { SHARE_LINKS } from "@/lib/config";
import {
  IconWechat,
  IconQQ,
  IconBrandX,
  IconTelegram,
  IconFacebook,
} from "@/components/icons";

interface ShareLinksProps {
  url: string;
  title: string;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  wechat: IconWechat,
  qq: IconQQ,
  twitter: IconBrandX,
  telegram: IconTelegram,
  facebook: IconFacebook,
};

export const ShareLinks: React.FC<ShareLinksProps> = ({ url, title }) => {
  const [isWechatModalOpen, setIsWechatModalOpen] = useState(false);

  const handleWechatClick = () => {
    setIsWechatModalOpen(true);
  };

  const closeWechatModal = () => {
    setIsWechatModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <span className="text-sm text-foreground/60 mr-1">分享到</span>
        <div className="flex gap-1">
          {SHARE_LINKS.map((social) => {
            const IconComponent = iconMap[social.icon];
            const isWechat = social.icon === "wechat";

            if (isWechat) {
              return (
                <button
                  key={social.name}
                  className="group inline-block p-2 hover:rotate-6 transition-transform"
                  title={social.linkTitle}
                  onClick={handleWechatClick}
                >
                  {IconComponent && (
                    <IconComponent className="inline-block size-5 fill-transparent stroke-current stroke-2 opacity-80 group-hover:fill-transparent" />
                  )}
                  <span className="sr-only">{social.linkTitle}</span>
                </button>
              );
            }

            const shareUrl = `${social.href}${encodeURIComponent(url)}`;

            return (
              <a
                key={social.name}
                href={shareUrl}
                className="inline-block p-2 hover:rotate-6 hover:text-accent"
                title={social.linkTitle}
                target="_blank"
                rel="noopener noreferrer"
              >
                {IconComponent && (
                  <IconComponent className="inline-block size-5 fill-transparent stroke-current stroke-2 opacity-80 group-hover:fill-transparent" />
                )}
                <span className="sr-only">{social.linkTitle}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* WeChat QR Code Modal */}
      {isWechatModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeWechatModal}
        >
          <div
            className="bg-background border border-border rounded-lg p-6 text-center max-w-xs mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-foreground font-medium">扫码分享到微信</p>
            <div className="flex justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`}
                alt="QR Code"
                width={200}
                height={200}
                style={{ borderRadius: "8px" }}
              />
            </div>
            <button
              onClick={closeWechatModal}
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
};
