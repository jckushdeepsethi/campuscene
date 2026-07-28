import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import { ErrorCodes } from "../errors/error-codes.js";
import { EventService } from "../services/event.service.js";
import { AiService } from "../services/ai.service.js";
import { EventRepository } from "../repositories/event.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

const eventService = new EventService();
const aiService = new AiService();
const eventRepository = new EventRepository();
const userRepository = new UserRepository();

export class EventController {
  createEvent: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const event = await eventService.createEvent(req.auth, req.body);

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: { event }
    });
  };

  listEvents: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const result = await eventService.listEvents(req.auth, req.query as any);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  };

  getEventById: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const id = req.params.id as string;
    const event = await eventService.getEventById(req.auth, id);

    res.status(200).json({
      success: true,
      data: { event }
    });
  };

  updateEvent: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const id = req.params.id as string;
    const event = await eventService.updateEvent(req.auth, id, req.body);

    res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      data: { event }
    });
  };

  deleteEvent: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const id = req.params.id as string;
    const result = await eventService.deleteEvent(req.auth, id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  };

  registerForEvent: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const eventId = req.params.id as string;
    const registration = await eventService.registerForEvent(req.auth, eventId);

    res.status(201).json({
      success: true,
      message: registration.status === "WAITLISTED"
        ? "Event capacity reached. You have been added to the waitlist."
        : "Successfully registered for event.",
      data: { registration }
    });
  };

  getEventRegistrations: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const eventId = req.params.id as string;
    const registrations = await eventService.getEventRegistrations(req.auth, eventId);

    res.status(200).json({
      success: true,
      data: { registrations }
    });
  };

  approveOrRejectEvent: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const eventId = req.params.id as string;
    const event = await eventService.approveOrRejectEvent(req.auth, eventId, req.body);

    res.status(200).json({
      success: true,
      message: `Event ${event.status === "PUBLISHED" ? "approved and published" : "rejected"}.`,
      data: { event }
    });
  };

  markAttendance: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const eventId = req.params.id as string;
    const registrationId = req.params.registrationId as string;
    const registration = await eventService.markAttendance(req.auth, eventId, registrationId, req.body);

    res.status(200).json({
      success: true,
      message: "Attendance updated.",
      data: { registration }
    });
  };

  cancelRegistration: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const eventId = req.params.id as string;
    const result = await eventService.cancelRegistration(req.auth, eventId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  };

  exportAttendeesCsv: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const eventId = req.params.id as string;
    const csvContent = await eventService.exportAttendeesCsv(req.auth, eventId);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="event-${eventId}-attendees.csv"`);
    res.status(200).send(csvContent);
  };

  getAnalytics: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const analytics = await eventService.getAnalytics(req.auth);

    res.status(200).json({
      success: true,
      data: analytics
    });
  };

  generateEventAiDetails: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const { title, category, additionalDetails } = req.body;
    if (!title || typeof title !== "string") {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "Event title is required for AI generation.");
    }

    const suggestion = await aiService.generateEventDescription({ title, category, shortNotes: additionalDetails });

    res.status(200).json({
      success: true,
      data: suggestion
    });
  };

  getCertificate: RequestHandler = async (req, res) => {
    const auth = req.auth;
    if (!auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required.");
    }

    const { id } = req.params;
    const eventId = String(id);
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Event not found.");
    }

    const user = await userRepository.findById(auth.userId);
    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found.");
    }

    const certificateId = `CERT-CC-${eventId.slice(-6).toUpperCase()}-${user.id.slice(-6).toUpperCase()}`;

    res.status(200).json({
      success: true,
      data: {
        certificateId,
        studentName: user.name,
        collegeName: user.collegeName || event.collegeName || "Campus University",
        eventTitle: event.title,
        organizerName: event.organizer?.name || "Campus Event Committee",
        issuedAt: new Date().toISOString(),
        status: "ATTENDED",
        verificationHash: Buffer.from(`${certificateId}:${user.email}`).toString("hex").slice(0, 16)
      }
    });
  };
}


