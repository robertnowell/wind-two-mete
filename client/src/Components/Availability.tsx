import React, { useState, useEffect } from "react";
import { Meeting, ScheduleDay, UnixTime } from "../Types";
import { getDate, getDay, sub, add, format } from "date-fns";
const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sun"];

const buildAvailabilityDataStructure = (scheduleDays: ScheduleDay[]) => {
  const x = scheduleDays.reduce<Record<UnixTime, string[][]>>(
    (prevValue, currentValue) => {
      prevValue[currentValue.start] = Array(currentValue.parts)
        .fill(1)
        .map(() => []);
      return prevValue;
    },
    {}
  );
  return x;
};

const mergeGroupCalendar = (meeting: Meeting) => {
  const groupSchedule = buildAvailabilityDataStructure(meeting.scheduleDays);
  Object.values(meeting.users || {}).forEach((user) => {
    Object.keys(user.windows).forEach((start) => {
      user.windows[+start].forEach((v, i) => {
        if (v) {
          groupSchedule[+start][i].push(user.name);
        }
      });
    });
  });
  return groupSchedule;
};

export function Availability({
  meeting,
  name,
  submitTimes,
  availability,
  setAvailability,
}: {
  meeting: Meeting;
  name: string;
  submitTimes: (a: Record<UnixTime, boolean[]>) => void;
  availability: Record<UnixTime, boolean[]>;
  setAvailability: (a: Record<UnixTime, boolean[]>) => void;
}) {
  const [mouseDown, setMouseDown] = useState(false);

  const groupSchedule = mergeGroupCalendar(meeting);

  const updateAvailability = (startDate: number, section: number) => {
    availability[startDate][section] = !availability[startDate][section];
    setAvailability({ ...availability });
  };

  const onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    submitTimes(availability);
  };

  useEffect(() => {
    document.body.onmousedown = function () {
      setMouseDown(true);
    };
    document.body.onmouseup = function () {
      setMouseDown(false);
    };
  }, []);

  return (
    <form>
      <div style={{ display: "flex" }}>
        <CalendarKey scheduleDay={meeting.scheduleDays[0]} />
        {meeting.scheduleDays.map((scheduleDay, i) => (
          <DayColumn
            userCount={Object.keys(meeting.users || {}).length}
            groupSchedule={groupSchedule}
            mouseDown={mouseDown}
            key={scheduleDay.start}
            scheduleDay={scheduleDay}
            updateAvailability={updateAvailability}
            availability={availability}
          />
        ))}
      </div>
      <button type="submit" onClick={onSubmit}>
        Save Times
      </button>
    </form>
  );
}

const DayColumn = React.memo(
  ({
    scheduleDay,
    availability,
    updateAvailability,
    mouseDown,
    groupSchedule,
    userCount,
  }: {
    scheduleDay: ScheduleDay;
    userCount: number;
    updateAvailability: (startDate: number, section: number) => void;
    availability: Record<UnixTime, boolean[]>;
    mouseDown: boolean;
    groupSchedule: Record<UnixTime, string[][]>;
  }) => {
    return (
      <div>
        <h2>
          {dow[getDay(scheduleDay.start)]} {getDate(scheduleDay.start)}
          {getDate(scheduleDay.start) !==
          getDate(sub(scheduleDay.end, { seconds: 1 }))
            ? "/" + getDate(scheduleDay.end)
            : ""}
        </h2>
        {Array(scheduleDay.parts)
          .fill(0)
          .map((_, i) => {
            const availCount =
              groupSchedule[scheduleDay.start] &&
              groupSchedule[scheduleDay.start][i].length;

            const selected =
              availability[scheduleDay.start] &&
              availability[scheduleDay.start][i];

            const lastSelected =
              availability[scheduleDay.start] &&
              availability[scheduleDay.start][i - 1];

            const nextSelected =
              availability[scheduleDay.start] &&
              availability[scheduleDay.start][i + 1];

            return (
              <div
                key={i}
                style={{
                  width: "90px",
                  height: "30px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "20px",
                    backgroundColor: "#7944E1",
                    border: "5px solid #7944E1",
                    position: "absolute",
                    opacity: userCount ? (1 / userCount) * availCount : 0,
                  }}
                ></div>
                <div
                  key={i}
                  onMouseDown={() => {
                    updateAvailability(scheduleDay.start, i);
                  }}
                  onMouseOver={() => {
                    if (mouseDown) {
                      updateAvailability(scheduleDay.start, i);
                    }
                  }}
                  style={{
                    width: "80px",
                    height: "20px",
                    border: "5px solid transparent",
                    borderRightColor: selected ? "#6DC266" : "transparent",
                    borderLeftColor: selected ? "#6DC266" : "transparent",
                    borderTopColor:
                      selected && !lastSelected ? "#6DC266" : "transparent",
                    borderBottomColor:
                      selected && !nextSelected ? "#6DC266" : "transparent",
                    userSelect: "none",
                    position: "absolute",
                    borderRadius: "3px",
                  }}
                ></div>
              </div>
            );
          })}
      </div>
    );
  }
);

const TICK_FREQUENCY = 2;

const CalendarKey = ({ scheduleDay }: { scheduleDay: ScheduleDay }) => {
  return (
    <div>
      <h2>&#x200B;</h2>
      {Array(scheduleDay.parts)
        .fill(0)
        .map((_, i) => {
          return (
            <div key={i} style={{ display: "flex", justifyContent: "end" }}>
              <div
                style={{
                  width: i % TICK_FREQUENCY === 0 ? "90px" : "10px",
                  height: "29px",
                  borderTop:
                    i % TICK_FREQUENCY === 0
                      ? "1px solid black"
                      : "1px solid grey",
                }}
              >
                {i % TICK_FREQUENCY === 0 && (
                  <small>
                    {format(
                      add(scheduleDay.start, {
                        hours: i * scheduleDay.partSize,
                      }),
                      "h aaa"
                    )}
                  </small>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};
