module.exports = (sequelize, DataTypes) => {
    const Team = sequelize.define('Team', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      visibility: { type: DataTypes.ENUM('private', 'public'), defaultValue: 'private' }
    }, {
      tableName: 'teams',
      timestamps: true
    });
    return Team;
  };
  