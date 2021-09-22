import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { ScheduleDay, Meeting } from "../../Types";
import { SelectDates } from "../../Components";
import { nanoid } from "nanoid";
import { uniqueNamesGenerator, Config, animals } from "unique-names-generator";
import { getDatabase, ref, set } from "firebase/database";

const config: Config = {
  dictionaries: [animals],
};

const randomAnimalMeetingName: string = `Meeting of the ${uniqueNamesGenerator(
  config
)}s`;

export function CreateMeeting() {
  const history = useHistory();
  const [dates, setDates] = useState<ScheduleDay[]>([]);
  const [name, setName] = useState<string>("");

  async function createMeeting(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    const db = getDatabase();
    const meeting: Meeting = {
      id: nanoid(11),
      name: name ? name : randomAnimalMeetingName,
      users: {},
      scheduleDays: dates,
    };
    await set(ref(db, "meetings/" + meeting.id), meeting);

    history.push(`/m/${meeting.id}`);
  }

  return (
    <div>
      <form>
        <h1>Create a meeting</h1>
        <label>Select days</label>
        <SelectDates scheduleDays={dates} setScheduleDays={setDates} />
        <label htmlFor="name">Meeting Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={randomAnimalMeetingName}
        />
        <button type="submit" onClick={createMeeting}>
          Create Meeting
        </button>
      </form>
    </div>
  );
}
