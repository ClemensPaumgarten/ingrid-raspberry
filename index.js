"use strict";

const http          = require( "http" );
const express       = require( "express" );
const io            = require( "socket.io-client" );
const ss            = require( "socket.io-stream" );
const fs            = require( "fs" );
const nodeArgs      = require( "./node-args.js");
const cameraFactory = require( "./cam-factory.js");

const app = express();
const server = http.Server( app );

const program = nodeArgs.setOptions();

const camOutput = `${__dirname}/test.jpg` ;
const cameraOptions = {
    mode: "photo",
    output: camOutput,
    width:  640,
    height: 480,
    nopreview: true
}

let isConnected = false;
let socket = io.connect( "http://localhost:8080/upstream" );
let camera;
let photoInterval;

function takePhoto() {
    if ( ! camera ) return;

    camera.snap()
        .then( upload )
        .then( function() {
           photoInterval = setTimeout( takePhoto, 2000 );
        } )
        .catch( function( error ) {
            console.error( "Some error", error );
        } );
}

function upload( filePath = camOutput ) {
    if ( ! isConnected ) return;

    return new Promise( function( resolve ) {
        let stream = ss.createStream();
        ss( socket ).emit( "upstream", stream );

        fs.createReadStream( filePath )
            .pipe( stream )
            .on( "end", resolve );
    } );
}

function setCamera ( test = program.test ) {
    camera = cameraFactory.createCamera( cameraOptions, test );
}

function unsetCamera() {
    camera = null;
}

function clearPhotoInterval () {
    if ( photoInterval ) {
        clearPhotoInterval ( photoInterval );
    }
}

socket.on( "connect", function() {
    isConnected = true;
} );

socket.on( "disconnect" , function() {
    isConnected = false;
} );

server.listen( 8090, function() {
    console.log( "server running on 8090" );
    setCamera();
    takePhoto();
} );

exports.server              = server;
exports.unsetCamera         = unsetCamera;
exports.upload              = upload;