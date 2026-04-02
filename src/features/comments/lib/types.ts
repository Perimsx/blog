export type CommentStatus = "approved" | "pending" | "rejected";

export type CommentModerationMode = "auto-approve" | "manual";

export interface CommentRecord {
  id: string;
  postSlug: string;
  parentId: string | null;
  authorName: string;
  qq: string;
  avatar: string;
  content: string;
  status: CommentStatus;
  location: string | null;
  browser: string | null;
  os: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export interface CommentTreeItem extends CommentRecord {
  replies: CommentTreeItem[];
}

export interface CommentListResponse {
  comments: CommentTreeItem[];
  totalCount: number;
  meta: {
    storage: "local-file";
    moderation: CommentModerationMode;
  };
}

export interface CreateCommentPayload {
  postSlug: string;
  parentId?: string | null;
  nickname: string;
  qq: string;
  content: string;
  website?: string;
}

export interface CreateCommentResponse {
  success: true;
  status: CommentStatus;
  message: string;
  meta: CommentListResponse["meta"];
}
