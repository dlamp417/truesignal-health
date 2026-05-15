export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fname, lname, email, org, role, orgType, message } = req.body;

  if (!fname || !lname || !email || !org || !orgType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const html = `
    <h2>New Health Consultation Request</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Name</td><td>${fname} ${lname}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Organization</td><td>${org}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Role</td><td>${role || '—'}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Type</td><td>${orgType}</td></tr>
      ${message ? `<tr><td style="padding:6px 12px 6px 0;font-weight:600">Message</td><td>${message}</td></tr>` : ''}
    </table>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TrueSignal Health <notifications@usetruesignal.com>',
        to: ['dana@usetruesignal.com'],
        subject: `Health consultation: ${org}`,
        html,
        reply_to: email,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
