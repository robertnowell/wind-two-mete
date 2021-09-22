import React, { useState, useEffect } from "react";
import { Meeting, ScheduleDay, UnixTime, UserRecord } from "../Types";
import { getDate, getDay, sub, add, format } from "date-fns";
import { getDatabase, ref, set } from "firebase/database";
import { nanoid } from "nanoid";
const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sun"];

const userID = nanoid(11);

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
  console.log(groupSchedule);
  return groupSchedule;
};

export function Availability({
  meeting,
  name,
}: {
  meeting: Meeting;
  name: string;
}) {
  const [mouseDown, setMouseDown] = useState(false);

  const groupSchedule = mergeGroupCalendar(meeting);

  const [availability, setAvailability] = useState<Record<UnixTime, boolean[]>>(
    () => {
      const startValue = meeting.scheduleDays.reduce<
        Record<UnixTime, boolean[]>
      >((prevValue, currentValue) => {
        prevValue[currentValue.start] = Array(currentValue.parts).fill(false);
        return prevValue;
      }, {});
      return startValue;
    }
  );

  const updateAvailability = (startDate: number, section: number) => {
    availability[startDate][section] = !availability[startDate][section];
    setAvailability({ ...availability });
  };

  const submitTimes = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const db = getDatabase();
    const user: UserRecord = {
      id: userID,
      name: name,
      windows: availability,
    };
    await set(ref(db, "meetings/" + meeting.id + "/users/" + user.id), user);
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
            userCount={Object.keys(meeting.users).length}
            groupSchedule={groupSchedule}
            mouseDown={mouseDown}
            key={scheduleDay.start}
            scheduleDay={scheduleDay}
            updateAvailability={updateAvailability}
            availability={availability}
          />
        ))}
      </div>
      <button type="submit" onClick={submitTimes}>
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
        <h2>{dow[getDay(scheduleDay.start)]}</h2>
        {getDate(scheduleDay.start)}
        {getDate(scheduleDay.start) !==
        getDate(sub(scheduleDay.end, { seconds: 1 }))
          ? "/" + getDate(scheduleDay.end)
          : ""}
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
                  backgroundColor: "#7944E1",
                  opacity: (1 / userCount) * availCount,
                  userSelect: "none",
                }}
              >
                {availCount}
              </div>
            );
          })}
      </div>
    );
  }
);

const CalendarKey = ({ scheduleDay }: { scheduleDay: ScheduleDay }) => {
  return (
    <div>
      <h2>&#x200B;</h2>&#x200B;
      {Array(scheduleDay.parts)
        .fill(0)
        .map((_, i) => {
          return (
            <div
              key={i}
              style={{
                width: "90px",
                height: "20px",

                borderBottom:
                  i % 6 === 0 ? "1px solid black" : "1px solid transparent",
                borderTop: "1px solid transparent",
              }}
            >
              {i % 6 === 0 && (
                <small>
                  {format(
                    add(scheduleDay.start, { hours: i * scheduleDay.partSize }),
                    "h aaa"
                  )}
                </small>
              )}
            </div>
          );
        })}
    </div>
  );
};
