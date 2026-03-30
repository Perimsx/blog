import nodemailer from "nodemailer";

export const prerender = false;

type ContactPayload = {
  name?: string;
  email?: string;
  qq?: string;
  message?: string;
};

const MAIL_USER = "1722288011@qq.com";
const MAIL_PASS = "yxuugbysnedzeeii";

const transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 465,
  secure: true,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const POST = async ({ request }: { request: Request }) => {
  try {
    const data = (await request.json()) as ContactPayload;
    const name = data.name?.trim() ?? "";
    const email = data.email?.trim() ?? "";
    const qq = data.qq?.trim() ?? "";
    const message = data.message?.trim() ?? "";

    if (!message) {
      return new Response(JSON.stringify({ success: false, error: "请填写留言内容" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await transporter.sendMail({
      from: `"博客联系人" <${MAIL_USER}>`,
      to: MAIL_USER,
      replyTo: email || undefined,
      subject: `博客新留言${qq ? ` [QQ: ${qq}]` : ""}${email ? ` [邮箱: ${email}]` : ""}`,
      text: [
        `姓名: ${name || "未填写"}`,
        `邮箱: ${email || "未填写"}`,
        `QQ: ${qq || "未填写"}`,
        "",
        "留言内容:",
        message,
      ].join("\n"),
      html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #006cac;">新的联系信息</h2>
              <p><strong>姓名:</strong> ${escapeHtml(name || "未填写")}</p>
              <p><strong>邮箱:</strong> ${escapeHtml(email || "未填写")}</p>
              <p><strong>QQ 号:</strong> ${escapeHtml(qq || "未填写")}</p>
              <p style="white-space: pre-wrap;"><strong>留言内容:</strong><br/>${escapeHtml(message).replaceAll("\n", "<br/>")}</p>
            </div>`,
    });

    return new Response(JSON.stringify({ success: true, message: "邮件发送成功！" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Mail send error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "发送失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
