// Этот файл требуется app.js. Он настраивает прослушиватели событий
// для двух основных конечных точек URL-адресов приложения - / create и / chat /: id
// и прослушивает сообщения socket.io.

// Использует модуль gravatar, чтобы превратить адреса электронной почты в изображения аватаров:

var gravatar = require('gravatar');

// Экспортируйте функцию, чтобы мы могли передать
// экземпляры app и io из файла app.js:

module.exports = function(app,io){

	app.get('/', function(req, res){

		// Отрисовываем views / home.html
		res.render('home');
	});

	app.get('/create', function(req,res){

		// Создание уникального идентификатора комнаты
		var id = Math.round((Math.random() * 1000000));

		// Перенаправляем в случайную комнату
		res.redirect('/chat/'+id);
	});

	app.get('/chat/:id', function(req,res){

		// Визуализируем представление chant.html
		res.render('chat');
	});

	// Инициализируем новое приложение socket.io с именем 'chat'
	var chat = io.of('/socket').on('connection', function (socket) {

		// Когда клиент генерирует событие 'load', отвечаем
		// указав количество людей в этой чат-комнате

		socket.on('load',function(data){

			if(chat.clients(data).length === 0 ) {

				socket.emit('peopleinchat', {number: 0});
			}
			else if(chat.clients(data).length === 1) {

				socket.emit('peopleinchat', {
					number: 1,
					user: chat.clients(data)[0].username,
					avatar: chat.clients(data)[0].avatar,
					id: data
				});
			}
			else if(chat.clients(data).length >= 2) {

				chat.emit('tooMany', {boolean: true});
			}
		});

		// Когда клиент выдает «логин», сохраните его имя и аватар
		// и добавим их в комнату.
		socket.on('login', function(data) {

			// Допускаются только два человека в комнате
			if(chat.clients(data.id).length < 2){

				// Используйте объект сокета для хранения данных. Каждый клиент получает
				// свой собственный уникальный объект сокета

				socket.username = data.user;
				socket.room = data.id;
				socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});

				// Скажите человеку, что он должен использовать для аватара
				socket.emit('img', socket.avatar);


				// Добавить клиента в комнату
				socket.join(data.id);

				if(chat.clients(data.id).length == 2) {

					var usernames = [],
						avatars = [];

					usernames.push(chat.clients(data.id)[0].username);
					usernames.push(chat.clients(data.id)[1].username);

					avatars.push(chat.clients(data.id)[0].avatar);
					avatars.push(chat.clients(data.id)[1].avatar);

					// Отправьте событие startChat всем людям в
					// комнате вместе со списком людей, которые в нем находятся.

					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}

			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		// Кто-то вышел из чата
		socket.on('disconnect', function() {

			// Сообщите другому человеку в чате,
			// что его собеседник вышел

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			// покинуть комнату
			socket.leave(socket.room);
		});


		// Обработка отправки сообщений
		socket.on('msg', function(data){

			// Когда сервер получает сообщение, он отправляет его другому человеку в комнате.
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
		});
	});
};
