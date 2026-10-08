// The mtp() helper from the guide's "Your token" step.
// It is the only code that calls MyTicketPro, and it runs on your server,
// so the token never reaches the browser.
const MTP_API   = process.env.MTP_API || 'https://api.sandbox.myticketpro.app/octo';
const MTP_TOKEN = process.env.MTP_TOKEN;

export async function mtp(method, path, body) {

    if (!MTP_TOKEN) {
        throw new Error('MTP_TOKEN is not set. Copy .env.example to .env and add your sandbox token.');
    }

    const response = await fetch(MTP_API + path, {
        method,
        headers: {
            'Authorization'     : `Bearer ${MTP_TOKEN}`,
            'Content-Type'      : 'application/json',
            'Octo-Capabilities' : 'octo/pricing, octo/widget',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    // MyTicketPro answers errors with { error, errorMessage }.
    if (!response.ok) {
        const error = new Error(data.errorMessage);
        error.code = data.error;
        error.status = response.status;
        throw error;
    }

    return data;
}
