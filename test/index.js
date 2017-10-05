"use strict";

const socketIo    = require( "socket.io" );
const ioClient    = require( "socket.io-client" );
const ss          = require( "socket.io-stream" );
const fs          = require( "fs" );
const rimraf      = require( "rimraf" );
const bufferEqual = require( "buffer-equal" );
const index       = require( "../index" );
const camFactory  = require( "../cam-factory.js");

const io = socketIo( index.server );

index.unsetCamera();

describe( "Index", function () {
    const camOutput = `${__dirname}/test/test.jpg`;
    const cameraOptions = {
        mode: "photo",
        output: camOutput,
        width:  640,
        height: 480,
        nopreview: true
    };
    let camera = camFactory.createCamera( cameraOptions, true );

    beforeEach( function() {
        fs.mkdirSync( `${__dirname}/test` );
    } );

    afterEach( function( done ) {
        rimraf( `${__dirname}/test` , done );
    } );

    it( "should create an outputfile", function ( done ) {
        camera.snap().then( function () {
            if ( fs.existsSync( camOutput ) ) {
                done();
            }
        } )
    } );
} );