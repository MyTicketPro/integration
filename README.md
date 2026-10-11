# MyTicketPro Integration Examples

Code samples showing how to integrate MyTicketPro ticket sales into your application using the embedded widget and the [OCTO API](https://www.octo.travel/).

Follow these steps:
1. Clone the repository.
2. Add your sandbox token.
3. Run the application alongside the [Integration Guide](https://myticketpro.github.io/integration/).

## Available Examples

| Directory | Tech Stack | Description |
| --- | --- | --- |
| [`nodejs/`](nodejs/) | Node.js 22, Express, HTML/JS | Full integration flow: list events, embed the widget, and confirm bookings |

## Quick Start

### Prerequisites
- Node.js 22 or newer
- A MyTicketPro sandbox token (see [Authentication & Environments](#authentication--environments))

### Setup & Run

1. Navigate to the example directory and install dependencies:
   ```sh
   cd nodejs
   npm i
   ```

2. Create an environment configuration file and add your token:
   ```sh
   cp .env.example .env
   ```
   Set `MTP_TOKEN` in `.env` to your sandbox token.

3. Start the server:
   ```sh
   npm start
   ```
   Open `http://localhost:3000` in your browser.

## Integration Flow

```
Browser                 Your Server              MyTicketPro API
  │                          │                         │
  │ ── 1. Fetch Events ────> │ ── GET /octo/products ─>│
  │                          │ ── POST /availability ─>│
  │                          │                         │
  │ ── 2. Select Date ─────> │ ── POST /octo/widgets ─>│ (Returns widget.url)
  │                          │                         │
  │ <── 3. Embed Widget ─────│                         │
  │     (iframe & postMessage)                         │
  │                          │                         │
  │ ── 4. Complete Pay ────> │ ── GET /widgets/{uuid} ─>│
  │                          │ ── POST /confirm ──────>│ (Emails tickets)
```

1. **List inventory:** Your server calls `GET /octo/products` for events and `POST /octo/availability` for date options.
2. **Generate widget session:** When a user selects a date, your server calls `POST /octo/widgets` to generate a `widget.url`.
3. **Display widget:** Embed `widget.url` in an `<iframe>` on your frontend and listen for postMessage events (`octo.widget.change`, `octo.widget.complete`, `octo.widget.resize`).
4. **Confirm booking:** After payment completion, your server calls `GET /octo/widgets/{uuid}` to retrieve details and `POST /octo/bookings/{uuid}/confirm` to complete the transaction. MyTicketPro sends the confirmation email and tickets.

> **Security Note:** The API token must remain on your backend. Frontend clients must only communicate with your application server.

## Authentication & Environments

Include your token in all API requests via the `Authorization` header:

```http
Authorization: Bearer <your_token>
```

Contact **tech@myticketpro.com** to request sandbox and production tokens. Test thoroughly in sandbox before pointing requests to the production endpoint.

| Environment | Base URL |
| --- | --- |
| **Sandbox** | `https://api.sandbox.myticketpro.app/octo` |
| **Production** | `https://api.myticketpro.app/octo` |

## Model Context Protocol (MCP) Setup

MyTicketPro documentation and endpoint specifications are accessible to AI assistants via MCP. No token is required.

**Endpoint URL:** `https://api.sandbox.myticketpro.app/mcp`

### Claude Code
```sh
claude mcp add --transport http myticketpro https://api.sandbox.myticketpro.app/mcp
```

### Cursor
Add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "myticketpro": {
      "url": "https://api.sandbox.myticketpro.app/mcp"
    }
  }
}
```

### VS Code
Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "myticketpro": {
      "type": "http",
      "url": "https://api.sandbox.myticketpro.app/mcp"
    }
  }
}
```

### Codex
```sh
codex mcp add myticketpro --url https://api.sandbox.myticketpro.app/mcp
```
Or append to `~/.codex/config.toml`:
```toml
[mcp_servers.myticketpro]
url = "https://api.sandbox.myticketpro.app/mcp"
```

### Claude.ai
Navigate to **Settings** → **Connectors** → **Add custom connector** and provide the URL `https://api.sandbox.myticketpro.app/mcp`.

### ChatGPT
Navigate to **Settings** → **Apps & Connectors** → **Developer mode** → **Create**, set the URL to `https://api.sandbox.myticketpro.app/mcp`, and set authentication to **None**.

## Resources

- [Integration Guide](https://myticketpro.github.io/integration/)
- [Postman Collection](https://www.postman.com/myticketpro/myticketpro-developers)
- [API Reference Documentation](https://www.postman.com/myticketpro/myticketpro-developers/documentation/36371187-039c24c3-3e1c-4b18-bd9a-ca148cc13fea)
- Support: tech@myticketpro.com