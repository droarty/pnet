var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
console.log("boo");
var config = require('./config')

processFile = function(fn) {
	var connection = mysql.createConnection(config);
	connection.connect(function(err, con) {
		console.log(err + " connection for " + nm+":");
	});
	var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos, k = 0, rws=0,q="",
		b = "";
	var nm = fn;
	var fna = fn.split(".");
	fna = fna[0].split("_");
	var yr= fna[0];
	var test=fna[1];
	var site=fna[3];
	BUF_LENGTH = 64 * 1024;
	buff = new Buffer(BUF_LENGTH);
	fdr = fs.openSync(fpth + "/" + fn, "r");
	bytesRead = 1;
	pos = 0;
	//test to see if we already processed this data...
	var q1 = "select count(*) cnt from parccdetails where year="+yr;
	connection.query(q1, function(err, rows, fields){
		if(err||!rows||(rows.length>0&&parseInt(rows[0].cnt)>0)){
			//then we skip this file...
			if(err) console.log("Error in query: "+err+":"+yr+":"+test+":"+site);
			else console.log("There are already "+rows[0].cnt+" records for this year: "+yr+".  Skipping file "+fn);
			connection.end();
			return;
		};
		var q0="insert into parccdetails (year, RCDTS, gradeLevel, sex, eth, IEP, stlep, migrant, freeLunch, ptest, ptestcode, ptestlevel, pscore, plevel) values ";
		var flda = ("RCDTS,Grade,Gender,Race,IEP,LEP,Migrant,Free/Reduce Lunch,chrPARCCTestCode, Scale Score, Performance Level").split(",");
		var processChunk=function(err){
			if(err) console.log(err+"\n\n"+q);
			process.stdout.write("_");
			q = "";
			if (bytesRead > 0) {
				//buff.fill(" ");
				bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
				var chunk = buff.toString().substring(0,bytesRead);
				var qsep = "";
				q=q0;
				//console.log(k + ': got %d bytes of data', chunk.length);
				b += chunk;
				var ba = b.split("\n");
				if(bytesRead>0) b = ba.pop(); //if there is more to read, need to assume this is an incomplete line to be processed next loop...
				else b="";
				for (var j = 0; j < ba.length; j++) { //get rows...
					var fa = ba[j].trim().split(",");
					if (fa.length>flda.length-1) {
						var qvals = "'" + yr+ "', ",
							qvsep = "";
						for (m = 0; m < flda.length; m++) { //get fields....
							if(flda[m] == 'chrPARCCTestCode') {
								if(fa[m]=="") qvals += qvsep + "null, null, null";
								else qvals += qvsep + "'" + fa[m] + "', '" + fa[m].substring(0,3) + "', '" + fa[m].substring(3) + "'";
								qvsep = ", ";
							}
							else if(flda[m]!="skip"){
								if(fa[m]=="") qvals += qvsep + "null";
								else qvals += qvsep + "'" + fa[m] + "'";
								qvsep = ", ";
							}
						}
						q += qsep + "(" + qvals + ")";
						qsep = ",";
					}
					else console.log( "bad row("+rws+") in "+fn+": "+fa);
					//console.log(nm + " length=" + ba[0].split(",").length);
				}

				//if (k < 2) console.log(k + ":" + q);
				rws+=j;
				//console.log("inserting "+j+" rows of "+rws);
				process.stdout.write(".");
				// console.log("\n\n");
				// console.log(q);
				if(q.length > q0.length) connection.query(q,processChunk);
				k++;
				pos += bytesRead;
			}//
			else {
				console.log(fn+":"+k+" chunks, "+rws+" rows");
				fs.closeSync(fdr);
				connection.end();
			}
		};//end processChunk...
		processChunk();

	});//end test for existing yr data...
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


var fpth = "2016Data";
var fls = fs.readdirSync(fpth)
for (var i = 0; i < fls.length; i++) {
	console.log(fls[i]);
	var fla = fls[i].split(".");
	if (fla.length > 1 && fla[1] == "txt") {
		var pa = fla[0].split("_");
		//	console.log(pa.join("."));
		if (pa[3]=="suppress") {
			console.log("processing:" + fls[i]);
			processFile(fls[i]);
		}
	}
}

//connection.end();


//}).listen(8124);

//console.log('Server running at http://127.0.0.1:8124/');
