// Guide steps 3a and 3c: read the widget, then confirm the booking
// it is holding.
import { mtp } from '../mtp.js';

export async function confirmBooking(req, res) {

    const uuid = req.body.uuid;
    const contact = req.body.contact;

    // Step 3a: read the widget from MyTicketPro. Never trust seats or prices
    // sent by the browser, because anyone can edit them.
    const widget = await mtp('GET', `/widgets/${uuid}`);
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

    // The seats are held until booking.utcExpiresAt (15 minutes by default).
    if (booking.status !== 'ON_HOLD' || new Date(booking.utcExpiresAt) < new Date()) {
        res.status(410).json({ errorMessage: 'Your seats were released. Please pick them again.' });
        return;
    }

    // A real shop charges booking.pricing.retail here, before confirming.

    // Step 3c: confirm. The tickets are emailed to emailAddress.
    const confirmed = await mtp('POST', `/bookings/${booking.uuid}/confirm`, {
        resellerReference: `example-${uuid}`,
        contact: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            emailAddress: contact.emailAddress,
            phoneNumber: contact.phoneNumber,
        },
    });

    res.json(confirmed);
}
