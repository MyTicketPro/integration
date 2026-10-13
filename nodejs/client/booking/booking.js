// Step 4: show the confirmed booking.
// The widget page put the booking uuid in the URL.
const params = new URLSearchParams(location.search);

fetch(`/api/bookings/${params.get('uuid')}`)
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

    // "2026-11-01T20:00:00-05:00" becomes "2026-11-01 20:00".
    const start = booking.availability.localDateTimeStart.slice(0, 16).replace('T', ' ');

    document.querySelector('#supplier-reference').textContent = booking.supplierReference;
    document.querySelector('#availability').textContent = start;
    document.querySelector('#unit-items').textContent = booking.unitItems.length;
    // What the shopper paid. The booking is always in the booking currency (USD).
    document.querySelector('#retail').textContent = formatPrice(booking.pricing);
    document.querySelector('#email-address').textContent = booking.contact.emailAddress;
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

// Turns an OCTO pricing object into text, like "$90.00".
// Amounts are whole numbers in the smallest unit: 9000 with currencyPrecision 2 is 90.00.
function formatPrice(pricing) {

    const amount = pricing.retail / Math.pow(10, pricing.currencyPrecision);

    return amount.toLocaleString('en-US', { style: 'currency', currency: pricing.currency });
}

// fetch() gives back a response. This reads the JSON inside it.
function readJson(response) {

    return response.json();
}
