// Step 1: show the products and their availabilities.
// Each availability links to the widget page.
fetch('/api/products')
.then(readJson)
.then(showProducts);

function showProducts(products) {

    const productList = document.querySelector('#products');

    if (products.errorMessage) {
        productList.textContent = products.errorMessage;
        return;
    }

    let html = '';

    for (const product of products) {
        html += `<div class="product">`;
        html += `<h2>${product.internalName}</h2>`;

        for (const availability of product.availabilities) {
            // The widget page needs the productId and the availabilityId.
            const url = `/widget/?productId=${product.id}&availabilityId=${availability.id}`;

            // "2026-11-01T20:00:00-05:00" becomes "2026-11-01 20:00",
            // the venue's local time, as printed on the ticket.
            const start = availability.localDateTimeStart.slice(0, 16).replace('T', ' ');

            html += `<a class="button" href="${url}">${start}</a>`;
        }

        html += `</div>`;
    }

    productList.innerHTML = html;
}

// fetch() gives back a response. This reads the JSON inside it.
function readJson(response) {

    return response.json();
}
