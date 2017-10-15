"use strict";

const io = require( "socket.io-client" );

exports.mount = function() {
    openConnection();
};

function openConnection() {
    let socket = io( "http://localhost:8080/receive-controls" );

    socket.on( "next-event", function ( eventData ) {
        console.log( "next-event", eventData );
    } );
}