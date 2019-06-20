"use strict";

//const moment = require('moment');
const DATA_ROOT = './data/';

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

const STORES_BASE = {
};
const STORE_BASE = {
};


const STORES = Object.assign(require(DATA_ROOT + 'stores.json'), STORES_BASE);

module.exports = {
    stores: (filter) => {
        var results = STORES;
        if (filter && filter.location) {
            results = {};
            for (var storeId in STORES) {
                var store = STORES[storeId];
                if (store.address.toUpperCase().indexOf(filter.location.toUpperCase()) !== -1) {
                    results[storeId] = store;
                }
            }
        }
        return results;
    },

};
