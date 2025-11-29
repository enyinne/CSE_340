// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build single vehicle detail view
router.get("/detail/:inv_id", invController.buildVehicleDetail)

// Intentional error route for Task 3
router.get("/trigger-error", utilities.handleErrors(invController.throwError));


module.exports = router;
