// The widget page, in three steps:
//   Step 1: create the widget and show it   (showWidget)
//   Step 2: follow what the shopper does    (onWidgetMessage)
//   Step 3: confirm the booking             (confirmBooking)

// The products page put the chosen productId and availabilityId in the URL.
const params = new URLSearchParams(location.search);


// Step 1: create the widget and show it.

let widget;
// Our server creates the widget. Only the server holds the API token.
// See server/routes/widgets.js for how the widget is created.
fetch('/api/widgets', {
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
        document.querySelector('#summary').textContent = data.errorMessage;
        return;
    }

    widget = data;

    document.querySelector('#summary').textContent = 'Nothing selected yet.';
    document.querySelector('#octo-widget').src = widget.url;

    // Now that there is a widget, listen to it and to the form.
    window.addEventListener('message', onWidgetMessage);
    document.querySelector('#contact').addEventListener('submit', confirmBooking);
}


// Step 2: the widget sends this page messages.
function onWidgetMessage(event) {

    // Any website can send messages here. Only listen to the widget.
    if (event.origin !== new URL(widget.url).origin) {
        return;
    }

    const message = event.data;

    // The shopper changed their selection. One unit item is one ticket.
    if (message.type === 'octo.widget.change') {
        logEvent(message, 'Selection changed. Updated the total.');

        const unitItems = message.payload.unitItems;
        const retail = message.payload.pricing.retail / 100; // prices are in cents

        document.querySelector('#summary').textContent = `${unitItems.length} ticket(s), total $${retail.toFixed(2)}`;
    }

    // The shopper finished. MyTicketPro now holds the tickets,
    // so hide the widget and show the checkout.
    if (message.type === 'octo.widget.complete') {
        logEvent(message, 'Shopper finished. Tickets are held. Showing the checkout.');

        document.querySelector('#checkout-summary').textContent = document.querySelector('#summary').textContent;
        document.querySelector('#widget').hidden = true;
        document.querySelector('#checkout').hidden = false;

        document.querySelector('#dev-widget').hidden = true;
        document.querySelector('#dev-checkout').hidden = false;
    }

    // The widget wants a different height.
    if (message.type === 'octo.widget.resize') {
        logEvent(message, 'Widget asked for a new height. Resized the iframe.');

        document.querySelector('#octo-widget').style.height = message.payload.height + 'px';
    }
}


// Shows one widget message in the "Widget events" box, newest first:
// its type, what it means, and the data the widget sent (the payload).
function logEvent(message, meaning) {

    const time = new Date().toLocaleTimeString();
    const payload = JSON.stringify(message.payload, null, 2);

    let html = '';
    html += `<div class="widget-event">`;
    html += `<p><b>${message.type}</b> <span>${time}</span></p>`;
    html += `<p>${meaning}</p>`;
    html += `<pre>${payload}</pre>`;
    html += `</div>`;

    const events = document.querySelector('#events');
    events.innerHTML = html + events.innerHTML;
}


// Step 3: confirm the booking.
function confirmBooking(event) {

    // Don't let the browser send the form. We send it ourselves.
    event.preventDefault();

    const form = event.target;

    // Show that we're working, and stop a second click from confirming twice.
    form.querySelector('button').disabled = true;
    form.querySelector('button').textContent = 'Confirming…';
    document.querySelector('#error').textContent = '';

    // A real shop takes payment before this call.
    fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            widgetUuid: widget.uuid,
            contact: {
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                emailAddress: form.emailAddress.value,
                phoneNumber: form.phoneNumber.value,
            },
        }),
    })
    .then(readJson)
    .then(openBooking);
}

function openBooking(booking) {

    if (booking.errorMessage) {
        // For example, the hold expired and the tickets must be picked again.
        document.querySelector('#error').textContent = booking.errorMessage;

        // Let the shopper try again.
        document.querySelector('#contact button').disabled = false;
        document.querySelector('#contact button').textContent = 'Pay and confirm';
        return;
    }

    // Show the confirmed booking on its own page.
    location.href = `/booking/?uuid=${booking.uuid}`;
}


// fetch() gives back a response. This reads the JSON inside it.
function readJson(response) {

    return response.json();
}
