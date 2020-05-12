const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");

const DUMMY_USER = [
  {
    id: "u1",
    name: "Wilsinho",
    email: "test@test.com",
    password: "password",
  },
  {
    id: "u2",
    name: "Another User",
    email: "test1@test.com",
    password: "password1",
  },
];
const getUsers = (req, res, next) => {
  res.status(200).json({ users: DUMMY_USER });
};

const signup = (req, res, next) => {
  const { name, email, password } = req.body;

  const hasUser = DUMMY_USER.find((u) => u.email === email);

  if (hasUser) {
    throw new HttpError("Email already exists.", 422);
  }

  const createdUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };

  DUMMY_USER.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USER.find((u) => u.email === email);

  if (!identifiedUser || !identifiedUser.password === password) {
    throw new HttpError("Invalid credentials.", 401);
  }

  res.json({ message: "Logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
