import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getDatabase, ref, child, get, set } from "firebase/database";
import { nanoid } from "nanoid";
import { add } from "date-fns";
import { IdentifyModal } from "./IdentifyModal";
import { Message } from "../../Components/Message";
import { Availability } from "./Components/Availability";
import { Meeting, UserRecord, GoogleEventFormat, UnixTime } from "../../Types";

const USER_NAME_KEY = "USER_NAME_KEY";

export function MeetingView() {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [name, setName] = useState(localStorage.getItem(USER_NAME_KEY) || "");
  const [userId] = useState<string>(nanoid());
  const urlInputRef = useRef<HTMLInputElement>(null);

  const [availability, setAvailability] = useState<Record<UnixTime, boolean[]>>(
    {}
  );

  const loadMeeting = async () => {
    const dbRef = ref(getDatabase());
    const snapshot = await get(child(dbRef, `meetings/${id}`));

    if (snapshot.exists()) {
      const loadedMeeting: Meeting = snapshot.val();
      setMeeting(loadedMeeting);

      const startValue = loadedMeeting.scheduleDays.reduce<
        Record<UnixTime, boolean[]>
      >((prevValue, currentValue) => {
        prevValue[currentValue.start] = Array(currentValue.parts).fill(false);
        return prevValue;
      }, {});
      setAvailability(startValue);
    }

    setLoading(false);
  };

  const setScheduleFromGoogle = (eventList: GoogleEventFormat[]) => {
    if (!meeting) {
      return;
    }

    const emptySchedule = meeting.scheduleDays.reduce<
      Record<UnixTime, boolean[]>
    >((prevValue, currentValue) => {
      prevValue[currentValue.start] = Array(currentValue.parts).fill(true);
      return prevValue;
    }, {});

    eventList.forEach((event) => {
      blockOutTimes(emptySchedule, event.start, event.end);
    });

    setAvailability(emptySchedule);
  };

  const blockOutTimes = (
    schedule: Record<number, boolean[]>,
    start: Date,
    end: Date
  ) => {
    if (!meeting) {
      return;
    }

    const datesToEdit = Object.keys(schedule).filter((key) => {
      const unixTime = +key;
      return (
        unixTime <= start.getTime() &&
        start.getTime() <
          add(unixTime, {
            minutes: schedule[unixTime].length * 0.5 * 60,
          }).getTime()
      );
    });

    datesToEdit.forEach((timeKey) => {
      let dateStartTime = +timeKey;
      let block = 0;
      const resolution = meeting?.scheduleDays[0].partSize || 0.5;
      while (block <= schedule[dateStartTime].length) {
        // if block block in between start and end. Block off

        const blockStartTime = add(dateStartTime, {
          minutes: block * resolution * 60,
        }).getTime();

        if (blockStartTime > end.getTime()) {
          break;
        }

        if (blockStartTime >= start.getTime()) {
          schedule[dateStartTime][block] = false;
        }
        block++;
      }
    });
  };

  useEffect(() => {
    //Check if meeting exists
    if (id) {
      // // Load ID
      // const userId = localStorage.getItem(USER_ID_KEY);
      // const newId = nanoid();
      // if (!userId) {
      //   localStorage.setItem(USER_ID_KEY, newId);
      // }
      // setUserId(userId || newId);
      // // setModalOpen(!userId);

      // // Load Name
      // const name = localStorage.getItem(USER_NAME_KEY);
      // if (name) {
      //   setName(name);
      // }
      loadMeeting();
    }
    return () => {};
  }, [id]);

  useEffect(() => {
    localStorage.setItem(USER_NAME_KEY, name);
  }, [name]);

  const submitTimes = async (availability: Record<number, boolean[]>) => {
    if (!meeting) {
      return;
    }
    setSaveMessage(true);
    const db = getDatabase();

    const user: UserRecord = {
      id: userId,
      name: name,
      windows: availability,
    };
    await set(ref(db, "meetings/" + meeting.id + "/users/" + user.id), user);
    loadMeeting();
  };

  if (loading) {
    return (
      <header>
        <h3>
          <i>loading...</i>
        </h3>
      </header>
    );
  }

  if (!id || !meeting) {
    return (
      <header>
        <h1>We can't find that meeting D:</h1>
        <a href="/">
          <i>Take me back home!</i>
        </a>
      </header>
    );
  }

  const url = `${window.location.host}/m/${id}`;

  return (
    <main>
      {modalOpen && (
        <IdentifyModal
          meeting={meeting}
          name={name}
          setName={setName}
          setModalOpen={setModalOpen}
          setSchedule={setScheduleFromGoogle}
        />
      )}
      <h2>{meeting.name}</h2>
      <p>
        Editing availability for <b>{name}</b>
      </p>
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopiedMessage(true);
          }}
          style={{ padding: "4px" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="white"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
          </svg>
        </button>
        <input
          style={{ marginBottom: 0, height: "30px", marginRight: "4px" }}
          ref={urlInputRef}
          onChange={() => {}}
          value={url}
        />
      </div>
      <hr style={{ margin: "1em 0" }} />
      {meeting.users && (
        <p>
          We have responses from{" "}
          {Object.values(meeting.users)
            .map((user) => user.name)
            .join(", ")}
        </p>
      )}

      <Availability
        availability={availability}
        setAvailability={setAvailability}
        name={name}
        meeting={meeting}
        submitTimes={submitTimes}
      />
      <Message
        message="Copied"
        open={copiedMessage}
        setOpen={setCopiedMessage}
      />
      <Message message="Saved" open={saveMessage} setOpen={setSaveMessage} />
    </main>
  );
}
