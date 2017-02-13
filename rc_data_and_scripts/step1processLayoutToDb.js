var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
var config = require('./config')

console.log("This is the first step in processing rc files.  To prepare, open a layout file, save it as .csv in this directory, then run this script again.\n Next run step 2, it should find any columns that you want based on the 2014 selections.  If you want to base the selections on a newer year, just edit the step 2 script.  Selections are made when there is a column name from mysql database table isbe_rc (add a new one if you want) that is stored in a mysql database table isbe_rc_layout record in the column named dbfield.  The step 2 script will find any other years with this field set... \nNext drop the rcxx.txt data in this folder and run step 3");

processFile = function(fn) {
	var connection = mysql.createConnection(config);
	connection.connect(function(err, con) {
		console.log("connection error: "+err );
	});

	var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos, k = 0,
		b = "";
	var fcnt = 0;
	var nm = fn;
	var fna = fn.split(".");
	fna = fna[0].split("_");
	var yr="20"+fn.substring(2,4);
	connection.query("select count(*) cnt from isbe_rc_layout where yr="+yr,function(err, rows, fields){
		if(rows.length>0&&parseInt(rows[0].cnt)>1){
			console.log(yr+" is already processed.  Skipping this file.");
			connection.end();
			return;
		}
		BUF_LENGTH = 64 * 1024;//max 64*1024?
		buff = new Buffer(BUF_LENGTH);
		fdr = fs.openSync(fpth + "/" + fn, "r");
		bytesRead = 1;
		pos = 0;
		var processChunk=function(){
			if (bytesRead > 0) {
				bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
				var chunk = buff.toString().substring(0,bytesRead);//need the bytesRead substring on the last loop so you don't pickup leftover data in the buff object ...
				var qsep = "";
				//id, rownum, dtest, dgroup, drange, dlen, dbfield, isbefield, dtype, dstart, dend, yr, isbefieldmisc
				var q = "insert into isbe_rc_layout (rownum, dtest, dgroup, drange, dlen, isbefield, dtype, dstart, dend, dbfield, yr, isbefieldmisc) values ";
				//console.log(k + ': got %d bytes of data', chunk.length);
				b += chunk;
				var ba = b.split("\n");
				if(bytesRead>0) b = ba.pop(); //if there is more to read, need to assume this is an incomplete line to be processed next loop...
				else b="";
				if (fcnt == 0) fcnt = ba[0].length;
				for (var j = 0; j < ba.length; j++) { //get rows...
					var fa = CSVToArray(ba[j])[0];
					if (fa.length>9&&fa[5]) {
						var fld = "rownum, dtest, dgroup, drange, dlen, isbefield, dtype, dstart, dend, dbfield".split(", ")
						var qvals = "",	qvsep = "";
						fa[5]=fa[5].replace("'","''");
						for (m = 0; m<fld.length; m++) { //get fields....
							qvals += qvsep + "'" + fa[m] + "'";
							qvsep = ", ";
						};
						qvals+=qvsep+yr+qvsep+"'"+fa[5]+fa[2]+fa[1]+"'";
						q += qsep + "(" + qvals + ")";
						qsep = ",";
					};
					//console.log(ba[0]);
					//console.log(nm + " length=" + ba[0].split(",").length);
				}

				//if (k < 2) console.log(k + ":" + q);
		console.log("inserting "+j+" rows");
				connection.query(q,processChunk);
				k++;
				pos += bytesRead;
			}
			else {
				console.log(fn+":"+k+" chunks");
				fs.closeSync(fdr);
				connection.end();

			}

		}
		processChunk();

	});//end post query function...

};
 // This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");

	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
	(
	// Delimiters.
	"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

	// Quoted fields.
	"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

	// Standard fields.
	"([^\"\\" + strDelimiter + "\\r\\n]*))"
	),
	"gi"
	);


	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];

	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;


	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){

	// Get the delimiter that was found.
	var strMatchedDelimiter = arrMatches[ 1 ];

	// Check to see if the given delimiter has a length
	// (is not the start of string) and if it matches
	// field delimiter. If id does not, then we know
	// that this delimiter is a row delimiter.
	if (
	strMatchedDelimiter.length &&
	(strMatchedDelimiter != strDelimiter)
	){

	// Since we have reached a new row of data,
	// add an empty row to our data array.
	arrData.push( [] );

	}


	// Now that we have our delimiter out of the way,
	// let's check to see which kind of value we
	// captured (quoted or unquoted).
	if (arrMatches[ 2 ]){

	// We found a quoted value. When we capture
	// this value, unescape any double quotes.
	var strMatchedValue = arrMatches[ 2 ].replace(
	new RegExp( "\"\"", "g" ),
	"\""
	);

	} else {

	// We found a non-quoted value.
	var strMatchedValue = arrMatches[ 3 ];

	}


	// Now that we have our value string, let's add
	// it to the data array.
	arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

	// Return the parsed data.
	return( arrData );
}
	/*
	*/

	/*
	var r = fs.createReadStream(fpth + "/" + fn);
	var b = ""
	var k = 0;
	var fcnt = 0;
	var nm = fn;
	var fna = fn.split(".");
	fna = fna[0].split("_");
	r.on('readable', function() {
		//if (k < 6) console.log(k + ":" + fn);
		var chunk, qsep = "";
		var q = "insert into isbewoschools (yr,test,site,rcdts,grade,gender,race,iep,lep,migrant,frl,reading,math,science,writing,readingl,mathl,sciencel,writingl) values ";
		while (null !== (chunk = r.read())) {
			k++;
			//if (k > 5) continue;
			console.log('got %d bytes of data', chunk.length);
			b += chunk;
			var ba = b.split("\n");
			b = ba[ba.length - 1];
			if (fcnt == 0) fcnt = ba[0].length;
			for (var j = 0; j < ba.length; j++) { //get rows...
				var fa = ba[j].split(",");
				if (true) {
					var fld = "yr,test,site,rcdts,grade,gender,race,iep,lep,migrant,frl,reading,math,science,writing,readingl,mathl,sciencel,writingl"
					//var flda=("RCDTS,Grade,Gender,Race,IEP,LEP,Migrant,Free/Reduce Lunch,Reading Scale Score,Math Scale Score,Science Scale Score,Writing Scale Score,Reading Performance Level,Mathematics Performance Level,Science Performance Level,Writing Performance Level,Reading Standard 1A Vocabulary Development,Reading Standard 1B Reading Strategies,Reading Standard 1C Reading Comprehension,Reading Standards 2A, 2B Literature,Mathematics Goal 6 Number Sense ,Mathematics Goal 7 Measurement,Mathematics Goal 8 Algebra,Mathematics Goal 9 Geometry,Mathematics Goal 10 Data Analysis, Statistics, and Probability,Reading National Percentile Rank,Math National Percentile Rank,Science National Percentile Rank").split(",");
					var flda = ("RCDTS,Grade,Gender,Race,IEP,LEP,Migrant,Free/Reduce Lunch,Reading Scale Score,Math Scale Score,Science Scale Score,Writing Scale Score,Reading Performance Level,Mathematics Performance Level,Science Performance Level,Writing Performance Level,ACT Reading Score,ACT Math Score,ACT Science Score,ACT English Score,ACT Writing Score,ACT Composite Score").split(",");
					var qvals = "'" + fna[0] + "', '" + fna[1] + "', '" + fna[3] + "', ",
						qvsep = "";
					for (m = 0; m < 16; m++) { //get fields....
						qvals += qvsep + "'" + fa[m] + "'";
						qvsep = ", ";
					}
					q += qsep + "(" + qvals + ")";
					qsep = ",";
				};
				//console.log(ba[0]);
				//console.log(nm + " length=" + ba[0].split(",").length);
			}
			console.log(nm + ":" + k);
			var connection = mysql.createConnection({
				host: '192.168.56.1',
				port: '3306',
				user: 'root',
				password: 'droarty'
			});
			connection.connect(function(err, con) {
				console.log(err + " connection for " + nm);
			});

			connection.query(q);
			connection.end();


		};
	});
*/

var fpth = "/Users/droarty/pnet/rc_data_and_scripts";
var fls = fs.readdirSync(fpth)
for (var i = 0; i < fls.length; i++) {
	console.log(fls[i]);
	var fla = fls[i].split(".");
	if (fla.length > 1 && fla[1] == "csv") {
		var pa = fla[0].split("_");
		//	console.log(pa.join("."));
		if (pa.length>1&&pa[1]=="layout") {
			processFile(fls[i]);
			console.log("processing:" + fls[i]);
		}
	}
}

//connection.end();


//}).listen(8124);

//console.log('Server running at http://127.0.0.1:8124/');
