import { NextResponse } from "next/server";
import { getCommentRequestMeta } from "@/features/comments/lib/request-meta";
import { createComment, listApprovedComments } from "@/features/comments/lib/store";
import type { CreateCommentPayload } from "@/features/comments/lib/types";
import { SITE } from "@/lib/config";

export const dynamic = "force-dynamic";

function moderationMeta() {
  return {
    storage: "local-file" as const,
    moderation: SITE.comments.autoApprove ? "auto-approve" : "manual",
  };
}

function normalizeInput(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      meta: moderationMeta(),
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postSlug = normalizeInput(searchParams.get("postSlug"), 160);

  if (!postSlug) {
    return jsonError("缺少文章标识。");
  }

  const payload = await listApprovedComments(postSlug);
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  let payload: Partial<CreateCommentPayload>;

  try {
    payload = (await request.json()) as Partial<CreateCommentPayload>;
  } catch {
    return jsonError("请求体格式不正确。");
  }

  const postSlug = normalizeInput(payload.postSlug, 160);
  const parentId = normalizeInput(payload.parentId, 64);
  const nickname = normalizeInput(payload.nickname, 40);
  const qq = normalizeInput(payload.qq, 12);
  const content = normalizeInput(payload.content, 1000);
  const website = normalizeInput(payload.website, 64);

  if (website) {
    return jsonError("请求未通过校验。");
  }

  if (!postSlug) {
    return jsonError("缺少文章标识。");
  }

  if (nickname.length < 2) {
    return jsonError("昵称至少需要 2 个字符。");
  }

  if (!/^\d{5,12}$/.test(qq)) {
    return jsonError("请输入有效的 QQ 号，用于展示头像。");
  }

  if (content.length < 3) {
    return jsonError("评论内容至少需要 3 个字符。");
  }

  try {
    const result = await createComment(
      {
        postSlug,
        parentId: parentId || null,
        nickname,
        qq,
        content,
      },
      getCommentRequestMeta(request)
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "评论提交失败，请稍后再试。";
    return jsonError(message, 400);
  }
}
