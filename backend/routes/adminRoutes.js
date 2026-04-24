const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  getAdminSession,
} = require("../controllers/adminController");

router.post("/login", loginAdmin);
router.get("/session", getAdminSession);

module.exports = router;
