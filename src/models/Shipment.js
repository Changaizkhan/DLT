const mongoose = require("mongoose");
const { SHIPMENT_STATUSES, DEFAULT_SHIPMENT_STATUS } = require("../constants/shipmentStatuses");

const shipmentSchema = new mongoose.Schema(
  {
    shipmentNumber: { type: String, required: true, unique: true, immutable: true },
    status: {
      type: String,
      enum: SHIPMENT_STATUSES,
      default: DEFAULT_SHIPMENT_STATUS,
    },
    shipperName: { type: String, required: true, trim: true },
    shipperPhone: { type: String, required: true, trim: true },
    shipperAddress: { type: String, required: true, trim: true },
    shipperEmail: { type: String, required: true, trim: true, lowercase: true },
    receiverName: { type: String, required: true, trim: true },
    receiverPhone: { type: String, required: true, trim: true },
    receiverAddress: { type: String, required: true, trim: true },
    receiverEmail: { type: String, required: true, trim: true, lowercase: true },
    typeOfShipment: { type: String, required: true, trim: true },
    numberOfPackages: { type: Number, required: true, min: 1 },
    shipmentWeightKg: { type: Number },
    courier: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    product: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, required: true, trim: true },
    totalFreightAmount: { type: Number, required: true, min: 0 },
    totalFreightCurrency: { type: String, default: "PKR", trim: true },
    carrier: { type: String, required: true, trim: true },
    carrierReferenceNo: { type: String, default: "", trim: true },
    departureTime: { type: String, required: true, trim: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    pickupDate: { type: Date, required: true },
    pickupTime: { type: String, required: true, trim: true },
    expectedDeliveryDate: { type: Date, required: true },
    comments: { type: String, default: "", trim: true },
    totalVolumetricWeightKg: { type: Number, required: true },
    totalVolumeCubicM: { type: Number, required: true },
    totalActualWeightKg: { type: Number, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

shipmentSchema.virtual("packages", {
  ref: "ShipmentPackage",
  localField: "_id",
  foreignField: "shipment",
});

module.exports = mongoose.model("Shipment", shipmentSchema);
