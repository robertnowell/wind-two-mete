export type UnixTime = number;

export type ScheduleDay = {
  start: UnixTime;
  end: UnixTime;
  parts: number;
  partSize: number;
};

export type Meeting = {
  id: string;
  name: string;
  scheduleDays: ScheduleDay[];
  users?: Record<string, UserRecord>;
};

export type UserRecord = {
  windows: Record<UnixTime, boolean[]>; // true indicates they can meet.
  name: string;
  id: string;
};
