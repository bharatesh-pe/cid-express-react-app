const {
  MastersMeta,
  Role,
  Designation,
  Department,
  KGID,
  Division,
  ApprovalItem,
  UsersHierarchy,
  UsersHierarchyNew,
  DesignationDivision,
  DesignationDepartment,
  Act,
  Section,
} = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

exports.fetch_masters_meta = async (req, res) => {
  try {
    const {
        page = 1,
        limit = 10,
        sort_by = "order",
        order = "ASC",
    } = req.body;
    const offset = (page - 1) * limit;

    const excluded_masters_ids = [];

    const { rows: master, count: totalItems }  = await MastersMeta.findAndCountAll({
      where: {
        masters_meta_id: {
          [Op.notIn]: excluded_masters_ids,
        },
      },
      order: [[sort_by, order]],
      limit,
      offset,
    });
     // const totalItems = records.count;
    const totalPages = Math.ceil(totalItems / limit);
    return res.status(200).json({ success: true, master ,meta: { page, limit, totalItems,totalPages, order,},});
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch master meta data." + error.message });
  }
};

// exports.fetch_specific_master_data = async (req, res) => {
//   const { master_name } = req.body;

//   try {
//     let data;

//     switch (master_name) {
//       case "department":
//         data = await Department.findAll();
//         break;

//       case "designation":
//         // Fetching the designations with departments
//         data = await Designation.findAll({
//         attributes: [
//             "designation_id",
//             "designation_name",
//             "description",
//             "created_by",
//             "created_at",
//         ],
//         });

//         // Fetch division info for each designation asynchronously
//         const formattedDesignations = await Promise.all(
//         data.map(async (designation) => {
//             const plain = designation.get({ plain: true });

//             // Fetch related divisions for the current designation
//             const designation_division = await DesignationDivision.findAll({
//                 where: { designation_id: designation.designation_id },
//                 attributes: ["division_id"],
//                 include: [
//                     {
//                     model: Division,
//                     as: "designation_division",  // ensure this is the correct alias
//                     attributes: ["division_name"],
//                     },
//                 ],
//             });

//             // Map divisions and join them into a string
//             const division_names = designation_division
//             .map((div) => div.designation_division.division_name)
//             .join(", ");
//             const division_ids = designation_division
//             .map((div) => div.division_id)
//             .join(",");

//             const designation_department = await DesignationDepartment.findAll({
//                 where: { designation_id: designation.designation_id },
//                 attributes: ["department_id"],
//                 include: [
//                     {
//                     model: Department,
//                     as: "designation_department",  // ensure this is the correct alias
//                     attributes: ["department_name"],
//                     },
//                 ],
//             });
//              // Map divisions and join them into a string
//             const department_names = designation_department
//             .map((div) => div.designation_department.department_name)
//             .join(", ");
//             const department_ids = designation_department
//             .map((div) => div.department_id)
//             .join(",");



//             return {
//             ...plain,
//             division_name: division_names || null,
//             division_id: division_ids || null,
//             department_name: department_names || null,
//             department_id: department_ids || null,
//             };
//         })
//         );

//         // The data is now formatted with divisions and department info
//         data = formattedDesignations;

//         break

//       case "division":
//         const divisions = await Division.findAll({
//             include: [
//                 {
//                 model: Department,
//                 as: "department",
//                 attributes: ["department_name"],
//                 },
//             ],
//             attributes: [
//                 "division_id",
//                 "division_name",
//                 "description",
//                 "department_id",
//                 "created_by",
//                 "created_at",
//             ],
//             });

//             // Flatten the result to include department_name at root level
//             const formattedDivisions = divisions.map((division) => {
//             const plain = division.get({ plain: true });
//             return {
//                 ...plain,
//                 department_name: plain.department?.department_name || "Unknown Department",
//             };
//             });
//         return res.status(200).json({ divisions: formattedDivisions });
//       case "approval_item":
//         data = await ApprovalItem.findAll();
//         break;
//       case "kgid":
//         data = await KGID.findAll();
//         break;
//       case "hierarchy":
//         data = await UsersHierarchy.findAll();
//         break;

//       default:
//         return res
//           .status(400)
//           .json({ message: "Invalid master name provided." });
//     }

//     return res.status(200).json(data);
//   } catch (error) {
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// exports.fetch_specific_master_data = async (req, res) => {
//   const {
//     master_name,
//     page = 1,
//     limit = 10,
//     sort_by = "created_at",
//     order = "DESC",
//     search = "",
//     search_field = "",
//     filter = {},
//     from_date = null,
//     to_date = null,
//   } = req.body;

//   const offset = (page - 1) * limit;

//   try {
//     let data = [];
//     let totalItems = 0;

//     // Common where clause for filtering, search, and date range
//     const buildWhereClause = () => {
//       const whereClause = {};

//       // Filter fields
//       for (const [key, value] of Object.entries(filter)) {
//         if (value !== undefined && value !== null && value !== "") {
//           whereClause[key] = value;
//         }
//       }

//       // Search
//       if (search && search_field) {
//         whereClause[search_field] = { [Op.iLike]: `%${search}%` };
//       }

//       // Date filter on created_at
//       if (from_date || to_date) {
//         whereClause.created_at = {};
//         if (from_date) {
//           whereClause.created_at[Op.gte] = new Date(from_date);
//         }
//         if (to_date) {
//           whereClause.created_at[Op.lte] = new Date(to_date);
//         }
//       }

//       return whereClause;
//     };

//     switch (master_name) {
//       case "designation":
//         const designationWhere = buildWhereClause();

//         const { rows: designationRows, count: designationCount } = await Designation.findAndCountAll({
//           where: designationWhere,
//           limit,
//           offset,
//           order: [[sort_by, order]],
//           attributes: [
//             "designation_id",
//             "designation_name",
//             "description",
//             "created_by",
//             "created_at",
//           ],
//         });

//         // Add related division and department info
//         const formattedDesignations = await Promise.all(
//           designationRows.map(async (designation) => {
//             const plain = designation.get({ plain: true });

//             const designation_division = await DesignationDivision.findAll({
//               where: { designation_id: plain.designation_id },
//               attributes: ["division_id"],
//               include: [
//                 {
//                   model: Division,
//                   as: "designation_division",
//                   attributes: ["division_name"],
//                 },
//               ],
//             });

//             const division_names = designation_division
//               .map((div) => div.designation_division?.division_name)
//               .join(", ");
//             const division_ids = designation_division
//               .map((div) => div.division_id)
//               .join(",");

//             const designation_department = await DesignationDepartment.findAll({
//               where: { designation_id: plain.designation_id },
//               attributes: ["department_id"],
//               include: [
//                 {
//                   model: Department,
//                   as: "designation_department",
//                   attributes: ["department_name"],
//                 },
//               ],
//             });

//             const department_names = designation_department
//               .map((dep) => dep.designation_department?.department_name)
//               .join(", ");
//             const department_ids = designation_department
//               .map((dep) => dep.department_id)
//               .join(",");

//             return {
//               ...plain,
//               division_name: division_names || null,
//               division_id: division_ids || null,
//               department_name: department_names || null,
//               department_id: department_ids || null,
//             };
//           })
//         );

//         data = formattedDesignations;
//         totalItems = designationCount;
//         break;

//       case "department":
//         const departmentWhere = buildWhereClause();

//         const departments = await Department.findAndCountAll({
//           where: departmentWhere,
//           limit,
//           offset,
//           order: [[sort_by, order]],
//         });

//         data = departments.rows;
//         totalItems = departments.count;
//         break;

//       case "division":
//         const divisionWhere = buildWhereClause();

//         const divisions = await Division.findAndCountAll({
//           where: divisionWhere,
//           include: [
//             {
//               model: Department,
//               as: "department",
//               attributes: ["department_name"],
//             },
//           ],
//           limit,
//           offset,
//           order: [[sort_by, order]],
//           attributes: [
//             "division_id",
//             "division_name",
//             "description",
//             "department_id",
//             "created_by",
//             "created_at",
//           ],
//         });

//         data = divisions.rows.map((division) => {
//           const plain = division.get({ plain: true });
//           return {
//             ...plain,
//             department_name: plain.department?.department_name || "Unknown Department",
//           };
//         });

//         totalItems = divisions.count;
//         break;

//       case "approval_item":
//         data = await ApprovalItem.findAll();
//         totalItems = data.length;
//         break;

//       case "kgid":
//         data = await KGID.findAll();
//         totalItems = data.length;
//         break;

//       case "hierarchy":
//         data = await UsersHierarchy.findAll();
//         totalItems = data.length;
//         break;

//       default:
//         return res.status(400).json({ message: "Invalid master name provided." });
//     }

//     const totalPages = Math.ceil(totalItems / limit);

//     // const returndata = {};
//     // returndata.data = data;
//     // returndata.meta = {
//     //   page,
//     //   limit,
//     //   totalItems,
//     //   totalPages,
//     //   sort_by,
//     //   order,
//     // };

//     return res.status(200).json({
//       success: true,
//       data,
//       meta: {
//         page,
//         limit,
//         totalItems,
//         totalPages,
//         sort_by,
//         order,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching master data:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.fetch_specific_master_data = async (req, res) => {
  const {
    master_name,
    page = 1,
    limit = 10,
    sort_by = "created_at",
    order = "DESC",
    search = "",
    search_field = "",
    filter = {},
    from_date = null,
    to_date = null,
    get_all = false,
  } = req.body;

  const offset = (page - 1) * limit;

  try {
    let data = [];
    let totalItems = 0;

    const buildWhereClause = () => {
        const whereClause = {};

        // Apply filters
        for (const [key, value] of Object.entries(filter)) {
            if (value !== undefined && value !== null && value !== "") {
            whereClause[key] = value;
            }
        }

        // Apply search condition
        if (search) {
            switch (master_name) {
            case "designation":
                whereClause["designation_name"] = { [Op.iLike]: `%${search}%` };
                break;
            case "department":
                whereClause["department_name"] = { [Op.iLike]: `%${search}%` };
                break;
            case "division":
                whereClause["division_name"] = { [Op.iLike]: `%${search}%` };
                break;
            case "approval_item":
                whereClause["name"] = { [Op.iLike]: `%${search}%` };
                break;
            case "kgid":
                whereClause[Op.or] = [
                { kgid: { [Op.iLike]: `%${search}%` } },
                { name: { [Op.iLike]: `%${search}%` } },
                { mobile: { [Op.iLike]: `%${search}%` } },
                ];
                break;
            case "hierarchy":
                whereClause[Op.or] = [
                { supervisor_designation_id: { [Op.iLike]: `%${search}%` } },
                { officer_designation_id: { [Op.iLike]: `%${search}%` } },
                ];
                break;
             case "act":
                whereClause["act_name"] = { [Op.iLike]: `%${search}%` };
                break;
            case "section":
                whereClause["section_name"] = { [Op.iLike]: `%${search}%` };
                break;
            default:
                if (search_field) {
                whereClause[search_field] = { [Op.iLike]: `%${search}%` };
                }
            }
        }

        // Date filter on created_at
        if (from_date || to_date) {
            whereClause.created_at = {};
            if (from_date) {
            whereClause.created_at[Op.gte] = new Date(from_date);
            }
            if (to_date) {
            whereClause.created_at[Op.lte] = new Date(to_date);
            }
        }

        return whereClause;
    };

    switch (master_name) {
      case "designation":
        const designationWhere = buildWhereClause();

        // if (search) {
        //     whereClause["designation_name"] = { [Op.iLike]: `%${search}%` };
        // }

        var designationRows = {};
        var designationCount = 0;
        if (!get_all) {
            const { rows: Rows, count: Count } = await Designation.findAndCountAll({
            where: designationWhere,
            limit,
            offset,
            order: [[sort_by, order]],
            attributes: ["designation_id", "designation_name", "description", "created_by", "created_at"],
            });

            designationRows = Rows;
            designationCount = Count;
        }
        else {
            const Rows = await Designation.findAll({
            where: designationWhere,
            order: [[sort_by, order]],
            attributes: ["designation_id", "designation_name", "description", "created_by", "created_at"],
            });

            designationRows = Rows;
            designationCount = Rows.length;
        }

        const formattedDesignations = await Promise.all(
          designationRows.map(async (designation) => {
            const plain = designation.get({ plain: true });

            const designation_division = await DesignationDivision.findAll({
              where: { designation_id: plain.designation_id },
              attributes: ["division_id"],
              include: [{
                model: Division,
                as: "designation_division",
                attributes: ["division_name"],
              }],
            });

            const division_names = designation_division.map(div => div.designation_division?.division_name).join(", ");
            const division_ids = designation_division.map(div => div.division_id).join(",");

            const designation_department = await DesignationDepartment.findAll({
              where: { designation_id: plain.designation_id },
              attributes: ["department_id"],
              include: [{
                model: Department,
                as: "designation_department",
                attributes: ["department_name"],
              }],
            });

            const department_names = designation_department.map(dep => dep.designation_department?.department_name).join(", ");
            const department_ids = designation_department.map(dep => dep.department_id).join(",");

            return {
              ...plain,
              division_name: division_names || null,
              division_id: division_ids || null,
              department_name: department_names || null,
              department_id: department_ids || null,
            };
          })
        );

        data = formattedDesignations;
        totalItems = designationCount;
        break;

      case "department":
        const departmentWhere = buildWhereClause();

        // if (search) {
        //     whereClause["department_name"] = { [Op.iLike]: `%${search}%` };
        // }

        if (get_all) {
            const Rows = await Department.findAll({
                where: departmentWhere,
                order: [[sort_by, order]],
                attributes: ["department_id", "department_name", "description", "created_by", "created_at"],
            });
    
            data = Rows;
            totalItems = Rows.length;
            break;
        }
        else {
                const { rows: Rows, count: Count } = await Department.findAndCountAll({
                where: departmentWhere,
                limit,
                offset,
                order: [[sort_by, order]],
                attributes: ["department_id", "department_name", "description", "created_by", "created_at"],
            });
            data = Rows;
            totalItems = Rows.length;
            break;
        }

      case "division":
        const divisionWhere = buildWhereClause();

        // if (search) {
        //     whereClause["division_name"] = { [Op.iLike]: `%${search}%` };
        // }

        const divisions = await Division.findAndCountAll({
          where: divisionWhere,
          include: [{
            model: Department,
            as: "department",
            attributes: ["department_name"],
          }],
          limit,
          offset,
          order: [["department_id", order]],
          attributes: ["division_id", "division_name", "description", "department_id", "created_by", "created_at"],
        });

        data = divisions.rows.map((division) => {
          const plain = division.get({ plain: true });
          return {
            ...plain,
            department_name: plain.department?.department_name || "Unknown Department",
          };
        });

        totalItems = divisions.count;
        break;

      case "approval_item":
        const approvalWhere = buildWhereClause();

        // if (search) {
        //     whereClause["name"] = { [Op.iLike]: `%${search}%` };
        // }

        const approvalItems = await ApprovalItem.findAndCountAll({
          where: approvalWhere,
          limit,
          offset,
          order: [[sort_by, order]],
          attributes: ["approval_item_id", "name", "description", "created_at"],
        });

        data = approvalItems.rows;
        totalItems = approvalItems.count;
        break;

      case "kgid":
        const kgidWhere = buildWhereClause();

        // if (search) {
        //     whereClause[Op.or] = [
        //         { kgid: { [Op.iLike]: `%${search}%` } },
        //         { name: { [Op.iLike]: `%${search}%` } },
        //         { mobile: { [Op.iLike]: `%${search}%` } },
        //     ];
        // }


        const kgids = await KGID.findAndCountAll({
          where: kgidWhere,
          limit,
          offset,
          order: [[sort_by, order]],
          attributes: ["id", "kgid", "name", "mobile", "created_at"],
        });

        data = kgids.rows;
        totalItems = kgids.count;
        break;

      case "hierarchy":
        const hierarchyWhere = buildWhereClause();

        const hierarchies = await UsersHierarchy.findAndCountAll({
          where: hierarchyWhere,
          limit,
          offset,
          order: [[sort_by, order]],
          attributes: [
            "users_hierarchy_id",
            "supervisor_designation_id",
            "officer_designation_id",
            "created_at",
          ],
        });

        data = hierarchies.rows;
        totalItems = hierarchies.count;
        break;
        case "act":
        const actWhere = buildWhereClause();

        // if (search) {
        //     whereClause["act_name"] = { [Op.iLike]: `%${search}%` };
        // }

        if (get_all) {
            const Rows = await Act.findAll({
                where: actWhere,
                order: [[sort_by, order]],
                attributes: ["act_id", "act_name", "description", "created_by", "created_at"],
            });
    
            data = Rows;
            totalItems = Rows.length;
            break;
        }
        else {
                const { rows: Rows, count: Count } = await Act.findAndCountAll({
                where: actWhere,
                limit,
                offset,
                order: [[sort_by, order]],
                attributes: ["act_id", "act_name", "description", "created_by", "created_at"],
            });
            data = Rows;
            totalItems = Count;
            break;
        }

      case "section":
        const sectionWhere = buildWhereClause();

        // if (search) {
        //     whereClause["section_name"] = { [Op.iLike]: `%${search}%` };
        // }

        const sections = await Section.findAndCountAll({
          where: sectionWhere,
          include: [{
            model: Act,
            as: "act",
            attributes: ["act_name"],
          }],
          limit,
          offset,
          order: [["act_id", order]],
          attributes: ["section_id", "section_name", "description", "act_id", "created_by", "created_at"],
        });

        data = sections.rows.map((section) => {
          const plain = section.get({ plain: true });
          return {
            ...plain,
            act_name: plain.act?.act_name || "Unknown Act",
          };
        });

        totalItems = sections.count;
        break;

      default:
        return res.status(400).json({ message: "Invalid master name provided." });
    }

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        sort_by,
        order,
      },
    });
  } catch (error) {
    console.error("Error fetching master data:", error);
    return res.status(500).json({ message: "Failed to Fetch data" + error.message });
  }
};



exports.create_master_data = async (req, res) => {
  const { master_name, data, transaction_id } = req.body;

  // Get the role id from the request (assuming it's in the request body)
  const { user_id } = req.user;

  data.created_by = user_id;

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  if (fs.existsSync(dirPath))
    return res
      .status(400)
      .json({ success: false, message: "Duplicate transaction detected." });
  fs.mkdirSync(dirPath, { recursive: true });

  try {
    let newEntry;
    let newEntry2;

    switch (master_name) {
        case "Department":
            const existingDepartment = await Department.findOne({
            where: {
                department_name: {
                [Op.iLike]: `%${data.department_name}%`,
                },
            },
            });
            if (existingDepartment) {
                 return res.status(409).json({success: false,message: "Similar department name already exists.",});
            }
            newEntry = await Department.create(data);
            break;

        case "Designation":
            // 1. Check for existing designation name (case-insensitive partial match)
            const existingDesignation = await Designation.findOne({
            where: {
                designation_name: {
                [Op.iLike]: `%${data.designation_name}%`,
                },
            },
            });

            if (existingDesignation) {
            return res.status(409).json({
                success: false,
                message: "Similar designation name already exists.",
            });
            }

            // 2. Create new Designation
            newEntry = await Designation.create(
            {
                designation_name: data.designation_name,
                description: data.description,
                created_by: data.created_by,
                created_at: new Date(),
            },
            {
                returning: [
                "designation_id",
                "designation_name",
                "description",
                "created_by",
                "created_at",
                ],
            }
            );

            // 3. Handle multiple division IDs (array or comma-separated string)
            const divisionIds = Array.isArray(data.division_id)
            ? data.division_id.map((id) => parseInt(id, 10))
            : (data.division_id || "")
                .split(",")
                .map((id) => parseInt(id.trim(), 10))
                .filter((id) => !isNaN(id));

            // 4. Insert into designation_division table
            if (divisionIds.length > 0) {
                const bulkData = divisionIds.map((divId) => ({
                    designation_id: newEntry.designation_id,
                    division_id: divId,
                    created_by: data.created_by,
                    created_at: new Date(),
                }));

                await DesignationDivision.bulkCreate(bulkData);
            }

             // 5. Handle multiple department IDs (array or comma-separated string)
            const departmentIds = Array.isArray(data.department_id)
            ? data.department_id.map((id) => parseInt(id, 10))
            : (data.department_id || "")
                .split(",")
                .map((id) => parseInt(id.trim(), 10))
                .filter((id) => !isNaN(id));

            // 6. Insert into designation_department table
            if (departmentIds.length > 0) {
                const bulkData = departmentIds.map((divId) => ({
                    designation_id: newEntry.designation_id,
                    department_id: divId,
                    created_by: data.created_by,
                    created_at: new Date(),
                }));

                await DesignationDepartment.bulkCreate(bulkData);
            }
            break;

        case "Division":
            const existingDivision = await Division.findOne({
            where: {
                division_name: {
                [Op.iLike]: `%${data.division_name}%`,
                },
            },
            });
            if (existingDivision) {
                 return res.status(409).json({success: false,message: "Similar division name already exists.",});
            }
            newEntry = await Division.create({
            division_name: data.division_name,
            description: data.description,
            department_id: data.department_id,
            created_by: data.created_by,
            created_at: new Date(),
            });
            break;

        case "Approval Item":
          const existingApprovalItem = await ApprovalItem.findOne({
              where: {
                  name: {
                      [Op.iLike]: `%${data.name}%`,
                  },
              },
          });

          if (existingApprovalItem) {
              return res.status(409).json({
                  success: false,
                  message: "Similar approval item name already exists.",
              });
          }

          newEntry = await ApprovalItem.create(data);
          break;    

        case "Kgid":
            const existingKgid = await KGID.findOne({
            where: { kgid: data.kgid },
            });

            if (existingKgid) {
            return res.status(400).json({
                success: false,
                message: "KGID already exists.",
            });
            }

            const existingMobile = await KGID.findOne({
            where: { mobile: data.mobile },
            });

            if (existingMobile) {
            return res.status(400).json({
                success: false,
                message: "Mobile already exists.",
            });
            }

            newEntry = await KGID.create({
            kgid: data.kgid,
            name: data.name,
            mobile: data.mobile,
            start_date: new Date(),
            end_date: data.end_date || null,
            created_by: data.created_by,
            });
            break;

        case "Hierarchy":

            const existingHierarchy = await UsersHierarchy.findOne({
                where: {
                    supervisor_designation_id: data.supervisor_designation_id,
                    officer_designation_id: data.officer_designation_id,
                },
            });

            if (existingHierarchy) {
                return res.status(409).json({
                    success: false,
                    message: "Hierarchy entry already exists.",
                });
            }

            const existingSupervisor = await UsersHierarchy.findOne({
              where: {
                  officer_designation_id: data.officer_designation_id,
              },
          });

          if (existingSupervisor) {
              return res.status(409).json({
                  success: false,
                  message: "The officer already has a supervisor assigned.",
              });
          }


            newEntry = await UsersHierarchy.create({
                supervisor_designation_id: data.supervisor_designation_id,
                officer_designation_id: data.officer_designation_id,
                created_by: data.created_by,
                created_at: new Date(),
            });

            newEntry2 = await UsersHierarchyNew.create({
                supervisor_designation_id: data.supervisor_designation_id,
                officer_designation_id: data.officer_designation_id,
                users_hierarchy_id: newEntry.users_hierarchy_id,
                created_by: data.created_by,
                created_at: new Date(),
            });

            if (data.officer_designation_id !== data.supervisor_designation_id) {
                let currentSupervisor = data.supervisor_designation_id;
                let currentOfficer = data.officer_designation_id;
                while (currentSupervisor) {

                    const parentRecord = await UsersHierarchyNew.findOne({
                        where: { officer_designation_id: currentSupervisor },
                    });

                    console.log("currentSupervisor", currentSupervisor)
                    console.log("parentRecord", parentRecord)
                    if (!parentRecord || !parentRecord.supervisor_designation_id) {
                        console.log("No parent record found or supervisor_designation_id is null.");
                        break;
                    }
                    
                    console.log("parentRecord.supervisor_designation_id", parentRecord.supervisor_designation_id)
                    
                    if(currentSupervisor === parentRecord.supervisor_designation_id){
                        break;
                    }
                    
                    await UsersHierarchyNew.create({
                        supervisor_designation_id: parentRecord.supervisor_designation_id,
                        officer_designation_id: data.officer_designation_id,
                        created_by: data.created_by,
                        created_at: new Date(),
                    });

                currentSupervisor = parentRecord.supervisor_designation_id;
                }


                while (currentOfficer) {

                const parentRecord = await UsersHierarchyNew.findOne({
                    where: { supervisor_designation_id: currentOfficer },
                });

                console.log("currentOfficer", currentOfficer)
                console.log("parentRecord", parentRecord)
                if (!parentRecord || !parentRecord.officer_designation_id) {
                    console.log("No parent record found or supervisor_designation_id is null.");
                    break;
                }
                
                console.log("parentRecord.supervisor_designation_id", parentRecord.officer_designation_id)
                
                if(currentOfficer === parentRecord.officer_designation_id){
                    break;
                }
                
                await UsersHierarchyNew.create({
                    supervisor_designation_id: data.supervisor_designation_id,
                    officer_designation_id: parentRecord.officer_designation_id,
                    created_by: data.created_by,
                    created_at: new Date(),
                });

                currentOfficer = parentRecord.officer_designation_id;
            }

            }
            break;
         case "Act":
            const existingAct = await Act.findOne({
            where: {
                act_name: {
                [Op.iLike]: `%${data.act_name}%`,
                },
            },
            });
            if (existingAct) {
                 return res.status(409).json({success: false,message: "Similar act name already exists.",});
            }
            newEntry = await Act.create(data);
            break;
        case "Section":
            const existingSection = await Section.findOne({
                where: {
                    section_name: {
                    [Op.iLike]: `%${data.section_name}%`, // Case-insensitive partial match
                    },
                    act_id: data.act_id,
                },
            });
            if (existingSection) {
                 return res.status(409).json({success: false,message: "Similar section name already exists.",});
            }
            newEntry = await Section.create({
            section_name: data.section_name,
            description: data.description,
            act_id: data.act_id,
            created_by: data.created_by,
            created_at: new Date(),
            });
            break;
        default:
            return res.status(400).json({ message: "Invalid master name provided." });
    }

    return res.status(201).json({
      success: true,
      message: `${master_name} created successfully`,
      data: newEntry,
    });
  } catch (error) {
    console.log("Error creating master data:", error);
    return res.status(500).json({ message: "Failed to create master data.", error: error.message });
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

exports.update_master_data = async (req, res) => {
  const { master_name, data, transaction_id } = req.body;

  const { user_id } = req.user;
  data.updated_by = user_id;

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  
  if(transaction_id)
  {
      if (fs.existsSync(dirPath))
        return res
          .status(400)
          .json({ success: false, message: "Duplicate transaction detected." });
      fs.mkdirSync(dirPath, { recursive: true });
  }

  try {
    let result;
    let whereCondition = {};

    switch (master_name) {
      case "Department":
        if (!data.department_id) {
          return res
            .status(400)
            .json({ message: "Department ID is required for update." });
        }
        whereCondition = { department_id: data.department_id };
        result = await Department.update(data, { where: whereCondition });
        break;

      case "Designation":
        // if (!data.designation_id) {
        //   return res
        //     .status(400)
        //     .json({ message: "Designation ID is required for update." });
        // }
        // whereCondition = { designation_id: data.designation_id };
        // result = await Designation.update(
        //   {
        //     designation_name: data.designation_name,
        //     department_id: data.department_id,
        //     division_id: data.division_id,
        //     description: data.description,
        //     updated_by: data.updated_by,
        //   },
        //   { where: whereCondition }
        // );
        const { designation_id, designation_name, department_id, division_id, description, updated_by } = data;

        if (!designation_id) {
        return res.status(400).json({ message: "Designation ID is required for update." });
        }

        // 1. Update designation fields (excluding division_id)
        await Designation.update(
        {
            designation_name,
            description,
            updated_by,
            updated_at: new Date(),
        },
        { where: { designation_id } }
        );

        // 2. Parse multiple division IDs
        const divisionIds = Array.isArray(division_id)
        ? division_id.map((id) => parseInt(id, 10))
        : (division_id || "")
            .split(",")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id));

        // 3. Update designation_division junction table
        if (divisionIds.length > 0) {
        // Delete old mappings
        await DesignationDivision.destroy({
            where: { designation_id },
        });

        // Insert new mappings
        const newMappings_division = divisionIds.map((divId) => ({
            designation_id,
            division_id: divId,
            created_by: updated_by,
            created_at: new Date(),
        }));

        await DesignationDivision.bulkCreate(newMappings_division);
        }

        // 3. Parse multiple department IDs
        const departmentIds = Array.isArray(department_id)
        ? department_id.map((id) => parseInt(id, 10))
        : (department_id || "")
            .split(",")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id));

        // 4. Update designation_department junction table
        if (departmentIds.length > 0) {
            // Delete old mappings
            await DesignationDepartment.destroy({
                where: { designation_id },
            });

            // Insert new mappings
            const newMappings_departyment = departmentIds.map((depID) => ({
                designation_id,
                department_id: depID,
                created_by: updated_by,
                created_at: new Date(),
            }));

            await DesignationDepartment.bulkCreate(newMappings_departyment);
        }
        break;

      case "Division":
        if (!data.division_id) {
          return res
            .status(400)
            .json({ message: "Division ID is required for update." });
        }
        whereCondition = { division_id: data.division_id };
        result = await Division.update(
          {
            division_name: data.division_name,
            department_id: data.department_id,
            updated_by: data.updated_by,
          },
          { where: whereCondition }
        );
        break;
      case "Approval Item":
        if (!data.approval_item_id) {
          return res
            .status(400)
            .json({ message: "Item ID is required for update." });
        }
        whereCondition = { approval_item_id: data.approval_item_id };
        result = await ApprovalItem.update(data, { where: whereCondition });
        break;
      case "Kgid":
        if (!data.id) {
          return res
            .status(400)
            .json({ message: "KGID ID is required for update." });
        }
        whereCondition = { id: data.id };
        result = await KGID.update(
          {
            kgid: data.kgid,
            name: data.name,
            mobile: data.mobile,
            start_date: data.start_date,
            end_date: data.end_date,
            updated_by: data.updated_by,
          },
          { where: whereCondition }
        );
        break;
      
      case "Hierarchy":
        if (!data.hierarchy_id) {
          return res.status(400).json({ message: "Hierarchy ID is required." });
        }
      
        const existing = await UsersHierarchy.findOne({
          where: { users_hierarchy_id: data.hierarchy_id }
        });
      
        if (!existing) {
          return res.status(404).json({ message: "Hierarchy record not found." });
        }
      
        const fromOfficerId = existing.officer_designation_id;
      
        const allHierarchies = await UsersHierarchy.findAll({ raw: true });
      
        const childToParentMap = new Map();
        for (const row of allHierarchies) {
          if (row.officer_designation_id !== row.supervisor_designation_id) {
            childToParentMap.set(row.officer_designation_id, row.supervisor_designation_id);
          }
        }
      
        const collectDescendants = (startId, visited = new Set()) => {
          const result = new Set();
          const stack = [startId];
          while (stack.length > 0) {
            const current = stack.pop();
            if (!visited.has(current)) {
              visited.add(current);
              result.add(current);
              for (const [child, parent] of childToParentMap.entries()) {
                if (parent === current) {
                  stack.push(child);
                }
              }
            }
          }
          return result;
        };
      
        const allRelatedOfficerIds = collectDescendants(fromOfficerId);
      
        await UsersHierarchy.destroy({
          where: {
            [Op.or]: [
              { officer_designation_id: Array.from(allRelatedOfficerIds) },
              { supervisor_designation_id: Array.from(allRelatedOfficerIds) }
            ]
          }
        });
      
        await UsersHierarchyNew.destroy({
          where: {
            [Op.or]: [
              { officer_designation_id: Array.from(allRelatedOfficerIds) },
              { supervisor_designation_id: Array.from(allRelatedOfficerIds) }
            ]
          }
        });
      
        await UsersHierarchy.create({
          officer_designation_id: data.officer_designation_id,
          supervisor_designation_id: data.supervisor_designation_id,
          created_by: data.created_by,
          created_at: new Date()
        });
      
        await UsersHierarchyNew.create({
          officer_designation_id: data.officer_designation_id,
          supervisor_designation_id: data.supervisor_designation_id,
          created_by: data.created_by,
          created_at: new Date()
        });
      
        const buildHierarchy = async (rootId, rootSupervisorId) => {
          const queue = [{ officerId: rootId, supervisorChain: [rootSupervisorId] }];
          const insertedPairs = new Set();
      
          while (queue.length > 0) {
            const { officerId, supervisorChain } = queue.shift();
      
            for (const [child, parent] of childToParentMap.entries()) {
              if (parent === officerId) {

                const officerSupervisorPair = `${child}-${officerId}`;
                if (!insertedPairs.has(officerSupervisorPair)) {

                  await UsersHierarchy.create({
                    officer_designation_id: child,
                    supervisor_designation_id: officerId,
                    created_by: data.created_by,
                    created_at: new Date()
                  });
      
                  await UsersHierarchyNew.create({
                    officer_designation_id: child,
                    supervisor_designation_id: officerId,
                    created_by: data.created_by,
                    created_at: new Date()
                  });
      
                  for (const superId of supervisorChain) {
                    await UsersHierarchyNew.create({
                      officer_designation_id: child,
                      supervisor_designation_id: superId,
                      created_by: data.created_by,
                      created_at: new Date()
                    });
                  }
      
                  insertedPairs.add(officerSupervisorPair);
      
                  queue.push({
                    officerId: child,
                    supervisorChain: [officerId, ...supervisorChain]
                  });
                }
              }
            }
          }
        };
      
        await buildHierarchy(data.officer_designation_id, data.supervisor_designation_id);
      
        break;
        
        case "Act":
            if (!data.act_id) {
            return res
                .status(400)
                .json({ message: "Act ID is required for update." });
            }
            whereCondition = { act_id: data.act_id };
            result = await Act.update(data, { where: whereCondition });
        break;
        case "Section":
            if (!data.section_id) {
            return res
                .status(400)
                .json({ message: "Section ID is required for update." });
            }
            whereCondition = { section_id: data.section_id };
            result = await Section.update(
            {
                section_name: data.section_name,
                act_id: data.act_id,
                updated_by: data.updated_by,
            },
            { where: whereCondition }
            );
        break;
      


      default:
        return res
          .status(400)
          .json({ message: "Invalid master name provided." });
    }

    return res.status(200).json({
      success: true,
      message: `${master_name} updated successfully`,
      data: result,
    });
  } catch (error) {
    console.log("Error updating master data:", error);
    return res.status(500).json({ message: "Failed to update data" + error.message });
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

exports.delete_master_data = async (req, res) => {
  const { master_name, id, transaction_id } = req.body;

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  if (fs.existsSync(dirPath))
    return res
      .status(400)
      .json({ success: false, message: "Duplicate transaction detected." });
  fs.mkdirSync(dirPath, { recursive: true });

  try {
    let result;
    let whereCondition = {};

    switch (master_name) {
      case "Department":
        if (!id) {
          return res
            .status(400)
            .json({ message: "Department ID is required for deletion." });
        }
        whereCondition = { department_id: id };
        result = await Department.destroy({ where: whereCondition });
        break;

      case "Designation":
        // if (!id) {
        //   return res
        //     .status(400)
        //     .json({ message: "Designation ID is required for deletion." });
        // }
        // whereCondition = { designation_id: id };
        // result = await Designation.destroy({ where: whereCondition });
            if (!id) {
                return res
                    .status(400)
                    .json({ message: "Designation ID is required for deletion." });
            }

            whereCondition = { designation_id: id };

            // 1. Delete from junction table first
            await DesignationDepartment.destroy({
                where: { designation_id: id },
            });

            // 2. Delete from junction table first
            await DesignationDivision.destroy({
                where: { designation_id: id },
            });

            // 3. Delete the designation
            result = await Designation.destroy({
                where: whereCondition,
            });

            if (result === 0) {
                return res.status(404).json({ success: false, message: "Designation not found." });
            }
        break;

      case "Division":
        if (!id) {
          return res
            .status(400)
            .json({ message: "Division ID is required for deletion." });
        }
        whereCondition = { division_id: id };
        result = await Division.destroy({ where: whereCondition });
        break;
      case "Kgid":
        if (!id) {
          return res
            .status(400)
            .json({ message: "KGID is required for deletion." });
        }
        whereCondition = { id: id };
        result = await KGID.destroy({ where: whereCondition });
        break;
      case "Approval Item":
        if (!id) {
          return res
            .status(400)
            .json({ message: "Item ID is required for deletion." });
        }
        whereCondition = { approval_item_id: id };
        result = await ApprovalItem.destroy({ where: whereCondition });
        break;
      case "Hierarchy":
        if (!id) {
          return res
            .status(400)
            .json({ message: "Hierarchy ID is required for deletion." });
        }
        whereCondition = { users_hierarchy_id: id };
        result = await UsersHierarchy.destroy({ where: whereCondition });
        break;
        case "Act":
            if (!id) {
            return res
                .status(400)
                .json({ message: "Act ID is required for deletion." });
            }
            whereCondition = { act_id: id };
            result = await Act.destroy({ where: whereCondition });
        break;
        case "Section":
            if (!id) {
            return res
                .status(400)
                .json({ message: "Section ID is required for deletion." });
            }
            whereCondition = { section_id: id };
            result = await Section.destroy({ where: whereCondition });
        break;
      default:
        return res
          .status(400)
          .json({ message: "Invalid master name provided." });
    }

    if (result === 0) {
      return res
        .status(404)
        .json({ message: `${master_name} not found or already deleted.` });
    }

    return res.status(200).json({
      success: true,
      message: `${master_name} deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete master data.",
      error: error.message,
    });
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};
