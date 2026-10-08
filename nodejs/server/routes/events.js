// Guide steps 1a and 1b: list the events that have open dates
// in the next 30 days.
import { mtp } from '../mtp.js';

// A real site serves this from its own cache, refreshed by a daily sync.
// Calling MyTicketPro live keeps the example short.
export async function listEvents(req, res) {
    
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 10);

    // Dates as YYYY-MM-DD ('en-CA' writes them that way).
    const localDateStart = today.toLocaleDateString('en-CA');
    const localDateEnd = in30Days.toLocaleDateString('en-CA');

    // Step 1a: each product's id is a productId, and its internalName is the event name.
    const products = await mtp('GET', '/products');

    const events = [];

    for (const product of products) {
        // Step 1b: one entry per event date. Its id is an availabilityId.
        let dates;
        try {
            dates = await mtp('POST', '/availability', {
                productId: product.id,
                optionId: 'widget',
                localDateStart,
                localDateEnd,
            });
        } catch {
            // This product can't be sold through the widget. Skip it.
            continue;
        }

        // Keep only the dates that still have seats.
        const openDates = [];
        for (const date of dates) {
            if (date.available) {
                openDates.push(date);
            }
        }

        if (openDates.length > 0) {
            events.push({
                productId: product.id,
                name: product.internalName,
                dates: openDates,
            });
        }
    }

    res.json(events);
}
