import { useState, useEffect } from 'react';
import { getAvailableCalendars, isCalendarApiReady, initializeGoogleCalendar, signIn } from '../../utils/calendar';
import { SELECTED_CALENDAR_KEY } from '../../utils/calendar';

/**
 * Hook to manage the selected calendar in local storage
 */
const useSelectedCalendar = () => {
  const [selectedCalendar, setSelectedCalendar] = useState(() => {
    const saved = localStorage.getItem(SELECTED_CALENDAR_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const updateSelectedCalendar = (calendar) => {
    setSelectedCalendar(calendar);
    localStorage.setItem(SELECTED_CALENDAR_KEY, JSON.stringify(calendar));
  };

  return [selectedCalendar, updateSelectedCalendar];
};

/**
 * Component that displays available calendars and allows selection
 */
const CalendarSelector = () => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCalendar, setSelectedCalendar] = useSelectedCalendar();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Google Calendar API
  useEffect(() => {
    const initApi = async () => {
      try {
        await initializeGoogleCalendar();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Google Calendar API:', err);
        setError('Failed to initialize Google Calendar. Please try again.');
        setLoading(false);
      }
    };

    initApi();
  }, []);

  // Fetch calendars when API is initialized
  useEffect(() => {
    const fetchCalendars = async () => {
      if (!isInitialized) return;

      try {
        setLoading(true);
        setError(null);

        // Check if user is signed in
        const auth2 = gapi.auth2.getAuthInstance();
        if (!auth2?.isSignedIn.get()) {
          await signIn();
        }

        const availableCalendars = await getAvailableCalendars();
        setCalendars(availableCalendars);
        
        // If no calendar is selected yet, select the primary calendar
        if (!selectedCalendar && availableCalendars.length > 0) {
          const primaryCalendar = availableCalendars.find(cal => cal.primary) || availableCalendars[0];
          setSelectedCalendar(primaryCalendar);
        }
      } catch (err) {
        console.error('Error fetching calendars:', err);
        if (err.message.includes('not initialized')) {
          // If API is not ready, we'll retry when it becomes ready
          return;
        }
        setError('Failed to load calendars. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendars();
  }, [isInitialized, selectedCalendar]);

  if (!isInitialized) {
    return <div className="p-4">Initializing Google Calendar...</div>;
  }

  if (loading) {
    return <div className="p-4">Loading calendars...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">{error}</div>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            setIsInitialized(false);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Calendar
      </label>
      <select
        value={selectedCalendar?.id || ''}
        onChange={(e) => {
          const calendar = calendars.find(cal => cal.id === e.target.value);
          setSelectedCalendar(calendar);
        }}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {calendars.map((calendar) => (
          <option key={calendar.id} value={calendar.id}>
            {calendar.summary} {calendar.primary ? '(Primary)' : ''}
          </option>
        ))}
      </select>
      {selectedCalendar && (
        <p className="mt-2 text-sm text-gray-500">
          Selected: {selectedCalendar.summary}
          {selectedCalendar.description && ` - ${selectedCalendar.description}`}
        </p>
      )}
    </div>
  );
};

export default CalendarSelector;
export { useSelectedCalendar };
