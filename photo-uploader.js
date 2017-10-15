"use strict";

const io            = require( "socket.io-client" );
const ss            = require( "socket.io-stream" );
const fs            = require( "fs" );
const cameraFactory = require( "./camera" );

let photoInterval;
let socket;
let snapshotPath;
let isConnected;
let upstreamURL;

function takePhoto( camera, interval = true ) {
    return camera.snap()
        .then( upload )
        .then( function() {
            return new Promise( function( resolve ) {

                if ( interval ) {
                    photoInterval = setTimeout( () => {
                         takePhoto( camera );
                        resolve();
                    }, 2000 );

                } else resolve();
            } );
        } )
        .catch( function( error ) {
            console.error( "Some error", error );
        } );
}

function upload() {
    if ( ! isConnected ) return;

    return new Promise( function( resolve ) {
        let stream = ss.createStream();
        ss( socket ).emit( "upstream", stream );

        fs.createReadStream( snapshotPath )
            .pipe( stream )
            .on( "end", resolve );
    } );
}

function addSocketEvents() {
    socket.on( "connect", function () {
        isConnected = true;
    } );

    socket.on( "disconnect", function () {
        isConnected = false;

        // try to reconnect to upstream server
        if ( upstreamURL ) {
            let interval = setInterval( function() {
                socket = io( upstreamURL );
                clearInterval( interval );
            }, 100 );

        }
    } );
}


exports.mount = function( optons, URL, test ) {
    if ( ! optons ) return;

    let camera = cameraFactory.createCamera( optons, test );

    snapshotPath = optons.output;
    upstreamURL = URL;

    socket = io( URL );
    addSocketEvents();

    takePhoto( camera );

    return camera;
};

exports.stopPhotoProcess = function() {
    // THAT'S IT - NO MORE PHOTOS
    if ( photoInterval ) {
        clearInterval( photoInterval );

        socket.disconnect();
    }
};

exports.takePhoto = takePhoto;
exports.upload    = upload;
