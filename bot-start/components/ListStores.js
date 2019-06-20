"use strict";
const { MessageModel } = require('@oracle/bots-node-sdk/lib');
const { messageModelUtil } = require('@oracle/bots-node-sdk/util');

const StoreService = require('./StoreService');

module.exports = {

    metadata: () => ({
        "name": "ListStores",
        "properties": {
            "location": { "type": "string", "required": true }
        },
        "supportedActions": [
        ]
    }),

    invoke: (conversation, done) => {

      conversation.logger().info('listStores invoked with location=' + conversation.properties().location);      
      var stores = StoreService.stores({location: conversation.properties().location.trim()});
      var count = Object.keys(stores).length;
      console.log(count + ' store searched');

      var messageModel = conversation.MessageModel();
      var cards = [];

      if (count > 0 ){ 
        for (var storeId in stores) {
            let store = stores[storeId];

            var actions = [];

            actions.push(messageModel.urlActionObject("위치 정보 보기", null, 'https://www.google.com/maps/search/?api=1'+'&query='+store.lat+','+store.long));
            actions.push(messageModel.callActionObject("매장 전화 걸기",null, store.phone));
            
//            actions.push(messageModel.urlActionObject("매장 위치 정보 보기", null, 'https://www.google.com/maps/search/?api=1'+'&query='+store.lat+','+store.long));
//            actions.push(messageModel.callActionObject("영업점 바로 전화 걸기",null, store.phone));

            var card = messageModel.cardObject(store.name, store.address + '\n' +store.hours, store.url, '', actions);
            cards.push(card);

        }

        var cardResp = messageModel.cardConversationMessage("horizontal",cards);

        conversation.reply(cardResp);
        conversation.transition();

        done();
    } else {
        conversation.reply("해당 조건의 매장이 검색되지 않았습니다.");
        conversation.transition();
        done();

    }

  }
};
