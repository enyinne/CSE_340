const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const utilities = require(".")

const validate = {}

/* ***************************
 * Inventory validation rules
 * *************************** */
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

  // ✅ DB COLUMN IS inv_mile
  body("inv_mile")
    .trim()
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Please enter valid mileage."),

  body("inv_color")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a color."),

  body("inv_description")
    .trim()
    .escape()
    .optional({ checkFalsy: true })
    .isLength({ max: 4000 })
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

/* ***************************
 * Check inventory data (ADD)
 * *************************** */
validate.checkInventory = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    req.flash(
      "error",
      errors.array().map(e => e.msg).join("<br>")
    )

    return res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav: await utilities.getNav(),
      classifications: await invModel.getClassifications(),
      messages: req.flash(),
      data: req.body
    })
  }
  next()
}

/* ***************************
 * Check inventory data (UPDATE)
 * *************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_mile,              // ✅ matches DB
      inv_color,
      classification_id
    } = req.body

    req.flash(
      "error",
      errors.array().map(e => e.msg).join("<br>")
    )

    const classificationSelect =
      await utilities.buildClassificationList(classification_id)

    return res.render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav: await utilities.getNav(),
      classificationSelect,
      messages: req.flash(),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_mile,
      inv_color,
      classification_id
    })
  }
  next()
}

module.exports = validate
