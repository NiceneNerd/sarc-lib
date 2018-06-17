/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Overflow = require("overflow-js").Overflow;

const DEFAULT_MULTI = 0x65;

module.exports = class StringHash
{
    static hash(str, multi = DEFAULT_MULTI)
    {
        let hashValue = new Overflow.uint();
        for(let c of str)
        {
            hashValue = hashValue.times(multi).plus(c.charCodeAt(0));
        }

        return StringHash.toHex(hashValue.value);
    }

    static toHex(val)
    {
        val = (new Overflow.uint(val)).value;
        
        let buff = Buffer.alloc(4);
        buff.writeUInt32BE(val);
        return buff.toString("hex").padStart(8, "0");
    }
};