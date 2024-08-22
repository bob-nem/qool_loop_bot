const tg_token = require('./token');
const {gameOptions, againOptions} = require('./options')
const TelegramApi = require('node-telegram-bot-api')

// Call the tg_token function to get the actual token value
const token = tg_token();

const bot = new TelegramApi(token, {polling: true})

const chats = {} 

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Я загадываю цифру от 0 до 10, ты отгадываешь.`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Игра - отгадай цифру'}
    ])
    
    bot.on('message',  async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/808/bcc/808bccab-e48e-4be0-bfc2-b8940a0332d2/1.jpg')
            return bot.sendMessage(chatId, `Добро пожаловать в тест бот. Здесь хозяин оттачивает навыки.`)
        }
        if (text ==='/info') {
            return bot.sendMessage(chatId, `Твоё имя: ${msg.from.first_name} ${msg.from.last_name}`)
        }
        if (text === '/game') {
            return startGame(chatId)
        }
        return bot.sendMessage(chatId, `Не понимаю. Всевышний не прописал соответствующую логику.`)
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId)
        }
        if (data === chats[chatId]) {
            return bot.sendMessage(chatId, `Дух Ванги и Жириновского живёт в тебе, ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else {
            return bot.sendMessage(chatId, `Экзамен на битву экстрасенсов в ТНТ провален, бот загадал цифру ${chats[chatId]}`, againOptions)
        }
    })
}

start() 