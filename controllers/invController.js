const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* Build inventory by classification view */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()

  // Prevent crash when no vehicles exist in this classification
  const className =
    data.length > 0 ? data[0].classification_name : "No Vehicles Found"

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* Build single vehicle detail view */
invCont.buildVehicleDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const vehicle = await invModel.getVehicleById(inv_id)
  const nav = await utilities.getNav()
  const detail = await utilities.buildVehicleDetail(vehicle)

  const title = `${vehicle.inv_make} ${vehicle.inv_model}`

  res.render("./inventory/detail", {
    title,
    nav,
    detail
  })
}

/* Deliver Management View (Task 1) */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    messages: req.flash()
  })
}

/* Build Add Classification View (Task 2) */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    messages: req.flash()
  })
}

/* Process New Classification (Task 2) */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;

    // Server-side validation: no empty or special chars
    if (!classification_name || /[^a-zA-Z0-9]/.test(classification_name)) {
      req.flash('error', 'Classification name cannot be empty or contain spaces/special characters.');
      return res.render('inventory/add-classification', {
        title: 'Add Classification',
        errors: req.flash('error'),
        messages: req.flash()
      });
    }

    // Insert classification into database
    const result = await invModel.addClassification(classification_name);

    if (result) {
      // Set success flash
      req.flash('success', `Classification "${classification_name}" added successfully!`);

      // Rebuild nav to include new classification
      const nav = await utilities.getNav();

      // Render management view with flash message
      return res.render('inventory/management', {
        title: 'Inventory Management',
        nav,
        messages: req.flash()
      });
    } else {
      req.flash('error', 'Failed to add classification.');
      return res.render('inventory/add-classification', {
        title: 'Add Classification',
        errors: req.flash('error'),
        messages: req.flash()
      });
    }

  } catch (error) {
    next(error);
  }
};

/* ****************************************
 *  Build Add Inventory View (Task 3 -- GET)
 * *************************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationsQuery = await invModel.getClassifications()
    const classifications = classificationsQuery.rows

    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classifications,
      errors: null,
      messages: req.flash(),
      data: {} 
    })
  } catch (error) {
    next(error)
  }
}

/* Process Add Inventory Form (Task 3 -- POST) */
/* ****************************************
 * Process Add Inventory
 **************************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    // Destructure the form data from req.body
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_mile,
      inv_color,
      inv_description,
      inv_image,
      inv_thumbnail
    } = req.body;

    // Pass all values as a single object to the model
    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_mile,
      inv_color,
      inv_description,
      inv_image,
      inv_thumbnail
    });

    if (result) {
      req.flash("success", `${inv_make} ${inv_model} added successfully!`);
      return res.redirect("/inv");
    } else {
      req.flash("error", "Failed to add inventory.");
      return res.redirect("/inv/add-inventory");
    }

  } catch (error) {
    req.flash("error", "There was a problem adding the inventory.");
    return res.redirect("/inv/add-inventory");
  }
};

/* Intentional error trigger for Task 3 */
invCont.throwError = async function (req, res, next) {
  throw new Error("Intentional server error for Task 3.")
}

module.exports = invCont
