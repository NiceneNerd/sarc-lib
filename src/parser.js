/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs-extra');
const Binary_File  = require('binary-file');
const stringHash = require("./stringHash");

module.exports = class Parser
{
    constructor(sarc)
    {
        this.sarc = sarc;
        this.fileLoader = new Binary_File.Loader();
        this.headerStructure = JSON.parse(fs.readFileSync(__dirname + "/header.json"));

        this.header = null;
        this.buffer = null;
        this.fileNames = new Map();
    }

    parse(pathOrBuffer)
    {
        this.buffer = this.fileLoader.buffer(pathOrBuffer);
        this.parser = new Binary_File.Parser(this.buffer);
        this.header = this.parser.parse(this.headerStructure); // @TODO handle file flags with diffrent name offset

        const sfat = this.header.sfat;

        for(let name of sfat.fileNames)
            this.fileNames.set(stringHash.hash(name, sfat.hashMulti), name);

        for(let node of sfat.nodes)
        {
            const nameHash = stringHash.toHex(node.fileNameHash);
            if(this.fileNames.has(nameHash))
            {
                const fileName = this.fileNames.get(nameHash);
                const buff = this.createBuffer(node.dataStart, node.dataEnd);
                this.sarc.addFile(fileName, buff);
            }else{
                console.error(`SARC: name-hash not set in the string table: '${nameHash}'`);
            }
        }

        return true;
    }   

    createBuffer(offsetStart, offsetEnd)
    {
        const length = offsetEnd - offsetStart;
        offsetStart += this.header.dataOffset;
        offsetEnd   += this.header.dataOffset;

        let buff = Buffer.alloc(length);
        this.buffer.copy(buff, 0, offsetStart, offsetEnd);

        return buff;
    }
};
