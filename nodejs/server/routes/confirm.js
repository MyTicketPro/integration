// GET /octo/widgets/{uuid} and POST /octo/bookings/{uuid}/confirm: read the widget, then confirm the booking
// it is holding.
import { mtp } from '../mtp.js';

export async function confirmBooking(req, res) {

    const widgetUuid = req.body.widgetUuid;
    const contact = req.body.contact;

    // Read the widget from MyTicketPro. Never trust unitItems or pricing
    // sent by the browser, because anyone can edit them.
    const widget = await mtp('GET', `/widgets/${widgetUuid}`);
    const booking = widget.booking;

    if (widget.status !== 'COMPLETED') {
        res.status(409).json({ errorMessage: 'No seats were selected for this widget.' });
        return;
    }

    // A reload or double click sends confirm again; answer with the booking.
    if (booking.status === 'CONFIRMED') {
        res.json(booking);
        return;
    }

    // The tickets are held until booking.utcExpiresAt (15 minutes by default).
    if (booking.status !== 'ON_HOLD' || new Date(booking.utcExpiresAt) < new Date()) {
        res.status(410).json({ errorMessage: 'Your seats were released. Please pick them again.' });
        return;
    }

    // A real shop charges booking.pricing.retail here, before confirming.

    // Confirm. The tickets are emailed to emailAddress.
    const confirmed = await mtp('POST', `/bookings/${booking.uuid}/confirm`, {
        resellerReference: `example-${widgetUuid}`,
        contact: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            emailAddress: contact.emailAddress,
            phoneNumber: contact.phoneNumber,
        },
    });

    res.json(confirmed);
}
