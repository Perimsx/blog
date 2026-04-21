"use client";

import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { IconBrandX, IconFacebook, IconQQ, IconTelegram, IconWechat } from "@/components/icons";
import { SHARE_LINKS } from "@/lib/config";

interface ShareLinksProps {
  url: string;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  wechat: IconWechat,
  qq: IconQQ,
  twitter: IconBrandX,
  telegram: IconTelegram,
  facebook: IconFacebook,
};

export const ShareLinks: React.FC<ShareLinksProps> = ({ url }) => {
  const [isWechatModalOpen, setIsWechatModalOpen] = useState(false);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  const handleWechatClick = () => {
    setIsWechatModalOpen(true);
  };

  const closeWechatModal = () => {
    setIsWechatModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground/60 mr-1.5">分享到</span>
        <div className="flex gap-2">
          {SHARE_LINKS.map((social) => {
            const IconComponent = iconMap[social.icon];
            const isWechat = social.icon === "wechat";

            if (isWechat) {
              return (
                <button
                  type="button"
                  key={social.name}
                  className="group inline-block p-2 hover:rotate-6 transition-transform"
                  title={social.linkTitle}
                  aria-haspopup="dialog"
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
          role="presentation"
        >
          <button
            type="button"
            aria-label="关闭微信分享弹窗"
            className="absolute inset-0 border-0 bg-transparent p-0"
            onClick={closeWechatModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wechat-share-title"
            className="bg-background border border-border rounded-lg p-6 text-center max-w-xs mx-4 shadow-xl"
          >
            <p id="wechat-share-title" className="mb-4 text-foreground font-medium">
              扫码分享到微信
            </p>
            <div className="flex justify-center mb-4">
              <Image
                src={qrCodeUrl}
                alt="QR Code"
                width={200}
                height={200}
                unoptimized
                style={{ borderRadius: "8px" }}
              />
            </div>
            <button
              type="button"
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
