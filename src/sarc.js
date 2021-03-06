/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs-extra');
const path = require("path");
const Binary_File  = require('binary-file');

const Model  = require("./entry.js");
const Parser = require("./parser.js");
const Creator = require("./creator.js");
const DirScanner = require("./dirScanner.js");

module.exports = class SARC
{
    constructor()
    {
        this.entries = new Map();
        this.fileLoader = new Binary_File.Loader();
        this.SUFFIX_UNPACKED = ".unpacked";
    }

    addFile(name, data)
    {
        name = name.replace(/\\+/g, "/");
        this.entries.set(name, (new Model(name, data)));
    }

    getFile(name)
    {
        if(this.entries.has(name))
            return this.entries.get(name).getData();

        return null;
    }

    parse(pathOrBuffer)
    {
        const parser = new Parser(this);
        parser.parse(pathOrBuffer);
    }

    create()
    {
        const creator = new Creator(this);
        return creator.create();
    }

    async save(sarcPath)
    {
        await fs.writeFile(sarcPath, this.create());
    }

    async fromDirectory(dirPath, recursive = true, useYaz0 = true)
    {
        const dirScanner = new DirScanner(this, dirPath, recursive, useYaz0);
        return dirScanner.scan(dirPath);
    }

    async extractFiles(outputPath, recursive = false)
    {
        let promises = [];
        for(let [,entry] of this.entries)
        {
            promises.push(new Promise(resolve => 
            {
                const fullPath = path.join(outputPath, entry.name);
                fs.ensureFile(fullPath).then(() => 
                {
                    fs.writeFile(fullPath, entry.data).then(async () => 
                    {
                        if(recursive)
                            await this._extractSubFile(fullPath, entry);

                        resolve(fullPath);
                    });
                });
            }));
        }
        return await Promise.all(promises);
    }

    async _extractSubFile(fullPath, entry)
    {
        try{
            let magic = this.fileLoader.getMagic(entry.data);
            if(magic == "SARC")
            {
                let sarc = new SARC();
                sarc.parse(this.fileLoader.buffer(entry.data));
                await sarc.extractFiles(path.join(fullPath + this.SUFFIX_UNPACKED), true);
            }
        }catch(e)
        {
            console.log(e);
            console.warn("SARC: error converting file: " + fullPath);
        }

        return fullPath;
    }

};