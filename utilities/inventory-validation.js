const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const utilities = require(".")

const validate = {}

// Validation rules for inventory form
validate.inventoryRules = () => [
  body("classification_id")
    .notEmpty()
    .withMessage("Please choose a classification."),

  body("inv_make")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage("Please provide a make (min 2 characters)."),

  body("inv_model")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage("Please provide a model."),

  body("inv_year")
    .trim()
    .notEmpty()
    .isInt({ min: 1886, max: new Date().getFullYear() })
    .withMessage("Please enter a valid year."),

  body("inv_price")
    .trim()
    .notEmpty()
    .isFloat({ min: 0.01 })
    .withMessage("Please enter a valid positive price."),

  body("inv_miles")
    .trim()
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Please enter valid miles."),

  body("inv_color")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a color."),

  body("inv_description")
    .trim()
    .escape()
    .optional({ checkFalsy: true })
    .isLength({ max: 4000 }) // match DB column
    .withMessage("Description too long."),

  body("inv_image")
    .trim()
    .notEmpty()
    .withMessage("Please provide an image path."),

  body("inv_thumbnail")
    .trim()
    .notEmpty()
    .withMessage("Please provide a thumbnail path."),
]

// Middleware to handle validation result
validate.checkInventory = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const classificationsQuery = await invModel.getClassifications()
    const classifications = classificationsQuery.rows || classificationsQuery

    // flash errors
    req.flash(
      "error",
      errors.array().map(e => e.msg).join("<br>")
    )

    return res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav: await utilities.getNav(),
      classifications,
      messages: req.flash(),
      data: {
        ...req.body,
        inv_image: req.body.inv_image || "/images/vehicles/no-image.png",
        inv_thumbnail: req.body.inv_thumbnail || "/images/vehicles/no-image-tn.png",
      }
    })
  }
  next()
}

module.exports = validate
