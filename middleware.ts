export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/players/:path*", 
    "/games/:path*", 
    "/tournaments/:path*",
    "/player/wellness/:path*",
    "/player/wellness"
  ],
}

