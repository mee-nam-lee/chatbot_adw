'use strict';

var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

async function getCountry(countryid) {
  return new Promise(async function(resolve, reject) {
    let conn;

    try {
      conn = await oracledb.getConnection({
        user          : dbConfig.user,
        password      : dbConfig.password,
        connectString : dbConfig.connectString
      });

      let result = await conn.execute(
        `select country_id, country_name, country_region from countries WHERE country_id = :bv`,
        [countryid]
      );

      resolve(result.rows);

    } catch (err) { // catches errors in getConnection and the query
      reject(err);
    } finally {
      if (conn) {   // the conn assignment worked, must release
        try {
          await conn.release();
        } catch (e) {
          console.error(e);
        }
      }
    }
  });
}

module.exports = {
  metadata: () => ({
    name: 'oracledb',
    properties: {
      human: { required: true, type: 'string' },
    },
    supportedActions: ['weekday', 'weekend']
  }),

  invoke: (conversation, done) => {

    // perform conversation tasks.
    const { human } = conversation.properties();


    conversation.reply(`Greetings ${human}`)

    try {

    getCountry(52771)
      .then(function(result){
        conversation.reply(`ADWC의 COUNTRY 테이블에서 나라 정보를 조회하였습니다. country id : ${result[0][0]} country name : ${result[0][1]}`);
        conversation.transition();
        console.log('완료');
        console.log(result);
        done();
      },function(err){
        conversation.reply('오류가 발생했습니다');
        conversation.transition();
        console.error(err);
        console.log('에러');
        done();
      })
      .catch(function(reason){  
        conversation.reply('오류가 발생했습니다');   
        conversation.transition();          
        console.log(reason);
        done();
      })

    } catch (err) {
      conversation.reply('오류가 발생했습니다');
      conversation.transition();  
      done();
    }
  }
};
