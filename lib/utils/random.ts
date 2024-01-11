import crypto from "crypto";

export async function randomStr(len: number) {
  if (len <= 0) {
    return "";
  }

  const p = new Promise<string>((resolve, reject) => {
    crypto.randomBytes(len, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString("hex").substring(0, len));
      }
    });
  });

  return p;
}

export function randomStrSync(len: number) {
  if (len <= 0) {
    return "";
  }

  return crypto.randomBytes(len).toString("hex").substring(0, len);
}
