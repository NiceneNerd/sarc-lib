/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const assert = require('assert');
var expect = require('chai').expect;
const stringHash = require("./../src/stringHash.js");

describe('stringHash', () =>
{
    describe('hash', () =>
    {
        it('should calculate correctly', function() 
        { 
            expect(stringHash.hash("Model/DgnMrgPrt_Dungeon000.Tex2.sbfres")).equal("08275e14");
        });

        it('empty string should be 0', function() 
        { 
            expect(stringHash.hash("")).equal("00000000");
        });
    });

    describe('toHex', () =>
    {
        it('should it convert to a fixed-length hex-string', function() 
        { 
            expect(stringHash.toHex(0x1234)).equal("00001234");
        });

        it('should correctly encode "negative" numbers', function() 
        { 
            expect(stringHash.toHex(-1042106875)).equal("c1e2b605");
        });
    });
});