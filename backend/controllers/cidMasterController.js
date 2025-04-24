const { adminSendResponse } = require("../services/adminSendResponse");
const { userSendResponse } = require("../services/userSendResponse");
const db = require("../models");
const { Department, Designation, Division, UsersDepartment,  UsersDivision,  UserDesignation,  Users, Role , KGID , UsersHierarchy} = require("../models");
const { Op, where } = require("sequelize");

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
  const  { designation_id, get_flag , division_id} = req.body;
  try {

        let usersData  = [];
        let userDesignations = "";
        let userIds = [];
        if(get_flag && get_flag === "upper" && designation_id){
            const userHierarchy = await UsersHierarchy.findAll({
                where: {
                    officer_designation_id: designation_id,
                },
                attributes: ["supervisor_designation_id"],
                raw: true,
            });
            if (!userHierarchy || userHierarchy.length === 0) {
                return res.status(200).json({ data: [] });
            }
            const superivisors = userHierarchy.map(user => user.supervisor_designation_id);
            // Fetch users based on the userIds from the userDesignations table
            userDesignations = await UserDesignation.findAll({
                where: {
                    designation_id: {
                        [Op.in]: superivisors,
                    },
                },
                attributes: ["user_id"],
                raw: true,
            });
            if (!userDesignations || userDesignations.length === 0) {
                return res.status(200).json({ data: [] });
            }
            userIds = userDesignations.map(user => user.user_id && user.user_id !== null ? user.user_id : null).filter(userId => userId !== null);
            usersData = await Users.findAll({
                where: {
                    user_id: {
                        [Op.in]: userIds,
                    },
                    dev_status: true,
                },
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
                        attributes: ["kgid", "name", "mobile"], // Fetch name here
                    },
                ],
                attributes: ["user_id"],
                raw: true, // Flatten the result
                nest: true, // Keeps relations grouped
            });
        }
        else if(get_flag && get_flag === "lower" && designation_id){
            const userHierarchy = await UsersHierarchy.findAll({
                where: {
                    supervisor_designation_id: designation_id,
                },
                attributes: ["officer_designation_id"],
                raw: true,
            });
            if (!userHierarchy || userHierarchy.length === 0) {
                return res.status(200).json({ data: [] });
            }
            const officersIds = userHierarchy.map(user => user.officer_designation_id);
            userDesignations = await UserDesignation.findAll({
                where: {
                    designation_id: {
                        [Op.in]: officersIds,
                    },
                },
                attributes: ["user_id"],
                raw: true,
            });
            if (!userDesignations || userDesignations.length === 0) {
                return res.status(200).json({ data: [] });
            }
            userIds = userDesignations.map(user => user.user_id && user.user_id !== null ? user.user_id : null).filter(userId => userId !== null);
            
            usersData = await Users.findAll({
                where: {
                    user_id: {
                        [Op.in]: userIds,
                    },
                    dev_status: true,
                },
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
                        attributes: ["kgid", "name", "mobile"], // Fetch name here
                    },
                ],
                attributes: ["user_id"],
                raw: true, // Flatten the result
                nest: true, // Keeps relations grouped
            });
        }
        else if(get_flag && get_flag === "All" && division_id)
        {
            const usersDivisionData = await UsersDivision.findAll({
                where: {
                    // division_id: { [Op.in]: division_ids },
                    division_id,
                },
                attributes: ["user_id"],
                raw: true,
            });
            if (!usersDivisionData || usersDivisionData.length === 0) {
                return res.status(200).json({ data: [] });
            }
            const userIds = usersDivisionData.map(ud => ud.user_id).filter(uid => uid != null);
            
            // Build the query filter for Users.
            const whereClause = {
                user_id: { [Op.in]: userIds },
                dev_status: true,
            };

            usersData = await Users.findAll({
                where: whereClause,
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
                ],
                attributes: ["user_id"],
                raw: true,
                nest: true,
            });
            
            // // Transform output: move kgidDetails.name to top level.
            // const users = usersData.map(user => ({
            //     ...user,
            //     name: user.kgidDetails?.name || "Unknown",
            //     kgid: user.kgidDetails?.kgid || "Unknown",
            //     mobile: user.kgidDetails?.mobile || "Unknown",
            //     kgidDetails: undefined, // remove nested object if not needed
            // }));
        }
        else{
            usersData = await Users.findAll({
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
                        attributes: ["kgid", "name", "mobile"], // Fetch name here
                    },
                    // {
                    //     model: UserDesignation,
                    //     as: "users_designations",
                    //     attributes: ["designation_id"],
                    //     include: [
                    //         {
                    //             model: Designation,
                    //             as: "designation",
                    //             attributes: ["designation_name"],
                    //         },
                    //     ],
                    // },
                    // {
                    //     model: UsersDepartment,
                    //     as: "users_departments",
                    //     attributes: ["department_id"],
                    //     include: [
                    //         {
                    //             model: Department,
                    //             as: "department",
                    //             attributes: ["department_name"],
                    //         },
                    //     ],
                    // },
                    // {
                    //     model: UsersDivision,
                    //     as: "users_division",
                    //     attributes: ["division_id"],
                    //     include: [
                    //         {
                    //             model: Division,
                    //             as: "division",
                    //             attributes: ["division_name"],
                    //         },
                    //     ],
                    // },
                ],
                attributes: ["user_id"],
                where: {
                    dev_status: true,
                },
                raw: true, // Flatten the result
                nest: true, // Keeps relations grouped
            });
        }

    // Transform output to move kgidDetails.name to the top level
    const users = usersData.map(user => ({
        ...user,
        name: user.kgidDetails?.name || "Unknown", // Move name to top level
        kgidDetails: undefined // Remove the nested object if not needed
    }));

    return res.status(200).json({ data : users});
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

const getIoUsersBasedOnDivision = async (req, res) => {
    const excluded_role_ids = [1, 10, 21];
    const { division_ids, role_id } = req.body; // division_ids should be an array
    try {
        if (!Array.isArray(division_ids) || division_ids.length === 0) {
            return res.status(400).json({ message: "Division IDs array is required." });
        }
        // Get user IDs from UsersDivision table based on provided divisions.
        const usersDivisionData = await UsersDivision.findAll({
            where: {
                division_id: { [Op.in]: division_ids },
            },
            attributes: ["user_id"],
            raw: true,
        });
        if (!usersDivisionData || usersDivisionData.length === 0) {
            return res.status(200).json({ data: [] });
        }
        const userIds = usersDivisionData.map(ud => ud.user_id).filter(uid => uid != null);
        
        // Build the query filter for Users.
        const whereClause = {
            user_id: { [Op.in]: userIds },
            dev_status: true,
        };
        // Update: role_id is in the Users table, so filter directly.
        if (role_id) {
            whereClause["role_id"] = role_id;
        }
        
        const usersData = await Users.findAll({
            where: whereClause,
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
            ],
            attributes: ["user_id"],
            raw: true,
            nest: true,
        });
        
        // Transform output: move kgidDetails.name to top level.
        const users = usersData.map(user => ({
            ...user,
            name: user.kgidDetails?.name || "Unknown",
            kgid: user.kgidDetails?.kgid || "Unknown",
            mobile: user.kgidDetails?.mobile || "Unknown",
            kgidDetails: undefined, // remove nested object if not needed
        }));
        
        return res.status(200).json({ data: users });
    } catch (error) {
        console.error("Error fetching users based on division:", error);
        return res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

module.exports = {
    getAllDepartments,
    getAllDesignations,
    getAllDivisions,
    getIoUsers,
    getIoUsersBasedOnDivision,
};