import type { Event, EventRegistration, Prisma, RegistrationStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export class EventRepository {
  create(data: Prisma.EventCreateInput): Promise<Event> {
    return prisma.event.create({
      data,
      include: {
        organizer: {
          select: { id: true, name: true, email: true, role: true, collegeName: true }
        },
        approvedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true, role: true, collegeName: true }
        },
        approvedBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            registrations: {
              where: { status: "REGISTERED" }
            }
          }
        }
      }
    });
  }

  findMany(options: {
    where?: Prisma.EventWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }) {
    return prisma.event.findMany({
      where: options.where,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy ?? { startsAt: "asc" },
      include: {
        organizer: {
          select: { id: true, name: true, email: true, role: true, collegeName: true }
        },
        approvedBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            registrations: {
              where: { status: "REGISTERED" }
            }
          }
        }
      }
    });
  }

  count(where?: Prisma.EventWhereInput): Promise<number> {
    return prisma.event.count({ where });
  }

  update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        organizer: {
          select: { id: true, name: true, email: true, role: true, collegeName: true }
        },
        approvedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  delete(id: string): Promise<Event> {
    return prisma.event.delete({
      where: { id }
    });
  }

  createRegistration(eventId: string, userId: string, status: RegistrationStatus = "REGISTERED"): Promise<EventRegistration> {
    return prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        status
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, rollNumber: true, branch: true, passingYear: true, collegeName: true }
        }
      }
    });
  }

  findRegistration(eventId: string, userId: string): Promise<EventRegistration | null> {
    return prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId }
      }
    });
  }

  findRegistrationById(id: string): Promise<EventRegistration | null> {
    return prisma.eventRegistration.findUnique({
      where: { id }
    });
  }

  countRegistrations(eventId: string, status: RegistrationStatus = "REGISTERED"): Promise<number> {
    return prisma.eventRegistration.count({
      where: {
        eventId,
        status
      }
    });
  }

  updateRegistration(id: string, data: Prisma.EventRegistrationUpdateInput): Promise<EventRegistration> {
    return prisma.eventRegistration.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, rollNumber: true, branch: true, passingYear: true, collegeName: true }
        }
      }
    });
  }

  findRegistrationsByEventId(eventId: string) {
    return prisma.eventRegistration.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, rollNumber: true, branch: true, passingYear: true, collegeName: true }
        }
      }
    });
  }

  cancelRegistration(eventId: string, userId: string): Promise<EventRegistration> {
    return prisma.eventRegistration.update({
      where: {
        eventId_userId: { eventId, userId }
      },
      data: {
        status: "CANCELLED"
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  findFirstWaitlistedRegistration(eventId: string): Promise<EventRegistration | null> {
    return prisma.eventRegistration.findFirst({
      where: {
        eventId,
        status: "WAITLISTED"
      },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
  }

  async getAnalyticsData(organizerId?: string) {
    const eventWhere = organizerId ? { organizerId } : {};
    const regWhere = organizerId ? { event: { organizerId } } : {};

    const [statusGroup, regGroup, topEvents] = await Promise.all([
      prisma.event.groupBy({
        by: ["status"],
        where: eventWhere,
        _count: { status: true }
      }),
      prisma.eventRegistration.groupBy({
        by: ["status"],
        where: regWhere,
        _count: { status: true }
      }),
      prisma.event.findMany({
        where: {
          ...eventWhere,
          status: "PUBLISHED"
        },
        take: 5,
        include: {
          _count: {
            select: { registrations: { where: { status: "REGISTERED" } } }
          }
        }
      })
    ]);

    return {
      statusGroup,
      regGroup,
      topEvents
    };
  }
}


