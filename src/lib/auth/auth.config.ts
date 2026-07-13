export interface AuthConfig {
  providers: string[]
  pages: Record<string, string>
  session: Record<string, unknown>
}

export const authConfig: AuthConfig = {
  providers: ["google", "credentials"],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
}
