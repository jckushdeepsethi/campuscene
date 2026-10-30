import assert from "node:assert/strict";
import test from "node:test";
import { EventStatus, RegistrationStatus, UserRole } from "@prisma/client";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/campusconnect_test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-thirty-two-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-thirty-two-characters";

const { AuthService } = await import("../src/services/auth.service.js");
const { EventService } = await import("../src/services/event.service.js");
const { env } = await import("../src/config/env.js");

test("E2E Full Platform Lifecycle: User Registration -> Event Draft -> Admin Approval -> Student Registration -> Capacity Bounds & Waitlist Auto-Promotion -> CSV Export -> Attendance -> Analytics", async () => {
  // In-memory repositories state simulator for E2E validation
  const usersStore = new Map<string, any>();
  const eventsStore = new Map<string, any>();
  const registrationsStore = new Map<string, any>();

  const fakeAuthRepo: any = {
    findByEmail: async (email: string) => Array.from(usersStore.values()).find((u) => u.email === email) || null,
    findExistingSociety: async (name: string, collegeName?: string) =>
      Array.from(usersStore.values()).find(
        (u) => (u.role === "SOCIETY" || u.role === "PLACEMENT_CELL") && u.name.toLowerCase() === name.toLowerCase()
      ) || null,
    create: async (data: any) => {
      const user = { id: `u-${Date.now()}-${Math.random()}`, status: "ACTIVE", ...data };
      usersStore.set(user.id, user);
      return user;
    }
  };

  const fakeTokenRepo: any = {
    createToken: async () => ({}),
    createEmailVerificationToken: async () => ({
      token: "verification-token-xyz"
    })
  };

  const fakeEmailService: any = {
    sendVerificationEmail: async () => {},
    sendPasswordResetEmail: async () => {}
  };

  const fakeEventRepo: any = {
    create: async (data: any) => {
      const organizerId = data.organizer?.connect?.id || data.organizerId;
      const event = {
        id: `ev-${Date.now()}-${Math.random()}`,
        organizerId,
        registrations: [],
        _count: { registrations: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      eventsStore.set(event.id, event);
      return event;
    },
    findById: async (id: string) => {
      const ev = eventsStore.get(id);
      if (!ev) return null;
      const regs = Array.from(registrationsStore.values()).filter((r) => r.eventId === id);
      return {
        ...ev,
        registrations: regs,
        _count: { registrations: regs.filter((r) => r.status === "REGISTERED").length }
      };
    },
    update: async (id: string, data: any) => {
      const ev = eventsStore.get(id);
      if (!ev) return null;
      const updated = { ...ev, ...data, updatedAt: new Date() };
      eventsStore.set(id, updated);
      return updated;
    },
    countRegistrations: async (eventId: string, status?: string) => {
      return Array.from(registrationsStore.values()).filter(
        (r) => r.eventId === eventId && (!status || r.status === status)
      ).length;
    },
    countRegistrationsByStatus: async (eventId: string, status: string) => {
      return Array.from(registrationsStore.values()).filter((r) => r.eventId === eventId && r.status === status).length;
    },
    findRegistration: async (eventId: string, userId: string) => {
      return Array.from(registrationsStore.values()).find((r) => r.eventId === eventId && r.userId === userId) || null;
    },
    createRegistration: async (eventId: string, userId: string, status: string) => {
      const user = usersStore.get(userId);
      const reg = {
        id: `reg-${Date.now()}-${Math.random()}`,
        eventId,
        userId,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
        user
      };
      registrationsStore.set(reg.id, reg);
      return reg;
    },
    cancelRegistration: async (eventId: string, userId: string) => {
      const reg = Array.from(registrationsStore.values()).find((r) => r.eventId === eventId && r.userId === userId);
      if (reg) {
        reg.status = "CANCELLED";
        reg.updatedAt = new Date();
      }
      return reg;
    },
    findFirstWaitlistedRegistration: async (eventId: string) => {
      return (
        Array.from(registrationsStore.values())
          .filter((r) => r.eventId === eventId && r.status === "WAITLISTED")
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0] || null
      );
    },
    findRegistrationById: async (registrationId: string) => {
      return registrationsStore.get(registrationId) || null;
    },
    updateRegistration: async (registrationId: string, data: any) => {
      const reg = registrationsStore.get(registrationId);
      if (reg) {
        Object.assign(reg, data, { updatedAt: new Date() });
      }
      return reg;
    },
    findRegistrationsByEventId: async (eventId: string) => {
      return Array.from(registrationsStore.values()).filter((r) => r.eventId === eventId);
    },
    getAnalyticsData: async (organizerId?: string) => {
      const events = Array.from(eventsStore.values()).filter((e) => !organizerId || e.organizerId === organizerId);
      const regs = Array.from(registrationsStore.values()).filter(
        (r) => !organizerId || eventsStore.get(r.eventId)?.organizerId === organizerId
      );

      const statusMap = new Map<string, number>();
      for (const e of events) {
        statusMap.set(e.status, (statusMap.get(e.status) || 0) + 1);
      }
      const statusGroup = Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        _count: { status: count }
      }));

      const regMap = new Map<string, number>();
      for (const r of regs) {
        regMap.set(r.status, (regMap.get(r.status) || 0) + 1);
      }
      const regGroup = Array.from(regMap.entries()).map(([status, count]) => ({
        status,
        _count: { status: count }
      }));

      return {
        statusGroup,
        regGroup,
        topEvents: events
      };
    }
  };

  const authService = new AuthService({
    userRepository: fakeAuthRepo,
    tokenRepository: fakeTokenRepo,
    emailService: fakeEmailService
  });

  const eventService = new EventService({
    eventRepository: fakeEventRepo
  });

  // Step 1: Register Society Lead, Admin, Student A, and Student B
  const societyUser = await authService.register({
    email: "society@campus.edu",
    password: "Password123!",
    name: "Robotics Society",
    role: UserRole.SOCIETY
  });

  const adminUser = await authService.register({
    email: "admin@campus.edu",
    password: "Password123!",
    name: "Dean Office",
    role: UserRole.ADMIN,
    adminSecretKey: env.ADMIN_SECRET_KEY
  });

  const studentA = await authService.register({
    email: "studenta@campus.edu",
    password: "Password123!",
    name: "Alice Student",
    role: UserRole.STUDENT
  });

  const studentB = await authService.register({
    email: "studentb@campus.edu",
    password: "Password123!",
    name: "Bob Student",
    role: UserRole.STUDENT
  });

  assert.ok(societyUser.user.id);
  assert.ok(adminUser.user.id);

  // Step 2: Society Lead creates an event with Capacity = 1 (Defaults to PENDING_APPROVAL)
  const event = await eventService.createEvent(
    { userId: societyUser.user.id, role: UserRole.SOCIETY },
    {
      title: "AI Workshop 2026",
      description: "Hands-on AI & Robotics workshop for engineering students.",
      venue: "Auditorium Hall B",
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      endsAt: new Date(Date.now() + 172800000).toISOString(),
      capacity: 1
    }
  );

  assert.equal(event.status, EventStatus.PENDING_APPROVAL);

  // Step 3: Admin approves the event -> Status transitions to PUBLISHED
  const approvedEvent = await eventService.approveOrRejectEvent(
    { userId: adminUser.user.id, role: UserRole.ADMIN },
    event.id,
    { status: EventStatus.PUBLISHED }
  );

  assert.equal(approvedEvent.status, EventStatus.PUBLISHED);

  // Step 4: Student A registers -> Status = REGISTERED (Capacity 1/1 filled)
  const regA = await eventService.registerForEvent(
    { userId: studentA.user.id, role: UserRole.STUDENT },
    event.id
  );

  assert.equal(regA.status, RegistrationStatus.REGISTERED);

  // Step 5: Student B registers -> Event at max capacity -> Status = WAITLISTED
  const regB = await eventService.registerForEvent(
    { userId: studentB.user.id, role: UserRole.STUDENT },
    event.id
  );

  assert.equal(regB.status, RegistrationStatus.WAITLISTED);

  // Step 6: Society Lead exports attendee CSV
  const csvData = await eventService.exportAttendeesCsv(
    { userId: societyUser.user.id, role: UserRole.SOCIETY },
    event.id
  );

  assert.ok(csvData.includes("Registration ID,Student Name,Student Email,Roll Number,College Name,Branch,Passing Year,Status"));
  assert.ok(csvData.includes("Alice Student"));
  assert.ok(csvData.includes("Bob Student"));

  // Step 7: Student A cancels registration -> System automatically promotes Student B from WAITLISTED to REGISTERED!
  const cancelResult = await eventService.cancelRegistration(
    { userId: studentA.user.id, role: UserRole.STUDENT },
    event.id
  );

  assert.equal(cancelResult.cancelled.status, RegistrationStatus.CANCELLED);
  assert.ok(cancelResult.promoted);
  assert.equal(cancelResult.promoted.status, RegistrationStatus.REGISTERED);
  assert.equal(cancelResult.promoted.userId, studentB.user.id);

  // Step 8: Society Lead marks Student B attendance -> ATTENDED
  const attendanceResult = await eventService.markAttendance(
    { userId: societyUser.user.id, role: UserRole.SOCIETY },
    event.id,
    cancelResult.promoted.id,
    { status: RegistrationStatus.ATTENDED }
  );

  assert.equal(attendanceResult.status, RegistrationStatus.ATTENDED);
  assert.ok(attendanceResult.checkedInAt);

  // Step 9: Society Lead checks live Analytics -> Attendance Rate = 100% (1 Attended, 0 No Show)
  const analytics = await eventService.getAnalytics({
    userId: societyUser.user.id,
    role: UserRole.SOCIETY
  });

  assert.equal(analytics.registrationCounts.ATTENDED, 1);
  assert.equal(analytics.attendanceRatePercent, 100);
});
