const { adminSendResponse } = require("../services/adminSendResponse");
const { userSendResponse } = require("../services/userSendResponse");
const db = require("../models");
const { Department, Designation, Division, UsersDepartment,  UsersDivision,  UserDesignation,  Users, Role , KGID} = require("../models");
const { Op } = require("sequelize");

const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({
            // include: [{ model: db.Designation, as: 'designations' }],
            order: [['department_name', 'ASC']]
        });

        if (!departments || departments.length === 0) {
            return adminSendResponse(res, 200, true, "Departments retrieved successfully", []);
        }

        return adminSendResponse(res, 200, true, "Departments retrieved successfully", [ ...departments ]);
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
            return adminSendResponse(res, 200, true, "Designations retrieved successfully", []);
        }

        return adminSendResponse(res, 200, true, "Designations retrieved successfully", [ ...designations ]);
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
            return adminSendResponse(res, 200, true, "Divisions retrieved successfully", []);
        }

        return adminSendResponse(res, 200, true, "Divisions retrieved successfully", [ ...divisions ]);
    } catch (error) {
        console.error("Error fetching divisions:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};


const getIoUsers = async (req, res) => {
  const excluded_role_ids = [1, 10, 21];
  try {
    const users = await Users.findAll({
      
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
          attributes: ["kgid", "name", "mobile"],
        },
        {
          model: UserDesignation,
          as: "users_designations",
          attributes: ["designation_id"],
          include: [
            {
              model: Designation,
              as: "designation",
              attributes: ["designation_name"],
            },
          ],
        },
        {
          model: UsersDepartment,
          as: "users_departments",
          attributes: ["department_id"],
          include: [
            {
              model: Department,
              as: "department",
              attributes: ["department_name"],
            },
          ],
        },
        {
          model: UsersDivision,
          as: "users_division",
          attributes: ["division_id"],
          include: [
            {
              model: Division,
              as: "division",
              attributes: ["division_name"],
            },
          ],
        },
      ],
      attributes: ["user_id", "role_id", "kgid", "dev_status"],
    });

    return res.status(200).json({ data : users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};



module.exports = {
    getAllDepartments,
    getAllDesignations,
    getAllDivisions,
    getIoUsers
};