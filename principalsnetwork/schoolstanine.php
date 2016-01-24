<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" dir="ltr">
<!--
12/16/10 DR added test composite in place of School-wide Composite... also modified schoolStanineData.php to include a test field="ISAT" ro "PSAE"...
-->
<head profile="http://gmpg.org/xfn/11">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>ISBE Student Data by School | Principals Network</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<style type="text/css" title="currentStyle">
				@import "cteReportTemplateMedia/css/ui.all2222.css";
			</style>
			<style type="text/css" title="currentStyle">
				@import "cteReportTemplateMedia/css/dataTable.css";
			</style>
			<style type="text/css" title="currentStyle">
				@import "cteReportTemplateMedia/css/mlColorPicker.css";
			</style>
			<style type="text/css" title="currentStyle">
				@import "cteReportTemplateMedia/css/TableTools.css";
			</style>

			<style type="text/css" title="currentStyle">
				@import "cteReportTemplateMedia/css/jquery.popup.css";
			</style>
			<style type="text/css" title="currentStyle">
				@import "cteReportTemplateMedia/css/ui.combobox.css";
			</style>
			<style type="text/css" title="currentStyle">
				@import "cteReportTemplateMedia/css/jquery.autocomplete.css";
			</style>
			<script>var gtbExternal="";</script>


<link type="text/css" rel="stylesheet" media="all" href="cteReportTemplateMedia/css/ui-lightness/ui.all.css?B" />
  <script type="text/javascript" src="misc/jquery.js?B"></script>
<script type="text/javascript" src="misc/drupal.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/jquery.ui126.js?B"></script>

<script type="text/javascript" src="cteReportTemplateMedia/js/json/json2.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/swfobject.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/jquery.popup.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/jquery.dataTables.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/mlColorPicker.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/jquery.autocomplete.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/ui.combobox.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/jquery.jmap.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/dataSetObjects.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/TableTools.js?B"></script>

<script type="text/javascript" src="cteReportTemplateMedia/js/ZeroClipboard/ZeroClipboard.js?B"></script>
<script type="text/javascript" src="cteReportTemplateMedia/js/jquery-ui-1.6.custom.min.js?B"></script>
<script type="text/javascript" src="misc/collapse.js?B"></script>
<script type="text/javascript">
<!--//--><![CDATA[//><!--
jQuery.extend(Drupal.settings, { "basePath": "/" });
//--><!]]>

ZeroClipboard.setMoviePath( 'http://principalsnetwork.org/cteReportTemplateMedia/js/ZeroClipboard/ZeroClipboard.swf' );

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
	var labels=_dso.schISBE.getFieldIndex('label');
	var tests=_dso.schISBE.getFieldIndex('test');
	var years=_dso.schISBE.getFieldIndex('year');
	var schools=_dso.schISBE.getFieldIndex('q');
	var cdtss=_dso.schISBE.getFieldIndex('cdts');
        var gr=_dso.schISBE.getFieldIndex('gradelevel');
	var o={};
	var osum=['s1cnt','s2cnt','s3cnt','s4cnt','s5cnt','s6cnt','s7cnt','s8cnt','s9cnt','q1cnt','q2cnt','q3cnt','q4cnt','p1cnt','p2cnt','p3cnt','p4cnt','p5cnt','totalwarning','totalbelow','totalmeet','totalexceed','totalwarning13','totalbelow13','totalmeet13','totalexceed13','totalcount'];
	//for each school, for each year organize subject rows and process
	//make object for sumScoreCnt,
	for(var i=0;i<_dso.schISBE.data.length;i++){
		var d=_dso.schISBE.data[i];

    //create names of composite based on subject and test type, these will add up results across all grades...
    var comp_subject = d[labels];
    if(comp_subject.substring(0,3) == "ELA") comp_subject = "ELA";
    else if(comp_subject.substring(0,3) == "MAT") comp_subject = "MAT";
		var ostr=d[schools]+"_"+comp_subject+"_"+d[years];//add this row's data to subject composite...
		var ostrSch=d[schools]+"_"+d[tests]+"_"+d[years];//add this row's data to a test composite...

    //now, if grade level is between 3 and 8 create a composite for 3-5 or 6-8...
    var ostrGr="";
    var ostrSchGr="";
    var thisGr=d[gr];
    var grName="";
    if(thisGr=="03"||thisGr=="04"||thisGr=="05"){
        grName="3 to 5";
        ostrGr=d[schools]+"_"+comp_subject+"_"+d[years]+"_3";//add this row's data to subject composite...
        ostrSchGr=d[schools]+"_"+d[tests]+"_"+d[years]+"_3";//add this row's data to a test composite...
    }
    if(thisGr=="06"||thisGr=="07"||thisGr=="08"){
        grName="6 to 8";
        ostrGr=d[schools]+"_"+comp_subject+"_"+d[years]+"_6";//add this row's data to subject composite...
        ostrSchGr=d[schools]+"_"+d[tests]+"_"+d[years]+"_6";//add this row's data to a test composite...
    }

    //now define and initalize the composite types if they don't exist.. So this must be
    //the first grade with this test or subject as we loop through years, grades and tests/subjects
		if(typeof(o[ostr])=='undefined') {//initialize new composite row...
			o[ostr]={school:d[schools],cdts:d[cdtss],subject:comp_subject,year:d[years],compIndex:-1,minscore:1000000000,maxscore:0,avgScoreTot:0,perEquivTot:0,staEquivTot:0};
			for(var j=0;j<osum.length;j++) o[ostr][osum[j]]=0;
		};
		if(typeof(o[ostrSch])=='undefined') {//initialize new composite row...
			o[ostrSch]={school:d[schools],cdts:d[cdtss],subject:d[tests],year:d[years],compIndex:-1,minscore:1000000000,maxscore:0,avgScoreTot:0,perEquivTot:0,staEquivTot:0};
			for(var j=0;j<osum.length;j++) o[ostrSch][osum[j]]=0;
		};
                //if we are in grades 3-8 initialize those composites...
		if(ostrSchGr&&typeof(o[ostrSchGr])=='undefined') {//initialize new composite row...
			o[ostrSchGr]={school:d[schools],cdts:d[cdtss],subject:d[tests]+" Gr "+grName,year:d[years],compIndex:-1,minscore:1000000000,maxscore:0,avgScoreTot:0,perEquivTot:0,staEquivTot:0};
			for(var j=0;j<osum.length;j++) o[ostrSchGr][osum[j]]=0;
		};
		if(typeof(ostrGr&&o[ostrGr])=='undefined') {//initialize new composite row...
			o[ostrGr]={school:d[schools],cdts:d[cdtss],subject:comp_subject+" Gr "+grName,year:d[years],compIndex:-1,minscore:1000000000,maxscore:0,avgScoreTot:0,perEquivTot:0,staEquivTot:0};
			for(var j=0;j<osum.length;j++) o[ostrGr][osum[j]]=0;
		};
                //check to be sure this isn't a composite that has already beeen calculated.
		if(d[_dso.schISBE.getFieldIndex('label')].indexOf('Composite')>-1){
			o[ostr].compIndex=i;
		};
                //if this is not a composite, add the record's data to the composite's data...
		if(o[ostr].compIndex==-1){
			//append to subject composite...
			for(var j=0;j<osum.length;j++) o[ostr][osum[j]]+=parseFloat(d[_dso.schISBE.getFieldIndex(osum[j])]);
			o[ostr]['maxscore']=Math.max(parseFloat(d[_dso.schISBE.getFieldIndex('maxscore')]),o[ostr].maxscore);
			o[ostr]['minscore']=Math.min(parseFloat(d[_dso.schISBE.getFieldIndex('minscore')]),o[ostr].minscore);
			o[ostr]['avgScoreTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('avgscore')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
			o[ostr]['perEquivTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('percentileequivalent')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
			o[ostr]['staEquivTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('stanineequivalent')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
		};
		if(o[ostrSch].compIndex == -1 && d[subjects] != "Science"){
			//now append to test composite...
			for(var j=0;j<osum.length;j++) o[ostrSch][osum[j]]+=parseFloat(d[_dso.schISBE.getFieldIndex(osum[j])]);
			o[ostrSch]['maxscore']=Math.max(parseFloat(d[_dso.schISBE.getFieldIndex('maxscore')]),o[ostrSch].maxscore);
			o[ostrSch]['minscore']=Math.min(parseFloat(d[_dso.schISBE.getFieldIndex('minscore')]),o[ostrSch].minscore);
			o[ostrSch]['avgScoreTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('avgscore')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
			o[ostrSch]['perEquivTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('percentileequivalent')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
			o[ostrSch]['staEquivTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('stanineequivalent')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
		};

    //and do the same if in grades 3 - 8... and we will recycle the ostr and ostrSch names for this...
    if(ostrGr){
        ostr=ostrGr;
        ostrSch=ostrSchGr;
        //this code is identical to the above...
        if(o[ostr].compIndex==-1){
                //append to subject composite...
                for(var j=0;j<osum.length;j++) o[ostr][osum[j]]+=parseFloat(d[_dso.schISBE.getFieldIndex(osum[j])]);
                o[ostr]['maxscore']=Math.max(parseFloat(d[_dso.schISBE.getFieldIndex('maxscore')]),o[ostr].maxscore);
                o[ostr]['minscore']=Math.min(parseFloat(d[_dso.schISBE.getFieldIndex('minscore')]),o[ostr].minscore);
                o[ostr]['avgScoreTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('avgscore')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
                o[ostr]['perEquivTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('percentileequivalent')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
                o[ostr]['staEquivTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('stanineequivalent')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
        };
        if(o[ostrSch].compIndex == -1 && d[subjects] != "Science"){
                //now append to test composite...
                for(var j=0;j<osum.length;j++) o[ostrSch][osum[j]]+=parseFloat(d[_dso.schISBE.getFieldIndex(osum[j])]);
                o[ostrSch]['maxscore']=Math.max(parseFloat(d[_dso.schISBE.getFieldIndex('maxscore')]),o[ostrSch].maxscore);
                o[ostrSch]['minscore']=Math.min(parseFloat(d[_dso.schISBE.getFieldIndex('minscore')]),o[ostrSch].minscore);
                o[ostrSch]['avgScoreTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('avgscore')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
                o[ostrSch]['perEquivTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('percentileequivalent')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
                o[ostrSch]['staEquivTot']+=parseFloat(d[_dso.schISBE.getFieldIndex('stanineequivalent')])*parseFloat(d[_dso.schISBE.getFieldIndex('totalcount')]);
        };

    }
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
//			var seq=0;
//			if(peq<4) seq=1;
//			else if(peq<11) seq=2;
//			else if(peq<23) seq=3;
//			else if(peq<40) seq=4;
//			else if(peq<60) seq=5;
//			else if(peq<77) seq=6;
//			else if(peq<89) seq=7;
//			else if(peq<96) seq=8;
//			else seq=9;
			var staeq=Math.round(o[nm]['staEquivTot']*1000/tot)/1000;
			d[_dso.schISBE.getFieldIndex('stanineequivalent')]=staeq;
			for(var j=1;j<=9;j++){
				d[_dso.schISBE.getFieldIndex("s"+j+"pct")]=Math.round(o[nm]["s"+j+"cnt"]*1000/tot)/10;
			};
      for(var j=1;j<=4;j++){
        d[_dso.schISBE.getFieldIndex("q"+j+"pct")]=Math.round(o[nm]["q"+j+"cnt"]*1000/tot)/10;
      };
      for(var j=1;j<=5;j++){
        d[_dso.schISBE.getFieldIndex("p"+j+"pct")]=Math.round(o[nm]["p"+j+"cnt"]*1000/tot)/10;
      };
			d[_dso.schISBE.getFieldIndex("awpct")]=Math.round(o[nm]["totalwarning"]*1000/tot)/10;
			d[_dso.schISBE.getFieldIndex("blpct")]=Math.round(o[nm]["totalbelow"]*1000/tot)/10;
			d[_dso.schISBE.getFieldIndex("mtpct")]=Math.round(o[nm]["totalmeet"]*1000/tot)/10;
			d[_dso.schISBE.getFieldIndex("expct")]=Math.round(o[nm]["totalexceed"]*1000/tot)/10;
			d[_dso.schISBE.getFieldIndex("awpct13")]=(o[nm]["totalmeet13"]>0?Math.round(o[nm]["totalwarning13"]*1000/tot)/10:"");
			d[_dso.schISBE.getFieldIndex("blpct13")]=(o[nm]["totalmeet13"]>0?Math.round(o[nm]["totalbelow13"]*1000/tot)/10:"");
			d[_dso.schISBE.getFieldIndex("mtpct13")]=(o[nm]["totalmeet13"]>0?Math.round(o[nm]["totalmeet13"]*1000/tot)/10:"");
			d[_dso.schISBE.getFieldIndex("expct13")]=(o[nm]["totalmeet13"]>0?Math.round(o[nm]["totalexceed13"]*1000/tot)/10:"");

			d[_dso.schISBE.getFieldIndex("paaavg")]=Math.round((o[nm]["q3cnt"]+o[nm]["q4cnt"])*1000/tot)/10;
			d[_dso.schISBE.getFieldIndex("pme")]=Math.round((o[nm]["totalmeet"]+o[nm]["totalexceed"])*1000/tot)/10;
			d[_dso.schISBE.getFieldIndex("pme13")]=(o[nm]["totalmeet13"]>0?Math.round((o[nm]["totalmeet13"]+o[nm]["totalexceed13"])*1000/tot)/10:"");
			d[_dso.schISBE.getFieldIndex("q")]=o[nm].school+"";
			d[_dso.schISBE.getFieldIndex("cdts")]=o[nm].cdts+"";
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
		_dso.schDetails.displayTable("tableDetails",{"bAutoWidth": false,"sDom":"t","bPaginate": false,"bLengthChange": false,"bFilter": false,"bInfo": false, "bSortable":false, aoColumns:[{"sTitle":"School","field":"schLabel"},{"sTitle":"Addr","field":"add"},{"sTitle":"City","field":"city"},{"sTitle":"District","field":"district"},{"sTitle":"cdts","field":"cdts"}]});
		_dso.schDetails.displayTable("tableDetails2",{"bAutoWidth": false,"sDom":"t","bPaginate": false,"bLengthChange": false,"bFilter": false,"bInfo": false, "bSortable":false, aoColumns:[{"sTitle":"Grade Level","field":"grlevel"},{"sTitle":"Sch Type","field":"catSchType"},{"sTitle":"Enrollment","field":"enrollment"},{"sTitle":"Grades","field":"grades"}]});
		_dso.schDetails.displayTable("tableDetails3",{"bAutoWidth": false,"sDom":"t","bPaginate": false,"bLengthChange": false,"bFilter": false,"bInfo": false, "bSortable":false, aoColumns:[{"sTitle":"Pct Low Inc","field":"lowIncome"},{"sTitle":"LEP","field":"lep"},{"sTitle":"White","field":"pctW"},{"sTitle":"Afr. Am.","field":"pctB"},{"sTitle":"Latino","field":"pctL"},{"sTitle":"Asian","field":"pctA"},{"sTitle":"Nat. Am.","field":"pctN"},{"sTitle":"Mixed","field":"pctM"},{"sTitle":"Unk","field":"pctU"}]});
	};
	if(_dso.schISBE){
		_dso.schISBE.displayTable("tableISBE",{"sDom": 'fiprtl'});

		$("#cteReportTemplateTabs").tabs('select', 1);
		newLine({color:'222222',style:'line',lineLabel:'ISAT Reading Composites',q:[],label:['ISAT Reading Composite'],gradelevel:[],year:[''],cohort:[]});
		refreshGraph();
		$("#addLine").click(function(){
			newLine();
		});
		$("#refreshGraph").click(function(){
			refreshGraph();
		});
	};
	stopWait();
};//end callback
function startWait(){
                var winH = $(window).height();
                var winW = $(window).width();
			  	$("body").append("<span style='position:absolute;top:300px;left:300px'  id='waiting'>Loading, Please Wait...<br/><img src='cteReportTemplateMedia/css/images/wait.gif'/></span>");
                var centerDiv = $('#waiting');
                centerDiv.css('top', winH/2-centerDiv.height()/2);
                centerDiv.css('left', winW/2-centerDiv.width()/2);
};
function stopWait(){
  $("#waiting").remove();
};
function searchSelected(schid){
  startWait();
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
	$("#accordion").accordion({header:'div.header'});
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
	  startWait();
		var searchStr=$("#advsearchStr").val();
		var name=$("#advname").val();
		$.getScript("schoolStanineData.php?schId=q&searchStr="+searchStr+"&name="+name, callBk3);
	});
	var ac=$("#feid_site");
	ac.autocomplete("schoolStanineData.php",{formatItem:function(item){
		return item[0];
	  },formatResult:function(item){
		return item[0];
	  },autoFill:false,matchContains:true,cacheLength:1,minChars:2,max:40,extraParams:{autoSch:'1'}});
	ac.result(function(event, data, formatted) {
		var fsite=data[1];
		searchSelected(fsite);
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
	<div id="accordion">
	<div class="header"><a href="#">Select School</a></div>
	<div>
	Type the name of a school, then choose from the list that appears: <input type='text' id='feid_site' style='width: 220px;'/> <br /><br />  To narrow a search you can also type a comma and the first few letters of the city.  <br />So 'linc,o'  would return Lincoln Elem. in Oak Park, Oglesby, and Ottawa
	</div>
	<div class="header"><a href="#">Detailed Search</a></div><div>
<form>School Name:<input type='text' name='sname'/>&nbsp;&nbsp;City:<input type='text' name='city'/><br>Address:<input type='text' name='addr'/>&nbsp;&nbsp;Radius (roughly miles):<input value='1' type='text' name='radius'/><br/>School Ethnic Category:<span id='catEth'>{data:_dso.catEthList.getDistinctValues('catEth'), defaultValue:catEthVal, autoShow:false}</span>

&nbsp;&nbsp;School Type:<span id='catSchType'>{data:_dso.catSchTypeList.getDistinctValues('catSchType'), defaultValue:catEthVal, autoShow:false}</span>&nbsp;&nbsp;<input type='button' id='searchBtn' value='Search'/><input type='hidden' name='search' value='1'/><input type='hidden' name='schId'/></form><b>Click on a school below to view its data.</b>
<div id="tableList">No Data Found... use the search boxes above to find a student or alumnus</div>
</div>
<div class="header"><a href="#">Advanced Search</a></div><div>
Advanced Query: <input type="text" id='advsearchStr' />&nbsp;&nbsp;Name of Query: <input type="text" id="advname" /> &nbsp;&nbsp; <input type="hidden" id="advschId" value="q" /><input type="button" id="advSearchBtn" value="Search" /><br /><br />
<span style="color:red">NEW:</span> District search:  cdt='x016299'  would fetch all CPS...<br/>
gradelevel: 5 = Grade 5, 8 = Grade 8, etc.<br />
sex: 1 = Female, 2 = Male<br />
eth: 1 = American Indian or Alaskan Native, 2 = Asian/Pacific Islander, 3 = Black or African American, 4 = Hispanic, 5 = White, 6 = Multiracial/Ethnic<br />
IEP:1 = Yes, 2 = No<br />
stLEP: 1 = Yes, 2 = No<br />
migrant: 1 = Yes, 2 = No<br />
freeLunch: 1 = Yes, 2 = No<br />
cdts: 'x150162990252886'=Chavez Elem., etc. (note that cdts values must be in single quotes and they are prepended with an 'x' to force them to be strings since we don't want the leading zeros to be cutoff.)<br />
year: 2000 through current<br />
Use the fields above, alone or in combination, to filter the records. <br />
<br />
Examples:<br />cdts='x0162990252886' and eth=4 - for one school's Latino population.
<br />or use rcdts='150162990252886' and eth=4 - for the same result but note that rcdts codes have changed in some regions like suburban cook schools.  So cdts is better, just remember to cut off the first two digits that represent the region.
<br />sex=2 and (eth=4 or eth=3) - for statewide male Latinos and Afr Ams. Note: querying large groups like this may take a couple minutes.
<br />cdts in ('x0162990252886', 'x0162990252772', 'x0162990254244') and eth=4 - to compile three school's Latino populations.
<br />cdts like 'x0162990%' and eth=4 - to compile all district 299 Latino population.

</div>
	<div class="header"><a href="#">Change to a Different Baseline (Currently the Default Yearly Method)</a></div><div>
        By clicking on the links below you will change the baseline year of the statewide data used to determine stanine cutoffs that normalize your data.   For some purposes it makes sense to use the same baseline for all years of data.  However for general purposes it is best to use the default behavior which is to calculate the stanine of each year's data with that year's statewide data.
        <br><br><a href="schoolstanine.php"> Default Baseline (Current)</a> - This is the recommended behavior that calculates each year's stanines from that year's statewide data.
        <br><a href="schoolstanine0106.php"> 2001 and 2006 Static Baseline </a> - This will calculate 2001-2005 stanines against the 2001 statewide data and the 2006-present stanines against the 2006 statewide data.
        <br><a href="xchischoolstanine.php"> xChi Baseline </a> - This will calculate each year's stanines from that year's xChi statewide baseline data.

        <br><br><a href="woschoolstanine.php"> Statewide and CPS Baseline with Full Demographic Markers</a> - This is the recommended behavior that calculates each year's stanines from that year's statewide data.
        <br><a href="woschoolstanine0106.php"> 2001 and 2006 Static Statewide and CPS Baseline with Full Demographic Markers </a> - This will calculate 2001-2005 stanines against the 2001 statewide data and the 2006-present stanines against the 2006 statewide data.
        <br><br><a href="xchiwoschoolstanine.php">xChi Statewide  with Full Demographic Markers </a> - This  calculates each year's stanines from that year's statewide data.
        <br><a href="xchiwoschoolstanine0106.php"> 2001 and 2006 Static xChi Statewide with Full Demographic Markers </a> - This will calculate 2001-2005 stanines against the 2001 statewide data and the 2006-present stanines against the 2006 statewide data.
                    <br><b>These next two have been disabled, let me know if you need them back:</b>
                    <br><a href="schoolstanine2006.php"> 2006 Baseline </a> - This will calculate each year's stanines against the 2006 statewide data.
        <br><a href="schoolstanine2001.php"> 2001 Baseline </a> - This will calculate each year's stanines against the 2001 statewide data.

    </div>
</div>
</div>

    <div id="tabDetails" style="padding:0.2em">
     <div class="cteReplaceText"><b>_schlabel_</b></div>
     <ul id="detailTabs" class="tabs primary"  style="width:100%;margin:0">
        <li><a href="#tabDetailsISBE"><span>Raw Data Summary</span></a></li>
        <li><a href="#tabReportISBE"><span>Graphical Performance Summary</span></a></li>
        <li><a href="#tabDetailsGen"><span>General School Details</span></a></li>
        <li><a href="#tabExplain"><span>Glossary and FAQ</span></a></li>
      </ul>
    <div id="tabDetailsGen"    class='ui-tabs-hide'>

       <div id="tableDetails">No school chosen</div>
       <div id="tableDetails2"></div>
        <div id="tableDetails3"></div>
     </div>

    <div id="tabReportISBE"    class='ui-tabs-hide'>
<table><tr><td>
		<div id="resize" style="width:600px; height:400px; padding: 10px">
<div id='linetest' style="width:600px; height:400px"></div>
</div>
	</td><td>Edit the line selections and then click on Refresh Graph
		<table><tr><td  align="left"><a href='#' id='addLine'>Add a Line or Series</a></td><td align="right"><a href='#' id='refreshGraph'>Refresh Graph</a></td></tr></table>
		<table id='lineConfig'></table>
</td></tr></table>
     </div>

    <div id="tabDetailsISBE"    class='ui-tabs-hide'>
       <div id="tableISBE">No ISBE Data.  You must first search for and select a school.</div>
     </div>

    <div id="tabExplain"    class='ui-tabs-hide'>
       <h2>Glossary</h2>
	   <table>
<tr><th><b>Name of Column</b> (database field)</th><th>Sample Data</th><th>Description</th></tr>
<tr><td><b>Query</b> (q)</td><td>CHAVEZ</td><td>This is the name of the school or the query that selected the data</td></tr>
<tr><td><b>group</b> (label)</td><td>ISAT Mathematics</td><td>This is the name of the test or the composite group of tests</td></tr>
<tr><td><b>subject</b> (subject)</td><td>Math</td><td>This is the subject area of the test</td></tr>
<tr><td><b>test</b> (test)</td><td>ISAT</td><td>This identifies which test was given</td></tr>
<tr><td><b>cohort</b> (cohort)</td><td>2014</td><td>This is the year that this group of students will likely graduate from HS</td></tr>
<tr><td><b>grade</b> (gradelevel)</td><td>8</td><td>This is the current grade level of these students</td></tr>
<tr><td><b>maxScore</b> (maxscore)</td><td>311</td><td>This is the highest scale score achieved by these students</td></tr>
<tr><td><b>minScore</b> (minscore)</td><td>200</td><td>This is the lowest scale score achieved by these students</td></tr>
<tr><td><b>avgScore</b> (avgscore)</td><td>267.275</td><td>This is the average scale score achieved by these students</td></tr>
<tr><td><b>year</b> (year)</td><td>2010</td><td>This is the year the test was given</td></tr>
<tr><td><b>#Tst</b> (totalcount)</td><td>80</td><td>This is the total number (N) of students in this group</td></tr>
<tr><td><b>%ME</b> (pme)</td><td>87.5</td><td>This is the percentage meeting or exceeding state standards</td></tr>
<tr><td><b>%AAAvg</b> (paaavg)</td><td>45</td><td>This is the percentage at or above state average</td></tr>
<tr><td><b>%ileAvgSS</b> (percentileequivalent)</td><td>44.4</td><td>This is the percentile equivalent (based on all state scores) of the average scale score of this group</td></tr>
<tr><td><b>Z-Score</b> (zscore)</td><td>-0.141</td><td>This is the number of standard deviations that the average scale score (avgscore) is from the normal, state-wide average (q23Score)</td></tr>
<tr><td><b>stanineAvgSS</b> (stanineequivalent)</td><td>4.72</td><td>This is the stanine equivalent (based on all state scores) of the average scale score of this group</td></tr>
<tr><td><b>%BQ</b> (q1pct)</td><td>26.3</td><td>This is the percentage of this group in the first quartile of all state test scores</td></tr>
<tr><td><b>%2Q</b> (q2pct)</td><td>28.7</td><td>This is the percentage in the second quartile</td></tr>
<tr><td><b>%3Q</b> (q3pct)</td><td>28.5</td><td>This is the percentage in the third quartile</td></tr>
<tr><td><b>%TQ</b> (q4pct)</td><td>16.5</td><td>This is the percentage in the fourth quartile</td></tr>
<tr><td><b>%AW</b> (awpct)</td><td>2.5</td><td>This is the percentage of this group on Academic Warning</td></tr>
<tr><td><b>%Blw</b> (blpct)</td><td>10</td><td>This is the percentage of this group Below Standards but not on Academic Warning</td></tr>
<tr><td><b>%Mt</b> (mtpct)</td><td>68.8</td><td>This is the percentage of this group who Meet the Standards but do not Exceed</td></tr>
<tr><td><b>%Ex</b> (expct)</td><td>18.8</td><td>This is the percentage of this group who Exceed the Standards</td></tr>
<tr><td><b>%stn1</b> (s1pct)</td><td>8.8</td><td>This is the percentage of this group who are in the first stanine of all state test scores (Bottom 4%)</td></tr>
<tr><td><b>%stn2</b> (s2pct)</td><td>1.2</td><td>This is the percentage of this group who are in the second stanine (Next 7% of state)</td></tr>
<tr><td><b>%stn3</b> (s3pct)</td><td>11.2</td><td>This is the percentage of this group who are in the third stanine (Next 12% of state)</td></tr>
<tr><td><b>%stn4</b> (s4pct)</td><td>18.3</td><td>This is the percentage of this group who are in the fourth stanine (Next 17% of state)</td></tr>
<tr><td><b>%stn5</b> (s5pct)</td><td>31.8</td><td>This is the percentage of this group who are in the fifth stanine (Middle 20% of state)</td></tr>
<tr><td><b>%stn6</b> (s6pct)</td><td>13.3</td><td>This is the percentage of this group who are in the sixth stanine (Next 17% of state)</td></tr>
<tr><td><b>%stn7</b> (s7pct)</td><td>14.1</td><td>This is the percentage of this group who are in the third stanine (Next 12% of state)</td></tr>
<tr><td><b>%stn8</b> (s8pct)</td><td>1.2</td><td>This is the percentage of this group who are in the eigth stanine (Next 7% of state)</td></tr>
<tr><td><b>%stn9</b> (s9pct)</td><td>0</td><td>This is the percentage of this group who are in the nine stanine (Top 4% of state)</td></tr>
<tr><td><b>#BQ</b> (q1cnt)</td><td>21</td><td>This is the number of this group in the first quartile of all state test scores. </td></tr>
<tr><td><b>#2Q</b> (q2cnt)</td><td>22.9</td><td>This is the number in the second quartile</td></tr>
<tr><td><b>#3Q</b> (q3cnt)</td><td>22.8</td><td>This is the number in the third quartile</td></tr>
<tr><td><b>#TQ</b> (q4cnt)</td><td>13.2</td><td>This is the number in the fourth quartile</td></tr>
<tr><td><b>#AW</b> (totalwarning)</td><td>2</td><td>This is the number of this group on Academic Warning</td></tr>
<tr><td><b>#Blw</b> (totalbelow)</td><td>8</td><td>This is the number of this group Below Standards but not on Academic Warning</td></tr>
<tr><td><b>#Mt</b> (totalmeet)</td><td>55</td><td>This is the number of this group who Meet the Standards but do not Exceed</td></tr>
<tr><td><b>#Ex</b> (totalexceed)</td><td>15</td><td>This is the number of this group who Exceed the Standards</td></tr>
<tr><td><b>s1cnt</b> (s1cnt)</td><td>7</td><td>This is the number of this group who are in the first stanine of all state test scores (Bottom 4%)</td></tr>
<tr><td><b>s2cnt</b> (s2cnt)</td><td>1</td><td>This is the number of this group who are in the second stanine (Next 7% of state)</td></tr>
<tr><td><b>s3cnt</b> (s3cnt)</td><td>9</td><td>This is the number of this group who are in the third stanine (Next 12% of state)</td></tr>
<tr><td><b>s4cnt</b> (s4cnt)</td><td>14.7</td><td>This is the number of this group who are in the fourth stanine (Next 17% of state)</td></tr>
<tr><td><b>s5cnt</b> (s5cnt)</td><td>25.4</td><td>This is the number of this group who are in the fifth stanine (Middle 20% of state)</td></tr>
<tr><td><b>s6cnt</b> (s6cnt)</td><td>10.7</td><td>This is the number of this group who are in the sixth stanine (Next 17% of state)</td></tr>
<tr><td><b>s7cnt</b> (s7cnt)</td><td>11.2</td><td>This is the number of this group who are in the third stanine (Next 12% of state)</td></tr>
<tr><td><b>s8cnt</b> (s8cnt)</td><td>1</td><td>This is the number of this group who are in the eigth stanine (Next 7% of state)</td></tr>
<tr><td><b>s9cnt</b> (s9cnt)</td><td>0</td><td>This is the number of this group who are in the nine stanine (Top 4% of state)</td></tr>
<tr><td><b>q12Score</b> (q12)</td><td>254</td><td>This is the cutoff score at the 25th percentile score</td></tr>
<tr><td><b>q23Score</b> (q23)</td><td>271</td><td>This is the cutoff score at the 50th percentile score</td></tr>
<tr><td><b>q34Score</b> (q34)</td><td>291</td><td>This is the cutoff score at the 75th percentile score</td></tr>
<tr><td><b>belowScore</b> (belowscore)</td><td>221</td><td>This is the cutoff score between Academic Warning and Below Standards</td></tr>
<tr><td><b>meetScore</b> (meetscore)</td><td>246</td><td>This is the cutoff score between Below Standards and Meets Standards</td></tr>
<tr><td><b>exceedScore</b> (exceedscore)</td><td>288</td><td>This is the cutoff score between Meets Standards and Exceeds Standards</td></tr>
<tr><td><b>s12Score</b> (s12)</td><td>231</td><td>This is the cutoff score between the first and second stanine</td></tr>
<tr><td><b>s23Score</b> (s23)</td><td>240</td><td>This is the cutoff score between the second and first stanine</td></tr>
<tr><td><b>s34Score</b> (s34)</td><td>251</td><td>This is the cutoff score between the third and fourth stanine</td></tr>
<tr><td><b>s45Score</b> (s45)</td><td>264</td><td>This is the cutoff score between the fourth and fifth stanine</td></tr>
<tr><td><b>s56Score</b> (s56)</td><td>279</td><td>This is the cutoff score between the fifth and sixth stanine</td></tr>
<tr><td><b>s67Score</b> (s67)</td><td>293</td><td>This is the cutoff score between the sixth and seventh stanine</td></tr>
<tr><td><b>s78Score</b> (s78)</td><td>308</td><td>This is the cutoff score between the seventh and eigth stanine</td></tr>
<tr><td><b>s89Score</b> (s89)</td><td>329</td><td>This is the cutoff score between the eigth and nineth stanine</td></tr>
<tr><td><b>q1deduct</b> (q1deduct)</td><td>1.97336647727273</td><td>This is the number of tests at the first quartile cutoff score that are proportionally over the the 25% mark</td></tr>
<tr><td><b>q2deduct</b> (q2deduct)</td><td>1.0344387755102</td><td>This is the number of tests at the second quartile cutoff score that are proportionally over the the 50% mark</td></tr>
<tr><td><b>q3deduct</b> (q3deduct)</td><td>0.224856779121579</td><td>This is the number of tests at the third quartile cutoff score that are proportionally over the the 75% mark</td></tr>
<tr><td><b>s1deduct</b> (s1deduct)</td><td>0</td><td>This is the number of tests at the first stanine cutoff score that are proportionally over the the 4% mark</td></tr>
<tr><td><b>s2deduct</b> (s2deduct)</td><td>0</td><td>This is the number of tests at the second stanine cutoff score that are proportionally over the the 11% mark</td></tr>
<tr><td><b>s3deduct</b> (s3deduct)</td><td>0</td><td>This is the number of tests at the third stanine cutoff score that are proportionally over the the 23% mark</td></tr>
<tr><td><b>s4deduct</b> (s4deduct)</td><td>0.329117259552041</td><td>This is the number of tests at the fourth stanine cutoff score that are proportionally over the the 40% mark</td></tr>
<tr><td><b>s5deduct</b> (s5deduct)</td><td>0.921271714192064</td><td>This is the number of tests at the fifth stanine cutoff score that are proportionally over the the 60% mark</td></tr>
<tr><td><b>s6deduct</b> (s6deduct)</td><td>0.241622149837133</td><td>This is the number of tests at the sixth stanine cutoff score that are proportionally over the the 77% mark</td></tr>
<tr><td><b>s7deduct</b> (s7deduct)</td><td>0</td><td>This is the number of tests at the first stanine cutoff score that are proportionally over the the 4% mark</td></tr>
<tr><td><b>s8deduct</b> (s8deduct)</td><td>0</td><td>This is the number of tests at the seventh stanine cutoff score that are proportionally over the the 89% mark</td></tr>

	   </table>
	   <h2>FAQ - Frequently Asked Questions</h2>
	   <b>Why do the counts of students in some quartile and stanine groups have decimal values?  How can there be a fraction of a student?</b><br />
	    The reason there are decimals is to account for the fact that there are students just above and just below the given percentile may have the same scale score.  So there is no clean break in determining the quartile or stanine boundary.  To accomodate this in sub-populations, we look at the state data and take all students on the quartile or stanine cutoff score and assign a proportion to the lower quartile or stanine and the remainder (sometimes a decimal) to the next quartile or stanine.  So in the sub-population we use this same proportion to distribute students who land on the quartile or stanine cutoff score, some student are counted towards the lower quartile/stanine and others to the next group.  And often the result of the proportioning is a fraction of a student. <br /><br />
		<b>Why are there no cutoff scores or deduct values for composite scores?</b><br />
		Composite scores agreggate scores from all the grades available.  Each grade has a different cutoff score so we don't use the cutoff scores to calculate this.  See below for a note on how they are calulated.<br /><br />
		<b>How are Composites calculated?</b><br/>
		Compostites are calculated based on the counts in each quartile, stanine, and academic standard group.  The counts are totaled among all the grade levels and tests in the composite group, then the quartile, stanine, and academic standard percentiles are calculated based on the totals.  This is essentially a weighted average of all the percentiles in the target group.
     </div>


	</div>
</div>
</body></html>
