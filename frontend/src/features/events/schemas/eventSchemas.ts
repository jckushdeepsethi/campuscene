import { z } from "zod";

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title cannot exceed 120 characters."),
    description: z.string().trim().min(10, "Description must be at least 10 characters.").max(5000),
    venue: z.string().trim().min(2, "Venue must be at least 2 characters.").max(200),
    startsAt: z.string().min(1, "Start date and time is required."),
    endsAt: z.string().min(1, "End date and time is required."),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1.").max(100000),
    status: z.enum(["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED", "CANCELLED", "COMPLETED"]).optional(),
    scope: z.enum(["INTRA_COLLEGE", "INTER_COLLEGE"]),
    collegeName: z.string().trim().optional(),
    allowedBranchesInput: z.string().trim().optional(),
    allowedPassingYearsInput: z.string().trim().optional()
  })
  .refine(
    (data) => {
      if (data.startsAt && data.endsAt) {
        return new Date(data.endsAt) > new Date(data.startsAt);
      }
      return true;
    },
    {
      message: "End time must be after start time.",
      path: ["endsAt"]
    }
  );

export type EventFormValues = z.infer<typeof eventFormSchema>;
