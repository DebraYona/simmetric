module.exports = (sequelize, type) => {
  const Receiver = sequelize.define(
    'Receiver',
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
      tableName: 'Receiver',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  Receiver.associate = (models) => {
    // associations can be defined here
    Receiver.belongsTo(models.Order, {
      foreignKey: 'order_id',
      onDelete: 'CASCADE',
    });
  };
  return Receiver;
};
