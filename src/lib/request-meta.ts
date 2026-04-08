import type { AnalyticsRequestMeta } from "@/features/analytics/lib/request-meta";
import type { CommentRequestMeta } from "@/features/comments/lib/request-meta";

export {
  getAnalyticsRequestMeta,
  normalizeReferrerSource,
} from "@/features/analytics/lib/request-meta";
export { getCommentRequestMeta } from "@/features/comments/lib/request-meta";

export type { AnalyticsRequestMeta, CommentRequestMeta };
