const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const db = require('../models'); // Import the db object from your models directory
const pdf = require("html-pdf");
const { userSendResponse } = require("../services/userSendResponse");
const sequelize = db.sequelize;
const { Template } = require("../models"); // Access the Template model
const { adminSendResponse } = require('../services/adminSendResponse');
const { Op } = require("sequelize");
const { admin_user, TemplateUserStatus } = require('../models');
const { AuthSecure, Role, Module, Users, UserDesignation, Designation } = require('../models');
const sharp = require("sharp");
const typeMapping = {
	STRING: Sequelize.DataTypes.STRING,
	INTEGER: Sequelize.DataTypes.INTEGER,
	TEXT: Sequelize.DataTypes.TEXT,
	DATE: Sequelize.DataTypes.DATE,
	BOOLEAN: Sequelize.DataTypes.BOOLEAN,
	FLOAT: Sequelize.DataTypes.FLOAT,
	DOUBLE: Sequelize.DataTypes.DOUBLE,
	JSONB: Sequelize.DataTypes.JSONB,

};




exports.createTemplate = async (req, res, next) => {
	console.log(">>>>>")
	try {
		let { template_name, template_type, template_module, fields, sections, no_of_sections, paranoid = false, is_link_to_organization, is_link_to_leader } = req.body;
		// const iddd = res.locals.admin_user_id;


		// const adminUser = await admin_user.findOne({
		// 	where: { admin_user_id: iddd },
		// 	attributes: ['full_name']
		// });


		// Convert template_name to a valid table_name
		// let table_name = template_name
		// 	.toLowerCase()
		// 	.replace(/[^a-z0-9\s]/g, '')
		// 	.replace(/\s+/g, '_');
		let table_name = 'da_' + template_name
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '_');

		// Check if table already exists
		const existingTable = await Template.findOne({ where: { table_name } });
		if (existingTable) {
			const message = `Table ${table_name} already exists.`;
			return adminSendResponse(res, 400, false, message, null);
		}

		// Initialize mutable variables
		let fieldDefinitions = {};
		let indexFields = [];
		let associations = [];

		// Process each field
		fields.forEach(field => {
			let {
				name: fieldName,
				data_type,
				max_length,
				min_length,
				not_null,
				default_value,
				index,
				unique,
				is_dependent,
				api,

				table,
				forign_key,
				attributes
			} = field;

			// Handle dependent fields (check only if "table" exists)
			if (table) {
				// If "is_dependent" is true, data type is set to INTEGER for foreign keys
				if ((!api || !forign_key || !attributes)) {
					const message = `Field ${fieldName} is marked as dependent, but "api", "forign_key", and "attributes" must be provided.`;
					return adminSendResponse(res, 400, false, message, null);
				}
				data_type = "INTEGER"; // Set the data type to INTEGER for foreign keys if the table exists
			}

			// Check data type and apply max_length if applicable
			let sequelizeType;
			if (data_type.toUpperCase() === 'VARCHAR' && max_length) {
				sequelizeType = Sequelize.DataTypes.STRING(max_length);
			} else {
				sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
			}


			// const columnDef = {
			// 	type: sequelizeType,
			// 	allowNull: not_null ? false : true,
			// 	defaultValue: default_value || null,
			// };
			// if (unique) columnDef.unique = true;

			// // Add foreign key constraint for dependent fields
			// if (table) {
			// 	columnDef.references = {
			// 		model: table,          // Referenced table name
			// 		key: forign_key         // Column in the referenced table
			// 	};
			// 	columnDef.onUpdate = 'CASCADE';
			// 	columnDef.onDelete = 'SET NULL';
			// }

			// fieldDefinitions[fieldName] = columnDef;
			// Create the column definition
			const columnDef = {
				type: sequelizeType,
				allowNull: not_null ? false : true,
				defaultValue: default_value || null,
			};
			if (unique) columnDef.unique = true;

			fieldDefinitions[fieldName] = columnDef;

			// Handle indexes
			if (index) indexFields.push(fieldName);

			// Add associations for fields that have a "table"
			if (table) {
				associations.push({ fieldName, tableName: table, foreignKey: forign_key, attributes });
			}
		});

		// Handle soft delete if paranoid is true
		if (paranoid) {
			fieldDefinitions.deleted_at = {
				type: Sequelize.DataTypes.DATE,
				allowNull: true,
			};
		}

		// Define the model
		const model = sequelize.define(table_name, fieldDefinitions, {
			freezeTableName: true,
			timestamps: true,
			paranoid,
			underscored: true,
			deletedAt: 'deleted_at',
		});

		// Sync the model with the database
		await model.sync({ force: true });

		// Create indexes
		for (let field of indexFields) {
			await sequelize.query(
				`CREATE INDEX IF NOT EXISTS idx_${table_name}_${field} ON "${table_name}" ("${field}")`
			);
		}

		// Handle associations for fields that have a "table"
		associations.forEach(({ fieldName, tableName, foreignKey, attributes }) => {
			const referenceModel = sequelize.models[tableName];
			if (referenceModel) {
				model.belongsTo(referenceModel, {
					foreignKey: fieldName,
					targetKey: foreignKey,
				});

				referenceModel.hasMany(model, {
					foreignKey: fieldName,
				});

				// Prepare include option for queries
				model.addScope('withAssociations', {
					include: [{
						model: referenceModel,
						as: tableName,
						attributes: attributes || [], // Include only specified attributes
					}],
				}, { override: true });
			} else {
				console.warn(`Model for table ${tableName} not found.`);
			}
		});

		// Save the template in the Template model
		const saveData = {
			table_name,
			template_type,
			template_module,
			template_name,
			fields: JSON.stringify(fields),
			sections,
			no_of_sections,
			is_link_to_organization,
			is_link_to_leader,
			created_by: "adminUser.full_name",
			updated_by: "adminUser.full_name",

			paranoid,
		};
		if (paranoid) {
			const fieldsJson = JSON.parse(saveData.fields); // Parse to modify the fields object
			fieldsJson.push({
				name: 'deleted_at',
				data_type: 'DATE',
				not_null: false,
				index: false,
			});
			saveData.fields = JSON.stringify(fieldsJson); // Convert back to string
		}

		await Template.create(saveData);

		const responseMessage = `Table ${table_name} created successfully.`;
		return adminSendResponse(res, 200, true, responseMessage, null);
	} catch (error) {
		console.error("Error creating table:", error);
		return adminSendResponse(res, 400, false, "Server error.", error);
	}
};




exports.updateTemplate = async (req, res, next) => {
	try {
		let { template_name, template_type, template_module, fields, sections, no_of_sections, paranoid = false, is_link_to_leader, is_link_to_organization } = req.body;
		// const iddd = res.locals.admin_user_id;
		// const adminUser = await admin_user.findOne({
		// 	where: { admin_user_id: iddd },
		// 	attributes: ['full_name']
		// });
		// Convert template_name to a valid table_name
		// let table_name = template_name
		// 	.toLowerCase()
		// 	.replace(/[^a-z0-9\s]/g, '')
		// 	.replace(/\s+/g, '_');
		let table_name = 'da_' + template_name
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '_');

		// Check if table exists
		const existingTable = await Template.findOne({ where: { table_name } });
		if (!existingTable) {
			return adminSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null);
		}

		// Check if there are any entries in the dynamic table itself
		const tableEntries = await sequelize.query(
			`SELECT COUNT(*) AS count FROM "${table_name}"`,
			{ type: sequelize.QueryTypes.SELECT }
		);

		const entryCount = parseInt(tableEntries[0].count, 10);
		if (entryCount > 0) {
			return adminSendResponse(
				res,
				400,
				false,
				`Cannot Update the table ${table_name} as it contains ${entryCount} record(s). Please delete the records first.`,
				{ recordCount: entryCount }
			);
		}


		// Initialize mutable variables
		let fieldDefinitions = {};
		let indexFields = [];
		let associations = [];

		// Process each field
		fields.forEach(field => {
			let {
				name: fieldName,
				new_field_name,
				data_type,
				max_length,
				min_length,
				not_null,
				default_value,
				index,
				unique,
				is_dependent,
				api,

				table,
				forign_key,
				attributes
			} = field;

			// Handle renaming of fields if new_field_name is provided
			if (new_field_name && new_field_name !== fieldName) {
				// Rename the column in the database without truncating the data
				sequelize.query(`
                    ALTER TABLE "${table_name}" RENAME COLUMN "${fieldName}" TO "${new_field_name}"
                `);

				// Update fieldName to new field name
				fieldName = new_field_name;
			}

			// Handle dependent fields (foreign keys)
			if (is_dependent) {
				if (!api || !table || !forign_key || !attributes) {
					const message = `Field ${fieldName} is marked as dependent, but "api", "table", "forign_key", and "attributes" must be provided.`;
					return adminSendResponse(res, 400, false, message, null);
				}
				data_type = "INTEGER"; // Set the data type to INTEGER for foreign keys
			}

			// Check data type and apply max_length if applicable
			let sequelizeType;
			if (data_type.toUpperCase() === 'VARCHAR' && max_length) {
				sequelizeType = Sequelize.DataTypes.STRING(max_length);
			} else {
				sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
			}

			// Create the column definition
			const columnDef = {
				type: sequelizeType,
				allowNull: not_null ? false : true,
				defaultValue: default_value || null,
			};
			if (unique) columnDef.unique = true;

			fieldDefinitions[fieldName] = columnDef;

			// Handle indexes
			if (index) indexFields.push(fieldName);

			// Add associations for dependent fields (foreign keys)
			if (is_dependent) {
				associations.push({ fieldName, tableName: table, foreignKey: forign_key, attributes });
			}
		});

		// Handle soft delete if paranoid is true
		if (paranoid) {
			fieldDefinitions.deleted_at = {
				type: Sequelize.DataTypes.DATE,
				allowNull: true,
			};
		}

		// Define the model
		const model = sequelize.define(table_name, fieldDefinitions, {
			freezeTableName: true,
			timestamps: true,
			paranoid,
			underscored: true,
			deletedAt: 'deleted_at',
		});

		// Alter the table to add new columns or modify existing ones, without truncating data
		for (const [fieldName, columnDef] of Object.entries(fieldDefinitions)) {
			await sequelize.query(`
                ALTER TABLE "${table_name}" ADD COLUMN IF NOT EXISTS "${fieldName}" ${columnDef.type.toString()}
            `);
		}

		// Create indexes
		for (let field of indexFields) {
			await sequelize.query(
				`CREATE INDEX IF NOT EXISTS idx_${table_name}_${field} ON "${table_name}" ("${field}")`
			);
		}

		// Handle associations for dependent fields
		associations.forEach(({ fieldName, tableName, foreignKey, attributes }) => {
			const referenceModel = sequelize.models[tableName];
			if (!referenceModel) {
				const message = `Referenced model ${tableName} does not exist.`;
				return adminSendResponse(res, 400, false, message, null);
			}

			// Add associations dynamically using Sequelize
			model.belongsTo(referenceModel, {
				foreignKey: foreignKey,   // Foreign key in the current table
				targetKey: attributes,    // Field in the referenced model
			});
		});

		// Update the table's metadata in Template model
		const updatedFields = fields.map(field => {
			if (field.new_field_name) {
				const updatedField = { ...field };
				updatedField.name = field.new_field_name;
				delete updatedField.new_field_name;
				return updatedField;
			}
			return field;
		});

		// Add deleted_at to fields if paranoid is true
		if (paranoid) {
			updatedFields.push({
				name: 'deleted_at',
				data_type: 'DATE',
				not_null: false,
				index: false,
			});
		}

		const saveData = {
			table_name,
			template_type,
			template_module,
			template_name,
			fields: JSON.stringify(updatedFields),
			sections,
			no_of_sections,

			is_link_to_leader,
			is_link_to_organization,
			updated_by: "adminUser.full_name",

			paranoid,
		};

		await Template.update(saveData, { where: { table_name } });

		const responseMessage = `Table ${table_name} updated successfully.`;
		return adminSendResponse(res, 200, true, responseMessage, null);
	} catch (error) {
		console.error("Error updating table:", error);
		return adminSendResponse(res, 400, false, "Server error.", error);
	}
};


exports.deleteTemplate = async (req, res, next) => {
	try {
		const { table_name } = req.body;

		// Validate input
		if (!table_name || typeof table_name !== "string") {
			return adminSendResponse(res, 400, false, "Invalid table_name.", {
				errors: {
					table_name: "table_name is required and must be a string.",
				},
			});
		}

		// Fetch Template for the specified table
		const existingTable = await Template.findOne({ where: { table_name } });

		if (!existingTable) {
			return adminSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null);
		}

		// Check if there are any entries in the dynamic table itself
		const tableEntries = await sequelize.query(
			`SELECT COUNT(*) AS count FROM "${table_name}"`,
			{ type: sequelize.QueryTypes.SELECT }
		);

		const entryCount = parseInt(tableEntries[0].count, 10);
		if (entryCount > 0) {
			return adminSendResponse(
				res,
				400,
				false,
				`Cannot delete table ${table_name} as it contains ${entryCount} record(s). Please delete the records first.`,
				{ recordCount: entryCount }
			);
		}

		// Delete related entries from activity_logs if the table is empty
		await sequelize.query(
			`DELETE FROM activity_logs WHERE template_id = :templateId`,
			{
				replacements: { templateId: existingTable.template_id },
				type: sequelize.QueryTypes.DELETE,
			}
		);

		// Hard delete: drop the table from the database
		await sequelize.query(`DROP TABLE IF EXISTS "${table_name}" CASCADE`);

		// Remove Template record
		await Template.destroy({ where: { table_name } });

		return adminSendResponse(
			res,
			200,
			true,
			`Template ${table_name} deleted successfully.`,
			null
		);
	} catch (error) {
		console.error("Error deleting table:", error);

		return adminSendResponse(res, 500, false, "Server error.", error.message);
	}
};



exports.viewTemplate = async (req, res, next) => {
	try {
		const { table_name } = req.body;

		if (!table_name || typeof table_name !== "string") {
			return adminSendResponse(res, 400, false, "Invalid table_name.", {
				errors: {
					table_name: "table_name is required and must be a string.",
				},
			});
		}


		const template = await Template.findOne({ where: { table_name } });

		if (!template) {
			return adminSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null);
		}




		return adminSendResponse(res, 200, true, `Template details for table ${table_name}.`, {
			template_id: template.template_id,
			table_name: template.table_name,
			template_name: template.template_name,
			template_type: template.template_type,
			sections: template.sections,
			no_of_sections: template.no_of_sections,
			is_link_to_leader: template.is_link_to_leader,
			is_link_to_organization: template.is_link_to_organization,
			fields: JSON.parse(template.fields),
			paranoid: template.paranoid,
		});
	} catch (error) {
		console.error("Error viewing template:", error);
		return adminSendResponse(res, 500, false, "Server error.", error.message);
	}
};


exports.paginateTemplate = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			sort_by = 'created_at',
			order = 'ASC',
			search = '',
			template_module = '' // Optional admin field
		} = req.body;
		const userId = res.locals.user_id || null;
		const adminUserId = res.locals.admin_user_id || null;
		const actorId = userId || adminUserId;
		console.log(userId, ">>>>>>>>>>>>>>>userID")
		// Validate input for page and limit
		if (isNaN(page) || page <= 0) {
			return adminSendResponse(res, 400, false, "Invalid page number.", null);
		}

		if (isNaN(limit) || limit <= 0) {
			return adminSendResponse(res, 400, false, "Invalid limit number.", null);
		}

		// Prepare pagination parameters
		const offset = (page - 1) * limit;

		// Build where clause for searching
		// Build where clause for searching
		const whereClause = {};

		// Apply search filter
		if (search) {
			const searchConditions = [];
			searchConditions.push({ table_name: { [Op.iLike]: `%${search}%` } });

			if (searchConditions.length > 0) {
				whereClause[Op.or] = searchConditions;
			}
		}

		// Apply template_module filter if provided
		if (template_module) {
			whereClause.template_module = template_module;
		}

		// Validate if sort_by column exists in Template schema
		const validSortBy = ['template_id', 'table_name', 'fields', 'created_at'].includes(sort_by) ? sort_by : 'created_at';

		// Fetch paginated data
		const result = await Template.findAndCountAll({
			where: whereClause,
			limit,
			offset,
			order: [[validSortBy, order.toUpperCase()]],
			attributes: ['template_id', 'template_name', 'table_name', 'template_type', 'template_module', 'sections', 'no_of_sections', 'is_link_to_leader', 'is_link_to_organization', 'fields', 'template_module'] // Added template_module for reference
		});


		// const rows = result.rows.map(row => {
		// 	const parsedRow = row.toJSON();
		// 	if (parsedRow.fields) {
		// 		try {
		// 			parsedRow.fields = JSON.parse(parsedRow.fields); // Parse fields column
		// 		} catch (error) {
		// 			console.error(`Error parsing fields for table ${parsedRow.table_name}:`, error);
		// 			parsedRow.fields = null; // Handle invalid JSON format gracefully
		// 		}
		// 	}
		// 	return parsedRow;
		// });

		const rows = await Promise.all(result.rows.map(async row => {
			const parsedRow = row.toJSON();
			if (parsedRow.fields) {
				try {
					parsedRow.fields = JSON.parse(parsedRow.fields);
				} catch (error) {
					console.error(`Error parsing fields for table ${parsedRow.table_name}:`, error);
					parsedRow.fields = null;
				}
			}

			if (userId && parsedRow.table_name) {
				try {
					// Get total entries in the dynamically created table
					const totalEntriesQuery = `SELECT COUNT(*) as count FROM "${parsedRow.table_name}"`;
					const totalEntriesResult = await sequelize.query(totalEntriesQuery, { type: Sequelize.QueryTypes.SELECT });
					const totalEntries = totalEntriesResult[0]?.count || 0;

					// Count entries that the user has read
					const readEntries = await TemplateUserStatus.count({
						where: { template_id: parsedRow.template_id, user_id: userId }
					});

					console.log(`Template: ${parsedRow.template_id} | Total Entries: ${totalEntries} | Read Entries: ${readEntries}`);

					// Calculate unread count
					parsedRow.unread_count = totalEntries - readEntries;
				} catch (error) {
					console.error(`Error counting entries for table ${parsedRow.table_name}:`, error);
					parsedRow.unread_count = null;
				}
			}


			return parsedRow;
		}));

		const totalItems = result.count;
		const totalPages = Math.ceil(totalItems / limit);

		// Construct response
		const responseData = {
			data: rows,
			meta: {
				page,
				limit,
				totalItems,
				totalPages,
				sort_by: validSortBy,
				order,
			}
		};

		return adminSendResponse(res, 200, true, "Templates fetched successfully.", responseData);
	} catch (error) {
		console.error("Error fetching templates:", error);
		return adminSendResponse(res, 500, false, "Server error.", error.message);
	}
};



exports.getMasterTemplates = async (req, res, next) => {
	try {
		// Fetch all templates with template_type as 'master'
		const masterTemplates = await Template.findAll({
			// where: { template_type: 'master' },
			attributes: ['table_name', 'template_type'],
		});

		// Add 'is_master: true' to each template object if templates exist
		const updatedTemplates = masterTemplates.map(template => ({
			table: template.dataValues.table_name,
			// is_master: "true",
			is_master: template.dataValues.template_type === 'master' ? "true" : "false",
		}));

		// Additional entries
		const additionalEntries = [
			{ table: "state", is_master: "false", api: "siims/getStates", is_dependent: "false" },
			{ table: "district", is_master: "false", api: "siims/getDistricts", is_dependent: "true", dependent_table: ["state"] },
			{ table: "taluk", is_master: "false", api: "siims/getTaluks", is_dependent: "true", dependent_table: ["district"] },
			{ table: "leader", is_master: "false", api: "siims/getLeaders", is_dependent: "false" },
			{ table: "designation", is_master: "false", api: "siims/getDesignations", is_dependent: "false" },
			{ table: "units", is_master: "false", api: "siims/getUnits", is_dependent: "false" },
			{ table: "section", is_master: "false", api: "siims/getSections", is_dependent: "true", dependent_table: ["units"] },
			{ table: "desk", is_master: "false", api: "siims/getDesks", is_dependent: "true", dependent_table: ["units", "section"] },
		];

		// Combine master templates and additional entries
		const finalData = [...updatedTemplates, ...additionalEntries];

		// Determine response message
		const responseMessage = masterTemplates.length > 0
			? "Fetched master templates successfully."
			: "No templates found with template_type 'master'. Additional entries included.";

		// Send response
		return adminSendResponse(res, 200, true, responseMessage, finalData);
	} catch (error) {
		console.error("Error fetching master templates:", error);
		return adminSendResponse(res, 500, false, "Server error.", error);
	}
};



exports.downloadPdf = async (req, res) => {
	try {
		const { template_id, table_row_id, table_name } = req.body;

		// Step 1: Validate inputs
		if (!template_id || !table_row_id || !table_name) {
			return userSendResponse(res, 400, false, "template_id, table_row_id, and table_name are required.");
		}

		// Step 2: Fetch the Template
		const template = await Template.findOne({ where: { template_id } });
		if (!template) {
			return userSendResponse(res, 404, false, "Template not found.");
		}

		// Step 2.1: Validate table_name with the template's table_name
		if (template.table_name !== table_name) {
			return userSendResponse(
				res,
				400,
				false,
				`The table_name '${table_name}' does not exist.`
			);
		}

		const { fields } = template;
		const schema = typeof fields === "string" ? JSON.parse(fields) : fields;

		// Step 3: Dynamically create the model for the specified table
		const modelAttributes = {};
		for (const field of schema) {
			const { name: columnName, data_type, not_null, default_value } = field;
			const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;

			modelAttributes[columnName] = {
				type: sequelizeType,
				allowNull: not_null ? false : true,
				defaultValue: default_value || null,
			};
		}

		const DynamicModel = sequelize.define(table_name, modelAttributes, {
			freezeTableName: true,
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
		});

		// Step 4: Fetch the specific row by table_row_id
		const record = await DynamicModel.findOne({ where: { id: table_row_id } });
		if (!record) {
			return userSendResponse(
				res,
				404,
				false,
				`No record found in table '${table_name}' with table_row_id ${table_row_id}.`
			);
		}

		// Step 5: Read the HTML template
		const templatePath = path.join(__dirname, "../templates/template.html");
		if (!fs.existsSync(templatePath)) {
			return userSendResponse(res, 500, false, "HTML template not found. Please add it in the templates folder.");
		}
		let htmlTemplate = fs.readFileSync(templatePath, "utf8");

		// Step 6: Convert SVG to PNG and Encode as Base64
		const logoPath = path.join(__dirname, "../templates/siimsLogo.svg");
		const logoPngBuffer = await sharp(logoPath).png().toBuffer();
		const logoDataUri = `data:image/png;base64,${logoPngBuffer.toString('base64')}`;

		// Step 6.1: Replace the logo source in the HTML template
		htmlTemplate = htmlTemplate.replace("./siimsLogo.svg", logoDataUri);

		// Step 6.2: Dynamically add fields as rows
		const { dataValues } = record;
		const dynamicRows = Object.entries(dataValues)
			.map(([key, value]) => {
				return `
                    <div style="padding:10px;border-top: 1px solid #EAECF0;">
                        <p class="Roboto ProfileViewHeading">${key}</p>
                        <p class="Roboto ProfileViewDesc">${value !== null ? value : "N/A"}</p>
                    </div>
                `;
			})
			.join("");

		// Step 7: Ensure the placeholders {{#each fields}} and {{/each}} are properly replaced
		htmlTemplate = htmlTemplate.replace("{{#each fields}}", dynamicRows);
		htmlTemplate = htmlTemplate.replace("{{/each}}", "");

		// Step 8: Remove any other placeholder like {{fieldName}} or {{fieldValue}}
		htmlTemplate = htmlTemplate.replace(/{{fieldName}}/g, "");
		htmlTemplate = htmlTemplate.replace(/{{fieldValue}}/g, "");

		// Step 9: Generate the PDF
		pdf.create(htmlTemplate).toBuffer((err, buffer) => {
			if (err) {
				console.error("Error generating PDF:", err);
				return userSendResponse(res, 500, false, "Failed to generate PDF.");
			}

			// Step 10: Send the PDF as a downloadable file
			res.setHeader("Content-Disposition", `attachment; filename=${table_name}_row_${table_row_id}.pdf`);
			res.setHeader("Content-Type", "application/pdf");
			return res.send(buffer);
		});
	} catch (error) {
		console.error("Error in downloadPdf API:", error);
		return userSendResponse(res, 500, false, "Internal Server Error.", null, error.message);
	}
};






exports.checkDuplicateTemplate = async (req, res, next) => {
	try {
		let { template_name } = req.body;

		// Convert template_name to a valid table_name
		// let table_name = template_name
		// 	.toLowerCase()
		// 	.replace(/[^a-z0-9\s]/g, '')
		// 	.replace(/\s+/g, '_');
		let table_name = 'da_' + template_name
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '_');

		// Check if table already exists
		const existingTable = await Template.findOne({ where: { table_name } });
		if (existingTable) {
			const message = `Table ${table_name} already exists.`;
			return adminSendResponse(res, 400, false, message, null);
		}
		else {
			const message = `Table ${table_name} is available.`;
			return adminSendResponse(res, 200, true, message, null);
		}

	}
	catch (error) {
		console.error("Error in checkDuplicateTemplate API:", error);
		return adminSendResponse(res, 500, false, "Internal Server Error.", null, error.message);
	}
}
