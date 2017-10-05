"use strict";

const commander = require( "commander" );

exports.setOptions = function () {
    return commander
        .option( "-t, --test", "Run test version with mock image" )
        .parse( process.argv );
}