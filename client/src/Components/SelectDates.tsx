import React, { useState, useEffect } from "react";
import { ScheduleDay } from "../Types";
import { set, add, getDay, previousSunday, getDate, isSameDay } from "date-fns";
const DEFAULT_END_OFFSET_HR = 24;

const dow = ["S", "M", "T", "W", "T", "F", "S"];

export function SelectDates({
  scheduleDays,
  setScheduleDays,
}: {
  scheduleDays: ScheduleDay[];
  setScheduleDays: (d: ScheduleDay[]) => void;
}) {
  const [today] = useState(
    set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
  );

  const lastSunday = previousSunday(today);

  const rows = getDay(today) === 0 ? 2 : 3;

  return (
    <div>
      {Array.from(Array(rows).keys()).map((row) => {
        return (
          <div style={{ display: "flex" }}>
            {Array.from(Array(7).keys()).map((dow) => {
              return (
                <DayCell
                  scheduleDays={scheduleDays}
                  setScheduleDays={setScheduleDays}
                  date={add(lastSunday, { days: dow + 7 * row })}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const DayCell = ({
  date,
  scheduleDays,
  setScheduleDays,
}: {
  date: Date;
  scheduleDays: ScheduleDay[];
  setScheduleDays: (d: ScheduleDay[]) => void;
}) => {
  const selected =
    scheduleDays.find(({ start }) => isSameDay(date, start)) !== undefined;

  const onClick = () => {
    if (!selected) {
      setScheduleDays([
        ...scheduleDays,
        { start: date, end: add(date, { hours: 24 }) },
      ]);
    } else {
      setScheduleDays(
        scheduleDays.filter(({ start }) => !isSameDay(date, start))
      );
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        width: "50px",
        height: "50px",
        textAlign: "center",
        lineHeight: "50px",
        fontWeight: "bold",
        border: selected ? "solid 3px var(--color)" : "solid 3px transparent",
        borderRadius: "5px",
        margin: "3px",
      }}
    >
      {getDate(date)}
    </div>
  );
};
