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
    if (msg.length > 128) {
        return false
    }
    else {
        return true
    }
}

function cleanText(txt) {
    return txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

io.on('connection', function(socket) {
    var user = {}
    io.to(socket.id).emit('message',{text: 'Welcome user!', author: {name: "Server"}})

    socket.on('newUser', function(newUser){
        user = newUser
        io.emit('userConnect', user)
        console.log("User: '" + user.name + "' has connected")
    })

    socket.on('message', function(message) {
        if (validMessage(message.text)) {
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