import {useState, useEffect} from 'react';
declare global {
  interface Window {
    gapi: any;
  }
}

export function IdentifyModal() {
  const CLIENT_ID =
    '59554851138-objj75qdgbinjf47pit1rh57ebpkf7vt.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyCcJ2q-DhpLdjZH1URnzZLU9Jmna36SNog';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
  const [events, setEvents] = useState<any>([]);

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = 'https://apis.google.com/js/api.js';

    document.body.appendChild(script);

    // script.addEventListener('load', () => {
    //   if (window.gapi) handleClientLoad();
    // });
  }, []);

  useEffect(() => {
    console.log('events: ', events);
  }, [events]);

  const handleClientLoad = () => {
    window.gapi.load('client:auth2', initClient);
  };

  const openSignInPopup = () => {
    window.gapi.auth2.authorize(
      {client_id: CLIENT_ID, scope: SCOPES},
      (res: {access_token: string}) => {
        console.log('res', res);
        if (res.access_token) {
          localStorage.setItem('access_token', res.access_token);

          // Load calendar events after authentication
          window.gapi.client.load('calendar', 'v3', listUpcomingEvents);
        }
      },
    );
  };

  const initClient = () => {
    if (!localStorage.getItem('access_token')) {
      openSignInPopup();
    } else {
      // Get events if access token is found without sign in popup
      console.log('also here');
      fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${API_KEY}&orderBy=startTime&singleEvents=true`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        },
      )
        .then((res) => {
          // Check if unauthorized status code is return open sign in popup
          if (res.status !== 401) {
            return res.json();
          } else {
            localStorage.removeItem('access_token');
            openSignInPopup();
          }
        })
        .then((data) => {
          if (data?.items) {
            setEvents(formatEvents(data.items));
          }
        });
    }
  };

  const listUpcomingEvents = () => {
    window.gapi.client.calendar.events
      .list({
        // Fetch events from user's primary calendar
        calendarId: 'primary',
        showDeleted: true,
        singleEvents: true,
      })
      .then(function (response: {result: {items: any}}) {
        let events = response.result.items;

        if (events.length > 0) {
          setEvents(formatEvents(events));
        }
      });
  };

  const formatEvents = (list: any[]) => {
    return list.map(
      (item: {
        summary: any;
        start: {dateTime: any; date: any};
        end: {dateTime: any; date: any};
      }) => ({
        title: item.summary,
        start: item.start.dateTime || item.start.date,
        end: item.end.dateTime || item.end.date,
      }),
    );
  };

  const [name, setName] = useState<string>('');

  return (
    <div>
      <header
        style={{
          position: 'relative',

          zIndex: 3,
          backgroundColor: 'white',
          opacity: 1,
        }}>
        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <h1 style={{textAlign: 'center'}}>Meeting Title Here</h1>
          <label style={{textAlign: 'center'}}>Import your availability</label>
          <button
            style={{textAlign: 'center'}}
            type="submit"
            onClick={handleClientLoad}>
            Sync your calendar with Google
          </button>
          <div
            style={{
              width: '615px',
              height: '0px',
              left: '412px',
              top: '478px',

              border: '1px solid #000000',
            }}></div>
          <label style={{textAlign: 'center'}} htmlFor="name">
            Or
          </label>
          <input
            style={{marginLeft: 'auto', marginRight: 'auto'}}
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={'Tell us what to call you'}
          />
          <button
            style={{marginLeft: 'auto', marginRight: 'auto'}}
            type="submit"
            onClick={() => {}}>
            Manually add my availability
          </button>
        </form>
      </header>
      <div
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'black',
          left: 0,
          top: 0,
          opacity: 0.5,
        }}></div>
    </div>
  );
}
