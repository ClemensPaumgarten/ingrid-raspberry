"use strict";

const http          = require( "http" );
const express       = require( "express" );
const nodeArgs      = require( "./node-args.js" );
const photoUploader = require( "./photo-uploader.js" );
const controls      = require( "./controls" );

const app = express();
const server = http.Server( app );
const program = nodeArgs.setOptions();

const serverAddress = "104.236.194.97:6969";

const cameraOptions = {
    mode: "photo",
    output: `${__dirname}/test.jpg`,
    width:  640,
    height: 480,
    nopreview: true
};

server.listen( 8090, function() {
    console.log( "server running on 8090" );

    if ( process.env.NODE_ENV !== "test"  ) {

        // mount photo loader and start upload process
        photoUploader.mount(
            cameraOptions,
            `http://${serverAddress}/upstream`,
            program.test
        );

        // mount controls receiver
        controls.mount();
    }
} );

exports.server = server;