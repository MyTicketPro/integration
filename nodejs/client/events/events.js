// Step 2: show the events and link each date to its seat-picking page.
const list = document.querySelector('#events');

const response = await fetch('/api/events');
const events = await response.json();

if (response.ok) {
  const items = events.map(eventItem);
  list.replaceChildren(...items);
} else {
  list.textContent = events.errorMessage;
}

// One <li> per event, with a nested list of its dates.
function eventItem(event) {
  const dates = document.createElement('ul');

  for (const date of event.dates) {
    dates.append(dateItem(event.productId, date));
  }

  const item = document.createElement('li');
  item.append(event.title, dates);

  return item;
}

// One <li> with a link to the seat-picking page for that date.
function dateItem(productId, date) {
  const query = new URLSearchParams({
    productId,
    availabilityId: date.availabilityId,
  });

  const link = document.createElement('a');
  link.href = '/event/?' + query;

  // Shown as-is: the time is local to the venue, which is what the ticket says.
  let text = date.start.slice(0, 16).replace('T', ' ');
  if (date.status === 'LIMITED') {
    text += ' (few left)';
  }
  link.textContent = text;

  const item = document.createElement('li');
  item.append(link);

  return item;
}
