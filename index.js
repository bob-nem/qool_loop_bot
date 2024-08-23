const tg_token = require('./token');
const { gameOptions, againOptions } = require('./options');
const sequelize = require('./db');
const TelegramApi = require('node-telegram-bot-api');
const UserModel = require('./models');

// Call the tg_token function to get the actual token value
const token = tg_token();

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
    try {
        await bot.sendMessage(chatId, `Я загадываю цифру от 0 до 10, ты отгадываешь.`);
        const randomNumber = Math.floor(Math.random() * 10);
        chats[chatId] = randomNumber;
        await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
    } catch (error) {
        console.error('Error starting game:', error);
    }
};

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

testConnection();

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Database connection has been established successfully.');
    } catch (e) {
        console.error('CONNECTION INTO DATABASE INTERRUPTED', e);
        return; // Exit if the database connection fails
    }

    bot.setMyCommands([
        { command: '/start', description: 'Приветствие' },
        { command: '/info', description: 'Получить информацию о пользователе' },
        { command: '/game', description: 'Игра - отгадай цифру' }
    ]);

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id.toString(); // Convert chatId to string

        try {
            if (text === '/start') {
                let user = await UserModel.findOne({ where: { chatId } });

                if (!user) {
                    user = await UserModel.create({ chatId, right: 0, wrong: 0 });
                }

                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/808/bcc/808bccab-e48e-4be0-bfc2-b8940a0332d2/1.jpg');
                return bot.sendMessage(chatId, `Добро пожаловать в тест бот. Здесь хозяин оттачивает навыки.`);
            }
            if (text === '/info') {
                const user = await UserModel.findOne({ where: { chatId } });
                if (!user) {
                    return bot.sendMessage(chatId, 'Пользователь не найден.');
                }
                return bot.sendMessage(chatId, `Твоё имя: ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong}`);
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, `Не понимаю. Всевышний не прописал соответствующую логику.`);
        } catch (error) {
            console.error('Error processing message:', error);
            return bot.sendMessage(chatId, 'Произошла какая-то ошибочка!');
        }
    });

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id.toString(); // Convert chatId to string

        try {
            if (data === '/again') {
                return startGame(chatId);
            }

            const user = await UserModel.findOne({ where: { chatId } });
            if (!user) {
                return bot.sendMessage(chatId, 'Пользователь не найден.');
            }

            const guessedNumber = parseInt(data);
            if (guessedNumber === chats[chatId]) {
                user.right += 1;
                await bot.sendMessage(chatId, `Дух Ванги и Жириновского живёт в тебе, ты отгадал цифру ${chats[chatId]}`, againOptions);
            } else {
                user.wrong += 1;
                await bot.sendMessage(chatId, `Экзамен на битву экстрасенсов в ТНТ провален, бот загадал цифру ${chats[chatId]}`, againOptions);
            }
            await user.save();
        } catch (error) {
            console.error('Error handling callback query:', error);
            await bot.sendMessage(chatId, 'Произошла какая-то ошибочка!');
        }
    });
}

start();
