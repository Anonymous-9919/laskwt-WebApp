import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_SESSION_COOKIE } from "@/lib/auth/demo-session";

function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export async function updateSession(request: NextRequest) {
  // Demo mode: no Supabase credentials configured — use the demo session cookie.
  if (isMockMode()) {
    const sessionId = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith("/login");
    const isPdfRoute = request.nextUrl.pathname.startsWith("/api/pdf");
    const isPublicEmployeeRoute =
      request.nextUrl.pathname.startsWith("/api/directories/employees") ||
      request.nextUrl.pathname.startsWith("/api/auth/employee-login");

    if (!sessionId && !isAuthPage && !isPdfRoute && !isPublicEmployeeRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirected", "1");
      return NextResponse.redirect(url);
    }

    if (sessionId && isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.delete("redirected");
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll: ((cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }) satisfies SetAllCookies,
      },
    }
  );

  const isPdfRoute = request.nextUrl.pathname.startsWith("/api/pdf");
  const isPublicEmployeeRoute =
    request.nextUrl.pathname.startsWith("/api/directories/employees") ||
    request.nextUrl.pathname.startsWith("/api/auth/employee-login");
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  if (isPdfRoute || isPublicEmployeeRoute) {
    return supabaseResponse;
  }

  // Use getCookies() instead of getUser() - no network call, just reads the JWT
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirected", "1");
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.delete("redirected");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
