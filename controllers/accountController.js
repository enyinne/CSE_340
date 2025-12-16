const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")



require("dotenv").config()



/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors:null,
    })
}
 
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount
(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )


  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
        nav,
        errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
        nav,
        errors: null,
    })
  }
}

/* ****************************************
*  Process Login
* *************************************** */
async function accountLogin(req, res) {
  const { account_email, account_password } = req.body

  // TEMPORARY: Just flash a message to confirm POST works
  req.flash("notice", "Login route reached successfully.")
  res.redirect("/account/login")
}

/* ****************************************
*  Process Login Request
* *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  // 🔹 Log submitted credentials
  console.log("Login attempt:", { account_email, account_password });

  const accountData = await accountModel.getAccountByEmail(account_email)

  // 🔹 Log result of DB query
  console.log("Account data found:", accountData);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    // 🔹 Log password comparison result
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    console.log("Password match:", passwordMatch);

    if (passwordMatch) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

      // 🔹 Log token creation
      console.log("JWT created:", accessToken);

      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.log("Login error caught:", error);
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver Account Management View
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    messages: req.flash(),
    accountData,
  })
}

async function accountLogout(req, res, next) {
  try {
    // Clear JWT cookie
    res.clearCookie("jwt");

    // Destroy session
    req.session.destroy(err => {
      if (err) return next(err);

      // Clear session cookie explicitly
      res.clearCookie("sessionId");

      res.redirect("/");
    });
  } catch (err) {
    next(err);
  }
}


// router
//router.get("/logout", utilities.handleErrors(accountController.accountLogout));

//module.exports = { 
  //buildLogin,
  //accountLogin,
  //buildRegister,
  //registerAccount,
  //buildAccountManagement  
//}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, accountLogout, buildAccountManagement}


