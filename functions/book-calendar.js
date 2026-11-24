const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env;
  if (!GOOGLE_CALENDAR_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    return {
      statusCode: 200,
      body: JSON.stringify({ synced: false, reason: 'Google Calendar credentials not configured' })
    };
  }

  try {
    const { date, time, service, name, phone } = JSON.parse(event.body);
    const startDateTime = `${date}T${time}:00`;
    const endDate = new Date(new Date(startDateTime).getTime() + 30 * 60000);
    const endDateTime = endDate.toISOString().slice(0, 19);

    const token = await getGoogleAccessToken(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    );

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: `${service} — ${name}`,
          description: `Cliente: ${name}\nTeléfono: ${phone}\nServicio: ${service}`,
          start: { dateTime: startDateTime, timeZone: 'Europe/Madrid' },
          end: { dateTime: endDateTime, timeZone: 'Europe/Madrid' }
        })
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return { statusCode: 500, body: JSON.stringify({ synced: false, error: errorText }) };
    }

    return { statusCode: 200, body: JSON.stringify({ synced: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ synced: false, error: err.message }) };
  }
};

async function getGoogleAccessToken(email, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    })
  ).toString('base64url');

  const signature = crypto
    .createSign('RSA-SHA256')
    .update(`${header}.${claim}`)
    .sign(privateKey, 'base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${header}.${claim}.${signature}`
  });

  const data = await res.json();
  return data.access_token;
}
