import { api } from "../../../lib/api";

export type EventStatus = "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "REJECTED" | "CANCELLED" | "COMPLETED";
export type RegistrationStatus = "REGISTERED" | "CANCELLED" | "WAITLISTED" | "ATTENDED" | "NO_SHOW";
export type EventScope = "INTRA_COLLEGE" | "INTER_COLLEGE";

export type EventOrganizer = {
  id: string;
  name: string;
  email: string;
  role: string;
  collegeName?: string | null;
};

export type EventApprovedBy = {
  id: string;
  name: string;
  email: string;
};

export type EventItem = {
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
  allowedBranches?: string[];
  allowedPassingYears?: number[];
  tags?: string[];
  organizerId: string;
  approvedById: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  organizer?: EventOrganizer;
  approvedBy?: EventApprovedBy | null;
  registrationCount?: number;
  isRegistered?: boolean;
  userRegistrationStatus?: RegistrationStatus | null;
  matchScore?: number;
};

export type EventRegistrationItem = {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    rollNumber?: string | null;
    branch?: string | null;
    passingYear?: number | null;
    collegeName?: string | null;
  };
};

export type ListEventsQuery = {
  status?: EventStatus;
  scope?: EventScope;
  organizerId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type ListEventsResponse = {
  data: EventItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateEventInput = {
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status?: EventStatus;
  scope?: EventScope;
  collegeName?: string;
  allowedBranches?: string[];
  allowedPassingYears?: number[];
  tags?: string[];
};

export type UpdateEventInput = Partial<CreateEventInput>;

export type EventApprovalInput = {
  status: "PUBLISHED" | "REJECTED";
  reason?: string;
};

export type UpdateAttendanceInput = {
  status: RegistrationStatus;
};

export type EventAnalyticsData = {
  statusCounts: Record<EventStatus, number>;
  registrationCounts: Record<RegistrationStatus, number>;
  attendanceRatePercent: number;
  topHighDemandEvents: Array<{
    id: string;
    title: string;
    capacity: number;
    registrationCount: number;
    fillRatePercent: number;
  }>;
};

export type AiGenerateOutput = {
  description: string;
  venue: string;
  tags: string[];
  suggestedCapacity: number;
  allowedBranches: string[];
  allowedPassingYears: number[];
};

export const eventsApi = {
  async listEvents(query: ListEventsQuery = {}) {
    const response = await api.get<ListEventsResponse>("/events", { params: query });
    return response.data;
  },

  async getEvent(id: string) {
    const response = await api.get<{ data: { event: EventItem } }>(`/events/${id}`);
    return response.data.data.event;
  },

  async createEvent(input: CreateEventInput) {
    const response = await api.post<{ data: { event: EventItem } }>("/events", input);
    return response.data.data.event;
  },

  async updateEvent(id: string, input: UpdateEventInput) {
    const response = await api.patch<{ data: { event: EventItem } }>(`/events/${id}`, input);
    return response.data.data.event;
  },

  async deleteEvent(id: string) {
    const response = await api.delete<{ message: string }>(`/events/${id}`);
    return response.data;
  },

  async registerForEvent(id: string) {
    const response = await api.post<{ data: { registration: EventRegistrationItem } }>(`/events/${id}/register`);
    return response.data.data.registration;
  },

  async cancelRegistration(id: string) {
    const response = await api.delete<{ data: { message: string } }>(`/events/${id}/register`);
    return response.data.data;
  },

  async getEventRegistrations(id: string) {
    const response = await api.get<{ data: { registrations: EventRegistrationItem[] } }>(`/events/${id}/registrations`);
    return response.data.data.registrations;
  },

  async approveOrRejectEvent(id: string, input: EventApprovalInput) {
    const response = await api.patch<{ data: { event: EventItem } }>(`/events/${id}/approval`, input);
    return response.data.data.event;
  },

  async updateAttendance(eventId: string, registrationId: string, input: UpdateAttendanceInput) {
    const response = await api.patch<{ data: { registration: EventRegistrationItem } }>(
      `/events/${eventId}/attendance/${registrationId}`,
      input
    );
    return response.data.data.registration;
  },

  async exportAttendeesCsv(id: string) {
    const response = await api.get(`/events/${id}/export`, {
      responseType: "blob"
    });
    return response.data;
  },

  async getAnalytics() {
    const response = await api.get<{ data: EventAnalyticsData }>("/events/analytics");
    return response.data.data;
  },

  async generateAiDetails(title: string, category?: string) {
    const response = await api.post<{ data: AiGenerateOutput }>("/events/ai-generate", { title, category });
    return response.data.data;
  }
};
