import nodemailer from "nodemailer";

export const prerender = false;

export const POST = async ({ request }: { request: Request }) => {
  try {
    const data = await request.json();
    const { qq, message } = data;

    // 请将下面的 YOUR_EMAIL@163.com 替换为您真实的 163 邮箱地址
    const transporter = nodemailer.createTransport({
      host: "smtp.163.com",
      port: 465,
      secure: true,
      auth: {
        user: "YOUR_EMAIL@163.com", 
        pass: "NAipqC8Hz8k4NNGa", // 您提供的授权码
      },
    });

    await transporter.sendMail({
      from: `"博客联系人" <YOUR_EMAIL@163.com>`,
      to: "YOUR_EMAIL@163.com",
      subject: `来自博客联系人 [QQ: ${qq}] 的邮件`,
      text: `QQ: ${qq}\n信息: ${message}`,
      html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #006cac;">新的联系信息</h2>
              <p><strong>QQ号:</strong> ${qq}</p>
              <p style="white-space: pre-wrap;"><strong>留言内容:</strong><br/>${message}</p>
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
