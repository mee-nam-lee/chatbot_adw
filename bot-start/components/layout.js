'use strict';
const { MessageModel } = require('@oracle/bots-node-sdk/lib');
const { messageModelUtil } = require('@oracle/bots-node-sdk/util');

module.exports = {
  metadata: () => ({
    name: 'layout',
    properties: {
    },
    supportedActions: ["order"]
  }),
  invoke: (conversation, done) => {
    console.log(conversation.postback());

    if (conversation.postback().action == "order") {
      let postbackpayload = conversation.postback();
      console.log(postbackpayload.action);
      conversation.transition("order");
      done(); 

    } else {
        // Common Message Model - Text 이용 예
        var messageModel = conversation.MessageModel();
        var textActions = [];
        var textResp = messageModel.textConversationMessage("텍스트 메시지 입니다.",textActions);

        conversation.reply(textResp);

        // Common Message Model - Card 이용 예 
        var pbActions = [];

        var postback = {
          "action": "order",
        };

        var pbAction1 =  messageModel.postbackActionObject("지금 주문", '', postback);

        pbActions.push(pbAction1);

        var card1 = messageModel.cardObject("치즈피자", 
                                            "모짜렐라 치즈와 이탈리안 소스를 토핑한 클래식 피자", 
                                            "https://cdn.pixabay.com/photo/2017/09/03/10/35/pizza-2709845__340.jpg", '', pbActions);

        var card2 = messageModel.cardObject("페파로니피자", 
                                            "모짜렐라 치즈와 이탈리안 소스를 토핑한 클래식 피자고전 스타일의 페파로니와 클래식 마리나라 소스를 토핑한 피자", 
                                            "https://cdn.pixabay.com/photo/2017/08/02/12/38/pepperoni-2571392__340.jpg", '', pbActions);                                            
        var cards = [];
        cards.push(card1);
        cards.push(card2);

        var cardResp = messageModel.cardConversationMessage("horizontal",cards);

        conversation.reply(cardResp);
        done();
  }
}
};
