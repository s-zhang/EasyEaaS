import { DateTime } from 'luxon';

interface ITimeUtils {
  local(): DateTime;
  fromJSDate(date: Date): DateTime;
  fromISO(dateString: string): DateTime;
  getMondayOfWeek(dateTime: DateTime): DateTime;
}

class TimeUtils implements ITimeUtils {
  private readonly timezone: string;
  constructor(timezone = 'America/Los_Angeles') {
    this.timezone = timezone;
  }

  local(): DateTime {
    return DateTime.local().setZone(this.timezone);
  }

  fromISO(dateString: string): DateTime {
    return DateTime.fromISO(dateString);
  }

  fromJSDate(date: Date): DateTime {
    return DateTime.fromJSDate(date).setZone(this.timezone);
  }

  getMondayOfWeek(dateTime: DateTime): DateTime {
    return dateTime.startOf('day').plus({ days: 1 - dateTime.weekday });
  }
}

export { ITimeUtils, TimeUtils };
