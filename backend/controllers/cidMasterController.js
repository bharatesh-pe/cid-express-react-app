const { adminSendResponse } = require("../services/adminSendResponse");
const { userSendResponse } = require("../services/userSendResponse");
const db = require("../models");
const { Department, Designation, Division, UsersDepartment,  UsersDivision,  UserDesignation,  Users, Role , KGID ,UsersHierarchyNew,DesignationDivision , Act , Section} = require("../models");
const { Op, where } = require("sequelize");
const e = require("express");
const Sequelize = require("sequelize");
const sequelize = db.sequelize;

const getAllDepartments = async (req, res) => {

    const  { get_flag } = req.body;
    try {

        const userId = req.user?.user_id || null;
        var departments = {};
        if( get_flag && get_flag === "All" ){
            departments = await Department.findAll({
                // include: [{ model: db.Designation, as: 'designations' }],
                order: [['department_name', 'ASC']]
            });
        }
        else{
            if (userId !== 1) {
                // Fetch department for the logged-in user
                const userDepartment = await UsersDepartment.findAll({
                    where: { user_id : userId },
                    attributes: ["department_id"],
                });
                
                if (!userDepartment.length) {
                    return res.status(404).json({ message: "User has no designations assigned" });
                }
                const userDepartments = userDepartment.map((ud) => ud.department_id);

                departments = await Department.findAll({
                    where: { department_id : { [Op.in]: userDepartments } },
                    order: [['department_name', 'ASC']]
                });
            }
            else
            {
                departments = await Department.findAll({
                    order: [['department_name', 'ASC']]
                });
            }
        }

        if (!departments || departments.length === 0) {
            return adminSendResponse(res, 200, true, "Departments retrieved successfully", []);
        }

        return adminSendResponse(res, 200, true, "Departments retrieved successfully", [ ...departments ]);
    } catch (error) {
        console.error("Error fetching departments:", error.message);
        return adminSendResponse(res, 500, false, "Failed to fetch departments: " + error.message || "Internal Server Error");
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
        return adminSendResponse(res, 500, false, "Failed to fetch designations: " + error.message || "Internal Server Error");
    }
};

const getAllDivisions = async (req, res) => {
    try {

        const userId = req.user?.user_id || null;
        var divisions = {};

        if (userId !== 1) {
            // Fetch division for the logged-in user
            const userDivision = await UsersDivision.findAll({
                where: { user_id : userId },
                attributes: ["division_id"],
            });
            
            if (!userDivision.length) {
                return res.status(404).json({ message: "User has no designations assigned" });
            }
            const userDivisions = userDivision.map((ud) => ud.division_id);

            divisions = await Division.findAll({
                // include: [{ model: Department, as: "department" }],
                where: { division_id : { [Op.in]: userDivisions } },
                order: [["division_name", "ASC"]]
            });
        }
        else
        {
            divisions = await Division.findAll({
                // include: [{ model: Department, as: "department" }],
                order: [["division_name", "ASC"]]
            });
        }

        if (!divisions || divisions.length === 0) {
            return adminSendResponse(res, 200, true, "Divisions retrieved successfully", []);
        }

        return adminSendResponse(res, 200, true, "Divisions retrieved successfully", [ ...divisions ]);
    } catch (error) {
        console.error("Error fetching divisions:", error.message);
        return adminSendResponse(res, 500, false, "Failed to fetch divisions: " + error.message || "Internal Server Error");
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
            const userHierarchy = await UsersHierarchyNew.findAll({
                where: {
                    officer_designation_id: designation_id,
                },
                attributes: ["supervisor_designation_id"],
                raw: true,
            });
            // if (!userHierarchy || userHierarchy.length === 0) {
            //     return res.status(200).json({ data: [] });
            // }
            const superivisors = [];

             if(division_id)
            {
                const divisionSupervisorsIds = userHierarchy.map(user => user.supervisor_designation_id);
                const designation_division = await DesignationDivision.findAll({
                    where: {
                        designation_id: { [Op.in]: divisionSupervisorsIds },
                        division_id:  division_id,
                    },
                    attributes: ["designation_id"],
                    raw: true,
                });

                // if (!designation_division || designation_division.length === 0) {
                //     return res.status(200).json({ data: [] });
                // }
                const designationIds = designation_division.map(user => user.designation_id);
                superivisors.push(...designationIds);
                // Add the current designation_id to the supervisors list
                superivisors.push(designation_id);
            }
            else{
                 superivisors = userHierarchy.map(user => user.supervisor_designation_id);
                // Add the current designation_id to the supervisors list
                superivisors.push(designation_id);
            }
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
                        attributes: ["kgid", "name", "mobile"],
                    },
                    {
                        model: UserDesignation, 
                        as: "users_designations",
                        attributes: ["users_designation_id", "designation_id"],
                        include: [
                            {
                            model: Designation,
                            as: "designation",
                            attributes: ["designation_name"],
                            },
                        ],
                    },
                ],
                attributes: ["user_id"],
                raw: true,
                nest: true,
            });

        }
        else if(get_flag && get_flag === "lower" && designation_id ){
            const userHierarchy = await UsersHierarchyNew.findAll({
                where: {
                    supervisor_designation_id: designation_id,
                },
                attributes: ["officer_designation_id"],
                raw: true,
            });
            // if (!userHierarchy || userHierarchy.length === 0) {
            //     return res.status(200).json({ data: [] });
            // }

            var officersIds = [];

            if(division_id)
            {
                const divisionOfficersIds = userHierarchy.map(user => user.officer_designation_id);
                const designation_division = await DesignationDivision.findAll({
                    where: {
                        designation_id:{ [Op.in]: divisionOfficersIds },
                        division_id:  division_id,
                    },
                    attributes: ["designation_id"],
                    raw: true,
                });

                // if (!designation_division || designation_division.length === 0) {
                //     return res.status(200).json({ data: [] });
                // }
                const designationIds = designation_division.map(user => user.designation_id);
                officersIds.push(...designationIds);
                // Add the current designation_id to the officers list
                officersIds.push(designation_id);
            }
            else{
                 officersIds = userHierarchy.map(user => user.officer_designation_id);
                // Add the current designation_id to the officers list
                officersIds.push(designation_id);
            }

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
                    {
                        model: UserDesignation, 
                        as: "users_designations",
                        attributes: ["users_designation_id", "designation_id"],
                        include: [
                            {
                            model: Designation,
                            as: "designation",
                            attributes: ["designation_name"],
                            },
                        ],
                    },
                ],
                attributes: ["user_id"],
                raw: true, // Flatten the result
                nest: true, // Keeps relations grouped
            });
        }
        else if(get_flag && get_flag === "All")
        {
           // Build the query filter for Users.
            const whereClause = {
            dev_status: true,
            };

            if (division_id) {
            const usersDivisionData = await UsersDivision.findAll({
                where: {
                division_id,
                },
                attributes: ["user_id"],
                raw: true,
            });

            if (!usersDivisionData || usersDivisionData.length === 0) {
                return res.status(200).json({ data: [] });
            }

            const userIds = usersDivisionData
                .map((ud) => ud.user_id)
                .filter((uid) => uid != null);

            whereClause.user_id = { [Op.in]: userIds }; // mutate existing object
            }

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
                    {
                        model: UserDesignation, 
                        as: "users_designations",
                        attributes: ["users_designation_id", "designation_id"],
                        include: [
                            {
                            model: Designation,
                            as: "designation",
                            attributes: ["designation_name"],
                            },
                        ],
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
        else 
        {
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
                    {
                        model: UserDesignation, 
                        as: "users_designations",
                        attributes: ["users_designation_id", "designation_id"],
                        include: [
                            {
                            model: Designation,
                            as: "designation",
                            attributes: ["designation_name"],
                            },
                        ],
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
    const userMap = {};

    usersData.forEach(user => {
        const userId = user.user_id;
        const name = user.kgidDetails?.name || "";
        const designation = user.users_designations?.designation?.designation_name || "";

        if (!userMap[userId]) {
            userMap[userId] = {
                ...user,
                name: name,
                designations: new Set()
            };
        }

        if (designation) {
            userMap[userId].designations.add(designation);
        }
    });
    const users = Object.values(userMap).map(user => ({
        ...user,
        name: `${user.name} - ${Array.from(user.designations).join(", ")}`,
        kgidDetails: undefined, 
        designations: undefined
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
                {
                    model: UserDesignation, 
                    as: "users_designations",
                    attributes: ["users_designation_id", "designation_id"],
                    include: [
                        {
                        model: Designation,
                        as: "designation",
                        attributes: ["designation_name"],
                        },
                    ],
                }
            ],
            attributes: ["user_id"],
            raw: true,
            nest: true,
        });
        
        // Transform output: move kgidDetails.name to top level.
        const userMap = {};

        usersData.forEach(user => {
            const userId = user.user_id;
            const name = user.kgidDetails?.name || "";
            const designation = user.users_designations?.designation?.designation_name || "";

            if (!userMap[userId]) {
                userMap[userId] = {
                    ...user,
                    name: name,
                    designations: new Set(),
                    kgid: user.kgidDetails?.kgid || "",
                    mobile: user.kgidDetails?.mobile || ""
                };
            }
            if (designation) {
                userMap[userId].designations.add(designation);
            }
        });

        const users = Object.values(userMap).map(user => ({
            ...user,
            name: `${user.name} - ${Array.from(user.designations).join(", ")}`,
            kgid: user.kgid,
            mobile: user.mobile,
            kgidDetails: undefined,
            designations: undefined
        }));

        return res.status(200).json({ data: users });
    } catch (error) {
        console.error("Error fetching users based on division:", error);
        return res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

const getSpecificIoUsersCases = async (req, res) => {
    const { user_id, template_module } = req.body;

    try {
        if (!user_id || user_id === "") {
            return res.status(400).json({ message: "User ID is required." });
        }

        if (!template_module || template_module === "") {
            return res.status(400).json({ message: "Template module is required." });
        }

        let table_name = "";
        let ioField = "field_io_name"
        if (template_module === "ui_case") {
            table_name = "cid_under_investigation";
        } else if (template_module === "pt_case") {
            table_name = "cid_pending_trial";
        } else if (template_module === "eq_case") {
            table_name = "cid_enquiry";
            ioField = "field_name_of_the_io";
        } else {
            return res.status(400).json({ message: "Invalid template module." });
        }

        const cases = await sequelize.query(
            `SELECT * FROM ${table_name} WHERE ${ioField} = :userID`,
            {
                replacements: { userID: user_id },
                type: sequelize.QueryTypes.SELECT
            }
        );

        return res.status(200).json({ cases });

    } catch (error) {
        console.error("Error fetching cases based on user ID:", error);
        return res.status(500).json({ message: "Failed to fetch cases", error: error.message });
    }
};

const getAllKGID = async (req, res) => {
    try {

        var kgids = {};

        //avoid the kgid 123456,12345 
        kgids = await KGID.findAll({
            // include: [{ model: Department, as: "department" }],
            order: [["created_at", "DESC"]],
            attributes: ["id","kgid"],
            where: {
                kgid: {
                    [Op.notIn]: ["123456", "12345"],
                },
            },
        });

        kgids = kgids.map(kgid => ({
            ...kgid,
            kgid_id: kgid.id,
            kgid_name: kgid.kgid,
        }));


        if (!kgids || kgids.length === 0) {
            return adminSendResponse(res, 200, true, "KGID retrieved successfully", []);
        }

        return adminSendResponse(res, 200, true, "KGID retrieved successfully", [ ...kgids ]);
    } catch (error) {
        console.error("Error fetching kgids:", error.message);
        return adminSendResponse(res, 500, false, "Failed to fetch kgids: " + error.message || "Internal Server Error");
    }
};

const getUserParticularDetails = async (req, res) => {
    try {
       const { user_id } = req.body;

        const userDetails = await Users.findOne({
            where: { user_id, dev_status: true },
            include: [
                {
                    model: KGID,
                    as: "kgidDetails",
                    attributes: ["id"],
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
                }
            ],
            attributes: ["user_id"],
        });

        if (!userDetails) {
            return res.status(404).json({ message: "User not found" });
        }

        // Transform output
        const userData = {
            user_id: userDetails.user_id,
            kgid_id: userDetails.kgidDetails?.id || "",
        };

        var designations = [];
        if (userDetails.users_designations && userDetails.users_designations.length > 0) {
           for (const designation of userDetails.users_designations) {
                if(!designations.includes(designation.designation_id)){
                    designations.push(designation.designation_id);
                }
            }   
        }
        userData.designations = designations;

        return res.status(200).json({ data: userData });
    }
    catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({ message: "Failed to fetch user details", error: error.message });
    }
}

const getAllAct = async (req, res) => {

    try {
        var acts = {};
        
        acts = await Act.findAll({
            // include: [{ model: db.Designation, as: 'designations' }],
            order: [['act_name', 'ASC']]
        });


        if (!acts || acts.length === 0) {
            return adminSendResponse(res, 200, true, "Act retrieved successfully", []);
        }

        return adminSendResponse(res, 200, true, "Act retrieved successfully", [ ...acts ]);
    } catch (error) {
        console.error("Error fetching act's:", error.message);
        return adminSendResponse(res, 500, false, "Failed to fetch act's: " + error.message || "Internal Server Error");
    }
};

const getAllSectionAndActBasedSection = async (req, res) => {
    try {

        const userId = req.user?.user_id || null;
        const  { get_flag , act_id } = req.body;
        var sections = {};

        if (!act_id || act_id === "" ) {
           sections = await Section.findAll({
                // include: [{ model: Department, as: "department" }],
                order: [["section_name", "ASC"]]
            });
        }
        else
        {
            // if(!act_id || act_id === ""){
            //     return res.status(400).json({ message: "Act ID is required." });
            // }

            let actIdArray = [];

            if (typeof act_id === 'string') {
                actIdArray = act_id.split(',').map(Number);
            } else if (Array.isArray(act_id)) {
                actIdArray = act_id.map(Number);
            } else if (typeof act_id === 'number') {
                actIdArray = [act_id];
            }

            sections = await Section.findAll({
                where: { act_id : actIdArray },
                order: [["section_name", "ASC"]]
            });
            
        }

        if (!sections || sections.length === 0) {
            return adminSendResponse(res, 200, true, "Please create sections and try to fetch.", []);
        }

        return adminSendResponse(res, 200, true, "Section's retrieved successfully", [ ...sections ]);
    } catch (error) {
        console.error("Error fetching section's:", error.message);
        return adminSendResponse(res, 500, false, "Failed to fetch sections: " + error.message || "Internal Server Error");
    }
};

const getDivisionBasedOnDepartment = async (req, res) => {
    try {
        const { department_id } = req.body;
        if (!department_id || department_id === "") {
            return res.status(400).json({ message: "Department ID is required." });
        }
        const divisions = await Division.findAll({
            where: { department_id },
            order: [["division_name", "ASC"]]
        });

        if (!divisions || divisions.length === 0) {
            return adminSendResponse(res, 200, true, "Please create divisions and try to fetch.", []);
        }

        return adminSendResponse(res, 200, true, "Divisions retrieved successfully", [ ...divisions ]);
    } catch (error) {
        console.error("Error fetching divisions:", error.message);
        return adminSendResponse(res, 500, false, "Failed to fetch divisions: " + error.message || "Internal Server Error");
    }
};

const getPoliceStationsBasedOnDistrict = async (req, res) => {
    try {
        const { district_id } = req.body;

        if (!district_id || district_id === "") {
            return res.status(400).json({ message: "District ID is required." });
        }

        const districtResult = await sequelize.query(
            `SELECT field_district FROM cid_district WHERE id = :district_id`,
            {
                replacements: { district_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!districtResult || districtResult.length === 0) {
            return adminSendResponse(res, 404, false, "District not found with the given ID", []);
        }


        const policeStations = await sequelize.query(
            `SELECT id, field_name_of_the_police_station 
             FROM cid_police_station 
             WHERE field_district = :district_id 
             ORDER BY field_name_of_the_police_station ASC`,
            {
                replacements: { district_id: String(district_id) },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        
        if (!policeStations || policeStations.length === 0) {
            return adminSendResponse(res, 200, true, "Please create police stations and try again.", []);
        }

        return adminSendResponse(res, 200, true, "Police stations retrieved successfully", policeStations);
    } catch (error) {
        console.error("Error fetching police stations:", error.message);
        return adminSendResponse(res, 500, false, "Failed to fetch police stations: " + error.message || "Internal Server Error");
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


const fetchUICaseDetails = async (req, res) => {
    try {
        const {
            allowedDepartmentIds = [],
            allowedDivisionIds = [],
            allowedUserIds = [],
        } = req.body;

        if (allowedDepartmentIds.length === 0 && allowedDivisionIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No department or division provided, so no data returned.",
                data: [],
            });
        }
        const normalizedDepartmentIds = normalizeValues(allowedDepartmentIds, 'number');
        const normalizedDivisionIds = normalizeValues(allowedDivisionIds, 'number');

        const departmentNames = normalizedDepartmentIds.length
            ? (await sequelize.query(
                `SELECT department_id FROM department WHERE department_id IN (:ids)`,
                {
                    replacements: { ids: normalizedDepartmentIds },
                    type: Sequelize.QueryTypes.SELECT,
                }
            )).map(d => String(d.department_id)) 
            : [];

            const divisionNames = normalizedDivisionIds.length
                ? (await sequelize.query(
                    `SELECT division_id FROM division WHERE division_id IN (:ids)`,
                    {
                        replacements: { ids: normalizedDivisionIds },
                        type: Sequelize.QueryTypes.SELECT,
                    }
                )).map(d => String(d.division_id))
                : [];

                let conditions = [];
                let replacements = {};

                if (departmentNames.length) {
                    conditions.push(`field_dept_unit IN (:deptNames)`);
                    replacements.deptNames = departmentNames;
                }

                if (divisionNames.length) {
                    conditions.push(`field_division IN (:divisionNames)`);
                    replacements.divisionNames = divisionNames;
                }

                const whereSQL = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

                const results = await sequelize.query(`
                    SELECT 
                        cui.id,
                        cui.field_crime_number_of_ps,
                        cui."field_cid_crime_no./enquiry_no" AS cid_enquiry_no,
                        cps.id AS police_station_id,
                        cps.field_name_of_the_police_station AS police_station_name
                    FROM cid_under_investigation cui
                    LEFT JOIN cid_police_station cps
                    ON CASE 
                            WHEN cui.field_name_of_the_police_station ~ '^[0-9]+$' 
                            THEN CAST(cui.field_name_of_the_police_station AS INTEGER)
                            ELSE NULL
                        END = cps.id
                    ${whereSQL}
                `, {
                    replacements,
                    type: Sequelize.QueryTypes.SELECT,
                });

                const transformedResults = results.map(record => ({
                    name: `${record.field_crime_number_of_ps || ''} - ${record.cid_enquiry_no || ''} - ${record.police_station_name || ''}`,
                    code: record.id,
                    crime_number: record.field_crime_number_of_ps || '',
                    cid_enquiry_number: record.cid_enquiry_no || '',
                    police_station: {
                        id: record.police_station_id || null,
                        name: record.police_station_name || ''
                    }
                }));

                return res.status(200).json({
                    success: true,
                    message: "UICase details fetched successfully",
                    data: transformedResults,
                });

            } catch (error) {
                console.error("Error:", error);
                return res.status(500).json({
                    success: false,
                    message: "An error occurred while fetching UICase details",
                    error: error.message,
                });
            }
        };


module.exports = {
    getAllDepartments,
    getAllDesignations,
    getAllDivisions,
    getIoUsers,
    getIoUsersBasedOnDivision,
    getAllKGID,
    getUserParticularDetails,
    getAllAct,
    getAllSectionAndActBasedSection,
    getDivisionBasedOnDepartment,
    getSpecificIoUsersCases,
    fetchUICaseDetails,
    getPoliceStationsBasedOnDistrict
};