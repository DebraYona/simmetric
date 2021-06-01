module.exports = (sequelize, type) => {
  const Buyer = sequelize.define(
    'Buyer',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: type.INTEGER,
      name: type.STRING,
      phone_number: type.STRING,
      email: type.STRING,
      rut: type.STRING,
    },
    {
      tableName: 'Buyer',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  Buyer.associate = (models) => {
    // associations can be defined here
    Buyer.belongsTo(models.Order, {
      foreignKey: 'order_id',
      onDelete: 'CASCADE',
    });
  };
  return Buyer;
};
