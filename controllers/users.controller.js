const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//require("dotenv").config();

const HttpError = require("../models/http-error");
const { User } = require("../util/databse");
const { Place } = require("../util/databse");

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.findAll({ include: Place });
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

  const { name, email, password } = req.body;
  try {
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
  } catch (err) {
    return next(
      new HttpError("Problem creating a user. Try again later.", 500)
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user. Please try again.", 500));
  }

  let createdUser;
  try {
    createdUser = await User.create({
      name,
      email,
      image: req.file.path,
      password: hashedPassword,
    });
  } catch (err) {
    return next(new HttpError("Could not create user. Please try again.", 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    return next(new HttpError("Could not create user. Please try again.", 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({
      where: { email: email },
      indexHints: ["use"],
      values: ["emailIdx"],
    });

    if (!existingUser) {
      return next(new HttpError("Invalid credentials.", 403));
    }

    let isValidPassword = false;

    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      return next(
        new HttpError("Could not log you in. Please try again later.", 500)
      );
    }

    if (!isValidPassword) {
      return next(new HttpError("Invalid credentials.", 403));
    }

    let token;
    try {
      token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
    } catch (err) {
      return next(new HttpError("Logging in failed. Please try again.", 500));
    }

    res.json({
      message: "Logged in",
      userId: existingUser.id,
      email: existingUser.email,
      token: token,
    });
  } catch (err) {
    return next(
      new HttpError(
        "Problems with login operation. Please try again later",
        500
      )
    );
  }
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
