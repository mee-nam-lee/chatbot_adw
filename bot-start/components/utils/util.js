
const request = require('request');
const querystring = require("querystring");

var baseForAPI = "https://[CECS CLOUD DOMAIN]/documents/api/1.2";

var auth = 'Basic ' + Buffer.from('[USERID]:[PASSWORD]').toString('base64');


    exports.callCECSAPI = function (path, queryString, RESTMethod, BODY){
        var generatedUrl = baseForAPI + path;

        if(queryString == " ")  {
            generatedUrl += "?" + querystring.stringify({fulltext:""});
            console.log(generatedUrl);
        }        
        else if(queryString != "")   {

            generatedUrl += "?" + querystring.stringify({fulltext:queryString});
            console.log(generatedUrl);
        }

        var opts;
        if(BODY == "")  {
            opts = {
                url: generatedUrl,
                timeout:30000,
                method: RESTMethod,
                headers: {
                    'Authorization': auth,
                    'Content-Type' : 'application/json'
                }
            }
        }
        else{
            opts = {
                url: generatedUrl,
                timeout:5000,
                method: RESTMethod,
                headers: {
                    'Authorization': auth,
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(BODY)
            }
        }


        return new Promise(function(resolve, reject) {

            request(opts,function(error,response,body){
                if (error) {
                    console.log(error);
                    reject();
                } else {

                    console.log("statusCode : " + response.statusCode);
                    console.log("RESULT BODY : " + body);                

                    switch (response.statusCode) {  
                    case 200:
                        console.log("RESPONSE : " + JSON.stringify(body));
                        resolve(body);
                        break;
                    case 409:
                        console.log("This is 409 but consider as success");
                        resolve(body);
                        break;                    
                    default:
                        console.log("ERROR on PATH : " + JSON.stringify(path));
                        console.log("ERROR on querystring : " + JSON.stringify(queryString));
                        console.log("ERROR on opts : " + JSON.stringify(opts));
                        reject();
                        break;
                    }
                }
            });
        });

    }