import "../.astro/types";

declare global {
  interface Window {
    __backToTopCleanup?: () => void;
    __contactModalCleanup?: () => void;
    __headerCleanup?: () => void;
    __postDetailsCleanup?: () => void;
    __searchModalCleanup?: () => void;
    twttr?: {
      widgets?: {
        load: () => void;
      };
    };
  }
}
