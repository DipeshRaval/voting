"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Election extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Election.hasMany(models.Voter, {
        foreignKey: "electionId",
      });
    }

    static getElection() {
      return this.findAll({ order: [["id", "ASC"]] });
    }

    static addElection({ title, url }) {
      return this.create({
        title: title,
        url: url,
      });
    }

    static updateElection({ id, title, url }) {
      return this.update(
        { title, url },
        {
          where: {
            id,
          },
        }
      );
    }

    static remove(id) {
      this.destroy({
        where: {
          id,
        },
      });
    }
  }
  Election.init(
    {
      title: DataTypes.STRING,
      url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Election",
    }
  );
  return Election;
};
