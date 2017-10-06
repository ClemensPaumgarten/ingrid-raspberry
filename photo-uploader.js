"use strict";

const io            = require( "socket.io-client" );
const ss            = require( "socket.io-stream" );
const fs            = require( "fs" );
const cameraFactory = require( "./camera.js" );

let photoInterval;
let socket;
let snapshotPath;
let isConnected;

function takePhoto ( camera, interval = true ) {
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

function upload () {
    if ( ! isConnected ) return;

    return new Promise( function( resolve ) {
        let stream = ss.createStream();
        ss( socket ).emit( "upstream", stream );

        fs.createReadStream( snapshotPath )
            .pipe( stream )
            .on( "end", resolve );
    } );
}

function addSocketEvents () {
    socket.on( "connect", function () {
        isConnected = true;
    } );

    socket.on( "disconnect", function () {
        isConnected = false;
    } );
}


exports.mount = function( optons, URL, test, start = true ) {
    if ( ! optons ) return;

    let camera = cameraFactory.createCamera( optons, test );
    snapshotPath = optons.output;

    socket = io.connect( URL );
    addSocketEvents();

    if ( start ) {
        takePhoto( camera );
    }

    return camera;
};

exports.stopPhotoProcess = function () {
    // THAT'S IT - NO MORE PHOTOS
    if ( photoInterval ) {
        clearInterval( photoInterval );

        socket.disconnect();
    }
};

exports.takePhoto = takePhoto;
exports.takePhoto = takePhoto;
exports.upload    = upload;
