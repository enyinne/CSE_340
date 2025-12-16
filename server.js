/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")



/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
}))

 // Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())

app.use(utilities.checkJWTToken)
app.use((req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    res.locals.loggedin = true;
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.locals.account = decoded;
    } catch (err) {
      res.locals.loggedin = false;
      res.locals.account = null;
    }
  } else {
    res.locals.loggedin = false;
    res.locals.account = null;
  }

  next();
});


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root
app.use((req, res, next) => {
    res.locals.account = req.session.account || null; // or decode JWT if using tokens
    next();
});

//app.use((req, res, next) => {
  //res.locals.loggedin = 0
  //next()
//})


/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
//app.get("/", baseController.buildHome)
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inventory", inventoryRoute)

// Account routes   
app.use("/account", accountRoute)



// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

// ERROR HANDLER — must be last
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message)
  res.status(500).render("errors/error", {
    title: "Server Error",
    message: err.message
  })
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
