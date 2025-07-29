const express = require("express");
const authController = require("../controllers/authControllers");

const router = express.Router();
router.post("/signup", authController.uploadPhoto, authController.resizeImage, authController.signup).post("/login", authController.login);
module.exports = router;