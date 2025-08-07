'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('role', {
      role_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      role_title: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      role_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      dashboard: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      user_mgnt: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      masters_meta: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      template_masters: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      action_template: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      ui_case: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      pt_case: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      trial_case: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      quick_report: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      create_case: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_case: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_case: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_case: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      add_accused: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_accused: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_accused: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_accused: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      progress_report_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      add_progress_report: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_progress_report: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_progress_report: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_progress_report: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      fsl_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      add_fsl: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_fsl: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_fsl: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_fsl: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      transfer_to_other_division: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      change_of_io: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      prosecution_sanction: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      act_17a_pc: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      add_attachment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_attachment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_attachment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      download_attachment: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_remark: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      add_remark: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_remark: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      petitions_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      add_petitions: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_petitions: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_petitions: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_petitions: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      merge: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      demerge: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      case_details_download: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      cases_download: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      case_details_print: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      action_edit: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      action_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      cases_print: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      create_pt: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_pt: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_pt_case: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_witnesses: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      add_witnesses: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_witnesses: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      trial_monitoring: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      further_investigation: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      prosecutors_updates: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      status_update: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      preliminary_charge_sheet_173_8: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      create_enquiry: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_enquiry: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_enquiry: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      create_new_circular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      approval: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_circular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_circular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_circular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_pt: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_enquiry: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      create_new_judgement: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_judgement: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_judgement: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_judgement: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      create_new_government_order: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      view_government_order: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edit_government_order: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_government_order: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      template: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      create_role: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      role: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      logs: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      case: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      enquiry: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      gn_order: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      judgements: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      circular: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      settings: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    }, {
      schema: 'public'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('role', { schema: 'public' });
  }
};
