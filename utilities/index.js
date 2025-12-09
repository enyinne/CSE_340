const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

//module.exports = Util

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid = ""

  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id 
           + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
           + ' details"><img src="' + vehicle.inv_thumbnail 
           + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
           + ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' 
           + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
           + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  return grid
}

/* Build the HTML for a single vehicle detail view */
Util.buildVehicleDetail = async function(vehicle) {
  if (!vehicle) {
    return "<p class='notice'>Vehicle not found.</p>"
  }

  const formattedPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(vehicle.inv_price)
  const formattedMiles = new Intl.NumberFormat("en-US").format(vehicle.inv_mile)

  return `
    <section id="vehicle-detail" class="vehicle-detail">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-info">
        <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
        <p><strong>Price:</strong> ${formattedPrice}</p>
        <p><strong>Mileage:</strong> ${formattedMiles} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </section>
  `
}

/* ****************************************
 * Build the classification select list
 * for Add Inventory form (Task 3) wk 4
 **************************************** */
Util.buildClassificationList = async function (selectedId = null) {
  const data = await invModel.getClassifications()
  const rows = data.rows ? data.rows : data
  let list = '<select name="classification_id" id="classificationList" required>'
  list += "<option value=''>Choose a Classification</option>"
  rows.forEach((row) => {
    list += '<option value="' + row.classification_id + '"'
    if (selectedId != null && row.classification_id == selectedId) {
      list += " selected"
    }
    list += ">" + row.classification_name + "</option>"
  })
  list += "</select>"
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util