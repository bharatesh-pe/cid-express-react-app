const Sequelize = require("sequelize");
const { literal, col } = require("sequelize");
const db = require("../models");
const dbConfig = require("../config/dbConfig");
const sequelize = db.sequelize;
const {
	Template,
	Users,
    Role,
	KGID,
    Division,
	ActivityLog,
	Download,
	ProfileAttachment,
	ProfileHistory,
	event,
	event_tag_organization,
	event_tag_leader,
	event_summary,
	ProfileLeader,
	ProfileOrganization,
	TemplateStar,
  	TemplateUserStatus,
  	UiProgressReportFileStatus,
    UiProgressReportMonthWise,
	ApprovalItem,
	System_Alerts,
	UiCaseApproval,
  UiMergedCases,
  ApprovalFieldLog,
  ApprovalActivityLog,
  CaseHistory,
  UsersHierarchy,
  UserDesignation,
  CaseAlerts,
} = require("../models");
const excluded_role_ids = [1, 10, 21];
const { userSendResponse } = require("../services/userSendResponse");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const uuid = require("uuid");
const ExcelJS = require("exceljs");
const UPLOADS_FOLDER = path.join(__dirname, "../uploads");
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

exports.insertTemplateData = async (req, res, next) => {
  let dirPath = "";
  try {
    const { table_name, data, folder_attachment_ids, transaction_id } =
      req.body;
    const userId = req.user?.user_id || null;
    const adminUserId = res.locals.admin_user_id || null;
    const actorId = userId || adminUserId;

    if (!actorId) {
      return userSendResponse(res, 403, false, "Unauthorized access.", null);
    }

    dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
    if (fs.existsSync(dirPath))
      return res.status(400).json({
        success: false,
        message: "Duplicate transaction detected.",
      });
    fs.mkdirSync(dirPath, { recursive: true });

    // Fetch user data
    const userData = await Users.findOne({
      include: [
        {
          model: KGID,
          as: "kgidDetails",
          attributes: ["kgid", "name", "mobile"],
        },
      ],
      where: { user_id: userId },
    });

    let userName = userData?.kgidDetails?.name || null;

    // Fetch table metadata
    const tableData = await Template.findOne({ where: { table_name } });
    if (!tableData) {
      return userSendResponse(
        res,
        400,
        false,
        `Table ${table_name} does not exist.`,
        null
      );
    }

    const schema = tableData?.fields
      ? typeof tableData.fields === "string"
        ? JSON.parse(tableData.fields)
        : tableData.fields
      : [];

    // Parse incoming data
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (err) {
      return userSendResponse(
        res,
        400,
        false,
        "Invalid JSON format in data.",
        null
      );
    }

    const validData = {};
    for (const field of schema) {
      const { name, not_null, default_value } = field;

      if (parsedData.hasOwnProperty(name)) {
        validData[name] = parsedData[name];
      } else if (not_null && default_value === undefined) {
        return userSendResponse(
          res,
          400,
          false,
          `Field ${name} cannot be null.`,
          null
        );
      } else if (default_value !== undefined) {
        validData[name] = default_value;
      }
    }

    validData.created_by = userName;
    validData.created_by_id = userId;

    // Include additional system fields dynamically
    let completeSchema = parsedData?.sys_status
      ? [
          {
            name: "sys_status",
            data_type: "TEXT",
            not_null: false,
            default_value: parsedData.sys_status.trim(),
          },
          { name: "created_by", data_type: "TEXT", not_null: false },
          { name: "created_by_id", data_type: "INTEGER", not_null: false },
          ...schema,
        ]
      : [
          { name: "created_by", data_type: "TEXT", not_null: false },
          { name: "created_by_id", data_type: "INTEGER", not_null: false },
          ...schema,
        ];

    //like sys_status i need to check ui_case_id and pt_case_id
    if (parsedData.ui_case_id && parsedData.ui_case_id != "") {
      completeSchema = [
        { name: "ui_case_id", data_type: "INTEGER", not_null: false },
        ...completeSchema,
      ];
      validData.ui_case_id = parsedData.ui_case_id;
    }

    if (parsedData.pt_case_id && parsedData.pt_case_id != "") {
      completeSchema = [
        { name: "pt_case_id", data_type: "INTEGER", not_null: false },
        ...completeSchema,
      ];
      validData.pt_case_id = parsedData.pt_case_id;
    }

    console.log("validData", validData);

    // Define dynamic model
    const modelAttributes = {};
    for (const field of completeSchema) {
      const { name, data_type, not_null, default_value } = field;
      const sequelizeType =
        typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
      modelAttributes[name] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
      };
    }

    const Model = sequelize.define(table_name, modelAttributes, {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    });

    console.log("Model Attributes:", modelAttributes);

    // Sync model to ensure table exists
    await Model.sync(); // Only use `sync()` when necessary to prevent performance overhead

    // Insert data
    const insertedData = await Model.create(validData);

    const fileUpdates = {};

    if (req.files && req.files.length > 0) {
      const folderAttachments = folder_attachment_ids
        ? JSON.parse(folder_attachment_ids)
        : []; // Parse if provided, else empty array

      for (const file of req.files) {
        const { originalname, size, key, fieldname } = file;
        const fileExtension = path.extname(originalname);

        // Find matching folder_id from the payload (if any)
        const matchingFolder = folderAttachments.find(
          (attachment) =>
            attachment.filename === originalname &&
            attachment.field_name === fieldname
        );

        const folderId = matchingFolder ? matchingFolder.folder_id : null; // Set NULL if not found or missing folder_attachment_ids

        await ProfileAttachment.create({
          template_id: tableData.template_id,
          table_row_id: insertedData.id,
          attachment_name: originalname,
          attachment_extension: fileExtension,
          attachment_size: size,
          s3_key: key,
          field_name: fieldname,
          folder_id: folderId, // Store NULL if no folder_id provided
        });

        if (!fileUpdates[fieldname]) {
          fileUpdates[fieldname] = originalname;
        } else {
          fileUpdates[fieldname] += `,${originalname}`;
        }
      }

      // Update the model with file arrays
      for (const [fieldname, filenames] of Object.entries(fileUpdates)) {
        await Model.update(
          { [fieldname]: filenames },
          { where: { id: insertedData.id } }
        );
      }
    }

    return userSendResponse(res, 200, true, `Record Created Successfully`, null);
  } catch (error) {
    console.error("Error inserting data:", error.stack);
    return userSendResponse(res, 500, false, "Server error.", error);
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

async function getDisplayValueForField(field, value, schema) {
  // If value is null or undefined, return it as is
  if (value === null || value === undefined) {
    return value;
  }

  // Find field schema
  const fieldSchema = schema.find((f) => f.name === field);
  if (!fieldSchema) return value;

  // Convert value to appropriate type for comparison
  let valueToCompare = value;
  if (fieldSchema.data_type === "integer" && !isNaN(Number(value))) {
    valueToCompare = Number(value);
  }

  // Handle different field types
  if (fieldSchema.type === "dropdown" || fieldSchema.type === "radio") {
    // Handle options based fields (dropdown, radio)
    if (Array.isArray(fieldSchema.options)) {
      const option = fieldSchema.options.find((opt) => {
        // Compare as number if the field data type is integer
        if (fieldSchema.data_type === "integer") {
          return Number(opt.code) === valueToCompare;
        }
        return opt.code === valueToCompare;
      });

      if (option) {
        return option.name;
      }
    }
  } else if (fieldSchema.type === "checkbox") {
    // Handle checkbox fields (multiple selections)
    if (Array.isArray(fieldSchema.options) && value) {
      const codes = String(value)
        .split(",")
        .map((code) => code.trim());
      return codes
        .map((code) => {
          const option = fieldSchema.options.find((opt) => {
            if (fieldSchema.data_type === "integer") {
              return Number(opt.code) === Number(code);
            }
            return opt.code === code;
          });
          return option ? option.name : code;
        })
        .join(", ");
    }
  }

  // Handle table references (foreign keys)
  if (fieldSchema.table && fieldSchema.attributes) {
    try {
      // Handle both array and string attributes
      let attributeName;
      if (Array.isArray(fieldSchema.attributes)) {
        attributeName = fieldSchema.attributes[0];
      } else {
        attributeName = fieldSchema.attributes;
      }

      // Get table model
      const RelatedModel = require(`../models`)[fieldSchema.table];
      if (RelatedModel) {
        // For districts and other dependent tables
        let whereClause = {};
        if (fieldSchema.forign_key) {
          // If there's a specific foreign key defined, use it for the query
          whereClause[fieldSchema.forign_key] = valueToCompare;
        } else {
          // Default to the primary key
          whereClause["id"] = valueToCompare;
        }

        // Query the related model
        const relatedRecord = await RelatedModel.findOne({
          where: whereClause,
        });

        if (relatedRecord && relatedRecord[attributeName]) {
          return relatedRecord[attributeName];
        }
      } else {
        // If model not found, try direct SQL query for tables not defined in models
        const [result] = await sequelize.query(
          `SELECT ${attributeName} FROM ${fieldSchema.table} WHERE ${
            fieldSchema.forign_key || "id"
          } = :value LIMIT 1`,
          {
            replacements: { value: valueToCompare },
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (result && result[attributeName]) {
          return result[attributeName];
        }
      }
    } catch (error) {
      console.error(`Error fetching related record for ${field}:`, error);
    }
  }

  // If no transformation was possible, return the original value
  return value;
}
exports.updateTemplateData = async (req, res, next) => {
  const { table_name, id, data, folder_attachment_ids, transaction_id } =
    req.body;

  const userId = req.user?.user_id || null;
  const adminUserId = res.locals.admin_user_id || null;
  const actorId = userId || adminUserId;

  if (!actorId) {
    return userSendResponse(res, 403, false, "Unauthorized access.", null);
  }

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  if (fs.existsSync(dirPath))
    return res
      .status(400)
      .json({ success: false, message: "Duplicate transaction detected." });
  fs.mkdirSync(dirPath, { recursive: true });

  // Fetch user data
  const userData = await Users.findOne({
    include: [
      {
        model: KGID,
        as: "kgidDetails",
        attributes: ["kgid", "name", "mobile"],
      },
    ],
    where: { user_id: userId },
  });

  let userName = userData?.kgidDetails?.name || null;

  try {
    // Fetch the table template
    const tableData = await Template.findOne({ where: { table_name } });

    if (!tableData) {
      return userSendResponse(
        res,
        400,
        false,
        `Table ${table_name} does not exist.`,
        null
      );
    }

    // Parse schema and request data
    const schema =
      typeof tableData.fields === "string"
        ? JSON.parse(tableData.fields)
        : tableData.fields;
    const validData = {};

    // Parse incoming JSON payload
    // const cleanedData = data.replace(/\/\/.*|\/\*[\s\S]*?\*\/|,\s*}/g, match => {
    //     return match.includes(",") ? "}" : "";
    // });
    // const parsedData = JSON.parse(cleanedData);
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (err) {
      return userSendResponse(
        res,
        400,
        false,
        "Invalid JSON format in data.",
        null
      );
    }

    // Validate and filter data for schema-based fields
    for (const field of schema) {
      const { name, not_null } = field;

      if (parsedData.hasOwnProperty(name)) {
        validData[name] = parsedData[name];
      } else if (not_null && !parsedData[name]) {
        return userSendResponse(
          res,
          400,
          false,
          `Field ${name} cannot be null.`,
          null
        );
      }
    }
    validData.sys_status = parsedData.sys_status;
    validData.updated_by = userName;
    validData.updated_by_id = userId;

    // Include additional system fields dynamically
    let completeSchema = parsedData?.sys_status
      ? [
          {
            name: "sys_status",
            data_type: "TEXT",
            not_null: false,
            default_value: parsedData.sys_status.trim(),
          },
          { name: "updated_by", data_type: "TEXT", not_null: false },
          { name: "updated_by_id", data_type: "INTEGER", not_null: false },
          ...schema,
        ]
      : [
          { name: "updated_by", data_type: "TEXT", not_null: false },
          { name: "updated_by_id", data_type: "INTEGER", not_null: false },
          ...schema,
        ];

    if (parsedData?.ui_case_id && parsedData.ui_case_id != "") {
      completeSchema = [
        { name: "ui_case_id", data_type: "INTEGER", not_null: false },
        ...completeSchema,
      ];
      validData.ui_case_id = parsedData.ui_case_id;
    }

    if (parsedData?.pt_case_id && parsedData.pt_case_id != "") {
      completeSchema = [
        { name: "pt_case_id", data_type: "INTEGER", not_null: false },
        ...completeSchema,
      ];
      validData.pt_case_id = parsedData.pt_case_id;
    }

    // Define Sequelize model dynamically
    const modelAttributes = {};
    for (const field of completeSchema) {
      const { name, data_type, not_null, default_value } = field;
      const sequelizeType =
        typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
      modelAttributes[name] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
      };
    }

    const Model = sequelize.define(table_name, modelAttributes, {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    });

    // Find existing record by ID
    const ids = id.split(",").map((id) => id.trim());

    for (const singleId of ids) {
      // Find existing record by ID
      const record = await Model.findByPk(singleId);
      if (!record) {
        return userSendResponse(
          res,
          400,
          false,
          `Record with ID ${singleId} does not exist in table ${table_name}.`,
          null
        );
      }

      const originalData = record.toJSON();
      const updatedFields = {};

      // Update fields only if they are changed
      for (const key in validData) {
        if (originalData[key] !== validData[key]) {
          updatedFields[key] = validData[key];
        }
      }

      // Perform the database update if there are changes
      if (Object.keys(updatedFields).length > 0) {
        await record.update(updatedFields);

        // Log changes in ProfileHistory (Only for changed fields)
        if (userId) {
          const ids = typeof id === 'string' && id.includes(',')
              ? id.split(',').map(i => parseInt(i.trim()))
              : [parseInt(id)];
      
          for (const rowId of ids) {
              for (const key in updatedFields) {
                  const oldValue = originalData.hasOwnProperty(key) ? originalData[key] : null;
                  const newValue = updatedFields[key];
      
                  console.log(">>>>>oldValue1>>>>>>>>", oldValue);
                  console.log(">>>>>>newValue1>>>>>>>", newValue);
      
                  const oldDisplayValue = await getDisplayValueForField(key, oldValue, schema);
                  const newDisplayValue = await getDisplayValueForField(key, newValue, schema);
      
                  console.log(">>>>>oldDisplayValue>>>>>>>>", oldDisplayValue);
                  console.log(">>>>newDisplayValue>>>>>>>>>", newDisplayValue);
      
                  if (oldValue !== newValue) {
                      await ProfileHistory.create({
                          template_id: tableData.template_id,
                          table_row_id: rowId,
                          user_id: userId,
                          field_name: key,
                          old_value: oldDisplayValue !== null ? String(oldDisplayValue) : null,
                          updated_value: newDisplayValue !== null ? String(newDisplayValue) : null,
                      });
                  }
              }
          }
      }
      

        // await ActivityLog.create({
        //     template_id: tableData.template_id,
        //     table_row_id: id,
        //     user_id: actorId,
        //     actor_name: actorName,
        //     activity: `Updated`,
        // });

        await CaseHistory.create({
            template_id: tableData.template_id,
            table_row_id: id,
            user_id: actorId,
            actor_name: userName,
            action: `Updated`,
        });
      }

      const fileUpdates = {};

      if (req.files && req.files.length > 0) {
        const folderAttachments = folder_attachment_ids
          ? JSON.parse(folder_attachment_ids)
          : []; // Parse if provided, else empty array

        for (const file of req.files) {
          const { originalname, size, key, fieldname } = file;
          const fileExtension = path.extname(originalname);

          // Find matching folder_id from the payload (if any)
          const matchingFolder = folderAttachments.find(
            (attachment) =>
              attachment.filename === originalname &&
              attachment.field_name === fieldname
          );

          const folderId = matchingFolder ? matchingFolder.folder_id : null; // Store NULL if no folder_id provided

          await ProfileAttachment.create({
            template_id: tableData.template_id,
            table_row_id: id,
            attachment_name: originalname,
            attachment_extension: fileExtension,
            attachment_size: size,
            s3_key: key,
            field_name: fieldname,
            folder_id: folderId, // Store NULL if no folder_id provided
          });

          // Fetch current field value if it exists
          const existingRecord = await Model.findOne({
            where: { id },
            attributes: [fieldname],
          });

          let currentFilenames = existingRecord?.[fieldname] || "";

          // Append new filename to the existing comma-separated list
          currentFilenames = currentFilenames
            ? `${currentFilenames},${originalname}`
            : originalname;

          // Add/accumulate new filenames for each field
          if (fileUpdates[fieldname]) {
            fileUpdates[
              fieldname
            ] = `${fileUpdates[fieldname]},${originalname}`;
          } else {
            fileUpdates[fieldname] = currentFilenames;
          }
        }

        // Update the model with the updated filenames
        for (const [fieldname, filenames] of Object.entries(fileUpdates)) {
          await Model.update(
            { [fieldname]: filenames },
            { where: { id: singleId } }
          );
        }
      }
    }

    // await TemplateUserStatus.destroy({
    //     where: {
    //         template_id: tableData.template_id,
    //         table_row_id: id
    //     }
    // });
    return userSendResponse(res, 200, true, `Record updated successfully.`, null);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      const uniqueErrorField = error.errors[0]?.path || "a unique field";
      return userSendResponse(
        res,
        400,
        false,
        `${uniqueErrorField} already exists. Please use a different value.`,
        null
      );
    }

    if (error.name === "SequelizeValidationError") {
      const validationErrorField = error.errors[0]?.path || "a required field";
      return userSendResponse(
        res,
        400,
        false,
        `${validationErrorField} is required and cannot be null.`,
        null
      );
    }

    console.error("Error updating data:", error);
    return userSendResponse(res, 500, false, "Server error.", error);
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

exports.deleteFileFromTemplate = async (req, res, next) => {
  const { profile_attachment_id, transaction_id } = req.body; // Get profile_attachment_id from request body

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  if (fs.existsSync(dirPath))
    return res
      .status(400)
      .json({ success: false, message: "Duplicate transaction detected." });
  fs.mkdirSync(dirPath, { recursive: true });
  try {
    // Step 1: Fetch the attachment entry to get necessary details
    const attachment = await ProfileAttachment.findOne({
      where: { profile_attachment_id },
    });

    if (!attachment) {
      return userSendResponse(
        res,
        400,
        false,
        `Attachment with ID ${profile_attachment_id} not found.`,
        null
      );
    }

    const { template_id, table_row_id, attachment_name, field_name } =
      attachment;

    // Step 2: Remove the attachment from ProfileAttachment table
    await ProfileAttachment.destroy({
      where: { profile_attachment_id },
    });

    // Step 3: Remove the filename from the table's field
    const tableData = await Template.findOne({ where: { template_id } });
    if (!tableData) {
      return userSendResponse(
        res,
        400,
        false,
        `Table with ID ${template_id} not found.`,
        null
      );
    }

    const schema =
      typeof tableData.fields === "string"
        ? JSON.parse(tableData.fields)
        : tableData.fields;
    const modelName = tableData.table_name;

    // Define Sequelize model for dynamic table
    const modelAttributes = {};
    for (const field of schema) {
      const { name, data_type, not_null, default_value } = field;
      const sequelizeType =
        typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
      modelAttributes[name] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
      };
    }

    const Model = sequelize.define(modelName, modelAttributes, {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    });

    // Step 4: Fetch the existing record to update the field
    const record = await Model.findByPk(table_row_id);
    if (!record) {
      return userSendResponse(
        res,
        400,
        false,
        `Record with ID ${table_row_id} not found.`,
        null
      );
    }

    const currentFieldValue = record[field_name] || "";
    const updatedFieldValue = currentFieldValue
      .split(",")
      .filter((filename) => filename !== attachment_name) // Remove the deleted file name
      .join(",");

    // Step 5: Update the field to remove the filename
    await Model.update(
      { [field_name]: updatedFieldValue },
      { where: { id: table_row_id } }
    );

    return userSendResponse(res, 200, true, `Record deleted successfully.`, null);
  } catch (error) {
    console.error("Error deleting file from template:", error);
    return userSendResponse(res, 500, false, "Server error.", error);
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

exports.getActionTemplateData = async (req, res, next) => {
  const {
    sort_by = "template_id",
    order = "DESC",
    table_name,
    is_read = "",
    case_io_id = "",
    ui_case_id,
    pt_case_id,
    filter = {},
    from_date = null,
    to_date = null,
  } = req.body;

  const fields = {};
  const Op = Sequelize.Op;
  const userId = req.user?.user_id || null;

  try {
    const tableData = await Template.findOne({ where: { table_name } });
    if (!tableData) {
      return userSendResponse(res, 400, false, `Table ${table_name} does not exist.`, null);
    }

    const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;

    const relevantSchema = 
      table_name === "cid_ui_case_progress_report" || table_name === "cid_pt_case_trail_monitoring" || 
      table_name === 'cid_ui_case_action_plan' || table_name === 'cid_ui_case_accused' || 
      table_name === 'cid_ui_case_property_form'
        ? schema
        : schema.filter(field => field.is_primary_field === true || field.table_display_content === true);

    if (["cid_ui_case_progress_report", "cid_ui_case_action_plan", "cid_ui_case_property_form"].includes(table_name)) {
      relevantSchema.push({ name: "sys_status", data_type: "TEXT", not_null: false });
    }

    const modelAttributes = {
      id: { type: Sequelize.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      created_at: { type: Sequelize.DataTypes.DATE, allowNull: false },
      updated_at: { type: Sequelize.DataTypes.DATE, allowNull: false },
      created_by: { type: Sequelize.DataTypes.STRING, allowNull: true },
    };

    const associations = [];
    const fieldConfigs = {};

    for (const field of relevantSchema) {
      const { name: columnName, data_type, not_null, default_value, table, forign_key, attributes } = field;

      if (!columnName || !data_type) {
        modelAttributes[columnName] = {
          type: Sequelize.DataTypes.STRING,
          allowNull: not_null ? false : true,
          defaultValue: default_value || null,
        };
        continue;
      }

      const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;

      modelAttributes[columnName] = {
        type: sequelizeType,
        allowNull: not_null ? false : true,
        defaultValue: default_value || null,
      };

      fields[columnName] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
      };

      if (table && forign_key && attributes) {
        associations.push({
          relatedTable: table,
          foreignKey: columnName,
          targetAttribute: attributes,
        });
      }
    }

    const Model = sequelize.define(table_name, modelAttributes, {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    });

    const include = [];

    for (const association of associations) {
      const RelatedModel = require(`../models`)[association.relatedTable];
      if (RelatedModel) {
        Model.belongsTo(RelatedModel, {
          foreignKey: association.foreignKey,
          as: `${association.relatedTable}Details`,
        });

        include.push({
          model: RelatedModel,
          as: `${association.relatedTable}Details`,
        });
      }
    }

    Model.hasOne(db.TemplateUserStatus, {
      foreignKey: 'table_row_id',
      sourceKey: 'id',
      as: 'ReadStatus',
      constraints: false,
    });

    include.push({
      model: db.TemplateUserStatus,
      as: 'ReadStatus',
      required: is_read,
      where: {
        user_id: userId,
        template_id: tableData.template_id,
      },
      attributes: ['template_user_status_id'],
    });

    await Model.sync();

    let whereClause = {};

    if (ui_case_id && pt_case_id) {
      whereClause = { [Op.or]: [{ ui_case_id }, { pt_case_id }] };
    } else if (ui_case_id) {
      whereClause = { ui_case_id };
    } else if (pt_case_id) {
      whereClause = { pt_case_id };
    }

    if (filter && typeof filter === "object") {
      Object.entries(filter).forEach(([key, value]) => {
        if (fields[key]) {
          whereClause[key] = value;
        }
      });
    }

    if (from_date || to_date) {
      whereClause["created_at"] = {};
      if (from_date) whereClause["created_at"][Op.gte] = new Date(`${from_date}T00:00:00.000Z`);
      if (to_date) whereClause["created_at"][Op.lte] = new Date(`${to_date}T23:59:59.999Z`);
    }

    const validSortBy = fields[sort_by] ? sort_by : "created_at";

    const records = await Model.findAll({
      where: whereClause,
      include,
      order: [[col(validSortBy), order.toUpperCase()]],
    });

    const transformedRecords = await Promise.all(
      records.map(async (record) => {
        const data = record.toJSON();
        let filteredData;

        data.ReadStatus = !!data.ReadStatus;

        if (table_name === "cid_ui_case_progress_report") {
          filteredData = { ...data };

          if (data.field_assigned_to) {
            filteredData.field_assigned_to_id = data.field_assigned_to;
            let hasAnyYes = false;

            if (typeof data.field_pr_status === "string") {
              hasAnyYes = data.field_pr_status === "Yes";
            } else if (Array.isArray(data.field_pr_status)) {
              hasAnyYes = data.field_pr_status.some(status => status === "Yes" || status.status === "Yes");
            }

            filteredData.hasFieldPrStatus = hasAnyYes;

            const assignedToUser = await Users.findOne({ where: { user_id: data.field_assigned_to }, attributes: ["kgid_id"] });
            if (assignedToUser?.kgid_id) {
              const kgidRecord = await KGID.findOne({ where: { id: assignedToUser.kgid_id }, attributes: ["name"] });
              filteredData.field_assigned_to = kgidRecord?.name || " ";
            } else {
              filteredData.field_assigned_to = " ";
            }
          }

          if (data.field_assigned_by) {
            filteredData.field_assigned_by_id = data.field_assigned_by;
            const assignedByUser = await Users.findOne({ where: { user_id: data.field_assigned_by }, attributes: ["kgid_id"] });
            if (assignedByUser?.kgid_id) {
              const kgidRecord = await KGID.findOne({ where: { id: assignedByUser.kgid_id }, attributes: ["name"] });
              filteredData.field_assigned_by = kgidRecord?.name || "Unknown";
            } else {
              filteredData.field_assigned_by = "Unknown";
            }
          }

          if (data.field_division) {
            const division = await Division.findOne({ where: { division_id: data.field_division }, attributes: ["division_name"] });
            filteredData.field_division = division?.division_name || "Unknown";
          }

        } else if (["cid_pt_case_trail_monitoring", "cid_ui_case_action_plan", "cid_ui_case_property_form"].includes(table_name)) {
          filteredData = { ...data };
          if (table_name === 'cid_ui_case_action_plan' && case_io_id) {
            const case_io_user_designation = await UserDesignation.findOne({
              attributes: ["designation_id"],
              where: { user_id: case_io_id },
            });

            const supervisorDesignationId = case_io_user_designation?.designation_id
              ? (await UsersHierarchy.findOne({
                  attributes: ["supervisor_designation_id"],
                  where: { officer_designation_id: case_io_user_designation.designation_id },
                }))?.supervisor_designation_id || ''
              : '';

            filteredData.supervisior_designation_id = supervisorDesignationId;
          }
        } else if (table_name === "cid_ui_case_accused") {
          filteredData = { ...data };
        } else {
          filteredData = {
            id: data.id,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };

          schema
            .filter(field => field.is_primary_field === true || field.table_display_content === true)
            .forEach(field => {
              filteredData[field.name] = data[field.name];
            });
        }

        return filteredData;
      })
    );

    const responseMessage = `Fetched data successfully from table ${table_name}.`;
    return userSendResponse(res, 200, true, responseMessage, transformedRecords);
  } catch (error) {
    console.error("Error fetching data:", error);
    return userSendResponse(res, 500, false, "Server error.", error);
  }
};


exports.getTemplateData = async (req, res, next) => {
  const {
    page = 1,
    limit = 5,
    sort_by = "template_id",
    order = "DESC",
    search = "",
    search_field = "",
    table_name,
    is_read = "",
    case_io_id = "",
  } = req.body;
  const {  ui_case_id, pt_case_id } = req.body;
  const { filter = {}, from_date = null, to_date = null } = req.body;
  const fields = {};
  const offset = (page - 1) * limit;
  const Op = Sequelize.Op;

  const userId = req.user?.user_id || null;
  try {
    // Fetch the template metadata
    const tableData = await Template.findOne({ where: { table_name } });

    if (!tableData) {
      const message = `Table ${table_name} does not exist.`;
      return userSendResponse(res, 400, false, message, null);
    }

    // Parse the schema fields from Template
    const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;

    // Filter fields that have is_primary_field as true
    const relevantSchema = 
    table_name === "cid_ui_case_progress_report" || table_name === "cid_pt_case_trail_monitoring" || table_name === 'cid_ui_case_action_plan' || table_name === 'cid_ui_case_accused' || table_name === 'cid_ui_case_property_form'
      ? schema
      : schema.filter((field) => field.is_primary_field === true || field.table_display_content === true);
    
    if(table_name === "cid_ui_case_progress_report")
        relevantSchema.push({ name: "sys_status", data_type: "TEXT", not_null: false });

    if(table_name === "cid_ui_case_action_plan")
        relevantSchema.push({ name: "sys_status", data_type: "TEXT", not_null: false });
    
    if(table_name === "cid_ui_case_property_form")
        relevantSchema.push({ name: "sys_status", data_type: "TEXT", not_null: false });
  
    // const relevantSchema = schema;
    // Define model attributes based on filtered schema
    const modelAttributes = {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,  
      } 
    };
    const associations = [];
    // Store field configurations by name for easy lookup
    const fieldConfigs = {};

    for (const field of relevantSchema) {
      const {
        name: columnName,
        data_type,
        not_null,
        default_value,
        table,
        forign_key,
        attributes,
      } = field;

      if (!columnName || !data_type) {
        console.warn(
          `Missing required attributes for field ${columnName}. Using default type STRING.`
        );
        modelAttributes[columnName] = {
          type: Sequelize.DataTypes.STRING,
          allowNull: not_null ? false : true,
          defaultValue: default_value || null,
        };
        continue;
      }

      // Handle data_type mapping to Sequelize types
      const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
      
	  modelAttributes[columnName] = {
        type: sequelizeType,
        allowNull: not_null ? false : true,
        defaultValue: default_value || null,
      };

	  fields[columnName] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
      };

      // Handle foreign key associations dynamically
      if (table && forign_key && attributes) {
        associations.push({
          relatedTable: table,
          foreignKey: columnName,
          targetAttribute: attributes,
        });
      }
    }

    // Define and sync the dynamic model
    const Model = sequelize.define(table_name, modelAttributes, {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    });

    // Dynamically define associations
    const include = [];
    // Uncomment and adjust if needed to include associations
    for (const association of associations) {
        const RelatedModel = require(`../models`)[association.relatedTable];

        if (RelatedModel) {
            Model.belongsTo(RelatedModel, {
                foreignKey: association.foreignKey,
                as: `${association.relatedTable}Details`,
            });

            include.push({
                model: RelatedModel,
                as: `${association.relatedTable}Details`,
            });
        }
    }

    // Add TemplateUserStatus association
    Model.hasOne(db.TemplateUserStatus, {
        foreignKey: 'table_row_id',
        sourceKey: 'id',
        as: 'ReadStatus',
        constraints: false,
    });

    include.push({
        model: db.TemplateUserStatus,
        as: 'ReadStatus',
        required: is_read,
        where: {
            user_id: userId,
            template_id: tableData.template_id
        },
        attributes: ['template_user_status_id']
    });

    await Model.sync();

    let whereClause = {};
    if (ui_case_id && ui_case_id != "" && pt_case_id && pt_case_id != "") {
      whereClause = {
        [Op.or]: [{ ui_case_id }, { pt_case_id }],
      };
    } else if (ui_case_id && ui_case_id != "") {
      whereClause = { ui_case_id };
    } else if (pt_case_id && pt_case_id != "") {
      whereClause = { pt_case_id };
    }

	// Apply field filters if provided
    if (filter && typeof filter === "object") {
      Object.entries(filter).forEach(([key, value]) => {
        if (fields[key]) {
          whereClause[key] = value; // Direct match for foreign key fields
        }
      });
    }

    if (from_date || to_date) {
      whereClause["created_at"] = {};

      if (from_date) {
        whereClause["created_at"][Op.gte] = new Date(
          `${from_date}T00:00:00.000Z`
        );
      }
      if (to_date) {
        whereClause["created_at"][Op.lte] = new Date(
          `${to_date}T23:59:59.999Z`
        );
      }
    }

    if (search) {
      const searchConditions = [];

      if (search_field && fields[search_field]) {
        // Specific field search
        const fieldConfig = fieldConfigs[search_field];
        const fieldType = fields[search_field].type.key;
        const isForeignKey = associations.some(
          (assoc) => assoc.foreignKey === search_field
        );

        // Handle field type based search
        if (["STRING", "TEXT"].includes(fieldType)) {
          searchConditions.push({
            [search_field]: { [Op.iLike]: `%${search}%` },
          });
        } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
          if (!isNaN(search)) {
            searchConditions.push({ [search_field]: parseInt(search, 10) });
          }
        } else if (fieldType === "BOOLEAN") {
          const boolValue = search.toLowerCase() === "true";
          searchConditions.push({ [search_field]: boolValue });
        } else if (fieldType === "DATE") {
          const parsedDate = Date.parse(search);
          if (!isNaN(parsedDate)) {
            searchConditions.push({ [search_field]: new Date(parsedDate) });
          }
        }

        // Handle dropdown, radio, checkbox special searches
        if (
          fieldConfig &&
          fieldConfig.type === "dropdown" &&
          Array.isArray(fieldConfig.options)
        ) {
          // Find option code that matches the search text
          const matchingOption = fieldConfig.options.find((option) =>
            option.name.toLowerCase().includes(search.toLowerCase())
          );

          if (matchingOption) {
            searchConditions.push({ [search_field]: matchingOption.code });
          }
        }

        if (
          fieldConfig &&
          fieldConfig.type === "radio" &&
          Array.isArray(fieldConfig.options)
        ) {
          // Find option code that matches the search text
          const matchingOption = fieldConfig.options.find((option) =>
            option.name.toLowerCase().includes(search.toLowerCase())
          );

          if (matchingOption) {
            searchConditions.push({ [search_field]: matchingOption.code });
          }
        }

        // Handle foreign keys
        if (isForeignKey) {
          const association = associations.find(
            (assoc) => assoc.foreignKey === search_field
          );
          if (association) {
            // Get the included model from the include array
            const associatedModel = include.find(
              (inc) => inc.as === `${association.relatedTable}Details`
            );

            // Only add the condition if the model is properly included
            if (associatedModel) {
              searchConditions.push({
                [`$${association.relatedTable}Details.${association.targetAttribute}$`]:
                  { [Op.iLike]: `%${search}%` },
              });
            }
          }
        }
      } else {
        // General search across all fields
        Object.keys(fields).forEach((field) => {
          const fieldConfig = fieldConfigs[field];
          const fieldType = fields[field].type.key;
          const isForeignKey = associations.some(
            (assoc) => assoc.foreignKey === field
          );

          // Standard text and numeric search
          if (["STRING", "TEXT"].includes(fieldType)) {
            searchConditions.push({ [field]: { [Op.iLike]: `%${search}%` } });
          } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
            if (!isNaN(search)) {
              searchConditions.push({ [field]: parseInt(search, 10) });
            }
          }

          // Dropdown, radio, checkbox search
          if (
            fieldConfig &&
            fieldConfig.type === "dropdown" &&
            Array.isArray(fieldConfig.options)
          ) {
            // Find option code that matches the search text
            const matchingOption = fieldConfig.options.find((option) =>
              option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
              searchConditions.push({ [field]: matchingOption.code });
            }
          }

          if (
            fieldConfig &&
            fieldConfig.type === "radio" &&
            Array.isArray(fieldConfig.options)
          ) {
            // Find option code that matches the search text
            const matchingOption = fieldConfig.options.find((option) =>
              option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
              searchConditions.push({ [field]: matchingOption.code });
            }
          }

          // Foreign key search
          if (isForeignKey) {
            const association = associations.find(
              (assoc) => assoc.foreignKey === field
            );
            if (association) {
              // Get the included model from the include array
              const associatedModel = include.find(
                (inc) => inc.as === `${association.relatedTable}Details`
              );

              // Only add the condition if the model is properly included
              if (associatedModel) {
                searchConditions.push({
                  [`$${association.relatedTable}Details.${association.targetAttribute}$`]:
                    { [Op.iLike]: `%${search}%` },
                });
              }
            }
          }
        });
      }

      if (searchConditions.length > 0) {
        whereClause[Op.or] = searchConditions;
      }
    }

    const validSortBy = fields[sort_by] ? sort_by : "created_at";

    // Fetch data with dynamic includes
    // const records = await Model.findAll({
    //   where: whereClause,
    //   limit,
    //   offset,
    //   order: [[validSortBy, order.toUpperCase()]],
    //   attributes: [
    //     "id",
    //     ...Object.keys(fields).filter((field) => fields[field].displayContent),
    //   ],
    //   include,
    // });
    const { rows: records, count: totalItems } = await Model.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include,
      order: [[col(validSortBy), order.toUpperCase()]],
    });


    // const totalItems = records.count;
    const totalPages = Math.ceil(totalItems / limit);



    // Transform the response to include only primary fields and metadata fields
    const transformedRecords = await Promise.all(
      records.map(async (record) => {
        const data = record.toJSON();
        let filteredData;

        data.ReadStatus = data.ReadStatus ? true : false;
        if (table_name === "cid_ui_case_progress_report" ) {
          filteredData = { ...data };

          if (data.field_assigned_to || data.field_assigned_by) {
            try {
              if (data.field_assigned_to) {
                filteredData.field_assigned_to_id = data.field_assigned_to;
                let hasAnyYes = false;

                if (typeof data.field_pr_status === "string") {
                  hasAnyYes = data.field_pr_status === "Yes";
                }
              
                else if (Array.isArray(data.field_pr_status)) {
                  hasAnyYes = data.field_pr_status.some((statusObj) => statusObj === "Yes" || statusObj.status === "Yes");
                }
              
                filteredData.hasFieldPrStatus = hasAnyYes;
              
                const assignedToUser = await Users.findOne({
                  where: { user_id: data.field_assigned_to },
                  attributes: ["kgid_id"],
                });
          
                if (assignedToUser && assignedToUser.kgid_id) {
                  const kgidRecord = await KGID.findOne({
                    where: { id: assignedToUser.kgid_id },
                    attributes: ["name"],
                  });
          
                  filteredData.field_assigned_to = kgidRecord ? kgidRecord.name : " ";
                } else {
                  filteredData.field_assigned_to = " ";
                }
              }
          
              if (data.field_assigned_by) {
                filteredData.field_assigned_by_id = data.field_assigned_by;

                const assignedByUser = await Users.findOne({
                  where: { user_id: data.field_assigned_by },
                  attributes: ["kgid_id"],
                });
          
                if (assignedByUser && assignedByUser.kgid_id) {
                  const kgidRecord = await KGID.findOne({
                    where: { id: assignedByUser.kgid_id },
                    attributes: ["name"],
                  });
          
                  filteredData.field_assigned_by = kgidRecord ? kgidRecord.name : "Unknown";
                } else {
                  filteredData.field_assigned_by = "Unknown";
                }
              }
            } catch (error) {
              console.error("Error fetching user details:", error);
            }
          }

          if(data.field_division) {
            const division = await Division.findOne({
              where: { division_id: data.field_division },
              attributes: ["division_name"],
            });
            filteredData.field_division = division ? division.division_name : "Unknown";
          }
        }else if (table_name === "cid_pt_case_trail_monitoring" || table_name === 'cid_ui_case_action_plan' || table_name === 'cid_ui_case_property_form') {
            filteredData = { ...data };
            if (table_name === 'cid_ui_case_action_plan' && case_io_id && case_io_id !== "") {
                const case_io_user_designation = await UserDesignation.findOne({
                    attributes: ["designation_id"],
                    where: { user_id: case_io_id },
                });
            
                let supervisorDesignationId = '';
            
                if (case_io_user_designation?.designation_id) {
                    const immediate_supervisior = await UsersHierarchy.findOne({
                        attributes: ["supervisor_designation_id"],
                        where: { officer_designation_id: case_io_user_designation.designation_id },
                    });
            
                    supervisorDesignationId = immediate_supervisior?.supervisor_designation_id || '';
                }
            
                filteredData['supervisior_designation_id'] = supervisorDesignationId;
            }            
        }else if (table_name === "cid_ui_case_accused") {
          filteredData = { ...data };
          console.log("filteredData", filteredData);    

        } else {
          filteredData = {
            id: data.id,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };

          schema
            .filter((field) => field.is_primary_field === true || field.table_display_content === true)
            .forEach((field) => {
              filteredData[field.name] = data[field.name];
            });
        }

        return filteredData;
      })
    );

    const templateresult = {
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        order,
      },
    };


    // Log the user activity
    // await ActivityLog.create({
    //     template_id: tableData.template_id,
    //     table_row_id: 0,
    //     user_id: actorId,
    //     actor_name: actorName,
    //     activity: `Viewed`,
    // });

     const currentDate = new Date();
      templateresult.currentDate = currentDate;

     const responseMessage = `Fetched data successfully from table ${table_name}.`;
    return userSendResponse(
      res,
      200,
      true,
      responseMessage,
      transformedRecords,
      null,
      templateresult,
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return userSendResponse(res, 500, false, "Server error.", error);
  }
};

exports.viewTemplateData = async (req, res, next) => {
  const { table_name, id , template_module  } = req.body;
  const userId = req.user?.user_id || null;
  // const userId = res.locals.user_id || null;
  // const adminUserId = res.locals.admin_user_id || null;
  // const actorId = userId || adminUserId;
  // const adminUserName = await admin_user.findOne({
  //     where: { admin_user_id: adminUserId },
  //     attributes: ['full_name']
  // });

  // const userName = await user.findOne({
  //     where: { user_id: userId },
  //     attributes: ['user_firstname']
  // });
  // const actorName = adminUserName?.full_name || userName?.user_firstname;
  // const actorName = "abc"
  // if (!actorId) {
  //     return userSendResponse(res, 403, false, "Unauthorized access.", null);
  // }
  const return_data = {};
  try {
    const tableData = await Template.findOne({ where: { table_name } });

    if (!tableData) {
      const message = `Table ${table_name} does not exist.`;
      return userSendResponse(res, 400, false, message, null);
    }

    const schema =
      typeof tableData.fields === "string"
        ? JSON.parse(tableData.fields)
        : tableData.fields;

    const modelAttributes = {};

    for (const field of schema) {
      const { name: columnName, data_type, not_null, default_value } = field;

      if (!columnName || !data_type) {
        console.warn(
          `Missing required attributes for field ${columnName}. Using default type STRING.`
        );
        modelAttributes[columnName] = {
          type: Sequelize.DataTypes.STRING,
          allowNull: not_null ? false : true,
          defaultValue: default_value || null,
        };
        continue;
      }

      const sequelizeType =
        typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
      modelAttributes[columnName] = {
        type: sequelizeType,
        allowNull: not_null ? false : true,
        defaultValue: default_value || null,
      };
    }

    const Model = sequelize.define(table_name, modelAttributes, {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    });

    await Model.sync();

    const record = await Model.findOne({ where: { id } });

    if (!record) {
      const message = `Record with ID ${id} not found in table ${table_name}.`;
      return userSendResponse(res, 404, false, message, null);
    }

    const data = record.toJSON();

    delete data.deleted_at;
    delete data.created_at;
    delete data.updated_at;

    const attachments = await ProfileAttachment.findAll({
      where: {
        template_id: tableData.template_id,
        table_row_id: id,
      },
      order: [["created_at", "DESC"]],
    });

    if (attachments.length) {
      data.attachments = attachments.map((att) => att.toJSON());
    }
    if (userId) {
        await TemplateUserStatus.findOrCreate({
            where: {
                template_id: tableData.template_id,
                table_row_id: id,
                user_id: userId
            },
            defaults: {
                created_at: new Date(),
                updated_at: new Date()
            }
        });
    }

    // await ActivityLog.create({
    //     template_id: tableData.template_id,
    //     table_row_id: id,
    //     user_id: actorId,
    //     actor_name: actorName,
    //     activity: `Viewed `,
    // });

    const template_module_data = {};
    if(template_module && template_module != "") {
      // Fetch the template using template_module to get the table_name
      const template = await Template.findOne({ where: { template_module } });
      if (!template) {
        return userSendResponse(res, 400, false, "Template not found", null);
      }

      template_module_data['table_name'] = template.table_name;
      template_module_data["template_name"] = template.template_name;
    }
    data.template_module_data = template_module_data;

    const responseMessage = `Fetched record successfully from table ${table_name}.`;
    return userSendResponse(res, 200, true, responseMessage, data);
  } catch (error) {
    console.error("Error fetching data by ID:", error);
    return userSendResponse(res, 500, false, "Server error.", error);
  }
};

exports.viewMagazineTemplateData = async (req, res) => {
  try {
    const { table_name, id } = req.body;
    // const userId = res.locals.user_id || null;
    // const adminUserId = res.locals.admin_user_id || null;
    // const actorId = userId || adminUserId;

    // const adminUserName = await admin_user.findOne({
    //     where: { admin_user_id: adminUserId },
    //     attributes: ['full_name']
    // });

    // const userName = await user.findOne({
    //     where: { user_id: userId },
    //     attributes: ['user_firstname']
    // });
    // const actorName = adminUserName?.full_name || userName?.user_firstname;
    const actorName = "abc";
    if (!table_name) {
      return userSendResponse(res, 400, false, "Table name is required.", null);
    }

    if (!id) {
      return userSendResponse(res, 400, false, "ID is required.", null);
    }

    const tableTemplate = await Template.findOne({ where: { table_name } });
    if (!tableTemplate) {
      return userSendResponse(
        res,
        404,
        false,
        `Table ${table_name} does not exist.`,
        null
      );
    }

    let fieldsArray;
    try {
      fieldsArray =
        typeof tableTemplate.fields === "string"
          ? JSON.parse(tableTemplate.fields)
          : tableTemplate.fields;
    } catch (err) {
      console.error("Error parsing fields:", err);
      return userSendResponse(
        res,
        500,
        false,
        "Invalid table schema format.",
        null
      );
    }

    if (!Array.isArray(fieldsArray)) {
      return userSendResponse(
        res,
        500,
        false,
        "Fields must be an array in the table schema.",
        null
      );
    }

    const fields = {};
    const radioFieldMappings = {};
    const checkboxFieldMappings = {};
    const dropdownFieldMappings = {};
    const associations = [];

    for (const field of fieldsArray) {
      const {
        name: columnName,
        data_type,
        max_length,
        not_null,
        default_value,
        options,
        type,
        table,
        forign_key,
        attributes,
      } = field;

      const sequelizeType =
        data_type?.toUpperCase() === "VARCHAR" && max_length
          ? Sequelize.DataTypes.STRING(max_length)
          : Sequelize.DataTypes[data_type?.toUpperCase()] ||
            Sequelize.DataTypes.STRING;

      fields[columnName] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
      };

      if (type === "radio" && Array.isArray(options)) {
        radioFieldMappings[columnName] = options.reduce((acc, option) => {
          acc[option.code] = option.name;
          return acc;
        }, {});
      }

      if (type === "checkbox" && Array.isArray(options)) {
        checkboxFieldMappings[columnName] = options.reduce((acc, option) => {
          acc[option.code] = option.name;
          return acc;
        }, {});
      }

      if (type === "dropdown" && Array.isArray(options)) {
        dropdownFieldMappings[columnName] = options.reduce((acc, option) => {
          acc[option.code] = option.name;
          return acc;
        }, {});
      }

      if (table && forign_key && attributes) {
        associations.push({
          relatedTable: table,
          foreignKey: columnName,
          targetAttribute: attributes,
        });
      }
    }

    const DynamicTable = sequelize.define(table_name, fields, {
      freezeTableName: true,
      timestamps: true,
    });

    const include = [];
    for (const association of associations) {
      const RelatedModel = require(`../models`)[association.relatedTable];
      if (RelatedModel) {
        DynamicTable.belongsTo(RelatedModel, {
          foreignKey: association.foreignKey,
          as: `${association.relatedTable}Details`,
        });

        include.push({
          model: RelatedModel,
          as: `${association.relatedTable}Details`,
          attributes: association.targetAttribute || {
            exclude: ["created_date", "modified_date"],
          },
        });
      }
    }

    const result = await DynamicTable.findOne({
      where: { id },
      attributes: ["id", ...Object.keys(fields)],
      include,
    });

    if (!result) {
      return userSendResponse(
        res,
        404,
        false,
        `Record with ID ${id} not found in ${table_name}.`,
        null
      );
    }

    let data = result.toJSON();

    for (const fieldName in radioFieldMappings) {
      if (
        data[fieldName] !== undefined &&
        radioFieldMappings[fieldName][data[fieldName]]
      ) {
        data[fieldName] = radioFieldMappings[fieldName][data[fieldName]];
      }
    }

    for (const fieldName in checkboxFieldMappings) {
      if (data[fieldName]) {
        const codes = data[fieldName].split(",").map((code) => code.trim());
        data[fieldName] = codes
          .map((code) => checkboxFieldMappings[fieldName][code] || code)
          .join(", ");
      }
    }

    for (const fieldName in dropdownFieldMappings) {
      if (
        data[fieldName] !== undefined &&
        dropdownFieldMappings[fieldName][data[fieldName]]
      ) {
        data[fieldName] = dropdownFieldMappings[fieldName][data[fieldName]];
      }
    }

    // Fetch Profile Organization or Leader ID if applicable
    if (tableTemplate.is_link_to_organization) {
      const profileOrganization = await ProfileOrganization.findOne({
        where: { template_id: tableTemplate.template_id, table_row_id: id },
        attributes: ["organization_id"],
      });
      if (profileOrganization) {
        data.organization_id = profileOrganization.organization_id;
      }
    }

    if (tableTemplate.is_link_to_leader) {
      const profileLeader = await ProfileLeader.findOne({
        where: { template_id: tableTemplate.template_id, table_row_id: id },
        attributes: ["leader_id"],
      });
      if (profileLeader) {
        data.leader_id = profileLeader.leader_id;
      }
    }

    // const attachments = await ProfileAttachment.findAll({
    //     where: {
    //         template_id: tableTemplate.template_id,
    //         table_row_id: data.id,
    //     },
    //     order: [['created_at', 'DESC']]
    // });

    // if (attachments.length) {
    //     data.attachments = attachments.map(att => att.toJSON());
    // }

    for (const association of associations) {
      const alias = `${association.relatedTable}Details`;
      if (data[alias]) {
        Object.entries(data[alias]).forEach(([key, value]) => {
          data[association.foreignKey] = value;
          delete data[alias];
        });
      }
    }
    // if (userId) {
    //     await TemplateUserStatus.findOrCreate({
    //         where: {
    //             template_id: tableTemplate.template_id,
    //             table_row_id: id,
    //             user_id: userId
    //         },
    //         defaults: {
    //             created_at: new Date(),
    //             updated_at: new Date()
    //         }
    //     });

    // }
    // await ActivityLog.create({
    //     template_id: tableTemplate.template_id,
    //     table_row_id: id,
    //     user_id: actorId,
    //     actor_name: actorName,
    //     activity: `Viewed `,
    // });

    return userSendResponse(res, 200, true, "Data fetched successfully", data);
  } catch (error) {
    console.error("Error fetching view data:", error);
    return userSendResponse(res, 500, false, "Server error", error);
  }
};

exports.deleteTemplateData = async (req, res, next) => {
  let dirPath = "";
  try {
    const { table_name, where, transaction_id } = req.body;
    const userId = req.user?.user_id || null;
    // const userId = res.locals.user_id || null;
    // const adminUserId = res.locals.admin_user_id || null;
    // const actorId = userId || adminUserId;

    // const adminUserName = await admin_user.findOne({
    //     where: { admin_user_id: adminUserId },
    //     attributes: ['full_name']
    // });

    // const userName = await user.findOne({
    //     where: { user_id: userId },
    //     attributes: ['user_firstname']
    // });
    // const actorName = adminUserName?.full_name || userName?.user_firstname;
    const actorName = "abc";
    // Retrieve table Template
    const tableData = await Template.findOne({
      where: { table_name },
    });

    if (!tableData) {
      return userSendResponse(
        res,
        400,
        false,
        "Requested table does not exist.",
        null
      );
    }

    dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
    if (fs.existsSync(dirPath))
      return res
        .status(400)
        .json({ success: false, message: "Duplicate transaction detected." });
    fs.mkdirSync(dirPath, { recursive: true });

    // Parse fields since it is stored as JSON string
    let fields;
    try {
      fields = JSON.parse(tableData.fields);
    } catch (err) {
      return userSendResponse(
        res,
        500,
        false,
        "Invalid fields format in template.",
        null
      );
    }

    const modelAttributes = {};
    let hasDeletedAt = false; // Track if 'deleted_at' column exists

    fields.forEach((field) => {
      const {
        name: fieldName,
        data_type,
        not_null,
        default_value,
        max_length,
      } = field;

      if (fieldName === "deleted_at") {
        hasDeletedAt = true; // Mark if 'deleted_at' exists
      }

      let sequelizeType;
      if (data_type && data_type.toUpperCase() === "VARCHAR" && max_length) {
        sequelizeType = Sequelize.DataTypes.STRING(max_length);
      } else if (data_type) {
        sequelizeType =
          Sequelize.DataTypes[data_type.toUpperCase()] ||
          Sequelize.DataTypes.STRING;
      } else {
        sequelizeType = Sequelize.DataTypes.STRING;
      }

      modelAttributes[fieldName] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
      };
    });

    // Define the model using Sequelize
    const Model = sequelize.define(table_name, modelAttributes, {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at", // Map 'deleted_at' if it exists
    });

    // Sync model to ensure schema exists in the database
    await Model.sync();

    // Check if the data exists for the provided 'where' condition
    const data = await Model.findOne({ where });

    if (!data) {
      return userSendResponse(res, 200, false, "Data not found.", null);
    }

    if (hasDeletedAt) {
      // If 'deleted_at' exists, check if the data is soft deleted
      if (data.deleted_at) {
        // Restore the record by setting deleted_at to null
        await Model.update({ deleted_at: null }, { where });
        // await ActivityLog.create({
        //     template_id: tableData.template_id,
        //     table_row_id: data.id,
        //     user_id: actorId,
        //     activity: `Restored`,
        // });
        return userSendResponse(
          res,
          200,
          true,
          `Data from table ${table_name} restored successfully.`,
          null
        );
      } else {
        // Soft delete (set deleted_at timestamp)
        await Model.update({ deleted_at: new Date() }, { where });
        // await ActivityLog.create({
        //     template_id: tableData.template_id,
        //     table_row_id: data.id,
        //     user_id: actorId,
        //     actor_name: actorName,
        //     activity: `Deleted`,
        // });
        return userSendResponse(
          res,
          200,
          true,
          `Data from table ${table_name} soft deleted successfully.`,
          null
        );
      }
    } else {
      // Hard delete if 'deleted_at' does not exist
      await Model.destroy({ where });

      // Delete corresponding entries from related tables
      // await ProfileAttachment.destroy({
      //     where: {
      //         template_id: tableData.template_id,
      //         table_row_id: data.id,
      //     },
      // });

      // await ActivityLog.destroy({
      //     where: {
      //         template_id: tableData.template_id,
      //         table_row_id: data.id,
      //     },
      // });

      // await ProfileHistory.destroy({
      //     where: {
      //         template_id: tableData.template_id,
      //         table_row_id: data.id,
      //     },

      // });

      await TemplateUserStatus.destroy({
          where: {
              template_id: tableData.template_id,
              table_row_id: data.id,
          },
      });

      await CaseHistory.destroy({
            where: {
                template_id: tableData.template_id,
                table_row_id: data.id,
            },
        });

      return userSendResponse(
        res,
        200,
        true,
        `Data deleted successfully.`,
        null
      );
    }
  } catch (error) {
    console.error("Error deleting data:", error.message);
    return userSendResponse(res, 500, false, "Server error.", error.message);
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

exports.paginateTemplateData = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      sort_by = "template_id",
      order = "DESC",
      search = "",
      search_field = "",
      table_name,
      is_starred = false,
      is_read = "",
    } = req.body;
    const { filter = {}, from_date = null, to_date = null } = req.body;
    const userId = req.user?.user_id || null;

    if (!table_name) {
      return userSendResponse(res, 400, false, "Table name is required.", null);
    }

    const tableTemplate = await Template.findOne({ where: { table_name } });
    if (!tableTemplate) {
      return userSendResponse(
        res,
        404,
        false,
        `Table ${table_name} does not exist.`,
        null
      );
    }

    let fieldsArray;
    try {
      fieldsArray =
        typeof tableTemplate.fields === "string"
          ? JSON.parse(tableTemplate.fields)
          : tableTemplate.fields;
    } catch (err) {
      console.error("Error parsing fields:", err);
      return userSendResponse(
        res,
        500,
        false,
        "Invalid table schema format.",
        null
      );
    }

    if (!Array.isArray(fieldsArray)) {
      return userSendResponse(
        res,
        500,
        false,
        "Fields must be an array in the table schema.",
        null
      );
    }

    const fields = {};
    const associations = [];
    const radioFieldMappings = {};
    const checkboxFieldMappings = {};
    const dropdownFieldMappings = {};

    // Store field configurations by name for easy lookup
    const fieldConfigs = {};

    for (const field of fieldsArray) {
      const {
        name: columnName,
        data_type,
        max_length,
        not_null,
        default_value,
        table,
        forign_key,
        attributes,
        options,
        type,
        table_display_content,
      } = field;

      if (!table_display_content) continue; // Filter out fields not marked for display

      // Store the complete field configuration for reference
      fieldConfigs[columnName] = field;

      const sequelizeType =
        data_type?.toUpperCase() === "VARCHAR" && max_length
          ? Sequelize.DataTypes.STRING(max_length)
          : Sequelize.DataTypes[data_type?.toUpperCase()] ||
            Sequelize.DataTypes.STRING;

      fields[columnName] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
        displayContent: table_display_content,
      };

      if (type === "radio" && Array.isArray(options)) {
        radioFieldMappings[columnName] = options.reduce((acc, option) => {
          acc[option.code] = option.name;
          return acc;
        }, {});
      }

      if (type === "checkbox" && Array.isArray(options)) {
        checkboxFieldMappings[columnName] = options.reduce((acc, option) => {
          acc[option.code] = option.name;
          return acc;
        }, {});
      }

      if (
        (type === "dropdown" ||
          type === "multidropdown" ||
          type === "autocomplete") &&
        Array.isArray(options)
      ) {
        dropdownFieldMappings[columnName] = options.reduce((acc, option) => {
          acc[option.code] = option.name;
          return acc;
        }, {});
      }

      if (table && forign_key && attributes) {
        associations.push({
          relatedTable: table,
          foreignKey: columnName,
          targetAttribute: attributes,
        });
      }
    }

    const DynamicTable = sequelize.define(table_name, fields, {
      freezeTableName: true,
      timestamps: true,
    });

    const include = [];
    for (const association of associations) {
      const RelatedModel = require(`../models`)[association.relatedTable];
      if (RelatedModel) {
        DynamicTable.belongsTo(RelatedModel, {
          foreignKey: association.foreignKey,
          as: `${association.relatedTable}Details`,
        });

        include.push({
          model: RelatedModel,
          as: `${association.relatedTable}Details`,
          attributes: association.targetAttribute || {
            exclude: ["created_date", "modified_date"],
          },
        });
      }
    }

    // // Add TemplateStar association
    // DynamicTable.hasOne(db.TemplateStar, {
    //     foreignKey: 'table_row_id',
    //     sourceKey: 'id',
    //     as: 'Starred',
    //     constraints: false,
    // });

    // Add TemplateUserStatus association
    DynamicTable.hasOne(db.TemplateUserStatus, {
        foreignKey: 'table_row_id',
        sourceKey: 'id',
        as: 'ReadStatus',
        constraints: false,
    });

    // include.push({
    //     model: db.TemplateStar,
    //     as: 'Starred',
    //     required: is_starred,  // Only include if filtering by starred
    //     where: {
    //         user_id: userId,
    //         template_id: tableTemplate.template_id
    //     },
    //     attributes: ['template_star_id']
    // });

    include.push({
        model: db.TemplateUserStatus,
        as: 'ReadStatus',
        required: is_read,
        where: {
            user_id: userId,
            template_id: tableTemplate.template_id
        },
        attributes: ['template_user_status_id']
    });

    const offset = (page - 1) * limit;
    const Op = Sequelize.Op;
    const whereClause = {};

    // Apply field filters if provided
    if (filter && typeof filter === "object") {
      Object.entries(filter).forEach(([key, value]) => {
        if (fields[key]) {
          // Assuming 'fields' contains the field definitions
          whereClause[key] = value; // Direct match for foreign key fields
        }
      });
    }

    // Apply date range filter if provided
    // if (from_date || to_date) {
    //     whereClause["created_at"] = {};
    //     if (from_date) {
    //         whereClause["created_at"][Op.gte] = new Date(from_date);
    //     }
    //     if (to_date) {
    //         whereClause["created_at"][Op.lte] = new Date(to_date);
    //     }
    // }
    if (from_date || to_date) {
      whereClause["created_at"] = {};

      if (from_date) {
        whereClause["created_at"][Op.gte] = new Date(
          `${from_date}T00:00:00.000Z`
        );
      }
      if (to_date) {
        whereClause["created_at"][Op.lte] = new Date(
          `${to_date}T23:59:59.999Z`
        );
      }
    }

    if (is_read === false) {
      whereClause["$ReadStatus.template_user_status_id$"] = { [Op.is]: null }; // Filter only unread records
    }

    if (search) {
      const searchConditions = [];

      if (search_field && fields[search_field]) {
        // Specific field search
        const fieldConfig = fieldConfigs[search_field];
        const fieldType = fields[search_field].type.key;
        const isForeignKey = associations.some(
          (assoc) => assoc.foreignKey === search_field
        );

        // Handle field type based search
        if (["STRING", "TEXT"].includes(fieldType)) {
          searchConditions.push({
            [search_field]: { [Op.iLike]: `%${search}%` },
          });
        } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
          if (!isNaN(search)) {
            searchConditions.push({ [search_field]: parseInt(search, 10) });
          }
        } else if (fieldType === "BOOLEAN") {
          const boolValue = search.toLowerCase() === "true";
          searchConditions.push({ [search_field]: boolValue });
        } else if (fieldType === "DATE") {
          const parsedDate = Date.parse(search);
          if (!isNaN(parsedDate)) {
            searchConditions.push({ [search_field]: new Date(parsedDate) });
          }
        }

        // Handle dropdown, radio, checkbox special searches
        if (
          fieldConfig &&
          fieldConfig.type === "dropdown" &&
          Array.isArray(fieldConfig.options)
        ) {
          // Find option code that matches the search text
          const matchingOption = fieldConfig.options.find((option) =>
            option.name.toLowerCase().includes(search.toLowerCase())
          );

          if (matchingOption) {
            searchConditions.push({ [search_field]: matchingOption.code });
          }
        }

        if (
          fieldConfig &&
          fieldConfig.type === "radio" &&
          Array.isArray(fieldConfig.options)
        ) {
          // Find option code that matches the search text
          const matchingOption = fieldConfig.options.find((option) =>
            option.name.toLowerCase().includes(search.toLowerCase())
          );

          if (matchingOption) {
            searchConditions.push({ [search_field]: matchingOption.code });
          }
        }

        // Handle foreign keys
        if (isForeignKey) {
          const association = associations.find(
            (assoc) => assoc.foreignKey === search_field
          );
          if (association) {
            // Get the included model from the include array
            const associatedModel = include.find(
              (inc) => inc.as === `${association.relatedTable}Details`
            );

            // Only add the condition if the model is properly included
            if (associatedModel) {
              searchConditions.push({
                [`$${association.relatedTable}Details.${association.targetAttribute}$`]:
                  { [Op.iLike]: `%${search}%` },
              });
            }
          }
        }
      } else {
        // General search across all fields
        Object.keys(fields).forEach((field) => {
          const fieldConfig = fieldConfigs[field];
          const fieldType = fields[field].type.key;
          const isForeignKey = associations.some(
            (assoc) => assoc.foreignKey === field
          );

          // Standard text and numeric search
          if (["STRING", "TEXT"].includes(fieldType)) {
            searchConditions.push({ [field]: { [Op.iLike]: `%${search}%` } });
          } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
            if (!isNaN(search)) {
              searchConditions.push({ [field]: parseInt(search, 10) });
            }
          }

          // Dropdown, radio, checkbox search
          if (
            fieldConfig &&
            fieldConfig.type === "dropdown" &&
            Array.isArray(fieldConfig.options)
          ) {
            // Find option code that matches the search text
            const matchingOption = fieldConfig.options.find((option) =>
              option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
              searchConditions.push({ [field]: matchingOption.code });
            }
          }

          if (
            fieldConfig &&
            fieldConfig.type === "radio" &&
            Array.isArray(fieldConfig.options)
          ) {
            // Find option code that matches the search text
            const matchingOption = fieldConfig.options.find((option) =>
              option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
              searchConditions.push({ [field]: matchingOption.code });
            }
          }

          // Foreign key search
          if (isForeignKey) {
            const association = associations.find(
              (assoc) => assoc.foreignKey === field
            );
            if (association) {
              // Get the included model from the include array
              const associatedModel = include.find(
                (inc) => inc.as === `${association.relatedTable}Details`
              );

              // Only add the condition if the model is properly included
              if (associatedModel) {
                searchConditions.push({
                  [`$${association.relatedTable}Details.${association.targetAttribute}$`]:
                    { [Op.iLike]: `%${search}%` },
                });
              }
            }
          }
        });
      }

      if (searchConditions.length > 0) {
        whereClause[Op.or] = searchConditions;
      }
    }

    const validSortBy = fields[sort_by] ? sort_by : "created_at";

    const result = await DynamicTable.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[validSortBy, order.toUpperCase()]],
      attributes: [
        "id",
        ...Object.keys(fields).filter((field) => fields[field].displayContent),
      ],
      include,
    });

    const totalItems = result.count;
    const totalPages = Math.ceil(totalItems / limit);

    const transformedRows = await Promise.all(
      result.rows.map(async (record) => {
        const data = record.toJSON();

        // Map radio, checkbox, and dropdown fields to display values
        for (const fieldName in radioFieldMappings) {
          if (
            data[fieldName] !== undefined &&
            radioFieldMappings[fieldName][data[fieldName]]
          ) {
            data[fieldName] = radioFieldMappings[fieldName][data[fieldName]];
          }
        }
        for (const fieldName in checkboxFieldMappings) {
          if (data[fieldName]) {
            const codes = data[fieldName].split(",").map((code) => code.trim());
            data[fieldName] = codes
              .map((code) => checkboxFieldMappings[fieldName][code] || code)
              .join(", ");
          }
        }
        for (const fieldName in dropdownFieldMappings) {
          if (
            data[fieldName] !== undefined &&
            dropdownFieldMappings[fieldName][data[fieldName]]
          ) {
            data[fieldName] = dropdownFieldMappings[fieldName][data[fieldName]];
          }
        }

        // Fetch attachments related to this row
        const attachments = await ProfileAttachment.findAll({
          where: {
            template_id: tableTemplate.template_id,
            table_row_id: data.id,
          },
          order: [["created_at", "DESC"]],
        });

        if (attachments.length) {
          data.attachments = attachments.map((att) => att.toJSON());
        }

        data.ReadStatus = data.ReadStatus ? true : false;
        // Handle alias mappings before processing associations
        // for (const association of associations) {
        //     const alias = `${association.relatedTable}Details`;
        //     if (data[alias]) {
        //         Object.entries(data[alias]).forEach(([key, value]) => {
        //             data[association.foreignKey] = value;
        //         });
        //         delete data[alias]; // Remove unnecessary alias object from response
        //     }
        // }

        // Fetch linked profile info manually
        const linkedProfileInfo = [];

        // for (const association of associations) {
        //     const foreignKeyValue = data[association.foreignKey];

        //     if (foreignKeyValue) {
        //         try {
        //             // Fetch associated table metadata from the Template model
        //             const associatedTemplate = await Template.findOne({
        //                 where: {
        //                     table_name: association.relatedTable,  // Ensure the correct table name
        //                 },
        //                 attributes: ['template_type'],
        //             });

        //             // Check if the table name starts with "da" and template_type is not "master"
        //             if (associatedTemplate && association.relatedTable.startsWith("da") && associatedTemplate.template_type !== "master") {
        //                 const [linkedRow] = await sequelize.query(
        //                     `SELECT id FROM ${association.relatedTable} WHERE ${association.targetAttribute} = :foreignKeyValue LIMIT 1`,
        //                     {
        //                         replacements: { foreignKeyValue },
        //                         type: Sequelize.QueryTypes.SELECT
        //                     }
        //                 );

        //                 if (linkedRow && linkedRow.id) {
        //                     linkedProfileInfo.push({
        //                         table: association.relatedTable,
        //                         id: linkedRow.id,
        //                         field: association.foreignKey
        //                     });
        //                 }
        //             }
        //         } catch (error) {
        //             console.error(`Error fetching linked profile info for ${association.relatedTable}:`, error);
        //         }
        //     }
        // }

        // Add linked profile info to the response
        // data.linked_profile_info = linkedProfileInfo.length ? linkedProfileInfo : null;

        return data;
      })
    );

    const responseData = {
      // data: transformedRows,
      data: transformedRows.map((row) => ({
        ...row,
        created_by: tableTemplate.created_by,
      })),
      columns: [
        ...fieldsArray.map((field) => ({
          name: field.name,
        })),
        // Manually adding created_at and updated_at timestamps
        {
          name: "created_at",
        },
        {
          name: "updated_at",
        },
      ],

      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        sort_by: validSortBy,
        order,
      },
    };

    return userSendResponse(
      res,
      200,
      true,
      "Data fetched successfully",
      responseData
    );
  } catch (error) {
    console.error("Error fetching paginated data:", error);
    return userSendResponse(res, 500, false, "Server error", error);
  }
};

exports.paginateTemplateDataForOtherThanMaster = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      sort_by,
      order = "DESC",
      search = "",
      search_field = "",
      template_module = "",
      sys_status,
      is_starred = false,
      is_read = "",
      get_sys,
    } = req.body;
    const { filter = {}, from_date = null, to_date = null } = req.body;
    const { user_id } = req.user;
    const userId = user_id;
    const offset = (page - 1) * limit;
    const whereClause = {};

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> starting UV");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",new Date().toString());

    // // Fetch designations for the logged-in user
    // const userDesignations = await UserDesignation.findAll({
    // where: { user_id },
    // attributes: ["designation_id"],
    // });
    // if (!userDesignations.length) {
    // return res
    //     .status(404)
    //     .json({ message: "User has no designations assigned" });
    // }
    // const supervisorDesignationIds = userDesignations.map((ud) => ud.designation_id);

    // // Fetch subordinates based on supervisor designations
    // const subordinates = await UsersHierarchy.findAll({
    // where: { supervisor_designation_id: { [Op.in]: supervisorDesignationIds } },
    // attributes: ["officer_designation_id"],
    // });
    // const officerDesignationIds = subordinates.map((sub) => sub.officer_designation_id);

    // // Fetch subordinate user IDs if any officer designations found
    // let subordinateUserIds = [];
    // if (officerDesignationIds.length) {
    // const subordinateUsers = await UserDesignation.findAll({
    //     where: { designation_id: { [Op.in]: officerDesignationIds } },
    //     attributes: ["user_id"],
    // });
    // subordinateUserIds = subordinateUsers.map((ud) => ud.user_id);
    // }

    // // Combine userId with subordinates and remove duplicates
    // const allowedUserIds = Array.from(new Set([userId, ...subordinateUserIds]));

    const { allowedUserIds = [] , getDataBasesOnUsers = false , allowedDivisionIds = [] , allowedDepartmentIds = []} = req.body; // Default to empty array if not provided

    const normalizedDivisionIds = normalizeValues(allowedDivisionIds, 'string');
    const normalizedUserIds = normalizeValues(allowedUserIds, 'string');

    if (!getDataBasesOnUsers) {
        if (allowedDivisionIds.length > 0) {
            if (["ui_case", "pt_case", "eq_case"].includes(template_module)) {
            whereClause["field_division"] = { [Op.in]: normalizedDivisionIds };
            } else {
            whereClause["created_by_id"] = { [Op.in]: normalizedUserIds };
            }
        }
    } else {
        if (allowedUserIds.length > 0) {
            if (["ui_case", "pt_case", "eq_case"].includes(template_module)) {
            whereClause[Op.or] = [
                { created_by_id: { [Op.in]: normalizedUserIds } },
                { field_io_name: { [Op.in]: normalizedUserIds } },
            ];
            } else {
            whereClause["created_by_id"] = { [Op.in]: normalizedUserIds };
            }
        }
    }


    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>After get the higher users UV");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",new Date().toString());

    if (!template_module) {
      return userSendResponse( res, 400, false, "Template module is required", null );
    }

    // Fetch the template using template_module to get the table_name
    const tableTemplate = await Template.findOne({ where: { template_module } });
    if (!tableTemplate) {
      return userSendResponse(res, 400, false, "Template not found", null);
    }
    const table_name = tableTemplate.table_name;
    const template_name = tableTemplate.template_name;

    if (!table_name) {
      return userSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null );
    }

    let fieldsArray;
    try {
      fieldsArray = typeof tableTemplate.fields === "string" ? JSON.parse(tableTemplate.fields) : tableTemplate.fields;
    } catch (err) {
      console.error("Error parsing fields:", err);
      return userSendResponse( res, 500, false, "Invalid table schema format.",null);
    }

    if (!Array.isArray(fieldsArray)) {
      return userSendResponse(res, 500, false, "Fields must be an array in the table schema.", null);
    }

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> After get the template fields UV");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",new Date().toString());

    const fields = {};
    const associations = [];
    const radioFieldMappings = {};
    const checkboxFieldMappings = {};
    const dropdownFieldMappings = {};

    // Store field configurations by name for easy lookup
    const fieldConfigs = {};

    for (const field of fieldsArray) {
      var {
        name: columnName,
        data_type,
        max_length,
        not_null,
        default_value,
        table,
        forign_key,
        attributes,
        options,
        type,
        table_display_content,
      } = field;

      if (!table_display_content) continue; // Filter out fields not marked for display

      // Store the complete field configuration for reference
      fieldConfigs[columnName] = field;

      const sequelizeType =
        data_type?.toUpperCase() === "VARCHAR" && max_length
          ? Sequelize.DataTypes.STRING(max_length)
          : Sequelize.DataTypes[data_type?.toUpperCase()] ||
            Sequelize.DataTypes.STRING;

      fields[columnName] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
        displayContent: table_display_content,
      };

      if(attributes && attributes.length > 0) 
      {
        if(table && forign_key && attributes) {
            attributes.push(forign_key); // Add the primary key to the attributes array
        }
        options = [];
        if(table ==="users") {
            IOData = await Users.findAll({
                where: {dev_status: true},
                include: [
                    {
                        model: Role,
                        as: "role",
                        attributes: ["role_id", "role_title"],
                        where: {
                            role_id: {
                                [Op.notIn]: excluded_role_ids,
                            },
                        },
                    },
                    {
                        model: KGID,
                        as: "kgidDetails",
                        attributes: [ "name"],
                    },
                ],
                attributes: ["user_id"],
                raw: true,
                nest: true,
            });
            if(IOData.length > 0) {
                IOData.forEach((result) => {
                    var code = result["user_id"];
                    var name = result["kgidDetails"]["name"] || '';
                    options.push({ code, name });
                });
            }
        }
        else
        {
            //get the table primary key value of the table
            var query = `SELECT ${attributes}  FROM ${table}`;
            const [results, metadata] = await sequelize.query(query);
            if(results.length > 0) {
                results.forEach((result) => {
                        if(result[forign_key]) {
                            var code = result[forign_key];
                            var name  = '';
                            attributes.forEach((attribute) => {
                                if(attribute !== forign_key) {
                                    name = result[attribute];
                                }
                            });
                            options.push({ code, name });
                        }
                    });
            }
        }
      }

      if (type === "radio" && Array.isArray(options)) {
        radioFieldMappings[columnName] = options.reduce((acc, option) => {
          acc[option.code] = option.name;
          return acc;
        }, {});
      }

      if (type === "checkbox" && Array.isArray(options)) {
        checkboxFieldMappings[columnName] = options.reduce((acc, option) => {
          acc[option.code] = option.name;
          return acc;
        }, {});
      }

      if ( (type === "dropdown" || type === "multidropdown" || type === "autocomplete") && Array.isArray(options)) {
        dropdownFieldMappings[columnName] = options.reduce((acc, option) => {
          acc[option.code] = option.name;
          return acc;
        }, {});
      }

      if (table && forign_key && attributes) {
        associations.push({
          relatedTable: table,
          foreignKey: columnName,
          targetAttribute: attributes,
        });
      }
    }

    const DynamicTable = sequelize.define(table_name, fields, {
      freezeTableName: true,
      timestamps: true,
    });

    const include = [];
    for (const association of associations) {
      const RelatedModel = require(`../models`)[association.relatedTable];
      if (RelatedModel) {
        DynamicTable.belongsTo(RelatedModel, {
          foreignKey: association.foreignKey,
          as: `${association.relatedTable}Details`,
        });

        include.push({
          model: RelatedModel,
          as: `${association.relatedTable}Details`,
          attributes: association.targetAttribute || {
            exclude: ["created_date", "modified_date"],
          },
        });
      }
    }

    // // Add TemplateStar association
    // DynamicTable.hasOne(db.TemplateStar, {
    //     foreignKey: 'table_row_id',
    //     sourceKey: 'id',
    //     as: 'Starred',
    //     constraints: false,
    // });

    // Add TemplateUserStatus association
    // DynamicTable.hasOne(db.TemplateUserStatus, {
    //     foreignKey: 'table_row_id',
    //     sourceKey: 'id',
    //     as: 'ReadStatus',
    //     constraints: false,
    // });

    // include.push({
    //     model: db.TemplateStar,
    //     as: 'Starred',
    //     required: is_starred,  // Only include if filtering by starred
    //     where: {
    //         user_id: userId,
    //         template_id: tableTemplate.template_id
    //     },
    //     attributes: ['template_star_id']
    // });

    // include.push({
    //     model: db.TemplateUserStatus,
    //     as: 'ReadStatus',
    //     required: is_read,
    //     where: {
    //         user_id: userId,
    //         template_id: tableTemplate.template_id
    //     },
    //     attributes: ['template_user_status_id']
    // });

    // Apply field filters if provided
    if (filter && typeof filter === "object") {
      Object.entries(filter).forEach(([key, value]) => {
        if (fields[key]) {

          if (key === "field_io_name" && filter[key] == "") {
              whereClause[key] = {
                  [Op.or]: [
                      '',
                      { [Op.is]: null }
                  ]
              };
          }
          else{
            whereClause[key] = value; // Direct match for foreign key fields
          }
        }
      });
    }

    if (from_date || to_date) {
      whereClause["created_at"] = {};

      if (from_date) {
        whereClause["created_at"][Op.gte] = new Date(
          `${from_date}T00:00:00.000Z`
        );
      }
      if (to_date) {
        whereClause["created_at"][Op.lte] = new Date(
          `${to_date}T23:59:59.999Z`
        );
      }
    }

    if (is_read === false) {
      whereClause["$ReadStatus.template_user_status_id$"] = { [Op.is]: null }; // Filter only unread records
    }

    if (search) {
      const searchConditions = [];

      if (search_field && fields[search_field]) {
        // Specific field search
        const fieldConfig = fieldConfigs[search_field];
        const fieldType = fields[search_field].type.key;
        const isForeignKey = associations.some(
          (assoc) => assoc.foreignKey === search_field
        );

        // Handle field type based search
        if (["STRING", "TEXT"].includes(fieldType)) {
          searchConditions.push({
            [search_field]: { [Op.iLike]: `%${search}%` },
          });
        } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
          if (!isNaN(search)) {
            searchConditions.push({ [search_field]: parseInt(search, 10) });
          }
        } else if (fieldType === "BOOLEAN") {
          const boolValue = search.toLowerCase() === "true";
          searchConditions.push({ [search_field]: boolValue });
        } else if (fieldType === "DATE") {
          const parsedDate = Date.parse(search);
          if (!isNaN(parsedDate)) {
            searchConditions.push({ [search_field]: new Date(parsedDate) });
          }
        }

        // Handle dropdown, radio, checkbox special searches
        if (
          fieldConfig &&
          fieldConfig.type === "dropdown" &&
          Array.isArray(fieldConfig.options)
        ) {
          // Find option code that matches the search text
          const matchingOption = fieldConfig.options.find((option) =>
            option.name.toLowerCase().includes(search.toLowerCase())
          );

          if (matchingOption) {
            searchConditions.push({ [search_field]: matchingOption.code });
          }
        }

        if (
          fieldConfig &&
          fieldConfig.type === "radio" &&
          Array.isArray(fieldConfig.options)
        ) {
          // Find option code that matches the search text
          const matchingOption = fieldConfig.options.find((option) =>
            option.name.toLowerCase().includes(search.toLowerCase())
          );

          if (matchingOption) {
            searchConditions.push({ [search_field]: matchingOption.code });
          }
        }

        // Handle foreign keys
        if (isForeignKey) {
          const association = associations.find(
            (assoc) => assoc.foreignKey === search_field
          );
          if (association) {
            // Get the included model from the include array
            const associatedModel = include.find(
              (inc) => inc.as === `${association.relatedTable}Details`
            );

            // Only add the condition if the model is properly included
            if (associatedModel) {
              searchConditions.push({
                [`$${association.relatedTable}Details.${association.targetAttribute}$`]:
                  { [Op.iLike]: `%${search}%` },
              });
            }
          }
        }
      } else {
        // General search across all fields
        Object.keys(fields).forEach((field) => {
          const fieldConfig = fieldConfigs[field];
          const fieldType = fields[field].type.key;
          const isForeignKey = associations.some(
            (assoc) => assoc.foreignKey === field
          );

          // Standard text and numeric search
          if (["STRING", "TEXT"].includes(fieldType)) {
            searchConditions.push({ [field]: { [Op.iLike]: `%${search}%` } });
          } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
            if (!isNaN(search)) {
              searchConditions.push({ [field]: parseInt(search, 10) });
            }
          }

          // Dropdown, radio, checkbox search
          if (
            fieldConfig &&
            fieldConfig.type === "dropdown" &&
            Array.isArray(fieldConfig.options)
          ) {
            // Find option code that matches the search text
            const matchingOption = fieldConfig.options.find((option) =>
              option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
              searchConditions.push({ [field]: matchingOption.code });
            }
          }

          if (
            fieldConfig &&
            fieldConfig.type === "radio" &&
            Array.isArray(fieldConfig.options)
          ) {
            // Find option code that matches the search text
            const matchingOption = fieldConfig.options.find((option) =>
              option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
              searchConditions.push({ [field]: matchingOption.code });
            }
          }

          // Foreign key search
          if (isForeignKey) {
            const association = associations.find(
              (assoc) => assoc.foreignKey === field
            );
            if (association) {
              // Get the included model from the include array
              const associatedModel = include.find(
                (inc) => inc.as === `${association.relatedTable}Details`
              );

              // Only add the condition if the model is properly included
              if (associatedModel) {
                searchConditions.push({
                  [`$${association.relatedTable}Details.${association.targetAttribute}$`]:
                    { [Op.iLike]: `%${search}%` },
                });
              }
            }
          }
        });
      }

      if (template_module === "ui_case" || template_module === "pt_case" || template_module === "eq_case") {
        whereClause[Op.and] = [
            {
            [Op.or]: [
                { created_by_id: { [Op.in]: allowedUserIds } },
                { field_io_name: { [Op.in]: allowedUserIds } },
            ],
            },
        ];
        } else {
        whereClause[Op.and] = [
            { created_by_id: { [Op.in]: allowedUserIds } },
        ];
        }

        // Then add searchConditions if any
        if (searchConditions.length > 0) {
        whereClause[Op.and] = [...(whereClause[Op.and] || []), { [Op.or]: searchConditions }];
        }
    }

    const validSortBy = fields[sort_by] ? sort_by : "created_at";

    if (sys_status !== null && sys_status !== undefined && sys_status !== "all") {
      whereClause["sys_status"] = sys_status;
    }

    // Create base attributes array
    let attributesArray = [];

    // Add sys_status only if get_sys is true
    if (get_sys) {
        attributesArray.push("sys_status");
    }

   // Add other fields from fields object
    attributesArray = [
      ...attributesArray,
      ...Object.keys(fields).filter((field) => fields[field].displayContent),
    ];

    // Add default fields
    attributesArray.push("id", "created_by", "ui_case_id", "pt_case_id");

    // Ensure valid sort order
    const sortOrder = ["ASC", "DESC"].includes(order?.toUpperCase()) ? order.toUpperCase() : "DESC";

    // Run Sequelize query
    const result = await DynamicTable.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [[col(validSortBy), sortOrder]],  // Use col() to handle sorting safely
    attributes: attributesArray,
    include,
    logging: console.log,
    });

    const totalItems = result.count;
    const totalPages = Math.ceil(totalItems / limit);
    
    let progressReportTableData = {};
    let progressReportModel = {};
    if(table_name == "cid_under_investigation")
    {
        progressReportTableData =  await Template.findOne({ where:{ table_name: "cid_ui_case_progress_report" } });
    
        if (!progressReportTableData) {
          const message = `Table "Progress Report" does not exist.`;
          return userSendResponse(res, 400, false, message, null);
        }
    
        // Parse the schema fields from Template
        const progressReportschema = typeof progressReportTableData.fields === "string" ? JSON.parse(progressReportTableData.fields) : progressReportTableData.fields;
    
        // Filter fields that have is_primary_field as true
        const progressReportRelevantSchema =  progressReportschema ;
    
        // Define model attributes based on filtered schema
        const progressReportModelAttributes = {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          created_at: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          updated_at: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          created_by: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,  
          } 
        };
    
        const progressReportAssociations = [];
        const progressReportFields = {};
    
        for (const field of progressReportRelevantSchema) {
            const {
                name: columnName,
                data_type,
                not_null,
                default_value,
                table,
                forign_key,
                attributes,
            } = field;
    
            if (!columnName || !data_type) {
                console.warn(
                `Missing required attributes for field ${columnName}. Using default type STRING.`
                );
                progressReportModelAttributes[columnName] = {
                type: Sequelize.DataTypes.STRING,
                allowNull: not_null ? false : true,
                defaultValue: default_value || null,
                };
                continue;
            }
            
            const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
    
            progressReportModelAttributes[columnName] = {
                type: sequelizeType,
                allowNull: not_null ? false : true,
                defaultValue: default_value || null,
            };
    
            progressReportFields[columnName] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
            };
    
            if (table && forign_key && attributes) {
                progressReportAssociations.push({
                relatedTable: table,
                foreignKey: columnName,
                targetAttribute: attributes,
                });
            }
        }

        // Define the model
        progressReportModel = sequelize.define("cid_ui_case_progress_report", progressReportModelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        });

        // Define association (read status)
        progressReportModel.hasOne(db.TemplateUserStatus, {
        foreignKey: 'table_row_id',
        sourceKey: 'id',
        as: 'ReadStatus',
        constraints: false,
        });
    
        // Sync the model
        await progressReportModel.sync();
    }

    const transformedRows = await Promise.all(
      result.rows.map(async (record) => {
        const data = record.toJSON();

        // Map radio, checkbox, and dropdown fields to display values
        for (const fieldName in radioFieldMappings) {
          if (
            data[fieldName] !== undefined &&
            radioFieldMappings[fieldName][data[fieldName]]
          ) {
            data[fieldName] = radioFieldMappings[fieldName][data[fieldName]];
          }
        }
        for (const fieldName in checkboxFieldMappings) {
          if (data[fieldName]) {
            const codes = data[fieldName].split(",").map((code) => code.trim());
            data[fieldName] = codes
              .map((code) => checkboxFieldMappings[fieldName][code] || code)
              .join(", ");
          }
        }
        for (const fieldName in dropdownFieldMappings) {
            if (data[fieldName] !== undefined &&dropdownFieldMappings[fieldName][data[fieldName]]) {
                if(fieldName === "field_io_name")
                {
                    data["field_io_name_id"] = data[fieldName];
                }
                data[fieldName] = dropdownFieldMappings[fieldName][data[fieldName]];
            }
        }

        // Fetch attachments related to this row
        const attachments = await ProfileAttachment.findAll({
          where: {
            template_id: tableTemplate.template_id,
            table_row_id: data.id,
          },
          order: [["created_at", "DESC"]],
        });

        if (attachments.length) {
          data.attachments = attachments.map((att) => att.toJSON());
        }

        data.ReadStatus = data.ReadStatus ? true : false;

        const case_id =  data.id || null;

        let task_read_count = 0;
        let task_unread_count = 0;

        // if(table_name == "cid_under_investigation")
        // {

        //     const {rows: task_all_records, count: task_count } = await progressReportModel.findAndCountAll({
        //         where: {
        //             ui_case_id: case_id,
        //         },
        //     });

        //     const {rows: task_readed_records } = await progressReportModel.findAndCountAll({
        //         where: {
        //             ui_case_id: case_id,  
        //         },
        //         include: {
        //             model: db.TemplateUserStatus,
        //             as: 'ReadStatus',
        //             required: is_read,
        //             where: {
        //                 user_id: userId,
        //                 template_id: progressReportTableData.template_id
        //             },
        //             attributes: ['template_user_status_id']
        //         },
        //     });

        //     if (task_readed_records && task_readed_records.length > 0) {
        //         task_readed_records.forEach((record) => {
        //             const readStatus = record.ReadStatus;
        //             if (readStatus) {
        //                 task_read_count += 1;
        //             }
        //         });
        //     }

        //     if(task_read_count != 0) 
        //         task_unread_count = task_count - task_read_count;
        //     else
        //         task_unread_count = task_count;
        // }

        data.task_unread_count = task_unread_count || 0;

        // Handle alias mappings before processing associations
        for (const association of associations) {
            const alias = `${association.relatedTable}Details`;
            if (data[alias]) {
                Object.entries(data[alias]).forEach(([key, value]) => {
                    data[association.foreignKey] = value;
                });
                delete data[alias]; // Remove unnecessary alias object from response
            }
        }

        // Fetch linked profile info manually
        const linkedProfileInfo = [];

        for (const association of associations) {
            const foreignKeyValue = data[association.foreignKey];

            if (foreignKeyValue) {
                try {
                    // Fetch associated table metadata from the Template model
                    const associatedTemplate = await Template.findOne({
                        where: {
                            table_name: association.relatedTable,  // Ensure the correct table name
                        },
                        attributes: ['template_type'],
                    });

                    // Check if the table name starts with "da" and template_type is not "master"
                    if (associatedTemplate && association.relatedTable.startsWith("da") && associatedTemplate.template_type !== "master") {
                        const [linkedRow] = await sequelize.query(
                            `SELECT id FROM ${association.relatedTable} WHERE ${association.targetAttribute} = :foreignKeyValue LIMIT 1`,
                            {
                                replacements: { foreignKeyValue },
                                type: Sequelize.QueryTypes.SELECT
                            }
                        );

                        if (linkedRow && linkedRow.id) {
                            linkedProfileInfo.push({
                                table: association.relatedTable,
                                id: linkedRow.id,
                                field: association.foreignKey
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching linked profile info for ${association.relatedTable}:`, error);
                }
            }
        }

        // Add linked profile info to the response
        data.linked_profile_info = linkedProfileInfo.length ? linkedProfileInfo : null;

        return data;
      })
    );

    const responseData = {
      // data: transformedRows,
      data: transformedRows.map((row) => ({ ...row })),
      columns: [
        ...fieldsArray.map((field) => ({
          name: field.name,
        })),
        // Manually adding created_at and updated_at timestamps
        {
          name: "created_at",
        },
        {
          name: "updated_at",
        },
      ],

      meta: {
        page,
        limit,
        table_name,
        template_name,
        totalItems,
        totalPages,
        sort_by: validSortBy,
        order,
      },
    };

    return userSendResponse(
      res,
      200,
      true,
      "Data fetched successfully",
      responseData
    );
  } catch (error) {
    console.error("Error fetching paginated data:", error);

    return userSendResponse(res, 500, false, "Server error", error);
  }
};

exports.downloadExcelData = async (req, res) => {
  const { table_name, fields } = req.body;
  const userId = res.locals.user_id || null;
  const adminUserId = res.locals.admin_user_id || null;
  const actorId = userId || adminUserId;

  if (!actorId) {
    return userSendResponse(res, 403, false, "Unauthorized access.", null);
  }

  try {
    const tableData = await Template.findOne({ where: { table_name } });
    if (!tableData) {
      return res.status(404).send(`Table ${table_name} does not exist.`);
    }

    let schema =
      typeof tableData.fields === "string"
        ? JSON.parse(tableData.fields)
        : tableData.fields;

    schema.push(
      {
        name: "created_at",
        label: "Created At",
        data_type: "DATE",
        not_null: false,
      },
      {
        name: "updated_at",
        label: "Updated At",
        data_type: "DATE",
        not_null: false,
      }
    );

    if (fields && Array.isArray(fields) && fields.length > 0) {
      schema = schema.filter((field) => fields.includes(field.name));
    }

    const modelAttributes = {};
    const associations = [];
    const dropdownMappings = {};

    schema.forEach(
      ({
        name,
        data_type,
        not_null,
        table,
        forign_key,
        attributes,
        type,
        options,
      }) => {
        modelAttributes[name] = {
          type:
            Sequelize.DataTypes[data_type.toUpperCase()] ||
            Sequelize.DataTypes.STRING,
          allowNull: !not_null,
        };

        if (table && forign_key && attributes) {
          associations.push({
            relatedTable: table,
            foreignKey: name,
            targetAttributes: attributes,
          });
        }

        if (type === "dropdown" && Array.isArray(options)) {
          dropdownMappings[name] = options.reduce((acc, option) => {
            acc[option.code] = option.name;
            return acc;
          }, {});
        }
      }
    );

    const Model = sequelize.define(table_name, modelAttributes, {
      freezeTableName: true,
      timestamps: true,
      paranoid: false,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    });
    await Model.sync();

    const include = associations
      .map(({ relatedTable, foreignKey, targetAttributes }) => {
        const RelatedModel = require(`../models`)[relatedTable];
        if (RelatedModel) {
          Model.belongsTo(RelatedModel, {
            foreignKey,
            as: `${relatedTable}Details`,
          });

          return {
            model: RelatedModel,
            as: `${relatedTable}Details`,
            attributes: targetAttributes || {
              exclude: ["created_date", "modified_date"],
            },
          };
        }
      })
      .filter(Boolean);

    const columnNames = schema.map((field) => field.name);

    const records = await Model.findAll({
      attributes: columnNames,
      include,
      raw: true,
      nest: true,
    });

    const transformedRows = records.map((record) => {
      const data = { ...record };

      for (const association of associations) {
        const alias = `${association.relatedTable}Details`;
        if (data[alias]) {
          Object.entries(data[alias]).forEach(([key, value]) => {
            data[association.foreignKey] = value;
            delete data[alias];
          });
        }
      }

      for (const field in dropdownMappings) {
        if (data[field] !== undefined && dropdownMappings[field][data[field]]) {
          data[field] = dropdownMappings[field][data[field]];
        }
      }

      return data;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    worksheet.columns = schema.map((field) => ({
      header: field.label || field.name,
      key: field.name,
      width: 20,
    }));
    transformedRows.forEach((record) => worksheet.addRow(record));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${table_name}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error during Excel download:", error);
    return res
      .status(500)
      .send("An error occurred while generating the Excel file.");
  }
};

exports.fetchAndDownloadExcel = async (req, res) => {
  const { file_name } = req.body;

  try {
    // Check if file_name is provided
    if (!file_name) {
      return userSendResponse(res, 400, false, "File name is required.", null);
    }

    // Construct the full file path
    const filePath = path.join(UPLOADS_FOLDER, file_name);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return userSendResponse(
        res,
        404,
        false,
        `File ${file_name} does not exist.`,
        null
      );
    }

    // Set headers for downloading the file
    res.setHeader("Content-Disposition", `attachment; filename=${file_name}`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Create a read stream and pipe it to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Log the success
    console.log(`File ${file_name} is being downloaded.`);
  } catch (error) {
    console.error("Error fetching and downloading Excel file:", error);
    return userSendResponse(
      res,
      500,
      false,
      "Server error occurred while downloading the file.",
      error
    );
  }
};

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require("stream");
const e = require("express");
const { json } = require("stream/consumers");

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  }),
});

exports.downloadDocumentAttachments = async (req, res) => {
  try {
    const profile_attachment = await ProfileAttachment.findOne({
      where: { profile_attachment_id: req.params.profile_attachment_id },
    });

    if (!profile_attachment) {
      return userSendResponse(res, 404, false, `File does not exist.`, null);
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: profile_attachment.s3_key,
    };

    const command = new GetObjectCommand(params);
    const data = await s3Client.send(command);

    // Convert stream to buffer
    const streamToBuffer = async (stream) => {
      const chunks = [];
      for await (let chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    };

    const fileBuffer = await streamToBuffer(data.Body);

    res.setHeader(
      "Content-Type",
      data.ContentType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${profile_attachment.attachment_name}"`
    );
    res.send(fileBuffer);
  } catch (err) {
    if (process.env.APP_ENV === "development") {
      console.error(
        `[${moment().format("DD/MM/YYYY hh:mm:ss a")}]`,
        err.stack || err.message
      );
      const url = `Location of Error: ${req.originalUrl} Method: ${
        req.method
      } Request Body: ${JSON.stringify(req.body)}`;
      console.error(url);
    }
    return userSendResponse(res, 404, false, `File does not exist.`, null);
  }
};

exports.getEventsByOrganization = async (req, res) => {
  const {
    organization_id,
    page = 1,
    per_page = 10,
    filed_name = "modified_date",
    order_by = "ASC",
  } = req.body;

  if (!organization_id) {
    return userSendResponse(
      res,
      400,
      false,
      "organization_id is required",
      null
    );
  }

  try {
    // Explicitly reference the table for orderBy
    const orderBy = Sequelize.literal(`"event"."${filed_name}" ${order_by}`); // Assuming 'event' table's modified_date
    const offset = (page - 1) * per_page;

    // Fetch event IDs associated with the organization
    const eventTagData = await event_tag_organization.findAll({
      attributes: ["event_id"],
      where: { organization_id, is_active: true },
    });

    if (!eventTagData.length) {
      return userSendResponse(
        res,
        404,
        false,
        "No events found for this organization.",
        null
      );
    }

    const eventIds = eventTagData.map((tag) => tag.event_id);

    // Fetch events with event summaries and apply pagination
    const { count, rows: events } = await event.findAndCountAll({
      attributes: ["event_id", "source_of_message", "subject", "description"],
      where: {
        event_id: { [Sequelize.Op.in]: eventIds },
      },
      include: [
        {
          model: event_summary,
          attributes: ["summary"],
          required: false, // Optional; some events might not have a summary
        },
      ],
      order: [orderBy],
      offset,
      limit: per_page,
    });

    if (!events.length) {
      return userSendResponse(
        res,
        404,
        false,
        "No matching events found.",
        null
      );
    }

    const totalPages = Math.ceil(count / per_page);
    const response = {
      current_page: page,
      per_page,
      total_records: count,
      total_pages: totalPages,
      events: events.map((event) => ({
        event_id: event.event_id,
        source_of_message: event.source_of_message,
        subject: event.subject,
        description: event.description,
        event_summary: event.event_summary?.summary || null, // Include event summary if available
      })),
    };

    return userSendResponse(
      res,
      200,
      true,
      "Events fetched successfully",
      response
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return userSendResponse(res, 500, false, "Server error.", error);
  }
};

exports.getEventsByLeader = async (req, res) => {
  const {
    leader_id,
    page = 1,
    per_page = 10,
    filed_name = "modified_date",
    order_by = "ASC",
  } = req.body;

  if (!leader_id) {
    return userSendResponse(res, 400, false, "leader_id is required", null);
  }

  try {
    // Explicitly reference the table for orderBy
    const orderBy = Sequelize.literal(`"event"."${filed_name}" ${order_by}`); // Assuming 'event' table's modified_date
    const offset = (page - 1) * per_page;

    // Fetch event IDs associated with the leader
    const eventTagData = await event_tag_leader.findAll({
      attributes: ["event_id"],
      where: { leader_id, is_active: true },
    });

    if (!eventTagData.length) {
      return userSendResponse(
        res,
        404,
        false,
        "No events found for this leader.",
        null
      );
    }

    const eventIds = eventTagData.map((tag) => tag.event_id);

    // Fetch events with event summaries and apply pagination
    const { count, rows: events } = await event.findAndCountAll({
      attributes: ["event_id", "source_of_message", "subject", "description"],
      where: {
        event_id: { [Sequelize.Op.in]: eventIds },
      },
      include: [
        {
          model: event_summary,
          attributes: ["summary"],
          required: false, // Optional; some events might not have a summary
        },
      ],
      order: [orderBy],
      offset,
      limit: per_page,
    });

    if (!events.length) {
      return userSendResponse(
        res,
        404,
        false,
        "No matching events found.",
        null
      );
    }

    const totalPages = Math.ceil(count / per_page);
    const response = {
      current_page: page,
      per_page,
      total_records: count,
      total_pages: totalPages,
      events: events.map((event) => ({
        event_id: event.event_id,
        source_of_message: event.source_of_message,
        subject: event.subject,
        description: event.description,
        event_summary: event.event_summary?.summary || null,
      })),
    };

    return userSendResponse(
      res,
      200,
      true,
      "Events fetched successfully",
      response
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return userSendResponse(res, 500, false, "Server error.", error);
  }
};

exports.templateDataFieldDuplicateCheck = async (req, res) => {
  const { table_name, data } = req.body;

  if (!table_name) {
    return userSendResponse(res, 400, false, "Table name is required.", null);
  }

  try {
    const tableData = await Template.findOne({ where: { table_name } });

    if (!tableData) {
      return userSendResponse(res, 400, false, `Table ${table_name} does not exist.`, null);
    }

    const schema = typeof tableData.fields === "string"
      ? JSON.parse(tableData.fields)
      : tableData.fields;

    const validData = {};
    const invalidFields = {};

    // Validate and collect valid fields
    for (const key in data) {
      if (
        data.hasOwnProperty(key) &&
        key.trim() !== "" &&
        data[key] !== null &&
        data[key] !== "" &&
        !(typeof data[key] === "string" && data[key].trim() === "")
      ) {
        const field = schema.find((f) => f.name === key);
        if (field) {
          const { not_null } = field;
          if (not_null && data[key] === "") {
            invalidFields[key] = "This field is required.";
          } else {
            validData[key] = data[key];
          }
        } else {
          invalidFields[key] = "Field not defined in schema.";
        }
      }
    }

    if (Object.keys(invalidFields).length > 0) {
      return userSendResponse(
        res,
        400,
        false,
        `Invalid fields: ${Object.keys(invalidFields).join(", ")}`,
        { errors: invalidFields }
      );
    }

    const modelAttributes = {};
    for (const field of schema) {
    const { name, data_type, not_null, default_value } = field;
    const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
    modelAttributes[name] = {
        type: sequelizeType,
        allowNull: !not_null,
        defaultValue: default_value || null,
    };
    }

    const Model = sequelize.define(table_name, modelAttributes, {
        freezeTableName: true,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      });

    modelCache[table_name] = Model;

    // Build where condition for duplicate check
    const conditions = {};
    for (const [key, value] of Object.entries(validData)) {
      if (value !== null && value !== undefined && value !== "") {
        conditions[key] =
          typeof value === "string" ? { [Op.like]: `%${value}%` } : value;
      }
    }

    const existingRecords =
      conditions && Object.keys(conditions).length > 0
        ? await Model.findAll({
            where: conditions,
          })
        : [];

    if (existingRecords.length > 0) {
      return userSendResponse(res, 200, false, "Duplicate values found.");
    }

    return userSendResponse(res, 200, true, "No duplicates found.", null);
  } catch (error) {
    console.error("Error checking duplicate values in fields:", error);
    return userSendResponse(res, 500, false, "Internal Server Error.", error);
  }
};


exports.checkPdfEntry = async (req, res) => {
  const { is_pdf, ui_case_id } = req.body;

  try {
    if (!ui_case_id) {
      return userSendResponse(res, 400, false, "ui_case_id is required.", null);
    }

    // Check if ui_case_id exists in the table
    const caseExists = await UiProgressReportFileStatus.findOne({
      where: { ui_case_id },
    });

    console.log("caseExists", caseExists);
    if (!caseExists) {
      return userSendResponse(
        res,
        404,
        false,
        "Case ID not found in database.",
        null
      );
    }

    // Check if the PDF entry exists for this case ID
    const existingEntry = await UiProgressReportFileStatus.findOne({
      where: { is_pdf, ui_case_id },
    });

    console.log("existingEntry", existingEntry);

    if (existingEntry) {
      return userSendResponse(res, 200, true, "Entry found.", existingEntry);
    } else {
      return userSendResponse(res, 200, true, "No entry found.", null);
    }
  } catch (error) {
    console.error("Error checking PDF entry:", error);
    return userSendResponse(res, 500, false, "Internal Server Error.", error);
  }
};

// Cache for dynamically generated models
const modelCache = {};

exports.caseSysStatusUpdation = async (req, res) => {
  let dirPath = "";
  try {
    const { table_name, data, transaction_id } = req.body;
    const userId = req.user?.user_id || null;
    if (!table_name || !data || typeof data !== "object") {
      return userSendResponse(res, 400, false, "Invalid request format.");
    }
    dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
    if (fs.existsSync(dirPath))
      return res
        .status(400)
        .json({ success: false, message: "Duplicate transaction detected." });
    fs.mkdirSync(dirPath, { recursive: true });

    const { id, sys_status, default_status, ui_case_id, pt_case_id } = data;
    if (!id || !sys_status) {
      return userSendResponse(
        res,
        400,
        false,
        "ID and sys_status are required."
      );
    }

    const recordId = Array.isArray(id) ? id : [id];
    const invalidIds = recordId.filter(val => isNaN(parseInt(val)));
    if (invalidIds.length > 0) {
      return userSendResponse(res, 400, false, "Invalid ID format(s).");
    }


    const tableData = await Template.findOne({ where: { table_name } });
    if (!tableData) {
      return userSendResponse(
        res,
        400,
        false,
        `Table ${table_name} does not exist.`
      );
    }

    const schema =
      typeof tableData.fields === "string"
        ? JSON.parse(tableData.fields)
        : tableData.fields;

    const completeSchema = [
      {
        name: "id",
        data_type: "INTEGER",
        not_null: true,
        primaryKey: true,
        autoIncrement: true,
      },
      {
        name: "sys_status",
        data_type: "TEXT",
        not_null: false,
        default_value: default_status,
      },
      { name: "created_by", data_type: "TEXT", not_null: false },
      { name: "updated_by", data_type: "TEXT", not_null: false },
      { name: "created_by_id", data_type: "INTEGER", not_null: false },
      { name: "updated_by_id", data_type: "INTEGER", not_null: false },
      { name: "ui_case_id", data_type: "INTEGER", not_null: false },
      { name: "pt_case_id", data_type: "INTEGER", not_null: false },
      ...schema,
    ];

    let Model = modelCache[table_name];

    if (!Model) {
      const modelAttributes = {};
      for (const field of completeSchema) {
        const {
          name,
          data_type,
          not_null,
          default_value,
          primaryKey,
          autoIncrement,
        } = field;
        const sequelizeType =
          typeMapping?.[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;

        modelAttributes[name] = {
          type: sequelizeType,
          allowNull: !not_null,
        };

        if (default_value) modelAttributes[name].defaultValue = default_value;
        if (primaryKey) modelAttributes[name].primaryKey = true;
        if (autoIncrement) modelAttributes[name].autoIncrement = true;
      }

      Model = sequelize.define(
        table_name,
        modelAttributes,
        {
          freezeTableName: true,
          timestamps: true,
          createdAt: "created_at",
          updatedAt: "updated_at",
          underscored: true,
        }
      );

      await Model.sync({ alter: true });
      modelCache[table_name] = Model;
    }

    if (Array.isArray(recordId)) {
      const records = await Model.findAll({
        where: {
          id: recordId
        }
      });

    if (records.length !== recordId.length) {
      return userSendResponse(
        res,
        404,
        false,
        `Some records with the provided IDs were not found in table ${table_name}.`
      );
    }

  } else {
    const record = await Model.findByPk(recordId);
  
    if (!record) {
      return userSendResponse(
        res,
        404,
        false,
        `Record with ID ${recordId} not found in table ${table_name}.`
      );
    }
  }


    const [updatedCount] = await Model.update(
      { sys_status },
      { where: { id: recordId } }
    );

    // Fetch user data
    const userData = await Users.findOne({
        include: [
        {
            model: KGID,
            as: "kgidDetails",
            attributes: ["kgid", "name", "mobile"],
        },
        ],
        where: { user_id: userId },
    });

    let userName = userData?.kgidDetails?.name || null;
    
    if (Array.isArray(recordId)) {
        const historyRecords = recordId.map(id => ({
            template_id: tableData.template_id,
            table_row_id: id,
            user_id: userId,
            actor_name: userName,
            action: `Status Updated`,
        }));
    
        await CaseHistory.bulkCreate(historyRecords);
    } else {
        await CaseHistory.create({
            template_id: tableData.template_id,
            table_row_id: recordId,
            user_id: userId,
            actor_name: userName,
            action: `Status Updated`,
        });
    }
    

    if (updatedCount === 0) {
      return userSendResponse(
        res,
        400,
        false,
        "No changes detected or update failed."
      );
    }

    const handleInvestigationUpdate = async (invTableName, caseId , default_status) => {
      const investigationTable = await Template.findOne({
        where: { table_name: invTableName },
      });
      if (!investigationTable) {
        return userSendResponse(
          res,
          400,
          false,
          `${invTableName} not found.`
        );
      }

      const invSchema =
        typeof investigationTable.fields === "string"
          ? JSON.parse(investigationTable.fields)
          : investigationTable.fields;

      const completeInvSchema = [
        {
          name: "id",
          data_type: "INTEGER",
          not_null: true,
          primaryKey: true,
          autoIncrement: true,
        },
        { name: "sys_status", data_type: "TEXT", not_null: false , default_value: default_status},
        { name: "ui_case_id", data_type: "INTEGER", not_null: false },
        { name: "pt_case_id", data_type: "INTEGER", not_null: false },
        { name: "created_by", data_type: "TEXT", not_null: false },
        { name: "updated_by", data_type: "TEXT", not_null: false },
        { name: "created_by_id", data_type: "INTEGER", not_null: false },
        { name: "updated_by_id", data_type: "INTEGER", not_null: false },
        ...invSchema,
      ];

      let InvModel = modelCache[invTableName];
      if (!InvModel) {
        const invModelAttributes = {};
        for (const field of completeInvSchema) {
          const { name, data_type, not_null, primaryKey, autoIncrement } = field;
          const sequelizeType =
            typeMapping?.[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;

          invModelAttributes[name] = {
            type: sequelizeType,
            allowNull: !not_null,
          };

          if (primaryKey) invModelAttributes[name].primaryKey = true;
          if (autoIncrement) invModelAttributes[name].autoIncrement = true;
        }

        InvModel = sequelize.define(
          invTableName,
          invModelAttributes,
          {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            underscored: true,
          }
        );

        await InvModel.sync({ alter: true });
        modelCache[invTableName] = InvModel;
      }

      const invRecord = await InvModel.findOne({ where: { id: caseId } });
      if (invRecord) {
        await InvModel.update(
          { sys_status: "178_cases" },
          { where: { id: caseId } }
        );
      } else {
        console.log(`No matching record found in \`${invTableName}\` for id:`, caseId);
      }
    };

    if (ui_case_id && sys_status === "178_cases") {
      await handleInvestigationUpdate("cid_under_investigation", ui_case_id ,"ui_case");
    }

    if (pt_case_id && sys_status === "178_cases") {
      await handleInvestigationUpdate("cid_pending_trail", pt_case_id,"pt_case");
    }

    return userSendResponse(
      res,
      200,
      true,
      "Case record updated successfully!"
    );
  } catch (error) {
    console.error("Error updating case status:", error);
    return userSendResponse(res, 500, false, "Internal Server Error.", error);
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};


const dirPath = path.join(__dirname, "../public/files/");

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dirPath);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const uniqueName = uuid.v4() + fileExtension;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Invalid file type. Only PDFs are allowed."));
    }
    cb(null, true);
  },
}).single("file");

exports.uploadFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("File upload error:", err.message);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size exceeds the 10MB limit.",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed.",
      });
    }

    try {
      const { ui_case_id, created_by } = req.body;

      if (!ui_case_id || !created_by) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded.",
        });
      }

      const existing = await UiProgressReportFileStatus.findOne({
        where: { ui_case_id },
      });

      if (existing) {
        const existingPath = path.join(__dirname, "..", "uploads", existing.file_path);
        if (fs.existsSync(existingPath)) {
          fs.unlinkSync(existingPath);
        }

        await existing.destroy();
      }

      const file_name = req.file.filename;
      const file_path = path.join("files", file_name);

      await UiProgressReportFileStatus.create({
        ui_case_id,
        is_pdf: true,
        file_name,
        file_path,
        created_by,
        created_at: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: "File uploaded successfully.",
        file_path,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  });
};


exports.getUploadedFiles = async (req, res) => {
  try {
    const { ui_case_id } = req.body;

    if (!ui_case_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required ui_case_id." });
    }

    const data = await UiProgressReportFileStatus.findAll({
      where: { ui_case_id },
      attributes: ["id", "file_name", "file_path", "created_by", "created_at"],
    });

    if (!data.length) {
      return res
        .status(404)
        .json({ success: false, message: "No files found." });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching files:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const getCurrentMonthDateLabel = () => {
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' }).toLowerCase();
  const year = today.getFullYear(); 
  return `${month}_${year}`;
};

const formatLabel = (label) => {
  label = label.startsWith('field_') ? label.slice(6) : label;

  return label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};


const breakLongWords = (text, font, fontSize, maxWidth) => {
  let result = '';
  let currentLine = '';

  for (let char of text) {
    const testLine = currentLine + char;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth) {
      result += currentLine + '\n';
      currentLine = char;
    } else {
      currentLine += char;
    }
  }

  result += currentLine;

  return result;
};



let lastPdfDocCaseId = null;
let lastMonthPdfKey = null;

let pdfDocGeneralInfoInserted = false;
let monthPdfGeneralInfoInserted = false;

function shouldInsertGeneralInfoForPdfDoc(currentCaseId) {
  if (lastPdfDocCaseId !== currentCaseId) {
    lastPdfDocCaseId = currentCaseId;
    pdfDocGeneralInfoInserted = false;
  }
  return !pdfDocGeneralInfoInserted;
}

function shouldInsertGeneralInfoForMonthPdf(currentCaseId, currentMonth) {
  const key = `${currentCaseId}_${currentMonth}`;
  if (lastMonthPdfKey !== key) {
    lastMonthPdfKey = key;
    monthPdfGeneralInfoInserted = false;
  }
  return !monthPdfGeneralInfoInserted;
}

async function insertGeneralInfo(pdfDoc, aoFields, pageWidth, pageHeight, regularFont, boldFont, target = 'pdfDoc') {
  const alreadyInserted = target === 'pdfDoc' ? pdfDocGeneralInfoInserted : monthPdfGeneralInfoInserted;
  if (alreadyInserted) return false;

  const fontSize = 12;
  const startX = 50;
  const labelWidth = 200;
  const valueWidth = pageWidth - 300;
  let currentY = pageHeight - 80;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Draw bold "General Info" heading
  page.drawText("General Info", {
    x: startX,
    y: currentY,
    size: fontSize + 2,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  currentY -= 30;

  for (let [key, val] of Object.entries(aoFields)) {
    const label = formatLabel(key);
    const rawValue = val?.toString() || 'N/A';

    // Split into lines, handle line breaks and word wrap
    const rawLines = rawValue.split('\n');
    const wrappedLines = [];

    for (let rawLine of rawLines) {
      rawLine = breakLongWords(rawLine, regularFont, fontSize, valueWidth);
      const words = rawLine.trim().split(/\s+/);
      let currentLine = "";

      for (let word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = regularFont.widthOfTextAtSize(testLine, fontSize);
        if (width <= valueWidth) {
          currentLine = testLine;
        } else {
          wrappedLines.push(currentLine);
          currentLine = word;
        }
      }

      if (currentLine) wrappedLines.push(currentLine);
    }

    const valueHeight = wrappedLines.length * (fontSize + 4);
    const rowHeight = Math.max(30, valueHeight + 10);

    // Add page if overflow
    if (currentY - rowHeight < 50) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - 80;
    }

    // Draw rectangles
    page.drawRectangle({
      x: startX,
      y: currentY - rowHeight,
      width: labelWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    page.drawRectangle({
      x: startX + labelWidth,
      y: currentY - rowHeight,
      width: valueWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Draw label (bold)
    page.drawText(label, {
      x: startX + 5,
      y: currentY - 15,
      size: fontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Draw wrapped value
    let textY = currentY - 15;
    for (let line of wrappedLines) {
      page.drawText(line, {
        x: startX + labelWidth + 10,
        y: textY,
        size: fontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      textY -= fontSize + 4;
    }

    currentY -= rowHeight;
  }

  if (target === 'pdfDoc') pdfDocGeneralInfoInserted = true;
  else monthPdfGeneralInfoInserted = true;

  return true;
}

async function appendTextToPdf(pdfDoc, appendText, pageWidth, pageHeight, regularFont, boldFont) {

  const omitKeys = [
    'id',
    'ReadStatus',
    'field_pr_status',
    'sys_status',
    'updated_at',
    'field_ui_case_id',
    'ui_case_id',
    'field_pt_case_id',
    'field_evidence_file',
    'field_assigned_to_id',
    'field_assigned_by_id'
  ];

  const fontSize = 12;
  const startX = 50;

  for (let data of appendText) {
    // Omit unwanted keys
    omitKeys.forEach(key => delete data[key]);

    // Reorder if needed
    const { created_by, created_at, ...rest } = data;
    data = { ...rest, created_by, created_at };

    // Always start a fresh page for every record
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - 80;

    for (let [label, value] of Object.entries(data)) {
      const fieldLabel = formatLabel(label);
      let fieldValue = value ? value.toString() : 'N/A';

      // Format date fields
      if ((label === 'field_due_date' || label === 'created_at') && value) {
        try {
          const dateObj = new Date(value);
          fieldValue = dateObj.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
          });
        } catch (e) {
          console.warn(`Invalid date for ${label}: ${value}`);
        }
      }

      const rawLines = fieldValue.split('\n');
      const wrappedLines = [];

      for (let rawLine of rawLines) {
        rawLine = breakLongWords(rawLine, regularFont, fontSize, pageWidth - 200);
        const words = rawLine.trim().split(/\s+/);
        let currentLine = '';

        for (let word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = regularFont.widthOfTextAtSize(testLine, fontSize);
          if (width <= pageWidth - 200) {
            currentLine = testLine;
          } else {
            wrappedLines.push(currentLine);
            currentLine = word;
          }
        }

        if (currentLine) wrappedLines.push(currentLine);
      }

      let remainingLines = [...wrappedLines];

      while (remainingLines.length > 0) {
        const availableHeight = currentY - 50;
        const linesPerPage = Math.floor((availableHeight - 10) / (fontSize + 4));
        const linesToPrint = remainingLines.splice(0, linesPerPage);
        const valueHeight = linesToPrint.length * (fontSize + 4);
        const rowHeight = Math.max(30, valueHeight + 10);

        page.drawRectangle({
          x: startX,
          y: currentY - rowHeight,
          width: 200,
          height: rowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawRectangle({
          x: startX + 200,
          y: currentY - rowHeight,
          width: pageWidth - 300,
          height: rowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawText(fieldLabel, {
          x: startX + 5,
          y: currentY - 15,
          size: fontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        let textY = currentY - 15;
        for (let line of linesToPrint) {
          page.drawText(line, {
            x: startX + 210,
            y: textY,
            size: fontSize,
            font: regularFont,
            color: rgb(0, 0, 0),
          });
          textY -= fontSize + 4;
        }

        currentY -= rowHeight;

        if (remainingLines.length > 0 || currentY < 100) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - 80;
        }
      }
    }
  }

}


exports.appendToLastLineOfPDF = async (req, res) => {
  try {
    
    const { ui_case_id, created_by, appendText, transaction_id, selected_row_id, aoFields } = req.body;

    if (!ui_case_id || !appendText || !selected_row_id || !aoFields) {
      console.error("Missing required fields.");
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
    fs.mkdirSync(dirPath, { recursive: true });

    const latestFile = await UiProgressReportFileStatus.findOne({
      where: { ui_case_id, is_pdf: true },
      order: [['created_at', 'DESC']],
    });

    if (!latestFile) {
      console.error("No PDF file found.");
      return res.status(404).json({ success: false, message: 'No PDF file found.' });
    }

    const pdfPath = path.join(__dirname, '../public', latestFile.file_path);
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.276;
    const pageHeight = 841.89;

    const monthLabelRaw = getCurrentMonthDateLabel();
    const monthLabelDisplay = monthLabelRaw.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const monthwiseFileName = `${monthLabelRaw}.pdf`;
    const monthwisePath = path.join(__dirname, '../public/files/monthwise_reports', monthwiseFileName);
    const monthOfTheFile = monthLabelDisplay.split(' ')[0] + " Submission";

    fs.mkdirSync(path.dirname(monthwisePath), { recursive: true });

    const existingMonthwise = await UiProgressReportMonthWise.findOne({
      where: { ui_case_id, monthwise_file_name: monthwiseFileName }
    });

    const isNewMonthFile = !existingMonthwise;
    let monthPdf;

    if (isNewMonthFile) {
      monthPdf = await PDFDocument.create();
      const submissionPage = monthPdf.addPage([pageWidth, pageHeight]);
      const fontSize = 24;
      const centerX = 50;
      const centerY = pageHeight / 2;

      submissionPage.drawText(monthLabelDisplay, {
        x: centerX,
        y: centerY + fontSize + 10,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      submissionPage.drawText("SUBMISSION", {
        x: centerX,
        y: centerY,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      submissionPage.drawText("PROGRESS REPORT", {
        x: centerX,
        y: centerY - fontSize - 10,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
    } else {
      const existingMonthPdfBytes = fs.readFileSync(monthwisePath);
      monthPdf = await PDFDocument.load(existingMonthPdfBytes);
    }

    let generalInfoAddedMain = false;
    let generalInfoAddedMonth = false;

    if (shouldInsertGeneralInfoForPdfDoc(ui_case_id)) {
  await insertGeneralInfo(pdfDoc, aoFields, pageWidth, pageHeight, regularFont, boldFont, 'pdfDoc');
}


   if (shouldInsertGeneralInfoForMonthPdf(ui_case_id, monthLabelRaw)) {
  await insertGeneralInfo(monthPdf, aoFields, pageWidth, pageHeight, regularFont, boldFont, 'monthPdf');
}


    await appendTextToPdf(pdfDoc, appendText, pageWidth, pageHeight, regularFont, boldFont);
    await appendTextToPdf(monthPdf, appendText, pageWidth, pageHeight, regularFont, boldFont);

    const updatedPdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, '../public/files', `updated_${latestFile.file_name}`);
    fs.writeFileSync(outputPath, updatedPdfBytes);

    const monthwisePdfBytes = await monthPdf.save();
    fs.writeFileSync(monthwisePath, monthwisePdfBytes);

    await UiProgressReportFileStatus.update(
      { file_path: path.join('files', `updated_${latestFile.file_name}`) },
      { where: { id: latestFile.id } }
    );

    if (isNewMonthFile) {
      await UiProgressReportMonthWise.create({
        ui_case_id,
        created_by,
        month_of_the_file: monthOfTheFile,
        monthwise_file_name: monthwiseFileName,
        monthwise_file_path: path.join('files', 'monthwise_reports', monthwiseFileName),
        submission_date: new Date(),
      });
    }

const tableName = "cid_ui_case_progress_report";
    const Model = sequelize.define(
      tableName,
      {
        id: { type: Sequelize.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        field_pr_status: { type: Sequelize.DataTypes.STRING, allowNull: true },
        field_ui_case_id: { type: Sequelize.DataTypes.INTEGER, allowNull: false },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    await Model.update({ field_pr_status: "Yes" }, { where: { id: selected_row_id } });
    return res.status(200).json({ success: true, message: 'PDF updated successfully.' });
  } catch (error) {
    console.error('Error in appendToLastLineOfPDF:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};






exports.getMonthWiseByCaseId = async (req, res) => {
  try {
    const ui_case_id = req.query.ui_case_id || req.body.ui_case_id;
    const page = parseInt(req.query.page || req.body.page, 10) || 1;
    const limit = parseInt(req.query.limit || req.body.limit, 10) || 10;
    const offset = (page - 1) * limit;

    if (!ui_case_id) {
      return res.status(400).json({ success: false, message: 'ui_case_id is required.' });
    }

    const totalRecords = await UiProgressReportMonthWise.count({ where: { ui_case_id } });

    const records = await UiProgressReportMonthWise.findAll({
      where: { ui_case_id },
      order: [['submission_date', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: records,
      totalRecords,
    });
  } catch (error) {
    console.error('Error fetching monthwise progress reports:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch data.' });
  }
};


exports.saveDataWithApprovalToTemplates = async (req, res, next) => {
	const { table_name  , data, others_data, transaction_id, user_designation_id , folder_attachment_ids , second_table_name, second_data , second_folder_attachment_ids, others_folder_attachment_ids } = req.body;

	if (user_designation_id === undefined || user_designation_id === null) {
		return userSendResponse(res, 400, false, "user_designation_id is required.", null);
	}
	if (transaction_id === undefined || transaction_id === null) {
		return userSendResponse(res, 400, false, "transaction_id is required.", null);
	}

	const t = await dbConfig.sequelize.transaction();
	let dirPath = "";

	try {
		const userId = req.user?.user_id || null;
		if (!userId) {
			return userSendResponse(res, 403, false, "Unauthorized access.", null);
		}

		dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
		if (fs.existsSync(dirPath)) {
			return res.status(400).json({ success: false, message: "Duplicate transaction detected.", dirPath });
		}
		fs.mkdirSync(dirPath, { recursive: true });

		const userData = await Users.findOne({
			include: [{ model: KGID, as: "kgidDetails", attributes: ["kgid", "name", "mobile"] }],
			where: { user_id: userId },
		});

		let userName = userData?.kgidDetails?.name || null;

        let insertedData = null ;
        let insertedId =  null;
        let insertedType = null;
        let insertedIO = null;
        let tableData = null;

        if(table_name  && data)
        {
            tableData = await Template.findOne({ where: { table_name } });
            if (!tableData) {
                return userSendResponse(res, 400, false, `Table ${table_name} does not exist.`, null);
            }
    
            const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;
    
            let parsedData;
            try {
                parsedData = JSON.parse(data);
            } catch (err) {
                return userSendResponse(res, 400, false, "Invalid JSON format in data.", null);
            }
    
            const validData = {};
            for (const field of schema) {
                const { name, not_null, default_value } = field;
                if (parsedData.hasOwnProperty(name)) {
                    validData[name] = parsedData[name];
                } else if (not_null && default_value === undefined) {
                    return userSendResponse(res, 400, false, `Field ${name} cannot be null.`, null);
                } else if (default_value !== undefined) {
                    validData[name] = default_value;
                }
            }
    
            validData.created_by = userName;
            validData.created_by_id = userId;
    
            const completeSchema = [
                { name: "created_by", data_type: "TEXT", not_null: false },
                { name: "created_by_id", data_type: "INTEGER", not_null: false },
                ...schema
            ];
    
            ["sys_status", "ui_case_id", "pt_case_id"].forEach(field => {
                if (parsedData[field]) {
                    completeSchema.unshift({
                        name: field,
                        data_type: typeof parsedData[field] === "number" ? "INTEGER" : "TEXT",
                        not_null: false
                    });
                    validData[field] = parsedData[field];
                }
            });
    
            const modelAttributes = {};
            for (const field of completeSchema) {
                const { name, data_type, not_null, default_value } = field;
                const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
                modelAttributes[name] = {
                    type: sequelizeType,
                    allowNull: !not_null,
                    defaultValue: default_value || null,
                };
            }
    
            const Model = sequelize.define(table_name, modelAttributes, {
                freezeTableName: true,
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
            });
    
            await Model.sync();
    
            insertedData = await Model.create(validData, { transaction: t });
            if (!insertedData) {
                await t.rollback();
                return userSendResponse(res, 400, false, "Failed to insert data.", null);
            }
            
            insertedId = insertedData.id || null;
            insertedType = insertedData.sys_status || null;
            insertedIO = insertedData.field_io_name || null;
            const fileUpdates = {};
    
            if(folder_attachment_ids)
            {
                if (req.files && req.files.length > 0) {
                    const folderAttachments = folder_attachment_ids ? JSON.parse(folder_attachment_ids): []; // Parse if provided, else empty array
        
                    for (const file of req.files) {
                        const { originalname, size, key, fieldname } = file;
                        const fileExtension = path.extname(originalname);
        
                        // Find matching folder_id from the payload (if any)
                        const matchingFolder = folderAttachments.find(
                        (attachment) =>
                            attachment.filename === originalname &&
                            attachment.field_name === fieldname
                        );
        
                        const folderId = matchingFolder ? matchingFolder.folder_id : null; // Set NULL if not found or missing folder_attachment_ids
        
                        await ProfileAttachment.create({
                            template_id: tableData.template_id,
                            table_row_id: insertedData.id,
                            attachment_name: originalname,
                            attachment_extension: fileExtension,
                            attachment_size: size,
                            s3_key: key,
                            field_name: fieldname,
                            folder_id: folderId, // Store NULL if no folder_id provided
                        });
        
                        if (!fileUpdates[fieldname]) {
                            fileUpdates[fieldname] = originalname;
                        } else {
                            fileUpdates[fieldname] += `,${originalname}`;
                        }
                    }
        
                    
                    for (const [fieldname, filenames] of Object.entries(fileUpdates)) {
                        await Model.update(
                        { [fieldname]: filenames },
                        { where: { id: insertedData.id }, transaction: t }
                        );
                    }
              
                }
            }

            if (table_name === "cid_under_investigation") {
                const main_table = table_name;
                const record_id = insertedId;
                const module = insertedType;
                const alert_type = "IO_ALLOCATION";
                const alert_level = "low";
                const alert_message = "Please assign an IO to this case";
              
                const createdAt = new Date(insertedData.created_at);
                const due_date = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
              
                const triggered_on = insertedData.created_at;
                const status = "pending";
                const created_by = userId;
                const send_to_type = "designation";
                const division_id = insertedData.field_division || null;
                const designation_id = user_designation_id || null;
                const assigned_io = insertedData.field_io_name || null;
              
                try {
                  await CaseAlerts.create({
                    module,
                    main_table,
                    record_id,
                    alert_type,
                    alert_level,
                    alert_message,
                    due_date,
                    triggered_on,
                    resolved_on: null,
                    status,
                    created_by,
                    created_at: new Date(),
                    send_to_type,
                    division_id,
                    designation_id,
                    assigned_io,
                    user_id: null,
                    transaction: t 
                  });
                } catch (error) {
                  console.error('Error inserting case alert:', error);
                }
            }
              
        }

        if(second_table_name && second_table_name != "")
		{
			const secondTableData = await Template.findOne({ where: { table_name:second_table_name } });
			if (!secondTableData) {
				return userSendResponse(res, 400, false, `Table ${second_table_name} does not exist.`, null);
			}

			const secondSchema = typeof secondTableData.fields === "string" ? JSON.parse(secondTableData.fields) : secondTableData.fields;

			let secondParsedData;
			try {
				secondParsedData = JSON.parse(second_data);
			} catch (err) {
				return userSendResponse(res, 400, false, "Invalid JSON format in data.", null);
			}

			const secondValidData = {};
			for (const field of secondSchema) {
				const { name, not_null, default_value } = field;
				if (secondParsedData.hasOwnProperty(name)) {
					secondValidData[name] = secondParsedData[name];
				} else if (not_null && default_value === undefined) {
					return userSendResponse(res, 400, false, `Field ${name} cannot be null.`, null);
				} else if (default_value !== undefined) {
					secondValidData[name] = default_value;
				}
			}

			secondValidData.created_by = userName;
			secondValidData.created_by_id = userId;

			const secondCompleteSchema = [
				{ name: "created_by", data_type: "TEXT", not_null: false },
				{ name: "created_by_id", data_type: "INTEGER", not_null: false },
				...secondSchema
			];

			["sys_status", "ui_case_id", "pt_case_id"].forEach(field => {
				if (secondParsedData[field]) {
					secondCompleteSchema.unshift({
						name: field,
						data_type: typeof secondParsedData[field] === "number" ? "INTEGER" : "TEXT",
						not_null: false
					});
					secondValidData[field] = secondParsedData[field];
				}
			});

			const secondModelAttributes = {};
			for (const field of secondCompleteSchema) {
				const { name, data_type, not_null, default_value } = field;
				const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
				secondModelAttributes[name] = {
					type: sequelizeType,
					allowNull: !not_null,
					defaultValue: default_value || null,
				};
			}

			const secondModel = sequelize.define(second_table_name, secondModelAttributes, {
				freezeTableName: true,
				timestamps: true,
				createdAt: "created_at",
				updatedAt: "updated_at",
			});

			await secondModel.sync();

			const secondInsertedData = await secondModel.create(secondValidData, { transaction: t });

			if (!secondInsertedData) {
				await t.rollback();
				return userSendResponse(res, 400, false, "Failed to insert data.", null);
			}

			const secondFileUpdates = {};

			if (req.files && req.files.length > 0) {
				const secondFolderAttachments = second_folder_attachment_ids ? JSON.parse(second_folder_attachment_ids): []; // Parse if provided, else empty array

				for (const file of req.files) {
					const { originalname, size, key, fieldname } = file;
					const fileExtension = path.extname(originalname);

					// Find matching folder_id from the payload (if any)
					const seconsFileMatchingFolder = secondFolderAttachments.find(
					(attachment) =>
						attachment.filename === originalname &&
						attachment.field_name === fieldname
					);

					const folderId = seconsFileMatchingFolder ? seconsFileMatchingFolder.folder_id : null; // Set NULL if not found or missing second_folder_attachment_ids

					await ProfileAttachment.create({
						template_id: secondTableData.template_id,
						table_row_id: secondInsertedData.id,
						attachment_name: originalname,
						attachment_extension: fileExtension,
						attachment_size: size,
						s3_key: key,
						field_name: fieldname,
						folder_id: folderId, // Store NULL if no folder_id provided
					});

					if (!secondFileUpdates[fieldname]) {
						secondFileUpdates[fieldname] = originalname;
					} else {
						secondFileUpdates[fieldname] += `,${originalname}`;
					}
				}

				
				for (const [fieldname, filenames] of Object.entries(secondFileUpdates)) {
					await secondModel.update(
					{ [fieldname]: filenames },
					{ where: { id: secondInsertedData.id }, transaction: t }
					);
				}
			}
		}

        let recordId = insertedId;
        let sys_status = insertedType;
        let default_status = insertedType;

		if(insertedIO && insertedIO !== null) {
			const userData = await Users.findOne({
				where: { user_id: insertedIO },
			});

			if (!userData) {
				await t.rollback();
				return userSendResponse(res, 400, false, "IO User not found.", null);
			}
		}

		let otherParsedData  = {};
		try {
			otherParsedData = JSON.parse(others_data);
		} catch (err) {
            otherParsedData = others_data;
			// return userSendResponse(res, 400, false, "Invalid JSON format in data.", null);
		}

        if (typeof otherParsedData !== 'object' || otherParsedData === null) {
            return userSendResponse(res, 400, false, "Invalid data format in others_data.", null);
        }

		// Handle others_data
		if (otherParsedData && typeof otherParsedData === "object") {
			if (otherParsedData.others_table_name) {
				const others_table_name = otherParsedData.others_table_name;
				const otherTableData = await Template.findOne({ where: { table_name: others_table_name }, transaction: t });
				if (!otherTableData) {
					await t.rollback();
					return userSendResponse(res, 400, false, `Table ${others_table_name} does not exist.`);
				}

				const otherSchema = typeof otherTableData.fields === "string" ? JSON.parse(otherTableData.fields) : otherTableData.fields;

				if (otherParsedData.sys_status?.id && otherParsedData.sys_status?.sys_status && otherParsedData.sys_status?.default_status) {
					recordId = otherParsedData.sys_status.id;
					sys_status = otherParsedData.sys_status.sys_status.trim();
					default_status = otherParsedData.sys_status.default_status.trim();

					const otherCompleteSchema = [
						{ name: "id", data_type: "INTEGER", not_null: true, primaryKey: true, autoIncrement: true },
						{ name: "sys_status", data_type: "TEXT", not_null: false, default_value: default_status },
						{ name: "created_by", data_type: "TEXT", not_null: false },
						{ name: "updated_by", data_type: "TEXT", not_null: false },
						{ name: "created_by_id", data_type: "INTEGER", not_null: false },
						{ name: "updated_by_id", data_type: "INTEGER", not_null: false },
						{ name: "ui_case_id", data_type: "INTEGER", not_null: false },
						{ name: "pt_case_id", data_type: "INTEGER", not_null: false },
						...otherSchema
					];

					const otherModelAttributes = {};
					for (const field of otherCompleteSchema) {
						const { name, data_type, not_null, default_value, primaryKey, autoIncrement } = field;
						const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
						otherModelAttributes[name] = { type: sequelizeType, allowNull: !not_null };
						if (default_value) otherModelAttributes[name].defaultValue = default_value;
						if (primaryKey) otherModelAttributes[name].primaryKey = true;
						if (autoIncrement) otherModelAttributes[name].autoIncrement = true;
					}

					const OtherModel = sequelize.define(others_table_name, otherModelAttributes, {
						freezeTableName: true,
						timestamps: true,
						createdAt: "created_at",
						updatedAt: "updated_at",
						underscored: true,
					});

					await OtherModel.sync({ alter: true });

					const record = await OtherModel.findByPk(recordId);
					if (!record) {
						await t.rollback();
						return userSendResponse(res, 404, false, `Record with ID ${recordId} not found in table ${others_table_name}.`);
					}

					const [updatedCount] = await OtherModel.update(
						{ sys_status },
						{ where: { id: recordId }, transaction: t }
					);

                    await CaseHistory.create({
                        template_id: otherTableData.template_id,
                        table_row_id: recordId,
                        user_id: userId,
                        actor_name: userName,
                        action: `Status Updated`,
                        transaction: t
                    });

					if (updatedCount === 0) {
						await t.rollback();
						return userSendResponse(res, 400, false, "No changes detected or update failed.");
					}

                    if(others_folder_attachment_ids) {
                    
                        var otherFileUpdates = {};
                        if (req.files && req.files.length > 0) {
                            const otherFolderAttachments = others_folder_attachment_ids ? JSON.parse(others_folder_attachment_ids): []; // Parse if provided, else empty array

                            for (const file of req.files) {
                                const { originalname, size, key, fieldname } = file;
                                const fileExtension = path.extname(originalname);

                                // Find matching folder_id from the payload (if any)
                                const othersFileMatchingFolder = otherFolderAttachments.find(
                                (attachment) =>
                                    attachment.filename === originalname &&
                                    attachment.field_name === fieldname
                                );

                                const folderId = othersFileMatchingFolder ? othersFileMatchingFolder.folder_id : null; // Set NULL if not found or missing second_folder_attachment_ids

                                await ProfileAttachment.create({
                                    template_id: otherTableData.template_id,
                                    table_row_id: recordId,
                                    attachment_name: originalname,
                                    attachment_extension: fileExtension,
                                    attachment_size: size,
                                    s3_key: key,
                                    field_name: fieldname,
                                    folder_id: folderId, // Store NULL if no folder_id provided
                                });

                                if (!otherFileUpdates[fieldname]) {
                                    otherFileUpdates[fieldname] = originalname;
                                } else {
                                    otherFileUpdates[fieldname] += `,${originalname}`;
                                }
                            }

                            
                            for (const [fieldname, filenames] of Object.entries(otherFileUpdates)) {
                                await OtherModel.update(
                                { [fieldname]: filenames },
                                { where: { id: recordId }, transaction: t }
                                );
                            }
                        }
                    }
				}

				if(!recordId) {
					await t.rollback();
					return userSendResponse(res, 400, false, "Record ID is required.");
				}

				if (!default_status) {
					await t.rollback();
					return userSendResponse(res, 400, false, "Default status is required.");
				}
			}
            // Handle approval logic
            if (otherParsedData.approval_details && otherParsedData.approval) {
                const approval = otherParsedData.approval;
                const approvalDetails = otherParsedData.approval_details;

                const existingApprovalItem = await ApprovalItem.findByPk(approval?.approval_item);
                if (!existingApprovalItem) {
                    await t.rollback();
                    return userSendResponse(res, 400, false, "Invalid approval item ID.");
                }
                
                const newApproval = await UiCaseApproval.create(
                    {
                        approval_item: approval.approval_item,
                        approved_by: approval.approved_by,
                        approval_date: approval.approval_date || new Date(),
                        remarks: approval.remarks,
                        reference_id: approvalDetails.id || recordId,
                        approval_type: default_status,
                        module: approvalDetails.module_name,
                        action: approvalDetails.action,
                        created_by: userId,
                    },
                    { transaction: t }
                );
                
                if (!recordId) {
                    await t.rollback();
                    return userSendResponse(res, 400, false, "Reference ID is required.");
                }


                
                await ApprovalActivityLog.create(
                {
                  approval_id: newApproval.approval_id,
                  approval_item_id: approval.approval_item,
                  case_id: approvalDetails.id || recordId,
                  approved_by: approval.approved_by,
                  approved_date: approval.approval_date,
                  approval_type: default_status,
                  module: approvalDetails.module_name,
                  created_by: userId,
              },
                { transaction: t }
              );
                              

                await System_Alerts.create(
                    {
                        approval_id: newApproval.approval_id,
                        reference_id : recordId,
                        alert_type: "Approval",
                        alert_message: newApproval.remarks,
                        created_by: userId,
                        created_by_designation_id: user_designation_id,
                        created_by_division_id: null,
                        send_to :insertedIO || null,
                    },
                    { transaction: t }
                );
            }

		}

		await t.commit();
		return userSendResponse(res, 200, true, `Record Created Successfully`, null);

	} catch (error) {
		console.error("Error saving data to templates:", error);
		if (t) await t.rollback();
		const isDuplicate = error.name === "SequelizeUniqueConstraintError";
		return userSendResponse(res, isDuplicate ? 400 : 500, false, isDuplicate ? "Duplicate entry detected." : "Internal Server Error.", error);
	} finally {
		if (fs.existsSync(dirPath)) {
			fs.rmSync(dirPath, { recursive: true, force: true });
		}
	}
};

exports.updateDataWithApprovalToTemplates = async (req, res, next) => {
    // const { template_id, id, model_name, attachments, others_data, others_table_name, others_data_id, approval_status, sys_status } = req.body;
	const { table_name , id , data, others_data, transaction_id, user_designation_id , folder_attachment_ids  } = req.body;

	if (user_designation_id === undefined || user_designation_id === null) {
		return userSendResponse(res, 400, false, "user_designation_id is required.", null);
	}
	if (transaction_id === undefined || transaction_id === null) {
		return userSendResponse(res, 400, false, "transaction_id is required.", null);
	}

	const t = await dbConfig.sequelize.transaction();
	let dirPath = "";

	try {
		const userId = req.user?.user_id || null;
		if (!userId) {
			return userSendResponse(res, 403, false, "Unauthorized access.", null);
		}

		dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
		if (fs.existsSync(dirPath)) {
			return res.status(400).json({ success: false, message: "Duplicate transaction detected.", dirPath });
		}
		fs.mkdirSync(dirPath, { recursive: true });

		const userData = await Users.findOne({
			include: [{ model: KGID, as: "kgidDetails", attributes: ["kgid", "name", "mobile"] }],
			where: { user_id: userId },
		});

		let userName = userData?.kgidDetails?.name || null;

        let insertedIO = null;
        let validData = {};
        let recordId = null;
        if(table_name  && data)
        {
            const tableData = await Template.findOne({ where: { table_name } });
            if (!tableData) {
                return userSendResponse(res, 400, false, `Table ${table_name} does not exist.`, null);
            }
    
            const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;
    
            let parsedData;
            try {
                parsedData = JSON.parse(data);
            } catch (err) {
                parsedData = data;
                // return userSendResponse(res, 400, false, "Invalid JSON format in data.", null);
            }

            // Validate and filter data for schema-based fields
            for (const field of schema) {
                const { name, not_null } = field;

                if (parsedData.hasOwnProperty(name)) {
                    validData[name] = parsedData[name];
                } else if (not_null && !parsedData[name]) {
                    return userSendResponse( res,  400,  false,  `Field ${name} cannot be null.`,  null );
                }
            }
            validData.sys_status = parsedData.sys_status;
            validData.updated_by = userName;
            validData.updated_by_id = userId;

            // Include additional system fields dynamically
            let completeSchema = parsedData?.sys_status
            ? [
                {
                    name: "sys_status",
                    data_type: "TEXT",
                    not_null: false,
                    default_value: parsedData.sys_status.trim(),
                },
                { name: "updated_by", data_type: "TEXT", not_null: false },
                { name: "updated_by_id", data_type: "INTEGER", not_null: false },
                ...schema,
                ]
            : [
                { name: "updated_by", data_type: "TEXT", not_null: false },
                { name: "updated_by_id", data_type: "INTEGER", not_null: false },
                ...schema,
                ];

            if (parsedData?.ui_case_id && parsedData.ui_case_id != "") {
                completeSchema = [
                    { name: "ui_case_id", data_type: "INTEGER", not_null: false },
                    ...completeSchema,
                ];
                validData.ui_case_id = parsedData.ui_case_id;
            }

            if (parsedData?.pt_case_id && parsedData.pt_case_id != "") {
                completeSchema = [
                    { name: "pt_case_id", data_type: "INTEGER", not_null: false },
                    ...completeSchema,
                ];
                validData.pt_case_id = parsedData.pt_case_id;
            }

            // Define Sequelize model dynamically
            const modelAttributes = {};
            for (const field of completeSchema) {
                const { name, data_type, not_null, default_value } = field;
                const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
                modelAttributes[name] = {
                    type: sequelizeType,
                    allowNull: !not_null,
                    defaultValue: default_value || null,
                };
            }

            const Model = sequelize.define(table_name, modelAttributes, {
                freezeTableName: true,
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
            });

            // Find existing record by ID
            const ids = id.split(",").map((id) => id.trim());

            for (const singleId of ids) {
            // Find existing record by ID
                const record = await Model.findByPk(singleId);
                if (!record) {
                    return userSendResponse(res, 400, false, `Record with ID ${singleId} does not exist in table ${table_name}.`, null);
                }

                const originalData = record.toJSON();
                const updatedFields = {};

                // Update fields only if they are changed
                for (const key in validData) {
                    if (originalData[key] !== validData[key]) {
                    updatedFields[key] = validData[key];
                    }
                }

                // Perform the database update if there are changes
                if (Object.keys(updatedFields).length > 0) {
                    await record.update(updatedFields , { transaction: t });

                    // Log changes in ProfileHistory (Only for changed fields)
                    if (userId) {
                        const ids = typeof id === 'string' && id.includes(',')
                            ? id.split(',').map(i => parseInt(i.trim()))
                            : [parseInt(id)];
                
                        for (const rowId of ids) {
                            for (const key in updatedFields) {
                                const oldValue = originalData.hasOwnProperty(key) ? originalData[key] : null;
                                const newValue = updatedFields[key];
                    
                                console.log(">>>>>oldValue1>>>>>>>>", oldValue);
                                console.log(">>>>>>newValue1>>>>>>>", newValue);
                    
                                const oldDisplayValue = await getDisplayValueForField(key, oldValue, schema);
                                const newDisplayValue = await getDisplayValueForField(key, newValue, schema);
                    
                                console.log(">>>>>oldDisplayValue>>>>>>>>", oldDisplayValue);
                                console.log(">>>>newDisplayValue>>>>>>>>>", newDisplayValue);
                    
                                if (oldValue !== newValue) {
                                    await ProfileHistory.create({
                                        template_id: tableData.template_id,
                                        table_row_id: rowId,
                                        user_id: userId,
                                        field_name: key,
                                        old_value: oldDisplayValue !== null ? String(oldDisplayValue) : null,
                                        updated_value: newDisplayValue !== null ? String(newDisplayValue) : null,
                                    });
                                }
                            }
                        }
                    }
            
                    // await ActivityLog.create({
                    //     template_id: tableData.template_id,
                    //     table_row_id: id,
                    //     user_id: actorId,
                    //     actor_name: actorName,
                    //     activity: `Updated`,
                    // });
                    await CaseHistory.create({
                        template_id: tableData.template_id,
                        table_row_id: id,
                        user_id: userId,
                        actor_name: userName,
                        action: `Updated`,
                        transaction: t
                    });
                }

                const fileUpdates = {};

                if (req.files && req.files.length > 0) {
                    const folderAttachments = folder_attachment_ids ? JSON.parse(folder_attachment_ids) : []; // Parse if provided, else empty array

                    for (const file of req.files) {
                        const { originalname, size, key, fieldname } = file;
                        const fileExtension = path.extname(originalname);

                        // Find matching folder_id from the payload (if any)
                        const matchingFolder = folderAttachments.find(
                            (attachment) =>
                            attachment.filename === originalname &&
                            attachment.field_name === fieldname
                        );

                        const folderId = matchingFolder ? matchingFolder.folder_id : null; // Store NULL if no folder_id provided

                        await ProfileAttachment.create({
                            template_id: tableData.template_id,
                            table_row_id: id,
                            attachment_name: originalname,
                            attachment_extension: fileExtension,
                            attachment_size: size,
                            s3_key: key,
                            field_name: fieldname,
                            folder_id: folderId, // Store NULL if no folder_id provided
                        }, { transaction: t });

                        // Fetch current field value if it exists
                        const existingRecord = await Model.findOne({
                            where: { id },
                            attributes: [fieldname],
                        });

                        let currentFilenames = existingRecord?.[fieldname] || "";

                        // Append new filename to the existing comma-separated list
                        currentFilenames = currentFilenames ? `${currentFilenames},${originalname}` : originalname;

                        // Add/accumulate new filenames for each field
                        if (fileUpdates[fieldname]) {
                            fileUpdates[
                            fieldname
                            ] = `${fileUpdates[fieldname]},${originalname}`;
                        } else {
                            fileUpdates[fieldname] = currentFilenames;
                        }
                    }

                    // Update the model with the updated filenames
                    for (const [fieldname, filenames] of Object.entries(fileUpdates)) {
                        await Model.update(
                            { [fieldname]: filenames },
                            { where: { id: singleId } },
                            { transaction: t }
                        );
                    }
                }
            }
        }

		let otherParsedData  = {};
        if(others_data)
        {
            try {
                otherParsedData = JSON.parse(others_data);
            } catch (err) {
                otherParsedData = others_data;
                // return userSendResponse(res, 400, false, "Invalid JSON format in data.", null);
            }
    
            if (typeof otherParsedData !== 'object' || otherParsedData === null) {
                return userSendResponse(res, 400, false, "Invalid data format in others_data.", null);
            }
        }

		// Handle others_data
		if (otherParsedData && typeof otherParsedData === "object") {
			if (otherParsedData.others_table_name) {
				const others_table_name = otherParsedData.others_table_name;
				const otherTableData = await Template.findOne({ where: { table_name: others_table_name }, transaction: t });
				if (!otherTableData) {
					await t.rollback();
					return userSendResponse(res, 400, false, `Table ${others_table_name} does not exist.`);
				}

				const otherSchema = typeof otherTableData.fields === "string" ? JSON.parse(otherTableData.fields) : otherTableData.fields;

				if (otherParsedData.sys_status?.id && otherParsedData.sys_status?.sys_status && otherParsedData.sys_status?.default_status) {
					recordId = otherParsedData.sys_status.id;
					sys_status = otherParsedData.sys_status.sys_status.trim();
					default_status = otherParsedData.sys_status.default_status.trim();

					const otherCompleteSchema = [
						{ name: "id", data_type: "INTEGER", not_null: true, primaryKey: true, autoIncrement: true },
						{ name: "sys_status", data_type: "TEXT", not_null: false, default_value: default_status },
						{ name: "created_by", data_type: "TEXT", not_null: false },
						{ name: "updated_by", data_type: "TEXT", not_null: false },
						{ name: "created_by_id", data_type: "INTEGER", not_null: false },
						{ name: "updated_by_id", data_type: "INTEGER", not_null: false },
						{ name: "ui_case_id", data_type: "INTEGER", not_null: false },
						{ name: "pt_case_id", data_type: "INTEGER", not_null: false },
						...otherSchema
					];

					const otherModelAttributes = {};
					for (const field of otherCompleteSchema) {
						const { name, data_type, not_null, default_value, primaryKey, autoIncrement } = field;
						const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
						otherModelAttributes[name] = { type: sequelizeType, allowNull: !not_null };
						if (default_value) otherModelAttributes[name].defaultValue = default_value;
						if (primaryKey) otherModelAttributes[name].primaryKey = true;
						if (autoIncrement) otherModelAttributes[name].autoIncrement = true;
					}

					const OtherModel = sequelize.define(others_table_name, otherModelAttributes, {
						freezeTableName: true,
						timestamps: true,
						createdAt: "created_at",
						updatedAt: "updated_at",
						underscored: true,
					});

					await OtherModel.sync({ alter: true });

					const record = await OtherModel.findByPk(recordId);
					if (!record) {
						await t.rollback();
						return userSendResponse(res, 404, false, `Record with ID ${recordId} not found in table ${others_table_name}.`);
					}

					const [updatedCount] = await OtherModel.update(
						{ sys_status },
						{ where: { id: recordId }, transaction: t }
					);

                    await CaseHistory.create({
                        template_id: otherTableData.template_id,
                        table_row_id: recordId,
                        user_id: userId,
                        actor_name: userName,
                        action: `Status Updated`,
                        transaction: t
                    });

					if (updatedCount === 0) {
						await t.rollback();
						return userSendResponse(res, 400, false, "No changes detected or update failed.");
					}
				}

        if(!recordId) {
					await t.rollback();
					return userSendResponse(res, 400, false, "Record ID is required.");
				}

				if (!default_status) {
					await t.rollback();
					return userSendResponse(res, 400, false, "Default status is required.");
				}
				
			}
            // Handle approval logic
            if (otherParsedData.approval_details && otherParsedData.approval) {
                const approval = otherParsedData.approval;
                const approvalDetails = otherParsedData.approval_details;

                const existingApprovalItem = await ApprovalItem.findByPk(approval?.approval_item);
                if (!existingApprovalItem) {
                    await t.rollback();
                    return userSendResponse(res, 400, false, "Invalid approval item ID.");
                }
                
                const newApproval = await UiCaseApproval.create(
                    {
                        approval_item: approval.approval_item,
                        approved_by: approval.approved_by,
                        approval_date: approval.approval_date || new Date(),
                        remarks: approval.remarks,
                        reference_id: approvalDetails.id,
                        approval_type: approvalDetails.type,
                        module: approvalDetails.module_name,
                        action: approvalDetails.action,
                        created_by: userId,
                    },
                    { transaction: t }
                );
                
                if (!approvalDetails.id) {
                    await t.rollback();
                    return userSendResponse(res, 400, false, "Reference ID is required.");
                }

                await ApprovalActivityLog.create(
                  {
                    approval_id: newApproval.approval_id,
                    approval_item_id: approval.approval_item,
                    case_id: approvalDetails.id ,
                    approved_by: approval.approved_by,
                    approved_date: approval.approval_date,
                    approval_type: approvalDetails.type,
                    module: approvalDetails.module_name,
                    created_by: userId,
                },
                  { transaction: t }
                );


                await System_Alerts.create(
                    {
                        approval_id: newApproval.approval_id,
                        reference_id : approvalDetails.id,
                        alert_type: "Approval",
                        alert_message: newApproval.remarks,
                        created_by: userId,
                        created_by_designation_id: user_designation_id,
                        created_by_division_id: null,
                        send_to :insertedIO || null,
                    },
                    { transaction: t }
                );
            }

		}

		await t.commit();
		return userSendResponse(res, 200, true, `Record Updated Successfully`, null);

	} catch (error) {
		console.error("Error saving data to templates:", error);
		if (t) await t.rollback();
		const isDuplicate = error.name === "SequelizeUniqueConstraintError";
		return userSendResponse(res, isDuplicate ? 400 : 500, false, isDuplicate ? "Duplicate entry detected." : "Internal Server Error.", error);
	} finally {
		if (fs.existsSync(dirPath)) {
			fs.rmSync(dirPath, { recursive: true, force: true });
		}
	}

    // try {
    //     const parsedData = JSON.parse(req.body.data);

    //     const schema = await getSchema(template_id);
    //     const Model = getDynamicModel(model_name, schema);
    //     const recordId = id || parsedData.recordId;

    //     const existingData = await Model.findByPk(recordId, { transaction: t });
    //     if (!existingData) throw new Error("Record not found");

    //     // Track changes
    //     const profileChanges = [];

    //     let validData = {};
    //     for (const field of schema) {
    //         const { name } = field;
    //         if (parsedData.hasOwnProperty(name)) {
    //         validData[name] = parsedData[name];
    //         if (existingData[name] !== parsedData[name]) {
    //             profileChanges.push({ field: name, old_value: existingData[name], new_value: parsedData[name] });
    //         }
    //         }
    //     }

    //     await Model.update(validData, { where: { id: recordId }, transaction: t });

    //     // Handle attachments
    //     if (attachments) {
    //         const filenames = await handleMultipleFileUpload(req, recordId, model_name);
    //         await Model.update({ attachments: filenames }, { where: { id: recordId }, transaction: t });
    //     }

    //     // Handle others table update
    //     if (others_table_name && others_data) {
    //         const OtherModel = db[others_table_name];
    //         let otherParsedData;
    //         try {
    //         otherParsedData = JSON.parse(others_data);
    //         } catch {
    //         otherParsedData = others_data;
    //         }

    //         const updateCondition = others_data_id ? { id: others_data_id } : { record_id: recordId };
    //         await OtherModel.update(otherParsedData, { where: updateCondition, transaction: t });
    //     }

    //     // Log profile history
    //     for (const change of profileChanges) {
    //         await db.ProfileHistory.create({
    //         template_id,
    //         model_name,
    //         record_id: recordId,
    //         user_id: req.user.id,
    //         field: change.field,
    //         old_value: change.old_value,
    //         new_value: change.new_value,
    //         }, { transaction: t });
    //     }

    //     // Approval logic
    //     if (approval_status && approval_status !== "Approved") {
    //         const approval = await db.UiCaseApproval.create({
    //         table_name: model_name,
    //         record_id: recordId,
    //         user_id: req.user.id,
    //         status: approval_status,
    //         }, { transaction: t });

    //         await db.System_Alerts.create({
    //         type: "approval",
    //         approval_id: approval.id,
    //         model_name,
    //         record_id: recordId,
    //         template_id,
    //         created_by: req.user.id,
    //         }, { transaction: t });
    //     }

    //     await t.commit();
    //     return userSendResponse(res, 200, true, "Record Updated Successfully", { recordId });

    // } catch (error) {
    //     await t.rollback();
    //     console.error("Transaction failed:", error);
    //     return userSendResponse(res, 500, false, "Transaction failed", { error: error.message });
    // }finally {
	// 	if (fs.existsSync(dirPath)) {
	// 		fs.rmSync(dirPath, { recursive: true, force: true });
	// 	}
	// }

};

exports.getAccusedWitness = async (req, res) => {
	try {
		const {  table_name , ui_case_id , pt_case_id } = req.body;

		if (!table_name) {
			return userSendResponse(res, 400, false, "Missing required table name.");
		}


		// Fetch the template metadata
		const tableData = await Template.findOne({ where: { table_name } });

		if (!tableData) {
		const message = `Table ${table_name} does not exist.`;
		return userSendResponse(res, 400, false, message, null);
		}

		// Parse the schema fields from Template
		const schema = typeof tableData.fields === "string"	? JSON.parse(tableData.fields) : tableData.fields;

		const fields = {};

		// Filter fields that have is_primary_field as true
		const relevantSchema =
		table_name === "cid_ui_case_progress_report"
			? schema
			: schema.filter((field) => field.is_primary_field === true);

		// Define model attributes based on filtered schema
		const modelAttributes = {
		id: {
			type: Sequelize.DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		created_at: {
			type: Sequelize.DataTypes.DATE,
			allowNull: false,
		},
		updated_at: {
			type: Sequelize.DataTypes.DATE,
			allowNull: false,
		},
		created_by: {
			type: Sequelize.DataTypes.STRING,
			allowNull: true,  
		} 
		};
		const associations = [];

		for (const field of relevantSchema) {
		const {
			name: columnName,
			data_type,
			not_null,
			default_value,
			table,
			forign_key,
			attributes,
		} = field;

		if (!columnName || !data_type) {
			console.warn(
			`Missing required attributes for field ${columnName}. Using default type STRING.`
			);
			modelAttributes[columnName] = {
			type: Sequelize.DataTypes.STRING,
			allowNull: not_null ? false : true,
			defaultValue: default_value || null,
			};
			continue;
		}

		// Handle data_type mapping to Sequelize types
		const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
		
		modelAttributes[columnName] = {
			type: sequelizeType,
			allowNull: not_null ? false : true,
			defaultValue: default_value || null,
		};

		fields[columnName] = {
			type: sequelizeType,
			allowNull: !not_null,
			defaultValue: default_value || null,
		};

		// Handle foreign key associations dynamically
		if (table && forign_key && attributes) {
			associations.push({
			relatedTable: table,
			foreignKey: columnName,
			targetAttribute: attributes,
			});
		}
		}

		// Define and sync the dynamic model
		const Model = sequelize.define(table_name, modelAttributes, {
		freezeTableName: true,
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
		});

		await Model.sync();

		let whereClause = {};
		if (ui_case_id && ui_case_id != "" && pt_case_id && pt_case_id != "") {
            whereClause = {
                [Op.or]: [{ ui_case_id }, { pt_case_id }],
            };
		} else if (ui_case_id && ui_case_id != "") {
			whereClause = { ui_case_id };
		} else if (pt_case_id && pt_case_id != "") {
			whereClause = { pt_case_id };
		}

		let attributes = [];
		if(table_name === "cid_ui_case_accused"){
			attributes = ["id", "field_name"];
		}
		else if(table_name === "cid_ui_case_witness"){
			attributes = ["id", "field_name"];
		}

		const Usersdata = await Model.findAll({
			where: whereClause,
			attributes: attributes,
		});

		const data = Usersdata.map((item) => {
			if (table_name === "cid_ui_case_accused") {
				return { id: item.id, name: item.field_name };
			} else if (table_name === "cid_ui_case_witness") {
				return { id: item.id, name: item.field_name };
			}
			return item;
		});
		if (!data.length) {
			return res.status(404).json({ success: false, message: "No records found." });
		}
		return res.status(200).json({ success: true, data });
	} catch (error) {
		console.error("Error fetching records:", error);
		return res.status(500).json({ success: false, message: "Internal server error." });
	}
};



exports.insertMergeData = async (req, res) => {
  const { table_name, data } = req.body;

  if (table_name !== 'ui_merged_cases' || !Array.isArray(data)) {
    return res.status(400).json({ success: false, message: "Invalid payload." });
  }

  try {

    await UiMergedCases.bulkCreate(data, {
      ignoreDuplicates: true,
    });

    return res.status(200).json({
      success: true,
      message: "Merge data inserted successfully.",
    });
  } catch (err) {
    console.error("insertMergeData error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to insert merge data.",
    });
  }
};

exports.getMergeParentData = async (req, res) =>
{
    try {
        const {
        page = 1,
        limit = 5,
        sort_by,
        order = "DESC",
        search = "",
        search_field = "",
        template_module = "",
        sys_status,
        is_read,
        get_sys,
        } = req.body;

        const { filter = {}, from_date = null, to_date = null } = req.body;
        const { user_id } = req.user;
        const userId = user_id;
        const offset = (page - 1) * limit;
        const whereClause = {};

        if (!template_module) {
            return userSendResponse(res, 400, false, "Template module is required", null );
        }

        // const { allowedUserIds = [] } = req.body; // Default to empty array if not provided

        // if (allowedUserIds.length > 0) {
        //     if (template_module === "ui_case") {
        //         whereClause[Op.or] = [
        //         { created_by_id: { [Op.in]: allowedUserIds } },
        //         { field_io_name: { [Op.in]: allowedUserIds } },
        //         ];
        //     } else {
        //         whereClause["created_by_id"] = { [Op.in]: allowedUserIds };
        //     }
        // }

        const { allowedUserIds = [] , getDataBasesOnUsers = false , allowedDivisionIds = [] , allowedDepartmentIds = []} = req.body; // Default to empty array if not provided

        const normalizedDivisionIds = normalizeValues(allowedDivisionIds, 'string');
        const normalizedUserIds = normalizeValues(allowedUserIds, 'string');

        if (!getDataBasesOnUsers) {
            if (allowedDivisionIds.length > 0) {
                if (["ui_case", "pt_case", "eq_case"].includes(template_module)) {
                whereClause["field_division"] = { [Op.in]: normalizedDivisionIds };
                } else {
                whereClause["created_by_id"] = { [Op.in]: normalizedUserIds };
                }
            }
        } else {
            if (allowedUserIds.length > 0) {
                if (["ui_case", "pt_case", "eq_case"].includes(template_module)) {
                whereClause[Op.or] = [
                    { created_by_id: { [Op.in]: normalizedUserIds } },
                    { field_io_name: { [Op.in]: normalizedUserIds } },
                ];
                } else {
                whereClause["created_by_id"] = { [Op.in]: normalizedUserIds };
                }
            }
        }

        const parentCases = await UiMergedCases.findAll({
            where: { merged_status: 'parent' },
            attributes: ['case_id'],
            raw: true,
        });

        const parentCaseIds = parentCases.map(item => item.case_id);

        const childCounts = await UiMergedCases.findAll({
            where: {
                merged_status: 'child',
                parent_case_id: { [Sequelize.Op.in]: parentCaseIds }
            },
            attributes: [
                'parent_case_id',
                [Sequelize.fn('COUNT', Sequelize.col('case_id')), 'child_count']
            ],
            group: ['parent_case_id'],
            raw: true,
        });

        const parentCaseMap = parentCases.reduce((acc, parent) => {
            // Find the child count for the current parent case
            const childCount = childCounts.find(child => child.parent_case_id === parent.case_id);

            // Add the case_id and child_count to the accumulator object
            acc[parent.case_id] = { count: childCount ? childCount.child_count : 0 };

            return acc;
        }, {});

        // const parentCaseMap = parentCases.map(parent => {
        //     const childCount = childCounts.find(child => child.parent_case_id === parent.case_id);
        //     return {
        //         case_id: parent.case_id,
        //         child_count: childCount ? childCount.child_count : 0,
        //     };
        // });

        if (parentCaseIds.length === 0) {
            return userSendResponse(res, 200, true, "No merged case found", null);
        }

        whereClause["id"] = { [Op.in]: parentCaseIds };

        // Fetch the template using template_module to get the table_name
        const template = await Template.findOne({ where: { template_module } });
        if (!template) {
            return userSendResponse(res, 400, false, "Template not found", null);
        }

        const table_name = template.table_name;
        const template_name = template.template_name;

        if (!table_name) {
            return userSendResponse(res, 400, false, "Table name is required.", null);
        }

        const tableTemplate = await Template.findOne({ where: { table_name } });
        if (!tableTemplate) {
        return userSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null );
        }

        let fieldsArray;
        try {
        fieldsArray =
            typeof tableTemplate.fields === "string" ? JSON.parse(tableTemplate.fields) : tableTemplate.fields;
        } catch (err) {
        console.error("Error parsing fields:", err);
        return userSendResponse( res, 500, false, "Invalid table schema format.",null);
        }

        if (!Array.isArray(fieldsArray)) {
            return userSendResponse(res, 500, false, "Fields must be an array in the table schema.", null);
        }

        const fields = {};
        const associations = [];
        const radioFieldMappings = {};
        const checkboxFieldMappings = {};
        const dropdownFieldMappings = {};

        // Store field configurations by name for easy lookup
        const fieldConfigs = {};

        for (const field of fieldsArray) {
            const {
                name: columnName,
                data_type,
                max_length,
                not_null,
                default_value,
                table,
                forign_key,
                attributes,
                options,
                type,
                table_display_content,
            } = field;

            if (!table_display_content) continue; // Filter out fields not marked for display

            // Store the complete field configuration for reference
            fieldConfigs[columnName] = field;

            const sequelizeType =
                data_type?.toUpperCase() === "VARCHAR" && max_length
                ? Sequelize.DataTypes.STRING(max_length)
                : Sequelize.DataTypes[data_type?.toUpperCase()] ||
                    Sequelize.DataTypes.STRING;

            fields[columnName] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
                displayContent: table_display_content,
            };

            if (type === "radio" && Array.isArray(options)) {
                radioFieldMappings[columnName] = options.reduce((acc, option) => {
                acc[option.code] = option.name;
                return acc;
                }, {});
            }

            if (type === "checkbox" && Array.isArray(options)) {
                checkboxFieldMappings[columnName] = options.reduce((acc, option) => {
                acc[option.code] = option.name;
                return acc;
                }, {});
            }

            if (
                (type === "dropdown" ||
                type === "multidropdown" ||
                type === "autocomplete") &&
                Array.isArray(options)
            ) {
                dropdownFieldMappings[columnName] = options.reduce((acc, option) => {
                acc[option.code] = option.name;
                return acc;
                }, {});
            }

            if (table && forign_key && attributes) {
                associations.push({
                relatedTable: table,
                foreignKey: columnName,
                targetAttribute: attributes,
                });
            }
        }

        const DynamicTable = sequelize.define(table_name, fields, {
        freezeTableName: true,
        timestamps: true,
        });

        const include = [];
        for (const association of associations) {
        const RelatedModel = require(`../models`)[association.relatedTable];
        if (RelatedModel) {
            DynamicTable.belongsTo(RelatedModel, {
            foreignKey: association.foreignKey,
            as: `${association.relatedTable}Details`,
            });

            include.push({
            model: RelatedModel,
            as: `${association.relatedTable}Details`,
            attributes: association.targetAttribute || {
                exclude: ["created_date", "modified_date"],
            },
            });
        }
        }

        // Apply field filters if provided
        if (filter && typeof filter === "object") {
        Object.entries(filter).forEach(([key, value]) => {
            if (fields[key]) {
            whereClause[key] = value; // Direct match for foreign key fields
            }
        });
        }

        if (from_date || to_date) {
        whereClause["created_at"] = {};

        if (from_date) {
            whereClause["created_at"][Op.gte] = new Date(
            `${from_date}T00:00:00.000Z`
            );
        }
        if (to_date) {
            whereClause["created_at"][Op.lte] = new Date(
            `${to_date}T23:59:59.999Z`
            );
        }
        }

        if (is_read === false) {
        whereClause["$ReadStatus.template_user_status_id$"] = { [Op.is]: null }; // Filter only unread records
        }

        if (search) {
        const searchConditions = [];

        if (search_field && fields[search_field]) {
            // Specific field search
            const fieldConfig = fieldConfigs[search_field];
            const fieldType = fields[search_field].type.key;
            const isForeignKey = associations.some(
            (assoc) => assoc.foreignKey === search_field
            );

            // Handle field type based search
            if (["STRING", "TEXT"].includes(fieldType)) {
            searchConditions.push({
                [search_field]: { [Op.iLike]: `%${search}%` },
            });
            } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
            if (!isNaN(search)) {
                searchConditions.push({ [search_field]: parseInt(search, 10) });
            }
            } else if (fieldType === "BOOLEAN") {
            const boolValue = search.toLowerCase() === "true";
            searchConditions.push({ [search_field]: boolValue });
            } else if (fieldType === "DATE") {
            const parsedDate = Date.parse(search);
            if (!isNaN(parsedDate)) {
                searchConditions.push({ [search_field]: new Date(parsedDate) });
            }
            }

            // Handle dropdown, radio, checkbox special searches
            if (
            fieldConfig &&
            fieldConfig.type === "dropdown" &&
            Array.isArray(fieldConfig.options)
            ) {
            // Find option code that matches the search text
            const matchingOption = fieldConfig.options.find((option) =>
                option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
                searchConditions.push({ [search_field]: matchingOption.code });
            }
            }

            if (
            fieldConfig &&
            fieldConfig.type === "radio" &&
            Array.isArray(fieldConfig.options)
            ) {
            // Find option code that matches the search text
            const matchingOption = fieldConfig.options.find((option) =>
                option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
                searchConditions.push({ [search_field]: matchingOption.code });
            }
            }

            // Handle foreign keys
            if (isForeignKey) {
            const association = associations.find(
                (assoc) => assoc.foreignKey === search_field
            );
            if (association) {
                // Get the included model from the include array
                const associatedModel = include.find(
                (inc) => inc.as === `${association.relatedTable}Details`
                );

                // Only add the condition if the model is properly included
                if (associatedModel) {
                searchConditions.push({
                    [`$${association.relatedTable}Details.${association.targetAttribute}$`]:
                    { [Op.iLike]: `%${search}%` },
                });
                }
            }
            }
        } else {
            // General search across all fields
            Object.keys(fields).forEach((field) => {
            const fieldConfig = fieldConfigs[field];
            const fieldType = fields[field].type.key;
            const isForeignKey = associations.some(
                (assoc) => assoc.foreignKey === field
            );

            // Standard text and numeric search
            if (["STRING", "TEXT"].includes(fieldType)) {
                searchConditions.push({ [field]: { [Op.iLike]: `%${search}%` } });
            } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
                if (!isNaN(search)) {
                searchConditions.push({ [field]: parseInt(search, 10) });
                }
            }

            // Dropdown, radio, checkbox search
            if (
                fieldConfig &&
                fieldConfig.type === "dropdown" &&
                Array.isArray(fieldConfig.options)
            ) {
                // Find option code that matches the search text
                const matchingOption = fieldConfig.options.find((option) =>
                option.name.toLowerCase().includes(search.toLowerCase())
                );

                if (matchingOption) {
                searchConditions.push({ [field]: matchingOption.code });
                }
            }

            if (
                fieldConfig &&
                fieldConfig.type === "radio" &&
                Array.isArray(fieldConfig.options)
            ) {
                // Find option code that matches the search text
                const matchingOption = fieldConfig.options.find((option) =>
                option.name.toLowerCase().includes(search.toLowerCase())
                );

                if (matchingOption) {
                searchConditions.push({ [field]: matchingOption.code });
                }
            }

            // Foreign key search
            if (isForeignKey) {
                const association = associations.find(
                (assoc) => assoc.foreignKey === field
                );
                if (association) {
                // Get the included model from the include array
                const associatedModel = include.find(
                    (inc) => inc.as === `${association.relatedTable}Details`
                );

                // Only add the condition if the model is properly included
                if (associatedModel) {
                    searchConditions.push({
                    [`$${association.relatedTable}Details.${association.targetAttribute}$`]:
                        { [Op.iLike]: `%${search}%` },
                    });
                }
                }
            }
            });
        }

        if (searchConditions.length > 0) {
            whereClause[Op.or] = searchConditions;
        }
        }

        const validSortBy = fields[sort_by] ? sort_by : "created_at";

        if (
        sys_status !== null &&
        sys_status !== undefined &&
        sys_status !== "all"
        ) {
        whereClause["sys_status"] = sys_status;
        }

        // Create base attributes array
        let attributesArray = [];

        // Add sys_status only if get_sys is true
        if (get_sys) {
            attributesArray.push("sys_status");
        }

        // Add other fields from fields object
        attributesArray = [
        ...attributesArray,
        ...Object.keys(fields).filter((field) => fields[field].displayContent),
        ];

        // Add default fields
        attributesArray.push("id", "created_by", "ui_case_id", "pt_case_id");

        // Ensure valid sort order
        const sortOrder = ["ASC", "DESC"].includes(order?.toUpperCase()) ? order.toUpperCase() : "DESC";

        // Run Sequelize query
        const result = await DynamicTable.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[col(validSortBy), sortOrder]],  // Use col() to handle sorting safely
            attributes: attributesArray,
            include,
            logging: console.log,
        });

        const totalItems = result.count;
        const totalPages = Math.ceil(totalItems / limit);

        const progressReportTableData =  await Template.findOne({ where:{ table_name: "cid_ui_case_progress_report" } });

        if (!progressReportTableData) {
        const message = `Table "Progress Report" does not exist.`;
        return userSendResponse(res, 400, false, message, null);
        }

        // Parse the schema fields from Template
        const progressReportschema = typeof progressReportTableData.fields === "string" ? JSON.parse(progressReportTableData.fields) : progressReportTableData.fields;

        // Filter fields that have is_primary_field as true
        const progressReportRelevantSchema =  progressReportschema ;

        // Define model attributes based on filtered schema
        const progressReportModelAttributes = {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        created_at: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
        },
        created_by: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,  
        } 
        };

        const progressReportAssociations = [];
        const progressReportFields = {};

        for (const field of progressReportRelevantSchema) {
        const {
            name: columnName,
            data_type,
            not_null,
            default_value,
            table,
            forign_key,
            attributes,
        } = field;

        if (!columnName || !data_type) {
            console.warn(
            `Missing required attributes for field ${columnName}. Using default type STRING.`
            );
            progressReportModelAttributes[columnName] = {
            type: Sequelize.DataTypes.STRING,
            allowNull: not_null ? false : true,
            defaultValue: default_value || null,
            };
            continue;
        }

        const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;

        progressReportModelAttributes[columnName] = {
            type: sequelizeType,
            allowNull: not_null ? false : true,
            defaultValue: default_value || null,
        };

        progressReportFields[columnName] = {
            type: sequelizeType,
            allowNull: !not_null,
            defaultValue: default_value || null,
        };

        if (table && forign_key && attributes) {
            progressReportAssociations.push({
            relatedTable: table,
            foreignKey: columnName,
            targetAttribute: attributes,
            });
        }
        }

    // Define the model
    const progressReportModel = sequelize.define("cid_ui_case_progress_report", progressReportModelAttributes, {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    });

    // Define association (read status)
    progressReportModel.hasOne(db.TemplateUserStatus, {
    foreignKey: 'table_row_id',
    sourceKey: 'id',
    as: 'ReadStatus',
    constraints: false,
    });

    // Sync the model
    await progressReportModel.sync();


    const transformedRows = await Promise.all(
      result.rows.map(async (record) => {
        const data = record.toJSON();

        // Map radio, checkbox, and dropdown fields to display values
        for (const fieldName in radioFieldMappings) {
          if (
            data[fieldName] !== undefined &&
            radioFieldMappings[fieldName][data[fieldName]]
          ) {
            data[fieldName] = radioFieldMappings[fieldName][data[fieldName]];
          }
        }
        for (const fieldName in checkboxFieldMappings) {
          if (data[fieldName]) {
            const codes = data[fieldName].split(",").map((code) => code.trim());
            data[fieldName] = codes
              .map((code) => checkboxFieldMappings[fieldName][code] || code)
              .join(", ");
          }
        }
        for (const fieldName in dropdownFieldMappings) {
          if (
            data[fieldName] !== undefined &&
            dropdownFieldMappings[fieldName][data[fieldName]]
          ) {
            data[fieldName] = dropdownFieldMappings[fieldName][data[fieldName]];
          }
        }

        // Fetch attachments related to this row
        const attachments = await ProfileAttachment.findAll({
          where: {
            template_id: tableTemplate.template_id,
            table_row_id: data.id,
          },
          order: [["created_at", "DESC"]],
        });

        if (attachments.length) {
          data.attachments = attachments.map((att) => att.toJSON());
        }

        data.ReadStatus = data.ReadStatus ? true : false;

        const case_id =  data.id || null;

       if (
        parentCaseMap &&
        parentCaseMap[case_id.toString()] &&
        parentCaseMap[case_id.toString()]['count']
        ) {
            data.childCount = parentCaseMap[case_id.toString()]['count'];
        }

        const {rows: task_all_records, count: task_count } = await progressReportModel.findAndCountAll({
            where: {
                ui_case_id: case_id,
            },
        });

        const {rows: task_readed_records } = await progressReportModel.findAndCountAll({
            where: {
                ui_case_id: case_id,  
            },
            include: {
                model: db.TemplateUserStatus,
                as: 'ReadStatus',
                required: is_read,
                where: {
                    user_id: userId,
                    template_id: progressReportTableData.template_id
                },
                attributes: ['template_user_status_id']
            },
        });

        let task_read_count = 0;
        let task_unread_count = 0;

        if (task_readed_records && task_readed_records.length > 0) {
            task_readed_records.forEach((record) => {
                const readStatus = record.ReadStatus;
                if (readStatus) {
                    task_read_count += 1;
                }
            });
        }

        if(task_read_count != 0) 
            task_unread_count = task_count - task_read_count;
        else
            task_unread_count = task_count;

        data.task_unread_count = task_unread_count || 0;

        // Handle alias mappings before processing associations
        for (const association of associations) {
            const alias = `${association.relatedTable}Details`;
            if (data[alias]) {
                Object.entries(data[alias]).forEach(([key, value]) => {
                    data[association.foreignKey] = value;
                });
                delete data[alias]; // Remove unnecessary alias object from response
            }
        }

        // Fetch linked profile info manually
        const linkedProfileInfo = [];

        for (const association of associations) {
            const foreignKeyValue = data[association.foreignKey];

            if (foreignKeyValue) {
                try {
                    // Fetch associated table metadata from the Template model
                    const associatedTemplate = await Template.findOne({
                        where: {
                            table_name: association.relatedTable,  // Ensure the correct table name
                        },
                        attributes: ['template_type'],
                    });

                    // Check if the table name starts with "da" and template_type is not "master"
                    if (associatedTemplate && association.relatedTable.startsWith("da") && associatedTemplate.template_type !== "master") {
                        const [linkedRow] = await sequelize.query(
                            `SELECT id FROM ${association.relatedTable} WHERE ${association.targetAttribute} = :foreignKeyValue LIMIT 1`,
                            {
                                replacements: { foreignKeyValue },
                                type: Sequelize.QueryTypes.SELECT
                            }
                        );

                        if (linkedRow && linkedRow.id) {
                            linkedProfileInfo.push({
                                table: association.relatedTable,
                                id: linkedRow.id,
                                field: association.foreignKey
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching linked profile info for ${association.relatedTable}:`, error);
                }
            }
        }

        // Add linked profile info to the response
        data.linked_profile_info = linkedProfileInfo.length ? linkedProfileInfo : null;

        return data;
      })
    );

    const responseData = {
      // data: transformedRows,
      data: transformedRows.map((row) => ({ ...row })),
      columns: [
        ...fieldsArray.map((field) => ({
          name: field.name,
        })),
        // Manually adding created_at and updated_at timestamps
        {
          name: "created_at",
        },
        {
          name: "updated_at",
        },
      ],

      meta: {
        page,
        limit,
        table_name,
        template_name,
        totalItems,
        totalPages,
        sort_by: validSortBy,
        order,
      },
      metaChildCount:parentCaseMap,
      parentCaseIds:parentCaseIds
    };

    return userSendResponse(
      res,
      200,
      true,
      "Data fetched successfully",
      responseData
    );
  } catch (error) {
    console.error("Error fetching paginated data:", error);

    return userSendResponse(res, 500, false, "Server error", error);
  }
}

exports.getMergeChildData = async (req, res) =>
{
    try {
        const {
        page = 1,
        limit = 5,
        sort_by,
        order = "DESC",
        search = "",
        search_field = "",
        template_module = "",
        sys_status,
        is_read,
        get_sys,
        case_id
        } = req.body;

        const { filter = {}, from_date = null, to_date = null } = req.body;
        const { user_id } = req.user;
        const userId = user_id;
        const offset = (page - 1) * limit;
        const whereClause = {};

        if (!template_module) {
            return userSendResponse(res, 400, false, "Template module is required", null );
        }

        // const { allowedUserIds = [] } = req.body; // Default to empty array if not provided

        // if (allowedUserIds.length > 0) {
        //     if (template_module === "ui_case") {
        //         whereClause[Op.or] = [
        //         { created_by_id: { [Op.in]: allowedUserIds } },
        //         { field_io_name: { [Op.in]: allowedUserIds } },
        //         ];
        //     } else {
        //         whereClause["created_by_id"] = { [Op.in]: allowedUserIds };
        //     }
        // }

        const { allowedUserIds = [] , getDataBasesOnUsers = false , allowedDivisionIds = [] , allowedDepartmentIds = []} = req.body; // Default to empty array if not provided

        const normalizedDivisionIds = normalizeValues(allowedDivisionIds, 'string');
        const normalizedUserIds = normalizeValues(allowedUserIds, 'string');

        if (!getDataBasesOnUsers) {
            if (allowedDivisionIds.length > 0) {
                if (["ui_case", "pt_case", "eq_case"].includes(template_module)) {
                whereClause["field_division"] = { [Op.in]: normalizedDivisionIds };
                } else {
                whereClause["created_by_id"] = { [Op.in]: normalizedUserIds };
                }
            }
        } else {
            if (allowedUserIds.length > 0) {
                if (["ui_case", "pt_case", "eq_case"].includes(template_module)) {
                whereClause[Op.or] = [
                    { created_by_id: { [Op.in]: normalizedUserIds } },
                    { field_io_name: { [Op.in]: normalizedUserIds } },
                ];
                } else {
                whereClause["created_by_id"] = { [Op.in]: normalizedUserIds };
                }
            }
        }

        const childCases = await UiMergedCases.findAll({
            where: { merged_status: 'child', parent_case_id: case_id }, // corrected here
            attributes: ['case_id'],
            raw: true,
        });

        const childCaseIds = childCases.map(item => item.case_id);

        if (childCaseIds.length === 0) {
            return userSendResponse(res, 400, false, "No merged case found", null);
        }

        whereClause["id"] = { [Op.in]: childCaseIds };

        // Fetch the template using template_module to get the table_name
        const template = await Template.findOne({ where: { template_module } });
        if (!template) {
            return userSendResponse(res, 400, false, "Template not found", null);
        }

        const table_name = template.table_name;
        const template_name = template.template_name;

        if (!table_name) {
            return userSendResponse(res, 400, false, "Table name is required.", null);
        }

        const tableTemplate = await Template.findOne({ where: { table_name } });
        if (!tableTemplate) {
        return userSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null );
        }

        let fieldsArray;
        try {
        fieldsArray =
            typeof tableTemplate.fields === "string" ? JSON.parse(tableTemplate.fields) : tableTemplate.fields;
        } catch (err) {
        console.error("Error parsing fields:", err);
        return userSendResponse( res, 500, false, "Invalid table schema format.",null);
        }

        if (!Array.isArray(fieldsArray)) {
            return userSendResponse(res, 500, false, "Fields must be an array in the table schema.", null);
        }

        const fields = {};
        const associations = [];
        const radioFieldMappings = {};
        const checkboxFieldMappings = {};
        const dropdownFieldMappings = {};

        // Store field configurations by name for easy lookup
        const fieldConfigs = {};

        for (const field of fieldsArray) {
            const {
                name: columnName,
                data_type,
                max_length,
                not_null,
                default_value,
                table,
                forign_key,
                attributes,
                options,
                type,
                table_display_content,
            } = field;

            if (!table_display_content) continue; // Filter out fields not marked for display

            // Store the complete field configuration for reference
            fieldConfigs[columnName] = field;

            const sequelizeType =
                data_type?.toUpperCase() === "VARCHAR" && max_length
                ? Sequelize.DataTypes.STRING(max_length)
                : Sequelize.DataTypes[data_type?.toUpperCase()] ||
                    Sequelize.DataTypes.STRING;

            fields[columnName] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
                displayContent: table_display_content,
            };

            if (type === "radio" && Array.isArray(options)) {
                radioFieldMappings[columnName] = options.reduce((acc, option) => {
                acc[option.code] = option.name;
                return acc;
                }, {});
            }

            if (type === "checkbox" && Array.isArray(options)) {
                checkboxFieldMappings[columnName] = options.reduce((acc, option) => {
                acc[option.code] = option.name;
                return acc;
                }, {});
            }

            if (
                (type === "dropdown" ||
                type === "multidropdown" ||
                type === "autocomplete") &&
                Array.isArray(options)
            ) {
                dropdownFieldMappings[columnName] = options.reduce((acc, option) => {
                acc[option.code] = option.name;
                return acc;
                }, {});
            }

            if (table && forign_key && attributes) {
                associations.push({
                relatedTable: table,
                foreignKey: columnName,
                targetAttribute: attributes,
                });
            }
        }

        const DynamicTable = sequelize.define(table_name, fields, {
        freezeTableName: true,
        timestamps: true,
        });

        const include = [];
        for (const association of associations) {
        const RelatedModel = require(`../models`)[association.relatedTable];
        if (RelatedModel) {
            DynamicTable.belongsTo(RelatedModel, {
            foreignKey: association.foreignKey,
            as: `${association.relatedTable}Details`,
            });

            include.push({
            model: RelatedModel,
            as: `${association.relatedTable}Details`,
            attributes: association.targetAttribute || {
                exclude: ["created_date", "modified_date"],
            },
            });
        }
        }

        // Apply field filters if provided
        if (filter && typeof filter === "object") {
        Object.entries(filter).forEach(([key, value]) => {
            if (fields[key]) {
            whereClause[key] = value; // Direct match for foreign key fields
            }
        });
        }

        if (from_date || to_date) {
        whereClause["created_at"] = {};

        if (from_date) {
            whereClause["created_at"][Op.gte] = new Date(
            `${from_date}T00:00:00.000Z`
            );
        }
        if (to_date) {
            whereClause["created_at"][Op.lte] = new Date(
            `${to_date}T23:59:59.999Z`
            );
        }
        }

        if (is_read === false) {
        whereClause["$ReadStatus.template_user_status_id$"] = { [Op.is]: null }; // Filter only unread records
        }

        if (search) {
        const searchConditions = [];

        if (search_field && fields[search_field]) {
            // Specific field search
            const fieldConfig = fieldConfigs[search_field];
            const fieldType = fields[search_field].type.key;
            const isForeignKey = associations.some(
            (assoc) => assoc.foreignKey === search_field
            );

            // Handle field type based search
            if (["STRING", "TEXT"].includes(fieldType)) {
            searchConditions.push({
                [search_field]: { [Op.iLike]: `%${search}%` },
            });
            } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
            if (!isNaN(search)) {
                searchConditions.push({ [search_field]: parseInt(search, 10) });
            }
            } else if (fieldType === "BOOLEAN") {
            const boolValue = search.toLowerCase() === "true";
            searchConditions.push({ [search_field]: boolValue });
            } else if (fieldType === "DATE") {
            const parsedDate = Date.parse(search);
            if (!isNaN(parsedDate)) {
                searchConditions.push({ [search_field]: new Date(parsedDate) });
            }
            }

            // Handle dropdown, radio, checkbox special searches
            if (
            fieldConfig &&
            fieldConfig.type === "dropdown" &&
            Array.isArray(fieldConfig.options)
            ) {
            // Find option code that matches the search text
            const matchingOption = fieldConfig.options.find((option) =>
                option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
                searchConditions.push({ [search_field]: matchingOption.code });
            }
            }

            if (
            fieldConfig &&
            fieldConfig.type === "radio" &&
            Array.isArray(fieldConfig.options)
            ) {
            // Find option code that matches the search text
            const matchingOption = fieldConfig.options.find((option) =>
                option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
                searchConditions.push({ [search_field]: matchingOption.code });
            }
            }

            // Handle foreign keys
            if (isForeignKey) {
            const association = associations.find(
                (assoc) => assoc.foreignKey === search_field
            );
            if (association) {
                // Get the included model from the include array
                const associatedModel = include.find(
                (inc) => inc.as === `${association.relatedTable}Details`
                );

                // Only add the condition if the model is properly included
                if (associatedModel) {
                searchConditions.push({
                    [`$${association.relatedTable}Details.${association.targetAttribute}$`]:
                    { [Op.iLike]: `%${search}%` },
                });
                }
            }
            }
        } else {
            // General search across all fields
            Object.keys(fields).forEach((field) => {
            const fieldConfig = fieldConfigs[field];
            const fieldType = fields[field].type.key;
            const isForeignKey = associations.some(
                (assoc) => assoc.foreignKey === field
            );

            // Standard text and numeric search
            if (["STRING", "TEXT"].includes(fieldType)) {
                searchConditions.push({ [field]: { [Op.iLike]: `%${search}%` } });
            } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
                if (!isNaN(search)) {
                searchConditions.push({ [field]: parseInt(search, 10) });
                }
            }

            // Dropdown, radio, checkbox search
            if (
                fieldConfig &&
                fieldConfig.type === "dropdown" &&
                Array.isArray(fieldConfig.options)
            ) {
                // Find option code that matches the search text
                const matchingOption = fieldConfig.options.find((option) =>
                option.name.toLowerCase().includes(search.toLowerCase())
                );

                if (matchingOption) {
                searchConditions.push({ [field]: matchingOption.code });
                }
            }

            if (
                fieldConfig &&
                fieldConfig.type === "radio" &&
                Array.isArray(fieldConfig.options)
            ) {
                // Find option code that matches the search text
                const matchingOption = fieldConfig.options.find((option) =>
                option.name.toLowerCase().includes(search.toLowerCase())
                );

                if (matchingOption) {
                searchConditions.push({ [field]: matchingOption.code });
                }
            }

            // Foreign key search
            if (isForeignKey) {
                const association = associations.find(
                (assoc) => assoc.foreignKey === field
                );
                if (association) {
                // Get the included model from the include array
                const associatedModel = include.find(
                    (inc) => inc.as === `${association.relatedTable}Details`
                );

                // Only add the condition if the model is properly included
                if (associatedModel) {
                    searchConditions.push({
                    [`$${association.relatedTable}Details.${association.targetAttribute}$`]:
                        { [Op.iLike]: `%${search}%` },
                    });
                }
                }
            }
            });
        }

        if (searchConditions.length > 0) {
            whereClause[Op.or] = searchConditions;
        }
        }

        const validSortBy = fields[sort_by] ? sort_by : "created_at";

        if (
        sys_status !== null &&
        sys_status !== undefined &&
        sys_status !== "all"
        ) {
        whereClause["sys_status"] = sys_status;
        }

        // Create base attributes array
        let attributesArray = [];

        // Add sys_status only if get_sys is true
        if (get_sys) {
            attributesArray.push("sys_status");
        }

    // Add other fields from fields object
        attributesArray = [
        ...attributesArray,
        ...Object.keys(fields).filter((field) => fields[field].displayContent),
        ];

        // Add default fields
        attributesArray.push("id", "created_by", "ui_case_id", "pt_case_id");

        // Ensure valid sort order
        const sortOrder = ["ASC", "DESC"].includes(order?.toUpperCase()) ? order.toUpperCase() : "DESC";

        // Run Sequelize query
        const result = await DynamicTable.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[col(validSortBy), sortOrder]],  // Use col() to handle sorting safely
            attributes: attributesArray,
            include,
            logging: console.log,
        });

        const totalItems = result.count;
        const totalPages = Math.ceil(totalItems / limit);

        const progressReportTableData =  await Template.findOne({ where:{ table_name: "cid_ui_case_progress_report" } });

        if (!progressReportTableData) {
        const message = `Table "Progress Report" does not exist.`;
        return userSendResponse(res, 400, false, message, null);
        }

        // Parse the schema fields from Template
        const progressReportschema = typeof progressReportTableData.fields === "string" ? JSON.parse(progressReportTableData.fields) : progressReportTableData.fields;

        // Filter fields that have is_primary_field as true
        const progressReportRelevantSchema =  progressReportschema ;

        // Define model attributes based on filtered schema
        const progressReportModelAttributes = {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        created_at: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
        },
        created_by: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,  
        } 
        };

        const progressReportAssociations = [];
        const progressReportFields = {};

        for (const field of progressReportRelevantSchema) {
        const {
            name: columnName,
            data_type,
            not_null,
            default_value,
            table,
            forign_key,
            attributes,
        } = field;

        if (!columnName || !data_type) {
            console.warn(
            `Missing required attributes for field ${columnName}. Using default type STRING.`
            );
            progressReportModelAttributes[columnName] = {
            type: Sequelize.DataTypes.STRING,
            allowNull: not_null ? false : true,
            defaultValue: default_value || null,
            };
            continue;
        }

        const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;

        progressReportModelAttributes[columnName] = {
            type: sequelizeType,
            allowNull: not_null ? false : true,
            defaultValue: default_value || null,
        };

        progressReportFields[columnName] = {
            type: sequelizeType,
            allowNull: !not_null,
            defaultValue: default_value || null,
        };

        if (table && forign_key && attributes) {
            progressReportAssociations.push({
            relatedTable: table,
            foreignKey: columnName,
            targetAttribute: attributes,
            });
        }
        }

    // Define the model
    const progressReportModel = sequelize.define("cid_ui_case_progress_report", progressReportModelAttributes, {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    });

    // Define association (read status)
    progressReportModel.hasOne(db.TemplateUserStatus, {
    foreignKey: 'table_row_id',
    sourceKey: 'id',
    as: 'ReadStatus',
    constraints: false,
    });

    // Sync the model
    await progressReportModel.sync();


    const transformedRows = await Promise.all(
      result.rows.map(async (record) => {
        const data = record.toJSON();

        // Map radio, checkbox, and dropdown fields to display values
        for (const fieldName in radioFieldMappings) {
          if (
            data[fieldName] !== undefined &&
            radioFieldMappings[fieldName][data[fieldName]]
          ) {
            data[fieldName] = radioFieldMappings[fieldName][data[fieldName]];
          }
        }
        for (const fieldName in checkboxFieldMappings) {
          if (data[fieldName]) {
            const codes = data[fieldName].split(",").map((code) => code.trim());
            data[fieldName] = codes
              .map((code) => checkboxFieldMappings[fieldName][code] || code)
              .join(", ");
          }
        }
        for (const fieldName in dropdownFieldMappings) {
          if (
            data[fieldName] !== undefined &&
            dropdownFieldMappings[fieldName][data[fieldName]]
          ) {
            data[fieldName] = dropdownFieldMappings[fieldName][data[fieldName]];
          }
        }

        // Fetch attachments related to this row
        const attachments = await ProfileAttachment.findAll({
          where: {
            template_id: tableTemplate.template_id,
            table_row_id: data.id,
          },
          order: [["created_at", "DESC"]],
        });

        if (attachments.length) {
          data.attachments = attachments.map((att) => att.toJSON());
        }

        data.ReadStatus = data.ReadStatus ? true : false;

        const case_id =  data.id || null;

        const {rows: task_all_records, count: task_count } = await progressReportModel.findAndCountAll({
            where: {
                ui_case_id: case_id,
            },
        });

        const {rows: task_readed_records } = await progressReportModel.findAndCountAll({
            where: {
                ui_case_id: case_id,  
            },
            include: {
                model: db.TemplateUserStatus,
                as: 'ReadStatus',
                required: is_read,
                where: {
                    user_id: userId,
                    template_id: progressReportTableData.template_id
                },
                attributes: ['template_user_status_id']
            },
        });

        let task_read_count = 0;
        let task_unread_count = 0;

        if (task_readed_records && task_readed_records.length > 0) {
            task_readed_records.forEach((record) => {
                const readStatus = record.ReadStatus;
                if (readStatus) {
                    task_read_count += 1;
                }
            });
        }

        if(task_read_count != 0) 
            task_unread_count = task_count - task_read_count;
        else
            task_unread_count = task_count;

        data.task_unread_count = task_unread_count || 0;

        // Handle alias mappings before processing associations
        for (const association of associations) {
            const alias = `${association.relatedTable}Details`;
            if (data[alias]) {
                Object.entries(data[alias]).forEach(([key, value]) => {
                    data[association.foreignKey] = value;
                });
                delete data[alias]; // Remove unnecessary alias object from response
            }
        }

        // Fetch linked profile info manually
        const linkedProfileInfo = [];

        for (const association of associations) {
            const foreignKeyValue = data[association.foreignKey];

            if (foreignKeyValue) {
                try {
                    // Fetch associated table metadata from the Template model
                    const associatedTemplate = await Template.findOne({
                        where: {
                            table_name: association.relatedTable,  // Ensure the correct table name
                        },
                        attributes: ['template_type'],
                    });

                    // Check if the table name starts with "da" and template_type is not "master"
                    if (associatedTemplate && association.relatedTable.startsWith("da") && associatedTemplate.template_type !== "master") {
                        const [linkedRow] = await sequelize.query(
                            `SELECT id FROM ${association.relatedTable} WHERE ${association.targetAttribute} = :foreignKeyValue LIMIT 1`,
                            {
                                replacements: { foreignKeyValue },
                                type: Sequelize.QueryTypes.SELECT
                            }
                        );

                        if (linkedRow && linkedRow.id) {
                            linkedProfileInfo.push({
                                table: association.relatedTable,
                                id: linkedRow.id,
                                field: association.foreignKey
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching linked profile info for ${association.relatedTable}:`, error);
                }
            }
        }

        // Add linked profile info to the response
        data.linked_profile_info = linkedProfileInfo.length ? linkedProfileInfo : null;

        return data;
      })
    );

    const responseData = {
      // data: transformedRows,
      data: transformedRows.map((row) => ({ ...row })),
      columns: [
        ...fieldsArray.map((field) => ({
          name: field.name,
        })),
        // Manually adding created_at and updated_at timestamps
        {
          name: "created_at",
        },
        {
          name: "updated_at",
        },
      ],

      meta: {
        page,
        limit,
        table_name,
        template_name,
        totalItems,
        totalPages,
        sort_by: validSortBy,
        order,
      },
    };

    return userSendResponse(
      res,
      200,
      true,
      "Data fetched successfully",
      responseData
    );
  } catch (error) {
    console.error("Error fetching paginated data:", error);

    return userSendResponse(res, 500, false, "Server error", error);
  }
}

exports.deMergeCaseData = async (req, res) => {
    const { template_module = "", case_id, transaction_id } = req.body;
    const { user_id } = req.user;
    const userId = user_id;
    let recordIds = Array.isArray(case_id) ? case_id : [case_id];

    const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
    if (fs.existsSync(dirPath))
        return userSendResponse(res, 400, false, "Duplicate transaction detected.");

    fs.mkdirSync(dirPath, { recursive: true });

    const t = await dbConfig.sequelize.transaction();

    try {
        const mergedCaseDetails = await UiMergedCases.findAll({
            where: { case_id: { [Op.in]: recordIds } },
            attributes: ['case_id', 'merged_status'],
            raw: true,
        });

        if (!mergedCaseDetails.length)
            return userSendResponse(res, 400, false, "None of the case_ids belong to a merged case.");

        const parentIds = mergedCaseDetails
            .filter(item => item.merged_status === 'parent')
            .map(item => item.case_id);

        const childIds = mergedCaseDetails
            .filter(item => item.merged_status === 'child')
            .map(item => item.case_id);

        if (parentIds.length > 0) {

            const childCaseDetails = await UiMergedCases.findAll({
                where: {
                    parent_case_id: { [Op.in]: parentIds },
                    merged_status: 'child',
                },
                attributes: ['case_id'],
                raw: true,
            });

            const childCaseIds = childCaseDetails.map(item => item.case_id);

            // Add child case_ids to recordIds only if not already present
            for (const childId of childCaseIds) {
                if (!recordIds.includes(childId)) {
                    recordIds.push(childId);
                }
            }

            await UiMergedCases.destroy({
                where: { parent_case_id: { [Op.in]: parentIds } },
                transaction: t
            });


        }

        if (childIds.length > 0) {
            // // Fetch all child records grouped by parent_case_id
            // const allChildCases = await UiMergedCases.findAll({
            //     where: { merged_status: 'child' },
            //     attributes: ['case_id', 'parent_case_id'],
            //     raw: true,
            // });

            // const parentToChildrenMap = {};
            // for (const { parent_case_id, case_id } of allChildCases) {
            //     if (!parentToChildrenMap[parent_case_id]) {
            //         parentToChildrenMap[parent_case_id] = [];
            //     }
            //     parentToChildrenMap[parent_case_id].push(case_id);
            // }

            // const childIdSet = new Set(childIds);
            // const parentIdsToDelete = [];

            // // Check for each parent if all child cases are selected
            // for (const [parentId, children] of Object.entries(parentToChildrenMap)) {
            //     const allSelected = children.every(childId => childIdSet.has(childId));
            //     if (allSelected) {
            //         parentIdsToDelete.push(parentId);
            //         // Also include these childIds in recordIds if not already included
            //         children.forEach(id => {
            //             if (!recordIds.includes(id)) recordIds.push(id);
            //         });
            //         if (!recordIds.includes(parentId)) recordIds.push(parentId);
            //     }
            // }

            // // Delete all child cases whose parent had all children selected
            // if (parentIdsToDelete.length > 0) {
            //     await UiMergedCases.destroy({
            //         where: { parent_case_id: { [Op.in]: parentIdsToDelete } },
            //         transaction: t,
            //     });
            // }

            // // Delete individual selected child cases (excluding ones from fully selected parents)
            // const childIdsToDelete = childIds.filter(
            //     id => !parentIdsToDelete.some(parentId =>
            //         parentToChildrenMap[parentId]?.includes(id)
            //     )
            // );

            // if (childIdsToDelete.length > 0) {
            //     await UiMergedCases.destroy({
            //         where: { case_id: { [Op.in]: childIdsToDelete } },
            //         transaction: t,
            //     });
            // }

            await UiMergedCases.destroy({
                where: { case_id: { [Op.in]: childIds} , merged_status: 'child'  },
                transaction: t
            });
        }

        const invalidIds = recordIds.filter(val => isNaN(parseInt(val)));
        
        if (invalidIds.length > 0)
            return userSendResponse(res, 400, false, "Invalid ID format(s).");

        const tableData = await Template.findOne({ where: { table_name: "cid_under_investigation" } });
        if (!tableData)
            return userSendResponse(res, 400, false, `Table Under Investigation does not exist.`);

        const schema = typeof tableData.fields === "string"
            ? JSON.parse(tableData.fields)
            : tableData.fields;

        const completeSchema = [
            { name: "id", data_type: "INTEGER", not_null: true, primaryKey: true, autoIncrement: true },
            { name: "sys_status", data_type: "TEXT", not_null: false, default_value: 'ui_case' },
            { name: "created_by", data_type: "TEXT", not_null: false },
            { name: "updated_by", data_type: "TEXT", not_null: false },
            { name: "created_by_id", data_type: "INTEGER", not_null: false },
            { name: "updated_by_id", data_type: "INTEGER", not_null: false },
            { name: "ui_case_id", data_type: "INTEGER", not_null: false },
            { name: "pt_case_id", data_type: "INTEGER", not_null: false },
            ...schema,
        ];

        const table_name = "cid_under_investigation";
        let Model = modelCache[table_name];

        if (!Model) {
            const modelAttributes = {};
            for (const field of completeSchema) {
                const { name, data_type, not_null, default_value, primaryKey, autoIncrement } = field;
                const sequelizeType = typeMapping?.[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;

                modelAttributes[name] = {
                    type: sequelizeType,
                    allowNull: !not_null,
                };
                if (default_value) modelAttributes[name].defaultValue = default_value;
                if (primaryKey) modelAttributes[name].primaryKey = true;
                if (autoIncrement) modelAttributes[name].autoIncrement = true;
            }

            Model = sequelize.define(table_name, modelAttributes, {
                freezeTableName: true,
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
                underscored: true,
            });

            await Model.sync({ alter: true });
            modelCache[table_name] = Model;
        }

        const records = await Model.findAll({ where: { id: { [Op.in]: recordIds } } });

        if (records.length !== recordIds.length)
            return userSendResponse(res, 404, false, "Some records were not found in table Under Investigation.");

        const [updatedCount] = await Model.update(
            { sys_status: 'ui_case' },
            { where: { id: { [Op.in]: recordIds } } }
        );

        if (updatedCount === 0)
            return userSendResponse(res, 400, false, "No changes detected or update failed.");

        await t.commit();
        return userSendResponse(res, 200, true, "Merge data updated and de-merged successfully.");
    } catch (err) {
        console.error("deMergeCaseData error:", err);
        await t.rollback();
        return userSendResponse(res, 500, false, "Failed to de-merge data.");
    } finally {
        if (fs.existsSync(dirPath))
            fs.rmSync(dirPath, { recursive: true, force: true });
    }
};


exports.saveActionPlan = async (req, res) => {

    const { table_name, data , transaction_id } = req.body;

	// if (user_designation_id === undefined || user_designation_id === null) {
	// 	return userSendResponse(res, 400, false, "user_designation_id is required.", null);
	// }

    // const transaction_id = "random_1746428232577_842";
	if (transaction_id === undefined || transaction_id === null) {
		return userSendResponse(res, 400, false, "transaction_id is required.", null);
	}

	const t = await dbConfig.sequelize.transaction();
	let dirPath = "";

	try {
		const userId = req.user?.user_id || null;
		if (!userId) {
			return userSendResponse(res, 403, false, "Unauthorized access.", null);
		}

		dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
		if (fs.existsSync(dirPath)) {
			return res.status(400).json({ success: false, message: "Duplicate transaction detected.", dirPath });
		}
		fs.mkdirSync(dirPath, { recursive: true });

		const userData = await Users.findOne({
			include: [{ model: KGID, as: "kgidDetails", attributes: ["kgid", "name", "mobile"] }],
			where: { user_id: userId },
		});

		let userName = userData?.kgidDetails?.name || null;

        console.log(data)

        if (data) {
            // Insert into cid_ui_case_action_plan
            const tableData = await Template.findOne({ where: { table_name } });

            if (!tableData) {
                return userSendResponse(res, 400, false, `Table cid_ui_case_action_plan does not exist.`, null);
            }

            const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;

            let parsedData;
            try {
                parsedData = JSON.parse(data);
            } catch (err) {
                return userSendResponse(res, 400, false, "Invalid JSON format in data.", null);
            }

            const validData = {};
            for (const field of schema) {
                const { name, not_null, default_value } = field;
                if (parsedData.hasOwnProperty(name)) {
                    validData[name] = parsedData[name];
                } else if (not_null && default_value === undefined) {
                    return userSendResponse(res, 400, false, `Field ${name} cannot be null.`, null);
                } else if (default_value !== undefined) {
                    validData[name] = default_value;
                }
            }

            // validData.field_status = "submit";
            validData.sys_status = "";
            validData.created_by = userName;
            validData.created_by_id = userId;

            const completeSchema = [
                { name: "created_by", data_type: "TEXT", not_null: false },
                { name: "created_by_id", data_type: "INTEGER", not_null: false },
                ...schema,
            ];

            ["sys_status", "ui_case_id", "pt_case_id"].forEach(field => {
                if (parsedData[field]) {
                    completeSchema.unshift({
                        name: field,
                        data_type: typeof parsedData[field] === "number" ? "INTEGER" : "TEXT",
                        not_null: false
                    });
                    validData[field] = parsedData[field];
                }
            });

            const modelAttributes = {};
            for (const field of completeSchema) {
                const { name, data_type, not_null, default_value } = field;
                const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
                modelAttributes[name] = {
                    type: sequelizeType,
                    allowNull: !not_null,
                    defaultValue: default_value || null,
                };
            }

            const Model = sequelize.define(tableData.table_name, modelAttributes, {
                freezeTableName: true,
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
            });

            await Model.sync();

            const insertedData = await Model.create(validData, { transaction: t });
            if (!insertedData) {
                await t.rollback();
                return userSendResponse(res, 400, false, "Failed to insert data.", null);
            }

        }


		// let otherParsedData  = {};
		// try {
		// 	otherParsedData = JSON.parse(others_data);
		// } catch (err) {
    //         otherParsedData = others_data;
		// 	// return userSendResponse(res, 400, false, "Invalid JSON format in data.", null);
		// }

    //     if (typeof otherParsedData !== 'object' || otherParsedData === null) {
    //         return userSendResponse(res, 400, false, "Invalid data format in others_data.", null);
    //     }

		// // Handle others_data
		// if (otherParsedData && typeof otherParsedData === "object") {
    //         // Handle approval logic
    //         if (otherParsedData.approval_details && otherParsedData.approval) {
    //             const approval = otherParsedData.approval;
    //             const approvalDetails = otherParsedData.approval_details;

    //             const existingApprovalItem = await ApprovalItem.findByPk(approval?.approval_item);
    //             if (!existingApprovalItem) {
    //                 await t.rollback();
    //                 return userSendResponse(res, 400, false, "Invalid approval item ID.");
    //             }
                
    //             const newApproval = await UiCaseApproval.create(
    //                 {
    //                     approval_item: approval.approval_item,
    //                     approved_by: approval.approved_by,
    //                     approval_date: approval.approval_date || new Date(),
    //                     remarks: approval.remarks,
    //                     reference_id: approvalDetails.id || recordId,
    //                     approval_type: default_status,
    //                     module: approvalDetails.module_name,
    //                     action: approvalDetails.action,
    //                     created_by: userId,
    //                 },
    //                 { transaction: t }
    //             );
                
    //             if (!recordId) {
    //                 await t.rollback();
    //                 return userSendResponse(res, 400, false, "Reference ID is required.");
    //             }


                
    //             await ApprovalActivityLog.create(
    //             {
    //               approval_id: newApproval.approval_id,
    //               approval_item_id: approval.approval_item,
    //               case_id: approvalDetails.id || recordId,
    //               approved_by: approval.approved_by,
    //               approved_date: approval.approval_date,
    //               approval_type: default_status,
    //               module: approvalDetails.module_name,
    //               created_by: userId,
    //           },
    //             { transaction: t }
    //           );
                              

    //             await System_Alerts.create(
    //                 {
    //                     approval_id: newApproval.approval_id,
    //                     reference_id : recordId,
    //                     alert_type: "Approval",
    //                     alert_message: newApproval.remarks,
    //                     created_by: userId,
    //                     created_by_designation_id: user_designation_id,
    //                     created_by_division_id: null,
    //                     send_to :insertedIO || null,
    //                 },
    //                 { transaction: t }
    //             );
    //         }

		// }

		await t.commit();
		return userSendResponse(res, 200, true, `Record Created Successfully`, null);

	} catch (error) {
		console.error("Error saving data to templates:", error);
		if (t) await t.rollback();
		const isDuplicate = error.name === "SequelizeUniqueConstraintError";
		return userSendResponse(res, isDuplicate ? 400 : 500, false, isDuplicate ? "Duplicate entry detected." : "Internal Server Error.", error);
	} finally {
		if (fs.existsSync(dirPath)) {
			fs.rmSync(dirPath, { recursive: true, force: true });
		}
	}
};


exports.submitActionPlanPR = async (req, res) => {
	const { transaction_id, ui_case_id , isSupervisior , user_divisio_id , user_designation_id , immediate_supervisior_id} = req.body;
	const { user_id: userId } = req.user;

	if (!transaction_id || !ui_case_id) {
		return userSendResponse(res, 400, false, "transaction_id and ui_case_id are required.", null);
	}

	let t = await dbConfig.sequelize.transaction();
	const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);

	try {
		// Duplicate transaction check
		if (fs.existsSync(dirPath)) {
			return res.status(400).json({ success: false, message: "Duplicate transaction detected.", dirPath });
		}
		fs.mkdirSync(dirPath, { recursive: true });

		// Get user info
		const userData = await Users.findOne({
			include: [{ model: KGID, as: "kgidDetails", attributes: ["kgid", "name", "mobile"] }],
			where: { user_id: userId },
		});
		const userName = userData?.kgidDetails?.name || null;

		// Validate action plan template
		const apTemplate = await Template.findOne({ where: { table_name: "cid_ui_case_action_plan" } });
		if (!apTemplate) {
			return userSendResponse(res, 400, false, "Action Plan template not found.", null);
		}

		// Fetch Action Plan records
		const actionPlanData = await sequelize.query(
			`SELECT * FROM cid_ui_case_action_plan WHERE ui_case_id = :ui_case_id`,
			{
				replacements: { ui_case_id },
				type: Sequelize.QueryTypes.SELECT,
				transaction: t,
			}
		);
		if (!actionPlanData?.length) {
			return userSendResponse(res, 400, false, "No Action Plan data found.", null);
		}

        if(!isSupervisior)
        {
            // Update field_status in Action Plan
            await sequelize.query(
                `UPDATE cid_ui_case_action_plan SET sys_status = 'IO' WHERE ui_case_id = :ui_case_id`,
                {
                    replacements: { ui_case_id },
                    type: Sequelize.QueryTypes.UPDATE,
                    transaction: t,
                }
            );

            const main_table = "cid_ui_case_action_plan";
            const record_id = ui_case_id || null;
            const module = "ui_case";
            const alert_type = "ACTION_PLAN";
            const alert_level = "low";
            const alert_message = "Please check the action plan and approver it.";
            const triggered_on = new Date();
            const status = "pending";
            const created_by = userId || null;
            const send_to_type = "user";
            const division_id = user_divisio_id|| null;
            const designation_id = immediate_supervisior_id || null;
            const assigned_io = userId || null;
            const userID = userId || null;
            const due_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            
            try {
                await CaseAlerts.create({
                module,
                main_table,
                record_id,
                alert_type,
                alert_level,
                alert_message,
                due_date,
                triggered_on,
                resolved_on: null,
                status,
                created_by,
                created_at: new Date(),
                send_to_type,
                division_id,
                designation_id,
                assigned_io,
                user_id:userID,
                transaction: t 
                });
            } catch (error) {
                console.error('Error inserting case alert:', error);
            }

        }
        else
        {
            // Update field_status in Action Plan
            await sequelize.query(
                `UPDATE cid_ui_case_action_plan SET field_submit_status = 'submit' WHERE ui_case_id = :ui_case_id`,
                {
                    replacements: { ui_case_id },
                    type: Sequelize.QueryTypes.UPDATE,
                    transaction: t,
                }
            );
    
            // Load Progress Report template
            const prTemplate = await Template.findOne({ where: { table_name: "cid_ui_case_progress_report" } });
            if (!prTemplate) {
                await t.rollback();
                return userSendResponse(res, 400, false, "Progress Report template not found.", null);
            }
    
            const progressSchema = typeof prTemplate.fields === "string" ? JSON.parse(prTemplate.fields) : prTemplate.fields;
    
            // Build Sequelize model from template schema
            const buildModelAttributes = (schema, sampleData) => {
                const completeSchema = [
                    { name: "created_by", data_type: "TEXT", not_null: false },
                    { name: "created_by_id", data_type: "INTEGER", not_null: false },
                    ...schema,
                ];
    
                ["sys_status", "ui_case_id", "pt_case_id"].forEach((field) => {
                    if (sampleData[field]) {
                        completeSchema.unshift({
                            name: field,
                            data_type: typeof sampleData[field] === "number" ? "INTEGER" : "TEXT",
                            not_null: false,
                        });
                    }
                });
    
                const modelAttributes = {};
                for (const field of completeSchema) {
                    const { name, data_type, not_null, default_value } = field;
                    const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
                    modelAttributes[name] = {
                        type: sequelizeType,
                        allowNull: !not_null,
                        defaultValue: default_value ?? null,
                    };
                }
                return modelAttributes;
            };
    
            const sampleData = actionPlanData[0];
            const modelAttributes = buildModelAttributes(progressSchema, sampleData);
    
            const ProgressReportModel = sequelize.define("cid_ui_case_progress_report", modelAttributes, {
                freezeTableName: true,
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
            });
    
            await ProgressReportModel.sync();
    
            // Prepare data to insert into PR
            const actionPlanDataToInsert = actionPlanData.map(item => {
                const newItem = {
                    ...item,
                    sys_status: "AP",
                    field_pr_status: "No",
                    created_by: userName,
                    created_by_id: userId,
                    ui_case_id: item.ui_case_id,
                    pt_case_id: item.pt_case_id,
                };
                delete newItem.id;
                delete newItem.created_at;
                delete newItem.updated_at;
                return newItem;
            });
    
            // Insert into Progress Report
            await ProgressReportModel.bulkCreate(actionPlanDataToInsert, { transaction: t });

            // await CaseHistory.create({
            //     template_id: otherTableData.template_id,
            //     table_row_id: recordId,
            //     user_id: userId,
            //     actor_name: userName,
            //     action: `Status Updated`,
            //     transaction: t
            // });

            try {
                // First, update existing matching alerts to "completed"
                await CaseAlerts.update(
                    { status: "completed" },
                    {
                        where: {
                            module: "ui_case",
                            record_id: ui_case_id,
                            alert_type: "ACTION_PLAN",
                            status: "pending"
                        },
                        transaction: t
                    }
                );
            }
            catch (error) {
                console.error('Error inserting case alert:', error);
            }
        }

		await t.commit();
		return userSendResponse(res, 200, true, "Action Plan submitted to Progress Report successfully.");

	} catch (error) {
		console.error("Error submitting Action Plan:", error);
		if (t) await t.rollback();
		const isDuplicate = error.name === "SequelizeUniqueConstraintError";
		return userSendResponse(
			res,
			isDuplicate ? 400 : 500,
			false,
			isDuplicate ? "Duplicate entry detected." : "Internal Server Error.",
			error
		);
	} finally {
		if (fs.existsSync(dirPath)) {
			fs.rmSync(dirPath, { recursive: true, force: true });
		}
	}
};



exports.submitPropertyFormFSL = async (req, res) => {
	const { transaction_id, ui_case_id, row_ids } = req.body;
	const { user_id: userId } = req.user;

	if (!transaction_id || !ui_case_id) {
		return userSendResponse(res, 400, false, "transaction_id and ui_case_id are required.", null);
	}

	let t = await dbConfig.sequelize.transaction();
	const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);

	try {
		// Duplicate transaction check
		if (fs.existsSync(dirPath)) {
			return res.status(400).json({ success: false, message: "Duplicate transaction detected.", dirPath });
		}
		fs.mkdirSync(dirPath, { recursive: true });

		// Get user info
		const userData = await Users.findOne({
			include: [{ model: KGID, as: "kgidDetails", attributes: ["kgid", "name", "mobile"] }],
			where: { user_id: userId },
		});
		const userName = userData?.kgidDetails?.name || null;

		// Validate action plan template
		const apTemplate = await Template.findOne({ where: { table_name: "cid_ui_case_property_form" } });
		if (!apTemplate) {
			return userSendResponse(res, 400, false, "Property Form template not found.", null);
		}

		// Fetch Property Form records
		const propertyFormData = await sequelize.query(
			`SELECT * FROM cid_ui_case_property_form WHERE ui_case_id = :ui_case_id`,
			{
				replacements: { ui_case_id },
				type: Sequelize.QueryTypes.SELECT,
				transaction: t,
			}
		);
		if (!propertyFormData?.length) {
			return userSendResponse(res, 400, false, "No Property Form data found.", null);
		}

		// Update sys_status only for selected row_ids
		await sequelize.query(
			`UPDATE cid_ui_case_property_form SET sys_status = 'submit' WHERE id IN (:row_ids)`,
			{
				replacements: { row_ids },
				type: Sequelize.QueryTypes.UPDATE,
				transaction: t,
			}
		);

		// Load FSL template
		const prTemplate = await Template.findOne({ where: { table_name: "cid_ui_case_forensic_science_laboratory" } });
		if (!prTemplate) {
			await t.rollback();
			return userSendResponse(res, 400, false, "FSL template not found.", null);
		}

		const progressSchema = typeof prTemplate.fields === "string" ? JSON.parse(prTemplate.fields) : prTemplate.fields;

		// Build Sequelize model from template schema
		const buildModelAttributes = (schema, sampleData) => {
			const completeSchema = [
				{ name: "created_by", data_type: "TEXT", not_null: false },
				{ name: "created_by_id", data_type: "INTEGER", not_null: false },
				...schema,
			];

			["sys_status", "ui_case_id", "pt_case_id"].forEach((field) => {
				if (sampleData[field]) {
					completeSchema.unshift({
						name: field,
						data_type: typeof sampleData[field] === "number" ? "INTEGER" : "TEXT",
						not_null: false,
					});
				}
			});

			const modelAttributes = {};
			for (const field of completeSchema) {
				const { name, data_type, not_null, default_value } = field;
				const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
				modelAttributes[name] = {
					type: sequelizeType,
					allowNull: !not_null,
					defaultValue: default_value ?? null,
				};
			}
			return modelAttributes;
		};

		const sampleData = propertyFormData[0];
		const modelAttributes = buildModelAttributes(progressSchema, sampleData);

		const PropertyFormModel = sequelize.define("cid_ui_case_forensic_science_laboratory", modelAttributes, {
			freezeTableName: true,
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
		});

		await PropertyFormModel.sync();

		// Filter selected rows only
		const filteredPropertyFormData = propertyFormData.filter(item => row_ids.includes(item.id));

		const propertyFormDataToInsert = filteredPropertyFormData.map(item => {
			const newItem = {
				...item,
				sys_status: "PF",
				created_by: userName,
				created_by_id: userId,
				ui_case_id: item.ui_case_id,
				pt_case_id: item.pt_case_id,
			};
			delete newItem.id;
			delete newItem.created_at;
			delete newItem.updated_at;
			return newItem;
		});

		// Insert selected rows into Progress Report
		await PropertyFormModel.bulkCreate(propertyFormDataToInsert, { transaction: t });

		await t.commit();
		return userSendResponse(res, 200, true, "Action Plan submitted to Progress Report successfully.");
	} catch (error) {
		console.error("Error submitting Action Plan:", error);
		if (t) await t.rollback();
		const isDuplicate = error.name === "SequelizeUniqueConstraintError";
		return userSendResponse(
			res,
			isDuplicate ? 400 : 500,
			false,
			isDuplicate ? "Duplicate entry detected." : "Internal Server Error.",
			error
		);
	} finally {
		if (fs.existsSync(dirPath)) {
			fs.rmSync(dirPath, { recursive: true, force: true });
		}
	}
};

function normalizeValues(values, expectedType) {
  return values
    .filter((v) => v !== null && v !== undefined)
    .map((v) => {
      if (expectedType === 'string') return String(v);
      if (expectedType === 'int') return Number(v);
      return v;
    });
}


