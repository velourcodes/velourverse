const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";

export const ENV = {
  NODE_ENV,
  IS_PROD,

  PORT: Number(process.env.PORT || 8500),

  FRONTEND_URL: process.env.FRONTEND_URL,

  DB: {
    URL: process.env.MONGODB_URI,
    NAME: process.env.MONGODB_DB_NAME,
  },

  COOKIE: {
    SECURE: IS_PROD,
    SAME_SITE: IS_PROD ? "none" : "lax",
  },

  TOKENS: {
    ACCESS_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET,
  },
};
