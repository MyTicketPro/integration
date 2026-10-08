# MyTicketPro widget example (Node.js)

A small working shop that sells tickets through the MyTicketPro widget. It is the
[integration guide](https://michel-widget.dev.myticketpro.app/integration/index.html) as a runnable app, with
the recommended setup: **postMessage** (the widget is embedded in an iframe) and **hold automatically**
(`createBooking: true`).

Each page is one step of the flow. Every page has a yellow "For developers" note saying what just happened.

| Page | What the shopper does | Guide step | Browser file | Server file | MyTicketPro call |
| --- | --- | --- | --- | --- | --- |
| `/` | Reads what the example shows | | `client/index.html` | | |
| `/events/` | Picks an event date | 1a, 1b | `client/events/events.js` | `server/routes/events.js` | `GET /products`, `POST /availability` |
| `/seats/` | Picks seats in the widget. When done, the widget is replaced by the checkout, where the shopper confirms | 1c, 2, 3a, 3c | `client/seats/seats.js` | `server/routes/widget.js`, `server/routes/confirm.js` | `POST /widgets`, `GET /widgets/{uuid}`, `POST /bookings/{uuid}/confirm` |
| `/confirmation/` | Sees the confirmed booking | | `client/confirmation/confirmation.js` | `server/routes/booking.js` | `GET /bookings/{uuid}` |

Step 3b (holding the seats yourself) is skipped, because `createBooking: true` makes MyTicketPro hold them as soon
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
`returnUrl`) and **holding the seats yourself** (`createBooking: false`, then step 3b). This example does not
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
