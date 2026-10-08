// Step 1: show the events and their dates (guide steps 1a and 1b).
// Each date links to the seats page.
fetch('/api/events')
.then(readJson)
.then(showEvents);

function showEvents(events) {
    const eventList = document.querySelector('#events');

    if (events.errorMessage) {
        eventList.textContent = events.errorMessage;
        return;
    }

    let html = '';

    for (const event of events) {
        html += `<div class="event">`;
        html += `<h2>${event.name}</h2>`;

        for (const date of event.dates) {
            // The seats page needs the productId and the availabilityId.
            const url = `/seats/?productId=${event.productId}&availabilityId=${date.id}`;

            // "2026-11-01T20:00:00-05:00" becomes "2026-11-01 20:00",
            // the venue's local time, as printed on the ticket.
            const time = date.localDateTimeStart.slice(0, 16).replace('T', ' ');

            html += `<a class="button" href="${url}">${time}</a>`;
        }

        html += `</div>`;
    }

    eventList.innerHTML = html;
}

// fetch() gives back a response. This reads the JSON inside it.
function readJson(response) {
    return response.json();
}
