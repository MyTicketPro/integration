// The seats page, in three steps:
//   1. createWidget     asks our server for a widget and shows it
//   2. onWidgetMessage()  follows what the shopper does in the widget
//   3. confirmBooking()   confirms the booking when the form is sent

// The events page put the chosen product and date in the URL.
const params = new URLSearchParams(location.search);


// Step 1: createWidget

let widget;
// Our server creates the widget. Only the server holds the API token.
// See server/index.js and server/routes/widget.js for how the widget is created.
fetch('/api/widget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        productId: params.get('productId'),
        availabilityId: params.get('availabilityId'),
    }),
})
.then(readJson)
.then(showWidget);


function showWidget(data) {

    if (data.errorMessage) {
        document.querySelector('#totals').textContent = data.errorMessage;
        return;
    }

    widget = data;

    document.querySelector('#totals').textContent = 'Nothing selected yet.';
    document.querySelector('#octo-widget').src = widget.url;

    // Now that there is a widget, listen to it and to the form.
    window.addEventListener('message', onWidgetMessage);
    document.querySelector('#contact').addEventListener('submit', confirmBooking);
}


// 2. The widget sends this page messages (guide step 2).
function onWidgetMessage(event) {

    // Any website can send messages here. Only listen to the widget.
    if (event.origin !== new URL(widget.url).origin) {
        return;
    }

    const message = event.data;

    // The shopper changed their selection.
    if (message.type === 'octo.widget.change') {
        const seats = message.payload.unitItems.length;
        const total = message.payload.pricing.retail / 100; // prices are in cents

        document.querySelector('#totals').textContent = `${seats} seat(s), total $${total.toFixed(2)}`;
    }

    // The shopper finished. MyTicketPro now holds the seats,
    // so hide the widget and show the checkout.
    if (message.type === 'octo.widget.complete') {
        document.querySelector('#selection').textContent = document.querySelector('#totals').textContent;
        document.querySelector('#seats').hidden = true;
        document.querySelector('#checkout').hidden = false;
    }

    // The widget wants a different height.
    if (message.type === 'octo.widget.resize') {
        document.querySelector('#octo-widget').style.height = message.payload.height + 'px';
    }
}


// 3. Confirm the booking (guide steps 3a and 3c).
function confirmBooking(event) {

    // Don't let the browser send the form. We send it ourselves.
    event.preventDefault();

    const form = event.target;

    // A real shop takes payment before this call.
    fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            uuid: widget.uuid,
            contact: {
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                emailAddress: form.emailAddress.value,
                phoneNumber: form.phoneNumber.value,
            },
        }),
    })
    .then(readJson)
    .then(showConfirmation);
}

function showConfirmation(booking) {
    if (booking.errorMessage) {
        // For example, the hold expired and the seats must be picked again.
        document.querySelector('#error').textContent = booking.errorMessage;
        return;
    }

    // Show the confirmed booking on its own page.
    location.href = `/confirmation/?uuid=${booking.uuid}`;
}


// fetch() gives back a response. This reads the JSON inside it.
function readJson(response) {
    return response.json();
}
