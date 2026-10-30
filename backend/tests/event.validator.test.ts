import assert from "node:assert/strict";
import test from "node:test";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/campuscene_test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-thirty-two-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-thirty-two-characters";

const { createEventSchema, updateEventSchema, listEventsQuerySchema, eventApprovalSchema, updateAttendanceSchema } =
  await import("../src/validators/event.validator.js");

test("createEventSchema validates valid event input and requires endsAt > startsAt", () => {
  const valid = createEventSchema.safeParse({
    title: "Annual Tech Symposium",
    description: "Join us for an exciting day of developer talks and hackathons.",
    venue: "Main Auditorium",
    startsAt: "2026-08-10T10:00:00.000Z",
    endsAt: "2026-08-10T17:00:00.000Z",
    capacity: 200,
    status: "PENDING_APPROVAL"
  });

  assert.equal(valid.success, true);

  const invalidDate = createEventSchema.safeParse({
    title: "Annual Tech Symposium",
    description: "Join us for an exciting day of developer talks and hackathons.",
    venue: "Main Auditorium",
    startsAt: "2026-08-10T17:00:00.000Z",
    endsAt: "2026-08-10T10:00:00.000Z",
    capacity: 200
  });

  assert.equal(invalidDate.success, false);
});

test("createEventSchema rejects short title, short description, or zero capacity", () => {
  const invalid = createEventSchema.safeParse({
    title: "Hi",
    description: "Short",
    venue: "A",
    startsAt: "2026-08-10T10:00:00.000Z",
    endsAt: "2026-08-10T17:00:00.000Z",
    capacity: 0
  });

  assert.equal(invalid.success, false);
});

test("updateEventSchema permits partial updates", () => {
  const validPartial = updateEventSchema.safeParse({
    title: "Updated Tech Symposium Title"
  });

  assert.equal(validPartial.success, true);
});

test("listEventsQuerySchema coerces page and limit", () => {
  const result = listEventsQuerySchema.parse({
    page: "2",
    limit: "25",
    status: "PUBLISHED"
  });

  assert.equal(result.page, 2);
  assert.equal(result.limit, 25);
  assert.equal(result.status, "PUBLISHED");
});

test("eventApprovalSchema restricts status to PUBLISHED or REJECTED", () => {
  assert.equal(eventApprovalSchema.safeParse({ status: "PUBLISHED" }).success, true);
  assert.equal(eventApprovalSchema.safeParse({ status: "REJECTED" }).success, true);
  assert.equal(eventApprovalSchema.safeParse({ status: "DRAFT" }).success, false);
});

test("updateAttendanceSchema accepts valid RegistrationStatus", () => {
  assert.equal(updateAttendanceSchema.safeParse({ status: "ATTENDED" }).success, true);
  assert.equal(updateAttendanceSchema.safeParse({ status: "NO_SHOW" }).success, true);
  assert.equal(updateAttendanceSchema.safeParse({ status: "INVALID_STATUS" }).success, false);
});
