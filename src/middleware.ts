import { auth } from "@/auth";

export default auth;

export const runtime = 'nodejs';

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
