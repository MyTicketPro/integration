// Starts the Express server, mounts the API routes and serves the pages.
import express from 'express';

import { listEvents } from './routes/events.js';
import { createWidget } from './routes/widget.js';
import { confirmBooking } from './routes/confirm.js';
import { getBooking } from './routes/booking.js';

const app = express();
app.use(express.json());

// The API routes, with the guide steps they cover.
app.get('/api/events', listEvents);         // steps 1a, 1b
app.post('/api/widget', createWidget);      // step 1c
app.post('/api/confirm', confirmBooking);   // steps 3a, 3c
app.get('/api/booking/:uuid', getBooking);  // shows the result

// Every failure, ours or MyTicketPro's, reaches the browser
// as { error, errorMessage }.
app.use('/api', function (err, req, res, next) {
    res.status(err.status ?? 500).json({
        error: err.code,
        errorMessage: err.message,
    });
});

// The pages: plain HTML, CSS and JavaScript files, sent as they are.
app.use(express.static('client'));

const port = process.env.PORT ?? 3000;
app.listen(port, function () {
    console.log(`Open http://localhost:${port}`);
});
