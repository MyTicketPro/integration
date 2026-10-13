// POST /octo/widgets: create the widget for the product and availability the shopper picked.
import { mtp } from '../mtp.js';

export async function createWidget(req, res) {

    const widget = await mtp('POST', '/widgets', {
        productId: req.body.productId,
        optionId: 'widget',
        availabilityId: req.body.availabilityId,
        // Hold the tickets as soon as the shopper finishes, so we never call POST /octo/bookings ourselves.
        createBookingOnComplete: true,
        // The widget shows prices in USD. To show euros instead, add your own rate:
        // displayCurrency: 'EUR', displayCurrencyExchangeRate: 0.92 (1 USD = 0.92 EUR).
        // No returnUrl: the widget sits in an iframe and talks with postMessage.
        returnUrl: null,
    });

    // A real shop saves widget.uuid with its order here.

    res.json({
        uuid: widget.uuid,
        url: widget.url,
    });
}
