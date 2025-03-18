const { MastersMeta , Role , Designation , Department , Division } = require('../models');
const { Op } = require('sequelize');


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
    console.error('Error fetching master data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.fetch_specific_master_data = async (req, res) => {
    try{
        
    }
    catch (error){
        console.log('Error fetching specific master data:', error)
        res.status(500).json({ error: 'Internal server error' });
    }
}