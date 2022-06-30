// Это главный файл нашего чат-приложения. Он инициализирует новый экземпляр
// express.js экземпляр, требует config и routes файлы
// и слушает порт. Запустить приложение, написав
// 'node app.js' в терминале


var express = require('express'),
	app = express();

var port = process.env.PORT || 6969;

// Инициализируйте новый объект socket.io. Он привязан к
// экспресс-приложению, что позволяет им сосуществовать.

var io = require('socket.io').listen(app.listen(port));

// Требует  configuration и  routes файлы, и передать
// app и io в качестве аргументов возвращаемых функций.

require('./config')(app, io);
require('./routes')(app, io);

console.log('Ваше приложение работает на http://localhost:' + port);