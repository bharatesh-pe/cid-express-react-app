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
    ui_case_id,
    pt_case_id,
    eq_case_id,
    transaction_id,
    created_by_designation_id,
    created_by_division_id,
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
        pt_case_id: pt_case_id || null,
        eq_case_id: eq_case_id || null,
        ui_case_id: ui_case_id || null,
      },
      { transaction: t }
    );

    let reference_id = ui_case_id || pt_case_id || eq_case_id;
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
      message: "UiCaseApproval created successfully",
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
    const { ui_case_id, pt_case_id, eq_case_id } = req.body;
    let whereCondition = {};

    // Dynamically add conditions
    if (ui_case_id) {
      whereCondition.ui_case_id = ui_case_id;
    }
    if (pt_case_id) {
      whereCondition.pt_case_id = pt_case_id;
    }
    if (eq_case_id) {
      whereCondition.eq_case_id = eq_case_id;
    }

    const approvals = await UiCaseApproval.findAll({
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
      where: whereCondition,
      attributes: [
        "approval_id",
        "approval_item",
        "approved_by",
        "approval_date",
        "remarks",
      ],
    });

    const formattedApprovals = approvals.map((approval) => ({
      approval_id: approval.approval_id,
      approval_item: approval.approval_item,
      approved_by: approval.approved_by,
      approval_date: approval.approval_date,
      remarks: approval.remarks,
      approvalItem: approval.approvalItem?.name || null, // Extract the name directly
      approvedBy: approval.approvedBy?.designation_name || null, // Extract the designation_name directly
    }));

    const approval_item = await ApprovalItem.findAll();

    const designation = await Designation.findAll();

    return res.status(200).json({
      success: true,
      data: {
        approvals: formattedApprovals,
        approval_item: approval_item,
        designation: designation,
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

    // Get officer_designation_ids under the supervisor's designations
    const subordinates = await UsersHierarchy.findAll({
      where: {
        supervisor_designation_id: user_designation_id,
      },
      attributes: ["officer_designation_id"],
    });

    const officer_designation_ids = subordinates.map(
      (subordinate) => subordinate.officer_designation_id
    );

    const alertNotifications = await System_Alerts.findAll({
      where: {
        created_by_designation_id: { [Op.in]: officer_designation_ids },
        created_by_division_id: user_division_id,
      },
      order: [["created_at", "DESC"]],
    });

    let complete_data = [];

    if (alertNotifications.length > 0) {
      complete_data = await Promise.all(
        alertNotifications.map(async (notification) => {
          const alertViewStatus = await AlertViewStatus.findOne({
            where: {
              system_alert_id: notification.system_alert_id,
              viewed_by: user_id,
              viewed_by_designation_id: user_designation_id,
              viewed_by_division_id: user_division_id,
            },
          });
          return {
            ...notification.toJSON(),
            read_status: alertViewStatus ? alertViewStatus.view_status : false,
          };
        })
      );
    }

    //from the complete_data there is created_by get it and fing the user name in user table and in user table there is only kgid_id and the name is in the kgid table get the name
    const userIds = complete_data.map(
      (notification) => notification.created_by
    );

    const users = await Users.findAll({
      where: { kgid_id: { [Op.in]: userIds } },
      attributes: ["kgid_id"],
    });

    //here i have the kgid_id and i will find the name in the kgid table
    const kgidIds = users.map((user) => user.kgid_id);

    const kgids = await KGID.findAll({
      where: { id: { [Op.in]: kgidIds } },
      attributes: ["id", "name"],
    });

    //create a map of kgid_id and name
    const kgidMap = kgids.reduce((acc, kgid) => {
      acc[kgid.id] = kgid.name;
      return acc;
    }, {});

    //add the name to the complete_data
    complete_data = complete_data.map((notification) => {
      notification.created_by_name = kgidMap[notification.created_by];
      return notification;
    });

    //get the read_status false count from the complete_data
    const unreadCount = complete_data.filter(
      (notification) => !notification.read_status
    ).length;

    return res.status(200).json({
      success: true,
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

    //also get the approval_item name from ApprovalItem is linked and approved_by name from Designation
    const approvalDetails = await UiCaseApproval.findOne({
      where: { approval_id },
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

    // Flatten the response
    const formattedDetails = {
      ...approvalDetails,
      approvalItem: approvalDetails?.approvalItem?.name || null,
      approvedBy: approvalDetails?.approvedBy?.designation_name || null,
    };

    const alertNotifications = await System_Alerts.findOne({
      where: { approval_id: approval_id },
    });

    //update the  AlertViewStatus create a entery if not exist
    const alertViewStatus = await AlertViewStatus.findOne({
      where: {
        system_alert_id: alertNotifications.system_alert_id,
        viewed_by: user_id,
        viewed_by_designation_id: user_designation_id,
        viewed_by_division_id: user_division_id,
      },
    });

    if (!alertViewStatus) {
      await AlertViewStatus.create({
        system_alert_id: alertNotifications.system_alert_id,
        viewed_by: user_id,
        viewed_by_designation_id: user_designation_id,
        viewed_by_division_id: user_division_id,
        view_status: true,
      });
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
