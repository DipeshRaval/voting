"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static getOptions(queid) {
      return this.findAll({
        where: {
          queid,
        },
      });
    }

    static addOption({ optionName, queid }) {
      console.log("id : ", queid);
      return this.create({
        optionName: optionName,
        queid: queid,
      });
    }
  }
  Option.init(
    {
      optionName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Option",
    }
  );
  return Option;
};
