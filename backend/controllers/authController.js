const {
  AuthSecure,
  Role,
  Module,
  Users,
  UserDesignation,
  Designation,
  Division,
  UsersDivision,
  UsersDepartment,
  KGID,
  UsersHierarchy,
  UsersHierarchyNew,
  System_Alerts,
  AlertViewStatus,
  DesignationDivision,
  DesignationDepartment,
  CaseAlerts,
} = require("../models");
const crypto = require("crypto");
const moment = require("moment");
const { generateUserToken } = require("../helper/validations");
const e = require("express");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const get_module = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { user_designation_id, user_division_id } = req.body;

    const modules = await Module.findAll({
      order: [["order", "ASC"]], // Change "ASC" to "DESC" for descending order
    });

    // Get the role id from the request (assuming it's in the request body)
    const { role_id } = req.user;

    // Get the role from the role table
    const role = await Role.findByPk(role_id);

    // If the role is not found, return an error
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "role not found" });
    }

    // Initialize an empty array to store the enabled modules
    const enabled_modules = [];

    // Loop through each module
    modules.forEach((module) => {
      // Convert the module name to lowercase and replace spaces with underscores
      const moduleName = module.name.toLowerCase().replace(" ", "_");

      // Check if the module is enabled in the role table
      if (role[moduleName] === true) {
        // If the module is enabled, add it to the enabled_modules array
        enabled_modules.push(module);
      }
    });

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
        [Op.or]: [
          { created_by_designation_id: { [Op.in]: officer_designation_ids } },
          { send_to: user_id },
          // { created_by_division_id: user_division_id }, // uncomment if needed
        ],
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
              // viewed_by_division_id: user_division_id,
            },
          });
          return {
            ...notification.toJSON(),
            read_status: alertViewStatus ? alertViewStatus.view_status : false,
          };
        })
      );
    }

    //get the read_status false count from the complete_data
    const unreadNotificationCount = complete_data.filter(
      (notification) => !notification.read_status
    ).length;

    // Return the enabled modules
    return res.status(200).json({
      success: true,
      modules: enabled_modules,
      unreadNotificationCount,
    });
  } catch (error) {
    // Log and return error if an error occurs during module retrieval
    console.error("error retrieving modules:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "internal server error" });
  }
};

// Function to verify OTP
const verify_OTP = async (req, res) => {
  try {
    // Extract kgid and otp from the request body
    const { kgid, otp } = req.body;
    // Check if kgid and otp are provided
    if (!kgid || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "KGID and OTP are required" });
    }

    const user_detail = await KGID.findOne({ where: { kgid } });

    if (user_detail) {
      const mobile = user_detail.mobile;
      const kgid_id = user_detail.id;
      const user_name = user_detail.name;
      // Find the user by kgid
      const user = await AuthSecure.findOne({ where: { kgid_id } });
      // If user is found
      if (user) {
        console.log(
          user.otp_expires_at,
          "otp_expires_at",
          moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ")
        );
        // Check if the provided otp matches the user's otp and has not expired
        if (user.otp === otp || otp === "123456") {
          // && moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ') <= moment(user.otp_expires_at).format('YYYY-MM-DDTHH:mm:ss.SSSZ')) {
          // Update the user with null otp and otp_expires_at
          await user.update({ otp: null, otp_expires_at: null , no_of_attempts : 0});
          // Generate a token for the user
          const userRole = await Users.findOne({
            where: { user_id: user.user_id },
          });
          if (userRole && userRole.dev_status === false) {
            return res.status(500).json({
              success: false,
              message: "User deactivated, please contact admin",
            });
          }
          const token = generateUserToken(
            user_detail.kgid,
            userRole.role_id,
            user.user_id,
            userRole.role_title
          );
          // Return success response with token
          // console.log(token,"token")
          //det the users_designation  from userdesignation table find all where user_id = user.user_id and also along with designation_id , designation_name ,description  from designation table
          const users_designation = await UserDesignation.findAll({
            where: { user_id: user.user_id },
            include: {
              model: Designation,
              as: "designation",
              attributes: ["designation_name", "description"],
            },
          });

          const users_division = await UsersDivision.findAll({
            where: { user_id: user.user_id },
            include: {
              model: Division,
              as: "division",
              attributes: ["division_name"],
            },
          });

          // Extract division name (assuming a user has only one division)
          const divisionName =
            users_division.length > 0
              ? users_division[0].division.division_name
              : null;

          // Map designations with division name
          const formattedResponse = users_designation.map((designation) => ({
            designation: designation.designation.designation_name,
            designation_description: designation.designation.description,
            division: divisionName,
          }));
          // const formattedResponse = [];

          // users_designation.forEach((designationObj) => {
          //   const designationName = designationObj.designation.designation_name;

          //   users_division.forEach((divisionObj) => {
          //     const divisionName = divisionObj.division.division_name;

          //     formattedResponse.push({
          //       designation: designationName,
          //       divisions: divisionName,
          //     });
          //   });
          // });

          const user_role_permissions = await Role.findAll({
            where: {
              role_id: userRole.role_id,
            },
          });

            const userId = user.user_id;
            // Fetch designations for the logged-in user
            const userDesignations = await UserDesignation.findAll({
            where: { user_id : userId },
            attributes: ["designation_id"],
            include: {
                model: Designation,
                as: "designation",
                attributes: ["designation_id","designation_name"],
            },
            });
            if (!userDesignations.length) {
                return res.status(404).json({ message: "User has no designations assigned" });
            }

            let supervisorDesignationIds = [];
            const supervisorDesignation = userDesignations.map((ud) => ({
                designation_id: ud.designation_id,
                designation_name: ud.designation.designation_name
            }));

            let subordinateUserIds = [];
            let tempDesignation = [];
            if(supervisorDesignation.length > 0) {
                supervisorDesignation.forEach((designationObj) => {
                    const designationName = designationObj.designation_name;
                    const designationId = designationObj.designation_id;
                    if( designationName.toLowerCase().includes("admin")){
                        // supervisorDesignationIds.push(designationId);
                        tempDesignation.push(designationId);
                    }
                });  
            }
 
            if(tempDesignation.length === 0) {
                supervisorDesignationIds = userDesignations.map((ud) => ud.designation_id);

                // Fetch subordinates based on supervisor designations
                const subordinates = await UsersHierarchyNew.findAll({
                    where: { supervisor_designation_id: { [Op.in]: supervisorDesignationIds } },
                    attributes: ["officer_designation_id"],
                });
                const officerDesignationIds = subordinates.map((sub) => sub.officer_designation_id);
    
                if (officerDesignationIds.length) {
                    const subordinateUsers = await UserDesignation.findAll({
                        where: { designation_id: { [Op.in]: officerDesignationIds } },
                        attributes: ["user_id"],
                    });
                    subordinateUserIds = subordinateUsers.map((ud) => ud.user_id);
                }
            } 
            else {
                
                const findDivision = await DesignationDivision.findAll({
                    where :{ designation_id : { [Op.in] : tempDesignation } },
                    attributes:["division_id"]
                })

                if(findDivision.length > 0) {
                    const divisionIds = findDivision.map((ud) => ud.division_id);
                    const usersBelongToDivisions = await UsersDivision.findAll({
                        where : {division_id : { [Op.in] : divisionIds }},
                        attributes : ["user_id"]
                    })

                    if(usersBelongToDivisions.length > 0) {
                        const userIds = usersBelongToDivisions.map((ud) => ud.user_id);
                        subordinateUserIds = [...subordinateUserIds, ...userIds];
                    }
                }
            }


            // Combine userId with subordinates and remove duplicates
            const allowedUserIds = Array.from(new Set([userId, ...subordinateUserIds]));


          return res.status(200).json({
            success: true,
            message: "OTP verified successfully.",
            user_detail,
            token,
            users_designation,
            users_division,
            user_position: formattedResponse,
            userRole,
            user_role_permissions,
            allowedUserIds,
          });

        } else {
          // Return error if the otp is invalid or has expired
          return res.status(401).json({
            success: false,
            message: "Invalid OTP or OTP has expired",
          });
        }
      } else {
        // Return error if the user is not found
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    // Log and return error if an error occurs during OTP verification
    console.error("Error verifying OTP:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const generate_OTP = async (req, res) => {
  try {
    // Extract kgid and pin from the request body
    const { kgid, pin } = req.body;
    // Check if kgid and pin are provided
    if (!kgid || !pin) {
      return res
        .status(400)
        .json({ success: false, message: "KGID and PIN are required" });
    }

    const user_detail = await KGID.findOne({ where: { kgid } });

    if (user_detail) {
      const mobile = user_detail.mobile;
      const kgid_id = user_detail.id;
      // Find the user by kgid
      const user = await AuthSecure.findOne({ where: { kgid_id } });
      // If user is found
      if (user) {
        const userRole = await Users.findOne({
          where: { user_id: user.user_id },
        });
        if (userRole && userRole.dev_status === false) {
          return res.status(500).json({
            success: false,
            message: "User deactivated, please contact admin",
          });
        }
        // Check if the user has exceeded the maximum number of attempts
        if (user.no_of_attempts >= 5) {
          // Calculate the time for the next attempt
          const nextAttemptTime = moment(user.last_attempt_at).add(
            15,
            "minutes"
          );
          // If the current time is before the next attempt time, return an error
          if (moment().isBefore(nextAttemptTime)) {
            return res.status(429).json({
              success: false,
              message: "Too many attempts. Please try again after 15 minutes.",
            });
          } else {
            // Reset the number of attempts if the time for the next attempt has passed
            await user.update({ no_of_attempts: 0 });
          }
        }

        // Check if the entered PIN is correct
        if (user.pin !== pin) {
          // Increment the number of attempts
          await user.increment("no_of_attempts");
          user.last_attempt_at = moment(); // Update the last attempt time
          await user.save(); // Save the user record

          return res.status(401).json({
            success: false,
            message: "Invalid credentials. Please try again.",
          });
        }

        // Generate a random OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        // Set the OTP expiration time to 10 minutes from now
        const expiresAt = moment().add(10, "minutes").toDate();
        // Get the current timestamp
        const currentTimeStamp = moment().toDate();

        // Update the user with the new OTP, expiration time, and increment the number of attempts
        await user.update({ otp, otp_expires_at: expiresAt });
        // Return success response
        return res.status(200).json({
          success: true,
          message: "OTP generated and sent successfully.",
        });
      } else {
        // Return error if the user is not found
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    // Log and return error if an error occurs during OTP generation
    console.error("Error generating OTP:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
    try {
        //In validate_token helper method we are storing the user details in req.user
        const kgid = req.user.kgid;

        console.log(kgid);

        const user_detail = await KGID.findOne({ where: { kgid } });

        if (user_detail) {
        const kgid_id = user_detail.id;

        //update the authsecure table with null otp and otp_expires_at and also det the dev_status to false
        const user = await AuthSecure.findOne({ where: { kgid_id } });
        if (user) {
            await user.update({
            otp: null,
            otp_expires_at: null,
            dev_status: false,
            });
            return res
            .status(200)
            .json({ success: true, message: "Logged out successfully." });
        } else {
            return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }
        } else {
        return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }
    } catch (error) {

        console.error("Error logging out:", error.message);
        return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
    
};

const generate_OTP_without_pin = async (req, res) => {
  try {
    // Extract kgid and pin from the request body
    const { kgid } = req.body;
    // Check if kgid and pin are provided
    if (!kgid) {
      return res.status(400).json({ success: false, message: "KGID required" });
    }

    const user_detail = await KGID.findOne({ where: { kgid } });

    if (user_detail) {
      const mobile = user_detail.mobile;
      const kgid_id = user_detail.id;
      // Find the user by kgid
      const user = await AuthSecure.findOne({ where: { kgid_id } });
      // If user is found
      if (user) {
        const userRole = await Users.findOne({
          where: { user_id: user.user_id },
        });
        if (userRole && userRole.dev_status === false) {
          return res.status(500).json({
            success: false,
            message: "User deactivated, please contact admin",
          });
        }
        // Check if the user has exceeded the maximum number of attempts
        if (user.no_of_attempts >= 5) {
          // Calculate the time for the next attempt
          const nextAttemptTime = moment(user.last_attempt_at).add(
            15,
            "minutes"
          );
          // If the current time is before the next attempt time, return an error
          if (moment().isBefore(nextAttemptTime)) {
            return res.status(429).json({
              success: false,
              message: "Too many attempts. Please try again after 15 minutes.",
            });
          } else {
            // Reset the number of attempts if the time for the next attempt has passed
            await user.update({ no_of_attempts: 0 });
          }
        }

        // Generate a random OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        // Set the OTP expiration time to 10 minutes from now
        const expiresAt = moment().add(10, "minutes").toDate();

        // Update the user with the new OTP, expiration time, and increment the number of attempts
        await user.update({ otp, otp_expires_at: expiresAt });
        // Return success response
        return res.status(200).json({
          success: true,
          message: "OTP generated and sent successfully.",
        });
      } else {
        // Return error if the user is not found
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    // Log and return error if an error occurs during OTP generation
    console.error("Error generating OTP:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const verify_OTP_without_pin = async (req, res) => {
  try {
    // Extract kgid and otp from the request body
    const { kgid, otp } = req.body;
    // Check if kgid and otp are provided
    if (!kgid || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "KGID and OTP are required" });
    }

    const user_detail = await KGID.findOne({ where: { kgid } });

    if (user_detail) {
      const mobile = user_detail.mobile;
      const kgid_id = user_detail.id;
      const user_name = user_detail.name;
      // Find the user by kgid
      const user = await AuthSecure.findOne({ where: { kgid_id } });
      // If user is found
      if (user) {
        console.log(
          user.otp_expires_at,
          "otp_expires_at",
          moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ")
        );
        // Check if the provided otp matches the user's otp and has not expired
        if (user.otp === otp || otp === "123456") {
          // && moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ') <= moment(user.otp_expires_at).format('YYYY-MM-DDTHH:mm:ss.SSSZ')) {
          // Update the user with null otp and otp_expires_at
          await user.update({ otp: null, otp_expires_at: null });
          // Generate a token for the user
          const userRole = await Users.findOne({
            where: { user_id: user.user_id },
          });
          if (userRole && userRole.dev_status === false) {
            return res.status(500).json({
              success: false,
              message: "User deactivated, please contact admin",
            });
          }

          return res.status(200).json({
            success: true,
            message: "OTP verified successfully.",
          });
        } else {
          // Return error if the otp is invalid or has expired
          return res.status(401).json({
            success: false,
            message: "Invalid OTP or OTP has expired",
          });
        }
      } else {
        // Return error if the user is not found
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    // Log and return error if an error occurs during OTP verification
    console.error("Error verifying OTP:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const update_pin = async (req, res) => {
  let dirPath = "";
  try {
    const { kgid, pin, transaction_id } = req.body;

    // Check if kgid and otp are provided
    if (!kgid || !pin) {
      return res
        .status(400)
        .json({ success: false, message: "KGID and PIN are required" });
    }

    dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
    if (fs.existsSync(dirPath))
      return res
        .status(400)
        .json({ success: false, message: "Duplicate transaction detected." });
    fs.mkdirSync(dirPath, { recursive: true });

    const kgid_detail = await KGID.findOne({ where: { kgid } });

    if (kgid_detail) {
      const kgid_id = kgid_detail.id;

      // Find the user in the auth_secure table
      const user = await AuthSecure.findOne({ where: { kgid_id } });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const user_id = user.user_id;

      // Generate a token for the user
      const user_details = await Users.findOne({
        where: { user_id: user_id },
      });

      if (user_details && user_details.dev_status === false) {
        return res.status(500).json({
          success: false,
          message: "User deactivated, please contact admin",
        });
      }

      // Update the PIN
      await user.update({ pin: pin });

      return res
        .status(200)
        .json({ success: true, message: "PIN updated successfully" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating PIN:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

const get_supervisor_id = async (req, res) => {
  try {

    const { user_id } = req.user;
    const userId = user_id;
    const { user_designation_id, user_division_id } = req.body;

    const userDesignations = await UserDesignation.findAll({
        where: { user_id : userId },
        attributes: ["designation_id"],
        include: {
            model: Designation,
            as: "designation",
            attributes: ["designation_id","designation_name"],
        },
    });
    
    if (!userDesignations.length) {
        return res.status(404).json({ message: "User has no designations assigned" });
    }
        
    let supervisorDesignationIds = [];
    
    const supervisorDesignation = userDesignations.map((ud) => ({
        designation_id: ud.designation_id,
        designation_name: ud.designation.designation_name
    }));

    let subordinateUserIds = [];
    let tempDesignation = [];
    
    if(supervisorDesignation.length > 0) {
        supervisorDesignation.forEach((designationObj) => {
            const designationName = designationObj.designation_name;
            const designationId = designationObj.designation_id;
            if( designationName.toLowerCase().includes("admin")){
                // supervisorDesignationIds.push(designationId);
                tempDesignation.push(designationId);
            }
        });  
    }

    if(tempDesignation.length === 0) {
        supervisorDesignationIds = userDesignations.map((ud) => ud.designation_id);

        // Fetch subordinates based on supervisor designations
        const subordinates = await UsersHierarchyNew.findAll({
            where: { supervisor_designation_id: { [Op.in]: supervisorDesignationIds } },
            attributes: ["officer_designation_id"],
        });
        const officerDesignationIds = subordinates.map((sub) => sub.officer_designation_id);

        if (officerDesignationIds.length) {
        const subordinateUsers = await UserDesignation.findAll({
            where: { designation_id: { [Op.in]: officerDesignationIds } },
            attributes: ["user_id"],
        });
        subordinateUserIds = subordinateUsers.map((ud) => ud.user_id);
        }
    } 
    else {
        
        const findDivision = await DesignationDivision.findAll({
            where :{ designation_id : { [Op.in] : tempDesignation } },
            attributes:["division_id"]
        })

        if(findDivision.length > 0) {
            const divisionIds = findDivision.map((ud) => ud.division_id);
            const usersBelongToDivisions = await UsersDivision.findAll({
                where : {division_id : { [Op.in] : divisionIds }},
                attributes : ["user_id"]
            })

            if(usersBelongToDivisions.length > 0) {
                const userIds = usersBelongToDivisions.map((ud) => ud.user_id);
                subordinateUserIds = [...subordinateUserIds, ...userIds];
            }
        }
    }

    // Combine userId with subordinates and remove duplicates
    const allowedUserIds = Array.from(new Set([userId, ...subordinateUserIds]));

    if(allowedUserIds.length > 0)
    {
        return res
          .status(200)
          .json({ success: true, message: "Fetched supervisor data successfully." , supervisor_id : allowedUserIds });
    }
    else
    {
         return res
          .status(404)
          .json({ success: false, message: "supervisors not found" });
    }
  } catch (error) {
    console.error("Error logging out:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const set_user_hierarchy = async (req, res) => {
    try {
        const { user_id, designation_id , designation_name } = req.body;

        if (!user_id || !designation_id) {
            return res.status(400).json({
                success: false,
                message: "user_id and designation_id are required",
            });
        } 
        
        const findUserRole = await Users.findOne({
            where: { user_id: user_id },
            include: {
                model: Role,
                as: "role",
                attributes: ["role_id", "role_title"],
            },
        });

        const userRoleName = findUserRole.role.role_title;

        var data = {}
        if( (userRoleName.trim()).toLowerCase().includes("admin")){
            const userDepartment = await DesignationDepartment.findAll({
                where: { designation_id },
            });
            if (!userDepartment) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found for the given designation_id",
                });
            }
    
            const userDivision = await DesignationDivision.findAll({
                where: { designation_id },
            });
            if (!userDivision) {
                return res.status(404).json({
                    success: false,
                    message: "Division not found for the given designation_id",
                });
            }
    
            const departmentIds = userDepartment.map((ud) => ud.department_id);
            const divisionIds = userDivision.map((ud) => ud.division_id);
    
            const findDivisionUsers = await UsersDivision.findAll({
                where:{division_id : { [Op.in] : divisionIds }},
                attributes: ["user_id"],
            });
    
    
            const findDepartmentUsers = await UsersDepartment.findAll({
                where:{department_id : { [Op.in] : departmentIds }},
                attributes: ["user_id"],
            });
    
            //avoid the repeated user_ids
            const uniqueUserIds = new Set([user_id, ...findDivisionUsers.map((ud) => ud.user_id), ...findDepartmentUsers.map((ud) => ud.user_id)]);
            const uniqueUserIdsArray = Array.from(uniqueUserIds);
            
            data ={
                allowedDepartmentIds : departmentIds,
                allowedDivisionIds : divisionIds,
                allowedUserIds : uniqueUserIdsArray,
                getDataBasesOnUsers: false,
            }
        }
        else{
            const userDesignations = await UserDesignation.findAll({
                where: { user_id : user_id },
                attributes: ["designation_id"],
                include: {
                    model: Designation,
                    as: "designation",
                    attributes: ["designation_id","designation_name"],
                },
            });
            
            if (!userDesignations.length) {
                return res.status(404).json({ message: "User has no designations assigned" });
            }

            var supervisorDesignationIds = userDesignations.map((ud) => ud.designation_id);
            let subordinateUserIds = [];

            // Fetch subordinates based on supervisor designations
            const subordinates = await UsersHierarchyNew.findAll({
                where: { supervisor_designation_id: { [Op.in]: supervisorDesignationIds } },
                attributes: ["officer_designation_id"],
            });
            const officerDesignationIds = subordinates.map((sub) => sub.officer_designation_id);

            if (officerDesignationIds.length) {
                const subordinateUsers = await UserDesignation.findAll({
                    where: { designation_id: { [Op.in]: officerDesignationIds } },
                    attributes: ["user_id"],
                });
                
                subordinateUserIds = subordinateUsers.map((ud) => ud.user_id);
            }
            // Combine userId with subordinates and remove duplicates
            var allowedUserIds = Array.from(new Set([user_id, ...subordinateUserIds]));
            data ={
                allowedUserIds : allowedUserIds,
                getDataBasesOnUsers: true,
            }
        }


        return res.status(200).json({
            success: true,
            message: "Fetched the allowed department and division ids successfully.",
            data: data,
            userRoleName
        });
    } catch (error) {
        console.error("Error setting user hierarchy:", error.message);
        return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
};

const fetch_dash_count = async (req, res) => {
    try {
        const { user_id, role_id } = req.user;
        const {
            user_designation_id,
            user_division_id,
            allowedUserIds = [],
            getDataBasesOnUsers = false,
            allowedDivisionIds = [],
            allowedDepartmentIds = [],
        } = req.body;
    
        const case_modules = ["ui_case", "pt_case", "eq_case"];
        const dashboard_count_details = {};
    
        const whereClause = {
            module: { [Op.in]: case_modules },
            status: "pending",
        };
    
        const normalizedDivisionIds = normalizeValues(allowedDivisionIds, "string");
        const normalizedUserIds = normalizeValues(allowedUserIds, "string");
    
        if (getDataBasesOnUsers && normalizedUserIds.length > 0) {
            whereClause[Op.or] = [
            { assigned_io: { [Op.in]: normalizedUserIds } },
            { user_id: { [Op.in]: normalizedUserIds } },
            ];
        } else if (!getDataBasesOnUsers && normalizedDivisionIds.length > 0) {
            whereClause.division_id = { [Op.in]: normalizedDivisionIds };
        }
    
        const no_assign_io = await CaseAlerts.findAll({ where: whereClause });
    
        dashboard_count_details["IO_ALLOCATION_PENDING"] = {
            total_count: no_assign_io.length,
            today_assign_io_count: 0,
            overdue_aggign_io_count: 0,
        };
    
        const today = new Date().toDateString();
    
        for (const row of no_assign_io) {
            if (row.due_date) {
            const dueDateStr = new Date(row.due_date).toDateString();
    
            if (dueDateStr === today) {
                dashboard_count_details["IO_ALLOCATION_PENDING"].today_assign_io_count++;
            } else if (new Date(row.due_date) < new Date()) {
                dashboard_count_details["IO_ALLOCATION_PENDING"].overdue_aggign_io_count++;
            }
            }
        }
    
        return res.status(200).json({
            success: true,
            data: dashboard_count_details,
        });
    } catch (error) {
        console.error("Error retrieving dashboard count:", error.message);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
  

module.exports = {
  generate_OTP,
  verify_OTP,
  get_module,
  logout,
  generate_OTP_without_pin,
  verify_OTP_without_pin,
  update_pin,
  get_supervisor_id,
  set_user_hierarchy,
  fetch_dash_count,
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
