'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class State extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	State.init(
		{
			country_id: DataTypes.INTEGER,
			state: DataTypes.STRING
		},
		{
			sequelize,
			modelName: 'State',
			timestamps: true,
			paranoid: true,
			createdAt: 'created_at', // alias createdAt as created_date
			updatedAt: 'updated_at',
			deletedAt: 'deleted_at',
			tableName: 'states',
		}
	);

	State.getAllStates = async () => {
		let state_list = await State.findAll({
			attributes: ['id', 'state', 'country_id'],
			order: [
				['state', 'ASC']
			]
		});
		return state_list;
	};

	return State;
};
