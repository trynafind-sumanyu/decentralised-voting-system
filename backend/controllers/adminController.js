const {
  getAdminConfig,
  createAdminToken,
  verifyAdminToken,
} = require("../utils/adminAuth");

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "username and password are required",
      });
    }

    const config = getAdminConfig();
    if (username !== config.username || password !== config.password) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    const token = createAdminToken(username);

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        username,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in as admin",
      error: error.message,
    });
  }
};

exports.getAdminSession = async (req, res) => {
  try {
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

    res.status(200).json({
      message: "Admin session is active",
      admin: {
        username: adminUser.username,
        expiresAt: adminUser.expiresAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying admin session",
      error: error.message,
    });
  }
};
