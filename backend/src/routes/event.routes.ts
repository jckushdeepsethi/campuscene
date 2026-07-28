import { Router } from "express";
import { EventController } from "../controllers/event.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createEventSchema,
  eventApprovalSchema,
  listEventsQuerySchema,
  updateAttendanceSchema,
  updateEventSchema
} from "../validators/event.validator.js";

const router = Router();
const eventController = new EventController();

router.post(
  "/",
  authenticate,
  authorize("SOCIETY", "PLACEMENT_CELL", "ADMIN"),
  validateBody(createEventSchema),
  asyncHandler(eventController.createEvent)
);

router.post(
  "/ai-generate",
  authenticate,
  authorize("SOCIETY", "PLACEMENT_CELL", "ADMIN"),
  asyncHandler(eventController.generateEventAiDetails)
);

router.get(
  "/:id/certificate",
  authenticate,
  asyncHandler(eventController.getCertificate)
);

router.get(
  "/",
  authenticate,
  validateQuery(listEventsQuerySchema),
  asyncHandler(eventController.listEvents)
);

router.get(
  "/analytics",
  authenticate,
  authorize("SOCIETY", "PLACEMENT_CELL", "ADMIN"),
  asyncHandler(eventController.getAnalytics)
);

router.get(
  "/:id",
  authenticate,
  asyncHandler(eventController.getEventById)
);

router.patch(
  "/:id",
  authenticate,
  authorize("SOCIETY", "PLACEMENT_CELL", "ADMIN"),
  validateBody(updateEventSchema),
  asyncHandler(eventController.updateEvent)
);

router.delete(
  "/:id",
  authenticate,
  authorize("SOCIETY", "PLACEMENT_CELL", "ADMIN"),
  asyncHandler(eventController.deleteEvent)
);

router.post(
  "/:id/register",
  authenticate,
  asyncHandler(eventController.registerForEvent)
);

router.delete(
  "/:id/register",
  authenticate,
  asyncHandler(eventController.cancelRegistration)
);

router.get(
  "/:id/export",
  authenticate,
  authorize("SOCIETY", "PLACEMENT_CELL", "ADMIN"),
  asyncHandler(eventController.exportAttendeesCsv)
);

router.get(
  "/:id/registrations",
  authenticate,
  authorize("SOCIETY", "PLACEMENT_CELL", "ADMIN"),
  asyncHandler(eventController.getEventRegistrations)
);

router.patch(
  "/:id/approval",
  authenticate,
  authorize("ADMIN"),
  validateBody(eventApprovalSchema),
  asyncHandler(eventController.approveOrRejectEvent)
);

router.patch(
  "/:id/attendance/:registrationId",
  authenticate,
  authorize("SOCIETY", "PLACEMENT_CELL", "ADMIN"),
  validateBody(updateAttendanceSchema),
  asyncHandler(eventController.markAttendance)
);

export { router as eventRoutes };
