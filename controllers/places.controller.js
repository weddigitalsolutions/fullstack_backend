const { validationResult } = require("express-validator");
const fs = require("fs");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const { Place } = require("../util/databse");
const { User } = require("../util/databse");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findByPk(placeId);
  } catch (err) {
    return next(new HttpError("Could not retrieve a place.", 500));
  }

  if (!place) {
    next(new HttpError("Could not find a place for the provided id.", 404));
  }
  res.json({ place });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.findAll({ where: { userId: userId } });
  } catch (err) {
    return next(new HttpError("Could not retrieve a place.", 500));
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user.", 404)
    );
  }
  res.status(200).json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed. Please check your data.", 422)
    );
  }

  let user;
  let place;
  try {
    const userId = req.userData.userId;
    const { title, description, address } = req.body;
    user = await User.findByPk(userId, {
      attributes: ["id"],
    });

    if (!user) {
      return next(
        new HttpError("Could not find a user for the provided id.", 422)
      );
    }

    //coordinates = await getCoordsForAddress(address);
    //const { lat, lng } = coordinates;

    const newPlace = {
      title,
      description,
      image: req.file.path,
      address,
      /* lat: lat,
      lng: lng, */
      lat: -10,
      lng: -20,
    };

    place = await user.createPlace(newPlace);
  } catch (err) {
    return next(new HttpError(err.message, 500));
  }

  res.status(201).json({ place: place });
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    next(new HttpError("Invalid inputs passed. Please check your data.", 422));
  }

  let place;
  try {
    const placeId = req.params.pid;
    place = await Place.findByPk(placeId);
  } catch (err) {
    return next(new HttpError("Could not update a place.", 500));
  }

  if (place.UserId !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place.", 403));
  }
  let updatedPlace;
  const { title, description } = req.body;

  place.title = title;
  place.description = description;

  try {
    updatedPlace = await place.save();
  } catch (err) {
    return next(new HttpError("Could not update a place.", 500));
  }

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let imagePath;
  let place;
  try {
    place = await Place.findByPk(placeId);
    imagePath = place.image;
  } catch (err) {
    return next(new HttpError("Could not delete a place.", 500));
  }

  if (place.UserId !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place.", 403));
  }

  try {
    place.destroy();
    fs.unlink(imagePath, (err) => {
      console.log(err);
    });
  } catch (err) {
    return next(new HttpError("Could not delete a place.", 500));
  }

  res.status(200).json({ message: "Deleted place" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
