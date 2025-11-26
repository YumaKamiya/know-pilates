import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const sheetsId = process.env.GOOGLE_SHEETS_ID;

  // 環境変数の状態確認
  const envCheck = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: {
      exists: !!email,
      value: email || "(not set)",
      length: email?.length || 0,
    },
    GOOGLE_PRIVATE_KEY: {
      exists: !!privateKey,
      first40: privateKey?.slice(0, 40) || "(not set)",
      last20: privateKey?.slice(-20) || "(not set)",
      length: privateKey?.length || 0,
      hasLiteralBackslashN: privateKey?.includes("\\n") || false,
      hasRealNewlines: privateKey?.includes("\n") || false,
      startsCorrectly: privateKey?.startsWith("-----BEGIN PRIVATE KEY-----") || false,
      endsCorrectly: privateKey?.trimEnd().endsWith("-----END PRIVATE KEY-----") || false,
    },
    GOOGLE_CALENDAR_ID: {
      exists: !!calendarId,
      value: calendarId || "(not set)",
    },
    GOOGLE_SHEETS_ID: {
      exists: !!sheetsId,
      value: sheetsId || "(not set)",
    },
  };

  // 認証テスト
  let authResult: { success: boolean; error?: string; details?: string } = {
    success: false,
  };

  if (email && privateKey) {
    try {
      const processedKey = privateKey.replace(/\\n/g, "\n");
      const auth = new google.auth.JWT({
        email: email,
        key: processedKey,
        scopes: [
          "https://www.googleapis.com/auth/calendar",
          "https://www.googleapis.com/auth/spreadsheets",
        ],
      });

      await auth.authorize();
      authResult = { success: true };
    } catch (error) {
      authResult = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack?.slice(0, 200) : undefined,
      };
    }
  } else {
    authResult = {
      success: false,
      error: "Missing credentials",
    };
  }

  return NextResponse.json({
    envCheck,
    authResult,
    timestamp: new Date().toISOString(),
  });
}
