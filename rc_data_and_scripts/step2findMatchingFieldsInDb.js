var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
var config = require('./config')
console.log("starting");
	var connection = mysql.createConnection(config);
	connection.connect(function(err, con) {
		console.log("connection error: "+err );
	});
	connection.query("update  isbe_rc_layout b  inner join (SELECT yr, dbfield, isbefieldmisc  FROM isbe_rc_layout i  where yr=2014 and dbfield is not null and dbfield!='') a  on b.isbefieldmisc=a.isbefieldmisc  set b.dbfield= a.dbfield  where b.yr!=2014 and (b.dbfield='' or b.dbfield is null)"
		,function(){
			// also clean up any duplicate values in table with this query...

			connection.query("delete from isbe_rc_layout where id in (select  mxid from (select yr, rownum, count(*) cnt, max(id) mxid from iamfroa5_isbe.isbe_rc_layout where dbfield!='' and dbfield is not null group by yr, rownum) z where cnt>1)");
			console.log("Updated isbe_rc_layout.   All non 2014 yrs that have a isbefieldmisc that matches a 2014 isbefieldmisc where there is also a dbfield set were updated with that dbfield.")
			connection.end();

		});
