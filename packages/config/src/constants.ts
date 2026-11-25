import { env } from "./env";

export const APP_CONFIG = {
  name: "3D Бирка",
  shortName: "3D Бирка",
  url: env.NEXT_PUBLIC_APP_URL,
} as const;
