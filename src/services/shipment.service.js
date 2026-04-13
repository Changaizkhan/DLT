const crypto = require("crypto");
const Shipment = require("../models/Shipment");
const ShipmentPackage = require("../models/ShipmentPackage");
const { DEFAULT_SHIPMENT_STATUS } = require("../constants/shipmentStatuses");
const { aggregatePackages } = require("../utils/shipmentCalculations.util");

function withDefaultStatus(doc) {
  if (!doc) return doc;
  return { ...doc, status: doc.status || DEFAULT_SHIPMENT_STATUS };
}

/** DTLC + 9-digit random number (no fixed padding); retries if collision. */
async function generateUniqueShipmentNumber() {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const n = crypto.randomInt(100_000_000, 1_000_000_000);
    const shipmentNumber = `DTLC${n}`;
    const taken = await Shipment.exists({ shipmentNumber });
    if (!taken) {
      return shipmentNumber;
    }
  }
  const err = new Error("Could not generate unique shipment number");
  err.statusCode = 503;
  throw err;
}

function buildShipmentDataFromBody(body, totals) {
  const { shipper, receiver, details } = body;
  return {
    shipperName: shipper.name,
    shipperPhone: shipper.phone,
    shipperAddress: shipper.address,
    shipperEmail: shipper.email,
    receiverName: receiver.name,
    receiverPhone: receiver.phone,
    receiverAddress: receiver.address,
    receiverEmail: receiver.email,
    typeOfShipment: details.typeOfShipment,
    numberOfPackages: details.numberOfPackages,
    shipmentWeightKg: details.shipmentWeightKg,
    courier: details.courier,
    mode: details.mode,
    product: details.product,
    quantity: details.quantity,
    paymentMethod: details.paymentMethod,
    totalFreightAmount: details.totalFreightAmount,
    totalFreightCurrency: details.totalFreightCurrency || "PKR",
    carrier: details.carrier,
    carrierReferenceNo: details.carrierReferenceNo || "",
    departureTime: details.departureTime,
    origin: details.origin,
    destination: details.destination,
    pickupDate: new Date(details.pickupDate),
    pickupTime: details.pickupTime,
    expectedDeliveryDate: new Date(details.expectedDeliveryDate),
    comments: details.comments || "",
    totalVolumetricWeightKg: totals.totalVolumetricWeightKg,
    totalVolumeCubicM: totals.totalVolumeCubicM,
    totalActualWeightKg: totals.totalActualWeightKg,
  };
}

function mapShipmentPayload(body, totals, shipmentNumber) {
  return {
    shipmentNumber,
    ...buildShipmentDataFromBody(body, totals),
  };
}

async function createShipmentWithPackages(body) {
  const { packages, details } = body;
  if (!Array.isArray(packages) || packages.length === 0) {
    const err = new Error("At least one package is required");
    err.statusCode = 400;
    throw err;
  }
  if (details.numberOfPackages !== packages.length) {
    const err = new Error("details.numberOfPackages must equal packages array length");
    err.statusCode = 400;
    throw err;
  }

  const totals = aggregatePackages(
    packages.map((p) => ({
      lengthCm: p.lengthCm,
      widthCm: p.widthCm,
      heightCm: p.heightCm,
      weightKg: p.weightKg,
      quantity: p.quantity,
    }))
  );

  const shipmentNumber = await generateUniqueShipmentNumber();
  const payload = mapShipmentPayload(body, totals, shipmentNumber);
  let shipment;
  try {
    shipment = await Shipment.create(payload);
    const pkgRows = packages.map((p, index) => ({
      shipment: shipment._id,
      lineNumber: index,
      quantity: p.quantity,
      pieceType: p.pieceType,
      description: p.description || "",
      lengthCm: p.lengthCm,
      widthCm: p.widthCm,
      heightCm: p.heightCm,
      weightKg: p.weightKg,
    }));
    await ShipmentPackage.insertMany(pkgRows);
  } catch (err) {
    if (shipment?._id) {
      await Shipment.deleteOne({ _id: shipment._id });
    }
    if (err.code === 11000 && err.keyPattern?.shipmentNumber) {
      const retryErr = new Error("Shipment number collision, retry request");
      retryErr.statusCode = 409;
      throw retryErr;
    }
    throw err;
  }

  const created = await Shipment.findById(shipment._id).populate("packages").lean();
  return withDefaultStatus(created);
}

const SHIPMENT_NUMBER_RE = /^DTLC[0-9]+$/;

function assertValidShipmentNumber(shipmentNumber) {
  if (!SHIPMENT_NUMBER_RE.test(shipmentNumber)) {
    const err = new Error("Invalid shipment number format (expected DTLC followed by digits)");
    err.statusCode = 400;
    throw err;
  }
}

async function listShipments() {
  const rows = await Shipment.find().sort({ createdAt: -1 }).lean();
  return rows.map(withDefaultStatus);
}

async function getShipmentByShipmentNumber(shipmentNumber) {
  assertValidShipmentNumber(shipmentNumber);
  const doc = await Shipment.findOne({ shipmentNumber }).populate("packages").lean();
  if (!doc) {
    const err = new Error("Shipment not found");
    err.statusCode = 404;
    throw err;
  }
  if (doc.packages?.length) {
    doc.packages.sort((a, b) => a.lineNumber - b.lineNumber);
  }
  return withDefaultStatus(doc);
}

async function updateShipmentStatus(shipmentNumber, status) {
  assertValidShipmentNumber(shipmentNumber);
  const updated = await Shipment.findOneAndUpdate(
    { shipmentNumber },
    { status },
    { new: true, runValidators: true }
  )
    .populate("packages")
    .lean();
  if (!updated) {
    const err = new Error("Shipment not found");
    err.statusCode = 404;
    throw err;
  }
  if (updated.packages?.length) {
    updated.packages.sort((a, b) => a.lineNumber - b.lineNumber);
  }
  return withDefaultStatus(updated);
}

async function updateShipmentWithPackages(shipmentNumber, body) {
  assertValidShipmentNumber(shipmentNumber);
  const { packages, details } = body;
  if (!Array.isArray(packages) || packages.length === 0) {
    const err = new Error("At least one package is required");
    err.statusCode = 400;
    throw err;
  }
  if (details.numberOfPackages !== packages.length) {
    const err = new Error("details.numberOfPackages must equal packages array length");
    err.statusCode = 400;
    throw err;
  }

  const existing = await Shipment.findOne({ shipmentNumber });
  if (!existing) {
    const err = new Error("Shipment not found");
    err.statusCode = 404;
    throw err;
  }

  const totals = aggregatePackages(
    packages.map((p) => ({
      lengthCm: p.lengthCm,
      widthCm: p.widthCm,
      heightCm: p.heightCm,
      weightKg: p.weightKg,
      quantity: p.quantity,
    }))
  );

  const updateData = buildShipmentDataFromBody(body, totals);

  await ShipmentPackage.deleteMany({ shipment: existing._id });
  await Shipment.updateOne({ shipmentNumber }, { $set: updateData }, { runValidators: true });

  const pkgRows = packages.map((p, index) => ({
    shipment: existing._id,
    lineNumber: index,
    quantity: p.quantity,
    pieceType: p.pieceType,
    description: p.description || "",
    lengthCm: p.lengthCm,
    widthCm: p.widthCm,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
  }));
  await ShipmentPackage.insertMany(pkgRows);

  return getShipmentByShipmentNumber(shipmentNumber);
}

async function deleteShipment(shipmentNumber) {
  assertValidShipmentNumber(shipmentNumber);
  const doc = await Shipment.findOne({ shipmentNumber });
  if (!doc) {
    const err = new Error("Shipment not found");
    err.statusCode = 404;
    throw err;
  }
  await ShipmentPackage.deleteMany({ shipment: doc._id });
  await Shipment.deleteOne({ _id: doc._id });
  return { shipmentNumber };
}

module.exports = {
  createShipmentWithPackages,
  listShipments,
  getShipmentByShipmentNumber,
  updateShipmentStatus,
  updateShipmentWithPackages,
  deleteShipment,
};
