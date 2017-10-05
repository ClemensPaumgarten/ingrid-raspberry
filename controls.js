"use strict";

exports.mount = function ( io ) {
    openConnection( io );
};

function openConnection ( io ) {
    let socket = io.connect( "http://localhost:8080/receive-controls" );

    socket.on( "next-event", function ( eventData ) {
        console.log( eventData );
    } );
}