// Step 2: list the events that have open dates in the next 30 days.

// A real site serves this from its own cache, refreshed by a daily sync
// (see the Reseller Integration Guide).
// Calling MyTicketPro live keeps the example short.
export async function listEvents(mtpApi, req, res) {
  const products = await mtpApi.listProducts();

  // Ask for the dates of every product at the same time.
  const events = await Promise.all(
    products.map(async (product) => {
      const dates = await openDates(mtpApi, product.id);

      return {
        productId: product.id,
        title: product.title,
        dates,
      };
    }),
  );

  const eventsWithDates = events.filter((event) => event.dates.length > 0);

  res.json(eventsWithDates);
}

// Returns the dates of one product that still have seats.
async function openDates(mtpApi, productId) {
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  let slots;
  try {
    slots = await mtpApi.checkAvailability({
      productId,
      localDateStart: toDay(today),
      localDateEnd: toDay(in30Days),
    });
  } catch {
    // A product that can't be sold through the widget has no dates.
    return [];
  }

  const openSlots = slots.filter((slot) => {
    return slot.status === 'AVAILABLE' || slot.status === 'LIMITED';
  });

  return openSlots.map((slot) => {
    return {
      availabilityId: slot.id,
      start: slot.localDateTimeStart,
      status: slot.status,
    };
  });
}

// Formats a date as YYYY-MM-DD, the format MyTicketPro expects.
function toDay(date) {
  return date.toISOString().slice(0, 10);
}
