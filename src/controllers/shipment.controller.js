const { catchAsync } = require("../utils/catchAsync");
const shipmentService = require("../services/shipment.service");
const emailService = require("../services/email.service");

function fireAndForget(promise) {
  promise.catch(() => {});
}

const create = catchAsync(async (req, res) => {
  const data = await shipmentService.createShipmentWithPackages(req.body);
  fireAndForget(
    emailService.sendShipmentCreatedEmail({
      receiverEmail: data.receiverEmail,
      receiverName: data.receiverName,
      trackingId: data.shipmentNumber,
      status: data.status,
      timestamp: data.createdAt || new Date(),
    })
  );
  return res.status(201).json({ message: "Shipment created", data });
});

const list = catchAsync(async (req, res) => {
  const status = req.query.status;
  const data = await shipmentService.listShipments({ status });
  return res.json({ message: "success", count: data.length, data });
});

const getByShipmentNumber = catchAsync(async (req, res) => {
  const data = await shipmentService.getShipmentByShipmentNumber(req.params.shipmentNumber);
  return res.json({ message: "success", data });
});

const updateStatus = catchAsync(async (req, res) => {
  const data = await shipmentService.updateShipmentStatus(req.params.shipmentNumber, req.body.status);
  fireAndForget(
    emailService.sendStatusUpdatedEmail({
      receiverEmail: data.receiverEmail,
      receiverName: data.receiverName,
      trackingId: data.shipmentNumber,
      status: data.status,
      timestamp: data.updatedAt || new Date(),
    })
  );
  return res.json({ message: "Status updated", data });
});

const update = catchAsync(async (req, res) => {
  const data = await shipmentService.updateShipmentWithPackages(req.params.shipmentNumber, req.body);
  return res.json({ message: "Shipment updated", data });
});

const remove = catchAsync(async (req, res) => {
  const data = await shipmentService.deleteShipment(req.params.shipmentNumber);
  return res.json({ message: "Shipment deleted", data });
});

module.exports = { create, list, getByShipmentNumber, updateStatus, update, remove };
