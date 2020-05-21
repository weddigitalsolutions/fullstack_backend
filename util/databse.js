//require("dotenv").config();
const Sequelize = require("sequelize");

const PlaceModel = require("../models/places.model");
const UserModel = require("../models/users.model");

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
User.hasMany(Post); 
*/

const Place = PlaceModel(sequelize, Sequelize);
const User = UserModel(sequelize, Sequelize);

Place.belongsTo(User);
User.hasMany(Place);

db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  Place: Place,
  User: User,
};

module.exports = { db, Place, User };
