export const mockUpdateCalendarEvent = jest.fn().mockResolvedValue(undefined)
export const mockCreateCalendarEvent = jest.fn().mockResolvedValue({ id: 'event-123' })
export const mockDeleteCalendarEvent = jest.fn().mockResolvedValue(undefined)

jest.mock('@/lib/google/calendar', () => ({
  updateCalendarEvent: mockUpdateCalendarEvent,
  createCalendarEvent: mockCreateCalendarEvent,
  deleteCalendarEvent: mockDeleteCalendarEvent,
}))
