# Transvip Integration Retail DB
The main goal of this repository is to keep the DB schema and migrations in a structured way.

We are using Sequelize to keep the migrations easy and DBML to keep the schema in a neutral language easy to update.

We are using MySQL as database but with this structure you could use any SQL database with a few adjustments.

To create and update the database you need access to the Database. If you are using a database in AWS RDS you have to have permission to connect to the database. You can also use a EC2 instance for this.

## Commands

Generate a SQL file in the schema folder. Using transaction-db.dbml as a source:

```bash
npm run create:sql
```


