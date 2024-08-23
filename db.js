const {Sequelize} = require('sequelize')

module.exports = new Sequelize (
    'QOOL_LOOP_BOT',
    'shkura',
    'vfczcmrb',
    {
        host: 'master.73e656b6-438a-4cf7-b4da-e4fc91fc55a5.c.dbaas.selcloud.ru',
        port: '5432',
        dialect: 'postgres'
    }
)