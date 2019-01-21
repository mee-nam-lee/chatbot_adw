'use strict';

var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

async function getADW() {
  return new Promise(async function(resolve, reject) {
    let conn;

    try {
      conn = await oracledb.getConnection({
        user          : dbConfig.user,
        password      : dbConfig.password,
        connectString : dbConfig.connectString
      });

// ADW Sample Sales History 조회 SQL
      let sqlstring = 'SELECT channel_desc, TO_CHAR(SUM(amount_sold),\'9,999,999,999\') SALES$, \
                              RANK() OVER (ORDER BY SUM(amount_sold)) AS default_rank, \
                              RANK() OVER (ORDER BY SUM(amount_sold) DESC NULLS LAST) AS custom_rank \
                       FROM sh.sales, sh.products, sh.customers, sh.times, sh.channels, sh.countries \
                       WHERE sales.prod_id=products.prod_id AND sales.cust_id=customers.cust_id \
                           AND customers.country_id = countries.country_id AND sales.time_id=times.time_id \
                           AND sales.channel_id=channels.channel_id \
                           AND times.calendar_month_desc IN (\'2000-09\', \'2000-10\') \
                           AND country_iso_code=\'US\' \
                       GROUP BY channel_desc';

      let result = await conn.execute(
          sqlstring 
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

    conversation.reply(`안녕하세요 Autonomous Data Warehouse에서 매출 현황 조회를 시작합니다.`)

    try {
    getADW()
      .then(function(result){
        for (var i=0 ; i < result.length ; i++) {
        conversation
        .reply(`매출 현황을 조회하였습니다. 채널 : ${result[i][0]} 판매금액 : ${result[i][1]} Rank : ${result[i][3]}`);
        }
        conversation.transition();
        console.log('완료');
        console.log(result);
        done();
      },function(err){
        conversation
        .reply('ADW 조회에서 오류가 발생했습니다.' + err)
        .transition();
        console.error(err);
        console.log('에러');
        done();
      })
      .catch(function(reason){  
        conversation
        .reply('ADW 조회에서 오류가 발생했습니다.' + reason)   
        .transition();          
        console.log(reason);
        done();
      })

    } catch (err) {
      conversation
      .reply('Component에서 오류가 발생했습니다.' + err)
      .transition();
      done();
    }

  }
};
