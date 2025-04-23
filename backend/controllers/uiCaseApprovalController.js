const {
  UiCaseApproval,
  ApprovalItem,
  Designation,
  System_Alerts,
  UsersHierarchy,
  AlertViewStatus,
  KGID,
  Users,
} = require("../models");
const fs = require("fs");
const path = require("path");
const dbConfig = require("../config/dbConfig");
const { Op } = require("sequelize");
const { where } = require("sequelize");

exports.create_ui_case_approval = async (req, res) => {
  const { user_id } = req.user;
  const {
    approval_item,
    approved_by,
    approval_date,
    remarks,
    case_id,
    case_type,
    module,
    action,
    transaction_id,
    created_by_designation_id,
    created_by_division_id,
    info,
  } = req.body;

  // Transaction ID validation
  if (!transaction_id || transaction_id === "") {
    return res
      .status(400)
      .json({ success: false, message: "Transaction Id is required!" });
  }

  const dirPath = path.join(
    __dirname,
    `../data/ui_case_approval_unique/${transaction_id}`
  );

  // Check if directory exists
  if (fs.existsSync(dirPath)) {
    return res.status(400).json({
      success: false,
      message: "Duplicate transaction detected.",
    });
  }
  // Create directory
  fs.mkdirSync(dirPath, { recursive: true });

  const t = await dbConfig.sequelize.transaction();

  try {
    // Validate approval_item
    const existingApprovalItem = await ApprovalItem.findByPk(approval_item);
    if (!existingApprovalItem) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid approval item ID" });
    }

    // Create UiCaseApproval
    const newApproval = await UiCaseApproval.create(
      {
        approval_item,
        approved_by,
        approval_date: approval_date || new Date(), // Use current date if not provided
        remarks,
        reference_id: case_id,
        approval_type: case_type,
        module,
        action,
        created_by: user_id || null,
        status:true
      },
      { transaction: t }
    );

    let reference_id = case_id || null;
    if (!reference_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message:
          "At least one of ui_case_id, pt_case_id, or eq_case_id is required.",
      });
    }

    // Create System_Alerts entry
    const systemAlert = await System_Alerts.create(
      {
        approval_id: newApproval.approval_id,
        reference_id: reference_id,
        alert_type: "Approval",
        alert_message: newApproval.remarks,
        created_by: user_id || null,
        created_by_designation_id: created_by_designation_id || null,
        created_by_division_id: created_by_division_id || null,
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: newApproval,
      alert_data: systemAlert,
    });
  } catch (error) {
    if (t.finished !== "rollback") {
      await t.rollback();
    }
    console.error("Error creating Approval:", error);
    return res.status(500).json({
      message: "Failed to create Approval",
      error: error.message,
    });
  } finally {
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
};

// Function to view all approvals
exports.get_ui_case_approvals = async (req, res) => {
  try {
    const { case_id, approval_type , page = 1, limit = 10, sort_by = "created_at", order = "DESC", search = "", search_field = "",} = req.body;
    const { filter = {}, from_date = null, to_date = null } = req.body;
    const userId = req.user?.user_id || null;
    let whereCondition = {};

    whereCondition.status = true;

    const offset = (page - 1) * limit;

    const fields = Object.keys(UiCaseApproval.rawAttributes).reduce((acc, key) => {
        acc[key] = true;
        return acc;
    }, {});


    // Dynamically add conditions
    if (case_id) {
      whereCondition.reference_id = case_id;
    }

    if (approval_type) {
      whereCondition.approval_type = approval_type; 
    }

     // Apply field filters if provided
    if (filter && typeof filter === "object") {
        Object.entries(filter).forEach(([key, value]) => {
            if (fields[key]) {
            whereCondition[key] = value;
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
            const fieldConfig = fieldConfigs[search_field];
            const fieldType = fields[search_field]?.type?.key;
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
            if (["true", "false"].includes(search.toLowerCase())) {
                const boolValue = search.toLowerCase() === "true";
                searchConditions.push({ [search_field]: boolValue });
            }
            } else if (fieldType === "DATE") {
            const parsedDate = Date.parse(search);
            if (!isNaN(parsedDate)) {
                searchConditions.push({ [search_field]: new Date(parsedDate) });
            }
            }

            // Handle dropdown/radio/checkbox option label search
            if (
            fieldConfig &&
            ["dropdown", "radio", "checkbox"].includes(fieldConfig.type) &&
            Array.isArray(fieldConfig.options)
            ) {
            const matchingOption = fieldConfig.options.find((option) =>
                option.name.toLowerCase().includes(search.toLowerCase())
            );

            if (matchingOption) {
                searchConditions.push({ [search_field]: matchingOption.code });
            }
            }

            // Handle foreign key search
            if (isForeignKey) {
            const association = associations.find(
                (assoc) => assoc.foreignKey === search_field
            );

            if (association) {
                const associatedModel = include.find(
                (inc) => inc.as === `${association.relatedTable}Details`
                );

                if (associatedModel) {
                searchConditions.push({
                    [`$${association.relatedTable}Details.${association.targetAttribute}$`]: {
                    [Op.iLike]: `%${search}%`,
                    },
                });
                }
            }
            }
        } else {
            // General search across all fields
            Object.keys(fields).forEach((field) => {
            const fieldType = fields[field]?.type?.key;
            const fieldConfig = fieldConfigs[field];
            const isForeignKey = associations.some(
                (assoc) => assoc.foreignKey === field
            );

            if (["STRING", "TEXT"].includes(fieldType)) {
                searchConditions.push({ [field]: { [Op.iLike]: `%${search}%` } });
            } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
                if (!isNaN(search)) {
                searchConditions.push({ [field]: parseInt(search, 10) });
                }
            }

            if (
                fieldConfig &&
                ["dropdown", "radio", "checkbox"].includes(fieldConfig.type) &&
                Array.isArray(fieldConfig.options)
            ) {
                const matchingOption = fieldConfig.options.find((option) =>
                option.name.toLowerCase().includes(search.toLowerCase())
                );

                if (matchingOption) {
                searchConditions.push({ [field]: matchingOption.code });
                }
            }

            if (isForeignKey) {
                const association = associations.find(
                (assoc) => assoc.foreignKey === field
                );

                if (association) {
                const associatedModel = include.find(
                    (inc) => inc.as === `${association.relatedTable}Details`
                );

                if (associatedModel) {
                    searchConditions.push({
                    [`$${association.relatedTable}Details.${association.targetAttribute}$`]: {
                        [Op.iLike]: `%${search}%`,
                    },
                    });
                }
                }
            }
            });
        }

        if (searchConditions.length > 0) {
            whereCondition[Op.or] = searchConditions;
        }
    }

    // Safe fallback for sorting field
    const validSortBy = fields[sort_by] ? sort_by : "created_at";


    let formattedApprovals = [];
    let approvals = { count: 0, rows: [] };


    if (whereCondition && Object.keys(whereCondition).length > 0) {
        approvals = await UiCaseApproval.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            order: [[validSortBy, order.toUpperCase()]],
            include: [
            {
                model: ApprovalItem,
                as: "approvalItem",
                attributes: ["name"],
            },
            {
                model: Designation,
                as: "approvedBy",
                attributes: ["designation_name"],
            },
            ],
        });

        formattedApprovals = approvals.rows.map((approval) => ({
            approval_id: approval.approval_id,
            approval_item: approval.approval_item,
            approved_by: approval.approved_by,
            approval_date: approval.approval_date,
            remarks: approval.remarks,
            approvalItem: approval.approvalItem?.name || null,
            approvedBy: approval.approvedBy?.designation_name || null,
        }));
    }

    const approval_item = await ApprovalItem.findAll();
    const designation = await Designation.findAll();

    const totalItems = approvals.count;
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
        success: true,
        data: {
            approvals: formattedApprovals,
            approval_item,
            designation,
            meta: {
            page,
            limit,
            totalItems,
            totalPages,
            sort_by: validSortBy,
            order,
            },
        },
    });

  } catch (error) {
    console.error("Error fetching Approvals:", error);
    return res.status(500).json({
      message: "Failed to fetch Approvals",
      error: error.message,
    });
  }
};

exports.get_alert_notification = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { user_designation_id, user_division_id } = req.body;

    // Step 1: Get subordinate designation IDs
    const subordinates = await UsersHierarchy.findAll({
      where: { supervisor_designation_id: user_designation_id },
      attributes: ["officer_designation_id"],
      raw: true,
    });

    const officer_designation_ids = subordinates.map(
      (d) => d.officer_designation_id
    );

    // Step 2: Get alerts created by those designations within the same division
    const alertNotifications = await System_Alerts.findAll({
      where: {
        [Op.or]: [
          { created_by_designation_id: { [Op.in]: officer_designation_ids } },
          { send_to: user_id },
          // { created_by_division_id: user_division_id }, // uncomment if needed
        ],
      },
      order: [["created_at", "DESC"]],
    });

    // Step 3: Enrich alerts with read status
    let complete_data = await Promise.all(
      alertNotifications.map(async (notification) => {
        const alertViewStatus = await AlertViewStatus.findOne({
          where: {
            system_alert_id: notification.system_alert_id,
            viewed_by: user_id,
            viewed_by_designation_id: user_designation_id,
            // viewed_by_division_id: user_division_id,
          },
        });

        return {
          ...notification.toJSON(),
          read_status: alertViewStatus ? alertViewStatus.view_status : false,
        };
      })
    );

    // Step 4: Fetch names via created_by → Users → KGID
    const userIds = [...new Set(complete_data.map((n) => n.created_by))];

    const users = await Users.findAll({
      where: { user_id: { [Op.in]: userIds } },
      attributes: ["user_id", "kgid_id"],
      raw: true,
    });

    const kgidIds = users.map((u) => u.kgid_id);
    const userMap = users.reduce((acc, user) => {
      acc[user.user_id] = user.kgid_id;
      return acc;
    }, {});

    const kgids = await KGID.findAll({
      where: { id: { [Op.in]: kgidIds } },
      attributes: ["id", "name"],
      raw: true,
    });

    const kgidMap = kgids.reduce((acc, k) => {
      acc[k.id] = k.name;
      return acc;
    }, {});

    // Step 5: Attach names to alerts
    complete_data = complete_data.map((notification) => ({
      ...notification,
      created_by_name: kgidMap[userMap[notification.created_by]] || null,
    }));

    const designationsIds = [...new Set(complete_data.map((n) => n.created_by_designation_id))];

    const designations = await Designation.findAll({
      where: { designation_id: { [Op.in]: designationsIds } },
      attributes: ["designation_id", "designation_name"],
      raw: true,
    });

    const designationMap = designations.reduce((acc, k) => {
      acc[k.designation_id] = k.designation_name;
      return acc;
    }, {});

    complete_data = complete_data.map((notification) => ({
      ...notification,
      created_by_designation_id: designationMap[notification.created_by_designation_id] || null,
    }));

    const unreadCount = complete_data.filter((n) => !n.read_status).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      data: complete_data,
    });
  } catch (error) {
    console.error("Error fetching alert notifications:", error);
    return res.status(500).json({
      message: "Failed to fetch alert notifications",
      error: error.message,
    });
  }
};

exports.get_case_approval_by_id = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { approval_id, user_designation_id, user_division_id } = req.body;

    // Get approval details
    const approvalDetails = await UiCaseApproval.findOne({
      where: { approval_id , status : true },
      include: [
        {
          model: ApprovalItem,
          as: "approvalItem",
          attributes: ["name"],
        },
        {
          model: Designation,
          as: "approvedBy",
          attributes: ["designation_name"],
        },
      ],
      raw: true,
      nest: true,
    });

    if (!approvalDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Approval not found" });
    }

    // Fetch the created_by user's KGID ID
    const user = await Users.findOne({
      where: { user_id: approvalDetails.created_by },
      attributes: ["kgid_id"],
      raw: true,
    });

    // Fetch the name from KGID table using kgid_id
    let creatorName = null;
    if (user && user.kgid_id) {
      const kgid = await KGID.findOne({
        where: { id: user.kgid_id },
        attributes: ["name"],
        raw: true,
      });

      if (kgid) {
        creatorName = kgid.name;
      }
    }

    // Final response formatting
    const formattedDetails = {
      ...approvalDetails,
      approvalItem: approvalDetails.approvalItem?.name || null,
      approvedBy: approvalDetails.approvedBy?.designation_name || null,
      created_by: creatorName,
    };

    // Fetch associated alert
    const alertNotification = await System_Alerts.findOne({
      where: { approval_id },
      raw: true,
    });

    if (alertNotification) {
      // Update view status if not already viewed
      const existingView = await AlertViewStatus.findOne({
        where: {
          system_alert_id: alertNotification.system_alert_id,
          viewed_by: user_id,
          viewed_by_designation_id: user_designation_id,
          // viewed_by_division_id: user_division_id,
        },
        raw: true,
      });

      if (!existingView) {
        await AlertViewStatus.create({
          system_alert_id: alertNotification.system_alert_id,
          viewed_by: user_id,
          viewed_by_designation_id: user_designation_id,
          // viewed_by_division_id: user_division_id,
          view_status: true,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: formattedDetails,
    });
  } catch (error) {
    console.error("Error fetching approval by ID:", error);
    return res.status(500).json({
      message: "Failed to fetch approval",
      error: error.message,
    });
  }
};

exports.update_ui_case_approval = async (req, res) => {
  const { user_id } = req.user;
  const {
    approval_id,
    approval_item,
    approved_by,
    approval_date,
    remarks,
    module,
    action,
    transaction_id,
    created_by_designation_id,
    created_by_division_id,
  } = req.body;

  if (!transaction_id || transaction_id === "") {
    return res.status(400).json({ success: false, message: "Transaction Id is required!" });
  }

  const dirPath = path.join(__dirname, `../data/ui_case_approval_unique/${transaction_id}`);

  if (fs.existsSync(dirPath)) {
    return res.status(400).json({ success: false, message: "Duplicate transaction detected." });
  }

  fs.mkdirSync(dirPath, { recursive: true });

  const t = await dbConfig.sequelize.transaction();

  try {
    // Check record exists
    const approval = await UiCaseApproval.findByPk(approval_id);
    if (!approval) {
      await t.rollback();
      return res.status(404).json({ message: "Approval record not found" });
    }

    // Optional: validate approval_item
    if (approval_item) {
      const exists = await ApprovalItem.findByPk(approval_item);
      if (!exists) {
        await t.rollback();
        return res.status(400).json({ message: "Invalid approval item ID" });
      }
    }

    // Update using WHERE clause
    await UiCaseApproval.update(
      {
        approval_item,
        approved_by,
        approval_date: approval_date || new Date(),
        remarks,
        module,
        action,
      },
      {
        where: { approval_id },
        transaction: t,
      }
    );

    // Create system alert
    const systemAlert = await System_Alerts.create(
      {
        approval_id,
        reference_id: approval.reference_id,
        alert_type: "Approval Update",
        alert_message: `Updated: ${remarks}`,
        created_by: user_id,
        created_by_designation_id,
        created_by_division_id,
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Approval record updated successfully",
      alert_data: systemAlert,
    });
  } catch (error) {
    if (t.finished !== "rollback") await t.rollback();
    console.error("Error updating Approval:", error);
    return res.status(500).json({
      message: "Failed to update Approval",
      error: error.message,
    });
  } finally {
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
};

exports.delete_ui_case_approval = async (req, res) => {
  const { user_id } = req.user;
  const { approval_id, transaction_id, created_by_designation_id, created_by_division_id } = req.body;

  if (!transaction_id || transaction_id === "") {
    return res.status(400).json({ success: false, message: "Transaction Id is required!" });
  }

  const dirPath = path.join(__dirname, `../data/ui_case_approval_unique/${transaction_id}`);

  if (fs.existsSync(dirPath)) {
    return res.status(400).json({ success: false, message: "Duplicate transaction detected." });
  }

  fs.mkdirSync(dirPath, { recursive: true });

  const t = await dbConfig.sequelize.transaction();

  try {
    const approval = await UiCaseApproval.findByPk(approval_id, { transaction: t });
    if (!approval) {
      await t.rollback();
      return res.status(404).json({ message: "Approval record not found" });
    }

    // Step 1: Find all related system alerts
    const systemAlerts = await System_Alerts.findAll({
      where: { approval_id },
      transaction: t,
    });

    // Step 2: Collect system_alert_ids to delete AlertViewStatus entries
    const systemAlertIds = systemAlerts.map(alert => alert.system_alert_id);

    // Step 3: Delete related alert view statuses
    if (systemAlertIds.length > 0) {
      await AlertViewStatus.destroy({
        where: {
          system_alert_id: systemAlertIds,
        },
        transaction: t,
      });
    }

    // Step 4: Delete related system alerts
    await System_Alerts.destroy({
      where: { approval_id },
      transaction: t,
    });

    // // Step 5: Delete the approval record
    // await UiCaseApproval.destroy({
    //   where: { approval_id },
    //   transaction: t,
    // });

    // Step 5: Update the status to false instead of deleting the approval record
    await UiCaseApproval.update(
    { status: false },  // Set status to false
    {
        where: { approval_id }, // Condition for the specific record
        transaction: t, // Ensure this is part of the transaction
    }
    );

    // Step 6: Log the delete action in system alerts
    const deleteAlert = await System_Alerts.create(
      {
        approval_id: approval.approval_id, 
        reference_id: approval.reference_id,
        alert_type: "Approval Delete",
        alert_message: "Approval record deleted",
        created_by: user_id,
        created_by_designation_id,
        created_by_division_id,
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Approval record deleted successfully",
      alert_data: deleteAlert,
    });
  } catch (error) {
    if (t.finished !== "rollback") await t.rollback();
    console.error("Error deleting Approval:", error);
    return res.status(500).json({
      message: "Failed to delete Approval",
      error: error.message,
    });
  } finally {
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
};
