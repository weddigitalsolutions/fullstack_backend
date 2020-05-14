const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const { User } = require("../util/databse");

const getUsers = async (req, res, next) => {
  let users;

  try {
    //users = await User.findAll({ attributes: ["id", "name", "email"] });
    users = await User.findAll({ attributes: { exclude: "password" } });
  } catch (err) {
    return next(
      new HttpError("Fetching users failed. Please try again later.", 500)
    );
  }

  res.status(200).json({ users: users });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed. Please check your data.", 422)
    );
  }

  let createdUser;
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({
      where: { email: email },
      indexHints: ["use"],
      values: ["emailIdx"],
    });
    if (existingUser) {
      return next(
        new HttpError(
          "Email already in use. Please select another or login.",
          422
        )
      );
    }

    createdUser = await User.create({ name, email, password });
  } catch (err) {
    return next(
      new HttpError("Problem creating a user. Try again later.", 500)
    );
  }

  res.status(201).json({ user: createdUser });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({
      where: { email: email },
      indexHints: ["use"],
      values: ["emailIdx"],
    });
    if (!existingUser || existingUser.password !== password) {
      return next(new HttpError("Invalid credentials.", 422));
    }
  } catch (err) {
    return next(
      new HttpError(
        "Problems with login operation. Please try again later",
        500
      )
    );
  }

  res.json({ message: "Logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
