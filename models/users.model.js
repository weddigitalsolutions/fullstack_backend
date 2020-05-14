module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: "emailIdx",
      },
      password: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  return User;
};
