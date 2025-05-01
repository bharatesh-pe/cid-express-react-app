const {
  UiCaseApproval,
  ApprovalItem,
  Designation,
  System_Alerts,
  UsersHierarchy,
  UsersHierarchyNew,
  AlertViewStatus,
  UserDesignation,
  KGID,
  Users,
  ApprovalFieldLog,
  ApprovalActivityLog
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

    // Fetch designations for the logged-in user
    const userDesignations = await UserDesignation.findAll({
    where: { user_id : userId },
    attributes: ["designation_id"],
    });
    if (!userDesignations.length) {
    return res
        .status(404)
        .json({ message: "User has no designations assigned" });
    }
    const officerDesignationIds = userDesignations.map((ud) => ud.designation_id);

    // Fetch subordinates based on officer designations
    const supervisor = await UsersHierarchyNew.findAll({
        where: { officer_designation_id : { [Op.in]: officerDesignationIds } },
        attributes: ["supervisor_designation_id"],
    });
    const supervisorDesignationIds = supervisor.map((sub) => sub.supervisor_designation_id);

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

         searchConditions.push(
            { "$approvalItem.name$": { [Op.iLike]: `%${search}%` } },
            { "$approvedBy.designation_name$": { [Op.iLike]: `%${search}%` } },
            { remarks: { [Op.iLike]: `%${search}%` } },
        );

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
    const designation = await Designation.findAll(
        {
            where: { designation_id : { [Op.in]: supervisorDesignationIds } }
        }
    );

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
    const subordinates = await UsersHierarchyNew.findAll({
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
            },
            });

            const read_status = alertViewStatus ? alertViewStatus.view_status : false;

            const approvalDetails = await UiCaseApproval.findOne({
            where: { approval_id: notification.approval_id }, // Removed status filter (optional)
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

            return {
            ...(typeof notification.toJSON === "function"
                ? notification.toJSON()
                : notification),
            read_status,
            approvalDetails: approvalDetails
                ? {
                    approval_id: approvalDetails.approval_id,
                    approval_item: approvalDetails.approval_item,
                    approved_by: approvalDetails.approved_by,
                    approval_date: approvalDetails.approval_date,
                    remarks: approvalDetails.remarks,
                    approvalItem: approvalDetails.approvalItem?.name || null,
                    approvedBy: approvalDetails.approvedBy?.designation_name || null,
                }
                : null,
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
    case_id,
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


    const changedFields = [];

    if (approval_item !== approval.approval_item) {
      changedFields.push({
        approval_id,
        case_id,
        field_name: "approval_item",
        old_value: approval.approval_item,
        updated_value: approval_item,
        created_by: user_id,
      });
    }

    if (approved_by !== approval.approved_by) {
      changedFields.push({
        approval_id,
        case_id,
        field_name: "approval_designation",
        old_value: approval.approved_by,
        updated_value: approved_by,
        created_by: user_id,
      });
    }

    const newDate = approval_date ? new Date(approval_date).toISOString() : null;
    const oldDate = approval.approval_date ? new Date(approval.approval_date).toISOString() : null;
    if (newDate !== oldDate) {
      changedFields.push({
        approval_id,
        case_id,
        field_name: "approval_date",
        old_value: approval.approval_date,
        updated_value: approval_date,
        created_by: user_id,
      });
    }

    if (remarks !== approval.remarks) {
      changedFields.push({
        approval_id,
        case_id,
        field_name: "remarks",
        old_value: approval.remarks,
        updated_value: remarks,
        created_by: user_id,
      });
    }

    if (changedFields.length > 0) {
      await ApprovalFieldLog.bulkCreate(changedFields, { transaction: t });
    }

    // Create system alert
    const systemAlert = await System_Alerts.create(
      {
        approval_id,
        reference_id: approval.reference_id,
        alert_type: "Approval Update",
        alert_message: `Updated: ${remarks}`,
        created_by: user_id,
        created_by_designation_id,
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

exports.get_approval_field_log = async (req, res) => {
  try {
    const { approval_id } = req.body;

    if (!approval_id) {
      return res.status(400).json({
        success: false,
        message: "approval_id is required",
      });
    }

    let activityLogs = await ApprovalFieldLog.findAll({
      where: { approval_id },
      order: [["created_at", "DESC"]],
      attributes: [
        "log_id",
        "approval_id",
        "case_id",
        "field_name",
        "old_value",
        "updated_value",
        "created_at",
        "created_by",
      ],
      raw: true,
    });

    if (!activityLogs.length) {
      return res.status(404).json({
        success: false,
        message: "No activity logs found for the given approval_id",
      });
    }

    activityLogs = await Promise.all(
      activityLogs.map(async (log) => {
        const updatedLog = { ...log };

        const parseDate = (value) => {
          const date = new Date(value);
          return isNaN(date.getTime()) ? value : date.toISOString().split("T")[0];
        };

        if (log.created_by) {
          const user = await Users.findOne({
            where: { user_id: log.created_by },
            attributes: ["kgid_id"],
            raw: true,
          });
    
          if (user && user.kgid_id) {
            const kgid = await KGID.findOne({
              where: { id: user.kgid_id },
              attributes: ["name"],
              raw: true,
            });
    
            if (kgid) {
              updatedLog.created_by = kgid.name;
            }
          }
        }
    
        if (log.field_name === "approval_item") {
          if (!isNaN(Number(log.old_value))) {
            const itemOld = await ApprovalItem.findOne({
              where: { approval_item_id: Number(log.old_value) },
              attributes: ["name"],
              raw: true,
            });
            if (itemOld) updatedLog.old_value = itemOld.name;
          }

          if (!isNaN(Number(log.updated_value))) {
            const itemNew = await ApprovalItem.findOne({
              where: { approval_item_id: Number(log.updated_value) },
              attributes: ["name"],
              raw: true,
            });
            if (itemNew) updatedLog.updated_value = itemNew.name;
          }
        }

        if (log.field_name === "approval_designation") {
          if (!isNaN(Number(log.old_value))) {
            const designationOld = await Designation.findOne({
              where: { designation_id: Number(log.old_value) },
              attributes: ["designation_name"],
              raw: true,
            });
            if (designationOld) updatedLog.old_value = designationOld.designation_name;
          }

          if (!isNaN(Number(log.updated_value))) {
            const designationNew = await Designation.findOne({
              where: { designation_id: Number(log.updated_value) },
              attributes: ["designation_name"],
              raw: true,
            });
            if (designationNew) updatedLog.updated_value = designationNew.designation_name;
          }
        }

        if (log.field_name === "approval_date") {
          if (log.old_value) updatedLog.old_value = parseDate(log.old_value);
          if (log.updated_value) updatedLog.updated_value = parseDate(log.updated_value);
        }

        return updatedLog;
      })
    );

    return res.status(200).json({
      success: true,
      data: activityLogs,
    });
  } catch (error) {
    console.error("Error in get_approval_field_log:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.get_approval_activity_log = async (req, res) => {
  try {
    const { case_id, approval_type } = req.body;

    if (!case_id || !approval_type) {
      return res.status(400).json({
        success: false,
        message: "case_id and approval_type are required",
      });
    }

    let activityLogs = await ApprovalActivityLog.findAll({
      where: { case_id, approval_type },
      order: [["created_at", "DESC"]],
      raw: true,
    });

    if (!activityLogs.length) {
      return res.status(404).json({
        success: false,
        message: "No activity logs found for the given case_id and approval_type",
      });
    }

    activityLogs = await Promise.all(
      activityLogs.map(async (log) => {
        const updatedLog = { ...log };

        // Format date
        if (log.created_at) {
          const date = new Date(log.created_at);
          updatedLog.created_at = isNaN(date.getTime())
            ? log.created_at
            : date.toISOString().split("T")[0];
        }

        // Get created_by name from KGID
        if (log.created_by) {
          const user = await Users.findOne({
            where: { user_id: log.created_by },
            attributes: ["kgid_id"],
            raw: true,
          });

          if (user?.kgid_id) {
            const kgid = await KGID.findOne({
              where: { id: user.kgid_id },
              attributes: ["name"],
              raw: true,
            });

            if (kgid?.name) {
              updatedLog.created_by = kgid.name;
            }
          }
        }

        // Get designation name for approved_by
        if (log.approved_by) {
          const designation = await Designation.findOne({
            where: { designation_id: log.approved_by },
            attributes: ["designation_name"],
            raw: true,
          });

          if (designation?.designation_name) {
            updatedLog.approved_by = designation.designation_name;
          }
        }

        // Get approval_item name
        if (log.approval_item_id) {
          const item = await ApprovalItem.findOne({
            where: { approval_item_id: log.approval_item_id },
            attributes: ["name"],
            raw: true,
          });

          if (item?.name) {
            updatedLog.approval_item_id = item.name;
          }
        }

        // Format approved_date
        if (log.approved_date) {
          const approvedDate = new Date(log.approved_date);
          updatedLog.approved_date = isNaN(approvedDate.getTime())
            ? log.approved_date
            : approvedDate.toISOString().split("T")[0];
        }


        return updatedLog; // Moved this outside the approval_item block
      })
    );

    return res.status(200).json({
      success: true,
      data: activityLogs,
    });
  } catch (error) {
    console.error("Error in get_approval_activity_log:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

