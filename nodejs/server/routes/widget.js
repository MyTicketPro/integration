// Guide step 1c: create the widget for the date the shopper picked.
import { mtp } from '../mtp.js';

export async function createWidget(req, res) {

    const widget = await mtp('POST', '/widgets', {
        productId: req.body.productId,
        optionId: 'widget',
        availabilityId: req.body.availabilityId,
        // Hold the seats as soon as the shopper finishes, so step 3b is not needed.
        createBooking: true,
        // No returnUrl: the widget sits in an iframe and talks with postMessage.
        returnUrl: null,
    });

    // A real shop saves widget.uuid with its order here.

    res.json({
        uuid: widget.uuid,
        url: widget.url,
    });
}
