export const EventCatalog = {
  WAITLIST_SUBMITTED: 'waitlist_submitted',
  PLAYER_SEARCHED: 'player_searched',
  BOOKING_CREATED: 'booking_created',
  BOOKING_COMPLETED: 'booking_completed',
  REVIEW_SUBMITTED: 'review_submitted',
  GROUP_CREATED: 'group_created',
  MESSAGE_SENT: 'message_sent',
  NPS_RESPONSE: 'nps_response',
  SEARCH_FEEDBACK: 'search_feedback',
} as const;

export type EventName = (typeof EventCatalog)[keyof typeof EventCatalog];
