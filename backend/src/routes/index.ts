import { Router } from "express";
import { aiRoutes } from "./ai.routes.js";
import { authRoutes } from "./auth.routes.js";
import { eventRoutes } from "./event.routes.js";
import { userRoutes } from "./user.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "campuscene-api"
  });
});

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/users", userRoutes);
router.use("/ai", aiRoutes);

export { router as apiRoutes };
