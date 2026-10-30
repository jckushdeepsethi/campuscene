import assert from "node:assert/strict";
import test from "node:test";
import { EventStatus, RegistrationStatus, UserRole } from "@prisma/client";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/campuscene_test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-thirty-two-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-thirty-two-characters";

const { EventService } = await import("../src/services/event.service.js");

test("cancelRegistration cancels student registration and automatically promotes earliest waitlisted student", async () => {
  const registrationsStore: any[] = [
    { id: "reg-1", eventId: "ev-1", userId: "user-1", status: "REGISTERED", createdAt: new Date("2026-08-01T10:00:00Z"), updatedAt: new Date("2026-08-01T10:00:00Z"), user: { id: "user-1", name: "Alice", email: "alice@example.com", role: "STUDENT" } },
    { id: "reg-2", eventId: "ev-1", userId: "user-2", status: "WAITLISTED", createdAt: new Date("2026-08-01T11:00:00Z"), updatedAt: new Date("2026-08-01T11:00:00Z"), user: { id: "user-2", name: "Bob", email: "bob@example.com", role: "STUDENT" } }
  ];

  const fakeRepository: any = {
    findById: async () => ({
      id: "ev-1",
      capacity: 1,
      organizerId: "org-1",
      status: EventStatus.PUBLISHED
    }),
    findRegistration: async (eventId: string, userId: string) => {
      return registrationsStore.find((r) => r.eventId === eventId && r.userId === userId) ?? null;
    },
    cancelRegistration: async (eventId: string, userId: string) => {
      const reg = registrationsStore.find((r) => r.eventId === eventId && r.userId === userId);
      reg.status = "CANCELLED";
      return reg;
    },
    countRegistrations: async (eventId: string, status: string) => {
      return registrationsStore.filter((r) => r.eventId === eventId && r.status === status).length;
    },
    findFirstWaitlistedRegistration: async (eventId: string) => {
      return registrationsStore.find((r) => r.eventId === eventId && r.status === "WAITLISTED") ?? null;
    },
    updateRegistration: async (id: string, data: any) => {
      const reg = registrationsStore.find((r) => r.id === id);
      reg.status = data.status;
      return reg;
    }
  };

  const service = new EventService({ eventRepository: fakeRepository });

  const result = await service.cancelRegistration({ userId: "user-1", role: UserRole.STUDENT }, "ev-1");

  assert.equal(result.cancelled.status, "CANCELLED");
  assert.equal(result.promoted?.userId, "user-2");
  assert.equal(result.promoted?.status, "REGISTERED");
});

test("exportAttendeesCsv returns correctly formatted CSV string for event organizers", async () => {
  const fakeRepository: any = {
    findById: async () => ({
      id: "ev-1",
      organizerId: "org-1",
      status: EventStatus.PUBLISHED
    }),
    findRegistrationsByEventId: async () => [
      { id: "reg-1", status: "REGISTERED", createdAt: new Date("2026-08-01T10:00:00Z"), checkedInAt: null, user: { name: "Alice", email: "alice@example.com" } },
      { id: "reg-2", status: "ATTENDED", createdAt: new Date("2026-08-01T11:00:00Z"), checkedInAt: new Date("2026-08-01T12:00:00Z"), user: { name: "Bob", email: "bob@example.com" } }
    ]
  };

  const service = new EventService({ eventRepository: fakeRepository });

  const csv = await service.exportAttendeesCsv({ userId: "org-1", role: UserRole.SOCIETY }, "ev-1");

  assert.ok(csv.includes("Registration ID,Student Name,Student Email,Roll Number,College Name,Branch,Passing Year,Status,Registered At,Checked In At"));
  assert.ok(csv.includes('"Alice"'));
  assert.ok(csv.includes('"bob@example.com"'));
});
