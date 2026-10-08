// Step 4: show the confirmed booking.
// The seats page put the booking uuid in the URL.
const params = new URLSearchParams(location.search);

fetch(`/api/booking/${params.get('uuid')}`)
  .then(readJson)
  .then(showBooking);

function showBooking(booking) {
  const status = document.querySelector('#status');

  if (booking.errorMessage) {
    status.className = 'error';
    status.textContent = booking.errorMessage;
    return;
  }

  status.hidden = true;

  // Prices are in cents and only USD is used, so 9000 is $90.00.
  const total = (booking.pricing.retail / 100).toFixed(2);

  // "2026-11-01T20:00:00-05:00" becomes "2026-11-01 20:00".
  const date = booking.availability.localDateTimeStart.slice(0, 16).replace('T', ' ');

  document.querySelector('#reference').textContent = booking.supplierReference;
  document.querySelector('#date').textContent = date;
  document.querySelector('#seats').textContent = booking.unitItems.length;
  document.querySelector('#total').textContent = `$${total}`;
  document.querySelector('#email').textContent = booking.contact.emailAddress;
  document.querySelector('#booking').hidden = false;

  // The PDF with the tickets, when MyTicketPro provides one.
  if (booking.voucher) {
    for (const option of booking.voucher.deliveryOptions) {
      if (option.deliveryFormat === 'PDF_URL') {
        const link = document.querySelector('#tickets');
        link.href = option.deliveryValue;
        link.hidden = false;
      }
    }
  }
}

// fetch() gives back a response. This reads the JSON inside it.
function readJson(response) {
  return response.json();
}
