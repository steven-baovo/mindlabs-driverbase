import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

async function refreshAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token"
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken || "",
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    console.log("[Auth] Tự động làm mới Google Access Token thành công.")
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Giữ refresh_token cũ nếu không có cái mới
    }
  } catch (error) {
    console.error("[Auth] Lỗi khi cố gắng làm mới Access Token:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.appdata",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Đăng nhập lần đầu: Lưu thông tin Access Token, Refresh Token và thời gian hết hạn
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at ?? Math.floor(Date.now() / 1000) + 3600
        return token
      }

      // Các lần gọi sau: Nếu token còn hạn (trên 1 phút trước khi hết hạn), sử dụng tiếp
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000 - 60000) {
        return token
      }

      // Nếu đã hết hạn: Kích hoạt làm mới tự động bằng refresh_token
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      // @ts-ignore
      session.accessToken = token.accessToken
      // @ts-ignore
      session.error = token.error
      return session
    }
  }
})
