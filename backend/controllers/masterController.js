const { Role , UsersDepartment, UsersDivision, UserDesignation, Users, AuthSecure , UsersHierarchy , Designation , Department , Division , KGID} = require('../models');
const { Op } = require('sequelize');

const get_master_data = async (req, res) => {
  try {
    const { needed_masters } = req.body; // Extract needed_masters from the request body

    // Validate needed_masters
    if (!Array.isArray(needed_masters) || needed_masters.length === 0) {
      return res.status(400).json({ error: 'Invalid needed_masters array' });
    }

    // Fetch the master data based on needed_masters
    // Example: You can use a switch case or if-else to handle different masters
    const master_data = {};
    for (const master of needed_masters) {
      switch (master) {
        case 'role':
          // Fetch role data
          master_data.role = await fetch_role_data();
          break;
        case 'designation':
          // Fetch designation data
          master_data.designation = await fetch_designation_data();
          const supervisor_designation_data = await UsersHierarchy.findAll({
            attributes: ['supervisor_designation_id', 'officer_designation_id'],
          });
          master_data.supervisor_designation = supervisor_designation_data.reduce((acc, { supervisor_designation_id, officer_designation_id }) => {
          if (!acc[supervisor_designation_id]) {
              acc[supervisor_designation_id] = [];
          }
          acc[supervisor_designation_id].push(officer_designation_id);
          return acc;
      }, {});
          break;
        case 'department':
          // Fetch department data
          master_data.department = await fetch_department_data();
          break;
        case 'division':
          // Fetch division data
          master_data.division = await fetch_division_data();
          break;
        case 'kgid':
          // Fetch kgid data
          master_data.kgid = await KGID.findAll({
            attributes: [
              ['id', 'code'], 
              ['kgid', 'kgid'],
              ['name', 'name'], 
              ['mobile', 'mobile'],
            ],
          });
          break;
        default:
          return res.status(400).json({ error: `Unknown master: ${master}` });
      }
    }

    res.json(master_data);
  } catch (error) {
    console.error('Error fetching master data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const fetch_role_data = async () => {
  const excluded_role_ids = [1, 10 ,21]; 

  try {
    const roles = await Role.findAll({
       attributes: [
        ['role_id', 'code'], // Alias role_id as code
        ['role_title', 'name'], // Alias role_title as name
      ],
      where: {
        role_id: {
          [Op.notIn]: excluded_role_ids
        }
      }
    });
    return roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw new Error('Failed to fetch roles');
  }
};

const fetch_designation_data = async () => {
  const excluded_designation_ids = [1, 10 ,21]; 
  try {
    const designations = await Designation.findAll({
      attributes: [
        ['designation_id', 'code'], // Alias designation_id as code
        ['designation_name', 'name'], // Alias designation_name as name
      ],
      where: {
        designation_id: {
          [Op.notIn]: excluded_designation_ids
        }
      }
    });
    return designations;
  } catch (error) {
    console.error('Error fetching designations:', error);
    throw new Error('Failed to fetch designations');
  }
};

const fetch_department_data = async () => {
  try {
    const departments = await Department.findAll({
      attributes: [
        ['department_id', 'code'], // Alias department_id as code
        ['department_name', 'name'], // Alias department_name as name
      ]
    });
    return departments;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw new Error('Failed to fetch departments');
  }
};

const fetch_division_data = async () => {
  try {
    const divisions = await Division.findAll({
      attributes: [
        ['division_id', 'code'], // Alias division_id as code
        ['division_name', 'name'], // Alias division_name as name
        'department_id', // Alias department_id as name
      ]
    });
    return divisions;
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw new Error('Failed to fetch divisions');
  }
};

module.exports = {
  get_master_data,
  fetch_role_data,
  fetch_designation_data,
  fetch_department_data,
  fetch_division_data
};
