"use strict";

const fs       = require( "fs" );
const PiCamera = require( "pi-camera" );

class TestCamera {
    constructor ( camOptions ) {
        this.camOptions = camOptions;
    }

    snap () {
        return new Promise( resolve => {
            fs.createReadStream( `${__dirname}/test/mocks/test.jpg` )
                .pipe( fs.createWriteStream( this.camOptions.output ).on( "finish", resolve ) );
        } );
    }
}

module.exports.createCamera = function ( camOptions, testMode = false ) {
    if ( testMode ) {
        return new TestCamera ( camOptions );
    } else {
        return new PiCamera( camOptions );
    }
};
