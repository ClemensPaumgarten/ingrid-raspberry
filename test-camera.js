"use strict";

const fs = require( "fs" );

module.exports = class TestCamera {
    constructor ( camOptions ) {
        this.camOptions = camOptions;
    }

    snap () {
        return new Promise( resolve => {
            fs.createReadStream( `${__dirname}/test/mocks/test.jpg`).pipe(
                fs.createWriteStream( this.camOptions.output ).on( "finish", function () {
                    resolve();
                } )
            )
        } );
    }
}