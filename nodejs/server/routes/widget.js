// Step 3: create the widget for the chosen date.
export async function createWidget(mtpApi, req, res) {
  const { productId, availabilityId } = req.body;

  const widget = await mtpApi.createWidget({
    productId,
    availabilityId,
  });

  // Send only what the page needs.
  res.json({
    uuid: widget.uuid,
    url: widget.url,
  });
}
