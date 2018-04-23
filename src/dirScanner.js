/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs-extra');
const path = require("path");
const yaz0 = require("yaz0-lib");

module.exports = class DirScanner
{
    constructor(sarc, basePath, recursive, useYaz0)
    {
        this.SARC = require("./sarc.js");

        this.recursive = recursive;
        this.useYaz0 = useYaz0;
        this.sarc = sarc;
        this.basePath = path.resolve(basePath);

    }

    async scan(dirPath)
    {
        dirPath = path.resolve(dirPath);
        const fileList = await fs.readdir(dirPath);

        for(let fileName of fileList)
        {
            if(fileName.endsWith(this.sarc.SUFFIX_UNPACKED))
                continue;

            const fullPath = path.resolve(dirPath, fileName);
            const relativePath = fullPath.substr(this.basePath.length+1);

            if(this.recursive && fileList.includes(fileName + this.sarc.SUFFIX_UNPACKED))
            {
                const subSarc = new this.SARC();
                await subSarc.fromDirectory(fullPath + this.sarc.SUFFIX_UNPACKED);
                this.sarc.addFile(relativePath, this.useYaz0 ? yaz0.encode(subSarc.create()) : subSarc.create());
            }else{
                if((await fs.lstat(fullPath)).isDirectory())
                {
                    await this.scan(fullPath);
                }else{
                    this.sarc.addFile(relativePath, await fs.readFile(fullPath));
                }
            }
        }
    }

};