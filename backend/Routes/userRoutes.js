const express = require("express");
const controller = require("../controllers/userController");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(authenticate, authorizeRoles("COMPANY_ADMIN"));

router.route("/").post(controller.createUser).get(controller.getUsers);
router.route("/:id").get(controller.getUserById).put(controller.updateUser).delete(controller.deleteUser);

module.exports = router;
