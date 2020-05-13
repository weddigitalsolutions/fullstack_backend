const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const { Place } = require("../util/databse");

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
    places = await Place.findAll({ where: { creator: userId } });
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
  const { title, description, address, creator } = req.body;

  let coordinates, createdPlace;

  try {
    coordinates = await getCoordsForAddress(address);
    const { lat, lng } = coordinates;

    createdPlace = await Place.create({
      title,
      description,
      image:
        "https://ogimg.infoglobo.com.br/in/8786075-50c-0d8/FT1086A/652/x2013-623257271-2013062148497.jpg_20130621.jpg.pagespeed.ic.wAPziDb7rv.jpg",
      address,
      lat: lat,
      lng: lng,
      creator,
    });
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed. Please check your data.", 422);
  }

  let updatedPlace;
  try {
    const { title, description } = req.body;
    const placeId = req.params.pid;
    const place = await Place.findByPk(placeId);
    place.title = title;
    place.description = description;
    updatedPlace = await place.save();
  } catch (err) {
    return next(new HttpError("Could not update a place.", 500));
  }
  res.status(200).json({ place: updatedPlace });
};

const deletePlace = async (req, res, next) => {
  try {
    const placeId = req.params.pid;
    Place.destroy({ where: { id: placeId } });
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
