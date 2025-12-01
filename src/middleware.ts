import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 許可するOrigin（本番環境では実際のドメインに変更）
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://know-pilates.vercel.app',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

export async function middleware(request: NextRequest) {
  // CSRF対策: POSTリクエストのOriginチェック
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    // Originがない場合はRefererをチェック（malformed URLに対応）
    let requestOrigin: string | null = origin;
    if (!requestOrigin && referer) {
      try {
        requestOrigin = new URL(referer).origin;
      } catch {
        // malformed referer（"null"等）は無視
        requestOrigin = null;
      }
    }

    // デバッグログ
    if (requestOrigin && !ALLOWED_ORIGINS.includes(requestOrigin)) {
      console.log('[CSRF Check Failed]', {
        method: request.method,
        path: request.nextUrl.pathname,
        origin,
        referer,
        requestOrigin,
        allowedOrigins: ALLOWED_ORIGINS,
      });
      return NextResponse.json(
        { error: '不正なリクエストです' },
        { status: 403 }
      );
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 管理者ページ・APIの保護
  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPage || isAdminApi) {
    if (!user) {
      if (isAdminApi) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // 管理者ロールチェック
    const role = user.app_metadata?.role;
    if (role !== 'admin') {
      if (isAdminApi) {
        return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // 会員ページの保護（登録ページは除外）
  const isMemberPage = pathname.startsWith('/member') &&
    !pathname.startsWith('/member/login') &&
    !pathname.startsWith('/member/register');
  const isMemberApi = pathname.startsWith('/api/member');

  if (isMemberPage || isMemberApi) {
    if (!user) {
      if (isMemberApi) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/member/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*', '/api/admin/:path*', '/api/member/:path*', '/api/auth/:path*'],
};
