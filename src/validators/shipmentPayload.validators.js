const { body } = require("express-validator");

/** Shared rules for POST create and PUT update (same body shape). */
const shipmentCreateUpdateBodyRules = [
  body("shipper.name").trim().notEmpty(),
  body("shipper.phone").trim().notEmpty(),
  body("shipper.address").trim().notEmpty(),
  body("shipper.email").isEmail().normalizeEmail(),
  body("receiver.name").trim().notEmpty(),
  body("receiver.phone").trim().notEmpty(),
  body("receiver.address").trim().notEmpty(),
  body("receiver.email").isEmail().normalizeEmail(),
  body("details.typeOfShipment").trim().notEmpty(),
  body("details.numberOfPackages")
    .isInt({ min: 1 })
    .custom((value, { req }) => {
      const rows = req.body.packages;
      if (!Array.isArray(rows) || value !== rows.length) {
        throw new Error("numberOfPackages must equal the number of package rows");
      }
      return true;
    }),
  body("details.shipmentWeightKg")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("details.shipmentWeightKg must be a number"),
  body("details.courier").trim().notEmpty(),
  body("details.mode").trim().notEmpty(),
  body("details.product").trim().notEmpty(),
  body("details.quantity").isInt({ min: 1 }),
  body("details.paymentMethod").trim().notEmpty(),
  body("details.totalFreightAmount").isFloat({ min: 0 }),
  body("details.totalFreightCurrency").optional().trim(),
  body("details.carrier").trim().notEmpty(),
  body("details.carrierReferenceNo").optional().trim(),
  body("details.departureTime").trim().notEmpty(),
  body("details.origin").trim().notEmpty(),
  body("details.destination").trim().notEmpty(),
  body("details.pickupDate").isISO8601().toDate(),
  body("details.pickupTime").trim().notEmpty(),
  body("details.expectedDeliveryDate").isISO8601().toDate(),
  body("details.comments").optional().trim(),
  body("packages").isArray({ min: 1 }),
  body("packages.*.quantity").isInt({ min: 1 }),
  body("packages.*.pieceType").trim().notEmpty(),
  body("packages.*.description").optional().trim(),
  body("packages.*.lengthCm").isFloat({ min: 0 }),
  body("packages.*.widthCm").isFloat({ min: 0 }),
  body("packages.*.heightCm").isFloat({ min: 0 }),
  body("packages.*.weightKg").isFloat({ min: 0 }),
];

module.exports = { shipmentCreateUpdateBodyRules };
