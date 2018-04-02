/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const assert = require('assert');
var expect = require('chai').expect;
const SARC = require("./../src/sarc.js");

describe('SARC', () =>
{
    describe('addFile', () =>
    {
        it('should add entries', function() 
        {   
            const sarc = new SARC();
            sarc.addFile("name", Buffer.from([1,2,3,4]));

            expect(sarc.entries.size).equal(1);
            expect(sarc.entries.has("name")).equal(true);
        });
    });

    describe('getFile', () =>
    {
        it('should return correct buffer (1 in list)', function() 
        {   
            const sarc = new SARC();
            sarc.addFile("file0", Buffer.from([1,2,3,4]));
            expect(sarc.getFile("file0")).deep.equal(Buffer.from([1,2,3,4]));
        });

        it('should return correct buffer (4 in list)', function() 
        {   
            const sarc = new SARC();
            sarc.addFile("file0", Buffer.from([10,20,30,40]));
            sarc.addFile("file1", Buffer.from([11,21,31,41]));
            sarc.addFile("file2", Buffer.from([12,22,32,42]));
            sarc.addFile("file3", Buffer.from([13,23,33,43]));
            expect(sarc.getFile("file2")).deep.equal(Buffer.from([12,22,32,42]));
        });

        it('should return correct buffer (empty list)', function() 
        {   
            const sarc = new SARC();
            expect(sarc.getFile("someFile")).equal(null);
        });
    });
});