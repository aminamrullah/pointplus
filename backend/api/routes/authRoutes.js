const express = require("express");
const router = express.Router();
const authController = require("../../controllers/api/authController");
const { authenticate } = require("../../middleware/jwtAuth");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authenticate, authController.logout);
router.get("/validate-token", authController.validateToken);
router.get("/logo", authController.loginLogo);

module.exports = router;
