/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const hash = require("./stringHash.js").hash;

module.exports = class Entry
{
    constructor(name = "", data = null)
    {
        this.name = name;
        this.data = data;
        this.offset = 0;
    }

    getNameHash(multi)
    {
        return hash(this.name, multi);
    }

    getData()
    {
        return this.data;
    }
};