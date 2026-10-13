# MyTicketPro Widget Example (Node.js)

A reference implementation demonstrating how to sell tickets using the MyTicketPro embedded widget. This application implements the primary integration pattern outlined in the [Integration Guide](https://myticketpro.github.io/integration/): an `iframe` embedding strategy with `postMessage` event handling and automatic holds (`createBookingOnComplete: true`).

## Application Flow

Each route represents a discrete phase in the purchasing workflow. Pages log executed API requests and display realtime `postMessage` events emitted by the embedded widget.

| Route | User Action | Frontend Code | Backend Code | API Endpoint |
| --- | --- | --- | --- | --- |
| `/` | Overview & documentation | `client/index.html` | — | — |
| `/products/` | Select product (event) and availability (date) | `client/products/products.js` | `server/routes/products.js` | `GET /products`<br>`POST /availability` |
| `/widget/` | Select units/seats inside widget and complete checkout | `client/widget/widget.js` | `server/routes/widgets.js`<br>`server/routes/confirm.js` | `POST /widgets`<br>`GET /widgets/{uuid}`<br>`POST /bookings/{uuid}/confirm` |
| `/booking/` | View confirmed booking summary | `client/booking/booking.js` | `server/routes/bookings.js` | `GET /bookings/{uuid}` |

## Key Concepts & Terminology

This implementation uses standard [OCTO API](https://www.octo.travel/) domain entities:

| OCTO Concept | Description | Example Value |
| --- | --- | --- |
| **Product** | The event or attraction for sale | `product-atlanta_braves_game` |
| **Availability** | Specific date/time slot for a product | `2026-11-01T20:00:00-05:00` |
| **Widget** | Embedded seat/ticket selection interface | `widget.uuid`, `widget.url` |
| **Unit Item** | Individual ticket instance | `unitItems` array |
| **Pricing** | Amounts in the currency's smallest unit (`currencyPrecision`). `pricing` is the booking currency (USD); `displayPricing` is what the shopper sees in the widget | `9000` ($90.00 USD) |
| **Booking** | Ticket reservation status (`ON_HOLD` or `CONFIRMED`) | `booking.uuid` |
| **Contact** | Ticket holder details | `firstName`, `emailAddress` |

> **Note on Holds:** Passing `createBookingOnComplete: true` automatically creates a temporary hold upon checkout completion. A separate `POST /octo/bookings` call is not required.

## Architecture & Security

* **Frontend (`client/`):** Static assets served directly to the browser.
* **Backend (`server/`):** Node.js Express server handling business logic.
* **API Isolation (`server/mtp.js`):** All outbound MyTicketPro API requests are executed backend-to-backend. API tokens are never exposed to the client.

## Quick Start

### Prerequisites

* Node.js 22 or higher
* Sandbox API token (request via `tech@myticketpro.com`)

### Setup & Run

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure environment:**
   ```sh
   cp .env.example .env
   ```
   Set `MTP_TOKEN` in `.env` to your sandbox token.

3. **Start the application:**
   ```sh
   npm start
   ```
   Access the application at `http://localhost:3000`.

The development server includes live restart for backend changes (`server/`). Port number can be overridden by setting `PORT` in `.env`.

## Production Deployment

To switch to production:

1. Update the API base URL in `.env`:
   ```env
   MTP_API=https://api.myticketpro.app/octo
   ```
2. Replace `MTP_TOKEN` with your production API credential.

## Alternative Integration Patterns

This example covers the recommended **embedded iframe** flow with **automatic holds**. The OCTO specification also supports:

* **Redirect Flow:** Directing users to `widget.url` with a `returnUrl` callback.
* **Manual Holds:** Explicitly holding inventory using `createBookingOnComplete: false` followed by `POST /octo/bookings`.

Refer to the [Integration Guide](https://myticketpro.github.io/integration/) for detailed implementations of alternative patterns.

## AI & Tooling

Model Context Protocol (MCP) configurations for Claude, Cursor, VS Code, and ChatGPT are available in the [root README](../README.md#model-context-protocol-mcp-setup).

## Resources

* [Integration Guide](https://myticketpro.github.io/integration/)
* [Postman Collection](https://www.postman.com/myticketpro/myticketpro-developers)
* [API Reference](https://www.postman.com/myticketpro/myticketpro-developers/documentation/36371187-039c24c3-3e1c-4b18-bd9a-ca148cc13fea)
* Support: `tech@myticketpro.com`