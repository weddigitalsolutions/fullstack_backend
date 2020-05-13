require("dotenv").config();
const Sequelize = require("sequelize");

/* const UserModel = require("../models/user");
const PostModel = require("../models/post"); */
const PlaceModel = require("../models/places.model");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: true,
  }
);

/* const User = UserModel(sequelize, Sequelize);
const Post = PostModel(sequelize, Sequelize);

Post.belongsTo(User, { as: "creator" });
User.hasMany(Post); */

const Place = PlaceModel(sequelize, Sequelize);

db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  Place: Place,
  //Post: Post,
};

module.exports = { db, Place };
