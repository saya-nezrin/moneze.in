const APPOINTMENT_DURATION_MINUTES = 30;

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);
    const data = JSON.parse(event.postData.contents);
    validateBooking(data);

    const start = new Date(`${data.date}T${data.time}:00`);
    const end = new Date(start.getTime() + APPOINTMENT_DURATION_MINUTES * 60000);
    const calendar = CalendarApp.getDefaultCalendar();

    if (calendar.getEvents(start, end).length > 0) {
      return jsonResponse({ success: false, message: "That time is unavailable. Please choose another slot." });
    }

    const appointment = calendar.createEvent(
      `Moneze consultation — ${data.name}`,
      start,
      end,
      {
        description: `Client: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}`,
        guests: data.email,
        sendInvites: true
      }
    );

    appointment.addPopupReminder(30);
    return jsonResponse({ success: true, eventId: appointment.getId() });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message || "Unable to schedule this consultation." });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function validateBooking(data) {
  if (!data.name || !data.email || !data.phone || !data.date || !data.time) {
    throw new Error("Please complete every field.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new Error("Please enter a valid email address.");
  }

  const start = new Date(`${data.date}T${data.time}:00`);
  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    throw new Error("Please choose a future date and time.");
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
