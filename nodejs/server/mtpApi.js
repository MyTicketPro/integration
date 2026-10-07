// The MyTicketPro API client.
// It is the only code that calls MyTicketPro, and it runs on your server,
// so the token never reaches the browser.
export class MtpApi {
  #token;
  #baseUrl;

  constructor({ token, baseUrl }) {
    this.#token = token;
    this.#baseUrl = baseUrl;
  }

  /** GET /octo/products */
  listProducts() {
    return this.#request('GET', '/products');
  }

  /** POST /octo/availability */
  checkAvailability({ productId, localDateStart, localDateEnd }) {
    const body = {
      productId,
      optionId: 'widget',
      localDateStart,
      localDateEnd,
    };

    return this.#request('POST', '/availability', body);
  }

  /** POST /octo/widgets */
  createWidget({ productId, availabilityId }) {
    // createBooking: true makes MyTicketPro hold the seats
    // as soon as the shopper finishes picking them.
    const body = {
      productId,
      availabilityId,
      optionId: 'widget',
      createBooking: true,
    };

    return this.#request('POST', '/widgets', body);
  }

  /** GET /octo/widgets/:uuid */
  getWidget(uuid) {
    const path = `/widgets/${encodeURIComponent(uuid)}`;

    return this.#request('GET', path);
  }

  /** POST /octo/bookings/:uuid/confirm */
  confirmBooking(uuid, { contact, resellerReference }) {
    const path = `/bookings/${encodeURIComponent(uuid)}/confirm`;
    const body = {
      contact,
      resellerReference,
    };

    return this.#request('POST', path, body);
  }

  // Sends one request to MyTicketPro and returns the parsed JSON.
  // Throws an error when MyTicketPro answers with { error, errorMessage }.
  async #request(method, path, body) {
    if (!this.#token) {
      const error = new Error(
        'MTP_TOKEN is not set. ' +
          'Copy .env.example to .env and add your sandbox token.',
      );
      error.code = 'NO_TOKEN';
      throw error;
    }

    const headers = {
      Authorization: `Bearer ${this.#token}`,
      'Content-Type': 'application/json',
      'Octo-Capabilities': 'octo/pricing, octo/widget',
    };

    let requestBody;
    if (body) {
      requestBody = JSON.stringify(body);
    }

    const response = await fetch(this.#baseUrl + path, {
      method,
      headers,
      body: requestBody,
    });

    // Some failures (a proxy, a network page) are not JSON, so fall back to {}.
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const message =
        data.errorMessage ?? `MyTicketPro returned ${response.status}`;
      const error = new Error(message);
      error.code = data.error;
      error.status = response.status;
      throw error;
    }

    return data;
  }
}
