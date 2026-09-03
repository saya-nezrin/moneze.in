# moneze.in
Build wealth with smarter mutual fund investing.

## Google Calendar consultation booking

The website includes a consultation popup that submits bookings to the calendar owner through Google Apps Script.

1. Sign in to Ajay's Google account and open [Google Apps Script](https://script.google.com/).
2. Create a new project and copy the files from `google-apps-script/` into it.
3. Set the Apps Script project timezone to `Asia/Kolkata`.
4. Select **Deploy > New deployment > Web app**.
5. Set **Execute as** to `Me` and access to `Anyone`.
6. Authorize Calendar access and copy the `/exec` deployment URL.
7. Copy `.env.example` to `.env`, replace the placeholder with that URL, and restart the Vite server.

Bookings create a 30-minute event in the Google account's default calendar, reject overlapping times, add the client as a guest, send invitations, and add a 30-minute popup reminder.
