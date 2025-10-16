const Application = require('../models/Application');

class ApplicationController {
  // Get all active applications
  async getApplications(req, res) {
    try {
      const applications = await Application.getActiveApplications();
      
      res.json({
        success: true,
        data: applications.map(app => app.getPublicInfo())
      });
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get analytics applications only
  async getAnalyticsApplications(req, res) {
    try {
      const applications = await Application.getAnalyticsApplications();
      
      res.json({
        success: true,
        data: applications.map(app => app.getPublicInfo())
      });
    } catch (error) {
      console.error('Get analytics applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get application by ID
  async getApplication(req, res) {
    try {
      const application = await Application.findByPk(req.params.id);
      
      if (!application || !application.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.json({
        success: true,
        application: application.getPublicInfo()
      });
    } catch (error) {
      console.error('Get application error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new application (admin only)
  async createApplication(req, res) {
    try {
      const { code, link, image, description, order, is_analytics } = req.body;

      // Check if application with same code already exists
      const existingApp = await Application.findOne({ where: { code } });
      if (existingApp) {
        return res.status(400).json({
          success: false,
          message: 'Application with this code already exists'
        });
      }

      const application = await Application.create({
        code,
        link,
        image,
        description,
        order: order || 0,
        is_analytics: is_analytics || false
      });

      res.status(201).json({
        success: true,
        message: 'Application created successfully',
        application: application.getPublicInfo()
      });

    } catch (error) {
      console.error('Create application error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update application (admin only)
  async updateApplication(req, res) {
    try {
      const application = await Application.findByPk(req.params.id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      const { code, link, image, description, order, isActive, is_analytics } = req.body;

      // Check if code is being changed and if it conflicts
      if (code && code !== application.code) {
        const existingApp = await Application.findOne({ where: { code } });
        if (existingApp) {
          return res.status(400).json({
            success: false,
            message: 'Application with this code already exists'
          });
        }
      }

      // Update fields
      const updateData = {};
      if (code !== undefined) updateData.code = code;
      if (link !== undefined) updateData.link = link;
      if (image !== undefined) updateData.image = image;
      if (description !== undefined) updateData.description = description;
      if (order !== undefined) updateData.order = order;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (is_analytics !== undefined) updateData.is_analytics = is_analytics;

      await application.update(updateData);

      res.json({
        success: true,
        message: 'Application updated successfully',
        application: application.getPublicInfo()
      });

    } catch (error) {
      console.error('Update application error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete application (soft delete - admin only)
  async deleteApplication(req, res) {
    try {
      const application = await Application.findByPk(req.params.id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Soft delete by setting isActive to false
      await application.update({ isActive: false });

      res.json({
        success: true,
        message: 'Application deleted successfully'
      });

    } catch (error) {
      console.error('Delete application error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new ApplicationController();
