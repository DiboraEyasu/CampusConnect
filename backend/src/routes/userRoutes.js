const express = require("express")

const authenticate = require("../middleware/authenticate");

const {getMyProfile, updateMyProfile} = require("../controllers/userController");

const router = express.Router();

router.get("/me", authenticate, getMyProfile);
router.patch("/me", authenticate, updateMyProfile);

module.exports = router;