var express = require('express');
var laptop = require('../data/laptop.json')
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('지원하지 않은 Method 입니다.');  
});


router.post('/', function(req, res, next) {
  var jsonbody = req.body;
  var port = "3000";
  var param1 = "";
  var callbackUrl = "";

  console.log(jsonbody);

  console.log('hostname ' , req.hostname)

  let hasCallback = false;

  if (jsonbody.parameters) {
    jsonbody.parameters.forEach(parameter => {
        if (parameter.key === 'webview.onDone') {
            callbackUrl = parameter.value;
            hasCallback = true;
        }
        if (parameter.key === 'param1') {
          param1 = parameter.value;
        } 
    });
    if (!hasCallback) {
        debugLog('Error: request has no callback url');
        return false;
    }
}
 if (req.hostname.endsWith(".io")) {
   port = "";
 }
 let resbody = {
   "webview.url" : req.protocol + "://" + req.hostname + ":" + port + req.baseUrl + "/booking?callbackUrl=" +callbackUrl + "&param1=" + param1
 };

 res.send(resbody)

});

router.get('/booking', function(req, res, next) {
  let param1 = req.query.param1;
//  let param2 = req.query.param2;
  let callbackUrl = req.query.callbackUrl;

  let searchedresult = [];
  let searchcondition = false;

  console.log("param1 ",param1);
  console.log("callbackUrl", callbackUrl);

  if (param1) {
      console.log('if param1');
      param1 = param1.trim().toUpperCase();

    if (param1 !== "" ) {
      console.log('if param1 not empty');
      for (var i=0; i < laptop.length; i++) {
        if (laptop[i].maker.includes(param1)) {  
          searchedresult.push(laptop[i]);
        }
      }
      searchcondition = true;
    } 
  } 

  if (!searchcondition) {
    res.render('webview', {param1 : "전달된 검색조건이 없습니다. ", callbackUrl : callbackUrl , laptop : laptop });
  } else{
    res.render('webview', {param1 : param1, callbackUrl : callbackUrl , laptop : searchedresult });
  }

});

module.exports = router;
