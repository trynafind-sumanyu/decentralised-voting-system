const crypto = require("crypto");

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_TOKEN_SECRET;

  if (!username || !password || !secret) {
    throw new Error("Admin authentication is not configured");
  }

  return { username, password, secret };
}

function createAdminToken(username) {
  const { secret } = getAdminConfig();
  const expiresAt = Date.now() + (12 * 60 * 60 * 1000);
  const payload = `${username}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

function verifyAdminToken(token) {
  try {
    const { secret } = getAdminConfig();
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [username, expiresAt, signature] = decoded.split(":");

    if (!username || !expiresAt || !signature) {
      return null;
    }

    const payload = `${username}:${expiresAt}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const receivedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return null;
    }

    if (Number(expiresAt) < Date.now()) {
      return null;
    }

    return { username, expiresAt: Number(expiresAt) };
  } catch (error) {
    return null;
  }
}

module.exports = {
  getAdminConfig,
  createAdminToken,
  verifyAdminToken,
};
