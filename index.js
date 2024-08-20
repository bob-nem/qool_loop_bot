const tg_token = require('./token');

const TelegramApi = require('node-telegram-bot-api')

// Call the tg_token function to get the actual token value
const token = tg_token();

const bot = new TelegramApi(token, {polling: true})

const chats = {} 

const gameOptions = {
    reply_markup:JSON.stringify({
        inline_keyboard: [
            [{text: 'текст кнопки', callback_data: 'skdjf'}]
        ]
    })
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
            await bot.sendMessage(chatId, `Я загадываю цифру от 0 до 10, ты отгадываешь.`)
            const randomNumber = Math.floor(Math.random() * 10)
            chats[chatId] = randomNumber;
            return bot.sendMessage(chatId, 'Отгадывай', gameOptions)
        }
        return bot.sendMessage(chatId, `Не понимаю. Всевышний не прописал соответствующую логику.`)
    })
}

start() 