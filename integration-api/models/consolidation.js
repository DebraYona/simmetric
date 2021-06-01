module.exports = (sequelize, type) => {
  const Consolidation = sequelize.define(
    'Consolidation',
    {
      identifier: {
        type: type.STRING,
        primaryKey: true,
        allowNull: false,
      },
      order_id: type.STRING,
      service_order_id: type.STRING,
      grouping: type.STRING,
      scanned: { type: type.INTEGER, allowNull: false, defaultValue: 0 },
      product_id: type.STRING,
      booking_id: type.STRING
    },
    {
      tableName: 'Consolidation',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  return Consolidation;
};
