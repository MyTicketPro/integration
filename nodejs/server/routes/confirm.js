// Step 4: confirm the booking that the widget is holding.
export async function confirmBooking(mtpApi, req, res) {
  const { uuid, contact = {} } = req.body;

  // The browser only says which widget. Seats and price are re-read
  // from MyTicketPro, because anything the browser sends can be edited.
  const widget = await mtpApi.getWidget(uuid);
  const booking = widget.booking;

  if (widget.status !== 'COMPLETED' || !booking) {
    res.status(409).json({
      error: 'NOT_COMPLETED',
      errorMessage: 'No seats were selected for this widget.',
    });
    return;
  }

  // The page was reloaded after confirming: show the same booking again.
  if (booking.status === 'CONFIRMED') {
    res.json(booking);
    return;
  }

  if (isExpired(booking)) {
    res.status(410).json({
      error: 'HOLD_EXPIRED',
      errorMessage: 'Your seats were released because the hold expired.',
    });
    return;
  }

  // A real shop charges booking.pricing.retail here, before confirming.

  // Pass on only the contact fields MyTicketPro needs.
  const confirmed = await mtpApi.confirmBooking(booking.uuid, {
    contact: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      emailAddress: contact.emailAddress,
      phoneNumber: contact.phoneNumber,
      country: contact.country,
    },
    resellerReference: `example-${uuid}`,
  });

  res.json(confirmed);
}

// A held booking stops being confirmable when its hold time runs out.
function isExpired(booking) {
  if (booking.status !== 'ON_HOLD') {
    return true;
  }

  if (!booking.utcExpiresAt) {
    return false;
  }

  return new Date(booking.utcExpiresAt) < new Date();
}
