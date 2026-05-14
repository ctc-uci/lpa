/** Declarations for utils.js (TS build consumes this next to the .js file). */

export function parseSessionDate(dateString: unknown): Date | null;

export function formatSessionDateShort(dateString: unknown): string;

export function formatSessionDateWithWeekday(dateString: unknown): string;

export function getSessionDayOfWeekLong(dateString: unknown): string;

export function generateRecurringSessions(
  recurringSession: unknown,
  startDate: string,
  endDate: string
): unknown[];

export function createNewSessions(
  newSessions: unknown,
  id: unknown,
  backend: unknown
): Promise<unknown>;

export function updateSessions(
  updatedSessions: unknown,
  id: unknown,
  backend: unknown
): Promise<unknown>;

export function deleteSessions(
  deletedSessions: unknown,
  backend: unknown
): Promise<unknown>;
