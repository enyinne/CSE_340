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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* Intentional error trigger for Task 3 */
invCont.throwError = async function (req, res, next) {
  throw new Error("Intentional server error for Task 3.")
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory  = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()

  const itemData = await invModel.getInventoryById(inv_id)

  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  )

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_mile: itemData.inv_mile,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()

    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_mile,
      inv_color,
      classification_id,
    } = req.body

    // 🔹 Get current inventory item from DB
    const currentItem = await invModel.getInventoryById(inv_id)

    // 🔹 Check if ANY field changed
    const noChanges =
      currentItem.inv_make === inv_make &&
      currentItem.inv_model === inv_model &&
      currentItem.inv_description === inv_description &&
      currentItem.inv_image === inv_image &&
      currentItem.inv_thumbnail === inv_thumbnail &&
      Number(currentItem.inv_price) === Number(inv_price) &&
      Number(currentItem.inv_year) === Number(inv_year) &&
      Number(currentItem.inv_mile) === Number(inv_mile) &&
      currentItem.inv_color === inv_color &&
      Number(currentItem.classification_id) === Number(classification_id)

    // ✅ If no changes, skip update
    if (noChanges) {
      const itemName = `${currentItem.inv_make} ${currentItem.inv_model}`
      req.flash("success", `No changes were made to ${itemName}.`)
      return res.redirect("/inv/")
    }

    // 🔹 Proceed with update
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_mile,
      inv_color,
      classification_id
    )

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("success", `The ${itemName} was successfully updated.`)
      return res.redirect("/inv/")
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the update failed.")
      return res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
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
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    errors: null
  })
}

/* ***************************
 *  Process delete inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const { inv_id } = req.body
  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("success", "Inventory item was deleted.")
    return res.redirect("/inv/")
  } else {
    req.flash("error", "Delete failed.")
    return res.redirect("/inv/")
  }
}

module.exports = invCont
