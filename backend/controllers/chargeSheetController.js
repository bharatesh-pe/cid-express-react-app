const { ChargeSheet } = require("../models");
const { sequelize } = require("../models");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer(); 
const db = require('../models'); // adjust as per your project structure
const mime = require('mime-types');

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
// Helper to save file to data/case/...
const saveSupportingDocuments = async (files, caseId) => {
    const uploadDir = path.join(__dirname, '../../data/case', String(caseId));
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const savedFiles = [];
    for (const file of files) {
        const filePath = path.join(uploadDir, file.originalname);
        fs.writeFileSync(filePath, file.buffer);
        savedFiles.push(`/data/case/${caseId}/${file.originalname}`);
    }
    return savedFiles;
};

module.exports = {
    async getChargeSheetData(req, res) {
        try {

            const { case_id, module } = req.body;

            if (!case_id || !module) {
                return res.status(400).json({ message: "Missing case_id or module" });
            }

            const chargeSheet = await ChargeSheet.findOne({
                where: {
                    case_id: case_id,
                    module: module
                }
            });

            if (!chargeSheet) {
                return res.json({ message: "Charge Sheet not found" });
            }

            res.json({ success: true, data: chargeSheet });

        } catch (error) {
            console.error("Error fetching Charge Sheet:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async updateChargeSheetData(req, res) {
        try {
            const { id, data } = req.body;
            if (!id) return res.status(400).json({ message: "Missing id" });

            const [updated] = await ChargeSheet.update(data, {
                where: { id },
            });

            if (!updated){
                return res.json({success: false, message: "Charge Sheet not found or no changes made",});
            }

            res.json({ success: true, message: "Charge Sheet Updated" });
        } catch (error) {
            console.error("Error updating Charge Sheet:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async getChargeSheetFullDetails(req, res) {
        try {
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ message: "Missing charge sheet id" });
            }

            // Get accused template and data
            const accusedTemplate = await Template.findOne({ where: { table_name: "cid_ui_case_accused" } });
            let accusedData = [];
            let accusedFields = [];
            if (accusedTemplate) {
                accusedFields = typeof accusedTemplate.fields === "string"
                    ? JSON.parse(accusedTemplate.fields)
                    : accusedTemplate.fields;

                let rawAccusedData = await sequelize.query(
                    "SELECT * FROM cid_ui_case_accused WHERE ui_case_id = :id",
                    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
                );

                // Map dropdown/radio/checkbox values to labels
                accusedData = rawAccusedData.map(row => {
                    const mapped = { ...row };
                    accusedFields.forEach(field => {
                        if (
                            (field.type === "dropdown" || field.type === "radio" || field.type === "checkbox") &&
                            Array.isArray(field.options)
                        ) {
                            // Support both value/code and label/name
                            const option = field.options.find(
                                opt =>
                                    opt.value === row[field.name] ||
                                    opt.code === row[field.name] ||
                                    opt.name === row[field.name] ||
                                    opt.label === row[field.name]
                            );
                            if (option) {
                                mapped[field.name] = option.name || option.label || option.value || option.code;
                            }
                        }
                    });
                    return mapped;
                });
            }

            // Get FSL template and data
            const fslTemplate = await Template.findOne({ where: { table_name: "cid_ui_case_forensic_science_laboratory" } });
            let fslData = [];
            let fslFields = [];
            if (fslTemplate) {
                fslFields = typeof fslTemplate.fields === "string"
                    ? JSON.parse(fslTemplate.fields)
                    : fslTemplate.fields;

                let rawFslData = await sequelize.query(
                    "SELECT * FROM cid_ui_case_forensic_science_laboratory WHERE ui_case_id = :id",
                    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
                );

                fslData = rawFslData.map(row => {
                    const mapped = { ...row };
                    fslFields.forEach(field => {
                        if (
                            (field.type === "dropdown" || field.type === "radio" || field.type === "checkbox") &&
                            Array.isArray(field.options)
                        ) {
                            const option = field.options.find(
                                opt =>
                                    opt.value === row[field.name] ||
                                    opt.code === row[field.name] ||
                                    opt.name === row[field.name] ||
                                    opt.label === row[field.name]
                            );
                            if (option) {
                                mapped[field.name] = option.name || option.label || option.value || option.code;
                            }
                        }
                    });
                    return mapped;
                });
            }

            // Get witness template and data
            const witnessTemplate = await Template.findOne({ where: { table_name: "cid_pt_case_witness" } });
            let witnessData = [];
            let witnessFields = [];
            if (witnessTemplate) {
                witnessFields = typeof witnessTemplate.fields === "string"
                    ? JSON.parse(witnessTemplate.fields)
                    : witnessTemplate.fields;

                let rawWitnessData = await sequelize.query(
                    "SELECT * FROM cid_pt_case_witness WHERE ui_case_id = :id",
                    { replacements: { id }, type: sequelize.QueryTypes.SELECT }
                );

                witnessData = rawWitnessData.map(row => {
                    const mapped = { ...row };
                    witnessFields.forEach(field => {
                        if (
                            (field.type === "dropdown" || field.type === "radio" || field.type === "checkbox") &&
                            Array.isArray(field.options)
                        ) {
                            const option = field.options.find(
                                opt =>
                                    opt.value === row[field.name] ||
                                    opt.code === row[field.name] ||
                                    opt.name === row[field.name] ||
                                    opt.label === row[field.name]
                            );
                            if (option) {
                                mapped[field.name] = option.name || option.label || option.value || option.code;
                            }
                        }
                    });
                    return mapped;
                });
            }

            const allUIData = await Template.findOne({ where: { table_name: "cid_under_investigation" } });
            if (!allUIData) {
                return res.status(404).json({ message: "UI Data template not found" });
            }
            const allUIFields = typeof allUIData.fields === "string"
                ? JSON.parse(allUIData.fields)
                : allUIData.fields;
            const allUIDataResult = await sequelize.query(
                "SELECT * FROM cid_under_investigation WHERE id = :id",
                { replacements: { id }, type: sequelize.QueryTypes.SELECT }
            );
            // Map dropdown/radio/checkbox values to labels if needed
            const allUIDataMapped = allUIDataResult.map(row => {
                const mapped = { ...row };
                allUIFields.forEach(field => {
                    if (
                        (field.type === "dropdown" || field.type === "radio" || field.type === "checkbox") &&
                        Array.isArray(field.options)
                    ) {
                        const option = field.options.find(
                            opt =>
                                opt.value === row[field.name] ||
                                opt.code === row[field.name] ||
                                opt.name === row[field.name] ||
                                opt.label === row[field.name]
                        );
                        if (option) {
                            mapped[field.name] = option.name || option.label || option.value || option.code;
                        }
                    }
                });
                return mapped;
            });

            res.json({
                success: true,
                accusedTemplate,
                accusedData,
                witnessTemplate,
                witnessData,
                fslTemplate,
                fslData,
                allUIData: allUIDataMapped[0] || {},
                allUIFields: allUIFields,
                message: "Full Charge Sheet details fetched successfully"
            });
        } catch (error) {
            console.error("Error fetching full Charge Sheet details:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // POST /chargeSheet/saveChargeSheetData
    async saveChargeSheetData(req, res) {
        // This implementation mimics updateTemplateData, expects table_name, id, data from frontend
        try {
            // If using multer, req.body fields may not be parsed for multipart/form-data unless fields are registered
            // Use upload.any() to ensure fields/files are parsed for all requests
            // If this controller is not already wrapped with multer middleware, do it here:
            await new Promise((resolve, reject) => {
                upload.any()(req, res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Now req.body should have the fields
            let table_name = req.body.table_name;
            let id = req.body.id;
            let data = req.body.data;

            // Defensive: try to extract from keys if not present
            if (!table_name) {
                for (const key in req.body) {
                    if (key.toLowerCase() === "table_name") table_name = req.body[key];
                }
            }
            if (!id) {
                for (const key in req.body) {
                    if (key.toLowerCase() === "id") id = req.body[key];
                }
            }
            if (!data) {
                for (const key in req.body) {
                    if (key.toLowerCase() === "data") data = req.body[key];
                }
            }

            // Log for debugging
            console.log("saveChargeSheetData parsed req.body:", req.body);
            console.log("table_name:", table_name, "id:", id, "data:", data);

            if (!table_name || !id || !data) {
                return res.status(400).json({ success: false, message: "Missing table_name, id, or data" });
            }

            // Fetch the table template
            const tableData = await Template.findOne({ where: { table_name } });
            if (!tableData) {
                return res.status(400).json({ success: false, message: `Table ${table_name} does not exist.` });
            }

            // Parse schema and request data
            const schema = typeof tableData.fields === "string"
                ? JSON.parse(tableData.fields)
                : tableData.fields;
            let parsedData;
            try {
                parsedData = typeof data === "string" ? JSON.parse(data) : data;
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid JSON format in data." });
            }

            // Validate and filter data for schema-based fields
            const validData = {};
            for (const field of schema) {
                const { name, not_null } = field;
                if (parsedData.hasOwnProperty(name)) {
                    validData[name] = parsedData[name];
                } else if (not_null && !parsedData[name]) {
                    return res.status(400).json({ success: false, message: `Field ${name} cannot be null.` });
                }
            }

            // Handle file uploads (supporting documents)
            let supportingDocs = [];
            if (req.files && req.files.length > 0) {
                supportingDocs = await saveSupportingDocuments(req.files, id);
                // Assume the file field is named as in the schema, e.g., "cs_supporting_documents"
                // Always set the supporting document field if files are uploaded
                if (supportingDocs.length > 0) {
                    validData["cs_supporting_documents"] = supportingDocs.join(',');
                }
            }

            // Remove undefined, null, empty string, or empty array/object fields
            Object.keys(validData).forEach(key => {
                const val = validData[key];
                if (
                    val === undefined ||
                    val === null ||
                    (typeof val === "string" && val.trim() === "") ||
                    (Array.isArray(val) && val.length === 0) ||
                    (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0)
                ) {
                    delete validData[key];
                }
            });

            // Convert arrays/objects to JSON strings for DB if needed
            Object.keys(validData).forEach(key => {
                if (Array.isArray(validData[key]) || typeof validData[key] === "object") {
                    validData[key] = JSON.stringify(validData[key]);
                }
            });

            // Build update query
            const updateFields = [];
            const replacements = { id };
            Object.keys(validData).forEach(key => {
                // If the field name contains special characters (like / or .), quote it for SQL
                // This works for PostgreSQL, which uses double quotes for identifiers
                let safeKey = key;
                if (/[^a-zA-Z0-9_]/.test(key)) {
                    safeKey = `"${key.replace(/"/g, '""')}"`;
                }
                // Use positional parameters ($1, $2, ...) for all values to avoid :namedParam syntax error with quoted identifiers
                updateFields.push(`${safeKey} = ?`);
                replacements[key] = validData[key];
            });

            // Prepare values in the same order as updateFields
            const values = Object.keys(validData).map(key => validData[key]);
            values.push(id); // for WHERE id = ?

            if (updateFields.length === 0) {
                return res.status(400).json({ success: false, message: "No fields to update" });
            }

            await sequelize.query(
                `UPDATE ${table_name} SET ${updateFields.join(', ')} WHERE id = ?`,
                {
                    replacements: values,
                    type: sequelize.QueryTypes.UPDATE
                }
            );

            res.json({ success: true, message: "Charge sheet data saved successfully" });
        } catch (err) {
            console.error("saveChargeSheetData error:", err);
            res.status(500).json({ success: false, message: "Error saving charge sheet data" });
        }
    },

  
// POST /chargesheet/getProfileAttachment
async getProfileAttachment(req, res) {
  try {
    const { tableName, tableRowId, fieldName } = req.body;

    const profileAttachment = await ProfileAttachment.findOne({
      where: {
        table_row_id: tableRowId,
        field_name: fieldName,
      },
      order: [['created_at', 'DESC']],
    });

    if (!profileAttachment) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileRelativePath = path.join(profileAttachment.s3_key);

    if (!fs.existsSync(path.join(__dirname, fileRelativePath))) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Return file metadata instead of streaming
   return res.status(200).json({
    success: true,
  file_path: `${profileAttachment.s3_key.replace(/\\/g, '/')}`,
  attachment_name: profileAttachment.attachment_name,
  profile_attachment_id: profileAttachment.profile_attachment_id,

});


  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}





};


