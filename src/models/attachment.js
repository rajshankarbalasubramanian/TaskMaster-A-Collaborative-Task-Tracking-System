module.exports = (sequelize, DataTypes) => {
    const Attachment = sequelize.define('Attachment', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      filename: { type: DataTypes.STRING, allowNull: false },
      url: { type: DataTypes.STRING, allowNull: false },
      mimeType: { type: DataTypes.STRING, allowNull: true },
      size: { type: DataTypes.INTEGER, allowNull: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      taskId: { type: DataTypes.UUID, allowNull: false }
    }, {
      tableName: 'attachments',
      timestamps: true
    });
    return Attachment;
  };
  