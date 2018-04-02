/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const assert = require('assert');
var expect = require('chai').expect;
const fs = require("fs");

const SARC    = require("./../src/sarc.js");
const Parser  = require("./../src/parser.js");
const Creator = require("./../src/creator.js");

describe('Creator', () =>
{
    describe('sortEntries', () =>
    {    
        it('should sort by the path-hash', function() 
        {       
            let testMap = new Map();
            testMap.set("test/aaa.bin", 42);
            testMap.set("test/ccc.bin", 43);
            testMap.set("test/bbb.bin", 44);

            const creator = new Creator(new SARC());
            const sortedMap = creator._sortEntries(testMap);

            expect([...sortedMap]).deep.equal([ 
                ['test/bbb.bin', 44],
                ['test/aaa.bin', 42],
                ['test/ccc.bin', 43]
            ]);

        });
    });


    describe('real file tests', () =>
    { 
        if(fs.existsSync("./config.json"))
        {
            const config = JSON.parse(fs.readFileSync("./config.json"));

            it('parse and re-create real file', async () =>
            {   
                let sarcBuffer = fs.readFileSync(config.game.path + "/content/Pack/Dungeon005.pack");

                let sarc = new SARC();
                const parser = new Parser(sarc);
                parser.parse(sarcBuffer);

                expect(sarc.create()).deep.equal(sarcBuffer);    
            });
        }else{
            console.log("NOTICE: tests skipped because the 'config.json' is missing");
        }
    });

});
