// GET /octo/products and POST /octo/availability: list the products that have open availabilities
// in the next 120 days.
import { mtp } from '../mtp.js';

// A real site serves this from its own cache, refreshed by a daily sync.
// Calling MyTicketPro live keeps the example short.
export async function listProducts(req, res) {

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 120);

    // Dates as YYYY-MM-DD ('en-CA' writes them that way).
    const localDateStart = today.toLocaleDateString('en-CA');
    const localDateEnd = endDate.toLocaleDateString('en-CA');

    // Each product's id is a productId. Its internalName is the event's name.
    const products = await mtp('GET', '/products');

    const result = [];

    for (const product of products) {
        // One availability per event date. Its id is an availabilityId.
        let availabilities;
        try {
            availabilities = await mtp('POST', '/availability', {
                productId: product.id,
                optionId: 'widget',
                localDateStart,
                localDateEnd,
            });
        } catch {
            // This product can't be sold through the widget. Skip it.
            continue;
        }

        // Keep only the availabilities that can still be booked.
        const openAvailabilities = [];
        for (const availability of availabilities) {
            if (availability.available) {
                openAvailabilities.push(availability);
            }
        }

        if (openAvailabilities.length > 0) {
            result.push({
                id: product.id,
                internalName: product.internalName,
                availabilities: openAvailabilities,
            });
        }
    }

    res.json(result);
}
