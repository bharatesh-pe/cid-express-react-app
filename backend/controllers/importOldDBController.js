const db = require("../models");
const { Template } = require("../models");
const XLSX = require("xlsx");
const Sequelize = require("sequelize");
const dbConfig = require("../models");
const { Op } = Sequelize;

const typeMapping = {
    "SHORT TEXT": Sequelize.STRING,
    "LONG TEXT": Sequelize.TEXT,
    "NUMBER": Sequelize.INTEGER,
    "DATE": Sequelize.DATE,
    "BOOLEAN": Sequelize.BOOLEAN,
    "DROPDOWN": Sequelize.STRING,
    "AUTOCOMPLETE": Sequelize.STRING,
    "TEXT": Sequelize.STRING,
};

exports.import_old_data = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

        const transaction = await dbConfig.sequelize.transaction();
        let Model = null;
        let previousTableName = "";

        for (const row of excelData) {
            if (row.IsUI && row.IsUI === 2) {
                const table_name = "cid_under_investigation";

                if (!Model || previousTableName !== table_name) {
                    const tableData = await Template.findOne({ where: { table_name } });
                    if (!tableData) {
                        return res.status(400).json({ message: `Table ${table_name} not found.` });
                    }

                    const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;

                    const completeSchema = [
                        { name: "created_by", data_type: "TEXT", required: false },
                        { name: "created_by_id", data_type: "INTEGER", required: false },
                        ...schema
                    ];

                    const modelAttributes = {};
                    for (const field of completeSchema) {
                        const sequelizeType = typeMapping[(field.data_type || "").toUpperCase()] || Sequelize.STRING;
                        modelAttributes[field.name] = {
                            type: sequelizeType,
                            allowNull: true,
                            defaultValue: field.default_value || null,
                        };
                    }

                    Model = dbConfig.sequelize.define(table_name, modelAttributes, {
                        freezeTableName: true,
                        timestamps: true,
                        createdAt: "created_at",
                        updatedAt: "updated_at"
                    });

                    await Model.sync();
                    previousTableName = table_name;
                }

                const record = {};
                for (const key of Object.keys(row)) {
                    if (Model.rawAttributes[key]) {
                        const attrType = Model.rawAttributes[key].type;

                        if (
                            attrType instanceof Sequelize.DATE &&
                            (row[key] === "Invalid date" || isNaN(new Date(row[key])))
                        ) {
                            record[key] = null;
                        } else {
                            record[key] = row[key];

                            if(key === "field_case_type")
                            {
                                //get the id from the cid_case_type table where the publickey is equal to the value in row[key]
                                var query = `SELECT id FROM cid_case_type WHERE publickey = :publickey`;
                                var caseType = await dbConfig.sequelize.query(query, {
                                    replacements: { publickey: row[key] },
                                    type: Sequelize.QueryTypes.SELECT
                                });
                                if (caseType.length > 0) {
                                    record["field_case_type"] = caseType[0].id;
                                } else {
                                    record["field_case_type"] = null; // or handle as needed
                                }
                            }
                            if(key === "field_dept_unit")
                            {
                                //get the id from the division table where the publickey is equal to the value in row[key]
                                var query = `SELECT division_id,department_id FROM division WHERE publickey = :publickey`;
                                var division = await dbConfig.sequelize.query(query, {
                                    replacements: { publickey: row[key] },
                                    type: Sequelize.QueryTypes.SELECT
                                });
                                if (division.length > 0) {
                                    record["field_division"] = division[0].division_id;
                                    record["field_dept_unit"] = division[0].department_id;
                                } else {
                                    record["field_division"] = null;
                                    record["field_dept_unit"] = null;
                                }
                            }
                            if(key === "field_referring_agency")
                            {
                                //get the id from the cid_referring_agency table where the publickey is equal to the value in row[key]
                                var query = `SELECT id FROM cid_referring_agency WHERE publickey = :publickey`;
                                var agency = await dbConfig.sequelize.query(query, {
                                    replacements: { publickey: row[key] },
                                    type: Sequelize.QueryTypes.SELECT
                                });
                                if (agency.length > 0) {
                                    record["field_referring_agency"] = agency[0].id;
                                } else {
                                    record["field_referring_agency"] = null; // or handle as needed
                                }
                            }

                        }
                    }
                }

                record.created_by = "system";
                record.created_by_id = 0;

                await Model.create(record, { transaction });
            }
        }

        await transaction.commit();
        return res.json({ message: "Data imported successfully." });

    } catch (error) {
        console.error("Import Error:", error);
        return res.status(500).json({ message: "Failed to import data", error: error.message });
    }
};
