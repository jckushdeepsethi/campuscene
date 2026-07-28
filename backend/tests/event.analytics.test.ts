import assert from "node:assert/strict";
import test from "node:test";
import { UserRole } from "@prisma/client";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/campusconnect_test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-thirty-two-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-thirty-two-characters";

const { EventService } = await import("../src/services/event.service.js");

test("getAnalytics returns aggregated counts, attendance rate, and top high-demand events", async () => {
  const fakeRepository: any = {
    getAnalyticsData: async () => ({
      statusGroup: [
        { status: "PUBLISHED", _count: { status: 5 } },
        { status: "PENDING_APPROVAL", _count: { status: 2 } }
      ],
      regGroup: [
        { status: "ATTENDED", _count: { status: 80 } },
        { status: "NO_SHOW", _count: { status: 20 } },
        { status: "REGISTERED", _count: { status: 150 } }
      ],
      topEvents: [
        { id: "ev-1", title: "AI Hackathon", capacity: 100, _count: { registrations: 95 } },
        { id: "ev-2", title: "Career Fair", capacity: 200, _count: { registrations: 180 } }
      ]
    })
  };

  const service = new EventService({ eventRepository: fakeRepository });

  const analytics = await service.getAnalytics({ userId: "admin-1", role: UserRole.ADMIN });

  assert.equal(analytics.statusCounts.PUBLISHED, 5);
  assert.equal(analytics.statusCounts.PENDING_APPROVAL, 2);
  assert.equal(analytics.registrationCounts.ATTENDED, 80);
  assert.equal(analytics.registrationCounts.NO_SHOW, 20);
  assert.equal(analytics.attendanceRatePercent, 80); // 80 / (80 + 20) = 80%
  assert.equal(analytics.topHighDemandEvents.length, 2);
  assert.equal(analytics.topHighDemandEvents[0].fillRatePercent, 95);
});

test("getAnalytics throws 403 Forbidden for STUDENT users", async () => {
  const service = new EventService();

  await assert.rejects(
    async () => {
      await service.getAnalytics({ userId: "student-1", role: UserRole.STUDENT });
    },
    (err: any) => err.statusCode === 403
  );
});
