// Starts the Express server, mounts the API routes and serves the pages.
import express from 'express';

import { listProducts } from './routes/products.js';
import { createWidget } from './routes/widgets.js';
import { confirmBooking } from './routes/confirm.js';
import { getBooking } from './routes/bookings.js';

const app = express();
app.use(express.json());

// The API routes, with the MyTicketPro calls they make.
app.get('/api/products', listProducts);      // GET /octo/products, POST /octo/availability
app.post('/api/widgets', createWidget);      // POST /octo/widgets
app.post('/api/confirm', confirmBooking);    // GET /octo/widgets/{uuid}, POST /octo/bookings/{uuid}/confirm
app.get('/api/bookings/:uuid', getBooking);  // shows the result

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
