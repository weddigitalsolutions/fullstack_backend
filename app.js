const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places.routes");
const usersRoutes = require("./routes/users.routes");
const HttpError = require("./models/http-error");
const { db } = require("./util/databse.js");

const app = express();

app.use(bodyParser.json());

// Middleware to serve images statically
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-Width, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

//Middleware to handle errors
app.use((error, req, res, next) => {
  // Clear the image with have an error - BEGIN
  if (req.file) {
    fs.unlink(req.file.path, (er) => {
      console.log(error);
    });
  }
  // END
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error ocurred" });
});

db.sequelize
  .sync()
  //.sync({ force: true })
  .then(() => {
    console.log("Connection has been established successfully.");
    app.listen(5000);
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
