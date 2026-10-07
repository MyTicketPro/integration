// Step 3: embed the widget, follow the shopper's selection,
// then collect contact details.
const summary = document.querySelector('#summary');
const iframe = document.querySelector('#widget');
const form = document.querySelector('#contact');

// The events page put the chosen product and date in the URL.
const params = new URLSearchParams(location.search);

// Ask our server to create the widget. Only the server holds the API token.
const response = await fetch('/api/widget', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: params.get('productId'),
    availabilityId: params.get('availabilityId'),
  }),
});
const widget = await response.json();

if (response.ok) {
  showWidget(widget);
} else {
  summary.textContent = widget.errorMessage;
}

function showWidget({ uuid, url }) {
  iframe.src = url;
  const widgetOrigin = new URL(url).origin;

  // The widget talks to this page with postMessage.
  window.addEventListener('message', (event) => {
    // Any window can post a message here; only trust the widget's own origin.
    if (event.origin !== widgetOrigin) {
      return;
    }

    const message = event.data;
    if (!message || message.version !== '1') {
      return;
    }

    if (message.type === 'octo.widget.resize') {
      iframe.style.height = message.payload.height + 'px';
    }

    if (message.type === 'octo.widget.change') {
      showSummary(message.payload);
    }

    if (message.type === 'octo.widget.complete') {
      form.hidden = false;
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const contact = Object.fromEntries(new FormData(form));

    // sessionStorage carries the details to the next page
    // without putting them in the URL.
    sessionStorage.setItem('checkout', JSON.stringify({ uuid, contact }));
    location.href = '/confirmation/';
  });
}

// For display only: the server re-reads the real price before confirming.
function showSummary({ unitItems, pricing }) {
  if (!pricing) {
    summary.textContent = 'Pick your seats.';
    return;
  }

  summary.textContent = `${unitItems.length} seat(s), total ${money(pricing)}`;
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
