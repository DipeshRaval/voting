"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Options", "queid", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
    });

    await queryInterface.addConstraint("Options", {
      fields: ["queid"],
      type: "foreign key",
      references: {
        table: "Quetions",
        field: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Options", "queid");
  },
};
