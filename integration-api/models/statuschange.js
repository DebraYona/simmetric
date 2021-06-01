module.exports = (sequelize, type) => {
  const StatusChange = sequelize.define(
    'StatusChange',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      identifier: type.STRING,
      previous_status: type.INTEGER,
      new_status: type.INTEGER,
      previous_confirmed_status: type.INTEGER,
      new_confirmed_status: type.INTEGER,
      info: type.STRING,
    },
    {
      tableName: 'StatusChange',
      freezeTableName: true,
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    }
  );
  return StatusChange;
};
