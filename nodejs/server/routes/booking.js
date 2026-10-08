// Reads one booking, so the confirmation page can show it.
import { mtp } from '../mtp.js';

export async function getBooking(req, res) {
  // A real shop first checks that this booking belongs to the shopper asking.
  const booking = await mtp('GET', `/bookings/${req.params.uuid}`);

  res.json(booking);
}
