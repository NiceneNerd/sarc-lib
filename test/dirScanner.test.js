/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const assert = require('assert');
var expect = require('chai').expect;
const fs = require("fs-extra");
const path = require("path");

const Binary_File  = require('binary-file');
const SARC = require("./../src/sarc.js");
const DirScanner = require("./../src/dirScanner.js");
const Parser = require("./../src/parser.js");

const PATH_TEMP = "./test/data/tmp";

async function testSarcPack(config, packName)
{
    const testPackPath = path.join(config.game.path, "content", "Pack", packName);
    const tempPath = path.join(PATH_TEMP, packName);
    const fileLoader = new Binary_File.Loader();

    // get original file listings
    const sarcOrg = new SARC();
    const parserOrg = new Parser(sarcOrg);
    parserOrg.parse(testPackPath);
    await sarcOrg.extractFiles(tempPath, true);

    // re-create file
    const sarcCreate = new SARC();
    const dirScanner = new DirScanner(sarcCreate, tempPath, true, false);
    await dirScanner.scan(tempPath);
    
    const createdBuffer = sarcCreate.create();

    await fs.remove(tempPath);

    // parse re-created file
    const sarcTest = new SARC();
    const parserTest = new Parser(sarcTest);
    parserTest.parse(createdBuffer);

    // same file count
    expect(sarcOrg.entries.size).deep.equal(sarcTest.entries.size);

    // same file names and content
    for(const [,entry] of sarcTest.entries) 
    {
        expect(sarcOrg.entries.has(entry.name)).equal(true);
        
        const testBuffer = fileLoader.buffer(entry.data);
        const orgBuffer = fileLoader.buffer(sarcOrg.getFile(entry.name));

        try{
            expect(orgBuffer.compare(testBuffer)).equal(0);
        } catch(e) {
            throw `Buffer '${entry.name}' is not the same!`;
        }
    }
}

describe('DirScanner', () =>
{
    describe('integration test', function()
    {    
        this.timeout(1000 * 60);

        it('should create the correct file structure', async () =>
        {       
            const sarc = new SARC();
            const dirScanner = new DirScanner(sarc, "./test/data/dirTest", true, false);
            await dirScanner.scan("./test/data/dirTest");

            await sarc.save("./test/data/dirTest.sarc");

            expect([...sarc.entries.keys()]).deep.equal([
                'file1k.bin',
                'sarc',
                'subDir1/subDir2/textSub.txt',
                'textFile.txt'
            ]);
        });

        it('should be identical to the reference file', async () =>
        {       
            const sarc = new SARC();
            const dirScanner = new DirScanner(sarc, "./test/data/dirTest", true, false);
            await dirScanner.scan("./test/data/dirTest");
            
            expect(sarc.create()).deep.equal(fs.readFileSync("./test/data/dirTest.sarc"));
        });

        if(fs.existsSync("./config.json"))
        {
            const config = JSON.parse(fs.readFileSync(__dirname + "/../config.json"));

            for(let i=0; i<120; ++i) {
                const packNum = `${i}`.padStart(3, "0");
                it(`parse and re-create a real file (Dungeon${packNum}.pack)`, async () => await testSarcPack(config, `Dungeon${packNum}.pack`));
            } 

        }else{
            console.log("NOTICE: tests skipped because the 'config.json' is missing");
        }
    });
});
