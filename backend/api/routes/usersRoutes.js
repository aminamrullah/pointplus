const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/jwtAuth");
const usersController = require("../../controllers/api/usersController");

router.post("/", authenticate, usersController.createUser);
router.get("/", authenticate, usersController.listUsers);
router.get("/:id", authenticate, usersController.getUser);
router.put("/:id", authenticate, usersController.updateUser);
router.delete("/:id", authenticate, usersController.deleteUser);

module.exports = router;
