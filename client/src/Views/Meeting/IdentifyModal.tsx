import { useState, useEffect } from "react";
import { Meeting, GoogleEventFormat } from "../../Types";
declare global {
  interface Window {
    gapi: any;
  }
}

const CLIENT_ID =
  "59554851138-objj75qdgbinjf47pit1rh57ebpkf7vt.apps.googleusercontent.com";
const API_KEY = "AIzaSyCcJ2q-DhpLdjZH1URnzZLU9Jmna36SNog";
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export function IdentifyModal({
  setModalOpen,
  setName,
  name,
  setSchedule,
  meeting,
}: {
  setModalOpen: (state: boolean) => void;
  setName: (name: string) => void;
  name: string;
  setSchedule: (meetings: GoogleEventFormat[]) => void;
  meeting: Meeting;
}) {
  const [error, setError] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = "https://apis.google.com/js/api.js";

    document.body.appendChild(script);
  }, []);

  const syncGoogle = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    window.gapi.load("client:auth2", initClient);
  };

  const openSignInPopup = () => {
    window.gapi.auth2.authorize(
      { client_id: CLIENT_ID, scope: SCOPES },
      (res: { access_token: string }) => {
        if (res.access_token) {
          console.log(res);
          localStorage.setItem("access_token", res.access_token);
          // Load calendar events after authentication
          loadCalendarEvents();
        }
      }
    );
  };

  const initClient = () => {
    if (!localStorage.getItem("access_token")) {
      openSignInPopup();
    } else {
      loadCalendarEvents();
    }
  };

  const loadCalendarEvents = async () => {
    const min = new Date(meeting.scheduleDays[0].start).toISOString();
    const max = new Date(
      meeting.scheduleDays[meeting.scheduleDays.length - 1].end
    ).toISOString();
    // Get events if access token is found without sign in popup
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${API_KEY}&orderBy=startTime&singleEvents=true&timeMin=${min}&timeMax=${max}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    // Check if unauthorized status code is return open sign in popup
    if (res.status !== 401) {
      const data = await res.json();
      setSchedule(formatEvents(data.items));
      setModalOpen(false);
    } else {
      localStorage.removeItem("access_token");
      openSignInPopup();
      return;
    }
  };

  const formatEvents = (list: any[]): GoogleEventFormat[] => {
    console.log(list);
    const filtered = list.filter((item) => {
      return item.status !== "cancelled" && !item.start.date; // filter cancelled and all day events
    });
    return filtered.map(
      (item: {
        summary: any;
        start: { dateTime: any; date: any; timeZone: any };
        end: { dateTime: any; date: any };
      }) => ({
        title: item.summary,
        start: new Date(item.start.dateTime),
        end: new Date(item.end.dateTime),
        timeZone: item.start.timeZone,
      })
    );
  };

  const manuallyAdd = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (!name) {
      setError("Please tell us your name :)");
      return;
    }
    setModalOpen(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 3,
        width: "100%",
        top: "70px",
        left: 0,
      }}
    >
      <header
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          zIndex: 3,
          opacity: 1,
          width: "100%",
        }}
      >
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
          }}
        >
          <h1 style={{ textAlign: "center" }}>{meeting.name}</h1>
          <label style={{ textAlign: "center" }}>
            Import your availability
          </label>
          <button style={{ textAlign: "center" }} onClick={syncGoogle}>
            Sync your calendar with Google
          </button>
          <div
            style={{
              height: "0px",
              left: "412px",
              top: "478px",
              width: "800px",

              border: "1px solid #000000",
            }}
          ></div>
          <label style={{ textAlign: "center" }} htmlFor="name">
            Or
          </label>
          <input
            style={{ marginLeft: "auto", marginRight: "auto" }}
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={"Tell us what to call you"}
          />
          <button
            style={{ marginLeft: "auto", marginRight: "auto" }}
            onClick={manuallyAdd}
          >
            Manually add my availability
          </button>
          {error}
        </form>
      </header>
      <div
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          backgroundColor: "black",
          left: 0,
          top: 0,
          opacity: 0.5,
        }}
      ></div>
    </div>
  );
}
