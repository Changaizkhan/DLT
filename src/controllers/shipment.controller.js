const { catchAsync } = require("../utils/catchAsync");
const shipmentService = require("../services/shipment.service");

const create = catchAsync(async (req, res) => {
  const data = await shipmentService.createShipmentWithPackages(req.body);
  return res.status(201).json({ message: "Shipment created", data });
});

const list = catchAsync(async (req, res) => {
  const data = await shipmentService.listShipments();
  return res.json({ message: "success", count: data.length, data });
});

const getByShipmentNumber = catchAsync(async (req, res) => {
  const data = await shipmentService.getShipmentByShipmentNumber(req.params.shipmentNumber);
  return res.json({ message: "success", data });
});

const updateStatus = catchAsync(async (req, res) => {
  const data = await shipmentService.updateShipmentStatus(req.params.shipmentNumber, req.body.status);
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
