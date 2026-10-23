module.exports = (sequelize, DataTypes) => {
    const TeamMember = sequelize.define('TeamMember', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      role: { type: DataTypes.ENUM('member', 'admin'), defaultValue: 'member' }
    }, {
      tableName: 'team_members',
      timestamps: true
    });
    return TeamMember;
  };
  