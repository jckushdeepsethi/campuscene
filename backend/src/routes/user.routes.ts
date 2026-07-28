import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const userController = new UserController();

router.use(authenticate);

router.get("/organizers/pending", asyncHandler(userController.getPendingOrganizers));
router.post("/:userId/verify-organizer", asyncHandler(userController.verifyOrganizer));
router.put("/profile", asyncHandler(userController.updateProfile));

export { router as userRoutes };
