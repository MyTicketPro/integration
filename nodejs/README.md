# MyTicketPro widget example (Node.js)

A small working shop that sells tickets through the MyTicketPro widget. It is the
[integration guide](https://michel-widget.dev.myticketpro.app/integration/index.html) as a runnable app, with
the recommended setup: **postMessage** (the widget is embedded in an iframe) and **hold automatically**
(`createBooking: true`).

Each page is one step of the flow. Every page has a short note listing what just happened, and which API calls it made.
The widget page also has a **Widget events** box that shows every message the widget sends to the page, as it arrives.

| Page | What the shopper does | Browser file | Server file | MyTicketPro call |
| --- | --- | --- | --- | --- |
| `/` | Reads what the example shows | `client/index.html` | | |
| `/products/` | Picks an event (product) and a date (availability) | `client/products/products.js` | `server/routes/products.js` | `GET /products`, `POST /availability` |
| `/widget/` | Picks tickets (unit items) in the widget. When done, the widget is replaced by the checkout, where the shopper confirms | `client/widget/widget.js` | `server/routes/widgets.js`, `server/routes/confirm.js` | `POST /widgets`, `GET /widgets/{uuid}`, `POST /bookings/{uuid}/confirm` |
| `/booking/` | Sees the confirmed booking | `client/booking/booking.js` | `server/routes/bookings.js` | `GET /bookings/{uuid}` |

## OCTO words used in this example

The code uses OCTO's names, so it matches the guide and the API. In shopper terms:

| OCTO | Means | Example |
| --- | --- | --- |
| product | An event | `product-atlanta_braves_game`, `internalName: "Atlanta Braves Game"` |
| availability | One date and time of that event | `localDateTimeStart: "2026-11-01T20:00:00-05:00"` |
| widget | The seat-picking page for one product and availability | `widget.uuid`, `widget.url` |
| unit item | One ticket the shopper picked | `unitItems.length` is the number of tickets |
| pricing | Prices in cents | `pricing.retail: 9000` is $90.00 |
| booking | The tickets, held (`ON_HOLD`) then `CONFIRMED` | `booking.uuid`, `booking.supplierReference` |
| contact | Who the tickets are for | `firstName`, `lastName`, `emailAddress`, `phoneNumber` |

There is no separate hold call (`POST /octo/bookings`), because `createBooking: true` makes MyTicketPro hold the tickets as soon
as the shopper finishes.

`client/` runs in the browser. `server/` runs on your server, and `server/mtp.js` (the guide's `mtp()` helper) is
the only code that calls MyTicketPro, so the API token never reaches the browser.

## Run it

Requirements: Node 22 or newer, and a MyTicketPro sandbox token (ask tech@myticketpro.com).

```sh
npm i
cp .env.example .env   # then put your sandbox token in MTP_TOKEN
npm start              # open http://localhost:3000
```

One process serves the pages and the API on port 3000 (set `PORT` in `.env` to change it).
There is no build step: the files in `client/` are sent to the browser as they are.
The server restarts by itself when you edit a file in `server/`. After editing a page, refresh the browser.

## Going live

Set `MTP_API=https://api.myticketpro.app/octo` and use your production token. Nothing else changes.

## Other setups

The guide also covers the **redirect** flow (send the shopper to `widget.url` and get them back on your
`returnUrl`) and **holding the tickets yourself** (`createBooking: false`, then `POST /octo/bookings`). This example does not
implement them. Pick that setup at the top of the guide to see the code it needs.

## Ask your AI

The MyTicketPro docs are available as an MCP server. No token needed.

- Claude Code: `claude mcp add --transport http myticketpro https://api.sandbox.myticketpro.app/mcp`
- Cursor, in `.cursor/mcp.json`: `{ "mcpServers": { "myticketpro": { "url": "https://api.sandbox.myticketpro.app/mcp" } } }`
- VS Code, in `.vscode/mcp.json`: `{ "servers": { "myticketpro": { "type": "http", "url": "https://api.sandbox.myticketpro.app/mcp" } } }`
- Codex: `codex mcp add myticketpro --url https://api.sandbox.myticketpro.app/mcp`

## Links

- [Integration guide](https://michel-widget.dev.myticketpro.app/integration/index.html)
- [Postman collection](https://www.postman.com/myticketpro/myticketpro-developers)
- [API reference (Postman)](https://www.postman.com/myticketpro/myticketpro-developers/documentation/36371187-039c24c3-3e1c-4b18-bd9a-ca148cc13fea)
