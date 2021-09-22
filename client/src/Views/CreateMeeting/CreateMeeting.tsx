import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { ScheduleDay } from "../../Types";
import { SelectDates } from "../../Components";

export function CreateMeeting() {
  const history = useHistory();
  const [dates, setDates] = useState<ScheduleDay[]>([]);
  const [name, setName] = useState<string>("");

  function createMeeting() {
    const meetingId = "123";
    history.push(`/m/${meetingId}`);
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
          placeholder=""
        />
        <button type="submit" onClick={createMeeting}>
          Create Meeting
        </button>
      </form>
    </div>
  );
}
