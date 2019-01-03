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
    
    localStorage['id'] = id
    return id;
}

var user = {
    name: localStorage['username'] || uname(),
    createdAt: unixTime(),
    uuid: localStorage['id'] || makeid()
}

function uname() {
    uname = prompt('Enter your username.')
    while (unameCheck(uname)) {
        uname = prompt('Enter your username.')
    }
    localStorage['username'] = uname
    return uname
}

var prevMessage = {author: {name: "!"}}
$(function() {
    var socket = io()
    socket.emit('newUser', user)

    socket.on('message', function(message) {
        console.log(message)
        
        if (message.author.name != prevMessage.author.name) {
            $('document').append(`<li class='author'><strong>${message.author.name}</strong> <span class='time'>${curTime()}</span> </li><li>${message.text}</li>`)
        }
        else {
            $('#messages').append(`<li>${message.text}</li>`)
        }
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