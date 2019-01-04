function unameCheck(username) {
    if (username.length < 3) {
        alert("Username must be at least 3 letters long")
        return true
    }
    else if (username.length > 28) {
        alert("Username cannot exceed 28 characters")
        return true
    }
    else {
        return false
    }
}

function unixTime() {
    return new Date().getTime()
}

function curTime() {
    var d = new Date()
    var hr = d.getHours();
    var min = d.getMinutes();
    if (min < 10) {
        min = "0" + min;
    }
    var ampm = "am";
    if( hr > 12 ) {
        hr -= 12;
        ampm = "pm";
    }
    return hr + ':' + min + " " + ampm
}

function makeid() {
    var id = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  
    for (var i = 0; i < 11; i++)
      id += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return id;
}

function uname() {
    name = prompt('Enter the username you would like to use')
    while (unameCheck(name)) {
        name = prompt('Enter the username you would like to use')
    }
    return name
}

function updateUser() {
    $('.username').text(user.name)
    $('.username').css('color', user.color)
    localStorage['user'] = JSON.stringify(user)
}

var user = {}
storedUser = localStorage['user']
if (storedUser == undefined) {
    user = {
        name: uname(),
        createdAt: unixTime(),
        color: '#ecf0f1',
        uuid: makeid()
    }
}
else {
    user = JSON.parse(storedUser)
}

$(function() {
    var prevMessage = {author: {name: ""}}
    var socket = io()
    socket.emit('newUser', user)

    updateUser()

    $(".config").on('click', function() {
        if ($('.config-container').hasClass('active')) {
            $('.config-container').removeClass('active')
            $('.config-container').removeClass('colors')
        }
        else {
            $('.config-container').addClass('active')
        }    
    })

    $('#changename').on('click', function(){
        oldname = user.name
        newname = uname()
        if (newname != 'null') {
            user.name = newname
            updateUser()
            socket.emit('rename', user, oldname)
        }
    })
    $('#changecolor').on('click', function(){
        $('.config-container').addClass('colors')
    })
    $('.color').on('click', function() {
        user.color = $(this).css('background-color')
        updateUser()
    })
    $('#reportabuse').on('click', function() {
        prompt('Please provide the user\'s name and background information')
        alert('Info has been submitted and will be reviewed')
    })

    socket.on('message', function(message) {
        if (message.author.name != prevMessage.author.name) {
            $('#messages').append(`<li class='author' id='uuid-${message.author.uuid}'><strong style='color:${message.author.color}'>${message.author.name}</strong> <span class='time'>${curTime()}</span> </li><li>${message.text}</li>`)
        }
        else {
            $('#messages').append(`<li>${message.text}</li>`)
        }
        $("html").scrollTop($(document).height())
        prevMessage = message
    })

    socket.on('userConnect', function(newUser) {
        if (newUser.createdAt != user.createdAt && newUser.name != user.name) {
            $('#messages').append(`<li class='userJoin'>User <span class='underline'>${newUser.name}</span> has joined</li>`)
        }
    })

    socket.on('userDisconnect', function(newUser) {
        if (newUser.createdAt != user.createdAt && newUser.name != user.name) {
            $('#messages').append(`<li class='userLeave'>User <span class='underline'>${newUser.name}</span> has left</li>`)
        }
    })

    $('form').submit(function(e){
        e.preventDefault()
        socket.emit('message', {text: $('#m').val(), author: user })
        $('#m').val('')
        return false
    })

    var maxLetters = 128
    $('.letCount').text(maxLetters)
    $('#m').keyup(function(){
        var letRemain = maxLetters-($('#m').val().trim().length)
        letCount = $('.letCount')
        letCount.text(letRemain)
        if (letRemain > 0) {
            letCount.removeClass('zero')
            letCount.removeClass('negative')
        }
        else if (letRemain == 0) {
            letCount.addClass('zero')
            letCount.removeClass('negative')
        }
        else if (letRemain < 0) {
            letCount.removeClass('zero')
            letCount.addClass('negative')
        }
    })
})