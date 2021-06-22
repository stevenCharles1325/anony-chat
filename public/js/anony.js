// const url = document.location.href
const UCOLOR = '#f8c291'

let userData 
let WIDTH = 0
let dataRetrieved = false
let isNotTyping = false

var audio

$(window).on("beforeunload", function() { 
    socket.emit('disconnection', {data: userData, request: 'disconnect'})
})

function init(){
    audio = new AnonMp3()
    audio.enterAud()

    userData = {
        username: username,
        message:  $('.message').val()
    }

    socket.emit('user joined', {data: userData, request: 'connect'})
    socket.on('user joined', shoutEvent)

    socket.emit('retrieve')
    socket.on('retrieve', displayContent)

    socket.on('headcount', updateHeadCount)

    socket.on('typing', setToTyping)
    socket.on('not typing', setToNotTyping)

    socket.on('message', displayMessage)

    socket.on('disconnection', shoutEvent)

    $('.sendBtn').on('click', messageHandler)
    
    $('.message').focusin(userRequestTyping)
    $('.message').focusout(() => {
        socket.emit('not typing', userData)
    })
    
    updateScroll()
}

function updateScroll(){
    let chatHeight = document.querySelector('.chat-box').scrollHeight
    $('.chat-box').animate({ scrollTop: chatHeight }, 100);
}

function userRequestTyping(){
    $('.message').on('keydown', keyListen)
}

function keyListen(e){
    if(!isNotTyping){
        socket.emit('typing', userData)
        isNotTyping = true        
    }
}

function setToTyping(data){
    data.message = 'Typing...'
    const options = {
        data        :   data,
        color       :   UCOLOR,
        width       :   WIDTH,
        isReverse   :   false
    }
    display(options)
}

function setToNotTyping(data){
    $(`#${data.username}`).remove()
}

function updateHeadCount( total ){
    $('.headcount').text(`Population: ${total}`)
}

function shoutEvent( user ){
    if(!userData) userData = user.data
    
    const container = document.createElement('div')
    const nameShelf = document.createElement('div')
    const name = document.createElement('p')
    const color = "#636e72"
    
    name.style.letterSpacing = 'normal'

    let screenname = user.data.username === userData.username ? 'You' : user.data.username
    name.innerHTML = user.request === 'connect' ? `${screenname} ${screenname === 'You'? 'have' : 'has'} joined the room.` : `${screenname} has left the room.`

    container.classList.add('container-fluid')
    nameShelf.classList.add('nameShoutBox')

    nameShelf.appendChild(name)
    container.appendChild(nameShelf)

    $('.chat-box').append(container)
    updateScroll()
}

function messageHandler(){

    userData.message = $('.message').val()
    widthUpdate(userData)
    
    if(userData.message){
        socket.emit('not typing', userData)
        isNotTyping = false
    
        audio.sendAud()
        const options = {
            data        :   userData,
            color       :   UCOLOR,
            width       :   WIDTH,
            isReverse   :   true 
        }

        display(options)
        socket.emit('message', userData)
        $('.message').val('')
    }
}

function displayMessage(data){
    audio.newMsgAud()    
    widthUpdate(data)
    const options = {
        data        :   data,
        color       :   null,
        width       :   WIDTH,
        isReverse   :   false
    }

    display(options)
}

function displayContent(data){
    if(!dataRetrieved){
        
        for(let log of data){
            widthUpdate(log)
            const options = {
                data        :   log,
                color       :   null,
                width       :   WIDTH,
                isReverse   :   false 
            }
            display(options)
        }

        dataRetrieved = true
    }
}


function display(opt){
    let message = new Message(opt.data)

    if(opt.color && opt.isReverse){
        message.setColor( opt.color )
        message.setLeft()
    } 

    message.setWidth(opt.width)
    message.show()
    updateScroll()
}

function widthUpdate( data ){
    WIDTH = data.message.length >= 15 ? '50%' : 'fit-content'
}

class Message{
    constructor(data){
        this.message = data.message
        this.screenname = data.username
        this.name = data.username === userData.username ? 'You' : data.username

        this.cover = document.createElement('div')
        this.container = document.createElement('div')
        this.messageBox = document.createElement('div')
        this.messageShelf = document.createElement('div')
        this.nameBox = document.createElement('div')
        this.shelf = document.createElement('div')

        this.messageStyle = document.createElement('p')

        this.nameStyle = document.createElement('p')
        this.nameStyle.style.letterSpacing = '2px' 
        this.nameStyle.classList.add('p-0') 
        this.nameStyle.classList.add('m-0')

        this.cover.classList.add('my-3')

        this.color = '#dfe6e9'
    }

    show(){
        if(this.message === 'Typing...') this.cover.id = this.screenname

        this.messageBox.style.backgroundColor = this.color
        this.messageStyle.innerHTML = this.message
        this.nameStyle.innerHTML = this.name

        this.nameStyle.style.color = '#bdc3c7'

        this.messageBox.appendChild( this.messageStyle )
        this.nameBox.appendChild( this.nameStyle )

        this.messageShelf.appendChild( this.messageBox )
        this.messageShelf.classList.add('d-flex')

        this.shelf.appendChild( this.nameBox )
        this.shelf.appendChild( this.messageShelf )

        this.shelf.classList.add('d-flex')
        this.shelf.classList.add('flex-column')
        this.shelf.style.textAlign = 'left'

        this.container.appendChild( this.shelf )
        this.container.classList.add('container-fluid')

        this.cover.classList.add('container-fluid')
        this.cover.appendChild( this.container )

        this.messageBox.classList.add('message-box')
        
        $('.chat-box').append(this.cover)

    }


    setColor( color ){
        this.color = color
        this.messageBox.style.backgroundColor = this.color
    }

    setLeft(){
        this.container.classList.add('d-flex')
        this.container.classList.add('flex-row-reverse')
        this.shelf.classList.add('container-fluid')
        this.messageShelf.classList.add('flex-row-reverse')
        this.nameBox.style.textAlign = 'right'
    }

    setWidth( width ){
        if( width !== 'fit-content'){
            this.messageStyle.style.wordBreak = 'break-all'
        }
        this.messageBox.style.width = width
    }
}


class AnonMp3{
    constructor(){
        this.enter = document.createElement('audio')
        this.newMsg = document.createElement('audio')
        this.send = document.createElement('audio')


        this.enter.setAttribute('src', '/public/audio/enter.wav')
        this.newMsg.setAttribute('src', '/public/audio/new_message.wav')
        this.send.setAttribute('src', '/public/audio/send.wav')

    }

    enterAud(){
        this.enter.play()
    }
    
    newMsgAud(){
        this.newMsg.play()
    }

    sendAud(){
        this.send.play()
    }
}

const checkState = setInterval(() => {
    if( status == 200) {
        init()
        console.log('here')
        clearInterval(checkState)
    }
}, 1000)