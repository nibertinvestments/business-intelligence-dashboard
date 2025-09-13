// Simplified auth configuration for initial setup
export const authOptions = {
  providers: [],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;