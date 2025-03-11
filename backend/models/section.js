'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Section extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			// Section.hasMany(models.user_section, {
			//     foreignKey: 'section_id',
			//     onDelete: 'CASCADE'
			// })
			// Section.hasMany(models.agency, {
			//     foreignKey: 'agency_id',
			//     onDelete: 'CASCADE'
			// })
		}
	};
	Section.init({
		section_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true,
		},
		section_name: DataTypes.STRING,
		is_active: DataTypes.BOOLEAN,
		created_by: DataTypes.INTEGER,
		created_date: DataTypes.DATE,
		modified_by: DataTypes.INTEGER,
		modified_date: DataTypes.DATE
	}, {
		sequelize,
		modelName: 'section',
		timestamps: false,
		freezeTableName: true
	});
	return Section;
};