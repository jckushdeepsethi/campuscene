import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import { ErrorCodes } from "../errors/error-codes.js";
import { AiService } from "../services/ai.service.js";
import { EventRepository } from "../repositories/event.repository.js";
import { UserRepository } from "../repositories/user.repository.js";

const aiService = new AiService();
const eventRepository = new EventRepository();
const userRepository = new UserRepository();

export class AiController {
  // 1. Description Generator
  generateDescription: RequestHandler = async (req, res) => {
    const { title, category, venue, audience, shortNotes } = req.body;
    if (!title || typeof title !== "string") {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "Event title is required.");
    }

    const result = await aiService.generateEventDescription({ title, category, venue, audience, shortNotes });
    res.status(200).json({ success: true, data: result });
  };

  // 2. Chatbot Assistant
  chatbotQuery: RequestHandler = async (req, res) => {
    const { eventContext, studentQuestion } = req.body;
    if (!eventContext || !studentQuestion) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "Both eventContext and studentQuestion are required.");
    }

    const answer = await aiService.answerEventChatbot(eventContext, studentQuestion);
    res.status(200).json({ success: true, data: { answer } });
  };

  // 3. Email Generator
  generateEmail: RequestHandler = async (req, res) => {
    const { eventType, eventTitle, tone, customDetails } = req.body;
    if (!eventType || !eventTitle || !tone) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "eventType, eventTitle, and tone are required.");
    }

    const result = await aiService.generateEmailDraft({ eventType, eventTitle, tone, customDetails });
    res.status(200).json({ success: true, data: result });
  };

  // 4. Social Kit Generator
  generateSocialKit: RequestHandler = async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "title and description are required.");
    }

    const result = await aiService.generatePosterSocialKit(title, description);
    res.status(200).json({ success: true, data: result });
  };

  // 5. FAQ Generator
  generateFaqs: RequestHandler = async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "title and description are required.");
    }

    const result = await aiService.generateFaqs(title, description);
    res.status(200).json({ success: true, data: result });
  };

  // 6. Form Fields Suggestion
  suggestFormFields: RequestHandler = async (req, res) => {
    const { eventTitle, category } = req.body;
    if (!eventTitle) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "eventTitle is required.");
    }

    const result = await aiService.suggestRegistrationFormFields(eventTitle, category);
    res.status(200).json({ success: true, data: result });
  };

  // 7. Duplicate Detector
  detectDuplicate: RequestHandler = async (req, res) => {
    const { newTitle } = req.body;
    if (!newTitle) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "newTitle is required.");
    }

    const existingEvents = await eventRepository.findMany({ take: 50 });
    const titles = existingEvents.map((e) => e.title);

    const result = await aiService.detectDuplicateEvent(newTitle, titles);
    res.status(200).json({ success: true, data: result });
  };

  // 8. Content Moderator
  moderateContent: RequestHandler = async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "title and description are required.");
    }

    const result = await aiService.moderateContent(title, description);
    res.status(200).json({ success: true, data: result });
  };
}
