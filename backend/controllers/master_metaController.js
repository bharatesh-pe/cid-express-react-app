const { MastersMeta , Role , Designation , Department, KGID , Division , ApprovalItem } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

exports.fetch_masters_meta  = async (req, res) => {
  try {

    const excluded_masters_ids = [];

    const master = await MastersMeta.findAll({
      where: {
        masters_meta_id: {
          [Op.notIn]: excluded_masters_ids
        }
      }
    });
    return res.status(200).json({ success: true, master});
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.fetch_specific_master_data = async (req, res) => {
  const { master_name } = req.body;

  try {
        let data;

        switch (master_name) {
            case 'department':
                data = await Department.findAll();
                break;

            case 'designation':
                data = await Designation.findAll({
                    attributes: [
                        "designation_id",
                        "designation_name",
                        "description",
                        "created_by",
                        "created_at"
                    ]
                });
                break;
                
            case 'division':
                data = await Division.findAll();
                const departmentIds = data.map(division => division.department_id);
                const departments = await Department.findAll({
                    where: {
                        department_id: departmentIds
                    }
                });
                const departmentMap = {};
                departments.forEach(department => {
                    departmentMap[department.department_id] = department.department_name;
                });

                const formattedDivisions = data.map(division => ({
                    ...division.dataValues,
                    department_name: departmentMap[division.department_id] || 'Unknown Department'
                }));

                return res.status(200).json({ divisions: formattedDivisions });
            case 'approval_item':
                data = await ApprovalItem.findAll();
                break;
            case 'kgid':
                data = await KGID.findAll();
                break;

            default:
                return res.status(400).json({ message: 'Invalid master name provided.' });
        }

        return res.status(200).json(data);
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.create_master_data = async (req, res) => {
  const { master_name, data } = req.body;

    // Get the role id from the request (assuming it's in the request body)
    const { user_id } = req.user;

    data.created_by = user_id;

  try {
      let newEntry;

      switch (master_name) {
            case 'department':
              newEntry = await Department.create(data);
              break;

            case 'designation':
                newEntry = await Designation.create({
                    designation_name: data.designation_name,
                    description: data.description,
                    created_by: data.created_by,
                    created_at: new Date()
                }, {
                    returning: ['designation_id', 'designation_name', 'description', 'created_by', 'created_at']
                });
                break;
            
            case 'division':
                newEntry = await Division.create({
                    division_name: data.division_name,
                    description: data.description,
                    department_id: data.department_id,
                    created_by: data.created_by,
                    created_at: new Date()
                });
                break;
            case 'Approval item':
              newEntry = await ApprovalItem.create(data);
              break;

            case 'kgid':
              newEntry = await KGID.create({
                    kgid: data.kgid,
                    name: data.name,
                    mobile: data.mobile,
                    start_date: new Date(),
                    end_date: data.end_date || null,  // Ensure end_date is explicitly set
                    created_by: data.created_by,
                });
              break;

          default:
              return res.status(400).json({ message: 'Invalid master name provided.' });
      }

      return res.status(201).json({ success: true, message: `${master_name} created successfully`, data: newEntry });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.update_master_data = async (req, res) => {
  const { master_name, data } = req.body;

  const { user_id } = req.user;
  data.updated_by = user_id;

  try {
      let result;
      let whereCondition = {};

      switch (master_name) {
            case 'department':
                if (!data.department_id) {
                    return res.status(400).json({ message: "Department ID is required for update." });
                }
                whereCondition = { department_id: data.department_id };
                result = await Department.update(data, { where: whereCondition });
                break;

            case 'designation':
                if (!data.designation_id) {
                    return res.status(400).json({ message: "Designation ID is required for update." });
                }
                whereCondition = { designation_id: data.designation_id };
                result = await Designation.update({
                    designation_name: data.designation_name,
                    description: data.description,
                    updated_by: data.updated_by
                }, { where: whereCondition });
                break;

            case 'division':
                if (!data.division_id) {
                    return res.status(400).json({ message: "Division ID is required for update." });
                }
                whereCondition = { division_id: data.division_id };
                result = await Division.update({
                    division_name: data.division_name,
                    department_id: data.department_id,
                    updated_by: data.updated_by
                }, { where: whereCondition });
                break;
            case 'approval_item':
                if (!data.approval_item_id) {
                    return res.status(400).json({ message: "Item ID is required for update." });
                }
                whereCondition = { approval_item_id: data.approval_item_id };
                result = await ApprovalItem.update(data, { where: whereCondition });
                break;
            case 'kgid':
                if (!data.kgid) {
                    return res.status(400).json({ message: "KGID is required for update." });
                }
                whereCondition = { kgid: data.kgid };
                result = await KGID.update({
                    name: data.name,
                    mobile: data.mobile,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    updated_by: data.updated_by
                }, { where: whereCondition });
                break;

          default:
              return res.status(400).json({ message: 'Invalid master name provided.' });
      }

      return res.status(200).json({
          success: true,
          message: `${master_name} updated successfully`,
          data: result
      });

  } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.delete_master_data = async (req, res) => {
  const { master_name, id } = req.body;

  try {
      let result;
      let whereCondition = {};

      switch (master_name) {
          case 'department':
              if (!id) {
                  return res.status(400).json({ message: "Department ID is required for deletion." });
              }
              whereCondition = { department_id: id };
              result = await Department.destroy({ where: whereCondition });
              break;

          case 'designation':
              if (!id) {
                  return res.status(400).json({ message: "Designation ID is required for deletion." });
              }
              whereCondition = { designation_id: id };
              result = await Designation.destroy({ where: whereCondition });
              break;

          case 'division':
              if (!id) {
                  return res.status(400).json({ message: "Division ID is required for deletion." });
              }
              whereCondition = { division_id: id };
              result = await Division.destroy({ where: whereCondition });
              break;
            case 'kgid':
                if (!id) {
                    return res.status(400).json({ message: "KGID is required for deletion." });
                }
                whereCondition = { id: id };
                result = await KGID.destroy({ where: whereCondition });
                break;
          default:
              return res.status(400).json({ message: 'Invalid master name provided.' });
      }

      if (result === 0) {
          return res.status(404).json({ message: `${master_name} not found or already deleted.` });
      }

      return res.status(200).json({
          success: true,
          message: `${master_name} deleted successfully`
      });

  } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
  }
};
