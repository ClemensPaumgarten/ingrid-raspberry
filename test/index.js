"use strict";

const socketIo      = require( "socket.io" );
const ss            = require( "socket.io-stream" );
const fs            = require( "fs" );
const rimraf        = require( "rimraf" );
const bufferEqual   = require( "buffer-equal" );
const index         = require( "../index" );
const photoUploader = require( "../photo-uploader.js" );

let io;

before( function() {
    io = socketIo( index.server );
} );

after( function() {
    io.close();
} );

describe( "photo-uploader", function() {
    const testOutput = `${__dirname}/test/test.jpg`;
    const cameraOptions = {
        mode: "photo",
        output: testOutput,
        width:  640,
        height: 480,
        nopreview: true
    };

    beforeEach( function() {
        fs.mkdirSync( `${__dirname}/test` );
    } );

    afterEach( function( done ) {
        rimraf( `${__dirname}/test`, done );
        photoUploader.stopPhotoProcess();
    } );

    it( "it should take a snapshot and save it to the defined output location", function( done ) {
        const camera = photoUploader.mount(
            cameraOptions,
            "http://localhost:8090/test-upstream",
            true,
            false
        );

        photoUploader.takePhoto( camera, false ).then( function() {
            let testFile = fs.readFileSync( `${__dirname}/mocks/test.jpg` );
            let outputFile = fs.readFileSync( testOutput );

            if ( bufferEqual( testFile, outputFile ) ) {
                done();
            }
        } );
    } );

    it( "should upload snapshot to provided URL", function( done ) {
        io.of( "test-upstream" ).on( "connection", function( socket ) {
            ss( socket ).on( "upstream", function ( stream ) {
                let writeable = fs.createWriteStream( testOutput );

                stream.pipe( writeable ).on( "finish", function() {
                    let outputFile = fs.readFileSync( testOutput );
                    let testFile = fs.readFileSync( `${__dirname}/mocks/test.jpg` );

                    if ( bufferEqual( testFile, outputFile ) ) {
                        done();
                    }
                } );
            } );

            photoUploader.takePhoto( camera, false );
        } );

        const camera = photoUploader.mount(
            cameraOptions,
            "http://localhost:8090/test-upstream",
            true,
            false
        );
    } );
} );