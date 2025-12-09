// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation") // path to the validation file

// Inventory Management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// Build add-classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Process add-classification (POST)
router.post("/add-classification", utilities.handleErrors(invController.addClassification))

// Show add-inventory form (GET)
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Handle add-inventory form (POST) with validation middleware
router.post(
  "/add-inventory",
  // Run the validation rules first
  invValidate.inventoryRules(),
  // Middleware to check results and re-render form if errors
  invValidate.checkInventory,
  // Controller to insert inventory if no validation errors
  utilities.handleErrors(invController.addInventory)
)

// Inventory by classification
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Individual vehicle detail
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildVehicleDetail)
)

// Intentional error route for Task 3 (tests middleware)
router.get("/getInventoryError", utilities.handleErrors(invController.throwError))

module.exports = router
