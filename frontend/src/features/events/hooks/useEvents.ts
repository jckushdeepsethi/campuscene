import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  eventsApi,
  type CreateEventInput,
  type EventApprovalInput,
  type ListEventsQuery,
  type UpdateAttendanceInput,
  type UpdateEventInput
} from "../services/eventsApi";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (query: ListEventsQuery) => [...eventKeys.lists(), query] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  registrations: (eventId: string) => [...eventKeys.detail(eventId), "registrations"] as const
};

export const useEvents = (query: ListEventsQuery = {}) =>
  useQuery({
    queryKey: eventKeys.list(query),
    queryFn: () => eventsApi.listEvents(query)
  });

export const useEvent = (id: string) =>
  useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.getEvent(id),
    enabled: Boolean(id)
  });

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => eventsApi.createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    }
  });
};

export const useUpdateEvent = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateEventInput) => eventsApi.updateEvent(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    }
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    }
  });
};

export const useRegisterForEvent = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventsApi.registerForEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    }
  });
};

export const useEventRegistrations = (eventId: string) =>
  useQuery({
    queryKey: eventKeys.registrations(eventId),
    queryFn: () => eventsApi.getEventRegistrations(eventId),
    enabled: Boolean(eventId)
  });

export const useApproveEvent = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EventApprovalInput) => eventsApi.approveOrRejectEvent(eventId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    }
  });
};

export const useMarkAttendance = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ registrationId, input }: { registrationId: string; input: UpdateAttendanceInput }) =>
      eventsApi.updateAttendance(eventId, registrationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.registrations(eventId) });
    }
  });
};

export const useCancelRegistration = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventsApi.cancelRegistration(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    }
  });
};

export const useEventAnalytics = (enabled: boolean = true) =>
  useQuery({
    queryKey: [...eventKeys.all, "analytics"],
    queryFn: () => eventsApi.getAnalytics(),
    enabled
  });
