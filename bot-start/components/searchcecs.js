"use strict"
const util = require("./utils/util");
const { MessageModel } = require('@oracle/bots-node-sdk/lib');

const publink = "https://[CECS DOMAIN]/documents/link/"
const searchapi = "/folders/search/items";
const publicfilelinkapi ="/publiclinks/file/";
const publicfolderlinkapi ="/publiclinks/folder/";

    module.exports = {

        metadata: () => ({
            "name": "searchcecs",
            "properties": {
                "keyword": { "type": "string", "required": true },            
            },
            "supportedActions": [
            ]
        }),
        invoke: (conversation, done) => {
           var keyword = conversation.properties().keyword;
           console.log("keyword    " + keyword);

           var messageModel = conversation.MessageModel();
        
           // keyword로 컨텐츠 검색하는 REST API 호출
           util.callCECSAPI(searchapi, keyword, 'GET', "")
                .then(function(searchResult){  
                var searchResultObj = JSON.parse(searchResult);
                var fileNameMap = new Map();

                // 검색 결과가 많으면 4개 까지만 보여주기
                var maxCount = (searchResultObj.count > 4 ? 4 : searchResultObj.count);

                if(maxCount == 0) {
                    conversation.reply('검색 결과가 없습니다.');
                    conversation.transition();
                    done();
                }

                var linkcount = 0;

                // 검색된 컨텐츠의 ID로 Publiclink 가져오기 위한 로직
                for(var i = 0 ; i < maxCount; i++ ){

                    var item = searchResultObj.items[i];
                    fileNameMap.set(item.id,  item.name + " [v." + item.version + "] " + "[ " + item.type + " ]" );     

                    var publiclinkapi = publicfilelinkapi;

                    if (item.type == "folder" ){
                        publiclinkapi = publicfolderlinkapi;
                    } 

                    // Publiclink 가져오는 REST API 호출
                    util.callCECSAPI(publiclinkapi + item.id, "", 'GET', "")
                    .then(function(publicLinkResult){
                    linkcount ++ ;
                    var publicLinkResultObj = JSON.parse(publicLinkResult);
                    
                    var viewlink ="/fileview/";
                    if (publicLinkResultObj.type == "folder" ){
                        viewlink = "/folder/";
                    } 

                    // 챗봇에 보여줄 버튼(URL) 부분의 Payload
                    var actions = [];
                    if (publicLinkResultObj.count == 0 ) {
                        actions = [
                                {
                                    "label" : "퍼블릭 링크 없음",
                                    "type" : "url",
                                    "url" : ""
                                }
                            ];
                    } else {
                        actions = [
                                {
                                    "label" : "문서/폴더 링크 열기",
                                    "type" : "url",
                                    "url" : publink + publicLinkResultObj.items[0].linkID + viewlink + publicLinkResultObj.id
                                }
                            ];
                    }
                    // 챗봇의 TEXT 메시지 만들기            
                    var textResp = messageModel.textConversationMessage(fileNameMap.get(publicLinkResultObj.id), actions);
                    conversation.reply(textResp);

                    // 마지막 컨텐츠까지 다 Reply 되었으면 컴포넌트 로직 종료후 챗봇의 Dialogue Flow 제어권 넘기기  
                    if (linkcount == maxCount) {
                        conversation.transition();
                        done();                      
                    } 
        
                    },function(err) {
                                conversation.reply("파일 링크를 찾다가 에러가 생겼습니다." + err);
                                conversation.transition();
                                done();
                            }
                    )      
                    .catch(function(reason){  
                        conversation
                        .reply('PublicLink 조회에서 오류가 발생했습니다.' + reason)   
                        .transition();          
                        console.log(reason);
                        done();
                    })
                 
                }  // for loop
            },function(err) {
                conversation.reply('파일의 링크를 생성하다가 에러가 생겼습니다. ' + err);
                conversation.transition();
                done();
            })
            .catch(function(reason){  
                conversation
                .reply('파일 검색에서 발생했습니다.' + reason)   
                .transition();          
                console.log(reason);
                done();
            })          
        }
    };
