// Step 4: ask the server to confirm the held booking, then show it.
const status = document.querySelector('#status');

// The event page saved the widget uuid and the contact details.
const checkout = JSON.parse(sessionStorage.getItem('checkout'));

if (checkout) {
  confirmBooking(checkout);
} else {
  status.textContent = 'Nothing to confirm yet. Pick an event first.';
}

async function confirmBooking(checkout) {
  const response = await fetch('/api/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkout),
  });
  const booking = await response.json();

  if (!response.ok) {
    // For example, the hold expired and the seats must be picked again.
    status.className = 'error';
    status.textContent = booking.errorMessage;
    return;
  }

  sessionStorage.removeItem('checkout');
  showBooking(booking);
}

function showBooking(booking) {
  status.textContent = 'Booking confirmed.';

  const date = booking.availability.localDateTimeStart
    .slice(0, 16)
    .replace('T', ' ');

  show('#reference', booking.supplierReference);
  show('#date', date);
  show('#seats', booking.unitItems.length);
  show('#total', money(booking.pricing));
  show('#email', booking.contact.emailAddress);
  document.querySelector('#booking').hidden = false;

  // The PDF with the tickets, when MyTicketPro provides one.
  const deliveryOptions = booking.voucher?.deliveryOptions ?? [];
  const pdf = deliveryOptions.find((option) => {
    return option.deliveryFormat === 'PDF_URL';
  });

  if (pdf) {
    const link = document.querySelector('#tickets');
    link.href = pdf.deliveryValue;
    link.hidden = false;
  }
}

function show(selector, text) {
  document.querySelector(selector).textContent = text;
}

// Prices are whole numbers of cents: 4500 with precision 2 is $45.00.
function money({ retail, currency, currencyPrecision }) {
  const amount = retail / 10 ** currencyPrecision;
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  return format.format(amount);
}
