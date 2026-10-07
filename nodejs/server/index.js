// Starts the Express server, mounts the three API routes and serves the pages.
import express from 'express';

import { MtpApi } from './mtpApi.js';
import { listEvents } from './routes/events.js';
import { createWidget } from './routes/widget.js';
import { confirmBooking } from './routes/confirm.js';

// One API client for the whole server, built from the .env file.
const mtpApi = new MtpApi({
  token  : process.env.MTP_TOKEN,
  baseUrl: process.env.MTP_API || 'https://api.sandbox.mtpApi.app/octo',
});

const app = express();
app.use(express.json());

// The three API routes. Each one gets the API client passed in.
app.get('/api/events', (req, res) => {
  return listEvents(mtpApi, req, res);
});

app.post('/api/widget', (req, res) => {
  return createWidget(mtpApi, req, res);
});

app.post('/api/confirm', (req, res) => {
  return confirmBooking(mtpApi, req, res);
});

// Every failure, ours or MyTicketPro's, reaches the browser
// as { error, errorMessage }.
app.use('/api', (err, req, res, next) => {
  const status = err.status ?? 500;
  const body = {
    error: err.code ?? 'ERROR',
    errorMessage: err.message,
  };

  res.status(status).json(body);
});

// The pages: the built files in production,
// Vite (with live reload) in development.
if (process.argv.includes('--production')) {
  app.use(express.static('dist'));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);
}

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Open http://localhost:${port}`);
});
