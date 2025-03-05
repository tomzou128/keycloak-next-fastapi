declare namespace NodeJS {
  interface ProcessEnv {
    // 定义你所用到的环境变量类型
    KEYCLOAK_CLIENT_ID: string;
    KEYCLOAK_CLIENT_SECRET: string;
    KEYCLOAK_ISSUER: string;

    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
  }
}
