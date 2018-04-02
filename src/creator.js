/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs-extra');
const Binary_File  = require('binary-file');
const hash = require("./stringHash").hash;

module.exports = class Creator
{
    constructor(sarc)
    {
        this.OFFSET_ENTRIES = 0x20;
        this.ENTRY_SIZE = 0x10;

        this.sarc = sarc;
        this.headerStructure = JSON.parse(fs.readFileSync(__dirname + "/header.json"));
        delete this.headerStructure.sfat;

        this.fileNames = new Map();
        this.dataOffset = 0;
        this.stringTableOffset = 0;
        this.fileSize = 0;
        this.stringOffsets = {};

        this.fileCreator = new Binary_File.Creator();
        this.file = this.fileCreator.file;
    }

    _sortEntries(entries)
    {
        return new Map([...entries].sort((a,b) => {
            return hash(a[0]) > hash(b[0]);
        }));
    }

    _writeStringTable()
    {
        this.file.writeString("SFNT");
        this.file.write("u8", 0x8);
        this.file.write("u16",  0);

        this.stringTableOffset = this.file.pos();

        for(let [,entry] of this.sortedEntries)
        {
            this.stringOffsets[entry.name] = this.file.pos();
            this.file.writeString(entry.name);
            this.file.alignTo(4);
        }
    }

    _writeDataTable()
    {
        let i=0;
        for(let [,entry] of this.sortedEntries)
        {
            entry.offset = this.file.pos();

            this.file.writeBuffer(entry.data);

            if(++i < this.sortedEntries.size)
                this.file.alignTo(4);
        }
    }

    _writeEntries()
    {
        for(let [,entry] of this.sortedEntries)
        {
            let relativeOffset = entry.offset - this.dataOffset;
            let nameOffset = (this.stringOffsets[entry.name] - this.stringTableOffset) / 4;

            this.file.write("u32", parseInt(hash(entry.name), 16));
            this.file.write("u16", 0x0100);
            this.file.write("u16", nameOffset);

            this.file.write("u32", relativeOffset);
            this.file.write("u32", relativeOffset + entry.data.length);
        }
    }

    _writeHeaders()
    {
        this.fileCreator.write(this.headerStructure, {
            fileSize  : this.fileSize,
            dataOffset: this.dataOffset
        });

        this.file.writeString("SFAT");
        this.file.write("u8", 0xC);
        this.file.write("u16", this.sortedEntries.size);
        this.file.write("u32", 0x65);
    }

    create()
    {
        this.file.setEndian("big");
        this.sortedEntries = this._sortEntries(this.sarc.entries);

        const stringNodeOffset = this.OFFSET_ENTRIES + (this.sortedEntries.size * this.ENTRY_SIZE);

        this.file.pos(stringNodeOffset);
        this._writeStringTable();

        this.dataOffset = this.file.pos();
        this._writeDataTable();

        this.fileSize = this.file.pos();

        this.file.pos(this.OFFSET_ENTRIES);
        this._writeEntries();

        this.file.pos(0);
        this._writeHeaders();

        return this.file.getBuffer();
    }
};
