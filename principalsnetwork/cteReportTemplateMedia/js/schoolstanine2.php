<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" dir="ltr">

<head profile="http://gmpg.org/xfn/11">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>ISBE Student Data by School | Principals Network</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<style type="text/css" title="currentStyle">
				@import "/sites/all/modules/custom/cteReportTemplateMedia/css/ui.all2222.css";
			</style>
			<style type="text/css" title="currentStyle">
				@import "/sites/all/modules/custom/cteReportTemplateMedia/css/dataTable.css";
			</style>
			<style type="text/css" title="currentStyle">
				@import "/sites/all/modules/custom/cteReportTemplateMedia/css/mlColorPicker.css";
			</style>
			<style type="text/css" title="currentStyle">
				@import "/sites/all/modules/custom/cteReportTemplateMedia/css/TableTools.css";
			</style>

			<style type="text/css" title="currentStyle">
				@import "/sites/all/modules/custom/cteReportTemplateMedia/css/jquery.popup.css";
			</style>
			<style type="text/css" title="currentStyle">
				@import "/sites/all/modules/custom/cteReportTemplateMedia/css/ui.combobox.css";
			</style>
			<style type="text/css" title="currentStyle">
				@import "/sites/all/modules/custom/cteReportTemplateMedia/css/jquery.autocomplete.css";
			</style>
			<script>var gtbExternal="";</script>
	
  <script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAZwu5vNQa6vCvjRz5Sg98aRSvi6NrkESnKs0mFY1k3c47hnQFcBQ7tzJltqgQoJxPlUTByulJLpwsqg"></script>
  <link type="text/css" rel="stylesheet" media="all" href="/modules/views/css/views.css?B" />

<link type="text/css" rel="stylesheet" media="all" href="/modules/book/book.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/modules/cck/theme/content-module.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/modules/node/node.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/modules/og/theme/og.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/modules/system/defaults.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/modules/system/system22222222222222222222222.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/modules/system/system-menus22222222222222222222.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/modules/user/user.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/modules/cck/modules/fieldgroup/fieldgroup.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/modules/comment/comment.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/sites/all/themes/interactive_media/style.css?B" />
<link type="text/css" rel="stylesheet" media="all" href="/sites/all/modules/custom/cteReportTemplateMedia/css/ui-lightness/ui.all.css?B" />
  <script type="text/javascript" src="/misc/jquery.js?B"></script>
<script type="text/javascript" src="/misc/drupal.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/jquery.ui126.js?B"></script>

<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/json/json2.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/swfobject.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/jquery.popup.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/jquery.dataTables.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/mlColorPicker.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/jquery.autocomplete.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/ui.combobox.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/jquery.jmap.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/dataSetObjects.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/TableTools.js?B"></script>

<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/ZeroClipboard/ZeroClipboard.js?B"></script>
<script type="text/javascript" src="/sites/all/modules/custom/cteReportTemplateMedia/js/jquery-ui-1.6.custom.min.js?B"></script>
<script type="text/javascript" src="/misc/collapse.js?B"></script>
<script type="text/javascript">
<!--//--><![CDATA[//><!--
jQuery.extend(Drupal.settings, { "basePath": "/" });
//--><!]]>

ZeroClipboard.setMoviePath( 'http://principalsnetwork.org/sites/all/modules/custom/cteReportTemplateMedia/js/ZeroClipboard/ZeroClipboard.swf' );

var detailPassed=false,searchPassed=false, detailRequest=false, cityVal='', snameVal='', catEthVal='', catSchTypeVal='', schIdVal='', addrVal='',radiusVal='';
var _dso=window.dataSetObjects;
var cteReportTemplate=_dso;
var ajaxDetails=function(schId){
      var callBk= function () {
       //  alert("in callback");  
         setDetails();
      }
      var url=window.document.location.pathname+"?js=1&schId="+schId;
//alert("getting "+url);
      $.getScript(url, callBk);
      // Prevent the browser from handling the click.
    //  return false;
};
var setDetails=function(){
};//end setDetails()...
var grType={stanine:['s1pct','s2pct','s3pct','s4pct','s5pct','s6pct','s7pct','s8pct','s9pct'],quartile:['q1pct','q2pct','q3pct','q4pct']};
var selectedSchoolId=0;
var callBk3= function (response) {
//		eval(response);
	//need to grab new rows identified by the returned variable schName and create 6 test composites and one overall composite...
	var subjects=_dso.schISBE.getFieldIndex('subject');
	var years=_dso.schISBE.getFieldIndex('year');
	var schools=_dso.schISBE.getFieldIndex('q');
	var o={};
	var osum=['s1cnt','s2cnt','s3cnt','s4cnt','s5cnt','s6cnt','s7cnt','s8cnt','s9cnt','q1cnt','q2cnt','q3cnt','q4cnt','totalwarning','totalbelow','totalmeet','totalexceed','totalcount'];
	//for each school, for each year organize subject rows and process
	//make object for sumScoreCnt, 
	for(var i=0;i<_dso.schISBE.data.length;i++){
		var d=_dso.schISBE.data[i];
		var ostr=d[schools]+"_"+d[subjects]+"_"+d[years];
		var ostrSch=d[schools]+"_"+d[years];
		if(typeof(o[ostr])=='undefined') {
			o[ostr]={school:d[schools],subject:d[subjects],year:d[years],compIndex:-1,minscore:1000000000,maxscore:0,avgScoreTot:0,perEquivTot:0};
			for(var j=0;j<osum.length;j++) o[ostr][osum[j]]=0;
		};
		if(typeof(o[ostrSch])=='undefined') {
			o[ostrSch]={school:d[schools],subject:'School-wide',year:d[years],compIndex:-1,minscore:1000000000,maxscore:0,avgScoreTot:0,perEquivTot:0};
			for(var j=0;j<osum.length;j++) o[ostrSch][osum[j]]=0;
		};
		if(d[_dso.schISBE.getFieldIndex('label')].indexOf('Composite')>-1){
			o[ostr].compIndex=i;
		};
		if(o[ostr].compIndex==-1){
			//append to subject composite...
			for(var j=0;j<osum.length;j++) o[ostr][osum[j]]+=parseFloat(d[_dso.schISBE.getFieldIndex(osum[j])]);
			o[ostr]['maxscore']=Math.max(parseFloat(d[_dso.schISBE.getFieldIndex('maxscore')]),o[ostr].maxscore);
			o[ostr]['minscore']=Math.min(parseFloat(d[_dso.schISBE.getFieldIndex('minscore')]),o[ostr].minscore);
			o[ostr]['avgScoreTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('avgscore')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
			o[ostr]['perEquivTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('percentileequivalent')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
			//now append to schoolwide composite...
			for(var j=0;j<osum.length;j++) o[ostrSch][osum[j]]+=parseFloat(d[_dso.schISBE.getFieldIndex(osum[j])]);
			o[ostrSch]['maxscore']=Math.max(parseFloat(d[_dso.schISBE.getFieldIndex('maxscore')]),o[ostrSch].maxscore);
			o[ostrSch]['minscore']=Math.min(parseFloat(d[_dso.schISBE.getFieldIndex('minscore')]),o[ostrSch].minscore);
			o[ostrSch]['avgScoreTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('avgscore')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
			o[ostrSch]['perEquivTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('percentileequivalent')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
		};
	};//end for each data record..
	for(var nm in o){//now process compostites....
		if(o[nm].compIndex==-1){
			var d=[];
			for(var j=0;j<_dso.schISBE.fields.length;j++) d[j]='';
			for(var j=0;j<osum.length;j++) d[_dso.schISBE.getFieldIndex(osum[j])]=Math.round(o[nm][osum[j]]*10)/10;
			d[_dso.schISBE.getFieldIndex('maxscore')]=o[nm]['maxscore'];
			d[_dso.schISBE.getFieldIndex('minscore')]=o[nm]['minscore'];
			var tot=o[nm]['totalcount'];
			d[_dso.schISBE.getFieldIndex('avgscore')]=Math.round(o[nm]['avgScoreTot']*10/tot)/10;
			var peq=Math.round(o[nm]['perEquivTot']*10/tot)/10;
			d[_dso.schISBE.getFieldIndex('percentileequivalent')]=peq;
			var seq=0;
			if(peq<4) seq=1;
			else if(peq<11) seq=2;
			else if(peq<23) seq=3;
			else if(peq<40) seq=4;
			else if(peq<60) seq=5;
			else if(peq<77) seq=6;
			else if(peq<89) seq=7;
			else if(peq<96) seq=8;
			else seq=9;
			d[_dso.schISBE.getFieldIndex('stanineequivalent')]=seq;
			for(var j=1;j<=9;j++){
				d[_dso.schISBE.getFieldIndex("s"+j+"pct")]=Math.round(o[nm]["s"+j+"cnt"]*1000/tot)/10;
			};
			for(var j=1;j<=4;j++){
				d[_dso.schISBE.getFieldIndex("q"+j+"pct")]=Math.round(o[nm]["q"+j+"cnt"]*1000/tot)/10;
			};
			d[_dso.schISBE.getFieldIndex("pme")]=Math.round((o[nm]["totalmeet"]+o[nm]["totalexceed"])*1000/tot)/10;
			d[_dso.schISBE.getFieldIndex("q")]=o[nm].school+"";
			d[_dso.schISBE.getFieldIndex("year")]=o[nm].year+"";
			d[_dso.schISBE.getFieldIndex("subject")]=o[nm].subject+"";
			d[_dso.schISBE.getFieldIndex("label")]=o[nm].subject+" Composite";
			_dso.schISBE.data.push(d);
		};
	};
	//now set the stanine graph parameters...
	stanine.maxVal=_dso.schISBE.max(['s1pct','s2pct','s3pct','s4pct','s5pct','s6pct','s7pct','s8pct','s9pct']);
	stanine.qList=_dso.schISBE.getDistinctValues('q');
	stanine.yearList=_dso.schISBE.getDistinctValues('year');
	stanine.labelList=_dso.schISBE.getDistinctValues('label');
	stanine.gradelevelList=_dso.schISBE.getDistinctValues('gradelevel');
	stanine.cohortList=_dso.schISBE.getDistinctValues('cohort');
	//now display the data...
	if(_dso.schDetails){  
		_dso.schDetails.templateReplace(".cteReplaceText",0);
		_dso.schDetails.displayTable("tableDetails",{"bAutoWidth": false,"sDom":"t","bPaginate": false,"bLengthChange": false,"bFilter": false,"bInfo": false, "bSortable":false, aoColumns:[{"sTitle":"School","field":"schLabel"},{"sTitle":"Addr","field":"add"},{"sTitle":"City","field":"city"},{"sTitle":"District","field":"district"}]});
		_dso.schDetails.displayTable("tableDetails2",{"bAutoWidth": false,"sDom":"t","bPaginate": false,"bLengthChange": false,"bFilter": false,"bInfo": false, "bSortable":false, aoColumns:[{"sTitle":"Grade Level","field":"grlevel"},{"sTitle":"Sch Type","field":"catSchType"},{"sTitle":"Enrollment","field":"enrollment"},{"sTitle":"Grades","field":"grades"}]});
		_dso.schDetails.displayTable("tableDetails3",{"bAutoWidth": false,"sDom":"t","bPaginate": false,"bLengthChange": false,"bFilter": false,"bInfo": false, "bSortable":false, aoColumns:[{"sTitle":"Pct Low Inc","field":"lowIncome"},{"sTitle":"LEP","field":"lep"},{"sTitle":"White","field":"pctW"},{"sTitle":"Afr. Am.","field":"pctB"},{"sTitle":"Latino","field":"pctL"},{"sTitle":"Asian","field":"pctA"},{"sTitle":"Nat. Am.","field":"pctN"},{"sTitle":"Mixed","field":"pctM"},{"sTitle":"Unk","field":"pctU"}]});
	};
	if(_dso.schISBE){
		_dso.schISBE.displayTable("tableISBE",{"sDom": 'fiprtl'});
		
		$("#cteReportTemplateTabs").tabs('select', 1);
		newLine({color:'222222',style:'line',lineLabel:'Reading Composites',q:[],label:['Reading Composite'],gradelevel:[],year:[''],cohort:[]});
		refreshGraph();
		$("#addLine").click(function(){
			newLine();
		});
		$("#refreshGraph").click(function(){
			refreshGraph();
		});
	};
};//end callback
function searchSelected(schid){
	selectedSchoolId=schid;
	$.getScript("schoolStanineData.php?schId="+schid, callBk3);
};//end searchSelected...
var stanine={};
stanine.lines=[];
stanine.maxVal=40;
stanine.qList=[];
stanine.yearList=[];
stanine.labelList=[];
stanine.gradelevelList=[];
stanine.cohortList=[];
var newLine=function(o){//create selectors for a new line.... 
	var lc=$('#lineConfig');
	if(!o) o={color:'222222',style:'line',lineLabel:'Enter title',q:[stanine.qList[0]],year:[stanine.yearList[0]],label:[stanine.labelList[0]],gradelevel:[stanine.gradelevelList[0]],cohort:[stanine.cohortList[0]]};
	var i=stanine.lines.length;
	lc.append("<tr id='line_"+i+"' ><td>&nbsp;Line Color<span id='color_"+i+"' style='float:left;border:1px solid black; width:15px; height:15px;'></span>&nbsp;&nbsp;Label:<input id='lineLabel_"+i+"' /> Line Style<span id='style_"+i+"'></span>	<table><tr><td>	School:<div id='q_"+i+"'></div></td><td>Test Year<div id='year_"+i+"'></div></td><td>Test Data<div id='label_"+i+"'></div></td><td>Grade<div id='gradelevel_"+i+"'></div></td><td>Grad. Cohort<div id='cohort_"+i+"'></div></td></tr></table></td></tr>");
	stanine.lines.push(o);
	var flds=['q','year','label','gradelevel','cohort'];
	for(var j in flds){
		_dso.schISBE.displaySelect(flds[j]+"_"+i,{data:stanine[flds[j]+"List"], multiple:true,deselectedText:'Select All'});
		$("#"+flds[j]+"_"+i).change(function(){
			var n=this.id.split("_");
			stanine.lines[n[1]][n[0]]=$(this).children().val();//get the value of the select node (first child of div)...
			//alert(JSON.stringify(stanine.lines[n[1]]));
		}).val(o[flds[j]]);
	};
	$("#lineLabel_"+i).change(function(){
		stanine.lines[i].lineLabel=$(this).val();
		//alert(JSON.stringify(stanine.lines[i]));
	}).val(o.lineLabel);
	$("#color_"+i).mlColorPicker({'onChange':function(val){
		$("#color_"+i).css("background-color", "#" + val);
		stanine.lines[i].color=val;
		alert(JSON.stringify(stanine.lines[i]));
	}}).css("background-color", "#" + o.color);
	
};
var refreshGraph=function(){
	var gr={
		"width":"98%",
		"height":"98%",
		"title":{
		"text":"Stanine Profile",
		"style":"{font-size: 20px;}"
		},
		
		"y_legend":{
		"text":"Percent of Students",
		"style":"{font-size: 12px; color:#736AFF;}"
		},
		"x_legend": { 
			"text": "Stanine",
			"style":"{font-size: 12px; color:#736AFF;}"
		},
		"elements": [ { "type": "area", "width": 2, "dot-style": { "type": "dot" }, "colour": "#838A96", "fill": "#ff99dd", "fill-alpha": 0.2, "values": [ 4,7,12,17,20,17,12,7,4 ], "tip":"Normal Curve, #x_label#=#val#"}],
		
		"y_axis":{
		"max":   40,"steps":5
		},
		
		"x_axis":{
		"labels":{labels: [{text:"S1"},{text:"S2"},{text:"S3"},{text:"S4"},{text:"S5"},{text:"S6"},{text:"S7"},{text:"S8"},{text:"S9"}]}
		}
	};
//	gr={ "elements": [ { "type": "area", "width": 2, "dot-style": { "type": "hollow-dot" }, "colour": "#838A96", "fill": "#E01B49", "fill-alpha": 0.4, "values": [ 0, 0.377471728511, 0.739894850386, 1.07282069945, 1.36297657271, 1.59879487114, 1.77087426334, 1.87235448698, 1.89918984578, 1.85031049867, 1.72766511097, 1.53614316726, 1.28338004305, 0.979452606461, 0.636477485296, 0.268128015314, -0.110910872512, -0.485528093851, -0.84078884226, -1.16252999279, -1.43792474109, -1.65599396759, -1.80804394039, -1.8880129069, -1.89271275679, -1.82195612186, -1.67856384587, -1.46825252636, -1.19940661196, -0.882744140886, -0.530889446578 ] } ], "title": { "text": "Area Chart" }, "y_axis": { "min": -2, "max": 2, "steps": 2, "labels": null, "offset": 0 }, "x_axis": { "labels": { "steps": 4, "rotate": 270 }, "steps": 2 } };
	for(var k=0;k<stanine.lines.length;k++){//create the query from the lineConfig objects...
		var flds=['q','year','label','gradelevel','cohort'];
		var wh="",orderby="", sep="";
		for(var l=0;l<flds.length;l++){
			var selArr=stanine.lines[k][flds[l]];
			var sep2="",wh2="";
			for(var m=0;m<selArr.length;m++){
				if(selArr[m]){
					if(sep2==" or ") orderby=flds[l];//this is when multiples are selected, so we make this the series...
					wh2+=sep2+flds[l]+"='"+selArr[m]+"'";
					sep2=" or ";
				}
				else orderby=flds[l];
			};
			if(wh2){
				wh+=sep+"("+wh2+")";
				sep=" and ";
			};
		};
		_dso.schISBE.query('schISBEResult',"select * from schISBE "+(wh?"where "+wh:"")+" "+(orderby?" order by "+orderby+" asc":""));
		var rws=_dso.schISBEResult.data;
		if(!grType.stanineCol) {
			grType.stanineCol=[];
			for(var i in grType.stanine) grType.stanineCol.push(_dso.schISBEResult.getFieldIndex(grType.stanine[i]));
		};
		for(var i=0;i<rws.length;i++){
			var dta=[];
			var temp=rws[i];
			for(var j in grType.stanineCol){
				var temp2=temp[grType.stanineCol[j]];
				var num=parseFloat(temp2);
				dta.push(num);
			};
			//function d2h(d) {return d.toString(16);}
			//function h2d(h) {return parseInt(h,16);} 
			var rcolor=stanine.lines[k].color;
			var pct=((rws.length-i)/rws.length)*0.8;
			var rcr=(Math.round(parseInt(rcolor.substring(0,2),16)*(1-pct)+255*pct )).toString(16);
			var rcg=(Math.round(parseInt(rcolor.substring(2,4),16)*(1-pct)+255*pct )).toString(16);
			var rcb=(Math.round(parseInt(rcolor.substring(4,6),16)*(1-pct)+255*pct )).toString(16);
			rcolor=(rcr.length==2?rcr:"0"+rcr)+(rcg.length==2?rcg:"0"+rcg)+(rcb.length==2?rcb:"0"+rcb);
//			rcolor=(Math.round(parseInt(rcolor.substring(0,2),16)*(1-(i/rws.length)*0.7) )).toString(16)+(Math.round(parseInt(rcolor.substring(2,4),16)*(1-(i/rws.length)*0.7) )).toString(16)+(Math.round(parseInt(rcolor.substring(4,6),16)*(1-(i/rws.length)*0.7) )).toString(16);
			var nam=stanine.lines[k].lineLabel+": "+_dso.schISBEResult.getValue(i,orderby);
			gr.elements.push({'values':dta,"type":stanine.lines[k].style,"colour":"#"+rcolor,"label-colour":"#555555","width":2,"text":nam,"font-size": 10,"dot-size":  6, "tip":nam+" #x_label#=#val#"});
		};//end for each row in query result...
	};//end for each line configuration
	if(gr.elements.length>0) _dso.schISBEResult.displayGraph('linetest',gr);
};
 function ofc_ready(){
   window.setTimeout(function(){
		$('#linetest').attr("width","100%");
		$('#linetest').attr("height","100%");
	},1000);
 };
$(document).ready(function(){
    $("#resize").resizable();
		$('#resize').css("width","600px");
		$('#resize').css("height","400px");
    $("#cteReportTemplateTabs").tabs(); 
	$("#accordion").accordion();
    $(".jmap").hide();
    $("#detailTabs").tabs(); 
//    _dso.showDev='devNode';
    var callBk= function (response) {
//	    eval(response);
		_dso.catEthList.displaySelect('catEth');
		_dso.catEthList.displaySelect('catSchType');
//		_dso.catEthList.displayGraph('junktest');
    }
    $.getScript("schoolStanineData.php?setup=t", callBk);
	$('#searchBtn').click(function(){
	  	//get js response with list of schools...
		//process response
		var callBk2= function (response) {
				eval(response);
				if(_dso.nameList) _dso.nameList.displayTable("tableList",{"sDom":"pilft", "rowLink":"javascript:searchSelected(_schid_)", "rowLinkHint":"Click to choose this school..."});
		};
			  //send search data to server...
		$.post("schoolStanineData.php",$($(this)[0].form).serialize(), callBk2);
	});
	$("#advSearchBtn").click(function(){
		var searchStr=$("#advsearchStr").val();
		var name=$("#advname").val();
		$.getScript("schoolStanineData.php?schId=q&searchStr="+searchStr+"&name="+name, callBk3);	
	});
/*
//if(detailPassed)   setDetails();
//else $(".cteReplaceText").text('');

if(searchPassed&&_dso.nameList){
    _dso.nameList.displayTable("tableList",{"sDom":"pilft", "rowLink":"/node/171?schId=_schid_", "rowLinkHint":"Click to view school details..."});
  _dso.nameList.displayMap('mapList');
};
makePrintTab("cteReportTemplate");
_dso.catEthList.displayGraph('linetest');
_dso.catEthList.displaySelect('catEth');
_dso.catEthList.displaySelect('catSchType');
$('input[name="city"]').val(cityVal);
$('input[name="sname"]').val(snameVal);
$('input[name="catEth"]').val(catEthVal);
$('input[name="catSchType"]').val(catSchTypeVal);
$('input[name="schId"]').val(schIdVal);
$('input[name="addr"]').val(addrVal);
$('input[name="radius"]').val(radiusVal);
*/
});
  </script>
  
  </head>

<body class="not-front logged-in page-node node-type-cteReportTemplate one-sidebar sidebar-left">

<div id="cteReportTemplate" class="">
   <ul id="cteReportTemplateTabs" class="tabs primary" style="width:100%;margin:0">
        <li><a href="#tabSearch"><span>Search for Schools</span></a></li>
        <li><a href="#tabDetails"><span>School Details</span></a></li>
    </ul>
    <div id="tabSearch"    class='ui-tabs-hide'>
	<div id="accordion"><h3><a href="#">Detailed Search</a></h3><div>
<form>School Name:<input type='text' name='sname'/>&nbsp;&nbsp;City:<input type='text' name='city'/><br>Address:<input type='text' name='addr'/>&nbsp;&nbsp;Radius (roughly miles):<input value='1' type='text' name='radius'/><br/>School Ethnic Category:<span id='catEth'>{data:_dso.catEthList.getDistinctValues('catEth'), defaultValue:catEthVal, autoShow:false}</span>

&nbsp;&nbsp;School Type:<span id='catSchType'>{data:_dso.catSchTypeList.getDistinctValues('catSchType'), defaultValue:catEthVal, autoShow:false}</span>&nbsp;&nbsp;<input type='button' id='searchBtn' value='Search'/><input type='hidden' name='search' value='1'/><input type='hidden' name='schId'/></form><b>Click on a school below to view its data.</b>
<div id="tableList">No Data Found... use the search boxes above to find a student or alumnus</div>
</div>
<h3><a href="#">Advanced Search</a></h3><div>
Advanced Query: <input type="text" id='advsearchStr' />&nbsp;&nbsp;Name of Query: <input type="text" id="advname" /> &nbsp;&nbsp; <input type="hidden" id="advschId" value="q" /><input type="button" id="advSearchBtn" value="Search" /><br /><br />
gradelevel: 5 = Grade 5, 8 = Grade 8, etc.<br />
sex: 1 = Female, 2 = Male<br />
eth: 1 = American Indian or Alaskan Native, 2 = Asian/Pacific Islander, 3 = Black or African American, 4 = Hispanic, 5 = White, 6 = Multiracial/Ethnic<br />
IEP:1 = Yes, 2 = No<br />
stLEP: 1 = Yes, 2 = No<br />
migrant: 1 = Yes, 2 = No<br />
freeLunch: 1 = Yes, 2 = No<br />
rcdts: '150162990252886'=Chavez Elem., etc. (note that rcdts values must be in single quotes)<br />
year: 2000 through 2009<br />
Use the fields above alone or in combination to filter the records. <br />Examples:<br />rcdts='150162990252886' and eth=4<br />sex=2 and (eth=4 or eth=3) - Note: querying large groups like this may take a couple minutes.

</div>
</div>
</div>

    <div id="tabDetails" style="padding:0.2em">
     <div class="cteReplaceText"><b>_schlabel_</b></div>
     <ul id="detailTabs" class="tabs primary"  style="width:100%;margin:0">
        <li><a href="#tabReportISBE"><span>Graphical Performance Summary</span></a></li>
        <li><a href="#tabDetailsISBE"><span>Raw Data Summary</span></a></li>
        <li><a href="#tabDetailsGen"><span>General School Details</span></a></li>
      </ul>
    <div id="tabDetailsGen"    class='ui-tabs-hide'>

       <div id="tableDetails">No school chosen</div>
       <div id="tableDetails2"></div>
        <div id="tableDetails3"></div>
     </div>

    <div id="tabReportISBE"    class='ui-tabs-hide'>
<table><tr><td>		
		<div id="resize" style="width:600px height:400px padding: 10px">
<div id='linetest' style="width:600px height:400px"></div>
</div>
	</td><td>Edit the line selections and then click on Refresh Graph
		<table><tr><td  align="left"><a href='#' id='addLine'>Add a Line or Series</a></td><td align="right"><a href='#' id='refreshGraph'>Refresh Graph</a></td></tr></table>
		<table id='lineConfig'></table>
</td></tr></table>
     </div>

    <div id="tabDetailsISBE"    class='ui-tabs-hide'>
       <div id="tableISBE">No ISBE Data.  You must first search for and select a school.</div>
     </div>


	</div>
</div>
</body></html>