import { Router } from "express";
import { AiController } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const aiController = new AiController();

router.use(authenticate);

router.post("/generate-description", asyncHandler(aiController.generateDescription));
router.post("/chatbot", asyncHandler(aiController.chatbotQuery));
router.post("/generate-email", asyncHandler(aiController.generateEmail));
router.post("/social-kit", asyncHandler(aiController.generateSocialKit));
router.post("/generate-faqs", asyncHandler(aiController.generateFaqs));
router.post("/suggest-form-fields", asyncHandler(aiController.suggestFormFields));
router.post("/detect-duplicate", asyncHandler(aiController.detectDuplicate));
router.post("/moderate-content", asyncHandler(aiController.moderateContent));

export { router as aiRoutes };
