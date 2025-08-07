const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const db = require("../models"); // Import the db object from your models directory
const pdf = require("html-pdf");
const { userSendResponse } = require("../services/userSendResponse");
const sequelize = db.sequelize;
const { Template } = require("../models"); // Access the Template model
const { adminSendResponse } = require("../services/adminSendResponse");
const { Op } = require("sequelize");
const { admin_user, TemplateUserStatus } = require("../models");
const {
  AuthSecure,
  Role,
  Module,
  Users,
  UserDesignation,
  Designation,
} = require("../models");
const sharp = require("sharp");
const { type } = require("os");
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
  let dirPath = "";
  console.log(">>>>>");
  try {
    let {
      template_name,
      template_type,
      template_module,
      link_module,
      fields,
      sections,
      sys_status,
      no_of_sections,
      paranoid = false,
      is_link_to_organization,
      is_link_to_leader,
      transaction_id,
    } = req.body;

    dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
    if (fs.existsSync(dirPath))
      return res
        .status(400)
        .json({ success: false, message: "Duplicate transaction detected." });
    fs.mkdirSync(dirPath, { recursive: true });

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
    // let table_name = 'cid_' + template_name
    // 	.toLowerCase()
    // 	.replace(/[^a-z0-9\s]/g, '')
    // 	.replace(/\s+/g, '_');
    let base_name = template_name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, "_"); // Replace spaces with underscores


    let table_name = link_module
      ? "cid_" + link_module.toLowerCase() + "_" + base_name
      : "cid_" + base_name;

      console.log("table_name", table_name);
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
    let childTables = [];

    // Process each field
      for (const field of fields) {
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
        attributes,
      } = field;


      if (field.type === "table" || field.formType === "Table") {
        childTables.push({ field, parentTableName: table_name });
        fieldDefinitions[field.name + "_json"] = {
          type: Sequelize.DataTypes.JSONB, // Use JSONB if Postgres; otherwise DataTypes.TEXT or STRING
          allowNull: true,
        };
      }


      // Handle dependent fields (check only if "table" exists)
      if (table) {
        // If "is_dependent" is true, data type is set to INTEGER for foreign keys
        if (!api || !forign_key || !attributes) {
          const message = `Field ${fieldName} is marked as dependent, but "api", "forign_key", and "attributes" must be provided.`;
          return adminSendResponse(res, 400, false, message, null);
        }
        // data_type = "INTEGER"; // Set the data type to INTEGER for foreign keys if the table exists
      }

      // Check data type and apply max_length if applicable
      let sequelizeType;
      if (data_type.toUpperCase() === "VARCHAR" && max_length) {
        sequelizeType = Sequelize.DataTypes.STRING(max_length);
      } else {
        sequelizeType =
          typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
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
        associations.push({
          fieldName,
          tableName: table,
          foreignKey: forign_key,
          attributes,
        });
      }
    }
    // Handle soft delete if paranoid is true
    if (paranoid) {
      fieldDefinitions.deleted_at = {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      };
    }

    fieldDefinitions.sys_status = {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
      defaultValue: template_module ? template_module : null,
    };

    fieldDefinitions.created_by = {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
    };

    fieldDefinitions.updated_by = {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
    };

    fieldDefinitions.created_by_id = {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
    };

    fieldDefinitions.updated_by_id = {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
    };

    fieldDefinitions.ui_case_id = {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
    };

    fieldDefinitions.pt_case_id = {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
    };

    // Define the model
    const model = sequelize.define(table_name, fieldDefinitions, {
      freezeTableName: true,
      timestamps: true,
      paranoid,
      underscored: true,
      deletedAt: "deleted_at",
    });

    // Sync the model with the database
    await model.sync({ force: true });
    sequelize.models[table_name] = model;


    for (const { field, parentTableName } of childTables) {
      const childTableName = `${parentTableName}_${field.name}`;
      const childFields = {};
      const tableHeaders = field.tableHeaders || [];

      for (const headerObj of tableHeaders) {
        let originalHeader = headerObj.header;

        const normalizedHeader = originalHeader
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          .slice(0, 63);

        const type = headerObj.fieldType?.type || "short_text";
        const sequelizeType =
          type === "short_text"
            ? Sequelize.DataTypes.STRING(255)
            : Sequelize.DataTypes.TEXT;

        childFields[normalizedHeader] = {
          type: sequelizeType,
          allowNull: true,
          field: normalizedHeader 
        };
      }
      
      childFields[`${parentTableName}_id`] = {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: parentTableName,
          key: 'id',
        },
        onDelete: 'CASCADE',
      };

      childFields.created_at = {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      };

      childFields.updated_at = {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      };

      const childModel = sequelize.define(childTableName, childFields, {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
      });

      await childModel.sync({ force: true });

      sequelize.models[childTableName] = childModel;

      model.hasMany(childModel, {
        foreignKey: `${parentTableName}_id`,
        as: field.name + "_children", 
      });

      childModel.belongsTo(model, {
        foreignKey: `${parentTableName}_id`,
        as: parentTableName,
      });
    }

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
        model.addScope(
          "withAssociations",
          {
            include: [
              {
                model: referenceModel,
                as: tableName,
                attributes: attributes || [], // Include only specified attributes
              },
            ],
          },
          { override: true }
        );
      } else {
        console.warn(`Model for table ${tableName} not found.`);
      }
    });

    // Save the template in the Template model
    const saveData = {
      table_name,
      template_type,
      template_module,
      link_module,
      sys_status,
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
        name: "deleted_at",
        data_type: "DATE",
        not_null: false,
        index: false,
      });
      saveData.fields = JSON.stringify(fieldsJson); // Convert back to string
    }

    await Template.create(saveData);

    const responseMessage = `New Template ${template_name} created successfully.`;
    return adminSendResponse(res, 200, true, responseMessage, null);
  } catch (error) {
    console.error("Error creating table:", error);
    return adminSendResponse(res, 400, false,  "Failed to create template.", {
      error: error.message || "Server error.",
    }
    );
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

exports.updateTemplate = async (req, res, next) => {
  let dirPath = "";
  try {
    const {
      template_name,
      template_type,
      template_module,
      link_module,
      sys_status,
      fields,
      sections,
      no_of_sections,
      paranoid = false,
      is_link_to_leader,
      is_link_to_organization,
      transaction_id,
    } = req.body;

    dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
    if (fs.existsSync(dirPath)) {
      return res.status(400).json({ 
        success: false, 
        message: "Duplicate transaction detected." 
      });
    }
    fs.mkdirSync(dirPath, { recursive: true });

    const base_name = template_name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_");

    const table_name = link_module
      ? `cid_${link_module.toLowerCase()}_${base_name}`
      : `cid_${base_name}`;

    const existingTable = await Template.findOne({ where: { table_name } });
    if (!existingTable) {
      return adminSendResponse(
        res,
        404,
        false,
        `Table ${table_name} does not exist.`,
        null
      );
    }
    const pkCheckQuery = `
      SELECT a.attname, i.indisprimary
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid
                        AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = '${table_name}'::regclass
        AND a.attname = 'id';
    `;

    const [pkResult] = await sequelize.query(pkCheckQuery);
    const hasId = pkResult.length > 0;
    const isIdPrimaryKey = hasId && pkResult[0].indisprimary === true;

    if (!isIdPrimaryKey) {
      const [colResult] = await sequelize.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = '${table_name}'
          AND column_name = 'id';
      `);
      const idExists = colResult.length > 0;

      if (idExists) {
        await sequelize.query(`
          ALTER TABLE "${table_name}"
          ADD PRIMARY KEY ("id");
        `);
        console.log(`Primary key added to "${table_name}".`);
      } else {
        await sequelize.query(`
          ALTER TABLE "${table_name}"
          ADD COLUMN "id" SERIAL PRIMARY KEY;
        `);
        console.log(`'id' column with primary key created in "${table_name}".`);
      }
    }

    const fieldDefinitions = {};
    const indexFields = [];
    const associations = [];

    for (const field of fields) {
      let {
        name: fieldName,
        new_field_name,
        data_type,
        max_length,
        not_null,
        default_value,
        index,
        unique,
        is_dependent,
        table,
        forign_key,
        attributes,
      } = field;

      if (new_field_name && new_field_name !== fieldName) {
        await sequelize.query(`
          ALTER TABLE "${table_name}" 
          RENAME COLUMN "${fieldName}" TO "${new_field_name}"
        `);
        fieldName = new_field_name;
      }

      const sequelizeType = data_type.toUpperCase() === "VARCHAR" && max_length
        ? Sequelize.DataTypes.STRING(max_length)
        : typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;

      fieldDefinitions[fieldName] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
        ...(unique && { unique: true })
      };

      if (!fieldDefinitions["id"]) {
        fieldDefinitions["id"] = {
          type: Sequelize.DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        };
      }

      if (index) indexFields.push(fieldName);
      if (is_dependent) {
        associations.push({
          fieldName,
          tableName: table,
          foreignKey: forign_key,
          attributes,
        });
      }
    }

    if (paranoid) {
      fieldDefinitions.deleted_at = {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      };
    }

    const model = sequelize.define(table_name, fieldDefinitions, {
      freezeTableName: true,
      timestamps: true,
      paranoid,
      underscored: true,
      deletedAt: "deleted_at",
    });

    // for (const [fieldName, columnDef] of Object.entries(fieldDefinitions)) {
    //   const columnExists = await sequelize.query(`
    //     SELECT column_name 
    //     FROM information_schema.columns 
    //     WHERE table_name = '${table_name}' 
    //     AND column_name = '${fieldName}'
    //   `);

    //   if (columnExists[0].length === 0) {
    //     await sequelize.query(`
    //       ALTER TABLE "${table_name}" 
    //       ADD COLUMN "${fieldName}" ${columnDef.type.toString()}
    //     `);
    //   }
    // }

    // Add new section:
      const existingColumnQuery = await sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = '${table_name}'
      `);
      const existingColumnNames = new Set(
        existingColumnQuery[0].map(col => col.column_name)
      );

      const alterTablePromises = [];
      for (const [fieldName, columnDef] of Object.entries(fieldDefinitions)) {
        if (!existingColumnNames.has(fieldName)) {
          const sql = `
            ALTER TABLE "${table_name}" 
            ADD COLUMN "${fieldName}" ${columnDef.type.toString()}
          `;
          alterTablePromises.push(sequelize.query(sql));
        }
      }
      await Promise.all(alterTablePromises); 

    for (const field of indexFields) {
      await sequelize.query(
        `CREATE INDEX IF NOT EXISTS idx_${table_name}_${field} 
         ON "${table_name}" ("${field}")`
      );
    }

    // Helper to sanitize column names
    const sanitizeColumnName = (name) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9_]/gi, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 63);
    };

    const childTables = fields.filter(
      field => field.type === "table" || field.formType === "Table"
    );

    for (const field of childTables) {
      const childTableName = sanitizeColumnName(`${table_name}_${field.name}`);
      const parentKey = `${table_name}_id`;

      const existingColsQuery = await sequelize.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = '${childTableName}'
      `);
      const existingColumns = new Set(existingColsQuery[0].map(c => c.column_name));

      const fullFields = {};

      const protectedColumns = new Set([
        "id",
        parentKey,
        `${table_name}_id`,
      ]);

      for (const col of existingColsQuery[0]) {
        const colName = col.column_name;
        if (protectedColumns.has(colName)) continue;

        fullFields[colName] = {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        };
      }

      for (const headerObj of field.tableHeaders || []) {
        const raw = headerObj.header;
        const sanitized = sanitizeColumnName(raw);
        const fieldType = headerObj.fieldType?.type || "short_text";

         if (!sanitized || existingColumns.has(sanitized)) {
            continue;
          }

        fullFields[sanitized] = {
          type: fieldType === "short_text"
            ? Sequelize.DataTypes.STRING(255)
            : Sequelize.DataTypes.TEXT,
          allowNull: true,
        };
      }

      fullFields.created_at = { type: Sequelize.DataTypes.DATE, allowNull: true };
      fullFields.updated_at = { type: Sequelize.DataTypes.DATE, allowNull: true };


      fullFields[parentKey] = {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: table_name,
          key: 'id',
        },
        onDelete: 'CASCADE',
      };

      const childModel = sequelize.define(childTableName, fullFields, {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
      });

      try {
        await childModel.sync({ alter: true });
      // await migrateOldTableFieldData(model, childModel, field, table_name, childTableName);
        
      } catch (err) {
        console.error(`Failed to sync ${childTableName}:`, err);
        throw err;
      }

      sequelize.models[childTableName] = childModel;

      if (!model.associations[`${field.name}_children`]) {
        model.hasMany(childModel, {
          foreignKey: parentKey,
          as: `${field.name}_children`,
        });
      }

      if (!childModel.associations[`${table_name}_parent`]) {
        childModel.belongsTo(model, {
          foreignKey: parentKey,
          as: `${table_name}_parent`,
        });
      }
    }

    const updatedFields = fields.map(field => {
      if (field.new_field_name) {
        const updatedField = { ...field };
        updatedField.name = field.new_field_name;
        delete updatedField.new_field_name;
        return updatedField;
      }
      return field;
    });

    if (paranoid) {
      updatedFields.push({
        name: "deleted_at",
        data_type: "DATE",
        not_null: false,
        index: false,
      });
    }

    const saveData = {
      table_name,
      template_type,
      template_module,
      link_module,
      template_name,
      fields: JSON.stringify(updatedFields),
      sections,
      no_of_sections,
      sys_status,
      is_link_to_leader,
      is_link_to_organization,
      updated_by: "adminUser.full_name",
      paranoid,
    };

    await Template.update(saveData, { where: { table_name } });

    return adminSendResponse(
      res, 
      200, 
      true, 
      `Template ${template_name} updated successfully.`, 
      null
    );
  } catch (error) {
    console.error("Error updating table:", error);
    return adminSendResponse(
      res, 
      400, 
      false, 
      "Failed to update template.", 
      { error: error.message || "Server error." }
    );
  } finally {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
};


// async function migrateOldTableFieldData(model, childModel, field, table_name, childTableName) {
//   const parentKey = `${table_name}_id`;
//   const parentRows = await model.findAll();

//   const sanitizeColumnName = (name) => {
//     return name
//       .toLowerCase()
//       .replace(/[^a-z0-9_]/gi, "_")
//       .replace(/_+/g, "_")
//       .replace(/^_+|_+$/g, "");
//   };

//   for (const parent of parentRows) {
//     const existingChildren = await childModel.count({
//       where: { [parentKey]: parent.id },
//     });

//     if (existingChildren > 0) {
//       console.log(`Skipping migration for parent ID ${parent.id} — child rows already exist.`);
//       continue;
//     }

//     const rawTableData = parent.get(field.name);

//     if (
//       !rawTableData ||
//       rawTableData === "[]" ||
//       rawTableData === "{}" ||
//       (typeof rawTableData === "object" && Object.keys(rawTableData).length === 0)
//     ) {
//       continue;
//     }

//     let parsedRows;
//     try {
//       parsedRows = typeof rawTableData === "string"
//         ? JSON.parse(rawTableData)
//         : rawTableData;
//     } catch (err) {
//       console.warn(`Invalid JSON in ${field.name} for row ID ${parent.id}`);
//       continue;
//     }

//     if (!Array.isArray(parsedRows) || parsedRows.length === 0) {
//       continue;
//     }

//     const nonEmptyRows = parsedRows.filter(obj =>
//       Object.values(obj).some(val =>
//         val !== null && val !== undefined && val.toString().trim() !== ""
//       )
//     );

//     if (nonEmptyRows.length === 0) {
//       continue;
//     }

//     const rowsToInsert = [];

//     for (const row of nonEmptyRows) {
//       const insertRow = {};
//       for (const header of field.tableHeaders || []) {
//         const sanitized = sanitizeColumnName(header.header);
//         insertRow[sanitized] = row[header.header] ?? null;
//       }

//       insertRow[parentKey] = parent.id;
//       rowsToInsert.push(insertRow);
//     }

//     try {
//       if (rowsToInsert.length > 0) {
//         console.log(`Inserting ${rowsToInsert.length} child rows for parent ID ${parent.id}`);
//         await childModel.bulkCreate(rowsToInsert, { ignoreDuplicates: true });
//       }
//     } catch (err) {
//       console.error(`Error inserting child rows for parent ID ${parent.id}:`, err);
//     }
//   }
// }



exports.deleteTemplate = async (req, res, next) => {
  let dirPath = "";
  try {
    const { table_name, template_name, transaction_id } = req.body;

    // Validate input
    if (!table_name || typeof table_name !== "string") {
      return adminSendResponse(res, 400, false, "Invalid table_name.", {
        errors: {
          table_name: "table_name is required and must be a string.",
        },
      });
    }

    dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
    if (fs.existsSync(dirPath))
      return res
        .status(400)
        .json({ success: false, message: "Duplicate transaction detected." });
    fs.mkdirSync(dirPath, { recursive: true });

    // Fetch Template for the specified table
    const existingTable = await Template.findOne({ where: { table_name } });

    if (!existingTable) {
      return adminSendResponse(
        res,
        404,
        false,
        `Table ${table_name} does not exist.`,
        null
      );
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
        `Cannot delete template ${template_name} as it contains ${entryCount} record(s). Please delete the records first.`,
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

    const childTables = await sequelize.query(`
      SELECT DISTINCT kcu.table_name
      FROM information_schema.referential_constraints AS rc
      JOIN information_schema.key_column_usage AS kcu
        ON rc.constraint_name = kcu.constraint_name
      WHERE rc.unique_constraint_name IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = :tableName
      )
    `, {
      replacements: { tableName: table_name },
      type: sequelize.QueryTypes.SELECT
    });
    for (const child of childTables) {
      await sequelize.query(`DROP TABLE IF EXISTS "${child.table_name}" CASCADE`);
    }


    // Hard delete: drop the table from the database
    await sequelize.query(`DROP TABLE IF EXISTS "${table_name}" CASCADE`);

    // Remove Template record
    await Template.destroy({ where: { table_name } });

    return adminSendResponse(
      res,
      200,
      true,
      `Template ${template_name} deleted successfully.`,
      null
    );
  } catch (error) {
    console.error("Error deleting table:", error);

    return adminSendResponse(res, 500, false, "Failed to delete template.", {
      error: error.message || "Server error.",
    }
    );
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
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

    var enable_edit = true;

    const template = await Template.findOne({ where: { table_name } });

    if (!template) {
      return adminSendResponse(
        res,
        404,
        false,
        `Template ${template_name} does not exist.`,
        null
      );
    }

    const tableEntries = await sequelize.query(
      `SELECT COUNT(*) AS count FROM "${table_name}"`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const entryCount = parseInt(tableEntries[0].count, 10);
    if (entryCount > 0) {
      enable_edit = false;
    }

    const parsedFields = JSON.parse(template.fields);

    const childTables = parsedFields
      .filter(f => f.type === "table" || f.formType === "Table")
      .map(f => {
        return {
          field_name: f.name,
          child_table_name: `${table_name}_${f.name}`,
          tableHeaders: f.tableHeaders || [],
        };
    });

    return adminSendResponse(
      res,
      200,
      true,
      `Template details for table ${table_name}.`,
      {
        template_id: template.template_id,
        table_name: template.table_name,
        template_name: template.template_name,
        template_type: template.template_type,
        sections: template.sections,
        link_module: template.link_module,
        no_of_sections: template.no_of_sections,
        sys_status: template.sys_status,
        template_module: template.template_module,
        is_link_to_leader: template.is_link_to_leader,
        is_link_to_organization: template.is_link_to_organization,
        fields: JSON.parse(template.fields),
        paranoid: template.paranoid,
        enable_edit: enable_edit,
        child_tables: childTables,
      }
    );
  } catch (error) {
    console.error("Error viewing template:", error);
    return adminSendResponse(res, 500, false, "Failed to view template.", {
      error: error.message || "Server error.",
    });
  }
};

exports.paginateTemplate = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort_by = "created_at",
      order = "DESC",
      search = "",
      template_module = "", // Optional admin field
    } = req.body;
    const userId = res.locals.user_id || null;
    const adminUserId = res.locals.admin_user_id || null;
    const actorId = userId || adminUserId;
    console.log(userId, ">>>>>>>>>>>>>>>userID");
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
      searchConditions.push({ template_name: { [Op.iLike]: `%${search}%` } });

      if (searchConditions.length > 0) {
        whereClause[Op.or] = searchConditions;
      }
    }
    
    

    // Apply template_module filter if provided
    if (template_module) {
      whereClause.template_module = template_module;
    }

    // Validate if sort_by column exists in Template schema
    const validSortBy = [
      "template_id",
      "table_name",
      "fields",
      "created_at",
    ].includes(sort_by)
      ? sort_by
      : "created_at";

    // Fetch paginated data
    const result = await Template.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[validSortBy, order.toUpperCase()]],
      attributes: [
        "template_id",
        "template_name",
        "table_name",
        "template_type",
        "template_module",
        "sections",
        "no_of_sections",
        "is_link_to_leader",
        "is_link_to_organization",
        "fields",
        "template_module",
      ], // Added template_module for reference
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

    const rows = await Promise.all(
      result.rows.map(async (row) => {
        const parsedRow = row.toJSON();
        if (parsedRow.fields) {
          try {
            parsedRow.fields = JSON.parse(parsedRow.fields);
          } catch (error) {
            console.error(
              `Error parsing fields for table ${parsedRow.table_name}:`,
              error
            );
            parsedRow.fields = null;
          }
        }

        if (userId && parsedRow.table_name) {
          try {
            // Get total entries in the dynamically created table
            const totalEntriesQuery = `SELECT COUNT(*) as count FROM "${parsedRow.table_name}"`;
            const totalEntriesResult = await sequelize.query(
              totalEntriesQuery,
              { type: Sequelize.QueryTypes.SELECT }
            );
            const totalEntries = totalEntriesResult[0]?.count || 0;

            // Count entries that the user has read
            const readEntries = await TemplateUserStatus.count({
              where: { template_id: parsedRow.template_id, user_id: userId },
            });

            console.log(
              `Template: ${parsedRow.template_id} | Total Entries: ${totalEntries} | Read Entries: ${readEntries}`
            );

            // Calculate unread count
            parsedRow.unread_count = totalEntries - readEntries;
          } catch (error) {
            console.error(
              `Error counting entries for table ${parsedRow.table_name}:`,
              error
            );
            parsedRow.unread_count = null;
          }
        }

        return parsedRow;
      })
    );

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
      },
    };

    return adminSendResponse(
      res,
      200,
      true,
      "Templates fetched successfully.",
      responseData
    );
  } catch (error) {
    console.error("Error fetching templates:", error);
    return adminSendResponse(res, 500, false, "Failed to fetch templates.", {
      error: error.message || "Server error.",
    });
  }
};

exports.getMasterTemplates = async (req, res, next) => {
  try {
    // Fetch all templates with template_type as 'master'
    const masterTemplates = await Template.findAll({
      // where: { template_module: 'master' },
      attributes: ["table_name", "template_type"],
    });

    // Add 'is_master: true' to each template object if templates exist
    const updatedTemplates = masterTemplates.map((template) => ({
      table: template.dataValues.table_name,
      is_master:
        template.dataValues.template_module === "master" ? "true" : "false",
    }));

    // Additional entries

    const additionalEntries = [
      {
        table: "department",
        is_master: "false",
        api: "cidMaster/getAllDepartment",
        is_dependent: "false",
      },
      {
        table: "designation",
        is_master: "false",
        api: "cidMaster/getAllDesignations",
        is_dependent: "false",
      },
      {
        table: "division",
        is_master: "false",
        api: "cidMaster/getAllDivisions",
        is_dependent: "false",
      },
      {
        table: "users",
        is_master: "false",
        api: "cidMaster/getIoUsers",
        is_dependent: "true",
        dependent_table: ["division"]
      },
      {
        table: "kgid",
        is_master: "false",
        api: "cidMaster/getAllKGID",
        is_dependent: "false",
      },
      {
        table: "act",
        is_master: "false",
        api: "cidMaster/getAllAct",
        is_dependent: "false",
      },
      {
        table: "section",
        is_master: "false",
        api: "cidMaster/getAllSectionAndActBasedSection",
        is_dependent: "true",
        dependent_table: ["act"]
      },
    ];

    // Combine master templates and additional entries
    const finalData = [...updatedTemplates, ...additionalEntries];

    // Determine response message
    const responseMessage =
      masterTemplates.length > 0
        ? "Fetched master templates successfully."
        : "No templates found with template_type 'master'. Additional entries included.";

    // Send response
    return adminSendResponse(res, 200, true, responseMessage, finalData);
  } catch (error) {
    console.error("Error fetching master templates:", error);
    return adminSendResponse(res, 500, false, "Failed to get master templates.", error.message);
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const { template_id, table_row_id, table_name } = req.body;

    // Step 1: Validate inputs
    if (!template_id || !table_row_id || !table_name) {
      return userSendResponse(
        res,
        400,
        false,
        "template_id, table_row_id, and table_name are required."
      );
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
      const sequelizeType =
        typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;

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
      return userSendResponse(
        res,
        500,
        false,
        "HTML template not found. Please add it in the templates folder."
      );
    }
    let htmlTemplate = fs.readFileSync(templatePath, "utf8");

    // Step 6: Convert SVG to PNG and Encode as Base64
    const logoPath = path.join(__dirname, "../templates/siimsLogo.svg");
    const logoPngBuffer = await sharp(logoPath).png().toBuffer();
    const logoDataUri = `data:image/png;base64,${logoPngBuffer.toString(
      "base64"
    )}`;

    // Step 6.1: Replace the logo source in the HTML template
    htmlTemplate = htmlTemplate.replace("./siimsLogo.svg", logoDataUri);

    // Step 6.2: Dynamically add fields as rows
    const { dataValues } = record;
    const dynamicRows = Object.entries(dataValues)
      .map(([key, value]) => {
        return `
                    <div style="padding:10px;border-top: 1px solid #EAECF0;">
                        <p class="Roboto ProfileViewHeading">${key}</p>
                        <p class="Roboto ProfileViewDesc">${
                          value !== null ? value : "N/A"
                        }</p>
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
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${table_name}_row_${table_row_id}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");
      return res.send(buffer);
    });
  } catch (error) {
    console.error("Error in downloadPdf API:", error);
    return userSendResponse(
      res,
      500,
      false,
      "Failed to download PDF.",
      null,
      error.message
    );
  }
};

exports.getAllTemplates = async (req, res) => {
    try {
        const templates = await Template.findAll({
            attributes: [
                "template_id",
                "template_name",
                "table_name",
                "template_type",
                "template_module",
                "sections",
                "no_of_sections",
                "fields",
                "created_at",
                "updated_at"
            ],
            order: [["created_at", "DESC"]]
        });

        const result = templates.map(t => {
            const data = t.toJSON();
            if (data.fields) {
                try {
                    data.fields = JSON.parse(data.fields);
                } catch (e) {
                    data.fields = null;
                }
            }
            return data;
        });

        return adminSendResponse(res, 200, true, "All templates fetched successfully.", result);
    } catch (error) {
        console.error("Error fetching all templates:", error);
        return adminSendResponse(res, 500, false, "Failed to get templates.", error.message);
    }
};


exports.checkDuplicateTemplate = async (req, res, next) => {
  try {
    let { template_name, template_module } = req.body;

    let table_name =
      "cid_" +
      template_name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_");

    // Check if a template with the same template_module exists (except when template_module is 'master')

    if (template_module !== "master" && template_module !== "others") {
      const existingModule = await Template.findOne({
        where: { template_module },
      });
      if (existingModule) {
        const message = `A template already exists with the module ${template_module}.`;
        return adminSendResponse(res, 400, false, message, null);
      }
    }

    // Check if a table with the same name already exists
    const existingTable = await Template.findOne({ where: { table_name } });
    if (existingTable) {
      const message = `Template ${template_name} already exists.`;
      return adminSendResponse(res, 400, false, message, null);
    }

    const message = `Table ${table_name} is available.`;
    return adminSendResponse(res, 200, true, message, null);
  } catch (error) {
    console.error("Error in checkDuplicateTemplate API:", error);
    return adminSendResponse(
      res,
      500,
      false,
      "failed to check duplicate template.",
      null,
      error.message
    );
  }
};
