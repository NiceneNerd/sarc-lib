/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const assert = require('assert');
var expect = require('chai').expect;

const SARC = require("./../src/sarc.js");
const Parser = require("./../src/parser.js");

describe('Parser', () =>
{
    describe('parse', () =>
    {
        it('should parse header data correctly', () =>
        {   
            const parser = new Parser(new SARC());
            parser.parse(Buffer.from([
                // Header
                0x53, 0x41, 0x52, 0x43, // "SARC" magic
                0x00, 0x14, // Header length
                0xFE, 0xFF, // BOM (big)
                0x00, 0x00, 0x12, 0x34, // filesize
                0x00, 0x00, 0xAB, 0xCD, // data offset
                0x01, 0x00, // version
                0x00, 0x00, // (paddig)
                // SFAT
                0x53, 0x46, 0x41, 0x54, // "SFAT" magic
                0x00, 0x0C, // header length
                0x00, 0x00, // num. nodes
                0x00, 0x00, 0x00, 0x65, // hash multi.
                // SFNT
                0x53, 0x46, 0x4E, 0x54, // magic
                0x00, 0x02, // header size
                0x00, 0x00 // padding
            ]));

            expect(parser.header).deep.equal({ 
                magic: 'SARC',
                headerLength: 5120,
                bom: [ 254, 255 ],
                fileSize: 4660,
                dataOffset: 43981,
                version: 256,
                __PADDING__: 0,
                sfat: 
                { 
                    magic: 'SFAT',
                    headerLength: 12,
                    nodeCount: 0,
                    hashMulti: 101,
                    nodes: [],
                    fileNameMagic: 'SFNT',
                    fileNameHeaderLen: 2,
                    __PADDING__: 0,
                    fileNames: [] 
                } 
            });            
        });
    });

    describe('createBuffer', () =>
    {
        it('end offset is exclusive', () =>
        {   
            let sarc = new SARC();
            const parser = new Parser(sarc);
            parser.header = {dataOffset: 0};
            parser.buffer = Buffer.from([1,2,3,4]);

            expect(parser.createBuffer(0,4)).deep.equal(
                Buffer.from([1,2,3,4])
            );
        });

        it('should add the data offset', () =>
        {   
            let sarc = new SARC();
            const parser = new Parser(sarc);
            parser.header = {dataOffset: 2};
            parser.buffer = Buffer.from([1,2,3,4,5,6,7,8,9,10]);

            expect(parser.createBuffer(2,6)).deep.equal(
                Buffer.from([5,6,7,8])
            );
        });
    });
});