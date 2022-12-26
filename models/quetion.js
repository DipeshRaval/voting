"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Quetion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static getQuetions(electionID) {
      return this.findAll({
        where: {
          electionID,
        },
      });
    }

    static addQuetion({ title, description, electionID }) {
      return this.create({
        title: title,
        description: description,
        electionID: electionID,
      });
    }
  }
  Quetion.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      electionID: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Quetion",
    }
  );
  return Quetion;
};
