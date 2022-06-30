// Этот файл обрабатывает конфигурацию приложения.
// Это требуется для app.js

var express = require('express');

module.exports = function(app, io){

	// Установить .html как расширение шаблона по умолчанию
	app.set('view engine', 'html');

	// Инициализируем шаблонизатор ejs
	app.engine('html', require('ejs').renderFile);

	// Сообщаем express, где можно найти шаблоны
	app.set('views', __dirname + '/views');

	// Делаем файлы в общей папке доступными для всего мира)
	app.use(express.static(__dirname + '/public'));

	// Скрытие сообщений журнала от socket.io. Комментарий, чтобы показать все.
	io.set('log level', 1);

};