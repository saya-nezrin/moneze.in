export async function getConsultation(uri) {
  if (!/^https:\/\/api\.calendly\.com\/scheduled_events\/[a-zA-Z0-9-]+$/.test(uri || "") || !process.env.CALENDLY_ACCESS_TOKEN) return null;
  try {
    const response = await fetch(uri, { headers: { Authorization: `Bearer ${process.env.CALENDLY_ACCESS_TOKEN}` }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const { resource } = await response.json();
    return { startTime: resource.start_time, endTime: resource.end_time, status: resource.status, location: resource.location?.join_url || resource.location?.location || "Google Meet" };
  } catch { return null; }
}
