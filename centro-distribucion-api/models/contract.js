module.exports = (sequelize, type) => {
  const Contract = sequelize.define(
    'Contract',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: type.STRING,
      email: type.STRING,
      rut: type.STRING,
      phone_number: type.STRING,
    },
    {
      tableName: 'Contract',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  Contract.associate = (models) => {
    // associations can be defined here
    Contract.hasMany(models.Location, {
      foreignKey: 'contract_id',
    });
  };
  return Contract;
};
