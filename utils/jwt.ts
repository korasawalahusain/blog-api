import { JwtPayload, sign, verify } from "jsonwebtoken";

export const sign_jwt = (token_for: "admin" | "user", id: string): string => {
  return sign(
    { id },
    token_for === "admin"
      ? "ADMIN_ACCESS_TOKEN_SECRET"
      : "USER_ACCESS_TOKEN_SECRET",
    { expiresIn: "1d" }
  );
};

export const verify_token = (
  token_for: "admin" | "user",
  token: string
): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    verify(
      token,
      token_for === "admin"
        ? "ADMIN_ACCESS_TOKEN_SECRET"
        : "USER_ACCESS_TOKEN_SECRET",
      (error, payload) => {
        if (error) {
          return reject(error);
        }

        return resolve(payload as JwtPayload);
      }
    );
  });
};
