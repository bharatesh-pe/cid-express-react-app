'use strict';

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    role_title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dashboard: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    user_mgnt: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    masters_meta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    template_masters: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    ui_case: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    pt_case: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    trial_case: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    quick_report: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    create_case: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_case: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_case: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_case: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    add_accused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_accused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_accused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_accused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    progress_report_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    add_progress_report: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_progress_report: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_progress_report: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_progress_report: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    fsl_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    add_fsl: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_fsl: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_fsl: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_fsl: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    transfer_to_other_division: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    change_of_io: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    prosecution_sanction: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    act_17a_pc: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    add_attachment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_attachment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_attachment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    download_attachment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_remark: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    add_remark: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_remark: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    petitions_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    add_petitions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_petitions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_petitions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_petitions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    merge: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    demerge: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    case_details_download: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    cases_download: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    case_details_print: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    cases_print: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    create_pt: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_pt: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_pt_case: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_witnesses: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    add_witnesses: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_witnesses: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    trial_monitoring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    further_investigation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    prosecutors_updates: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status_update: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    preliminary_charge_sheet_173_8: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    create_enquiry: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_enquiry: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_enquiry: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    create_new_circular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    approval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_circular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_circular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_circular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    create_new_judgement: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_judgement: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_judgement: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_judgement: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    create_new_government_order: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    view_government_order: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edit_government_order: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_government_order: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    template: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    create_role: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    role: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    logs: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    case: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    enquiry: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    gn_order: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    judgements: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    circular: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    action_template: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'role',
    timestamps: false,
    underscored: true,
    schema: 'public'
  });
  
  Role.associate = (models) => {
    Role.hasMany(models.Users, {
      foreignKey: 'role_id',
      as: 'users'
    });
  };
  return Role;
};