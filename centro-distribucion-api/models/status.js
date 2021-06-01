module.exports = (sequelize, type) => {
  const Status = sequelize.define(
    'Status',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      service_order_id: type.STRING,
      job_id: type.INTEGER,
      order_id: type.INTEGER,
      status: type.STRING,
      message: type.STRING,
      data: type.STRING,
    },
    {
      tableName: 'Status',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  return Status;
};
