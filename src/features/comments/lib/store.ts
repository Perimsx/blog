import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { SITE } from "@/lib/config";
import type { CommentRequestMeta } from "./request-meta";
import type {
  CommentListResponse,
  CommentModerationMode,
  CommentRecord,
  CreateCommentPayload,
  CreateCommentResponse,
} from "./types";
import { buildCommentTree, buildQqAvatarUrl, countComments } from "./utils";

const COMMENT_DATA_FILE = path.join(process.cwd(), ".data", "comments.local.json");

let commentsDatabaseQueue: Promise<unknown> = Promise.resolve();

function withDatabaseLock<T>(task: () => Promise<T>) {
  const run = commentsDatabaseQueue.then(task, task);
  commentsDatabaseQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

type CommentDatabase = {
  comments: CommentRecord[];
};

function getModerationMode(): CommentModerationMode {
  return SITE.comments.autoApprove ? "auto-approve" : "manual";
}

async function readDatabase(): Promise<CommentDatabase> {
  try {
    const raw = await fs.readFile(COMMENT_DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<CommentDatabase>;

    return {
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { comments: [] };
    }

    throw error;
  }
}

async function writeDatabase(database: CommentDatabase) {
  await fs.mkdir(path.dirname(COMMENT_DATA_FILE), { recursive: true });
  await fs.writeFile(COMMENT_DATA_FILE, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

function createCommentRecord(
  payload: CreateCommentPayload,
  meta: CommentRequestMeta,
  status: CommentRecord["status"]
): CommentRecord {
  return {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    postSlug: payload.postSlug,
    parentId: payload.parentId ?? null,
    authorName: payload.nickname,
    qq: payload.qq,
    avatar: buildQqAvatarUrl(payload.qq),
    content: payload.content,
    status,
    location: meta.location,
    browser: meta.browser,
    os: meta.os,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };
}

export async function listApprovedComments(postSlug: string): Promise<CommentListResponse> {
  return withDatabaseLock(async () => {
    const database = await readDatabase();
    const approvedRecords = database.comments.filter(
      (comment) => comment.postSlug === postSlug && comment.status === "approved"
    );
    const comments = buildCommentTree(approvedRecords);

    return {
      comments,
      totalCount: countComments(comments),
      meta: {
        storage: "local-file",
        moderation: getModerationMode(),
      },
    };
  });
}

export async function createComment(
  payload: CreateCommentPayload,
  meta: CommentRequestMeta
): Promise<CreateCommentResponse> {
  return withDatabaseLock(async () => {
    const database = await readDatabase();

    if (payload.parentId) {
      const parentComment = database.comments.find(
        (comment) => comment.id === payload.parentId && comment.postSlug === payload.postSlug
      );

      if (!parentComment) {
        throw new Error("回复目标不存在，可能已经被删除。");
      }
    }

    const status: CommentRecord["status"] = SITE.comments.autoApprove ? "approved" : "pending";
    const record = createCommentRecord(payload, meta, status);

    database.comments.push(record);
    await writeDatabase(database);

    return {
      success: true,
      status,
      message:
        status === "approved" ? "评论已发布，感谢你的分享。" : "评论已提交，审核通过后会显示。",
      meta: {
        storage: "local-file",
        moderation: getModerationMode(),
      },
    };
  });
}
