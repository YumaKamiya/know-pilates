import { google } from "googleapis";

const STUDIO_NAME = process.env.STUDIO_NAME || "know（ノウ）";
const STUDIO_EMAIL = process.env.STUDIO_EMAIL || "info@know-pilates.jp";

interface ReservationEmailData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message?: string;
}

function getGmailClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

function createMimeMessage(to: string, subject: string, html: string): string {
  const boundary = "boundary_" + Date.now().toString(16);

  const message = [
    `MIME-Version: 1.0`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(html).toString("base64"),
    `--${boundary}--`,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendEmail(to: string, subject: string, html: string) {
  const gmail = getGmailClient();
  if (!gmail) {
    throw new Error("Gmail client not configured");
  }

  const raw = createMimeMessage(to, subject, html);

  return gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });
}

function getCustomerConfirmationHtml(data: ReservationEmailData): string {
  const { name, date, time, message } = data;

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #5c6b5c; border-bottom: 2px solid #b5a289; padding-bottom: 10px;">
        ご予約ありがとうございます
      </h1>

      <p style="font-size: 16px; color: #333;">
        ${name} 様
      </p>

      <p style="font-size: 14px; color: #666;">
        ${STUDIO_NAME}の体験レッスンをご予約いただき、誠にありがとうございます。<br>
        以下の内容でご予約を承りました。
      </p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #5c6b5c; font-size: 18px; margin-top: 0;">ご予約内容</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #666;">ご予約日時</td>
            <td style="padding: 8px 0; font-weight: bold;">${date} ${time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">レッスン</td>
            <td style="padding: 8px 0;">体験レッスン（50分）</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">料金</td>
            <td style="padding: 8px 0;">3,000円（当日現金払い）</td>
          </tr>
        </table>
      </div>

      <div style="background: #fff8e6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b5a289;">
        <h3 style="color: #5c6b5c; font-size: 16px; margin-top: 0;">当日のご案内</h3>
        <ul style="font-size: 14px; color: #666; padding-left: 20px; margin-bottom: 0;">
          <li>動きやすい服装でお越しください</li>
          <li>お水をご持参ください</li>
          <li>開始10分前までにお越しください</li>
        </ul>
      </div>

      ${message ? `
      <div style="margin: 20px 0;">
        <p style="font-size: 14px; color: #666;">
          <strong>ご要望・ご質問:</strong><br>
          ${message}
        </p>
      </div>
      ` : ""}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="font-size: 14px; color: #666;">
          ご不明な点がございましたら、お気軽にお問い合わせください。
        </p>
        <p style="font-size: 14px; color: #666;">
          <strong>${STUDIO_NAME}</strong><br>
          ${STUDIO_EMAIL}<br>
          TEL: 054-000-0000
        </p>
      </div>
    </div>
  `;
}

function getStudioNotificationHtml(data: ReservationEmailData): string {
  const { name, email, phone, date, time, message } = data;

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #5c6b5c; border-bottom: 2px solid #b5a289; padding-bottom: 10px;">
        新規予約が入りました
      </h1>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #5c6b5c; font-size: 18px; margin-top: 0;">予約内容</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 120px;">予約日時</td>
            <td style="padding: 8px 0; font-weight: bold;">${date} ${time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">レッスン</td>
            <td style="padding: 8px 0;">体験レッスン（50分）</td>
          </tr>
        </table>
      </div>

      <div style="background: #e8f4e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #5c6b5c; font-size: 18px; margin-top: 0;">お客様情報</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 120px;">お名前</td>
            <td style="padding: 8px 0; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">メール</td>
            <td style="padding: 8px 0;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">電話番号</td>
            <td style="padding: 8px 0;">${phone}</td>
          </tr>
        </table>
      </div>

      ${message ? `
      <div style="background: #fff8e6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #5c6b5c; font-size: 16px; margin-top: 0;">ご要望・ご質問</h3>
        <p style="font-size: 14px; color: #666; margin-bottom: 0;">${message}</p>
      </div>
      ` : ""}

      <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px;">
        <p style="font-size: 12px; color: #888; margin: 0;">
          この予約はGoogleカレンダーおよびスプレッドシートにも記録されています。
        </p>
      </div>
    </div>
  `;
}

export async function sendReservationEmails(data: ReservationEmailData) {
  const gmail = getGmailClient();

  // Gmail APIが設定されていない場合はスキップ
  if (!gmail) {
    console.log("Gmail API not configured, skipping email notifications");
    return { skipped: true };
  }

  try {
    const results = await Promise.allSettled([
      // お客様への確認メール
      sendEmail(
        data.email,
        `【${STUDIO_NAME}】体験レッスンのご予約確認`,
        getCustomerConfirmationHtml(data)
      ),
      // スタジオへの通知メール
      sendEmail(
        STUDIO_EMAIL,
        `【新規予約】${data.date} ${data.time} - ${data.name}様`,
        getStudioNotificationHtml(data)
      ),
    ]);

    const customerResult = results[0];
    const studioResult = results[1];

    return {
      customer: customerResult.status === "fulfilled" ? customerResult.value : customerResult.reason,
      studio: studioResult.status === "fulfilled" ? studioResult.value : studioResult.reason,
    };
  } catch (error) {
    console.error("Failed to send emails:", error);
    throw error;
  }
}
