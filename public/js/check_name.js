var ready = 0

const COLOR = {
    valid: "#44bd32",
    taken: "#d63031",
    invalid: "#fdcb6e",
    wait: "#dfe6e9"
}

function validateName(){
    username = $('.username-field').val()
    for(let name of name_list.split(' ')){
        ready = !username ? 3 : !isValid(username) ? 2 : username != name ? 1 : 0
        
        changeInfo(ready)
        allowEntry(ready)

        if (username === name ) break
    }
    setTimeout(() => {
        validateName()
    }, 500)
}

function isValid( name ){
    let valids = /\w/g
    let filtered = name.replaceAll(valids, '')
    
    return filtered ? false : true 
}

function changeInfo( isReady ){

    switch( isReady ){

        case 0:
            setChecker(COLOR.taken, 'Unavailable')
        break;
        
        case 1:
            setChecker(COLOR.valid, 'Available')
        break;

        case 2:
            setChecker(COLOR.invalid, 'Invalid')
        break;

        case 3:
            setChecker(COLOR.wait, 'Waiting...')
        break

    }

}

function setChecker(color, texts){
    $('.checker-box').css('background-color', color)  
    $('.checker').text(texts)
}

function allowEntry( isReady ){
    
    $('.enterBtn').css('opacity', isReady === 1 ? 1 : 0.5)
    $('.enterBtn').prop('disabled', isReady === 1 ? false : true)
    
}

function handleEntry(){
    if( ready === 1 ){
        $('.name-box').css('visibility', 'hidden')
        $('.chat-frame').css('visibility', 'visible')

        saveName()
    }
}

function saveName(){
    socket.emit('savename', username)
    status = 200
}

