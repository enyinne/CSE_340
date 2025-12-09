// Needed Resources
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

// task 4 Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process login
router.post("/login", utilities.handleErrors(accountController.accountLogin))


// task 4 Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// task 4 Process registration activity
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Login POST route (temporary for testing + validation)
//router.post(
  //"/login",
  //regValidate.loginRules(),
 // regValidate.checkLoginData,
  //(req, res) => {
    //res.status(200).send('login process')
 // }
//)

// Export the router
module.exports = router
