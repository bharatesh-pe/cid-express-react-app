const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Circular , Judgement , GovernmentOrder } = require('../models');
const { check } = require('express-validator');

exports.create_repository = async (req, res) => {
  try {
    const { tableName, documents, ...data } = req.body;
    let Model;

    switch (tableName) {
      case 'circulars':
        Model = Circular;
        break;
      case 'judgements':
        Model = Judgement;
        break;
      case 'government_orders':
        Model = GovernmentOrder;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid tableName' });
    }

    const tempPath = "../backend/"+documents;
    const targetPath = path.join(__dirname, '../uploads/repositorys/original', path.basename(documents));

    //check if the temp file exists
    if (!fs.existsSync(tempPath)) {
        return res.status(500).json({ success: false, message: 'Temp File not found' });
    }

    fs.rename(tempPath, targetPath, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'File move failed', error: err.message });
      }
    });

    data.documents = targetPath;

    const newRecord = await Model.create(data);

    return res.status(201).json({
      success: true,
      message: `Record created successfully in ${tableName}.`,
      data: newRecord
    });
  } catch (error) {
    console.error("Error in createRepository:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.approve_repository = async (req, res) => {
    try {
        const { tableName, repository_id } = req.body;
        let Model;

        switch (tableName) {
            case 'circulars':
                Model = Circular;
                break;
            case 'judgements':
                Model = Judgement;
                break;
            case 'government_orders':
                Model = GovernmentOrder;
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid tableName' });
        }

        const record = await Model.findByPk(repository_id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found.' });
        }

        await record.update({ status: 'approved' , dev_status: 'active' });

        return res.status(200).json({
            success: true,
            message: `Record approved successfully in ${tableName}.`
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.get_repositories = async (req, res) => {
  try {
    const { tableName } = req.body;
    let Model;

    switch (tableName) {
      case 'circulars':
        Model = Circular;
        break;
      case 'judgements':
        Model = Judgement;
        break;
      case 'government_orders':
        Model = GovernmentOrder;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid tableName' });
    }

    const records = await Model.findAll({
        where: {
            [Op.and]: [
                { status: 'approved' },
                { dev_status: 'active' }
            ]
        }
    });

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.update_repository = async (req, res) => {
  try {
    const { tableName, repository_id, documents, ...data } = req.body;
    let Model;

    switch (tableName) {
      case 'circulars':
        Model = Circular;
        break;
      case 'judgements':
        Model = Judgement;
        break;
      case 'government_orders':
        Model = GovernmentOrder;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid tableName' });
    }

    const record = await Model.findByPk(repository_id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    if (documents) {
      const tempPath = "../backend/"+documents;
      const targetPath = path.join(__dirname, '../uploads/repositorys/original', path.basename(documents));

      //check if the temp file exists
      if (!fs.existsSync(tempPath)) {
           return res.status(500).json({ success: false, message: 'Temp File not found' });
      }

      fs.rename(tempPath, targetPath, (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'File move failed', error: err.message });
        }
      });

      data.documents = targetPath;
    }

    await record.update(data);

    return res.status(200).json({
      success: true,
      message: `Record updated successfully in ${tableName}.`,
      data: record
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete_repository = async (req, res) => {
  try {
    const { tableName, repository_id } = req.body;
    let Model;

    switch (tableName) {
      case 'circulars':
        Model = Circular;
        break;
      case 'judgements':
        Model = Judgement;
        break;
      case 'government_orders':
        Model = GovernmentOrder;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid tableName' });
    }

    const record = await Model.findByPk(repository_id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30);
    await record.update({ status: 'rejected', dev_status: 'inactive', bin_last_date: expires_at });

    return res.status(200).json({
      success: true,
      message: `Record moved to bin and status updated successfully in ${tableName}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};