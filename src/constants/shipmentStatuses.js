/** Allowed shipment lifecycle statuses (exact strings). */
const SHIPMENT_STATUSES = [
  "Pending",
  "Picked up",
  "On Hold",
  "Out for delivery",
  "In Transit",
  "Enroute",
  "Cancelled",
  "Delivered",
  "Returned",
];

const DEFAULT_SHIPMENT_STATUS = "Pending";

module.exports = { SHIPMENT_STATUSES, DEFAULT_SHIPMENT_STATUS };
