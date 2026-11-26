const ROOTS = {
  DASHBOARD: "/",
  AUTH: "/auth",
  SETTINGS: "/settings",
  LEGAL: "/legal",
  BLOG: "/blog",
} as const;

export const paths = {
  dashboard: {
    root: ROOTS.DASHBOARD,
  },
  auth: {
    root: ROOTS.AUTH,
    login: `${ROOTS.AUTH}/login`,
    signup: `${ROOTS.AUTH}/signup`,
    otp: `${ROOTS.AUTH}/otp`,
    forgotPassword: `${ROOTS.AUTH}/forgot-password`,
    resetPassword: `${ROOTS.AUTH}/reset-password`,
  },
  settings: {
    root: ROOTS.SETTINGS,
    profile: `${ROOTS.SETTINGS}/profile`,
    security: `${ROOTS.SETTINGS}/security`,
  },
  legal: {
    root: ROOTS.LEGAL,
    offer: `${ROOTS.LEGAL}/offer`,
    privacy: `${ROOTS.LEGAL}/privacy`,
    consent: `${ROOTS.LEGAL}/consent`,
    delivery: `${ROOTS.LEGAL}/delivery`,
    cookies: `${ROOTS.LEGAL}/cookies`,
  },
  blog: {
    root: ROOTS.BLOG,
  },
} as const;
