const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = 8080

app.use(express.static('public'))

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

function validMessage(msg) {
    if (msg.length < 1 || msg.length > 128) {
        return false
    }
    else {
        return true
    }
}

function cleanText(txt) {
    return txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

var roles = {
    admin: ['zGdrLAZf4jI']
}

var botPrefix = '/'
io.on('connection', function(socket) {
    var user = {}
    var serverUser = {name: "Server",color: '#55efc4', uuid: 'SERVER'}
    io.to(socket.id).emit('message',{text: 'Welcome user!', author: serverUser})

    socket.on('newUser', function(newUser) {
        user = newUser
        io.emit('userConnect', user)
        console.log("User: '" + user.name + "' has connected")
    })

    socket.on('rename', function(user, oldname) {
        io.emit('message', {text: `${oldname} has renamed themselves to ${user.name}`, author: serverUser})
    })

    socket.on('message', function(message) {
        if (message.text[0] == '/') {
            if (message.text == '/info') {
                io.to(socket.id).emit('message',{text: `<strong>User ${message.author.name}:</strong> <br/> Created at ${message.author.createdAt} <br/> UUID: ${message.author.uuid}<br/>`, author: serverUser})
            }
            else if (message.text == '/help') {
                io.to(socket.id).emit('message',{text: `<strong>Commands:</strong> <br/> /info <em>Shows info about you</em>`, author: serverUser})
            }
            else {
                io.to(socket.id).emit('message',{text: 'Unrecognized command', author: serverUser})
            }
        }
        else if (validMessage(message.text)) {
            message.text = cleanText(message.text)
            io.emit('message', message)
            console.log(message.author.name + ' :: ' + message.text)
        }
    })
    
    socket.on('disconnect', function() {
        if (user.name != undefined) {
            io.emit('userDisconnect', user)
            console.log(user.name + ' has disconnected')
        }
    })
})

http.listen(port, function() {
    console.log('listening on port ' + port)
})