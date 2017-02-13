var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
console.log("starting");
var config = require('./config')

processFile = function(fn) {
	var connection = mysql.createConnection(config);
	connection.connect(function(err, con) {
		console.log("connection error: "+err );
	});

	var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos, k = 0, rws=0,
		b = "";
	var fcnt = 0;
	var nm = fn;
	var fna = fn.split(".");
	fna = fna[0].split("_");
	var yr="20"+fn.substring(2,4);
	//test to see if rc data already in there...
	connection.query("select count(*) cnt from isbe_rc where yrending="+yr, function(err, rows, fields){
		if(rows.length>0&&rows[0].cnt>1){
			//then we skip this file...
			console.log("There are already "+rows[0].cnt+" records for this year: "+yr+".  Skipping file.");
			connection.end();
			return;
		}
		//get params for yr...
		connection.query("select * from isbe_rc_layout where yr="+yr+" and dbfield!='' and dbfield is not null order by rownum", function(err, rows, fields){
			// pull together list of fields...
			console.log(yr+": "+rows.length);
			var fld=[];
			var fldnms="";
			for(var i=0;i<rows.length;i++){
				fld.push({n:rows[i].dbfield.trim(), s:(parseInt(rows[i].dstart)-1), e:(parseInt(rows[i].dend)-1), t:rows[i].dtype.substring(0,1), r:(parseInt(rows[i].rownum)-1)});
				fldnms+=rows[i].dbfield+", "
			}
			BUF_LENGTH = 128 * 1024;
			buff = new Buffer(BUF_LENGTH);
			fdr = fs.openSync(fpth + "/" + fn, "r");
			bytesRead = 1;
			pos = 0;
			var processChunk=function(err){
				if(err) console.log(err);
				if (bytesRead > 0) {
					bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
					var chunk = buff.toString().substring(0,bytesRead);// on last loop need to limit to bytesRead to avoid picking up loeftover data in buff...
					var qsep = "";
					//id, rownum, dtest, dgroup, drange, dlen, dbfield, isbefield, dtype, dstart, dend, yr, isbefieldmisc
					var q = "insert into isbe_rc ("+fldnms+" yrending,cdts) values ";
					//console.log(k + ': got %d bytes of data', chunk.length);
					b += chunk;
					var ba = b.split("\n");
					//console.log("rows loaded in chunk: "+ba.length);
					if(bytesRead>0) b = ba.pop(); //if there is more to read, need to assume this is an incomplete line to be processed next loop...
					//if (fcnt == 0) fcnt = ba[0].length;
					for (var j = 0; j < ba.length; j++) { //get rows...
						var d=ba[j];
						var cdts="";
						var da=d.split(";");
	//console.log(d.substring(0,100))
						var qvals = "",	qvsep = "";
						var errmsg="";
						for(var m=0;m<fld.length;m++){
							var f=fld[m];
							var v="";
							if(d.length>f.e) v=d.substring(f.s, f.e).trim();
							else {
								errmsg="Field:  "+f.n+", Start:  "+f.s+", Bad input: "+d;
								break;
							}
							if(f.t=="F") v=v.length>0?v:'null';
							else if(f.t=="C"||f.t=="D") v=v.length>0?v.replace("$","").replace(/,/g,""):'null';
							else  {
 								if(f.n.toLowerCase()=="rcdts") cdts=v.substring(2);
 								v="'"+v.replace(/'/g,"''")+"'";
							}
							//console.log(f.n+":"+f.r+":"+f.t+"|"+v+"|"+da[f.r]+"|"+cdts);
							qvals+=qvsep+v;
							//if(da.length>f.r) qvals+="|"+"'"+da[f.r]+"'"+"|"+f.r;
							qvsep=", ";
						}
						if(errmsg==""){
							q+=qsep+"("+qvals+","+yr+", 'x"+cdts+"')";
							qsep=", ";
						}
						else console.log(errmsg);

					}

					//if (k < 2) console.log(k + ":" + q);
					rws+=j;
					//console.log("inserting "+j+" rows of "+rws);
					process.stdout.write(".");
					//console.log(q)
					connection.query(q,processChunk);
					k++;
					pos += bytesRead;
				}
				else {
					console.log(fn+":"+k+" chunks, "+rws+" rows");
					fs.closeSync(fdr);
					connection.end();
				}

			};//end processChunk...
			processChunk();

		})//end second query getting field names, positions...

	})//end first query testing if we need to get data...



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

var fpth = "/Users/droarty/pnet/rc_data_and_scripts";
var fls = fs.readdirSync(fpth)
for (var i = 0; i < fls.length; i++) {
	console.log(fls[i]);
	var fla = fls[i].split(".");
	if (fla.length > 1 && fla[1] == "txt") {
		var pa = fla[0];
		//	console.log(pa.join("."));
		if (pa.substring(0,2)=="rc") {
			processFile(fls[i]);
			console.log("processing:" + fls[i]);
		}
	}
}

//connection.end();


//}).listen(8124);

//console.log('Server running at http://127.0.0.1:8124/');
