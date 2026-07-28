import { EventScope, EventStatus, RegistrationStatus } from "@prisma/client";
import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title cannot exceed 120 characters."),
    description: z.string().trim().min(10, "Description must be at least 10 characters.").max(5000, "Description cannot exceed 5000 characters."),
    venue: z.string().trim().min(2, "Venue must be at least 2 characters.").max(200, "Venue cannot exceed 200 characters."),
    startsAt: z.string().datetime({ message: "startsAt must be a valid ISO date-time string." }),
    endsAt: z.string().datetime({ message: "endsAt must be a valid ISO date-time string." }),
    capacity: z.number().int().min(1, "Capacity must be at least 1.").max(100000, "Capacity cannot exceed 100,000."),
    status: z.nativeEnum(EventStatus).optional(),
    scope: z.nativeEnum(EventScope).optional().default(EventScope.INTRA_COLLEGE),
    collegeName: z.string().trim().max(200).optional(),
    allowedBranches: z.array(z.string().trim()).optional().default([]),
    allowedPassingYears: z.array(z.coerce.number().int()).optional().default([]),
    tags: z.array(z.string().trim()).optional().default([])
  })
  .refine(
    (data) => new Date(data.endsAt) > new Date(data.startsAt),
    {
      message: "Event end time (endsAt) must be after start time (startsAt).",
      path: ["endsAt"]
    }
  );

export const updateEventSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120).optional(),
    description: z.string().trim().min(10, "Description must be at least 10 characters.").max(5000).optional(),
    venue: z.string().trim().min(2, "Venue must be at least 2 characters.").max(200).optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    capacity: z.number().int().min(1).max(100000).optional(),
    status: z.nativeEnum(EventStatus).optional(),
    scope: z.nativeEnum(EventScope).optional(),
    collegeName: z.string().trim().max(200).optional(),
    allowedBranches: z.array(z.string().trim()).optional(),
    allowedPassingYears: z.array(z.coerce.number().int()).optional(),
    tags: z.array(z.string().trim()).optional()
  })
  .refine(
    (data) => {
      if (data.startsAt && data.endsAt) {
        return new Date(data.endsAt) > new Date(data.startsAt);
      }
      return true;
    },
    {
      message: "Event end time (endsAt) must be after start time (startsAt).",
      path: ["endsAt"]
    }
  );

export const listEventsQuerySchema = z.object({
  status: z.nativeEnum(EventStatus).optional(),
  scope: z.nativeEnum(EventScope).optional(),
  organizerId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

export const eventApprovalSchema = z.object({
  status: z.enum([EventStatus.PUBLISHED, EventStatus.REJECTED], {
    errorMap: () => ({ message: "Approval status must be either PUBLISHED or REJECTED." })
  }),
  reason: z.string().trim().max(500).optional()
});

export const updateAttendanceSchema = z.object({
  status: z.nativeEnum(RegistrationStatus)
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQueryInput = z.infer<typeof listEventsQuerySchema>;
export type EventApprovalInput = z.infer<typeof eventApprovalSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
