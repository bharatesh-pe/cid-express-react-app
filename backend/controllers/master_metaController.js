const { Role , Designation , Department , Division } = require('../models');
const { Op } = require('sequelize');


exports.fetch_masters_meta  = async (req, res) => {
  try {

    const excluded_masters_ids = [];

    // Fetch the master meta data 
    const master_meta_data = {};

    const roles = await Role.findAll({
      where: {
        role_id: {
          [Op.notIn]: excluded_role_ids
        }
      }
    });

    res.json(master_meta_data);
  } catch (error) {
    console.error('Error fetching master data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};