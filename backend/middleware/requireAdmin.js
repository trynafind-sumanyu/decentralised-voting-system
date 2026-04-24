const { verifyAdminToken } = require("../utils/adminAuth");

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Admin authentication required",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const adminUser = verifyAdminToken(token);

  if (!adminUser) {
    return res.status(401).json({
      message: "Admin session is invalid or expired",
    });
  }

  req.adminUser = adminUser;
  next();
}

module.exports = requireAdmin;
