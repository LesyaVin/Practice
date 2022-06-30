// Этот файл выполняется в браузере, когда люди заходят в / chat / <random id>

$(function(){

	// получение id комнаты из url-адреса
	var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

	// подключаемся к socket
	var socket = io.connect('/socket');

	// переменные, которые содержат данные для каждого человека
	var name = "",
		email = "",
		img = "",
		friend = "";

	// кешируем некоторые объекты jQuery
	var section = $(".section"),
		footer = $("footer"),
		onConnect = $(".connected"),
		inviteSomebody = $(".invite-textfield"),
		personInside = $(".personinside"),
		chatScreen = $(".chatscreen"),
		left = $(".left"),
		noMessages = $(".nomessages"),
		tooManyPeople = $(".toomanypeople");

	// еще несколько объектов jquery
	var chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
		hisName = $("#hisName"),
		hisEmail = $("#hisEmail"),
		chatForm = $("#chatform"),
		textarea = $("#message"),
		messageTimeSent = $(".timesent"),
		chats = $(".chats");

	// эти переменные содержат изображения
	var ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");

	// Переменные для уведомления об изменении заголовка
	var focused = true;
	var baseTitle = window.document.title;
	var chatsMissed = 0;


	// переменная, которая создает аудио
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', 'https://dl.dropboxusercontent.com/u/18770429/new_gooogle_hangout.mp3');
	//audioElement.load код выше.
	//если вы выберете: false из кода, файл будет автоматически воспроизводиться, после чего все будет работать так же ()
	audioElement.setAttribute('autoplay:false', 'autoplay');

	$.get();
  audioElement.addEventListener("load", function () {
		audioElement.play();
  }, true);


	// при подключении к серверу получаем id комнаты человека
	socket.on('connect', function(){

		socket.emit('load', id);
	});

	// сохраняем url аватара
	socket.on('img', function(data){
		img = data;
	});

	// получаем имена и аватары всех людей в чате
	socket.on('peopleinchat', function(data){

		if(data.number === 0){

			showMessage("connected");

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(yourName.val());

				if(name.length < 1){
					alert("Пожалуйста, введите ник, длина которого превышает 1 символ!");
					return;
				}

				email = yourEmail.val();

				if(!isValid(email)) {
					alert("Пожалуйста, введите действительный адрес электронной почты!");
				}
				else {

					showMessage("inviteSomebody");

					// вызываем серверную функцию login и отправляем параметры пользователя
					socket.emit('login', {user: name, avatar: email, id: id});
				}

			});
		}

		else if(data.number === 1) {

			showMessage("personinchat",data);

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(hisName.val());

				if(name.length < 1){
					alert("Пожалуйста, введите ник, длина которого превышает 1 символ!");
					return;
				}

				if(name == data.user){
					alert("Уже есть \"" + name + "\" в этой комнате!");
					return;
				}
				email = hisEmail.val();

				if(!isValid(email)){
					alert("Неправильный формат электронной почты!");
				}
				else{

					socket.emit('login', {user: name, avatar: email, id: id});
				}

			});
		}

		else {
			showMessage("tooManyPeople");
		}

	});

	// Другое полезное

	socket.on('startChat', function(data){
		if(data.boolean && data.id == id) {

			chats.empty();

			if(name === data.users[0]) {

				showMessage("youStartedChatWithNoMessages",data);
			}
			else {

				showMessage("heStartedChatWithNoMessages",data);
			}

			chatNickname.text(friend);
		}
	});

	socket.on('leave',function(data){

		if(data.boolean && id==data.room){

			showMessage("somebodyLeft", data);
			chats.empty();
		}

	});

	socket.on('tooMany', function(data){

		if(data.boolean && name.length === 0) {

			showMessage('tooManyPeople');
		}
	});

	socket.on('receive', function(data){

			showMessage('chatStarted');

			createChatMessage(data.msg, data.user, data.img, moment());
			scrollToBottom();
			countMissChats();
			audioElement.play();
	});

	textarea.keypress(function(e){

		// Отправляем форму при входе
		if(textarea.val() != ""){
				if(e.which == 13) {
					e.preventDefault();
					chatForm.trigger('submit');
				}
		}

	});

	chatForm.on('submit', function(e){

		e.preventDefault();

		// Создаем новое сообщение чата и отображаем его напрямую

		showMessage("chatStarted");

		createChatMessage(textarea.val(), name, img, moment());
		scrollToBottom();

		// Отправляем сообщение другому человеку в чате
		socket.emit('msg', {msg: textarea.val(), user: name, img: img});

		// Очистить текстовое поле
		textarea.val("");

		// проигрываем звуковое уведомление
		audioElement.play();
	});


	// countMissChats
	function countMissChats(){
		if(socket.on('receive')){
			if(!focused){
				chatsMissed++;
				window.document.title = "("+chatsMissed+")" + baseTitle;
			}
		}
	}

	// когда окно сфокусировано ...
	$(window).focus(function(){
		focused = true;
		setTimeout(function(){
			document.title = baseTitle;
		}, 100);
		chatsMissed = 0;
	});

	// когда окно размыто ...
	$(window).blur(function(){
		focused = false;
	});

	// Обновляем относительные отметки времени в сообщениях чата каждую минуту

	setInterval(function(){

		messageTimeSent.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	},60000);

	// Функция, которая создает новое сообщение чата

	function createChatMessage(msg,user,imgg,now){

		var who = '';

		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}

		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
					'<img src=' + imgg + ' />' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<p></p>' +
			'</li>');

		// используем метод 'text', чтобы избежать ввода злонамеренного пользователя))
		li.find('p').text(msg);
		li.find('b').text(user);

		chats.append(li);

		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function scrollToBottom(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}

	function isValid(thatemail) {

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(thatemail);
	}

	function showMessage(status,data){

		if(status === "connected"){

			section.children().css('display', 'none');
			footer.css('display', 'none');
			onConnect.fadeIn(1200);
		}

		else if(status === "inviteSomebody"){

			// Устанавливаем содержание ссылки для приглашения
			$("#link").text(window.location.href);

			onConnect.fadeOut(1200, function(){
				inviteSomebody.fadeIn(1200);
			});
		}

		else if(status === "personinchat"){

			onConnect.css("display", "none");
			footer.css('display', 'none');
			personInside.fadeIn(1200);

			chatNickname.text(data.user);
			ownerImage.attr("src",data.avatar);
		}

		else if(status === "youStartedChatWithNoMessages") {

			left.fadeOut(1200, function() {
				inviteSomebody.fadeOut(1200,function(){
					noMessages.fadeIn(1200);
					footer.fadeIn(1200);
				});
			});

			friend = data.users[1];
			noMessagesImage.attr("src",data.avatars[1]);
		}

		else if(status === "heStartedChatWithNoMessages") {

			personInside.fadeOut(1200,function(){
				noMessages.fadeIn(1200);
				footer.fadeIn(1200);
			});

			friend = data.users[0];
			noMessagesImage.attr("src",data.avatars[0]);
		}

		else if(status === "chatStarted"){

			section.children().css('display','none');
			chatScreen.css('display','block');
		}

		else if(status === "somebodyLeft"){

			leftImage.attr("src",data.avatar);
			leftNickname.text(data.user);

			section.children().css('display','none');
			footer.css('display', 'none');
			left.fadeIn(1200);
		}

		else if(status === "tooManyPeople") {

			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
		}
	}
});