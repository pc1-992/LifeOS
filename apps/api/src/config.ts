export interface ApiConfig {
  apiPort: number;
  sqliteDatabasePath: string;
  allowedOrigins: Set<string>;
}

export const config: ApiConfig = {
  apiPort: getPort(process.env.PORT, 4000),
  sqliteDatabasePath:
    process.env.LIFEOS_SQLITE_PATH ?? "data/local/lifeos.sqlite",
  allowedOrigins: new Set(
    (process.env.LIFEOS_ALLOWED_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0)
  )
};

function getPort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    return fallback;
  }

  return parsed;
}
