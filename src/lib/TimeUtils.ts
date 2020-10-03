import { DateTime } from 'luxon';

interface ITimeUtils {
  local(): DateTime;
  fromMillis(milliseconds: number): DateTime;
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

  fromMillis(milliseconds: number): DateTime {
    return DateTime.fromMillis(milliseconds).setZone(this.timezone);
  }

  getMondayOfWeek(dateTime: DateTime): DateTime {
    return dateTime.startOf('day').plus({ days: 1 - dateTime.weekday });
  }
}

export { ITimeUtils, TimeUtils };
