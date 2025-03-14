const { adminSendResponse } = require("../services/adminSendResponse");
const { userSendResponse } = require("../services/userSendResponse");
const db = require("../models");
const { Department, Designation, Division } = require("../models");
const { Op } = require("sequelize");

const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({
            // include: [{ model: db.Designation, as: 'designations' }],
            order: [['department_name', 'ASC']]
        });

        if (!departments || departments.length === 0) {
            return adminSendResponse(res, 200, true, "Departments retrieved successfully", { data: [] });
        }

        return adminSendResponse(res, 200, true, "Departments retrieved successfully", { data: departments });
    } catch (error) {
        console.error("Error fetching departments:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const getAllDesignations = async (req, res) => {
    try {
        const designations = await Designation.findAll({
            attributes: ["designation_id", "designation_name", "description", "created_by", "created_at"],
            order: [["designation_name", "ASC"]],
        });

        if (!designations || designations.length === 0) {
            return adminSendResponse(res, 200, true, "Designations retrieved successfully", { data: [] });
        }

        return adminSendResponse(res, 200, true, "Designations retrieved successfully", { data: designations });
    } catch (error) {
        console.error("Error fetching designations:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};
const getAllDivisions = async (req, res) => {
    try {
        const divisions = await Division.findAll({
            // include: [{ model: Department, as: "department" }],
            order: [["division_name", "ASC"]]
        });

        if (!divisions || divisions.length === 0) {
            return adminSendResponse(res, 200, true, "Divisions retrieved successfully", { data: [] });
        }

        return adminSendResponse(res, 200, true, "Divisions retrieved successfully", { data: divisions });
    } catch (error) {
        console.error("Error fetching divisions:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};


module.exports = {
    getAllDepartments,
    getAllDesignations,
    getAllDivisions
};