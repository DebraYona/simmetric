module.exports = (sequelize, type) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: type.INTEGER,
      guide_number: type.STRING,
      identifier: type.STRING,
      sku: type.STRING,
      status: type.INTEGER,
      confirmed_status: type.INTEGER,
      geofence_id :type.INTEGER,
      job_id: type.INTEGER,
      description: type.STRING,
      price: type.INTEGER,
      quantity: type.INTEGER,
      last_mile: type.INTEGER,
      returned: type.INTEGER,
      travel_id: type.INTEGER,
    },
    {
      tableName: 'Product',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  Product.associate = (models) => {
    // associations can be defined here
    Product.belongsTo(models.Order, {
      foreignKey: 'order_id',
      onDelete: 'CASCADE',
    });

    Product.belongsTo(models.Travel, {
      foreignKey: 'travel_id'
    });
  };
  return Product;
};
