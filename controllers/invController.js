const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* Build inventory by classification view */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()
  const className = data[0].classification_name
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

/* ***************************
 * Intentional error trigger for Task 3
 * ************************** */
invCont.throwError = async function (req, res, next) {
  // Throw an intentional 500-type server error
  throw new Error("Intentional server error for Task 3.");
}


module.exports = invCont


