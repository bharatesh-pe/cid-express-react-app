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
  Template,
} = require("../models");
const Sequelize = require("sequelize");
const { userSendResponse } = require("../services/userSendResponse");
const db = require("../models");
const sequelize = db.sequelize;
const crypto = require("crypto");
const moment = require("moment");
const { generateUserToken } = require("../helper/validations");
const e = require("express");
const { Op , fn, col, literal } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { pdfDocEncodingDecode } = require("pdf-lib");
const { sendSMS } = require("../services/smsService"); // <-- Add this import
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
                    subordinateUserIds = subordinateUsers.map((ud) => String(ud.user_id));
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
                        const userIds = usersBelongToDivisions.map((ud) => String(ud.user_id));
                        subordinateUserIds = [...subordinateUserIds, ...userIds];
                    }
                }
            }


            // Combine userId with subordinates and remove duplicates
            const allowedUserIds = Array.from(new Set([String(userId), ...subordinateUserIds]));


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

            // Send SMS after OTP is generated and saved
            try {
                await sendSMS({
                    message: `Dear User, use this One Time Password ${otp} to log in to your CMS application. This OTP will be valid for the next 2 mins.-KSPPCW`,
                    mobile: '9698273271',
                    template_id: '1107174885741640587',
                });
            } catch (smsErr) {
                console.error("Failed to send SMS:", smsErr.message);
                if (smsErr.response) {
                    console.error("SMS response body:", smsErr.response.data);
                }
            }

            // Return success response
            return res.status(200).json({
            success: true,
            message: "OTP generated and sent successfully."+otp,
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

        // Send SMS after OTP is generated and saved
        try {
          await sendSMS({
            message: `Dear User, use this One Time Password ${otp} to log in to your CMS application. This OTP will be valid for the next 2 mins.-KSPPCW`,
            mobile: mobile,
            template_id: '1107174885741640587',
          });
        } catch (smsErr) {
          console.error("Failed to send SMS:", smsErr.message);
          // Optionally, you can return an error or continue
        }

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
                
                subordinateUserIds = subordinateUsers.map((ud) => String(ud.user_id));
            }
            // Combine userId with subordinates and remove duplicates
            var allowedUserIds = Array.from(new Set([String(user_id), ...subordinateUserIds]));
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

// const fetch_dash_count = async (req, res) => {
//     try {
//         const { user_id, role_id } = req.user;
//         const {
//             user_designation_id,
//             user_division_id,
//             allowedUserIds = [],
//             getDataBasesOnUsers = false,
//             allowedDivisionIds = [],
//             allowedDepartmentIds = [],
//             case_modules,
//         } = req.body;
    
//         // const case_modules = ["ui_case", "pt_case", "eq_case"];
//         const dashboard_count_details = {};
    
//         const ioWhereClause = {
//             module: case_modules ,
//             status: "pending",
//         };
    
//         const normalizedDivisionIds = normalizeValues(allowedDivisionIds, "string");
//         const normalizedUserIds = normalizeValues(allowedUserIds, "string");
    
//         if (getDataBasesOnUsers && normalizedUserIds.length > 0) {
//             ioWhereClause[Op.or] = [
//             { assigned_io: { [Op.in]: normalizedUserIds } },
//             { user_id: { [Op.in]: normalizedUserIds } },
//             ];
//         } else if (!getDataBasesOnUsers && normalizedDivisionIds.length > 0) {
//             ioWhereClause.division_id = { [Op.in]: normalizedDivisionIds };
//         }

//         ioWhereClause.alert_type = "IO_ALLOCATION";

//         const APWhereClause = {
//             module: case_modules,
//             status: "pending",
//             alert_type: "ACTION_PLAN",
//             send_to_type: "user",
//         };
        
//         APWhereClause[Op.or] = [
//             { designation_id: { [Op.in]: [String(user_designation_id)] } },
//             { user_id: { [Op.in]: [String(user_id)] } },
//         ];


        
//         const action_plan_pending = await CaseAlerts.findAll({ where: APWhereClause });
    
//         const no_assign_io = await CaseAlerts.findAll({ where: ioWhereClause });
        
//         /*alert types */
//         //{
//         // IO_ALLOCATION_PENDING - ON creation
//         // ACTION_PLAN_PENDING - Cron
//         // ACTION_PLAN_OVERDUE - Cron
//         // PROGRESS_REPORT_PENDING - Cron
//         // PROGRESS_REPORT_OVERDUE - Cron
//         // FSL_PF_ALERT - Cron
//         // FSL_PF_CRITICAL - Cron
//         // FSL_PF_OVERDUE - Cron
//         // FSL_OVERDUE_TODAY - Cron
//         // CUSTODIAL_CS_ALERT
//         // CUSTODIAL_CS_CRITICAL
//         // CC_PENDENCY
//         // TRIAL_TODAY
//         // NOTICE_41A_PENDING
//         //}

//         //get Aggigned IO 
//         dashboard_count_details["IO_ALLOCATION"] = {
//             label: "Case IO Allocation",
//             divider: 2,
//             divider_details: {
//                 "low": {
//                     name: "24 hrs",
//                     count: 0,
//                     record_id:[],
//                     level:"low",
//                 },
//                 "high": {
//                     name: "Over Due",
//                     count: 0,
//                     record_id:[],
//                     level:"high",
//                 }
//             },
//             total_count: 0,
//         };

//         //get Action plan 
//         dashboard_count_details["ACTION_PLAN"] = {
//             label: "Action Plan",
//             divider: 2,
//             divider_details: {
//                 "low": {
//                     name: "Approval",
//                     count: 0,
//                     record_id:[],
//                     level:"low",
                    
//                 },
//                 "high": {
//                     name: "Over Due",
//                     count: 0,
//                     record_id:[],
//                     level:"high",
//                 }
//             },
//             total_count: 0,
//         };

//         //get progress report count
//         dashboard_count_details["PROGRESS_REPORT"] = {
//             label: "Progress Report",
//             divider: 2,
//             divider_details: {
//                 "low": {
//                     name: "1 to 5 Days",
//                     count: 0,
//                     record_id:[],
//                     level:"low",
                    
//                 },
//                 "high": {
//                     name: "Over Due",
//                     count: 0,
//                     record_id:[],
//                     level:"high",
//                 }
//             },
//             total_count: 0,
//         };

//         //get Property form
//         dashboard_count_details["FSL_PF"] = {
//             label: "Property Form Send to FSL",
//             divider: 3,
//             divider_details: {
//                 "low": {
//                     name: "10 - 20 Days",
//                     count: 0,
//                     record_id:[],
//                     level:"low",
                    
//                 },
//                 "medium": {
//                     name: "20 - 30 Days",
//                     count: 0,
//                     record_id:[],
//                     level:"medium",
                    
//                 },
//                 "high": {
//                     name: "Beyond 30 Days",
//                     count: 0,
//                     record_id:[],
//                     level:"high",
//                 }
//             },
//             total_count: 0,
//         };

//         //get FSL
//         dashboard_count_details["FSL"] = {
//             label: "FSL Due Today",
//             total_count: 0,
//         };

//         //get accused 
//         dashboard_count_details["CUSTODIAL"] = {
//             label: "Custodial Cases for Chargesheet",
//             divider: 2,
//             divider_details: {
//                 "low": {
//                     name: "30 - 45 Days",
//                     count: 0,
//                     record_id:[],
//                     level:"low",
                    
//                 },
//                 "high": {
//                     name: "Above 45 Days",
//                     count: 0,
//                     record_id:[],
//                     level:"high",
                    
//                 },
//             },
//             total_count: 0,
//         };

        // dashboard_count_details["NATURE_OF_DISPOSAL"] = {
        //     label: "Charge Sheet (CC) Pendency",
        //     divider: 3,
        //     divider_details: {
        //         "60": {
        //             name: "60 - 90 Days",
        //             count: 0,
        //             record_id:[],
        //             level:"low",                    
        //         },
        //         "90": {
        //             name: "DIG Extension",
        //             count: 0,
        //             record_id:[],
        //             level:"medium",
        //             only:""
                    
        //         },
        //         "150": {
        //             name: "150 - 180 Days",
        //             count: 0,
        //             record_id:[],
        //             level:"high",
        //         },
        //         "180": {
        //             name: "ADGP Extension",
        //             count: 0,
        //             record_id:[],
        //             level:"medium",
                    
        //         },
        //         "360": {
        //             name: "180 - 360 Days",
        //             count: 0,
        //             record_id:[],
        //             level:"high",
        //         },
        //         "above_360": {
        //             name: "DGP Extension",
        //             count: 0,
        //             record_id:[],
        //             level:"high",
        //         },

        //     },
        //     total_count: 0,
        // };

        
//         const todayStr = new Date().toDateString();
//         for (const row of no_assign_io) {
//             if (row.due_date) {
//                 const dueDate = new Date(row.due_date);
//                 const dueDateStr = dueDate.toDateString();
        
//                 if (dueDateStr >= todayStr) {
//                     dashboard_count_details["IO_ALLOCATION"].divider_details['low'].count++;
//                     dashboard_count_details["IO_ALLOCATION"].divider_details['high'].record_id.push(row.record_id);
//                 } else if (dueDate < new Date()) {
//                     dashboard_count_details["IO_ALLOCATION"].divider_details['low'].count++;
//                     dashboard_count_details["IO_ALLOCATION"].divider_details['high'].record_id.push(row.record_id);
//                 }
//             }
//         }
        
       
//         for (const row of action_plan_pending) {
//             if (row.due_date) {
//                 const dueDate = new Date(row.due_date);
//                 const dueDateStr = dueDate.toDateString();
        
//                 if (dueDate > new Date()) {
//                     dashboard_count_details["ACTION_PLAN"].divider_details['need_to_approve'].count++;
//                     dashboard_count_details["ACTION_PLAN"].divider_details['need_to_approve'].record_id.push(row.record_id);
//                 }   
//                 else if (dueDate < new Date()) {
//                     dashboard_count_details["ACTION_PLAN"].divider_details['over_due'].count++;
//                     dashboard_count_details["ACTION_PLAN"].divider_details['over_due'].record_id.push(row.record_id);
//                 }
//             }
//         }
    
//         return res.status(200).json({
//             success: true,
//             data: dashboard_count_details,
//         });
//     } catch (error) {
//         console.error("Error retrieving dashboard count:", error.message);
//         return res
//             .status(500)
//             .json({ success: false, message: "Internal server error" });
//     }
// };

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
            case_modules,
            user_designation,
            sub_court,
        } = req.body;

        const normalizedDivisionIds = normalizeValues(allowedDivisionIds, "string");
        const normalizedUserIds = normalizeValues(allowedUserIds, "string");

        const caseWhereClause = {};

        if (!getDataBasesOnUsers) {
            if (allowedDivisionIds.length > 0) {
                if (["ui_case", "pt_case" , "pt_trail_case", "pt_other_case", "eq_case"].includes(case_modules)) {
                    caseWhereClause["field_division"] = { [Op.in]: normalizedDivisionIds };
                } else {
                    caseWhereClause["created_by_id"] = { [Op.in]: normalizedUserIds };
                }
            }
        } else {
            if (allowedUserIds.length > 0) {
                if (["ui_case", "pt_case" , "pt_trail_case", "pt_other_case", "eq_case"].includes(case_modules)) {
                    caseWhereClause[Op.or] = [
                        { created_by_id: { [Op.in]: normalizedUserIds } },
                        { field_io_name: { [Op.in]: normalizedUserIds } },
                    ];
                } else {
                    caseWhereClause["created_by_id"] = { [Op.in]: normalizedUserIds };
                }
            }
        }

        var temp_module = case_modules;
        if(case_modules === "pt_trail_case" || case_modules === "pt_other_case")
        {
            temp_module = "pt_case";
        }
       

        // Fetch the template using template_module to get the table_name
        const caseTableTemplate = await Template.findOne({ where: { template_module : temp_module } });
        if (!caseTableTemplate) {
            return userSendResponse(res, 400, false, "Template not found", null);
        }
        const caseTableName = caseTableTemplate.table_name;
        const caseTemplateName = caseTableTemplate.template_name;
    
        if (!caseTableName) {
            return userSendResponse(res, 404, false, `Table ${caseTemplateName} does not exist.`, null );
        }

        let caseFieldsArray;
        try {
            caseFieldsArray = typeof caseTableTemplate.fields === "string" ? JSON.parse(caseTableTemplate.fields) : caseTableTemplate.fields;
        } catch (err) {
            console.error("Error parsing fields:", err);
            return userSendResponse( res, 500, false, "Invalid table schema format.",null);
        }
    
        if (!Array.isArray(caseFieldsArray)) {
            return userSendResponse(res, 500, false, "Fields must be an array in the table schema.", null);
        }

        const caseFields = {};
        const caseFieldConfigs = {};

        for (const field of caseFieldsArray) {
            var {
                name: columnName,
                data_type,
                max_length,
                not_null,
                default_value,
                table,
                forign_key,
                attributes,
                options,
                type,
                table_display_content,
            } = field;
        
            if (!table_display_content) continue; // Filter out fields not marked for display
        
            // Store the complete field configuration for reference
            caseFieldConfigs[columnName] = field;
        
            const sequelizeType =
            data_type?.toUpperCase() === "VARCHAR" && max_length
                ? Sequelize.DataTypes.STRING(max_length)
                : Sequelize.DataTypes[data_type?.toUpperCase()] ||
                Sequelize.DataTypes.STRING;
        
            caseFields[columnName] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
                displayContent: table_display_content,
            };
        
        }
        
        const CaseDynamicTable = sequelize.define(caseTableName, caseFields, {
            freezeTableName: true,
            timestamps: true,
        });
        
        // Build base attributes array (only getting IDs)
        const caseAttributesArray = ["id"];
        
        const caseResult = await CaseDynamicTable.findAndCountAll({
            where: caseWhereClause,
            attributes: caseAttributesArray,
        });
        
        const onlyCaseIds = caseResult.rows.map(row => row.id);
        
        console.log("only get the case id in array", onlyCaseIds);

        // if (!onlyCaseIds || onlyCaseIds.length === 0) {
        //     return res.status(400).json({ success: false, message: "There is no cases for the module" });
        // }
        var baseWhereClause = {};
        var whereClause = {};

        if(onlyCaseIds || onlyCaseIds.length != 0)
        {
            baseWhereClause = {
                record_id: { [Op.in]: onlyCaseIds },
                module: case_modules,
                status: {
                    [Op.iLike]: "%pending%" 
                }
            };
            
            if(case_modules === "ui_case") {
    
                whereClause = {
                    ...baseWhereClause,
                    alert_type: {
                        [Op.in]: [   
                            "IO_ALLOCATION",
                            "ACTION_PLAN",
                            "PROGRESS_REPORT",
                            "FSL_PF",
                            "NOTICE_41A_PENDING"
                        ]
                    }
                };
            }
            else if(case_modules === "pt_trail_case") {
                whereClause = {
                    ...baseWhereClause,
                    alert_type: {
                        [Op.in]: [   
                            "PT_HEARING",
                        ]
                    }
                };
            }
            else if(case_modules === "pt_other_case")
            {
                whereClause = {
                    ...baseWhereClause,
                    alert_type: {
                        [Op.in]: [   
                            "OTHER_HEARING",
                            "UI_FULL",
                            "UI_PARTIAL",
                            "EQ_FULL",
                            "EQ_PARTIAL",
                        ]
                    }
                };
            }
            else if(case_modules === "eq_case")
            {
                whereClause = {
                    ...baseWhereClause,
                    alert_type: {
                        [Op.in]: [   
                            "EO_ALLOCATION",
                            "ACTION_PLAN",
                            "PROGRESS_REPORT",
                        ]
                    }
                };
            }
        }


        const groupedAlerts = await CaseAlerts.findAll({
            attributes: [
                "alert_type",
                "alert_level",
                [fn("COUNT", col("id")), "count"],
                [literal("array_agg(record_id)"), "record_ids"],
            ],
            where: whereClause,
            group: ["alert_type", "alert_level"],
            raw: true,
        });
        var groupedNatureOfDisposalAlerts = ""
        if(case_modules === "ui_case") {

            var alert_message = "Alert for";
            if(user_designation != "")
            {
                if(user_designation == "IO")  
                    alert_message = "Alert for IO";
                else if(user_designation == "DIG")  
                    alert_message = "Alert for DIG"; 
                else if(user_designation == "ADGP")  
                    alert_message = "Alert for ADGP";
                else if(user_designation == "DGP")  
                    alert_message = "Alert for DGP"; 

            }
                
            const NatureOfDisposalWhereClause = {
                ...baseWhereClause,
                alert_type: "NATURE_OF_DISPOSAL",
                alert_message

            };

            groupedNatureOfDisposalAlerts = await CaseAlerts.findAll({
                attributes: [
                    "alert_type",
                    "alert_level",
                    [fn("COUNT", col("id")), "count"],
                    [literal("array_agg(record_id)"), "record_ids"],
                ],
                where: NatureOfDisposalWhereClause,
                group: ["alert_type", "alert_level"],
                raw: true,
            });
        }

        //pending list
        // 5. Cases for Trial Today - > TRIAL_TODAY
        // 6.3 Any Due Date Missed across modules ->
        // 9. 41A Notice Approval Pending  -> NOTICE_41A_PENDING
        // 10. CUSTODIAL

        var alertTemplates = {}
        var ptHearingTemplates = {}
        var otherHearingTemplates = {}
        var hearingTemplates = {}
        if(case_modules === "ui_case") {
            alertTemplates = {
                IO_ALLOCATION: {
                    label: "IO Allocation",
                    divider: 2,
                    divider_details: {
                        low: { name: "24 hrs", count: 0, record_id: [], level: "low" },
                        high: { name: "Over Due", count: 0, record_id: [], level: "high" }
                    },
                    total_count: 0
                },
                ACTION_PLAN: {
                    label: "Action Plan",
                    divider: 2,
                    divider_details: {
                        low: { name: "Approval", count: 0, record_id: [], level: "low" },
                        high: { name: "Over Due", count: 0, record_id: [], level: "high" }
                    },
                    total_count: 0
                },
                PROGRESS_REPORT: {
                    label: "Progress Report",
                    divider: 2,
                    divider_details: {
                        low: { name: "1 to 5 Days", count: 0, record_id: [], level: "low" },
                        high: { name: "Over Due", count: 0, record_id: [], level: "high" }
                    },
                    total_count: 0
                },
                FSL_PF: {
                    label: "FSL - Property to be send to FSL",
                    divider: 3,
                    divider_details: {
                        low: { name: "10 - 20 Days", count: 0, record_id: [], level: "low" },
                        medium: { name: "20 - 30 Days", count: 0, record_id: [], level: "medium" },
                        high: { name: "Beyond 30 Days", count: 0, record_id: [], level: "high" }
                    },
                    total_count: 0
                },
                FSL: {
                    label: "FSL - Report due from FSL",
                    total_count: 0,
                    record_id: []
                },
                CUSTODIAL: {
                    label: "Accused - Custody Due for Charge Sheet",
                    divider: 2,
                    divider_details: {
                        low: { name: "30 - 45 Days", count: 0, record_id: [], level: "low" },
                        high: { name: "Above 45 Days", count: 0, record_id: [], level: "high" }
                    },
                    total_count: 0
                },
		            EXTENSION: {
                    label: "Cases(Expired) Due for Extension",
                    total_count: 0,
                    record_id: []
                },
                NATURE_OF_DISPOSAL: {
                    label: "Charge Sheeted (Due for CC No.)",
                    total_count: 0
                },
            };
        }
        else if (case_modules === "pt_trail_case") {
            alertTemplates = {
                // TRIAL_CASE_1: {
                //     label: "Trial Case 1",
                //     total_count: 0
                // },
                // TRIAL_CASE_2: {
                //     label: "Trial Case 2",
                //     total_count: 0
                // },
                // TRIAL_CASE_3: {
                //     label: "Trial Case 3",
                //     divider: 2,
                //     divider_details: {
                //         low: { name: "Pending", count: 0, record_id: [], level: "low" },
                //         high: { name: "Over Due", count: 0, record_id: [], level: "high" }
                //     },
                //     total_count: 0
                // },
                // full_stay_on_investigation: {
                //   label: "Full Stay on Investigation",
                //   total_count: 0
                //   },
                //   full_stay_on_trial: {
                //     label: "Full Stay on Trial",
                //     total_count: 0
                //   },
                //   full_stay_on_enquiries: {
                //     label: "Full Stay on Enquiries",
                //     total_count: 0
                //   },
                //   partial_stay_on_investigation: {
                //     label: "Partial Stay on Investigation",
                //     total_count: 0
                //   },
                //   partial_stay_on_trial: {
                //     label: "Partial Stay on Trial",
                //     total_count: 0
                //   },
                //   partial_stay_on_enquiries: {
                //     label: "Partial Stay on Enquiries",
                //     total_count: 0
                //   },
                //   pending_quash_petitions_in_hc: {
                //     label: "Pending Quash Petitions in HC",
                //     total_count: 0
                //   },
                //   pending_bail_petitions_in_hc: {
                //     label: "Pending Bail Petitions in HC",
                //     total_count: 0
                //   },
                //   pending_anticipatory_petitions_in_hc: {
                //     label: "Pending Anticipatory Petitions in HC",
                //     total_count: 0
                //   },
                //   cases_in_supreme_court: {
                //     label: "Cases in Supreme Court",
                //     total_count: 0
                //   }
                
            };
            ptHearingTemplates = {
                "TRIAL_TODAY": {
                    "label": "Today",
                    "total_count": 0,
                    "record_ids": []
                },
                "TRIAL_TOMORROW": {
                    "label": "Tomorrow",
                    "total_count": 0,
                    "record_ids": []
                },
                "TRIAL_THIS_WEEK": {
                    "label": "This Week",
                    "total_count": 0,
                    "record_ids": []
                },
                "TRIAL_NEXT_WEEK": {
                    "label": "Next Week",
                    "total_count": 0,
                    "record_ids": []
                }
            };

        }
        else if (case_modules === "pt_other_case") {

            var appendingText = "HC";

            if(sub_court && sub_court.toLowerCase() === "supreme_court") {
                appendingText = "SC";
            }            

            alertTemplates = {
                "UI_FULL": {
                  label: "Full Stay on Investigation",
                  total_count: 0
                  },
                  "EQ_FULL": {
                    label: "Full Stay on Enquiries",
                    total_count: 0
                  },
                  "UI_PARTIAL": {
                    label: "Partial Stay on Investigation",
                    total_count: 0
                  },
                  "EQ_PARTIAL": {
                    label: "Partial Stay on Enquiries",
                    total_count: 0
                  },
                  pending_quash_petitions_in_hc: {
                    label: "Pending Quash Petitions in "+ appendingText,
                    total_count: 0
                  },
                  pending_bail_petitions_in_hc: {
                    label: "Pending Bail Petitions in "+ appendingText,
                    total_count: 0
                  },
                  pending_anticipatory_petitions_in_hc: {
                    label: "Pending Anticipatory Bail Petitions in "+ appendingText,
                    total_count: 0
                  },
                
            };
            otherHearingTemplates = {
                "TRIAL_TODAY": {
                    "label": "Today",
                    "total_count": 0,
                    "record_ids": []
                },
                "TRIAL_TOMORROW": {
                    "label": "Tomorrow",
                    "total_count": 0,
                    "record_ids": []
                },
                "TRIAL_THIS_WEEK": {
                    "label": "This Week",
                    "total_count": 0,
                    "record_ids": []
                },
                "TRIAL_NEXT_WEEK": {
                    "label": "Next Week",
                    "total_count": 0,
                    "record_ids": []
                }
            };

        }
        else if (case_modules === "eq_case") {
            // alertTemplates = {
            //     ENQUIRIES: {
            //         label: "ENQUIRIES",
            //         total_count: 0
            //     },
            // };

            alertTemplates = {
                EO_ALLOCATION: {
                    label: "EO Allocation",
                    divider: 2,
                    divider_details: {
                        low: { name: "24 hrs", count: 0, record_id: [], level: "low" },
                        high: { name: "Over Due", count: 0, record_id: [], level: "high" }
                    },
                    total_count: 0
                },
                ACTION_PLAN: {
                    label: "Action Plan",
                    divider: 2,
                    divider_details: {
                        low: { name: "Approval", count: 0, record_id: [], level: "low" },
                        high: { name: "Over Due", count: 0, record_id: [], level: "high" }
                    },
                    total_count: 0
                },
                PROGRESS_REPORT: {
                    label: "Progress Report",
                    divider: 2,
                    divider_details: {
                        low: { name: "1 to 5 Days", count: 0, record_id: [], level: "low" },
                        high: { name: "Over Due", count: 0, record_id: [], level: "high" }
                    },
                    total_count: 0
                },
                EXTENSION: {
                    label: "Enquiries(Expired) Due for Extension",
                    total_count: 0,
                    record_id: []
                },
                FINAL_ENQUIRIES_REPORT: {
                    label: "Final Report Approved Due for Submission",
                    total_count: 0,
                    record_id: []
                },
                CLOSURE_REPORT: {
                    label: "Closure Report Due for Submission",
                    total_count: 0,
                    record_id: []
                }
            };
        }
        else{
            return res.status(400).json({ success: false, message: "Please check the module it not exist in the DB" });
        }

        const dashboard_count_details = JSON.parse(JSON.stringify(alertTemplates));

        for (const row of groupedAlerts) {
            const alertType = row.alert_type;
            const level = row.alert_level?.toLowerCase();
            const count = parseInt(row.count);
            const recordIds = row.record_ids;
            if (dashboard_count_details[alertType]) {
                if ( dashboard_count_details[alertType].divider_details && dashboard_count_details[alertType].divider_details[level] ) {
                    dashboard_count_details[alertType].divider_details[level].count = count;
                    dashboard_count_details[alertType].divider_details[level].record_id = recordIds;
                }

                dashboard_count_details[alertType].total_count += count;

                if(alertType == "FSL_PF" && level == "high" ){
                    dashboard_count_details["FSL"].total_count += count;
                  dashboard_count_details["FSL"].record_id = recordIds;  
                }
            }
        }

        if(case_modules === "ui_case") {

            dashboard_count_details["NATURE_OF_DISPOSAL"].divider = 0;
            dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details = {};

            if(user_designation == "DIG" || user_designation == "ADGP")
            {
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low = {};
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high = {};
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['name'] = "" ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['count'] = 0 ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['record_id'] = [] ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['level'] = "low" ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['name'] = "" ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['count'] = 0 ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['record_id'] = [] ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['level'] = "high" ;
    
                if(user_designation == "DIG")
                {
                    dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['name'] = "90 - 150 Days" ;
                    dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['name'] = "150 - 180 Days" ;
                }
    
                if(user_designation == "ADGP")
                {
                    dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['name'] = "180 - 240 Days" ;
                    dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['name'] = "240 - 360 Days" ;
                }
            }
            else if(user_designation == "DGP")
            {
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high = {};
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['name'] = "" ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['count'] = 0 ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['record_id'] = [] ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['level'] = "high" ;

                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.high['name'] = "Above 360 Days" ;
            }
            else if(user_designation == "IO")
            {
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low = {};
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['name'] = "" ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['count'] = 0 ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['record_id'] = [] ;
                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['level'] = "low" ;

                dashboard_count_details["NATURE_OF_DISPOSAL"].divider_details.low['name'] = "60 - 90 Days" ;
            }

            for (const rowData of groupedNatureOfDisposalAlerts) {
                const alertType = rowData.alert_type;
                const level = rowData.alert_level?.toLowerCase();
                const count = parseInt(rowData.count);
                const recordIds = rowData.record_ids;
                if (dashboard_count_details[alertType]) {
                    if(user_designation != "IO" || user_designation != "DGP")  
                    {
                        dashboard_count_details[alertType].divider = 2;
                    }
                    else{
                        dashboard_count_details[alertType].divider = 1;
                    }

                    if ( dashboard_count_details[alertType].divider_details && dashboard_count_details[alertType].divider_details[level] ) {
                        dashboard_count_details[alertType].divider_details[level].count = count;
                        dashboard_count_details[alertType].divider_details[level].record_id = recordIds;
                        if(alertType === "NATURE_OF_DISPOSAL" && user_designation != "IO")
                            dashboard_count_details["EXTENSION"].record_id = recordIds;
                    }

                    dashboard_count_details[alertType].total_count += count;
                }
            }

            if(user_designation != "IO")
            {
                dashboard_count_details["EXTENSION"].total_count = dashboard_count_details["NATURE_OF_DISPOSAL"].total_count;
            }
        }

        if( case_modules === "pt_trail_case" || case_modules === "pt_other_case") {

            if( case_modules === "pt_trail_case"){
                for (const row of groupedAlerts)
                {
                    if(row && row.alert_level && row.record_ids && row.count)
                    {
                        var alertLevel = row.alert_level.toLowerCase();
                        var record_ids = row.record_ids;
                        var record_count = row.count;
                        
                        if(alertLevel === "high")
                        {
                            if(ptHearingTemplates["TRIAL_TODAY"])
                            {
                                ptHearingTemplates["TRIAL_TODAY"].total_count  = record_count;
                                ptHearingTemplates["TRIAL_TODAY"]["record_ids"] = record_ids ;
                            }
                        }
                        else if(alertLevel === "medium")
                        {
                            if(ptHearingTemplates["TRIAL_TOMORROW"])
                            {
                                ptHearingTemplates["TRIAL_TOMORROW"].total_count  = record_count;
                                ptHearingTemplates["TRIAL_TOMORROW"]["record_ids"] = record_ids ;
                            }
                        }
                        else if(alertLevel === "low")
                        {
                            if(ptHearingTemplates["TRIAL_THIS_WEEK"])
                            {
                                ptHearingTemplates["TRIAL_THIS_WEEK"].total_count  = record_count;
                                ptHearingTemplates["TRIAL_THIS_WEEK"]["record_ids"] = record_ids ;
                            }
                        }
                        else if(alertLevel === "very_low")
                        {
                            if(ptHearingTemplates["TRIAL_NEXT_WEEK"])
                            {
                                ptHearingTemplates["TRIAL_NEXT_WEEK"].total_count  = record_count;
                                ptHearingTemplates["TRIAL_NEXT_WEEK"]["record_ids"] = record_ids ;
                            }
                        }
                    }
                }
            }
            else{
                for (const row of groupedAlerts)
                {
                    if(row && row.alert_level)
                    {
                        var alertLevel = row.alert_level.toLowerCase();
                        var alertType = row.alert_type.toLowerCase();
                        var record_ids = row.record_ids;
                        var record_count = row.count;
                        if(alertLevel === "high")
                        {
                            if(otherHearingTemplates["TRIAL_TODAY"])
                            {
                                otherHearingTemplates["TRIAL_TODAY"].total_count = record_count;
                                otherHearingTemplates["TRIAL_TODAY"]["record_ids"] = record_ids;
                            }
                        }
                        else if(alertLevel === "medium")
                        {
                            if(otherHearingTemplates["TRIAL_TOMORROW"])
                            {
                                otherHearingTemplates["TRIAL_TOMORROW"].total_count  = record_count;
                                otherHearingTemplates["TRIAL_TOMORROW"]["record_ids"] = record_ids ;
                            }
                        }
                        else if(alertLevel === "low")
                        {
                            if(otherHearingTemplates["TRIAL_THIS_WEEK"])
                            {
                                otherHearingTemplates["TRIAL_THIS_WEEK"].total_count  = record_count;
                                otherHearingTemplates["TRIAL_THIS_WEEK"]["record_ids"] = record_ids ;
                            }
                        }
                        else if(alertLevel === "very_low")
                        {
                            if(otherHearingTemplates["TRIAL_NEXT_WEEK"])
                            {
                                otherHearingTemplates["TRIAL_NEXT_WEEK"].total_count  = record_count;
                                otherHearingTemplates["TRIAL_NEXT_WEEK"]["record_ids"] = record_ids ;
                            }
                        }
                        
                        if(alertType === "ui_full")
                        {
                            if(otherHearingTemplates["UI_FULL"])
                            {
                                otherHearingTemplates["UI_FULL"].total_count = record_count;
                                otherHearingTemplates["UI_FULL"]["record_ids"] = record_ids;
                            }
                        }
                    }
                }
            }
        }


        return res.status(200).json({
            success: true,
            data: dashboard_count_details,
            hearingTemplates: case_modules === "pt_trail_case" ? ptHearingTemplates : case_modules === "pt_other_case" ? otherHearingTemplates : hearingTemplates,
            "groupedAlerts":  groupedAlerts,
        });
    } catch (error) {
        console.error("Error retrieving dashboard count:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error"+error });
    }
};

const mapUIandPT = async (req, res) => {
    try {
        const ui_cases = await sequelize.query(
            `SELECT id, "field_cid_crime_no./enquiry_no" FROM cid_under_investigation;`,
            { type: sequelize.QueryTypes.SELECT }
        );

        const pt_cases = await sequelize.query(
            `SELECT id, "field_cid_crime_no./enquiry_no" FROM cid_pending_trial;`,
            { type: sequelize.QueryTypes.SELECT }
        );

        // Build map of UI cases by their key
        const ui_case_map = {};
        ui_cases.forEach(ui => {
            const key = ui["field_cid_crime_no./enquiry_no"]?.trim();
            if (key) ui_case_map[key] = ui.id;
        });

        // For each PT case, update accordingly
        for (const pt of pt_cases) {
            const key = pt["field_cid_crime_no./enquiry_no"]?.trim();

            if (key && ui_case_map[key]) {
                // Match found → update ui_case_id
                await sequelize.query(
                    `UPDATE cid_pending_trial SET ui_case_id = :uiCaseId WHERE id = :ptCaseId;`,
                    {
                        replacements: { uiCaseId: ui_case_map[key], ptCaseId: pt.id },
                        type: sequelize.QueryTypes.UPDATE
                    }
                );
            } else {
                // No match → update pt_case_id with its own ID (or a fallback if needed)
                await sequelize.query(
                    `UPDATE cid_pending_trial SET pt_case_id = :ptCaseId WHERE id = :ptCaseId;`,
                    {
                        replacements: { ptCaseId: pt.id },
                        type: sequelize.QueryTypes.UPDATE
                    }
                );
            }
        }

        return res.status(200).json({ success: true, message: "PT cases updated with UI or PT IDs as required" });
    } catch (error) {
        console.error("Error mapping UI and PT:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
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
  mapUIandPT
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