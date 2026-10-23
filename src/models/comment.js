module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      content: { type: DataTypes.TEXT, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      taskId: { type: DataTypes.UUID, allowNull: false }
    }, {
      tableName: 'comments',
      timestamps: true
    });
    return Comment;
  };
  