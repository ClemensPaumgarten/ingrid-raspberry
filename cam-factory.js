"use strict";

const PiCamera   = require( "pi-camera" );
const TestCamera = require ( "./test-camera.js");

module.exports.createCamera = function ( camOptions, testMode = false ) {
    if ( testMode ) {
        return new TestCamera ( camOptions );
    } else {
        return new PiCamera( camOptions );
    }
}
