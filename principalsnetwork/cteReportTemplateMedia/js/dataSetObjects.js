var dataSetObjects=new Object();
//var xerr=boo;
(function(){
	$("html").addClass("js");
	var _dso=dataSetObjects;
	_dso.imageDirectory="/sites/all/modules/custom/cteReportTemplateMedia/images";
    _dso.asInitVals = new Object();
	_dso.tableList=new Array();
	_dso.showDev=false;
	_dso.newTable=function(name){//creates a new datasetobject table...
		_dso.tableList.push(name);
		_dso[name]={
//		  "_dso":_dso,
		  "dsoName":name,
		  "fields":new Array(),
		  "data":new Array(),
		  "objects":new Object(),//used to store graphs and tables created off of this dataset...
		  "details":false,//will be used if any tables are created.  args.detail:true or NAME of first table is used...
		  "parent":false,//pivot tables use this to link to the parent dataset...
/*  data is in the following format.. 
    note that fields are formatted as per the jquery.dataTables module
	var cteReportTemplate=this.dataSetObjects;
	cteReportTemplate.newTable("data1");
cteReportTemplate.data1.fields=[{"sTitle":"CandID","field":"CandID"},{"sTitle":"CandID-orig","field":"CandID-orig"},{"sTitle":"TCID-orig","field":"TCID-orig"}];
cteReportTemplate.data1.data=[];
cteReportTemplate.data1.data[0]=["1","4.00000","4.00000"];

*/
		  "row":function(r){
			  if(r>-1) return this.data[r];
			  else return new Array();
		  },
		  "col":function(c){
			  var ci=this.getFieldIndex(c);
//alert("Getting col:"+c+" #:"+ci);
			  var res=new Array();
			  if(ci>-1) {
				  for(i in this.data){
					  res.push(this.data[i][ci]);
				  };
			  };
			  return res;
		  },
		  "getDataArray":function(aoColumns){
			  if(aoColumns===this.fields){
 // alert("use default columns");
				  return this.data;//return the raw data if the column set is identical to the field set...
			  };
			  var co=[];
			  for(var col in aoColumns){
				  co.push(this.getFieldIndex(aoColumns[col].field));
			  };
			  var r=[];
//alert("orig "+this.fields.length+" columns, changed to "+co.length+" columns");
			  for(var rw in this.data){
				  var newrw=[];
				  for(var c in co){
					  if(co[c]>-1) newrw.push(this.data[rw][co[c]]);
					  else newrw.push('');
				  };
				  r.push(newrw);
			  };
			  return r;
		  },
		  "cols":function(keyArray){//takes an array of column names or key array used in stacked bar graphs
		  		//stacked bar graph array of keys- "keys":[{"colour":"#c4d318", "text":"90% or more African American", "font-size":13, "field":"B90", "match":"B90"}]
			  var ci, c;
			  var res=new Array();
			  for(i in this.data){
				  var resRow=new Array();
				  for(var j=0;j<keyArray.length;j++){
					  c=keyArray[j].field;
					  if(c==undefined||c=="") c=j;
					  ci=this.getFieldIndex(c);
		//alert("Getting col:"+c+" #:"+ci);
					  if(ci>-1) {
							  resRow.push(this.data[i][ci]);
					  }
					  else resRow.push(0);
				  };
				  res.push(resRow);
			  };
//alert(JSON.stringify(res));
			  return res;
		  },
		  "max":function(c){//can be keyArray or field name...
			  var ci=new Array();
			  if(typeof(c)=='object') {
				  for(var i=0;i<c.length;i++){
					  ci.push(this.getFieldIndex(c[i].field));
				  }
			  }
			  else ci.push(this.getFieldIndex(c));
//alert("Getting col:"+c+" #:"+ci);
			  var res=-1000000000000000;
			  for(j in this.data){
				  var rwval=0;
				  for(i=0;i<ci.length;i++) if(ci[i]>-1){
					  var v=parseFloat(this.data[j][ci[i]]);
					  if(!isNaN(v)) rwval+=v;
				  };
				  if(rwval>res) res=rwval;
			  };
			  return res;
		  },
		  "min":function(c){
			  var ci=new Array();
			  if(typeof(c)=='object') {
				  for(var i=0;i<c.length;i++){
					  ci.push(this.getFieldIndex(c[i].field));
				  }
			  }
			  else ci.push(this.getFieldIndex(c));
//alert("Getting col:"+c+" #:"+ci);
			  var res=100000000000000;
			  for(j in this.data){
				  var rwval=0;
				  for(i=0;i<ci.length;i++) if(ci[i]>-1){
					  var v=parseFloat(this.data[j][ci[i]]);
					  if(!isNaN(v)) rwval+=v;
				  };
				  if(rwval<res) res=rwval;
			  };
			  return res;
		  },
		  "getDistinctValues":function(x){
			  //x can be a column index or field name...
			  var res=new Array();
			  if(parseInt(x)+''=='NaN') x=this.getFieldIndex(x);
			  for(var i in this.data){
				  if($.inArray(this.data[i][x],res)==-1) res.push(this.data[i][x]);
			  };
			  if(res.length>3){
				  if(isNaN(parseFloat(res[0]))||isNaN(parseFloat(res[1]))||isNaN(parseFloat(res[2]))){
					  //sort alphabetically...
					  res.sort();
				  }
				  else {
					  //sort numerically
					  res.sort(_dso.sortTypes["numeric-asc"]);
				  };
				  
			  };
			  return res;
		  },
		  "getIndex":function(x,ar){
			  for(var i in ar) if(ar[i]==x) return i;
			  return -1;//no match found...
		  },
		  "getFieldIndex": function(x,aoCol){//find a column index based on a passed or inherited columns object...
			  if(!aoCol) aoCol=this.fields;
			  if(typeof(x)=="string") {
				  var i=0;
				  for(i in aoCol){
					  if(aoCol[i].field.toLowerCase()==x.toLowerCase()) return i;
				  };
			  };
			  if(parseInt(x)+''!='NaN'&&parseInt(x)<aoCol.length) return parseInt(x);
			  return -1;//none found...
		  },
		  "getTitle": function(x){
			  var i=0;
			  for(i in this.fields){
				  if(this.fields[i].field.toLowerCase()==x.toLowerCase()) {
					  if(this.fields[i].sTitle!=undefined) return this.fields[i].sTitle;
					  else return x;
				  };
			  };
			  return -1;//none found...
		  },
		  //returns field data for column based on table column (excludes hidden columns)...
		  "getColumnFromTableIndex":function(i,f){
		        var j=0;
		        var k=0;
		        for(j=0;j<f.length;j++){
		            if(f[j].bVisible){
		                if(i==k) return this.fields[j];
		                k++;
		            };
		        };
		  },
		  "findRowData":function(x,dta){// x is the field name or number. data is the value to match or an array of corresponding row data containing the match field...
		      var rw=this.findRows(x,dta);
		      if(rw.length>0){
		        return this.data[rw[0]];
		      }
		      else return [];
		  },
		  "getValue":function(rw,col){
			  //rw is number or array with filter info
			  //col is number or name
			  if(typeof(rw)=="object") {
				  var rws=this.findRows(rw[0],rw[1]);
				  if(rws.length==0) return '';
				  rw=rws[0];
			  };
			  col=this.getFieldIndex(col);
			  if(col==-1) return '';
			  return this.data[rw][col];
		  },
		  //returns a list of row numbers with matching criteria...
		  "findRows":function(x,dta){// x is the field name or number. data is the value to match or an array of corresponding row data containing the match field...
			  var i=this.getFieldIndex(x);
			  if(i==-1) return false;
			  if(typeof(dta)=="object") dta=dta[i];
			  var r=[];
			  for(var n in this.data){
				  if(this.data[n][i]==dta) r.push(n);
			  };
//alert(x+":"+data+":"+JSON.stringify(r));
			  return r;
		  },
		  //sets the fld with val for each row found by key 'x' and data
		  "findRowsSetValue":function(x,data,fld,val){
			  var r=this.findRows(x,data);
			  var i=this.getFieldIndex(fld);
//alert(r.length+":"+fld+":"+val);
			  if(i==-1) return false;
			  if(typeof(val)=="object") val=val[i];
			  if(r){
				 for(var n in r){
					 this.data[r[n]][i]=val;
				 };
			  };
			  return true;
		  },
		  "removeRows":function(x,valArr){//provide a field and an array of field values to search for, then remove from array...
				var d=[];
				for(var i in valArr){
					var r=this.findRows(x,valArr[i]);
					if(r.length>0) this.data[r[0]]=false;
				};
				for(var i in this.data){
					if(this.data[i]) d.push(this.data[i]);
				};
				this.data=d;
			},

		  "templateReplace":function(node, dataRow){//replaces _field_ in the text of the matching tag $(node), will repeat for each row or just the index in the second parameter...
			  if(this.data.length<=dataRow) return this;
			  var lthis=this;
			  $(node).each(function(i){
					var r=$(this).html();
					var rorig=r;
//alert("before: "+r);
					for(var f=0;f<lthis.fields.length;f++){
//if(r.indexOf("_"+lthis.fields[f].field.toLowerCase()+"_")>-1) alert("_"+lthis.fields[f].field.toLowerCase()+"_");
						r=r.replace("_"+lthis.fields[f].field.toLowerCase()+"_", lthis.data[dataRow][f]);
					};
//alert("after: "+r);
					$(this).html(r);
				});
		  },
		  "pivot":function(x,y,z,nname,keyArray){//where x is the x axis data (yrs, terms...), y is the count column, z is the key data
			  //if keyArray exists, use it to create flds...
//  alert("inside pivot");
			  var zi=this.getFieldIndex(z.toLowerCase());
			  var xi=this.getFieldIndex(x.toLowerCase());
			  var yi=this.getFieldIndex(y.toLowerCase());
			  if(zi<0||xi<0||yi<0){ alert("pivot requires valid field names.  "+(zi<0?"z:"+z:(xi<0?"x:"+x:"y:"+y))+" is not valid"); return;};
			  var flds=new Array(),res=new Array(), resRow=new Array();
			  flds.push({"field":x,"sTitle":this.getTitle(x.toLowerCase())});
			  var dz;
			  resRow.push(0);//add a column placeholder for the x value...
			  if(typeof(keyArray)!="object"){
				  dz=this.getDistinctValues(zi);
				  for(var i in dz){
					  flds.push({"field":dz[i].replace(/ /g,"_"),"sTitle":dz[i]});
					  resRow.push(0);
				  };
			  }
			  else {
				  var fldname,fldtitle,dataMatch;
				  dz=new Array();
				  for(var i=0;i<keyArray.length;i++){
					  fldname=(keyArray[i].field!=undefined?keyArray[i].field.replace(/ /g,"_"):i);
					  dataMatch=(keyArray[i].dataMatch?keyArray[i].dataMatch:(keyArray[i].field?keyArray[i].field:i));
					  fldtitle=(keyArray[i].text!=undefined?keyArray[i].text:i);
					  flds.push({"field":fldname,"sTitle":fldtitle});
					  dz.push(dataMatch);
					  resRow.push(0);
				  };				  
			  };
			  var dx=this.getDistinctValues(xi);
			  
			  for(var i=0;i<dx.length;i++){
				  var resRowCopy=resRow.slice(0);//makes a clone of resRow...
				  resRowCopy[0]=dx[i];
				  res.push(resRowCopy);
			  };
//alert(JSON.stringify(res));
			  var yval, zval, xval,zind,xind;
			  for(var i=0;i<this.data.length;i++){
				  yval=this.data[i][yi];
				  zval=this.data[i][zi];
				  xval=this.data[i][xi];
				  zind=this.getIndex(zval,dz);//add one to account for the xval column...
				  xind=this.getIndex(xval,dx);
//alert(xval+":"+zval+":"+xind+":"+zind+":"+yval)
				  if(zind<0||xind<0)  window.dataSetObjects.showDevDisplay("pivot table "+nname,"data error in pivot row "+i+", "+(zind<0?"No column for zval:'"+zval+"' "+JSON.stringify(dz):"No column for xval:'"+xval+"' "+JSON.stringify(dx)),true);
				  else res[xind][(parseInt(zind)+1)]+=(parseInt(yval)+""==yval?parseInt(yval):parseFloat(yval));
			  };
			  _dso.newTable(nname);
			  _dso[nname].parent=this;
			  _dso[nname].fields=flds;
			  _dso[nname].data=res;
			  return _dso[nname];
		  },
		  "generateKey":function(field){
			  var x=this.getDistinctValues(field);
			  var r="",sep="";
			  for(var i=0;i<x.length;i++){
				  var c=(Math.floor(Math.random()*0xFF)).toString(16)+(Math.floor(Math.random()*0xFF)).toString(16)+(Math.floor(Math.random()*0xFF)).toString(16);
				  r+=sep+'{"colour":"#'+c+'","text":"'+x[i].replace(/"/g,'\"')+'","field":"'+x[i].replace(/"/g,'').replace(/ /g,"_")+'","dataMatch":"'+x[i].replace(/"/g,'\"')+'"}';
				  sep=",";
			  };
			  popupMsg("["+r+"]");
		  },
		  "pivotGraphTable":function(x,z,keyArray,gid,tid,y,nname){
			  //where x is the x axis data (yrs, terms...), y is the count column, z is the key data, y is optional
			  //if keyArray exists, use it to create flds...
			  //if gid exists, create a graph using the div id=gid
			  //if tid exists, create a table using the div id=tid
			  // if x has a space with asc then it will be parsed into x and xasc...
			  //nname is optional and will become the name of the new dataset.  If omitted, a random name will be created.
			  /*
			  intended to replace the following:
				var tethList=cteReportTemplate.data1.query("tethList","select term, catEth, count(*) cnt from data1 group by term asc, catEth");
				var teth= tethList.pivot("term","cnt","catEth","teth",ethKeys);
				teth.makeDisplayTable("tid");
			    teth.makeDisplayGraph("gid");
				amd the bar_stack type...
				"values" :  dataSetObjects.teth.cols(ethKeys),
				"keys":ethKeys,
				"tip":"#keyText#, Term #x_label#<br>#val# out of #total# (#top#, #bottom#)",
				"on_click":"testclick"

			  */
			  if(!y) y='count(*) cnt';
			  var yfilter='';
			  if(y.split(" ").length>1){
				  var yi=y.lastIndexOf(" ");
				  yfilter=y.substring(0,yi);
				  y=y.substring(yi+1);
			  };
			  var xasc="";
			  if(x.split(" ").length>1) {x=x.split(" ")[0];xasc=' asc';};
			  x=x.toLowerCase();
			  z=z.toLowerCase();
			  if(!nname)  nname=this.dsoName+"_"+x+"_"+z;
			  var pt;
			  var q="select "+x+","+(z?z+",":"")+yfilter+" "+y+" from "+this.dsoName+" group by "+x+xasc+(z?","+z:"")+"";
//alert(x+":"+y+":"+z+":q="+q);
			  var pqt=this.query(nname+"_prepivot",q);
			  if(z) pt=pqt.pivot(x,y,z,nname,keyArray);
			  else pt=pqt;
			  var node="",args="";
//  First the graph...
			  if(gid){
				  node=gid;
				  if(node.charAt(0)=="#") node=node.substr(1);
				  var tmp=$("#"+node).html();
				  if(!tmp) tmp=$("#"+node).text();
				  var bi=tmp.indexOf("{");
//alert("before eval:"+tmp);
				  if(bi>-1&&bi<5) {
					  eval("args="+tmp);
					  $("#"+node).text("");
				  }
				  else args=new Object();
				  var dsoNm=this.dsoName;
				  //create click event for when a bar is clicked...
				  window[gid+"_click"]=function(o){
						if(!o) return false;
						var zfield=z;
						var zmatch=o.keyField;
						var keyArr=keyArray;
						var xfield=x;
						var dsoName=dsoNm;
						var r;
						if(zfield) {
							if(keyArr){
								for(var n in keyArr){
									if(keyArr[n].field.toLowerCase()==zmatch.toLowerCase()){
										if(keyArr[n].dataMatch)  zmatch=keyArr[n].dataMatch;
										else zmatch=keyArr[n].field;
										break;
									};
								};
							}
							else zmatch=zfield;
							r=[[zfield,zmatch],[xfield,o.xValue]];  //stacked bar graph
						}
						else r=[[xfield,o.xValue]];					//bar graph...
//alert(JSON.stringify(r));
						window.dataSetObjects.showDetails(dsoName,r);
				  };
/*orig...				  if(z&&keyArray){//make a stacked bar graph
					  if(args.elements&&typeof(args.elements[0])=='object'){
						  args.elements[0].values=pt.cols(keyArray);
						  args.elements[0].keys=keyArray;
						  args.elements[0].on_click="window."+gid+"_click";
						  args.elements[0].type="bar_stack";
					  };
					  if(args.x_axis&&typeof(args.x_axis.labels)=='object') args.x_axis.labels.labels=pt.col(x)
					  if(args.y_axis&&typeof(args.y_axis)=='object') args.y_axis.max=Math.ceil(pt.max(keyArray)/10)*10;
				  }
				  */
				  if(z){//make a stacked bar graph
				  	  if(!keyArray){//need to make keyArray
					  		keyArray=[];//[{colour,field,text},...]
							var cparts=["00","33","66","99","cc","ff"];
							for(var i=0;i<pt.fields.length;i++){
								if(pt.fields[i].field!=x) {//need to skip the x column...
									var c="#"+cparts[Math.floor(Math.random()*6)]+cparts[Math.floor(Math.random()*6)]+cparts[Math.floor(Math.random()*6)];
									keyArray.push({colour:c,field:pt.fields[i].field,text:pt.fields[i].field});
								};
							};
					  };
					  if(args.elements&&typeof(args.elements[0])=='object'){
						  args.elements[0].values=pt.cols(keyArray);
						  args.elements[0].keys=keyArray;
						  args.elements[0].on_click="window."+gid+"_click";
						  args.elements[0].type="bar_stack";
					  };
					  if(args.x_axis&&typeof(args.x_axis.labels)=='object') args.x_axis.labels.labels=pt.col(x)
					  if(args.y_axis&&typeof(args.y_axis)=='object') args.y_axis.max=Math.ceil(pt.max(keyArray)/10)*10;
				  }
				  else {//make a regular bar graph
					  if(args.elements&&typeof(args.elements[0])=='object'){
						  args.elements[0].values=pt.col(y);
						 // args.elements[0].keys=keyArray;
						  args.elements[0]["on-click"]="window."+gid+"_click";
						  args.elements[0].type="bar";
					  };
					  if(args.x_axis&&typeof(args.x_axis.labels)=='object') args.x_axis.labels.labels=pt.col(x)
					  if(args.y_axis&&typeof(args.y_axis)=='object') args.y_axis.max=Math.ceil(pt.max(y)/10)*10;
				  };				  
				  pt.displayGraph(gid,args);

			  };//end display graph...
//and now the table...
			  if(tid){
				  node=tid;
				  if(node.charAt(0)=="#") node=node.substr(1);
				  var tmp=$("#"+node).html();
				  if(!tmp) tmp=$("#"+node).text();
				  var bi=tmp.indexOf("{");
//alert("before eval:"+tmp);
				  if(bi>-1&&bi<5) {
					  eval("args="+tmp);
					  $("#"+node).text("");
				  }
				  else args=new Object();
				  var dsoNm=this.dsoName;
				  args.fnRowCallback=function(nRow, aData, iDisplayIndex){
if(nRow){
						 $(nRow).find("td").each(function(i){
								$(this).css("cursor","pointer").click(function(){
									//need to find x column data and zColumn header to return to the detailsfunction
									var pt1=pt;
									var d=aData;
									var ci=i;
									var zfield=pt1.fields[ci].field;//get this column heading as the zfield
									var zmatch=zfield;
									var keyArr=keyArray;
									var xfield=x;
									var dsoName=dsoNm;
									var r,zi;
									var xi=pt1.getFieldIndex(xfield);
									if((zfield)&&ci!=xi) {
										if(keyArr&&zfield.indexOf("_")>-1){
											for(var n in keyArr){
					//alert(JSON.stringify(n)+":"+zmatch);
												if(keyArr[n].field.toLowerCase()==zmatch.toLowerCase()&&keyArr[n].dataMatch)  {zmatch=keyArr[n].dataMatch;break;};
											};
										}
										else zmatch=zfield;
										zi=pt1.getFieldIndex(zfield);
										r=[[z,zmatch],[xfield,d[xi]]];  //stacked bar graph
									}
									else r=[[xfield,d[xi]]];					//bar graph...
//	   alert("in cell, ci:xi="+ci+":"+xi+" :"+JSON.stringify(r)+":fields="+JSON.stringify(pt1.fields)+":zfield="+JSON.stringify(zfield));
									window.dataSetObjects.showDetails(dsoName,r);
								});//end click function...
							});//end each function...
					   };//end if
   					   return nRow;
				  };//end fnRowCallback
				  pt.displayTable(tid,args);
			  };//end display table...
			  return pt;
		  },
		  "displayMap":function(node,args){
			  //args can be passed in or put in the text node of the target
			  // args should follow jquery.jMap format with the following optional additions
			  //{ init:{{mapType:'hybrid',mapCenter:[37.4419, -122.1419],    mapEnableScrollZoom:true}, 
			  //  latName:'lat', lonName:'lon', 
			  //  sizeField:'cnt', sizeMax:2.5, sizeMin:0.5, sizeRangeMin:,sizeRangeMax,
			  //  colorField:'colorColumn', or - colorKeyField:'catEth',colorKey:ethKey, 
			  //  labelField:'shortTextField', or - labelKeyField:'grLevel', labelKey:grKey, 
			  //  detailField:'schName' or detailHTML:'Replace $schName in this string' or detailHTMLFunction:...
			  //  groupByField:'schId' - allows count(*) and sum(field) to be valid sizeFields
			  //  autoZoom:true, or zoom:6,...
			  //  autoCenter:true...
			  //  showClicks:true will show the coordinates of a click, useful when creating an overlay
			  //  overlayList:
			  //  smallestOnTop:true... will arrange markers with smallest on top instead of by lattitude
			  //  shape: pin or square or circle
			  //}
			  // color key format: [{"colour":"#0000ff","text":"90% Afr. American","field":"B90"},{"colour":"#6666ff","text":"60-90% Afr. American","field":"B60"},{"c
			  //http://map.ifies.org/
			  //map pin link http://groups.google.com/group/google-chart-api/web/chart-types-for-map-pins
			  //TO DO:  1) pull data into object and display from object.  This will facilitate 'saving' copies of a map for commenting
			  // 2) add detailHTML and detailHTMLFunction
              // 3) add groupByField - 3a) rotate pins in the same location and 3b) stack HTML in balloon of stacked pins and 3c) add size control as an option to 3a...
			  // 4) add click event handler...
			  /*
			  <div id="mapDetails" class="jmap">{
  init:{  
    'mapType':'map',
    'mapCenter':[41.87978,-87.69149],
    mapEnableScrollZoom:true
  }, 
  detailHTML:"&lt;b&gt;_schlabel_&lt;/b&gt;&lt;br&gt;_addr_&lt;br&gt;School type: _catschtype_&lt;br&gt;Ethnicity: _cateth_&lt;br&gt;Number of student teachers: _cntst_&lt;br&gt;Number of other universities: _univcnt_",
  "height":620,
  "width":500,
  autoZoom:true,
  latName:'lat', 
  lonName:'lon', 
  shapeKeyField:'private',
  labelKeyField:'univCnt',
  colorKeyField:'catEth', 
  colorKey:keysEth,
 sizeField:'cntST',
 sizeRangeMax:24,
 sizeMax:1.5,
  detailField:'schlabel',
showClicks:true,
  overlayList:[{label:"Poverty Map",title:'Click to view poverty areas',note:'Lightest to Darkest: 0-5% poverty,5-30%,30-60%,60-90%,90-100%',overlays:[{url:'https://uiccte.org/sites/all/modules/custom/cteReportTemplateMedia/images/povertyChicago2.gif',n:42.4922,s:41.20,e:-87.515,w:-88.700}]}]
}</div>
			  */
			  if(node.charAt(0)=="#") node=node.substr(1);
			  if(!args||typeof(args)!='object')  {
				  var tmp=$("#"+node).text();
				  var x=tmp.indexOf("{");
				  if(x>-1&&x<5){
					  eval("args="+tmp);
					  $("#"+node).text("");
				  }
				  else if(window.dataSetObjects.templates[node]) args=window.dataSetObjects.templates[node];
				  else args=new Object();
 			  };
			  if(!args.height) args.height=400;
			  if(!args.width) args.width=600;
			  $("#"+node).css("height",args.height).css("width",args.width);
			  $("#"+node).show();
			  if(!args.init) args.init={'mapType':'map','mapCenter':[41.87978,-87.69149]};
			  args.dsoName=this.dsoName;
			  args.nodeName=node;
			  args.typeName='displayMap';
			  window.dataSetObjects.templates[node]=args;
			  var mp=$("#"+node).jmap('init',args.init,_dso.setMapControls);
			  if(!args.latName) args.latName='lat';
			  if(!args.lonName) args.lonName='lon';
			  if(!args.detailField) args.detailField='name';
			  args.latName=this.getFieldIndex(args.latName);
			  args.lonName=this.getFieldIndex(args.lonName);
			  args.detailField=this.getFieldIndex(args.detailField);
			  if(args.sizeField){
				  if(typeof(args.sizeRangeMax)=='undefined') args.sizeRangeMax=this.max(args.sizeField);
				  if(typeof(args.sizeRangeMin)=='undefined') args.sizeRangeMin=this.min(args.sizeField);
				  if(!args.sizeMax) args.sizeMax=1;
				  if(!args.sizeMin) args.sizeMin=.4;
				  args.sizeFieldIndex=this.getFieldIndex(args.sizeField);
				  if(args.sizeFieldIndex==-1) args.sizeField='';
			  };
			  if(args.colorKeyField){
				  args.colorIndex=this.getFieldIndex(args.colorKeyField);
				  if(!args.colorKey) args.colorFunction=function(dso,i){return dso.data[i][this.colorIndex];};
				  else {
					  args.colorObject={};
					  for(var i=0;i<args.colorKey.length;i++){
						  if(args.colorKey[i].field) {
							  if(args.colorKey[i].color) args.colorObject[args.colorKey[i].field]=args.colorKey[i].color;
							  if(args.colorKey[i].colour) args.colorObject[args.colorKey[i].field]=args.colorKey[i].colour;
						  }
					  };
					  args.colorFunction=function(dso,i){ var colr=this.colorObject[dso.data[i][this.colorIndex]]; if(colr) return colr; else return "BBBBBB";};
				  }
				  
			  }
			  if(args.labelKeyField){
				  args.labelIndex=this.getFieldIndex(args.labelKeyField);
				  if(args.labelIndex==-1) args.labelFunction=null;//no index, no label
				  else if(!args.labelKey) args.labelFunction=function(dso,i){return dso.data[i][this.labelIndex];};
				  else {
					  args.labelObject={};
					  for(var i=0;i<args.labelKey.length;i++){
						  if(args.labelKey[i].field&&args.labelKey[i].label) {
							  args.labelObject[args.labelKey[i].field]=args.labelKey[i].label;
						  };
					  };
					  args.labelFunction=function(dso,i){ var label=this.labelObject[dso.data[i][this.labelIndex]];
					  if(label) return label; else return "";};
				  }
				  
			  }
			  if(args.shapeKeyField){
				  args.shapeIndex=this.getFieldIndex(args.shapeKeyField);
				  if(args.shapeIndex==-1) args.shapeFunction=null;//no index, no label
				  else if(!args.shapeKey) args.shapeFunction=function(dso,i){return dso.data[i][this.shapeIndex];};
				  else {
					  args.shapeObject={};
					  for(var i=0;i<args.shapeKey.length;i++){
						  if(args.shapeKey[i].field&&args.shapeKey[i].label) {
							  args.shapeObject[args.shapeKey[i].field]=args.shapeKey[i].label;
						  };
					  };
					  args.shapeFunction=function(dso,i){ var shape=this.shapeObject[dso.data[i][this.labelIndex]];
					  if(shape) return shape; else return "pin";};
				  }
				  
			  }
			  var thisDso=this;
			  setTimeout(function(){
				  var latmax=-1000000000,latmin=10000000000,lonmax=-1000000000,lonmin=10000000000;
				  var markerList={};
				  var pinList=[];
				  var imgList={};
				  var markerCnt=0,markerLoadedCnt=0,markersProcessed=false;
				  var processAllMarkers=function(){
					  for(var ciIndex in imgList){
						  //if this is a pin, we need to get the image and adjust the size of the marker...
						  var newImg2=imgList[ciIndex];
						  if(newImg2) markerList[ciIndex].iconSize=new GSize(newImg2.width,newImg2.height);						  
					  };
					  //pinList.sort(function(a,b){return a.sz-b.sz;});//didn't work
					  for(var j in pinList){
						  var ciIndex=pinList[j].pointIcon;
						  //now add the marker to the pin (replacing the placeholder) and then hte pin to the map...
//	$('#devNode').append(pinList[j].sz+",");
						  pinList[j].pointIcon=markerList[pinList[j].pointIcon];
						  mp.jmap('AddMarker',pinList[j]);
					  };  
					  if(args.smallestOnTop) window.setTimeout(function(){
							 $('img').each(function(){
//								 $('#devNode').append($(this).css('zIndex')+",");
								if(this.width<100)	$(this).css('zIndex',200-this.width);
								});
						},1000);
				  };
//$('#devNode').append("<br>sizeParams... Range min/max:"+args.sizeRangeMin+":"+args.sizeRangeMax+" Size min/max:"+args.sizeMin+":"+args.sizeMax);
				  for(var i=0;i<thisDso.data.length;i++){
					  if(!thisDso.data[i][args.latName]||!thisDso.data[i][args.lonName]||isNaN(thisDso.data[i][args.latName])||isNaN(thisDso.data[i][args.lonName])) {
						  continue;
					  }
					  if(thisDso.data[i][args.latName]>latmax) latmax=thisDso.data[i][args.latName];
					  if(thisDso.data[i][args.latName]<latmin) latmin=thisDso.data[i][args.latName];
					  if(thisDso.data[i][args.lonName]>lonmax) lonmax=thisDso.data[i][args.lonName];
					  if(thisDso.data[i][args.lonName]<lonmin) lonmin=thisDso.data[i][args.lonName];
					  var colr="FF0000";
					  if(args.colorFunction) colr=args.colorFunction(thisDso,i);
					  if(colr.charAt(0)=="#") colr=colr.substring(1);
					  var lbl="";
					  if(args.labelFunction) lbl=args.labelFunction(thisDso,i);
					  var shape="pin";
					  if(args.shapeFunction) shape=args.shapeFunction(thisDso,i);
					  var detailHTML="";
					  if(args.detailFunction) detailHTML=args.detailFunction(thisDso,i);
					  else if(args.detailHTML) detailHTML=_dso.replace_fields_(args.detailHTML,thisDso.data[i],thisDso.fields);
					  else if(args.detailField) detailHTML=thisDso.data[i][args.detailField];
	  			  //  sizeField:'cnt', sizeMax:2.5, sizeMin:0.5, sizeRangeMax:20, sizeRangeMin:0
					  var rot=0;
					  //need to add rotation param...
				  	  var sz=.5;
					  if(args.sizeField){
						  if((args.sizeRangeMin==args.sizeRangeMax)||(args.sizeMin==args.sizeMax)) sz=.5;
						  else{
							  var szFld=parseFloat(thisDso.data[i][args.sizeFieldIndex]);
							  if(isNaN(szFld)) sz=0;
							  var m=(args.sizeMax-args.sizeMin)/(args.sizeRangeMax-args.sizeRangeMin);
							  sz=(args.sizeMin*args.sizeRangeMax-args.sizeMax*args.sizeRangeMin)/(args.sizeRangeMax-args.sizeRangeMin)+szFld*m;
//$('#devNode').append("<br>y=y0+m*x  "+sz+"="+(args.sizeMin*args.sizeRangeMax-args.sizeMax*args.sizeRangeMin)/(args.sizeRangeMax-args.sizeRangeMin)+"+"+szFld+"*"+m);
							  if(sz<0.1) sz=.1;
							  else if(sz>2) sz=2;
							  else sz=Math.round(sz*10)/10;
						  };
					  }
					  else if(args.size) sz=parseFloat(args.size);
					  var ci;
					  var ciIndex=colr+"_"+lbl+"_"+sz+"_"+shape;
							  //http://chart.apis.google.com/chart?cht=itr&chs=9x9&chco=ffee00,000000ff,ffffff01&chl=&chx=000000,12&chf=a,s,ffffff01&ext=.png
					  if(markerList[ciIndex]) ci=markerList[ciIndex];
					  else{
						  if(shape=='pin'){
							  var ipng="http://www.google.com/chart?chst=d_map_spin&chld="+sz+"|0|"+colr+"|10|_|"+lbl;
							  imgList[ciIndex]= new Image();
							  var newImg=imgList[ciIndex];
							  newImg.src=ipng;
							  ci=Mapifies.createIcon({iconImage:ipng});
							  markerList[ciIndex]=ci;
							  markerCnt++;
							  newImg.onload=function(){
	//$('#devNode').append("<br>loaded png="+ipng+" h/w:"+this.height+":"+this.width+" "+ciIndex+" cnts:"+markerLoadedCnt+":"+markerCnt);
								  markerLoadedCnt++;
								  if(markersProcessed&&markerLoadedCnt>=markerCnt){//this is the last img to load and it is after all markers being processed...
	//$('#devNode').append("<br>addMarkers2 "+markerLoadedCnt+":"+markerCnt);
									  processAllMarkers();
								  };
							  };
						  }
						  else{//shape is circle or square...
						  	  var newsz=parseInt(sz*48);
							  if(isNaN(newsz)) newsz=24;
							  markerList[ciIndex]=_dso.createFlatIcon({labelSize:12,width:newsz,height:newsz,primaryColor:"#"+colr,label:lbl,shape:shape});
							  markerCnt++;
							  markerLoadedCnt++;//no need to wait til it is loaded to determine the size...
						  };
//$('#devNode').append("<br>png="+ipng+" h/w:"+newImg.height+":"+newImg.width);
					  };
					  pinList.push({'pointLatLng':[thisDso.data[i][args.latName],thisDso.data[i][args.lonName]],'pointHTML':detailHTML,pointIcon:ciIndex, pointOpenHTMLEvent:"click",'sz':sz});
					 
				  };
				  markersProcessed=true;
//$('#devNode').append("<br>processed... "+markerLoadedCnt+":"+markerCnt);
				  if(markerLoadedCnt>=markerCnt){//all imgs have been loaded already so run our event...
//$('#devNode').append("<br>addMarkers1 "+markerLoadedCnt+":"+markerCnt);
						  processAllMarkers();
				  };

				  var o={mapCenter:[41.87978,-87.69149],mapZoom:10};
				  var lat=latmax-latmin;
				  var lon=lonmax-lonmin;
				  if(args.autoZoom&&lat>0&&latmax>-1000000000) {
					  var zlat=Math.round(19-Math.log(Math.abs(lat)/.0008)/Math.LN2);
					  var zlon=Math.round(19-Math.log(Math.abs(lon)/.0016)/Math.LN2);
					  o.mapZoom=Math.min(zlat,zlon);
					  if(!o.mapZoom||o.mapZoom>15) o.mapZoom=12;
					  args.autoCenter=true;
				  };
				  if(args.autoCenter){
					  o.mapCenter=[latmax-lat/2, lonmax-lon/2];
				  };
//	  alert(latmax+":"+latmin+":"+lonmax+":"+lonmin+":"+zlat+":"+zlon+":"+JSON.stringify(o));
				  $("#"+node+"_loading").hide();
//$('#devNode').append("<br>move to "+JSON.stringify(o)+", args.autoZoom="+args.autoZoom+", latmax/min="+latmax+"/"+latmin+", lonmax/min="+lonmax+"/"+lonmin);
				  mp.jmap('MoveTo',o);
			  },10000);//end setTimeout function...
			  if($("#"+node+"_loading").length==0) mp.before("<div id='"+node+"_loading'><b>LOADING MARKERS...</b><img src='"+_dso.imageDirectory+"/wait.gif'/></div>");
			  $("#"+node+"_loading").show();
			  return this;
		  },
		  "displayVerticalTable":function(node,args){
			  //args can be passed in or put in the text node of the target
			  // args should follow jquery.dataTables format with the following optional additions
			  //tableTag can be the text of the table tag
			  //tableNode can be the node id used in the tableTag, otherwise it is nodename+'-tbl1'
			  //tableClass can be the class added to the tableTag, otherwise it is 'display'
			  //data and fields from this dso will be used only if not provided in the args...
			  if(node.charAt(0)=="#") node=node.substr(1);
			  if(args+''!="[Object object]")  {
				  var tmp=$("#"+node).text();
				  var x=tmp.indexOf("{");
				  if(x>-1&&x<5){
					  eval("args="+tmp);
					  $("#"+node).text("Loading... please wait");
				  }
				  else args=new Object();
 			  };
			  var c=3;
			  if(args.columnsToShow!=undefined) c=args.columnsToShow;
			  var start=0;
			  if(args.recordNum!=undefined) start=args.recordNum;
			  var cols=this.fields;
			  if(args.aoColumns!=undefined) cols=args.aoColumns;
			  if(!args.aaData) args.aaData=this.getDataArray(args.aoColumns);
			  var r="";
			  var clr="odd";
			  for(var k=0;k<cols.length;k++){
				  if(clr=="odd") clr="even";
				  else clr="odd";
				  r+="<tr class='"+clr+"'><td>"+cols[k].sTitle+"</td>";
				  for(var i=start;i<start+c;i++){
					  if(this.data.length>i){
						  r+="<td>"+this.data[i][k]+"</td>";
					  };
				  };//end data loop...
				  r+="</tr>";
			  };//end column loop...
			  
			  if(r!="") $("#"+node).html("<table>"+r+"</table>");
			  return this;
		  },
		  "displayTable":function(node,args){
			  return this.makeDisplayTable(node,args);
		  },
		  "makeDisplayTable":function(node,args){
			  //args can be passed in or put in the text node of the target
			  // args should follow jquery.dataTables format with the following optional additions
			  //tableTag can be the text of the table tag
			  //tableNode can be the node id used in the tableTag, otherwise it is nodename+'-tbl1'
			  //tableClass can be the class added to the tableTag, otherwise it is 'display'
			  //data and fields from this dso will be used only if not provided in the args...
			  //filters:[{field:__,drop:TF,label:__,multiselect:TF},{}...] can be used to put a set of filters above table
			  //rowlink and rowLinkHint are used to set up the row click event.  Row link can be a url with replaceable field names enclosed with underscores - ie.  getData.php?id=_id_  and the _id_ part will be replaced with the value of the id column in the data source... 
			  if(node.charAt(0)=="#") node=node.substr(1);
			  if(args+''!="[object Object]")  {
				  var tmp=$("#"+node).html();
				  var x=tmp.indexOf("{");
				  if(x>-1&&x<5){
					  eval("args="+tmp);
					  $("#"+node).text("Loading... please wait");
				  }
				  else if(window.dataSetObjects.templates[node]) args=window.dataSetObjects.templates[node];
				  else args=new Object();
 			  };
			  if(!args.aoColumns) args.aoColumns=this.fields;
			  if(!args.aaData) args.aaData=this.getDataArray(args.aoColumns);
			  tbl=args.tableTag;
			  if(this.data.length<10) 	args.bPaginate= false;
			  var tblnode=args.tableNode;
			  if(!tblnode) tblnode=node+'-tbl1';
			  if(tblnode.charAt(0)=="#") tblnode=tblnode.substr(1);
			  var cls=args.tableClass;
			  if(!cls) cls="display";
              if(!tbl) tbl='<table cellpadding="0" cellspacing="0" border="0" class="'+cls+'" id="'+tblnode+'"><tbody><tr><td></td></tr></tbody></table>';
			  if(args.filters){
				  var filterTxt="";
				  for(var j in args.filters){
					  var f=args.filters[j];
					  f.field=f.field.toLowerCase();
					  filterTxt+=(f.label?f.label:f.field)+":&nbsp;<input type='text' id='"+node+"_filter_"+f.field+"' value='Search by "+(f.label?f.label:f.field)+"' class='search_init'/>&nbsp;&nbsp; ";
				  };
				  filterTxt="<div id='"+node+"_filter'>"+filterTxt+"</div>";
				  tbl=filterTxt+tbl;
			  };//end if args.filters...
			  if(!args.aaData||args.aaData.length==0) {
			//	  if($("#"+node)&&$("#"+node).html().indexOf("{")>-1) $("#"+node).text("No data was found");
				  $("#"+node).text("No data was found");
			//	  return this;
			  }
			  else $("#"+node).html(tbl);
			//  if(args.rowLink) tbl+="<font size=8>"+(args.rowLinkHint?args.rowLinkHint:"Double click on rows to view details...")+"</font>";
			  var colLink=[];
			  //add dataIndex and displayIndex fields... for use when returning column out of context..
			  var datai=0,dispi=0;
			  for(var k in args.aoColumns){
			    if(args.aoColumns[k].bVisible) args.aoColumns[k].displayIndex=dispi++;
			    args.aoColumns[k].dataIndex=datai++;
			  };
			  //get column Link data and put it into an object...
			  for(var k in args.aoColumns){
				  if(args.aoColumns[k].rowLink) {
					  var linkObj={};
					  linkObj.title="Click to view details";
					  if(args.aoColumns[k].rowLinkHint) linkObj.title=args.aoColumns[k].rowLinkHint;
					  var oFields=new Object();
					  var p=args.aoColumns[k].rowLink;
					  var i=p.indexOf("_");
					  while(i>-1){
						  var j=p.indexOf("_",i+1);
						  if(j>i){
							  //then find match field...
							  var mf=p.substring(i+1,j);
							  var repIndex=this.getFieldIndex(mf,args.aoColumns);
							  if(k>-1) {
								 oFields["_"+mf+"_"]=repIndex;
							  };
							  i=p.indexOf("_",j+1);
						  }//end if match field
						  else i=-1;
					  };
					  linkObj.oFields=oFields;
					  linkObj.rowLink=p.replace("&amp;","&");
					  linkObj.colIndex=k;
					  colLink.push(linkObj);
					  //so colLink=[{colIndex:k, title:'', oFields:{_fld1_:index1,_fld2_:index2}, rowLink:"text with _fld1_"}]...
				  };
			  };
			  if((colLink.length>0||args.rowLink!=undefined)&&args.fnRowCallback==undefined){
				  var p, oFields;
				  if(args.rowLink){
					  p=args.rowLink;
					  var title="Click to view details";
					  if(args.rowLinkHint) title=args.rowLinkHint;
					  oFields=new Object();
					  var i=p.indexOf("_");
					  while(i>-1){
						  var j=p.indexOf("_",i+1);
						  if(j>i){
							  //then find match field...
							  var mf=p.substring(i+1,j);
							  for(var k=0;k<args.aoColumns.length;k++){//DR fixed problem with link, was using this.fields but now using args.aoColumns because aoColumns can be passed in to override fields and aData is based on aoColumns...
								  if(args.aoColumns[k].field==mf) {
									  oFields["_"+mf+"_"]=k;
	//alert(mf+":"+k);
									  continue;
								  };
							  };
							  i=p.indexOf("_",j+1);
						  }//end if match field
						  else i=-1;
					  };
				  };//end if rowLink...
				  args.fnRowCallback=function(nRow, aData, iDisplayIndex){
					 if(nRow){
						 var t=title;
						 if(args.rowLink){
							 $(nRow).click(function(){
								 var pth=p; 
								 var oFld=oFields;
					 
								 for(var f in oFld){
				//					 alert(f+":"+oFld[f]+":"+aData.length+":"+aData[17]);
									 if(oFld[f]>-1&&oFld[f]<aData.length) pth=pth.replace(f,aData[oFld[f]]);
								 };
						//		 alert(pth);
								 document.location=pth;
							});
							if(!$(nRow).attr("title")) $(nRow).attr("title",t);
							$(nRow).css("cursor","pointer");
						 };//end if rowLink...
						 //now do the same for each column with a rowlink...
						//colLink=[{colIndex:k, title:'', oFields:{_fld1_:index1,_fld2_:index2}, rowLink:"text with _fld1_"},...]
						createLinkFunc=function(lnki){ return function(){
									var pth=colLink[lnki].rowLink;
									var oFld=colLink[lnki].oFields;
									 for(var f in oFld){
					//					 alert(f+":"+oFld[f]+":"+aData.length+":"+aData[17]);
										 if(oFld[f]>-1&&oFld[f]<aData.length) pth=pth.replace(f,aData[oFld[f]]);
									 };
							//		 alert(pth);
									 document.location=pth;
							     }
					 	 };
						 for(var i in colLink){
							 var td=$(nRow).children("td").eq(parseInt(colLink[i].colIndex));
//alert(JSON.stringify(colLink[i])+":"+nRow.innerHTML+":"+td.length);
							 if(td.length>0){
								 $(nRow).children("td").eq(parseInt(colLink[i].colIndex)).click(createLinkFunc(i));
								 if(!td.attr("title")) td.attr("title",colLink[i].title);
								 $(nRow).children("td").eq(colLink[i].colIndex).css("cursor","pointer");
							 };
						 }
					 };
					 return nRow;
				  }
				  
			  };
			  args.dsoName=this.dsoName;
			  args.nodeName=node;
    		  args.typeName='displayTable';
			  window.dataSetObjects.templates[node]=args;
			  window.dataSetObjects.showDevDisplay(node, args);
			  var thisTable=this;
			  if(args.editable){
			    //editable will override any row functions...
			    //editable has the form {tableName:__, keyField:___}
		        var key=args.editable.keyField;
		        var tableName=args.editable.tableName;
				if(!args.editable.postTo) args.editable.postTo="editable.aspx?setData=t";
			    if(!args.editable.doNotAdd) {
			        var addPrompt="Add New Row";
			        if(args.editable.addPrompt) addPrompt=args.editable.addPrompt;
			        var ndAfter=$("#"+node).after("<span id='"+node+"_addNew' style='clear:left'><a href='#'>"+addPrompt+"</a></span>");
    			    $("#"+node+"_addNew").click(function(){
                        var oTbl=thisTable.objects[node];
                        var dta=[];
                        var first=true;
                        for(var i=0;i<thisTable.fields.length;i++){
                            if(first&&thisTable.fields[i].sType=='string') {
                                first=false;
                                dta.push('#setFocus#');
                            }
                            else if(thisTable.fields[i].field==key) dta.push('-1');
                            else if(thisTable.fields[i].sDefaultValue) dta.push(thisTable.fields[i].sDefaultValue);
                            else dta.push('');
                        };
                        thisTable.data.push(dta);
                        if(!oTbl){
                          $('#'+node).empty();
                          $('#'+node+"_addNew").remove();
                          thisTable.displayTable('#'+node,args);
                        }
                        else oTbl.fnAddData(dta);
	    		    });
	    		};
				args.fnRowCallback=function(nRow, aData, iDisplayIndex){
					 if(nRow){
					    $(nRow).find("td").each(function(i){
					        var t=$(this);
				            var f=thisTable.getColumnFromTableIndex(i,args.aoColumns);
					        if(t.text()=='#setFocus#') {
					            //a hack to make a row from data and set the focus to the first text item, see above.,
					            if(f.defaultValue) t.text(f.defaultValue);
					            else t.text('');
					            t.addClass('setFocus');
                                callLater(function(){
                                    var sf=$(".setFocus");
                                    sf.removeClass("setFocus");
                                    sf.click();
                                },1000);
					        };
				            var displayType='text';
				            if(f.sDisplay) displayType=f.sDisplay;
				            var origval=aData[f.dataIndex];
				            if(key==f.field){
				                var nw=$("<span>&nbsp;&nbsp;<a href='#'>Delete</a></span>");
				                nw.click(function(){
				                    if(confirm("Do you want to delete this row?")){
                                        var oTbl=thisTable.objects[node];
				                        oTbl.fnDeleteRow(oTbl.fnGetPosition(nRow));
				                        $.post("editable.aspx?deleteData=t",{table:tableName,keyField:key,fields:JSON.stringify(thisTable.fields),row:JSON.stringify(thisTable.findRowData(key,aData))},function(data){if(data&&data.msg) alert(data.msg);},'json');
				                    };
				                });//end click
                			    if(!args.editable.doNotDelete&&!t.hasClass("keyProcessed")) {
					                t.append(nw);
					                t.addClass("keyProcessed");
					            };
				                return;
				            };
					        var fnOnClickMakeEditable=function(){
				                $(".editingCell").each(function(){$(this).blur();});
					            var f=thisTable.getColumnFromTableIndex(i,args.aoColumns);
					            var val=t.text();
					            t.empty().unbind();
					            var fnResult=function(type,newval,dir){
					                if(type=='cancel'){
					                    t.empty();
					                    editable[displayType].display(t,origval);
					                    t.click(fnOnClickMakeEditable);
					                }
					                else{
				                        postData(newval,dir);
					                };
					            };
					            var gotData=function(data){
					                if(data&&data.msg) alert(data.msg);
					                var origcolor=t.css("background-color");
					                t.css("background-color","#99cc99");
					                callLater(function(){t.css("background-color",origcolor);},1000);
					                //if this data was inserted...
					                if(data.data&&data.data.length==1){
					                    var rw=thisTable.findRows(key,-1);
                                        for(var rwi=0;rwi<rw.length;rwi++) thisTable.data[rw[rwi]]=data.data[0];//set any key=-1 to new data...
                                        aData=data.data[0];//set aData to returned row...
					                }
					                else {
					                    //if not inserted, set new value...
					                    aData[f.dataIndex]=val;
					                };
					                origval=val;//change origval to the new value...
					                var oTbl=thisTable.objects[node];
                                    oTbl.fnUpdate(aData,oTbl.fnGetPosition(nRow));
					                if(data&&data.direction) getNext(t,data.direction).click();
					            };
					            var getNext=function(td,dir){
					                var nexttd;
					                if(dir=="back"){
					                    if(td.prev().length>0) nexttd=td.prev();
					                    else {
					                        var r=td.parent().prev().children();
					                        if(r.length>0) nexttd=r.eq(r.length-1);
					                    };
					                }
					                else if(dir=="forward"){
					                    if(td.next().length>0) nexttd=td.next();
					                    else {
					                        nexttd=td.parent().next().children().eq(0);
					                    };
					                };
					                if(!nexttd) return null;
					                if(nexttd.hasClass("key")) return getNext(nexttd,dir);
					                return nexttd;
					            };
					            var postData=function(newval,dir){
					                    if(newval==val){//no change...
					                        editable[displayType].display(t,val);
        					                t.click(fnOnClickMakeEditable);
					                        callLater(function(){gotData({direction:dir});},100);
					                        return false;
					                    };
					                    val=newval;
					                    
				                        editable[displayType].display(t,val);
    					                t.click(fnOnClickMakeEditable);
					                    var rwdata=[];
        					            if(thisTable.findRowsSetValue(key,aData,f.field,val)) rwdata=thisTable.findRowData(key,aData);
        					            if(args.editable.postTo!='local') $.post(args.editable.postTo,{direction:dir,table:tableName,keyField:key,fields:JSON.stringify(thisTable.fields),row:JSON.stringify(rwdata)},gotData,'json');
					            };
    					        editable[displayType].edit(t,val,fnResult);
					            thisTable.findRowsSetValue(key,aData,f.field,val);
					        };
					        editable[displayType].display(t,origval);
					        t.click(fnOnClickMakeEditable);
					    });//end each td
					 };
					 return nRow;
			    };
			  };//end editable...
		//	  window.dataSetObjects.showDevDisplay(tblnode, $("#"+tblnode));
			  if($("#"+tblnode).length>0&&(args.aaData&&args.aaData.length>0)){
				  //add copy link...
				 // var tbl2=$("#"+tblnode).find(".dataTables_info");
				 var createCopyLink=function(n){
					 window.setTimeout(function(){
						 var nd=n;
						 if($("#"+nd+"_copy").length==0) $("#"+nd+"-tbl1_wrapper").prepend("<div id='"+nd+"_copy' class='dataTables_copy'>&nbsp;&nbsp;Copy Data</div>")
						 var tblcopy=$("#"+nd+"_copy");
						if(!_dso.clip){
							_dso.clip = new ZeroClipboard.Client();
							$("body").append("<div id='hidden_copy_button' style=\"position:absolute;left:-10000px;top:-10000px;height:'30 px';width:'150 px'\">Hidden copy button</div>");
							_dso.clip.glue('hidden_copy_button');
							//_dso.clip.hide();
							//$('#hidden_copy_button').hide();
							_dso.clip.addEventListener( 'onComplete', function my_complete( client, text ) {
									alert("Data copied to clipboard: " + (text.length>100?text.substring(0,100):text) );
									_dso.clip.hide();
							} );
						    _dso.clip.addEventListener( 'onMouseOut', function(){
																			   _dso.clip.hide();
																			   });
							_dso.clip.addEventListener( 'onLoad', function(){
								//clip.movie.setText();
	//							alert("movie loaded");
	_dso.clip.div.style.border="solid #dddddd";
	_dso.clip.div.childNodes[0].style.position="absolute";
//	_dso.clip.div.childNodes[0].style.border="solid red";
								//window.setTimeout(clip.destroy(),1000);
							} );
						};//end if not clip
						tblcopy.mouseover(function(){
								if(_dso.clip.domElement!=this){
									_dso.clip.reposition(this);
									var txt2="";
									var txt="";
									for(var i=0;i<args.aoColumns.length;i++){
										txt+=args.aoColumns[i].sTitle+"\t";
										if(args.aoColumns[i].field)  txt2+=args.aoColumns[i].field+"\t";
									};
									txt+="\n";
									if(txt2) txt+=txt2+"\n";
									var aaData2=tbl.fnGetData();
									for(var i=0;i<aaData2.length;i++){
										txt+=aaData2[i].join("\t")+"\n";
									};
									_dso.clip.setText(txt);
								//	$(this).text($(this).text()+"s");
								};
								if(_dso.clip.div.style.left=='-2000px') _dso.clip.show();//if we are returning from a hide on the same button then do show()
						 });//end mouseenter....
						 
			/*			 tblcopy.mouseout(function(){
								//	tblcopy.text(tblcopy.text()+"-");
								_dso.clip.hide();
						 });//end mouseenter.... 
				*/		 
					},1000);//end set timeout...
				 };//end makeCopyLink...
				  args.fnDrawCallback=function(){
					  var thisTbl=this;
					  createCopyLink(node);
					  };
				  //create table...
				  var tbl=$("#"+tblnode).dataTable(args);
				  this.objects[node]=tbl;
				  if(args.detail||!this.details) this.details=node;//store name of table node as detail
				  if(args.filters){
 					    _dso.asInitVals[node] = new Array();
						filterNodes=$("#"+node+"_filter input");
						//callback for filtering
						filterNodes.keyup( function () {
							var idArr=this.id.split("_");
							if(!idArr||idArr.length<3) {
								alert("error in filter "+this.id);
								return false;
							};
							var fld=idArr[2].toLowerCase();
							var colNum=-1;
							for(var i=0;i<args.aoColumns.length;i++){
								if(args.aoColumns[i].field.toLowerCase()==fld) {colNum=i;break;};
							};
							var oTable=tbl;
							/* Filter on the column (the index) of this element */
							if(colNum>-1) oTable.fnFilter( this.value, colNum, false );//the third param turns off escaping to allow regex search...
							else {
								alert("Could not find column field for "+this.id);
								return false;
							}
						} );
						/*
						 * Support functions to provide a little bit of 'user friendlyness' to the textboxes in 
						 * the footer
						 */
						filterNodes.each( function (i) {
							
							_dso.asInitVals[node][this.id] = this.value;
						} );
						filterNodes.focus( function () {
							if ( this.className == "search_init" )
							{
								this.className = "";
								this.value = "";
							}
						} );
						filterNodes.blur( function (i) {
							var nd=node;
							if ( this.value == "" )
							{
								this.className = "search_init";
								this.value = _dso.asInitVals[nd][this.id];
							}
						} );
				  };//end if filters...
			  };//end if tablenode...
			  return this;
		  },
		  "displayGraph":function(node,args){
			  return this.makeDisplayGraph(node,args);
		  },
		  "makeDisplayGraph":function(node,args){
			  if(node.charAt(0)=="#") node=node.substr(1);
			  if(args+''!="[object Object]")  {
				  var tmp=$("#"+node).html();
				  if(!tmp) tmp=$("#"+node).text();
				  var x=tmp.indexOf("{");
//alert("before eval:"+tmp);
				  if(x>-1&&x<5) {
					  eval("args="+tmp);
  					  $("#"+node).text("Loading... please wait");
				  }
				  else if(window.dataSetObjects.templates[node]) args=window.dataSetObjects.templates[node];
				  else args=new Object();
			  };
//alert(JSON.stringify(args));
			if(!args.height) args.height=300;
			if(!args.width) args.width=600;
			args.dsoName=this.dsoName;
			args.nodeName=node;
			args.typeName='displayGraph';
  		    window.dataSetObjects.templates[node]=args;
//alert("after graph eval:"+node+":"+JSON.stringify(args));
	 	    window.dataSetObjects.showDevDisplay(node, args);
			return swfobject.embedSWF(
			  "/sites/all/modules/custom/cteReportTemplateMedia/js/open-flash-chart.swf", node,
			  args.width+'', args.height+'', "9.0.0", "/sites/all/modules/custom/cteReportTemplateMedia/js/expressInstall.swf",
			  {"get-data":"window.dataSetObjects.get_open_chart_data","id":node}
			 );//end embedSWF...
//alert($("#"+node).html());
			 return this;//bogus??? delete?
		  },
		  "mergeFieldsData":function(fieldsObj){
			  for(var i in fieldsObj){
				  var f=fieldsObj[i].field;
				  if(f!=undefined){
					  var fi=this.getFieldIndex(f);
					  if(fi<0) this.fields.push(fieldsObj[i]);
					  else {
						  for(var j in fieldsObj[i]){
							  this.fields[fi][j]=fieldsObj[i][j];
						  };
					  };
				  };
			  };
		  },
		  "displaySelect":function(node,args){
			  /*
defaultValue: value,
data (Array),
    List of options for the combobox [value,value,...] or [{key:__,value:__},{...}]
deselectedValue: '',
deselectedText: 'Choose One',
multiple: boolean,
size=5 
*/
			  if(node.charAt(0)=="#") node=node.substr(1);
			  if(!args||typeof(args)!='object')  {
				  var tmp=$("#"+node).text();
				  var x=tmp.indexOf("{");
				  if(x>-1&&x<5){
					  eval("args="+tmp);
					  $("#"+node).text("");
				  }
				  else args=false;
 			  };
			  var nd=$("#"+node);
			  nd.html("<select name='"+node+"'></select>");
			  nd=nd.find("select");
			  if(args.deselectedText) nd.append("<option value='"+(args.deselectedValue?args.deselectedValue:'')+"'>"+args.deselectedText+"</option>");
			  for(var i=0;i<args.data.length;i++){
				  if(typeof(args.data[i])=='object') nd.append("<option value='"+(args.data[i].value)+"'>"+args.data[i].key+"</option>");
				  else nd.append("<option>"+args.data[i]+"</option>");
			  };
			  if(args.multiple) nd.attr('multiple','1').attr('size',5);
			  if(args.size) nd.attr('size',args.size);
			  if(typeof(args.defaultValue)!="undefined") nd.val(args.defaultValue);
		  },
		  "displayCombo":function(node, args){
			  /*
			  List of options from http://jonathan.tang.name/files/jquery_combobox/apidocs/ui.combobox.html 
defaultValue: value
data (Array)
    List of options for the combobox 
autoShow (Boolean)
    If true (the default), then display the drop-down whenever the input field receives focus. Otherwise, the user must explicitly click the drop-down icon to show the list. 
matchMiddle (Boolean)
    If true (the default), then the combobox tries to match the typed text with any portion of any of the options, instead of just the beginning. 
key (Function(e, ui))
    Event handler called whenever a key is pressed in the input box. 
change (Function(e, ui))
    Event handler called whenever a new option is selected on the drop-down list (eg. down/up arrows, typing in the input field). 
select (Function(e, ui))
    Event handler called when a selection is finished (enter pressed or input field loses focus) 
arrowUrl (String)
    URL of the image used for the drop-down arrow. Used only by the default arrowHTML function; if you override that, you don't need to supply this. Defaults to "drop_down.png" 
arrowHTML (Function())
    Function that should return the HTML of the element used to display the drop-down. Defaults to an image tag. 
listContainerTag (String)
    Tag to hold the drop-down list element. 
listHTML (Function(String, Int))
    Function that takes the option datum and index within the list and returns an HTML fragment for each option. Default is a span of class ui-combobox-item.
	//DR - added defaultValue (string) to set the default value...
	Usage:
	<select><option>dog</option>...</select> and then use script to simply convert to combobox
	or
	<div id = "demo3Text">Text shows up here</div>
	<div id = "demo3">This is alt text, where the combobox would be</div>
	<script>
		$('#demo3').combobox({
			data: ['Apples', 'Oranges', 'Pears', 'Bananas', 'Kiwis', 'Grapes'],
			matchMiddle: false,
			key: function(e, ui) {
				$('#demo3Text').html(ui.value);
			},
		})
			  */
			  if(node.charAt(0)=="#") node=node.substr(1);
			  if(!args||typeof(args)!='object')  {
				  var tmp=$("#"+node).text();
				  var x=tmp.indexOf("{");
				  if(x>-1&&x<5){
					  eval("args="+tmp);
					  $("#"+node).text("");
				  }
				  else args=false;
 			  };
			  if(args) args.arrowURL="/sites/all/modules/custom/cteReportTemplateMedia/images/drop_down.png";
//alert(JSON.stringify(args));
			var cb;
			  if(args) cb=$("#"+node).combobox(args);
			  else cb=$("#"+node).combobox();
			  cb.attr("name", node);
		  },
		  "query":function(dname,q){
				/*:select: :a:,:: :b: :b1:,:count:(::*::):: :cnt: :from: :dog: :where: :a:=:'moo': :and: :b:>::=:3: :order: :by: :a:,:: :b
				
function(dataArray){				  
var res=new Array(),f=new Array();				  
for(var r=0;r<dataArray.length;r++){					  
  var rw=dataArray[r];					  
  f=new Array();					   
  if(){						  
  f[0]=undefined;f[1]=undefined;						  
  res.push(new Array());						  
  for(var k=0;k<f.length;k++){							  
  res[res.length-1].push(f[k]);						  
  };					  };				  };				  return res;	
		
		so loop through, when in select mode:
		convert field names to array indexes all other characters get copied over as is, special names like count and sum look for parenthesis.  all look for comma to end the field.  the penultimate name becomes the field name in output
		when in from mode:
		just get the name of the data source.
		when in where mode: 
		build a string that will evaluate to true/false in the whFunction
		when in sort mode:
		build a sort array of objects
		when in group by mode: 
		build a sort array and sort the data first...
		then use a group test string that will be used in testing whether we are aggregating or creating a new node
		*/
			  var qa=new Array(),gba=new Array(), oba=new Array(), sela=new Array(), wha=new Array(),fields=new Array();
			  var wh="", sel="", ord="",gb="",fr="",mode="",dataSrc="";
			  var selcnt=0;
			  q=q.toLowerCase().replace(" order by "," order_by ").replace(" group by "," group_by ");
//alert("parsing "+q);
				qa=q.match(/((?:"(?:[^"]*?)")|(?:'(?:[^']*?)')|(?:\((?:[^\)]*?)\))|(?:[^A-Za-z0-9_'" ]{1})|(?:\w*))/g);
//alert(qa.join(":"));
			  qa.push("<EOF>");//to mark end of string... 
			  for(var i=0;i<qa.length;i++){
//alert("testing qa["+i+"]="+qa[i]+", mode="+mode);
				  switch(qa[i]){
					case "select":
						mode="select";
						sela.push({'name':''});
						selcnt=0;
						break;
					case "where":
						mode="where";
						break;
					case "order_by":
						mode="order";
						oba.push({'direction':'desc','type':'string'});
						break;
					case "group_by":
						mode="group";
						oba.push({'direction':'desc','type':'string'});
						break;
					case "and":
						if(mode=="where"){
							wh+="&&";
						};
						break;
					case "or":
						if(mode=="where"){
							wh+="||";
						};
						break;
					case "count":
						if(mode=="select") {
							sela[sela.length-1]['type']='count';
							sela[sela.length-1]['name']+='Count';
						};
						break;
					case "sum":
						if(mode=="select") {
							sela[sela.length-1]['type']='sum';
							sela[sela.length-1]['name']+='Sum';
						};
						break;
					case "<EOF>":
					case "from":
					case ",":
						if(mode=="select") {
							//build sel string... 
							var s=sela[sela.length-1];
							if(s['val']=='*'){
								fields=this.fields;
								sel="f=rw;";//just set the new data row equal to the old one...
								selcnt=fields.length-1;
							}
							else{
								switch (s['type']){
									case 'count(*)': sel+="if(f["+selcnt+"]==undefined) f["+selcnt+"]=0;f["+selcnt+"]+=1;"; break;
									case 'count': sel+="if(f["+selcnt+"]==undefined) f["+selcnt+"]=0;f["+selcnt+"]+=("+s['val']+"==''?1:0);"; break;
									case 'sum': sel+="if(f["+selcnt+"]==undefined) f["+selcnt+"]=0;f["+selcnt+"]+="+s['val']+";"; break;
									default: sel+="f["+selcnt+"]="+s['val']+";"; break;
								};
								if(s.name.charAt(s.name.length-1)=="_") s.name=s.name.substring(0,s.name.length-1);
								fields.push({'field':s['name'],'sTitle':s['name']});
							};
							selcnt++;
							if(qa[i]!="from"&&qa[i]!="<EOF>") sela.push({'name':''});
//alert("add to fields: field:"+s['name']);
						};
						if(qa[i]=="from"){
							mode="from";
						};
						if(mode=="order"||mode=="group"){
							if(qa[i]!="from"&&qa[i]!="<EOF>") oba.push({'direction':'desc','type':'string'});
						};
						break;
					case " ":
					case "":
						if(mode=="select"&&sela[sela.length-1]['name']!=''){
							sela[sela.length-1]['name']+='_';//placeholder for the next name
						};
						break;
					case "is":
						if(mode=="where"){
							if((qa.length>(i+1)&&qa[i+1]=='not')||(qa.length>(i+2)&&qa[i+2]=='not')) wh+="!=";
							else wh+="==";
						};
						break;
					case "not":
						break;
					case "null":
						if(mode=="where"){
							wh+="'undefined'";
						};
						break;
					default:
						if(qa[i]=="") break;
//alert("default qa["+i+"]="+qa[i]+", mode="+mode);
						if(mode=="select"){
							var s=sela[sela.length-1];
							if(qa[i]=="(*)"&&s.type=="count") s.type="count(*)";
							if(s.name.charAt(s.name.length-1)=="_") {s.name=qa[i];}
							else{
//alert("getting v");
								var v=this.parseVal(qa[i]);
//alert("v="+v);
								if(v!="") {
									if(s.val==undefined) s.val='';
									s.val+=v;
								};
								if(s.name==undefined) s.name='';
								else if(s.name.charAt(s.name.length-1)=="_") s.name='';
								s.name+=qa[i];
							};
//alert("default s.val="+s.val+":s.name="+s.name);
						}
						else if(mode=="from") {
							dataSrc=qa[i];
						}
						else if(mode=="where"){
							var v=this.parseVal(qa[i]);
							// check for =   should make == if the previous character is not already = or ==
							if(v=="="){
								if("<>!".indexOf(wh.charAt(wh.length-1))==-1) wh+="==";
								else if(wh.length>1&&wh.substring(wh.length-2)!="==") wh+="=";//for the cases of <>!
							}
							else wh+=v;
						};
						if(mode=="order"||mode=="group"){
							var s=oba[oba.length-1];
							if(qa[i]=='desc'||qa[i]=='asc') s.direction=qa[i];
							else{
								if(s.val==undefined) s.val='';
								s.val+=this.parseVal(qa[i]);
							};
						}
						break;
				  };
			  };
			  var sFn="function(a,b){";
			  sFn+="	var rw, sres=0,srtFn, rwa, rwb;";
			  for(var i=0;i<oba.length;i++){
				  sFn+="\n	if(sres==0){";
				  sFn+="\n	rw=a;";
				  sFn+="\n	rwa="+oba[i].val+";";
				  sFn+="\n	rw=b;";
				  sFn+="\n	rwb="+oba[i].val+";";
				  sFn+="\n	srtFn=_dso.sortTypes['"+oba[i].type+"-"+oba[i].direction+"'];";
				  sFn+="\n	sres=srtFn(rwa,rwb);";
		//		  sFn+="//alert(i+':'+rwa+':'+rwb+':'+sres);";
				  sFn+="\n	};";
			  };
			  sFn+="\n	return sres;";
			  sFn+="\n	}";
			  //sort data...
// alert("sort function: "+sFn);
			  eval("var sortFn="+sFn);
			  var grpbyStr="''";
			  if(mode=="group") {
				  //use order_by array to get list of unique fields... 
				  for(var j=0;j<oba.length;j++){
					  grpbyStr+="+("+oba[j].val+")+':'";
				  };
			  };
			  //create new data function...
			  var qFn="function(dataArray){";
//qFn+="\n	var d='';for(var k=0;k<3;k++){d+=dataArray[k][0]+':'+dataArray[k][3]+'\\n';};alert(d);";
//qFn+="\n				  mode='"+mode+"';";
qFn+="\n				  var res=new Array(),f=new Array(),thisrw='',lastrw='';";
qFn+="\n				  for(var r=0;r<dataArray.length;r++){";
qFn+="\n					  var rw=dataArray[r];";
if(mode!="group"){
	qFn+="\n					  f=new Array();";
	qFn+="\n					  if("+(wh!=""?wh:"true")+"){";
	qFn+="\n						  "+sel+"";
	qFn+="\n						  res.push(f);";
	qFn+="\n					  };";
	qFn+="\n				  };";
}
else {
	qFn+="\n					  thisrw="+grpbyStr+";";
	qFn+="\n					  if(lastrw!=''&&lastrw!=thisrw){";
	qFn+="\n						  res.push(f);";
	qFn+="\n					  	  f=new Array();";
	qFn+="\n					  };";
	qFn+="\n					  if("+(wh!=""?wh:"true")+"){";
	qFn+="\n						  "+sel+"";
	qFn+="\n					  };";	
	qFn+="\n					  lastrw=thisrw;";	
	qFn+="\n				  };";
	qFn+="\n				  if(f.length>0) res.push(f);";
};
qFn+="\n				  return res;";
qFn+="\n			  };";
		 //	  window.dataSetObjects.showDevDisplay("dataSet:"+dname, "Query:"+q+"\n"+qFn,true);

//alert("query function:"+mode+":"+qFn);
			  eval("var Fn="+qFn);
			  //create new dso... 
			  _dso.newTable(dname);
			  _dso[dname].fields=fields;
//alert(fields.length+":"+fields[0].sTitle);
//alert(_dso[dataSrc].fields.length+":"+_dso[dataSrc].fields[0].sTitle);
			  if(!dataSrc||typeof(_dso[dataSrc])=='undefined') dataSrc=this.dsoName;
			  var olddata=_dso[dataSrc].data;
			  _dso[dname].data=Fn(oba.length>0? olddata.sort(sortFn):olddata);
			  return _dso[dname];
		  },
		  "parseVal":function(val){
//alert("in parseVal num="+parseFloat(val));
var dbg="";
			  if(val.charAt(0)=="("&&val.indexOf(")")>-1){
				var r="";
				var qa=val.match(/((?:"(?:[^"]*?)")|(?:'(?:[^']*?)')|(?:[^A-Za-z0-9_'" ]{1})|(?:\w*))/g);
				for(var j=0;j<qa.length;j++){
					if(qa[j]=="="&&(j>0&&j<qa.length-1&&qa[j-1]!="="&&qa[j+1]!="=")) r+="==";//fix any = and make them ==
					else if(qa[j]!="") r+=this.parseVal(qa[j]);
				};
				return r;
			  };
			  if(val.charAt(0)=="'"||val.charAt(0)=='"') return val;
			  if(parseFloat(val)+""!="NaN") return val;
			  if("()|&><+-=/*".indexOf(val)>-1) return val;
			  var flds=this.fields;
//alert("still in parseVal, fields.length="+flds.length);
			  for(var k=0;k<flds.length;k++){
dbg+="flds["+k+"]={field:"+flds[k].field+"}\n";
				  if(flds[k].field.toLowerCase()==val){
// alert(dbg+" selected "+k);
					  return "rw["+k+"].toLowerCase()";
				  };
			  };
// alert(dbg+" none selected");
			  return val;
		  }
//		  "pivot":function(args){
	//	  }
	  };
      return _dso[name];//returns table
	}//end constructor?...
	_dso.templates=new Object();
	_dso.replace_fields_=function(text, rw, fields){
//alert("replacing fields:"+text);
		for(var j in fields){
		  var f=fields[j].field;
		  if(f&&rw.length>j) text=text.replace("_"+f.toLowerCase()+"_",rw[j]);
		};
//alert("result:"+text);
		return text;
	};
	_dso.get_open_chart_data=function(id){
//alert("fetching... "+id+":"+this.templates);
	  var retdata=this.templates[id];
//alert("fetching data for chart:"+id+":"+JSON.stringify(retdata));
	  return JSON.stringify(retdata);
	};
	
	_dso.showDevDisplay=function(node, args, argIsString){
		try{
			if(!_dso.showDev) return;
			if(args&&!argIsString) {
				var jsonargs=JSON.stringify(args,null,3);
				args=jsonargs.replace(/\B\s*/g,"")+"\n"+jsonargs;
			}
			else args=args.replace(/</g,"&lt;").replace(/>/g,"*&gt;");
			$("#"+_dso.showDev).append("<br/>Arguments for "+node+":<pre>"+args+"</pre>");
		}
		catch(ex){
			$("#"+_dso.showDev).append("<br/>Error fetching "+node+":<pre>"+ex.message+"<br>"+ex.stack+"</pre>");
		};
		
	};
    _dso.sortTypes={
		/*
		 * text sorting
		 */
		"string-asc": function ( a, b )
		{
			var x = a.toLowerCase();
			var y = b.toLowerCase();
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},
		
		"string-desc": function ( a, b )
		{
			var x = a.toLowerCase();
			var y = b.toLowerCase();
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		},
		
		
		/*
		 * html sorting (ignore html tags)
		 */
		"html-asc": function ( a, b )
		{
			var x = a.replace( /<.*?>/g, "" ).toLowerCase();
			var y = b.replace( /<.*?>/g, "" ).toLowerCase();
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},
		
		"html-desc": function ( a, b )
		{
			var x = a.replace( /<.*?>/g, "" ).toLowerCase();
			var y = b.replace( /<.*?>/g, "" ).toLowerCase();
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		},
		
		
		/*
		 * date sorting
		 */
		"date-asc": function ( a, b )
		{
			var x = Date.parse( a );
			var y = Date.parse( b );
			
			if ( isNaN( x ) )
			{
			x = Date.parse( "01/01/1970 00:00:00" );
			}
			if ( isNaN( y ) )
			{
				y =	Date.parse( "01/01/1970 00:00:00" );
			}
			
			return x - y;
		},
		
		"date-desc": function ( a, b )
		{
			var x = Date.parse( a );
			var y = Date.parse( b );
			
			if ( isNaN( x ) )
			{
			x = Date.parse( "01/01/1970 00:00:00" );
			}
			if ( isNaN( y ) )
			{
				y =	Date.parse( "01/01/1970 00:00:00" );
			}
			
			return y - x;
		},
		
		
		/*
		 * numerical sorting
		 */
		"numeric-asc": function ( a, b )
		{
			var x = a == "-" ? 0 : a;
			var y = b == "-" ? 0 : b;
			return x - y;
		},
		
		"numeric-desc": function ( a, b )
		{
			var x = a == "-" ? 0 : a;
			var y = b == "-" ? 0 : b;
			return y - x;
		}
  
  };
   _dso.setMapControls=function(map, element, options){
		var node=$(element).attr('id');
		//if($("#"+node+"_controls").length==0) return;//don't process if already processed... 
	    var args=window.dataSetObjects.templates[node];
		if(args.showClicks) GEvent.addListener(map,"click", function(overlay, latlng) {     
			  if (latlng) { 
				var myHtml = "The GPoint value is: " + latlng.lat() +", "+latlng.lng()+ "<br> at zoom level " + map.getZoom();
				map.openInfoWindow(latlng, myHtml);
			  }
		 });

		var overlayArr=[{label:'Show Google Map',title:'Click to return to the normal Google map'}];
		overlayArr.push({label:'Show CTA Map',title:'Click to show a map of the CTA',note:'* Marker positions on the CTA map are approximate',overlays:[new GGroundOverlay("https://uiccte.org/sites/all/modules/custom/cteReportTemplateMedia/images/200806Scr.gif",new GLatLngBounds(new GLatLng(41.6387,-87.7598), new GLatLng(41.7961,-87.5227))),new GGroundOverlay("https://uiccte.org/sites/all/modules/custom/cteReportTemplateMedia/images/200806SWcr.gif",new GLatLngBounds(new GLatLng(41.6387,-87.9199), new GLatLng(41.8278,-87.7158))),new GGroundOverlay("https://uiccte.org/sites/all/modules/custom/cteReportTemplateMedia/images/200806Ccr.gif",new GLatLngBounds(new GLatLng(41.7624,-87.7551), new GLatLng(41.9196,-87.5227))),new GGroundOverlay("https://uiccte.org/sites/all/modules/custom/cteReportTemplateMedia/images/200806Ncr.gif",new GLatLngBounds(new GLatLng(41.8927,-87.7725), new GLatLng(42.0809,-87.5840))),new GGroundOverlay("https://uiccte.org/sites/all/modules/custom/cteReportTemplateMedia/images/200806NWcr.gif",new GLatLngBounds(new GLatLng(41.9090,-87.9250), new GLatLng(42.0809,-87.7330))),new GGroundOverlay("https://uiccte.org/sites/all/modules/custom/cteReportTemplateMedia/images/200806Wcr.gif",new GLatLngBounds(new GLatLng(41.7980,-87.9230), new GLatLng(41.9224,-87.7309)))]});
		for(var i in args.overlayList){
//			overlays should be in the form {label:'',note:'',title:'',overlays:[{url:'',n:#,s:#,e:#,w:#},{},...]...
			var o=args.overlayList[i];
			var newo={};
			if(!o.label) alert('missing label in overlayList');
			if(!o.overlays) alert('missing overlays in overlayList');
			if(o.label) newo.label=o.label;
			if(o.title) newo.title=o.title;
			if(o.note) newo.note=o.note;
			newo.overlays=[];
			for(var j in o.overlays){
				var ol=o.overlays[j];
				if(ol.url&&ol.n&&ol.s&&ol.e&&ol.w) newo.overlays.push(new GGroundOverlay(ol.url,new GLatLngBounds(new GLatLng(ol.s,ol.w),new GLatLng(ol.n,ol.e))));
			};
			overlayArr.push(newo);
		};
		$(element).after("<span id='"+node+"_note'></span>");
		for(var i=overlayArr.length-1;i>=0;i--){
			var o=overlayArr[i];
			var layerBtn=$("<span id='"+node+"_btn_"+i+"' class='"+node+"_btn' "+(o.title?"title='"+o.title.replace("'","\\'")+"'":'')+" style='border: 1pt solid rgb(102, 102, 102); padding: 3pt; cursor: pointer; display: inline; color: rgb(102, 102, 102);'>"+o.label+"</span>");
			$(element).after(layerBtn);
			var b=$("#"+node+"_btn_"+i);
			if(i==0) b.css('background-color','#cccccc');
			if(!o.note) o.note='';
			var note=o.note;
			var overlys=o.overlays;
			b.data('o',o);
			var fn=function(){
				var o=$(this).data('o');
				$("."+node+"_btn").css('background-color','#ffffff');
				$(this).css('background-color','#cccccc');
				$("#"+node+"_note").text(o.note);
				var currOverlays=$(element).data('currOverlays');
				if(currOverlays){
					for(var k in currOverlays) map.removeOverlay(currOverlays[k]);
				};
				currOverlays=[];				
				if(o.overlays){
					for(var mp in o.overlays){
						currOverlays.push(o.overlays[mp]);
						map.addOverlay(o.overlays[mp]);
					};
				};
				$(element).data('currOverlays',currOverlays);
			};
			b.click(fn);
		};//end for each overlayArr...
		
  };
   _dso.addNewRows=function(o){
		for(var dtaSet in o){
			if(_dso[dtaSet]){
				if(!_dso[dtaSet].data) _dso[dtaSet].data=[];
				for(var i in o[dtaSet]){
					_dso[dtaSet].data.push(o[dtaSet][i]);
				};
			};
		};
	};
	_dso.focusParentTabs=function(elName){
	  var htabs=$('#'+elName).parents().filter('.ui-tabs-hide');
	  htabs.each(function(i){
		var tabset=$('ul:has(a[href="#'+this.id+'"])');
		var ourtab=tabset.find('li a[href="#'+this.id+'"]');
		var index=tabset.find('li a').index(ourtab);
		if(index>-1)   tabset.tabs('select', index);
		else alert('tab '+this.id+' not found in '+tabset[0].id);
	  });
	};
	_dso.showDetails=function(dsoName,o){
		//a function to supplement traversing from a graph or summary table back to a filtered details table ...
//alert(dsoName+":"+JSON.stringify(o));
	  var _dso=window.dataSetObjects[dsoName];
	  if(!_dso||!_dso.details) return;
//alert("details="+_dso.details);
	  window.dataSetObjects.focusParentTabs(_dso.details);
	  $("#"+_dso.details+"_filter input").val("").keyup().blur();//selects all the inputs for this table and clears them...
	  for(var i=0;i<o.length;i++){
		if(o[i].length<2) {alert("Error in value passed to showDetails: "+JSON.stringify(o));continue;};
		$("#"+_dso.details+"_filter_"+o[i][0]).focus();
		$("#"+_dso.details+"_filter_"+o[i][0]).val(o[i][1]);
		$("#"+_dso.details+"_filter_"+o[i][0]).keyup();
	  };
	};
	/**
	 * Creates a flat icon based on the specified options in the 
	 *     {@link MarkerIconOptions} argument.
	 *     Supported options are: width, height, primaryColor,
	 *     shadowColor, label, labelColor, labelSize, and shape..
	 * @param {MarkerIconOptions} [opts]
	 * @return {GIcon}
	 * from http://gmaps-utility-library.googlecode.com/svn/trunk/mapiconmaker/1.1/src/mapiconmaker.js
	 */
	_dso.createFlatIcon = function (opts) {
	  var width = opts.width || 32;
	  var height = opts.height || 32;
	  var primaryColor = opts.primaryColor || "#ff0000";
	  var shadowColor = opts.shadowColor || "#000000";
	  var label = (opts.label) || "";
	  var labelColor = opts.labelColor || "#000000";
	  var labelSize = opts.labelSize || 0;
	  var shape = opts.shape ||  "circle";
	  var shapeCode = (shape === "circle") ? "it" : "itr";
	
	  var baseUrl = "http://chart.apis.google.com/chart?cht=" + shapeCode;
	  var iconUrl = baseUrl + "&chs=" + width + "x" + height + 
		  "&chco=" + primaryColor.replace("#", "") + "," + 
		  shadowColor.replace("#", "") + "ff,ffffff01" +
		  "&chl=" + label + "&chx=" + labelColor.replace("#", "") + 
		  "," + labelSize;
	  var icon = new GIcon(G_DEFAULT_ICON);
	  icon.image = iconUrl + "&chf=bg,s,00000000" + "&ext=.png";
	  icon.iconSize = new GSize(width, height);
	  icon.shadowSize = new GSize(0, 0);
	  icon.iconAnchor = new GPoint(width / 2, height / 2);
	  icon.infoWindowAnchor = new GPoint(width / 2, height / 2);
	  icon.printImage = iconUrl + "&chof=gif";
	  icon.mozPrintImage = iconUrl + "&chf=bg,s,ECECD8" + "&chof=gif";
	  icon.transparent = iconUrl + "&chf=a,s,ffffff01&ext=.png";
	  icon.imageMap = []; 
	  if (shapeCode === "itr") {
		icon.imageMap = [0, 0, width, 0, width, height, 0, height];
	  } else {
		var polyNumSides = 8;
		var polySideLength = 360 / polyNumSides;
		var polyRadius = Math.min(width, height) / 2;
		for (var a = 0; a < (polyNumSides + 1); a++) {
		  var aRad = polySideLength * a * (Math.PI / 180);
		  var pixelX = polyRadius + polyRadius * Math.cos(aRad);
		  var pixelY = polyRadius + polyRadius * Math.sin(aRad);
		  icon.imageMap.push(parseInt(pixelX), parseInt(pixelY));
		}
	  }
	
	  return icon;
	};

})();


function makePrintTab(id){
	//id should be the id of the root of the printable report... 
	//the tab will be inserted at the end of the first tabset encountered in the report.
  if(id.charAt(0)=="#") id=id.substr(1);
  var u=$("#"+id).find("ul").eq(0);
  var r=$("#"+id);
  if(r.length==0||r.parent().length==0) return;
  prt=$("<div id='printme' class='ui-tabs-hide'><b>Choose which Tabs to Print:</b></div>");
  prt.append(getPrintTabCheckboxes(id,0));
  prt.append("<input id='printmebtn' type='button' value='print'/>");
  prt.append("<div id='printdlg'/>");
  r.append(prt);
  prt.find("#printmebtn").click(function(){
    var x="";
    var sep="";
    var w=window;
    var oid=id;
    var remLinkList;
    var remTabList="";
    var dso=window.dataSetObjects;
    var a=$('#'+oid).not("script").clone();
	a.find('.book-navigation').remove();
    var b=$('#printme :checkbox');
    //remove unchecked tabs...
    for(var i=0;i<b.length;i++){
        if(b[i].checked==false){
          //remove these tabs and their contents....
          var n=b[i].value;
         if(n.indexOf("#")>-1) n=n.substr(n.indexOf("#")+1);
           a.find("#"+n).remove();
           a.find("a[href='#"+n+"']").parent().remove();

        }
        else{
           //keep these tabs but add their titles to the div...
          var n=b[i].value;
          var t=$(b[i]).next("span").text();
          if(n.indexOf("#")>-1) n=n.substr(n.indexOf("#")+1);
          a.find("#"+n).prepend("<br/><h3 style='clear:left'>"+t+"</h3>");
        };
    };
    for(n in w.dataSetObjects.templates){
      var b=a.find("#"+n);
       if(b.length>0){
         var c=w.dataSetObjects.templates[n];
         if(c.aaData){
            c.bPaginate=false;
            c.bSort=false;
            c.bFilter=false;
            c.bInfo=false;
            c.bProcessing=false;
            c.sDom="t";
         };
         x+=sep+"'"+n+"'";
         sep=",";
         b.replaceWith("<div id='"+n+"'>"+JSON.stringify(c).replace(/&/g,"&amp;")+"</div>");
       };
    };
    //get rid of the print settings tab 
    a.find("a[href='#printme']").parent().remove();
    a.find("#printme").remove();
    a.find(".mapDetails_btn").remove();
    x="<sc"+"ript>  window.nodeList=["+x+"];</scr"+"ipt>";
    a.each(function(i){x+=$(this).html();});
    window.printData="<h2>"+window.nodeTitle+"</h2>"+x;
    w=w.open('/print.html?'+window.location.pathname,'printme');
	w.focus();
    //$("#test1").html("<textarea rows=20 cols=140>"+x+"</textarea>");
    return;

  });
  $(u).tabs('add','#printme','Print Options');
}
function getPrintTabCheckboxes(id, offset){
  if(!offset) offset=0;
  if(id.charAt(0)=="#") id=id.substr(1);
  var tbs=$("#"+id).find(".ui-tabs-nav").eq(0).find("a");
  var n=$("<div style='padding:"+offset+"'/>");
  var sep="";
  for(var i=0;i<tbs.length;i++){
    if(tbs[i].href=="#printme") continue;
    n.append(sep+"<input type='checkbox' id='printmeCheckbox' checked='true' value='"+tbs[i].hash+"'/><span> "+$(tbs[i]).text()+"</span>");
    var r=getPrintTabCheckboxes(tbs[i].href,offset+3);
    if(r) n.append(r);
    sep="<br/>";
  };
  if(tbs.length>0)  return n;
  else return null;
}

function setLocationParam(param,value, query){
	var l=window.location.href;
	var done=false;
	var p=l.split("?");
	if(p.length>1){
		var q=p[1].split("&");
		for(var i=0;i<q.length;i++){
			var kv=q[i].split("=");
			if(kv[0]&&kv[0]==param) {
				q[i]=param+"="+value;
				window.location=p[0]+"?"+q.join("&");
				return;
			};
		};
	};//end if has querystring
	var r=p[0].split("/");
	for(var i=0;i<r.length;i++){
		if(r[i]==param&&r.length>i+1){
			r[i+1]=value;
			window.location=r.join("/")+(p.length>1?"?"+p[1]:"");
			return;
		};
	};	
	//no tag found so create one...
	if(query) 	window.location=p[0]+"?"+(p.length>1?p[1]+"&":"")+param+"="+value;
	else{
		if(r[r.length-1]!="") p[0]+="/";
		window.location=p[0]+param+"/"+value+(p.length>1?"?"+p[1]:"");
	};
}
function enableFilters(dsName, tableName){
	var asInitVals = new Array();

		oTable =window.dataSetObjects.tableList[dsName];
		if(!oTable) return;
		
		$("#"+filterName+" input").keyup( function () {
			
			/* Filter on the column (the index) of this element */
			oTable.fnFilter( this.value, $("#"+filterName+" input").index(this) );
		} );
		
		
		
		/*
		 * Support functions to provide a little bit of 'user friendlyness' to the textboxes in 
		 * the footer
		 */
		$("tfoot input").each( function (i) {
			asInitVals[i] = this.value;
		} );
		
		$("tfoot input").focus( function () {
			if ( this.className == "search_init" )
			{
				this.className = "";
				this.value = "";
			}
		} );
		
		$("tfoot input").blur( function (i) {
			if ( this.value == "" )
			{
				this.className = "search_init";
				this.value = asInitVals[$("tfoot input").index(this)];
			}
		} );

}
callLater=function(fn,delay){
    window.setTimeout(fn,delay);
};	  
teaser=function(str,wdCnt){
		  str=str+'';
		  if(!wdCnt) wdCnt=180;
		  if(str.length<wdCnt) return str;
		  var i=str.indexOf('<br/>');
		  if(i==-1) i=str.indexOf('...');
		  if(i>-1&&i<wdCnt) return str.substring(0,i)+"...";
		  i=str.indexOf(" ",wdCnt-10);
		  if(i>-1&&i<wdCnt+30) return str.substring(0,i)+"...";
		  return str.substring(0,wdCnt)+"...";
	  };

editable={
text:{
    display:function(td,val){
        //will display a value in the $(td) field...
        var cnt=Math.round($(td).width()/12)+10;
        var dta=teaser(val,cnt);
        if(dta!=val) $(td).data("origVal",val);
        td.empty().text(dta);
    },
    edit:function(td,val,fnResult){
        //will display an editor in the td field...
        //will return fnResult(type,val,direction) where type is post or cancel and direction is empty, forward, or back
        var dta=$(td).data("origVal");
        td.empty();
        var ed;
        if(dta) {
            val=dta;
            ed=$("<textarea class='editingCell' style='width:"+Math.max(100,td.css('width'))+"' rows='4'></textarea>");
        }
        else ed=$("<input class='editingCell' type='text' style='width:"+td.css('width')+"'></input>");
        ed.val(val);
        ed.blur(function(){
            fnResult('post',ed.val(),"");
        });
        ed.keydown(function(event){
            if(event.keyCode==9){
                //tab
                var dir=(event.shiftKey?"back":"forward");
                sils.dir=dir;//used as last key pressed for navigating through non-editable cells...
                fnResult('post',ed.val(),dir);
                return;
            };
            sils.dir="";
            if(event.keyCode==27){
                //escape
                fnResult('cancel',val,"");
                return;
            };
            if(event.shiftKey&&(event.keyCode==10||event.keyCode==13)){
                //emter
                fnResult('post',ed.val(),"");
                return;
            };
            
        });
        td.append(ed);
        ed[0].focus();
        ed.select();
    }
},
group:{
    display:function(td,val){
        //will display a value in the $(td) field...
        td.empty().text(setGroupText(val))
    },
    edit:function(td,val,fnResult){
        //will display an editor in the td field...
        //will return fnResult(type,val,direction) where type is post or cancel and direction is empty, forward, or back
        td.empty();
        var ed=$(setGroupDropdown(val));
        ed.css('width',td.css('width'));
        ed.addClass('editingCell');
        ed.val(val);
        ed.blur(function(){
            fnResult('post',ed.val(),"");
        });
        ed.keydown(function(event){
            if(event.keyCode==9){
                //tab
                var dir=(event.shiftKey?"back":"forward");
                sils.dir=dir;//used as last key pressed for navigating through non-editable cells...
                fnResult('post',ed.val(),dir);
                return;
            };
            sils.dir="";
            if(event.keyCode==27){
                //escape
                fnResult('cancel',val,"");
                return;
            };
            if(event.keyCode==10||event.keyCode==13){
                //emter
                fnResult('post',ed.val(),"");
                return;
            };
            
        });
        td.append(ed);
        ed[0].focus();
    }
},    
role:{
    display:function(td,val){
        //will display a value in the $(td) field...
        td.empty().text(setRoleText(val))
    },
    edit:function(td,val,fnResult){
        //will display an editor in the td field...
        //will return fnResult(type,val,direction) where type is post or cancel and direction is empty, forward, or back
        td.empty();
        var ed=$(setRoleDropdown(val));
        ed.css('width',td.css('width'));
        ed.addClass('editingCell');
        ed.val(val);
        ed.blur(function(){
            fnResult('post',ed.val(),"");
        });
        ed.keydown(function(event){
            if(event.keyCode==9){
                //tab
                var dir=(event.shiftKey?"back":"forward");
                sils.dir=dir;//used as last key pressed for navigating through non-editable cells...
                fnResult('post',ed.val(),dir);
                return;
            };
            sils.dir="";
            if(event.keyCode==27){
                //escape
                fnResult('cancel',val,"");
                return;
            };
            if(event.keyCode==10||event.keyCode==13){
                //emter
                fnResult('post',ed.val(),"");
                return;
            };
            
        });
        td.append(ed);
        ed[0].focus();
    }
}//end role
};//end editable
