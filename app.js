const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const path = require('path')
const fs = require('fs')

const port = process.env.PORT || 3000

app.use(express.json())
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/bootstrap', express.static(path.join(__dirname, '/node_modules/bootstrap')))
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery')))
app.use('/socket', express.static(path.join(__dirname, '/node_modules/socket.io')))
app.use('/', express.static(__dirname) )

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    let container =  JSON.parse(fs.readFileSync( path.join(__dirname, '/data/user_list.json'))).names.join(' ')
    res.render( path.join(__dirname, '/views/index'), {title: 'Anony-chat', name_list: container })
})

app.post('/save-user', (req, res) => {
    const username = req.body.name

    const container =  JSON.parse(fs.readFileSync( path.join(__dirname, '/data/user_list.json')))
    container.names.push(username)

    fs.writeFileSync( path.join(__dirname, '/data/user_list.json'), JSON.stringify(container))            
} )

io.on('connection', (socket) => {
    console.log('New connection')

    socket.on('user joined', (userData) => {
        const list_of_names =  JSON.parse(fs.readFileSync( path.join(__dirname, '/data/user_list.json')))
        io.emit('headcount', list_of_names.names.length)

        io.emit('user joined', userData)
    })

    socket.on('retrieve', () => {
        const compiledData = JSON.parse(fs.readFileSync( path.join(__dirname, '/data/log.json')))
        io.emit('retrieve', compiledData.log)
    })


    socket.on('message', (data) => {
        logCurrentUser(data)
        socket.broadcast.emit('message', data)
    })

    socket.on('disconn', (user) => {
        const list_of_names =  JSON.parse(fs.readFileSync( path.join(__dirname, '/data/user_list.json')))
        const compiledData = JSON.parse(fs.readFileSync( path.join(__dirname, '/data/log.json')))

        if(user.data){
            const newList = []
            console.log(user)
            for(let item of list_of_names.names){
                if( item === user.data.username ) continue
                newList.push(item)
            }
    
            list_of_names.names = newList
    
    
            io.emit('headcount', newList.length)
            socket.broadcast.emit('disconn', user)
        }

        if(user.data && list_of_names.names.length == 0){
            compiledData.log = []
        }

        fs.writeFileSync( path.join(__dirname, '/data/user_list.json'), JSON.stringify(list_of_names))    
        fs.writeFileSync( path.join(__dirname, '/data/log.json'), JSON.stringify(compiledData))    
    })

})

function logCurrentUser( data ){
    const logs =  JSON.parse(fs.readFileSync( path.join(__dirname, '/data/log.json')))
    
    const userLog = {
        id  : data.id,
        username    :   data.username,
        message :   data.message
    } 

    logs.log.push( userLog )

    fs.writeFileSync( path.join(__dirname, '/data/log.json'), JSON.stringify(logs))    

}

server.listen(port, () => {
    console.log(`Server is listening on port: ${port}`)
})
