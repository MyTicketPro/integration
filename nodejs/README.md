# MyTicketPro widget example (Node.js)

| Step | Page | Browser file | Server file | MyTicketPro call |
| --- | --- | --- | --- | --- |
| 1. Start | `/` | `client/index.html` | none | none |
| 2. Pick an event date | `/events/` | `client/events/events.js` | `server/routes/events.js` | `GET /products`, `POST /availability` |
| 3. Pick seats (held on complete) | `/event/` | `client/event/event.js` | `server/routes/widget.js` | `POST /widgets` |
| 4. Confirm the booking | `/confirmation/` | `client/confirmation/confirmation.js` | `server/routes/confirm.js` | `GET /widgets/{uuid}`, `POST /bookings/{uuid}/confirm` |

`client/` runs in the browser. `server/` runs on your server, and `server/mtpApi.js` is the only code that
calls MyTicketPro, so the API token never reaches the browser.

## Run it

Requirements: Node 20.19 or newer, and a MyTicketPro sandbox token.

```sh
npm i
cp .env.example .env   # then put your sandbox token in MTP_TOKEN
npm run dev            # open http://localhost:3000
```

One process serves the pages and the API on port 3000 (set `PORT` in `.env` to change it).
For production, `npm run build && npm start` serves the built pages from `dist/` instead (`npm start` passes `--production`).

## Going live

Set `MTP_API=https://api.myticketpro.app/octo` and use your production token. Nothing else changes.

## Redirect flow instead of iframe

Pass a `returnUrl` (https) when creating the widget and send the shopper to `widget.url` instead of embedding it.
When they finish, the widget redirects to your `returnUrl` instead of posting messages, so there is no message
listener or resize handling. Your return page then does what `/api/confirm` does: read the widget with
`GET /widgets/{uuid}`, check it is `COMPLETED`, and confirm `widget.booking.uuid`.

## Ask your AI

The MyTicketPro docs are available as an MCP server: `https://api.sandbox.myticketpro.app/mcp`

- Claude Code: `claude mcp add --transport http myticketpro https://api.sandbox.myticketpro.app/mcp`
- Cursor: add to `~/.cursor/mcp.json`: `{ "mcpServers": { "myticketpro": { "url": "https://api.sandbox.myticketpro.app/mcp" } } }`
- VS Code: `code --add-mcp '{"name":"myticketpro","type":"http","url":"https://api.sandbox.myticketpro.app/mcp"}'`
- Codex: add to `~/.codex/config.toml`: `[mcp_servers.myticketpro]` with `url = "https://api.sandbox.myticketpro.app/mcp"`

## Links

- [Postman collection](https://www.postman.com/myticketpro/myticketpro-developers)
- [Integration guide](https://www.postman.com/myticketpro/myticketpro-developers/documentation/36371187-039c24c3-3e1c-4b18-bd9a-ca148cc13fea)
