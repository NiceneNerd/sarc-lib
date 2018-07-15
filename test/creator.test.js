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

        it('hash starting with zero', function() 
        {       
            let testMap = new Map();
            testMap.set("Physics/StaticCompound/CDungeon/Dungeon001.shksc", 42);
            testMap.set("Actor/Pack/DgnMrgPrt_Dungeon001.sbactorpack", 43);
            testMap.set("Map/SetData/Set_Mukao_Dungeon001/Set_Mukao_Dungeon001.smubin", 44);
            testMap.set("Map/CDungeon/Dungeon001/Dungeon001_Dynamic.smubin", 45);
            testMap.set("Map/DungeonData/CDungeon/Dungeon001.bdgnenv", 46);
            testMap.set("Model/DgnMrgPrt_Dungeon001.Tex2.sbfres", 47);
            testMap.set("Map/CDungeon/Dungeon001/Dungeon001_TeraTree.sblwp", 48);
            testMap.set("NavMesh/CDungeon/Dungeon001/Dungeon001.shknm2", 49);
            testMap.set("Map/CDungeon/Dungeon001/Dungeon001_Clustering.sblwp", 50);
            testMap.set("Model/DgnMrgPrt_Dungeon001.sbfres", 51);
            testMap.set("Map/CDungeon/Dungeon001/Dungeon001_Static.smubin", 51);

            const creator = new Creator(new SARC());
            const sortedMap = creator._sortEntries(testMap);

            expect([...sortedMap]).deep.equal([ 
                ["Physics/StaticCompound/CDungeon/Dungeon001.shksc", 42],
                ["Actor/Pack/DgnMrgPrt_Dungeon001.sbactorpack", 43],
                ["Map/SetData/Set_Mukao_Dungeon001/Set_Mukao_Dungeon001.smubin", 44],
                ["Map/CDungeon/Dungeon001/Dungeon001_Dynamic.smubin", 45],
                ["Map/DungeonData/CDungeon/Dungeon001.bdgnenv", 46],
                ["Model/DgnMrgPrt_Dungeon001.Tex2.sbfres", 47],
                ["Map/CDungeon/Dungeon001/Dungeon001_TeraTree.sblwp", 48],
                ["NavMesh/CDungeon/Dungeon001/Dungeon001.shknm2", 49],
                ["Map/CDungeon/Dungeon001/Dungeon001_Clustering.sblwp", 50],
                ["Model/DgnMrgPrt_Dungeon001.sbfres", 51],
                ["Map/CDungeon/Dungeon001/Dungeon001_Static.smubin", 51],
            ]);
        });
    });


    describe('real file tests', () =>
    { 
        if(fs.existsSync("./config.json"))
        {
            const config = JSON.parse(fs.readFileSync(__dirname + "/../config.json"));

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
