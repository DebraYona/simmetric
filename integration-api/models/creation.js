module.exports = (sequelize, type) => {
  const Creation = sequelize.define(
    'Creation',
    {
      identifier: {
        type: type.STRING,
        primaryKey: true,
        allowNull: false,
      },
      service_order_id: type.STRING,
    },
    {
      tableName: 'Creation',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  return Creation;
};
