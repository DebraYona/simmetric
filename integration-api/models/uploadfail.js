module.exports = (sequelize, type) => {
  const UploadFail = sequelize.define(
    'UploadFail',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      identifier: type.STRING,
    },
    {
      tableName: 'UploadFail',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  return UploadFail;
};
