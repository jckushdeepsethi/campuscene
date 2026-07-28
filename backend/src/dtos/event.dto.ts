import type { Event, EventRegistration, EventScope, EventStatus, RegistrationStatus, UserRole } from "@prisma/client";

export type EventOrganizerDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeName?: string | null;
};

export type EventApprovedByDto = {
  id: string;
  name: string;
  email: string;
};

export type PublicEventDto = {
  id: string;
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: EventStatus;
  scope: EventScope;
  collegeName?: string | null;
  allowedBranches: string[];
  allowedPassingYears: number[];
  tags: string[];
  organizerId: string;
  approvedById: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  organizer?: EventOrganizerDto;
  approvedBy?: EventApprovedByDto | null;
  registrationCount?: number;
  isRegistered?: boolean;
  userRegistrationStatus?: RegistrationStatus | null;
  matchScore?: number;
};

export type EventRegistrationUserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNumber?: string | null;
  branch?: string | null;
  passingYear?: number | null;
  collegeName?: string | null;
};

export type PublicRegistrationDto = {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: EventRegistrationUserDto;
};

export const toPublicEventDto = (
  event: any,
  currentUserId?: string,
  registrationStatusMap?: Map<string, RegistrationStatus>
): PublicEventDto => {
  const registeredCount = event._count?.registrations ?? 0;
  const userRegistrationStatus = registrationStatusMap && event.id ? registrationStatusMap.get(event.id) ?? null : null;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    venue: event.venue,
    startsAt: new Date(event.startsAt).toISOString(),
    endsAt: new Date(event.endsAt).toISOString(),
    capacity: event.capacity,
    status: event.status,
    scope: event.scope ?? "INTRA_COLLEGE",
    collegeName: event.collegeName ?? event.organizer?.collegeName ?? null,
    allowedBranches: event.allowedBranches ?? [],
    allowedPassingYears: event.allowedPassingYears ?? [],
    tags: event.tags ?? [],
    organizerId: event.organizerId,
    approvedById: event.approvedById,
    approvedAt: event.approvedAt ? new Date(event.approvedAt).toISOString() : null,
    createdAt: new Date(event.createdAt).toISOString(),
    updatedAt: new Date(event.updatedAt).toISOString(),
    organizer: event.organizer ? {
      id: event.organizer.id,
      name: event.organizer.name,
      email: event.organizer.email,
      role: event.organizer.role,
      collegeName: event.organizer.collegeName
    } : undefined,
    approvedBy: event.approvedBy ? {
      id: event.approvedBy.id,
      name: event.approvedBy.name,
      email: event.approvedBy.email
    } : null,
    registrationCount: registeredCount,
    isRegistered: userRegistrationStatus !== null && userRegistrationStatus !== "CANCELLED",
    userRegistrationStatus
  };
};

export const toPublicRegistrationDto = (registration: any): PublicRegistrationDto => {
  return {
    id: registration.id,
    eventId: registration.eventId,
    userId: registration.userId,
    status: registration.status,
    checkedInAt: registration.checkedInAt ? new Date(registration.checkedInAt).toISOString() : null,
    createdAt: new Date(registration.createdAt).toISOString(),
    updatedAt: new Date(registration.updatedAt).toISOString(),
    user: registration.user ? {
      id: registration.user.id,
      name: registration.user.name,
      email: registration.user.email,
      role: registration.user.role,
      rollNumber: registration.user.rollNumber,
      branch: registration.user.branch,
      passingYear: registration.user.passingYear,
      collegeName: registration.user.collegeName
    } : undefined
  };
};
