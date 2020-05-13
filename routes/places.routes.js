const express = require("express");
const { check } = require("express-validator");

const placesControllers = require("../controllers/places.controller");

const router = express.Router();

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength(5),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength(5)],
  placesControllers.updatePlaceById
);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
