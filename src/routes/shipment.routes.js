const { Router } = require("express");
const { body, param } = require("express-validator");
const shipmentController = require("../controllers/shipment.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { SHIPMENT_STATUSES } = require("../constants/shipmentStatuses");
const { shipmentCreateUpdateBodyRules } = require("../validators/shipmentPayload.validators");

const router = Router();

const shipmentNumberParam = param("shipmentNumber")
  .matches(/^DTLC[0-9]+$/)
  .withMessage("Invalid shipment number format");

router.get("/", protect, shipmentController.list);

router.patch(
  "/:shipmentNumber/status",
  protect,
  [
    shipmentNumberParam,
    body("status").isIn(SHIPMENT_STATUSES).withMessage("Invalid status value"),
    validate,
  ],
  shipmentController.updateStatus
);

router.put(
  "/:shipmentNumber",
  protect,
  [shipmentNumberParam, ...shipmentCreateUpdateBodyRules, validate],
  shipmentController.update
);

router.delete("/:shipmentNumber", protect, [shipmentNumberParam, validate], shipmentController.remove);

router.get("/:shipmentNumber", protect, shipmentController.getByShipmentNumber);

router.post(
  "/",
  protect,
  [...shipmentCreateUpdateBodyRules, validate],
  shipmentController.create
);

module.exports = router;
