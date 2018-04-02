/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const int32 = require('int32');

const DEFAULT_MULTI = 0x65;

module.exports = class StringHash
{
    static hash(str, multi = DEFAULT_MULTI)
    {
        var hash = new int32.from(0);
        for(let c of str)
        {
            hash.multiply(multi).add(c.charCodeAt(0));
        }

        return StringHash.toHex(hash.getValue());
    }

    static toHex(val)
    {
        let buff = Buffer.alloc(4);
        buff.writeInt32BE(val);
        return buff.toString("hex").padStart(8, "0");
    }
};