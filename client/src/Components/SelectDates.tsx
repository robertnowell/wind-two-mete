import React, { useState } from "react";
import { ScheduleDay } from "../Types";
import { set, add, getDay, previousSunday, getDate, isSameDay } from "date-fns";
const DEFAULT_END_OFFSET_HR = 19;
const DEFAULT_START_OFFSET_HR = 7;
const RESOLUTION_HR = 2; //

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
      {Array.from(Array(rows).keys()).map((row, i) => {
        return (
          <div style={{ display: "flex" }} key={i}>
            {Array.from(Array(7).keys()).map((dow) => {
              return (
                <DayCell
                  key={dow}
                  scheduleDays={scheduleDays}
                  setScheduleDays={setScheduleDays}
                  date={add(lastSunday, { days: dow + 7 * row })}
                  disabled={add(lastSunday, { days: dow + 7 * row }) < today}
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
  disabled,
}: {
  disabled: boolean;
  date: Date;
  scheduleDays: ScheduleDay[];
  setScheduleDays: (d: ScheduleDay[]) => void;
}) => {
  const selected =
    scheduleDays.find(({ start }) => isSameDay(date, start)) !== undefined;

  const onClick = () => {
    if (disabled) {
      return;
    }

    if (!selected) {
      setScheduleDays([
        ...scheduleDays,
        {
          start: add(date, { hours: DEFAULT_START_OFFSET_HR }).getTime(),
          end: add(date, { hours: DEFAULT_END_OFFSET_HR }).getTime(),
          parts:
            (DEFAULT_END_OFFSET_HR - DEFAULT_START_OFFSET_HR) * RESOLUTION_HR,
          partSize: 1 / RESOLUTION_HR,
        },
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
        cursor: "pointer",
        color: selected ? "white" : "black",
        backgroundColor: selected ? "var(--color)" : "transparent",
      }}
    >
      {!disabled && getDate(date)}
    </div>
  );
};
