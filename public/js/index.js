if( "serviceWorker" in navigator ){
    navigator.serviceWorker.register( 'service_worker.js' ).then( registration => {
        console.log('registered')
    }).catch( err => {
        console.err(`Service worker registration failed: ${err}`)
    })
}
else{
    alert('App is not supported')
    // app not supported
}