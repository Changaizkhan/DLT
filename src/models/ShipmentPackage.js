const mongoose = require("mongoose");

const shipmentPackageSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
      index: true,
    },
    lineNumber: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 },
    pieceType: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    lengthCm: { type: Number, required: true, min: 0 },
    widthCm: { type: Number, required: true, min: 0 },
    heightCm: { type: Number, required: true, min: 0 },
    weightKg: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShipmentPackage", shipmentPackageSchema);
