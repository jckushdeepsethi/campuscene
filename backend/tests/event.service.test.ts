import assert from "node:assert/strict";
import test from "node:test";
import type { EventStatus, RegistrationStatus, UserRole } from "@prisma/client";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/campuscene_test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-thirty-two-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-thirty-two-characters";

const { EventService } = await import("../src/services/event.service.js");
const { AppError } = await import("../src/errors/app-error.js");

const createTestEvent = (overrides: any = {}) => ({
  id: "event-1",
  title: "Robotics Workshop",
  description: "Hands-on workshop building autonomous bots.",
  venue: "Lab 301",
  startsAt: new Date(Date.now() + 86400000),
  endsAt: new Date(Date.now() + 90000000),
  capacity: 2,
  status: "PUBLISHED" as EventStatus,
  organizerId: "society-user-1",
  approvedById: "admin-user-1",
  approvedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  organizer: { id: "society-user-1", name: "Robotics Club", email: "robotics@example.com", role: "SOCIETY" },
  approvedBy: { id: "admin-user-1", name: "Admin User", email: "admin@example.com" },
  _count: { registrations: 0 },
  ...overrides
});

const createTestRegistration = (overrides: any = {}) => ({
  id: "reg-1",
  eventId: "event-1",
  userId: "student-user-1",
  status: "REGISTERED" as RegistrationStatus,
  checkedInAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: "student-user-1", name: "Student Alice", email: "alice@example.com", role: "STUDENT" },
  ...overrides
});

const createService = () => {
  const events = new Map<string, any>();
  const registrations = new Map<string, any>();

  const eventRepository = {
    async create(data: any) {
      const id = `event-${events.size + 1}`;
      const event = createTestEvent({
        id,
        title: data.title,
        description: data.description,
        venue: data.venue,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        capacity: data.capacity,
        status: data.status,
        organizerId: data.organizer.connect.id,
        approvedById: data.approvedBy?.connect?.id ?? null,
        approvedAt: data.approvedAt ?? null
      });
      events.set(id, event);
      return event;
    },
    async findById(id: string) {
      return events.get(id) ?? null;
    },
    async findMany(options: any) {
      let list = [...events.values()];
      if (options?.where?.status) {
        list = list.filter((e) => e.status === options.where.status);
      }
      if (options?.where?.organizerId) {
        list = list.filter((e) => e.organizerId === options.where.organizerId);
      }
      if (options?.where?.OR) {
        list = list.filter((e) => {
          return options.where.OR.some((cond: any) => {
            if (cond.status) return e.status === cond.status;
            if (cond.organizerId) return e.organizerId === cond.organizerId;
            return false;
          });
        });
      }
      return list;
    },
    async count(where: any) {
      const list = await this.findMany({ where });
      return list.length;
    },
    async update(id: string, data: any) {
      const existing = events.get(id);
      if (!existing) throw new Error("Not found");
      let approvedById = existing.approvedById;
      let approvedBy = existing.approvedBy;

      if (data.approvedBy?.connect?.id) {
        approvedById = data.approvedBy.connect.id;
        approvedBy = { id: approvedById, name: "Admin", email: "admin@example.com" };
      } else if (data.approvedBy?.disconnect) {
        approvedById = null;
        approvedBy = null;
      }

      const updated = { ...existing, ...data, approvedById, approvedBy };
      events.set(id, updated);
      return updated;
    },
    async delete(id: string) {
      const existing = events.get(id);
      events.delete(id);
      return existing;
    },
    async createRegistration(eventId: string, userId: string, status: RegistrationStatus) {
      const id = `reg-${registrations.size + 1}`;
      const reg = createTestRegistration({ id, eventId, userId, status });
      registrations.set(`${eventId}_${userId}`, reg);
      registrations.set(id, reg);
      return reg;
    },
    async findRegistration(eventId: string, userId: string) {
      return registrations.get(`${eventId}_${userId}`) ?? null;
    },
    async findRegistrationById(id: string) {
      return registrations.get(id) ?? null;
    },
    async countRegistrations(eventId: string, status: RegistrationStatus) {
      return [...registrations.values()].filter(
        (r) => r.eventId === eventId && r.status === status
      ).length;
    },
    async updateRegistration(id: string, data: any) {
      const existing = registrations.get(id);
      const updated = { ...existing, ...data };
      registrations.set(id, updated);
      if (existing) {
        registrations.set(`${existing.eventId}_${existing.userId}`, updated);
      }
      return updated;
    },
    async findRegistrationsByEventId(eventId: string) {
      return [...registrations.values()].filter((r) => r.eventId === eventId);
    }
  };

  return {
    service: new EventService({ eventRepository: eventRepository as any }),
    events,
    registrations
  };
};

test("SOCIETY creating an event defaults status to PENDING_APPROVAL", async () => {
  const { service } = createService();
  const result = await service.createEvent(
    { userId: "society-1", role: "SOCIETY" as UserRole },
    {
      title: "AI Hackathon",
      description: "24-hour coding challenge for machine learning models.",
      venue: "CS Block Hall 1",
      startsAt: new Date(Date.now() + 100000).toISOString(),
      endsAt: new Date(Date.now() + 200000).toISOString(),
      capacity: 50
    }
  );

  assert.equal(result.title, "AI Hackathon");
  assert.equal(result.status, "PENDING_APPROVAL");
});

test("ADMIN creating an event sets status to PUBLISHED", async () => {
  const { service } = createService();
  const result = await service.createEvent(
    { userId: "admin-1", role: "ADMIN" as UserRole },
    {
      title: "Annual Orientation",
      description: "Official welcome event for first year students.",
      venue: "Main Campus Grounds",
      startsAt: new Date(Date.now() + 100000).toISOString(),
      endsAt: new Date(Date.now() + 200000).toISOString(),
      capacity: 500
    }
  );

  assert.equal(result.title, "Annual Orientation");
  assert.equal(result.status, "PUBLISHED");
});

test("STUDENT can only view PUBLISHED events", async () => {
  const { service, events } = createService();
  events.set("event-pub", createTestEvent({ id: "event-pub", title: "Public Event", status: "PUBLISHED" }));
  events.set("event-draft", createTestEvent({ id: "event-draft", title: "Draft Event", status: "DRAFT" }));
  events.set("event-pending", createTestEvent({ id: "event-pending", title: "Pending Event", status: "PENDING_APPROVAL" }));

  const res = await service.listEvents({ userId: "student-1", role: "STUDENT" as UserRole }, {});
  assert.equal(res.data.length, 1);
  assert.equal(res.data[0].id, "event-pub");
});

test("registerForEvent adds student as REGISTERED or WAITLISTED when capacity is reached", async () => {
  const { service, events } = createService();
  events.set("event-1", createTestEvent({ id: "event-1", capacity: 1, status: "PUBLISHED" }));

  const reg1 = await service.registerForEvent({ userId: "student-1", role: "STUDENT" as UserRole }, "event-1");
  assert.equal(reg1.status, "REGISTERED");

  const reg2 = await service.registerForEvent({ userId: "student-2", role: "STUDENT" as UserRole }, "event-1");
  assert.equal(reg2.status, "WAITLISTED");
});

test("registerForEvent prevents duplicate registration", async () => {
  const { service, events } = createService();
  events.set("event-1", createTestEvent({ id: "event-1", status: "PUBLISHED" }));

  await service.registerForEvent({ userId: "student-1", role: "STUDENT" as UserRole }, "event-1");

  await assert.rejects(
    () => service.registerForEvent({ userId: "student-1", role: "STUDENT" as UserRole }, "event-1"),
    (err) => err instanceof AppError && err.statusCode === 409
  );
});

test("approveOrRejectEvent updates status and records admin approval", async () => {
  const { service, events } = createService();
  events.set("event-1", createTestEvent({ id: "event-1", status: "PENDING_APPROVAL" }));

  const approved = await service.approveOrRejectEvent(
    { userId: "admin-1", role: "ADMIN" as UserRole },
    "event-1",
    { status: "PUBLISHED" }
  );

  assert.equal(approved.status, "PUBLISHED");
  assert.equal(approved.approvedById, "admin-1");
});

test("approveOrRejectEvent rejects non-admin users", async () => {
  const { service, events } = createService();
  events.set("event-1", createTestEvent({ id: "event-1", status: "PENDING_APPROVAL" }));

  await assert.rejects(
    () => service.approveOrRejectEvent({ userId: "society-1", role: "SOCIETY" as UserRole }, "event-1", { status: "PUBLISHED" }),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test("markAttendance updates registration status and sets checkedInAt for ATTENDED", async () => {
  const { service, events, registrations } = createService();
  events.set("event-1", createTestEvent({ id: "event-1", organizerId: "society-1" }));
  registrations.set("reg-1", createTestRegistration({ id: "reg-1", eventId: "event-1", status: "REGISTERED" }));
  registrations.set("event-1_student-user-1", registrations.get("reg-1"));

  const updated = await service.markAttendance(
    { userId: "society-1", role: "SOCIETY" as UserRole },
    "event-1",
    "reg-1",
    { status: "ATTENDED" }
  );

  assert.equal(updated.status, "ATTENDED");
  assert.ok(updated.checkedInAt);
});
