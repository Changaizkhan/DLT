const { Router } = require("express");
const authRoutes = require("./auth.routes");
const shipmentRoutes = require("./shipment.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/shipments", shipmentRoutes);

module.exports = router;
