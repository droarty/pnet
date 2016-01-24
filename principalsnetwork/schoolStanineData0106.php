<?PHP 
include 'settings.php';

// Create connection
$sql = new mysqli($servername, $username, $password, $db);


function db_query($q){
    global $sql;
    $r="";
    try{
        $r= $sql->query($q);
    }
    catch(Exception $e){
        var_dump($e);
        exit();
    }
    if(!$r) {
        echo "\n\nERROR: ".$q."\n\n";
        exit();
    }
    return $r;
}
function db_result($res){
    
    if($res&&($row=$res->fetch_assoc())) return current($row);
    else return null;
}
function db_fetch_array($res){
    if(!$res){
        return null;
    }
    try{
    if($row=$res->fetch_assoc()) return $row;
    else return null;
    }
    catch(Exception $e){
        var_dump($e);
        exit();
    }
}
function db_set_active(){
    return null;/// this feature used to swap out active db but now isbe and schooldata are all in same db...
}
function getURLParam($str){
    return (isset($_REQUEST[$str])?$_REQUEST[$str]:"");
}
function queryReplace9s($qstr,$dbtag, $tableAlias=""){
   if($dbtag=='') return $qstr;
   else if(strpos($dbtag,"=")!==false||strpos($dbtag," like ")!==false||strpos($dbtag," in ")!==false) $qstr=str_replace("9=9",$dbtag,$qstr);
   else if(strpos($dbtag,",")!==false) $qstr=str_replace("9=9",$tableAlias."program in (".$dbtag.")",$qstr);
   else  $qstr=str_replace("9=9",$tableAlias."program=".$dbtag."",$qstr);
   return $qstr;
}

function makeDataSetInJS($qname,$qstr, $aoColumns='', $ext='cte',$asObject=false,$append=false){
	$isGdata=false;
    if(getURLParam("gdata")==$qname) $isGdata=true;
	//google.visualization.Query.setResponse({version:'0.6',reqId:'0',status:'ok',sig:'5982206968295329967',table:{cols:[{id:'Col1',label:'',type:'number'},{id:'Col2',label:'',type:'number'},{id:'Col3',label:'',type:'number'}],rows:[{c:[{v:1.0,f:'1'},{v:2.0,f:'2'},{v:3.0,f:'3'}]},{c:[{v:2.0,f:'2'},{v:3.0,f:'3'},{v:4.0,f:'4'}]},{c:[{v:3.0,f:'3'},{v:4.0,f:'4'},{v:5.0,f:'5'}]},{c:[{v:1.0,f:'1'},{v:2.0,f:'2'},{v:3.0,f:'3'}]}]}});

    if(!IsSet($qstr)) return '';
	if(!IsSet($qname)) $qname="data1";
	if(!IsSet($ext)) $ext="cte";
	db_set_active($ext);
    $q=db_query($qstr);
	$i=0;
	$r="";
	$o=array();//if $asObject is true then this object is returned instead of the string $r ...
	global $firstDataSet;
	$cols=array();
	while($rw=db_fetch_array($q)){
	  $newrw=array();//temp holder of object data...

	  //if r=='' then this is the first row... so set up the dataset and initialize cteReportTemplate if necessary...
	  if($r==""){
	  //firstDataSet is a global flag so that preliminaty js can be initialized...
		if($firstDataSet){
			$r=<<<EOF
			<script  type='text/javascript'>
			var popup;
			var cteReportTemplate=dataSetObjects;</script>
EOF;
			$firstDataSet=false;
		};
		$r.="			<script  type='text/javascript'>\nif(!cteReportTemplate['$qname']) cteReportTemplate.newTable('$qname');";
		$sep="";
		//set up fields...
		$rfn="\n ".($append?"if(!cteReportTemplate.$qname.fields) ":"")."cteReportTemplate.$qname.fields=[";
		if($aoColumns){
			$flds=json_decode($aoColumns);
			foreach($flds as $fo){
				if(is_object($fo)&&$fo->field){
$tmprw="";
				  $datakey="";
			      reset($rw);
				  if(array_key_exists($fo->field,$rw))  $datakey=htmlspecialchars($fo->field);
				  else{
				    reset($rw);
				  	foreach(array_keys($rw) as $rwk){
$tmprw.=$rwk." :";
						if(strtolower($rwk)==strtolower($fo->field)) {
							  $datakey=htmlspecialchars($rwk);
							  break;
						};
					};
				  };
				  if($datakey){
					  $cols[]=$datakey;
					  $rfn.=$sep.'{';
					  $fsep="";
					  $fo->field=strtolower($fo->field);
					  foreach($fo as $fitem=>$fval){
						$rfn.=$fsep.'"'.$fitem.'":"'.htmlspecialchars($fval).'"';
						$fsep=",";
					  };
					  $rfn.='}';
					  $sep=",";
				  }
				  else drupal_set_message("Error, column key '$fo->field' not found in query data ($tmprw)",'error');
				}
				else{
					drupal_set_message("Error, key value missing field or otherwise not an object",'error');
				};
			};
		}//end if field data was provided by aoColumns.. otherwise, pull from data below...
		else{
			foreach(array_keys($rw) as $f){
			  $rfn.=$sep.'{"sTitle":"'.htmlspecialchars($f).'","field":"'.htmlspecialchars($f).'"}';
			  $sep=",";
			  $cols[]=htmlspecialchars($f);
			};
		};
		$r.=$rfn;
		$r.="];\n ".($append?"if(!cteReportTemplate.$qname.data) ":"")."cteReportTemplate.$qname.data=[];\n//end if $qname already exists\n";
	  };//end if first roww setup ... 
	  $sep="";
	  $r.="cteReportTemplate.$qname.data.push([";
	  foreach($cols as $fld){
		$f=$rw[$fld];
		$newrw[]=$f;
		$badChars=array("\r","\n","\\");
		$r.=$sep.'"'.htmlspecialchars(str_replace($badChars," ",$f)).'"';
		$sep=",";
	  };
	  $r.="]);\n";
	  $o[]=$newrw;//adds row into object
	  $i++;
	};//end while...
	if($i==0) $r=<<<EOF
    	<script  type='text/javascript'>
		//alert("No data found");;		
		var cteReportTemplate=this.dataSetObjects;
		if(!cteReportTemplate) cteReportTemplate=dataSetObjects;
		if(cteReportTemplate) cteReportTemplate.newTable("$qname");
		/* $qstr */
EOF;

//	if($i>400) $r=''.$r.'        jQuery("#"+settings.bg_id).fadeOut("normal");        jQuery("#"+settings.main_id).fadeOut("normal");'
	//$r=str_replace("var popup;","$.popup.show('Data Loading', 'Please wait...');",$r)."\n  $.popup.hide();";
	$r.="</script>";
	db_set_active('default');
	if($asObject) return $o;
	else return "".$r."";
};
function makeDS($qname,$qstr, $aoColumns='', $ext='cte',$asObject=false){
  $r=makeDataSetInJS($qname,$qstr,$aoColumns,$ext,$asObject);
  return str_replace(array('</script>',"<script>","<script  type='text/javascript'>"),'',$r);
};




$auto=getURLParam('autoSch');
if($auto!=''){
	$x=getURLParam('q');
	if(strrpos($x,',')!==false){
//need to replace ' and make query safe...
		$city=trim(substr($x,strrpos($x,',')+1));
		$x=trim(substr($x,0,strrpos($x,',')));
		if($x==''&&$city=='') exit;
		if($x==''&&$city!='') $q=" city like '".$city."%%' ";
		else if($city=='') $q=" schName like '%%".$x."%%' ";
		else $q=" schName like '%%".$x."%%' and  city like '".$city."%%' ";
	}
	else $q=" schName like '%%".$x."%%' ";
	$q="select cast(group_concat(r separator '\\n') as char) srch from (select cast(concat(schName,'(',city,')','|',schId) as char) r from tblsitemaster where ".$q." limit 40) a";
	$r=db_result(db_query($q));
	print $r;
	exit;
};
function addJSVariableFromNode($varNm,$keyNode){
	$n=node_load($keyNode);
	if($n) return "<scr"."ipt>var ".$varNm.'=[{"colour":"#0000ff","text":"90% Afr. American","field":"B90"},{"colour":"#6666ff","text":"60-90% Afr. American","field":"B60"},{"colour":"#00ff00","text":"90% Latino","field":"L90"},{"colour":"#66ff66","text":"60-90% Latino","field":"L60"},{"colour":"#ff6699","text":"Mixed (none >60%)","field":"Mx"},{"colour":"#ffee00","text":"90% White","field":"W90"},{"colour":"#ffdd99","text":"60-90% White","field":"W60"},{"colour":"#999999","text":"Unknown","field":"Unk"}];;</scr'."ipt>";
	else return "<scr"."ipt>alert('".$keyNode." not a valid node for Variable Import');</scr"."ipt>";
}



global $user;
$output='';
$setup=getURLParam('setup');
if($setup){
	//get catEth...
	$q="select distinct catEth from tblsitemaster";
	  $output.=makeDS("catEthList", $q, false);
	//get catSchType...
	$q="select distinct catSchType from tblsitemaster";
	  $output.=makeDS("catSchTypeList", $q,false);
	
	$output.=' keysEth=[{"colour":"#0000ff","text":"90% Afr. American","field":"B90"},{"colour":"#6666ff","text":"60-90% Afr. American","field":"B60"},{"colour":"#00ff00","text":"90% Latino","field":"L90"},{"colour":"#66ff66","text":"60-90% Latino","field":"L60"},{"colour":"#ff6699","text":"Mixed (none >60%)","field":"Mx"},{"colour":"#ffee00","text":"90% White","field":"W90"},{"colour":"#ffdd99","text":"60-90% White","field":"W60"},{"colour":"#999999","text":"Unknown","field":"Unk"}];';
	$output.='keysType=[{"colour":"#55130","text":"Public IL School","field":"Public_IL_School","dataMatch":"Public IL School"},{"colour":"#ebbc9a","text":"CPS Neighborhood","field":"CPS_Neighborhood","dataMatch":"CPS Neighborhood"},{"colour":"#fd859a","text":"CPS Selective Enrollment","field":"CPS_Selective_Enrollment","dataMatch":"CPS Selective Enrollment"},{"colour":"#1aa496","text":"CPS Magnet","field":"CPS_Magnet","dataMatch":"CPS Magnet"},{"colour":"#b8cb9f","text":"Unknown","field":"Unknown","dataMatch":"Unknown"},{"colour":"#1f4f52","text":"Private","field":"Private","dataMatch":"Private"},{"colour":"#d39a63","text":"CPS Charter","field":"CPS_Charter","dataMatch":"CPS Charter"},{"colour":"#2f0e8","text":"Public Magnet","field":"Public_Magnet","dataMatch":"Public Magnet"}];';
};//end setup...
//do search routine...
$searchStr='';
$search=getURLParam('search');
$city=getURLParam('city');
$sname=getURLParam('sname');
$catEth=getURLParam('catEth');
$catSchType=getURLParam('catSchType');
$addr=getURLParam('addr');
$lat='';
$lon='';
$r='';
$schId='';
$radius='1';
if($addr){
   $radius=getURLParam('radius');
   if(!$radius) $radius='1';
	$r=file_get_contents("http://maps.google.com/maps/geo?q=".urlencode($addr)."&output=json");
	if($r) {
		$rjson=json_decode($r);
		 if(rjson&&$rjson->Placemark&&$rjson->Placemark['0']&&$rjson->Placemark['0']->Point&&$rjson->Placemark['0']->Point->coordinates){
		   $lon=$rjson->Placemark['0']->Point->coordinates['0'];
		   $lat=$rjson->Placemark['0']->Point->coordinates['1'];
			$r='';
		 };
	 }
}
//see if this is a search...
if($catSchType!=''||$catEth!=''||$sname!=''||$city!=''||$schId!=''||($lat&&$lon)) {
	$output='';
	$searchStr="";
	$sep="";
	if($city){ $searchStr.="city like '$city%' ";$sep=" and ";};
	if($sname){ $searchStr.=$sep." schLabel like '$sname%' ";$sep=" and ";};
	if($catEth){ $searchStr.=$sep." catEth like '$catEth%' ";$sep=" and ";};
	if($catSchType){ $searchStr.=$sep." catSchType like '$catSchType%' ";$sep=" and ";};
	if($schId&&$searchStr==''){ $searchStr.=$sep." schId =$schId ";$sep=" and ";};
	if($lat&&$lon) {
		$q=<<<NAMEQ
  select city, schlabel, catEth, catSchType, schid, b.lat, b.lon, grLevel,addr,enrollment, sqrt(pow( a.lat-b.lat,2)+pow(a.lon-b.lon,2)) dist from
(select $lat lat, $lon lon, $radius rad) a
left join tblsitemaster b on ( (b.lat between a.lat-.01*a.rad and a.lat+.01*a.rad) and (b.lon between a.lon-.01*a.rad and a.lon+.01*a.rad))
where $searchStr
order by dist limit 700
NAMEQ;
	}
	else {
	  $q=<<<NAMEQ
	  select city, schlabel, catEth, catSchType, schid, lat, lon, grLevel,addr,enrollment
	  from tblsitemaster
	  where $searchStr limit 700
NAMEQ;
	};
	$aoColName=<<<AOCOLNAME
	  [{"sTitle":"City","field":"city"},{"sTitle":"School Name","field":"schLabel"},{"sTitle":"Ethnicity","field":"catEth"},{"sTitle":"Sch   Type","field":"catSchType"},{"sTitle":"Sch ID","field":"schId"},{"sTitle":"Grade level","field":"grLevel"},{"sTitle":"Lat","field":"lat", "bVisible": false},{"sTitle":"Lon","field":"lon", "bVisible": false},{"sTitle":"Addr","field":"addr", "bVisible": false},{"sTitle":"Enrollment","field":"enrollment", "bVisible": true}]
AOCOLNAME;
	
	$output.=makeDS("nameList", $q,$aoColName);
	$output.="searchPassed=true;";
} //end of if search



$schId=getURLParam('schId');
if($schId){
     //this is a request for sch details...
	if($schId!="q"){
		$q=<<<UINQ
		select * from
		 tblsitemaster where (9=9) limit 700
UINQ;
		$q=queryReplace9s($q,"schid='".$schId."'");
		$output.=makeDS("schDetails", $q);
		//ISBE...
		$cdts=db_result(db_query('select cdts from tblsitemaster where schid='.$schId." limit 1"));
		$searchStr="cdts='".$cdts."'";
		$schName=db_result(db_query('select shortlabel from tblsitemaster where schid='.$schId." limit 1"));
		
	}
	else {//if schId is 'q' then this is an advanced search
		$searchStr=getURLParam('searchStr');
		$schName=getURLParam('name');
		$cdts="NA";
	};
	$q=<<<UINQ
select h.*, q3pct+q4pct paaavg, 
    round(totalWarning/totalCount*100,1) awPct, round(totalBelow/totalCount*100,1) blPct, 
        round(totalMeet/totalCount*100,1) mtPct, round(totalExceed/totalCount*100,1) exPct, '$cdts' cdts,
            if(zp1.z is not null and zp2.z is not null,round((zscore-zp1.z)/(zp2.z-zp1.z)*(zp2.p-zp1.p)+zp1.p,1),0) percentileEquivalent,
    if(totalWarning13>0,round(totalWarning13/totalCount*100,1),null) awPct13, if(totalWarning13>0,round(totalBelow13/totalCount*100,1),null) blPct13, 
        if(totalWarning13>0,round(totalMeet13/totalCount*100,1),null) mtPct13, if(totalWarning13>0,round(totalExceed13/totalCount*100,1),null) exPct13,
            round(5.5+zscore*2,2) stanineEquivalent
 from (
select g.*,'8=8' q, 'PSAE' test,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
  if(totalNotMeeting13>0, round((s9totToHere-totalNotMeeting13)/s9totToHere*100,1),0) pme13, 
  totalNotBelow13 totalWarning13, totalNotMeeting13-totalNotBelow13 totalBelow13,totalNotExceeding13-totalNotMeeting13 totalMeet13, if(totalNotExceeding13>0,s9totToHere-totalNotExceeding13,0) totalExceed13,
   round(if(avgScore<s12,-(s12-avgScore)/(s12-minScore)*1.5-1.75,
    if(avgScore<s23,((avgScore-s23)/(s23-s12)*.5-1.25),
     if(avgScore<s34,((avgScore-s34)/(s34-s23)*.5-.75),
      if(avgScore<s45,((avgScore-s45)/(s45-s34)*.5-.25),
       if(avgScore<s56,((avgScore-s56)/(s56-s45)*.5+.25),
        if(avgScore<s67,((avgScore-s67)/(s67-s56)*.5+.75),
         if(avgScore<s78,((avgScore-s78)/(s78-s67)*.5+1.25),
          if(avgScore<s89,((avgScore-s89)/(s89-s78)*.5+1.75),
           ((avgScore-s89)/(maxScore-s89)*1.5+1.75)
   )))))))),3) zscore,
   round(if(avgScore<s12,(avgScore-minScore)/(s12-minScore)*4,
    if(avgScore<s23,((avgScore-s12)/(s23-s12)*7+4),
     if(avgScore<s34,((avgScore-s23)/(s34-s23)*12+11),
      if(avgScore<s45,((avgScore-s34)/(s45-s34)*17+23),
       if(avgScore<s56,((avgScore-s45)/(s56-s45)*20+40),
        if(avgScore<s67,((avgScore-s56)/(s67-s56)*17+60),
         if(avgScore<s78,((avgScore-s67)/(s78-s67)*12+77),
          if(avgScore<s89,((avgScore-s78)/(s89-s78)*7+89),
           ((avgScore-s89)/(maxScore-s89)*4+96)
   )))))))),1) oldPctEquiv,
   if(avgScore<s12,1,if(avgScore<s23,2, if(avgScore<s34,3, if(avgScore<s45,4, if(avgScore<s56,5,
     if(avgScore<s67,6,  if(avgScore<s78,7,  if(avgScore<s89,8,9)))))))) oldstanineEquivalent,
   round((s1totToHere-s1deduct)/s9totToHere*100,1) s1pct,
   round((s2totToHere-s2deduct-s1totToHere+s1deduct)/s9totToHere*100,1) s2pct,
   round((s3totToHere-s3deduct-s2totToHere+s2deduct)/s9totToHere*100,1) s3pct,
   round((s4totToHere-s4deduct-s3totToHere+s3deduct)/s9totToHere*100,1) s4pct,
   round((s5totToHere-s5deduct-s4totToHere+s4deduct)/s9totToHere*100,1) s5pct,
   round((s6totToHere-s6deduct-s5totToHere+s5deduct)/s9totToHere*100,1) s6pct,
   round((s7totToHere-s7deduct-s6totToHere+s6deduct)/s9totToHere*100,1) s7pct,
   round((s8totToHere-s8deduct-s7totToHere+s7deduct)/s9totToHere*100,1) s8pct,
   round((s9totToHere-s8totToHere+s8deduct)/s9totToHere*100,1) s9pct,
   round((q1totToHere-q1deduct)/q4totToHere*100,1) q1pct,
   round((q2totToHere-q2deduct-q1totToHere+q1deduct)/q4totToHere*100,1) q2pct,
   round((q3totToHere-q3deduct-q2totToHere+q2deduct)/q4totToHere*100,1) q3pct,
   round((q4totToHere-q3totToHere+q3deduct)/q4totToHere*100,1) q4pct,
   round(s1totToHere-s1deduct,1) s1cnt,
   round(s2totToHere-s2deduct-s1totToHere+s1deduct,1) s2cnt,
   round(s3totToHere-s3deduct-s2totToHere+s2deduct,1) s3cnt,
   round(s4totToHere-s4deduct-s3totToHere+s3deduct,1) s4cnt,
   round(s5totToHere-s5deduct-s4totToHere+s4deduct,1) s5cnt,
   round(s6totToHere-s6deduct-s5totToHere+s5deduct,1) s6cnt,
   round(s7totToHere-s7deduct-s6totToHere+s6deduct,1) s7cnt,
   round(s8totToHere-s8deduct-s7totToHere+s7deduct,1) s8cnt,
   round(s9totToHere-s8totToHere+s8deduct,1)  s9cnt,
   round(q1totToHere-q1deduct,1) q1cnt,
   round(q2totToHere-q2deduct-q1totToHere+q1deduct,1) q2cnt,
   round(q3totToHere-q3deduct-q2totToHere+q2deduct,1) q3cnt,
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt
from (
select d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(s.label) label, max(s.subject) subject, max(s.below) belowScore, max(s.meet) meetScore, max(s.exceed) exceedScore,
       max(if(score<s.below,totalToHere,0)) totalNotBelow,
       max(if(score<s.meet,totalToHere,0)) totalNotMeeting,
       max(if(score<s.exceed,totalToHere,0)) totalNotExceeding,
       max(s13.below) belowScore13, max(s13.meet) meetScore13, max(s13.exceed) exceedScore13,
       max(if(score<s13.below,totalToHere,0)) totalNotBelow13,
       max(if(score<s13.meet,totalToHere,0)) totalNotMeeting13,
       max(if(score<s13.exceed,totalToHere,0)) totalNotExceeding13,
       max(score) maxScore, min(score) minScore,
       sum(score*thisCnt)/sum(thisCnt) avgScore,
       max(s12) s12, max(if(score<=s12,totalToHere,0)) s1totToHere, max(if(score=s12,(1-s12pct)*thisCnt,0)) s1deduct,
       max(s23) s23, max(if(score<=s23,totalToHere,0)) s2totToHere, max(if(score=s23,(1-s23pct)*thisCnt,0)) s2deduct,
       max(s34) s34, max(if(score<=s34,totalToHere,0)) s3totToHere, max(if(score=s34,(1-s34pct)*thisCnt,0)) s3deduct,
       max(s45) s45, max(if(score<=s45,totalToHere,0)) s4totToHere, max(if(score=s45,(1-s45pct)*thisCnt,0)) s4deduct,
       max(s56) s56, max(if(score<=s56,totalToHere,0)) s5totToHere, max(if(score=s56,(1-s56pct)*thisCnt,0)) s5deduct,
       max(s67) s67, max(if(score<=s67,totalToHere,0)) s6totToHere, max(if(score=s67,(1-s67pct)*thisCnt,0)) s6deduct,
       max(s78) s78, max(if(score<=s78,totalToHere,0)) s7totToHere, max(if(score=s78,(1-s78pct)*thisCnt,0)) s7deduct,
       max(s89) s89, max(if(score<=s89,totalToHere,0)) s8totToHere, max(if(score=s89,(1-s89pct)*thisCnt,0)) s8deduct,
       max(totalToHere) s9totToHere,
       max(q12) q12, max(if(score<=q12,totalToHere,0)) q1totToHere, max(if(score=q12,(1-q12pct)*thisCnt,0)) q1deduct,
       max(q23) q23, max(if(score<=q23,totalToHere,0)) q2totToHere, max(if(score=q23,(1-q23pct)*thisCnt,0)) q2deduct,
       max(q34) q34, max(if(score<=q34,totalToHere,0)) q3totToHere, max(if(score=q34,(1-q34pct)*thisCnt,0)) q3deduct,
       max(totalToHere) q4totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessepsReads, b.cnt from (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where rIsat>0 and rIsat is not null and  test='PSAE' and (9=9)
      group by rIsat,year,gradeLevel) a
     left join (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where rIsat>0 and rIsat is not null  and  test='PSAE' and (9=9)
       group by rIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=if(d.year<2006,2001,2006) and s.gradeLevel=d.gradeLevel and s.label='PSAE Reading')
   left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='PSAE Reading')
group by d.year, d.gradeLevel
) g

union
select g.*,'8=8' q, 'PSAE' test,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
  if(totalnotMeeting13>0,round((s9totToHere-totalNotMeeting13)/s9totToHere*100,1),null) pme13, 
  totalNotBelow13 totalWarning13, totalNotMeeting13-totalNotBelow13 totalBelow13,totalNotExceeding13-totalNotMeeting13 totalMeet13, if(totalNotExceeding13>0,s9totToHere-totalNotExceeding13,0) totalExceed13,
   round(if(avgScore<s12,-(s12-avgScore)/(s12-minScore)*1.5-1.75,
    if(avgScore<s23,((avgScore-s23)/(s23-s12)*.5-1.25),
     if(avgScore<s34,((avgScore-s34)/(s34-s23)*.5-.75),
      if(avgScore<s45,((avgScore-s45)/(s45-s34)*.5-.25),
       if(avgScore<s56,((avgScore-s56)/(s56-s45)*.5+.25),
        if(avgScore<s67,((avgScore-s67)/(s67-s56)*.5+.75),
         if(avgScore<s78,((avgScore-s78)/(s78-s67)*.5+1.25),
          if(avgScore<s89,((avgScore-s89)/(s89-s78)*.5+1.75),
           ((avgScore-s89)/(maxScore-s89)*1.5+1.75)
   )))))))),3) zscore,
   round(if(avgScore<s12,(avgScore-minScore)/(s12-minScore)*4,
    if(avgScore<s23,((avgScore-s12)/(s23-s12)*7+4),
     if(avgScore<s34,((avgScore-s23)/(s34-s23)*12+11),
      if(avgScore<s45,((avgScore-s34)/(s45-s34)*17+23),
       if(avgScore<s56,((avgScore-s45)/(s56-s45)*20+40),
        if(avgScore<s67,((avgScore-s56)/(s67-s56)*17+60),
         if(avgScore<s78,((avgScore-s67)/(s78-s67)*12+77),
          if(avgScore<s89,((avgScore-s78)/(s89-s78)*7+89),
           ((avgScore-s89)/(maxScore-s89)*4+96)
   )))))))),1) oldPctEquiv,
   if(avgScore<s12,1,if(avgScore<s23,2, if(avgScore<s34,3, if(avgScore<s45,4, if(avgScore<s56,5,
     if(avgScore<s67,6,  if(avgScore<s78,7,  if(avgScore<s89,8,9)))))))) oldstanineEquivalent,
   round((s1totToHere-s1deduct)/s9totToHere*100,1) s1pct,
   round((s2totToHere-s2deduct-s1totToHere+s1deduct)/s9totToHere*100,1) s2pct,
   round((s3totToHere-s3deduct-s2totToHere+s2deduct)/s9totToHere*100,1) s3pct,
   round((s4totToHere-s4deduct-s3totToHere+s3deduct)/s9totToHere*100,1) s4pct,
   round((s5totToHere-s5deduct-s4totToHere+s4deduct)/s9totToHere*100,1) s5pct,
   round((s6totToHere-s6deduct-s5totToHere+s5deduct)/s9totToHere*100,1) s6pct,
   round((s7totToHere-s7deduct-s6totToHere+s6deduct)/s9totToHere*100,1) s7pct,
   round((s8totToHere-s8deduct-s7totToHere+s7deduct)/s9totToHere*100,1) s8pct,
   round((s9totToHere-s8totToHere+s8deduct)/s9totToHere*100,1) s9pct,
   round((q1totToHere-q1deduct)/q4totToHere*100,1) q1pct,
   round((q2totToHere-q2deduct-q1totToHere+q1deduct)/q4totToHere*100,1) q2pct,
   round((q3totToHere-q3deduct-q2totToHere+q2deduct)/q4totToHere*100,1) q3pct,
   round((q4totToHere-q3totToHere+q3deduct)/q4totToHere*100,1) q4pct,
   round(s1totToHere-s1deduct,1) s1cnt,
   round(s2totToHere-s2deduct-s1totToHere+s1deduct,1) s2cnt,
   round(s3totToHere-s3deduct-s2totToHere+s2deduct,1) s3cnt,
   round(s4totToHere-s4deduct-s3totToHere+s3deduct,1) s4cnt,
   round(s5totToHere-s5deduct-s4totToHere+s4deduct,1) s5cnt,
   round(s6totToHere-s6deduct-s5totToHere+s5deduct,1) s6cnt,
   round(s7totToHere-s7deduct-s6totToHere+s6deduct,1) s7cnt,
   round(s8totToHere-s8deduct-s7totToHere+s7deduct,1) s8cnt,
   round(s9totToHere-s8totToHere+s8deduct,1)  s9cnt,
   round(q1totToHere-q1deduct,1) q1cnt,
   round(q2totToHere-q2deduct-q1totToHere+q1deduct,1) q2cnt,
   round(q3totToHere-q3deduct-q2totToHere+q2deduct,1) q3cnt,
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt
from (
select d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(s.label) label, max(s.subject) subject, max(s.below) belowScore, max(s.meet) meetScore, max(s.exceed) exceedScore,
       max(if(score<s.below,totalToHere,0)) totalNotBelow,
       max(if(score<s.meet,totalToHere,0)) totalNotMeeting,
       max(if(score<s.exceed,totalToHere,0)) totalNotExceeding,
       max(s13.below) belowScore13, max(s13.meet) meetScore13, max(s13.exceed) exceedScore13,
       max(if(score<s13.below,totalToHere,0)) totalNotBelow13,
       max(if(score<s13.meet,totalToHere,0)) totalNotMeeting13,
       max(if(score<s13.exceed,totalToHere,0)) totalNotExceeding13,
       max(score) maxScore, min(score) minScore,
       sum(score*thisCnt)/sum(thisCnt) avgScore,
       max(s12) s12, max(if(score<=s12,totalToHere,0)) s1totToHere, max(if(score=s12,(1-s12pct)*thisCnt,0)) s1deduct,
       max(s23) s23, max(if(score<=s23,totalToHere,0)) s2totToHere, max(if(score=s23,(1-s23pct)*thisCnt,0)) s2deduct,
       max(s34) s34, max(if(score<=s34,totalToHere,0)) s3totToHere, max(if(score=s34,(1-s34pct)*thisCnt,0)) s3deduct,
       max(s45) s45, max(if(score<=s45,totalToHere,0)) s4totToHere, max(if(score=s45,(1-s45pct)*thisCnt,0)) s4deduct,
       max(s56) s56, max(if(score<=s56,totalToHere,0)) s5totToHere, max(if(score=s56,(1-s56pct)*thisCnt,0)) s5deduct,
       max(s67) s67, max(if(score<=s67,totalToHere,0)) s6totToHere, max(if(score=s67,(1-s67pct)*thisCnt,0)) s6deduct,
       max(s78) s78, max(if(score<=s78,totalToHere,0)) s7totToHere, max(if(score=s78,(1-s78pct)*thisCnt,0)) s7deduct,
       max(s89) s89, max(if(score<=s89,totalToHere,0)) s8totToHere, max(if(score=s89,(1-s89pct)*thisCnt,0)) s8deduct,
       max(totalToHere) s9totToHere,
       max(q12) q12, max(if(score<=q12,totalToHere,0)) q1totToHere, max(if(score=q12,(1-q12pct)*thisCnt,0)) q1deduct,
       max(q23) q23, max(if(score<=q23,totalToHere,0)) q2totToHere, max(if(score=q23,(1-q23pct)*thisCnt,0)) q2deduct,
       max(q34) q34, max(if(score<=q34,totalToHere,0)) q3totToHere, max(if(score=q34,(1-q34pct)*thisCnt,0)) q3deduct,
       max(totalToHere) q4totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessepsMaths, b.cnt from (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where mIsat>0 and mIsat is not null and  test='PSAE' and (9=9)
      group by mIsat,year,gradeLevel) a
     left join (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where mIsat>0 and mIsat is not null and  test='PSAE' and (9=9)
       group by mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=if(d.year<2006,2001,2006) and s.gradeLevel=d.gradeLevel and s.label='PSAE Mathematics')
   left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='PSAE Mathematics')
group by d.year, d.gradeLevel
) g
union
select g.*,'8=8' q, 'PSAE' test,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
  if(totalnotMeeting13>0,round((s9totToHere-totalNotMeeting13)/s9totToHere*100,1),null) pme13, 
  totalNotBelow13 totalWarning13, totalNotMeeting13-totalNotBelow13 totalBelow13,totalNotExceeding13-totalNotMeeting13 totalMeet13, if(totalNotExceeding13>0,s9totToHere-totalNotExceeding13,0) totalExceed13,
   round(if(avgScore<s12,-(s12-avgScore)/(s12-minScore)*1.5-1.75,
    if(avgScore<s23,((avgScore-s23)/(s23-s12)*.5-1.25),
     if(avgScore<s34,((avgScore-s34)/(s34-s23)*.5-.75),
      if(avgScore<s45,((avgScore-s45)/(s45-s34)*.5-.25),
       if(avgScore<s56,((avgScore-s56)/(s56-s45)*.5+.25),
        if(avgScore<s67,((avgScore-s67)/(s67-s56)*.5+.75),
         if(avgScore<s78,((avgScore-s78)/(s78-s67)*.5+1.25),
          if(avgScore<s89,((avgScore-s89)/(s89-s78)*.5+1.75),
           ((avgScore-s89)/(maxScore-s89)*1.5+1.75)
   )))))))),3) zscore,
   round(if(avgScore<s12,(avgScore-minScore)/(s12-minScore)*4,
    if(avgScore<s23,((avgScore-s12)/(s23-s12)*7+4),
     if(avgScore<s34,((avgScore-s23)/(s34-s23)*12+11),
      if(avgScore<s45,((avgScore-s34)/(s45-s34)*17+23),
       if(avgScore<s56,((avgScore-s45)/(s56-s45)*20+40),
        if(avgScore<s67,((avgScore-s56)/(s67-s56)*17+60),
         if(avgScore<s78,((avgScore-s67)/(s78-s67)*12+77),
          if(avgScore<s89,((avgScore-s78)/(s89-s78)*7+89),
           ((avgScore-s89)/(maxScore-s89)*4+96)
   )))))))),1) oldPctEquiv,
   if(avgScore<s12,1,if(avgScore<s23,2, if(avgScore<s34,3, if(avgScore<s45,4, if(avgScore<s56,5,
     if(avgScore<s67,6,  if(avgScore<s78,7,  if(avgScore<s89,8,9)))))))) oldstanineEquivalent,
   round((s1totToHere-s1deduct)/s9totToHere*100,1) s1pct,
   round((s2totToHere-s2deduct-s1totToHere+s1deduct)/s9totToHere*100,1) s2pct,
   round((s3totToHere-s3deduct-s2totToHere+s2deduct)/s9totToHere*100,1) s3pct,
   round((s4totToHere-s4deduct-s3totToHere+s3deduct)/s9totToHere*100,1) s4pct,
   round((s5totToHere-s5deduct-s4totToHere+s4deduct)/s9totToHere*100,1) s5pct,
   round((s6totToHere-s6deduct-s5totToHere+s5deduct)/s9totToHere*100,1) s6pct,
   round((s7totToHere-s7deduct-s6totToHere+s6deduct)/s9totToHere*100,1) s7pct,
   round((s8totToHere-s8deduct-s7totToHere+s7deduct)/s9totToHere*100,1) s8pct,
   round((s9totToHere-s8totToHere+s8deduct)/s9totToHere*100,1) s9pct,
   round((q1totToHere-q1deduct)/q4totToHere*100,1) q1pct,
   round((q2totToHere-q2deduct-q1totToHere+q1deduct)/q4totToHere*100,1) q2pct,
   round((q3totToHere-q3deduct-q2totToHere+q2deduct)/q4totToHere*100,1) q3pct,
   round((q4totToHere-q3totToHere+q3deduct)/q4totToHere*100,1) q4pct,
   round(s1totToHere-s1deduct,1) s1cnt,
   round(s2totToHere-s2deduct-s1totToHere+s1deduct,1) s2cnt,
   round(s3totToHere-s3deduct-s2totToHere+s2deduct,1) s3cnt,
   round(s4totToHere-s4deduct-s3totToHere+s3deduct,1) s4cnt,
   round(s5totToHere-s5deduct-s4totToHere+s4deduct,1) s5cnt,
   round(s6totToHere-s6deduct-s5totToHere+s5deduct,1) s6cnt,
   round(s7totToHere-s7deduct-s6totToHere+s6deduct,1) s7cnt,
   round(s8totToHere-s8deduct-s7totToHere+s7deduct,1) s8cnt,
   round(s9totToHere-s8totToHere+s8deduct,1)  s9cnt,
   round(q1totToHere-q1deduct,1) q1cnt,
   round(q2totToHere-q2deduct-q1totToHere+q1deduct,1) q2cnt,
   round(q3totToHere-q3deduct-q2totToHere+q2deduct,1) q3cnt,
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt
from (
select d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(s.label) label, max(s.subject) subject, max(s.below) belowScore, max(s.meet) meetScore, max(s.exceed) exceedScore,
       max(if(score<s.below,totalToHere,0)) totalNotBelow,
       max(if(score<s.meet,totalToHere,0)) totalNotMeeting,
       max(if(score<s.exceed,totalToHere,0)) totalNotExceeding,
       max(s13.below) belowScore13, max(s13.meet) meetScore13, max(s13.exceed) exceedScore13,
       max(if(score<s13.below,totalToHere,0)) totalNotBelow13,
       max(if(score<s13.meet,totalToHere,0)) totalNotMeeting13,
       max(if(score<s13.exceed,totalToHere,0)) totalNotExceeding13,
       max(score) maxScore, min(score) minScore,
       sum(score*thisCnt)/sum(thisCnt) avgScore,
       max(s12) s12, max(if(score<=s12,totalToHere,0)) s1totToHere, max(if(score=s12,(1-s12pct)*thisCnt,0)) s1deduct,
       max(s23) s23, max(if(score<=s23,totalToHere,0)) s2totToHere, max(if(score=s23,(1-s23pct)*thisCnt,0)) s2deduct,
       max(s34) s34, max(if(score<=s34,totalToHere,0)) s3totToHere, max(if(score=s34,(1-s34pct)*thisCnt,0)) s3deduct,
       max(s45) s45, max(if(score<=s45,totalToHere,0)) s4totToHere, max(if(score=s45,(1-s45pct)*thisCnt,0)) s4deduct,
       max(s56) s56, max(if(score<=s56,totalToHere,0)) s5totToHere, max(if(score=s56,(1-s56pct)*thisCnt,0)) s5deduct,
       max(s67) s67, max(if(score<=s67,totalToHere,0)) s6totToHere, max(if(score=s67,(1-s67pct)*thisCnt,0)) s6deduct,
       max(s78) s78, max(if(score<=s78,totalToHere,0)) s7totToHere, max(if(score=s78,(1-s78pct)*thisCnt,0)) s7deduct,
       max(s89) s89, max(if(score<=s89,totalToHere,0)) s8totToHere, max(if(score=s89,(1-s89pct)*thisCnt,0)) s8deduct,
       max(totalToHere) s9totToHere,
       max(q12) q12, max(if(score<=q12,totalToHere,0)) q1totToHere, max(if(score=q12,(1-q12pct)*thisCnt,0)) q1deduct,
       max(q23) q23, max(if(score<=q23,totalToHere,0)) q2totToHere, max(if(score=q23,(1-q23pct)*thisCnt,0)) q2deduct,
       max(q34) q34, max(if(score<=q34,totalToHere,0)) q3totToHere, max(if(score=q34,(1-q34pct)*thisCnt,0)) q3deduct,
       max(totalToHere) q4totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessepsScis, b.cnt from (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where sciIsat>0 and sciIsat is not null and  test='PSAE' and (9=9)
      group by sciIsat,year,gradeLevel) a
     left join (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where sciIsat>0 and sciIsat is not null and  test='PSAE' and (9=9)
       group by sciIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=if(d.year<2006,2001,2006) and s.gradeLevel=d.gradeLevel and s.label='PSAE Science')
   left join (select  year,gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='PSAE Science')
group by d.year, d.gradeLevel
) g
union
select g.*,'8=8' q, 'ISAT' test,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
  if(totalnotMeeting13>0,round((s9totToHere-totalNotMeeting13)/s9totToHere*100,1),null) pme13, 
  totalNotBelow13 totalWarning13, totalNotMeeting13-totalNotBelow13 totalBelow13,totalNotExceeding13-totalNotMeeting13 totalMeet13, if(totalNotExceeding13>0,s9totToHere-totalNotExceeding13,0) totalExceed13,
   round(if(avgScore<s12,-(s12-avgScore)/(s12-minScore)*1.5-1.75,
    if(avgScore<s23,((avgScore-s23)/(s23-s12)*.5-1.25),
     if(avgScore<s34,((avgScore-s34)/(s34-s23)*.5-.75),
      if(avgScore<s45,((avgScore-s45)/(s45-s34)*.5-.25),
       if(avgScore<s56,((avgScore-s56)/(s56-s45)*.5+.25),
        if(avgScore<s67,((avgScore-s67)/(s67-s56)*.5+.75),
         if(avgScore<s78,((avgScore-s78)/(s78-s67)*.5+1.25),
          if(avgScore<s89,((avgScore-s89)/(s89-s78)*.5+1.75),
           ((avgScore-s89)/(maxScore-s89)*1.5+1.75)
   )))))))),3) zscore,
   round(if(avgScore<s12,(avgScore-minScore)/(s12-minScore)*4,
    if(avgScore<s23,((avgScore-s12)/(s23-s12)*7+4),
     if(avgScore<s34,((avgScore-s23)/(s34-s23)*12+11),
      if(avgScore<s45,((avgScore-s34)/(s45-s34)*17+23),
       if(avgScore<s56,((avgScore-s45)/(s56-s45)*20+40),
        if(avgScore<s67,((avgScore-s56)/(s67-s56)*17+60),
         if(avgScore<s78,((avgScore-s67)/(s78-s67)*12+77),
          if(avgScore<s89,((avgScore-s78)/(s89-s78)*7+89),
           ((avgScore-s89)/(maxScore-s89)*4+96)
   )))))))),1) oldPctEquiv,
   if(avgScore<s12,1,if(avgScore<s23,2, if(avgScore<s34,3, if(avgScore<s45,4, if(avgScore<s56,5,
     if(avgScore<s67,6,  if(avgScore<s78,7,  if(avgScore<s89,8,9)))))))) oldstanineEquivalent,
   round((s1totToHere-s1deduct)/s9totToHere*100,1) s1pct,
   round((s2totToHere-s2deduct-s1totToHere+s1deduct)/s9totToHere*100,1) s2pct,
   round((s3totToHere-s3deduct-s2totToHere+s2deduct)/s9totToHere*100,1) s3pct,
   round((s4totToHere-s4deduct-s3totToHere+s3deduct)/s9totToHere*100,1) s4pct,
   round((s5totToHere-s5deduct-s4totToHere+s4deduct)/s9totToHere*100,1) s5pct,
   round((s6totToHere-s6deduct-s5totToHere+s5deduct)/s9totToHere*100,1) s6pct,
   round((s7totToHere-s7deduct-s6totToHere+s6deduct)/s9totToHere*100,1) s7pct,
   round((s8totToHere-s8deduct-s7totToHere+s7deduct)/s9totToHere*100,1) s8pct,
   round((s9totToHere-s8totToHere+s8deduct)/s9totToHere*100,1) s9pct,
   round((q1totToHere-q1deduct)/q4totToHere*100,1) q1pct,
   round((q2totToHere-q2deduct-q1totToHere+q1deduct)/q4totToHere*100,1) q2pct,
   round((q3totToHere-q3deduct-q2totToHere+q2deduct)/q4totToHere*100,1) q3pct,
   round((q4totToHere-q3totToHere+q3deduct)/q4totToHere*100,1) q4pct,
   round(s1totToHere-s1deduct,1) s1cnt,
   round(s2totToHere-s2deduct-s1totToHere+s1deduct,1) s2cnt,
   round(s3totToHere-s3deduct-s2totToHere+s2deduct,1) s3cnt,
   round(s4totToHere-s4deduct-s3totToHere+s3deduct,1) s4cnt,
   round(s5totToHere-s5deduct-s4totToHere+s4deduct,1) s5cnt,
   round(s6totToHere-s6deduct-s5totToHere+s5deduct,1) s6cnt,
   round(s7totToHere-s7deduct-s6totToHere+s6deduct,1) s7cnt,
   round(s8totToHere-s8deduct-s7totToHere+s7deduct,1) s8cnt,
   round(s9totToHere-s8totToHere+s8deduct,1)  s9cnt,
   round(q1totToHere-q1deduct,1) q1cnt,
   round(q2totToHere-q2deduct-q1totToHere+q1deduct,1) q2cnt,
   round(q3totToHere-q3deduct-q2totToHere+q2deduct,1) q3cnt,
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt
from (
select d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(s.label) label, max(s.subject) subject, max(s.below) belowScore, max(s.meet) meetScore, max(s.exceed) exceedScore,
       max(if(score<s.below,totalToHere,0)) totalNotBelow,
       max(if(score<s.meet,totalToHere,0)) totalNotMeeting,
       max(if(score<s.exceed,totalToHere,0)) totalNotExceeding,
       max(s13.below) belowScore13, max(s13.meet) meetScore13, max(s13.exceed) exceedScore13,
       max(if(score<s13.below,totalToHere,0)) totalNotBelow13,
       max(if(score<s13.meet,totalToHere,0)) totalNotMeeting13,
       max(if(score<s13.exceed,totalToHere,0)) totalNotExceeding13,
       max(score) maxScore, min(score) minScore,
       sum(score*thisCnt)/sum(thisCnt) avgScore,
       max(s12) s12, max(if(score<=s12,totalToHere,0)) s1totToHere, max(if(score=s12,(1-s12pct)*thisCnt,0)) s1deduct,
       max(s23) s23, max(if(score<=s23,totalToHere,0)) s2totToHere, max(if(score=s23,(1-s23pct)*thisCnt,0)) s2deduct,
       max(s34) s34, max(if(score<=s34,totalToHere,0)) s3totToHere, max(if(score=s34,(1-s34pct)*thisCnt,0)) s3deduct,
       max(s45) s45, max(if(score<=s45,totalToHere,0)) s4totToHere, max(if(score=s45,(1-s45pct)*thisCnt,0)) s4deduct,
       max(s56) s56, max(if(score<=s56,totalToHere,0)) s5totToHere, max(if(score=s56,(1-s56pct)*thisCnt,0)) s5deduct,
       max(s67) s67, max(if(score<=s67,totalToHere,0)) s6totToHere, max(if(score=s67,(1-s67pct)*thisCnt,0)) s6deduct,
       max(s78) s78, max(if(score<=s78,totalToHere,0)) s7totToHere, max(if(score=s78,(1-s78pct)*thisCnt,0)) s7deduct,
       max(s89) s89, max(if(score<=s89,totalToHere,0)) s8totToHere, max(if(score=s89,(1-s89pct)*thisCnt,0)) s8deduct,
       max(totalToHere) s9totToHere,
       max(q12) q12, max(if(score<=q12,totalToHere,0)) q1totToHere, max(if(score=q12,(1-q12pct)*thisCnt,0)) q1deduct,
       max(q23) q23, max(if(score<=q23,totalToHere,0)) q2totToHere, max(if(score=q23,(1-q23pct)*thisCnt,0)) q2deduct,
       max(q34) q34, max(if(score<=q34,totalToHere,0)) q3totToHere, max(if(score=q34,(1-q34pct)*thisCnt,0)) q3deduct,
       max(totalToHere) q4totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessesciIsats, b.cnt from (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where sciIsat>0 and sciIsat is not null and  test='ISAT' and (9=9)
      group by sciIsat,year,gradeLevel) a
     left join (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where sciIsat>0 and sciIsat is not null  and  test='ISAT' and (9=9)
       group by sciIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=if(d.year<2006,2001,2006) and s.gradeLevel=d.gradeLevel and s.label='ISAT Science')
   left join (select  year,gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='ISAT Science')
group by d.year, d.gradeLevel
) g
union
select g.*,'8=8' q, 'ISAT' test,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
  if(totalnotMeeting13>0,round((s9totToHere-totalNotMeeting13)/s9totToHere*100,1),null) pme13, 
  totalNotBelow13 totalWarning13, totalNotMeeting13-totalNotBelow13 totalBelow13,totalNotExceeding13-totalNotMeeting13 totalMeet13, if(totalNotExceeding13>0,s9totToHere-totalNotExceeding13,0) totalExceed13,
  round(if(avgScore<s12,-(s12-avgScore)/(s12-minScore)*1.5-1.75,
    if(avgScore<s23,((avgScore-s23)/(s23-s12)*.5-1.25),
     if(avgScore<s34,((avgScore-s34)/(s34-s23)*.5-.75),
      if(avgScore<s45,((avgScore-s45)/(s45-s34)*.5-.25),
       if(avgScore<s56,((avgScore-s56)/(s56-s45)*.5+.25),
        if(avgScore<s67,((avgScore-s67)/(s67-s56)*.5+.75),
         if(avgScore<s78,((avgScore-s78)/(s78-s67)*.5+1.25),
          if(avgScore<s89,((avgScore-s89)/(s89-s78)*.5+1.75),
           ((avgScore-s89)/(maxScore-s89)*1.5+1.75)
   )))))))),3) zscore,
   round(if(avgScore<s12,(avgScore-minScore)/(s12-minScore)*4,
    if(avgScore<s23,((avgScore-s12)/(s23-s12)*7+4),
     if(avgScore<s34,((avgScore-s23)/(s34-s23)*12+11),
      if(avgScore<s45,((avgScore-s34)/(s45-s34)*17+23),
       if(avgScore<s56,((avgScore-s45)/(s56-s45)*20+40),
        if(avgScore<s67,((avgScore-s56)/(s67-s56)*17+60),
         if(avgScore<s78,((avgScore-s67)/(s78-s67)*12+77),
          if(avgScore<s89,((avgScore-s78)/(s89-s78)*7+89),
           ((avgScore-s89)/(maxScore-s89)*4+96)
   )))))))),1) oldPctEquiv,
   if(avgScore<s12,1,if(avgScore<s23,2, if(avgScore<s34,3, if(avgScore<s45,4, if(avgScore<s56,5,
     if(avgScore<s67,6,  if(avgScore<s78,7,  if(avgScore<s89,8,9)))))))) oldstanineEquivalent,
   round((s1totToHere-s1deduct)/s9totToHere*100,1) s1pct,
   round((s2totToHere-s2deduct-s1totToHere+s1deduct)/s9totToHere*100,1) s2pct,
   round((s3totToHere-s3deduct-s2totToHere+s2deduct)/s9totToHere*100,1) s3pct,
   round((s4totToHere-s4deduct-s3totToHere+s3deduct)/s9totToHere*100,1) s4pct,
   round((s5totToHere-s5deduct-s4totToHere+s4deduct)/s9totToHere*100,1) s5pct,
   round((s6totToHere-s6deduct-s5totToHere+s5deduct)/s9totToHere*100,1) s6pct,
   round((s7totToHere-s7deduct-s6totToHere+s6deduct)/s9totToHere*100,1) s7pct,
   round((s8totToHere-s8deduct-s7totToHere+s7deduct)/s9totToHere*100,1) s8pct,
   round((s9totToHere-s8totToHere+s8deduct)/s9totToHere*100,1) s9pct,
   round((q1totToHere-q1deduct)/q4totToHere*100,1) q1pct,
   round((q2totToHere-q2deduct-q1totToHere+q1deduct)/q4totToHere*100,1) q2pct,
   round((q3totToHere-q3deduct-q2totToHere+q2deduct)/q4totToHere*100,1) q3pct,
   round((q4totToHere-q3totToHere+q3deduct)/q4totToHere*100,1) q4pct,
   round(s1totToHere-s1deduct,1) s1cnt,
   round(s2totToHere-s2deduct-s1totToHere+s1deduct,1) s2cnt,
   round(s3totToHere-s3deduct-s2totToHere+s2deduct,1) s3cnt,
   round(s4totToHere-s4deduct-s3totToHere+s3deduct,1) s4cnt,
   round(s5totToHere-s5deduct-s4totToHere+s4deduct,1) s5cnt,
   round(s6totToHere-s6deduct-s5totToHere+s5deduct,1) s6cnt,
   round(s7totToHere-s7deduct-s6totToHere+s6deduct,1) s7cnt,
   round(s8totToHere-s8deduct-s7totToHere+s7deduct,1) s8cnt,
   round(s9totToHere-s8totToHere+s8deduct,1)  s9cnt,
   round(q1totToHere-q1deduct,1) q1cnt,
   round(q2totToHere-q2deduct-q1totToHere+q1deduct,1) q2cnt,
   round(q3totToHere-q3deduct-q2totToHere+q2deduct,1) q3cnt,
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt
from (
select d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(s.label) label, max(s.subject) subject, max(s.below) belowScore, max(s.meet) meetScore, max(s.exceed) exceedScore,
       max(if(score<s.below,totalToHere,0)) totalNotBelow,
       max(if(score<s.meet,totalToHere,0)) totalNotMeeting,
       max(if(score<s.exceed,totalToHere,0)) totalNotExceeding,
       max(s13.below) belowScore13, max(s13.meet) meetScore13, max(s13.exceed) exceedScore13,
       max(if(score<s13.below,totalToHere,0)) totalNotBelow13,
       max(if(score<s13.meet,totalToHere,0)) totalNotMeeting13,
       max(if(score<s13.exceed,totalToHere,0)) totalNotExceeding13,
       max(score) maxScore, min(score) minScore,
       sum(score*thisCnt)/sum(thisCnt) avgScore,
       max(s12) s12, max(if(score<=s12,totalToHere,0)) s1totToHere, max(if(score=s12,(1-s12pct)*thisCnt,0)) s1deduct,
       max(s23) s23, max(if(score<=s23,totalToHere,0)) s2totToHere, max(if(score=s23,(1-s23pct)*thisCnt,0)) s2deduct,
       max(s34) s34, max(if(score<=s34,totalToHere,0)) s3totToHere, max(if(score=s34,(1-s34pct)*thisCnt,0)) s3deduct,
       max(s45) s45, max(if(score<=s45,totalToHere,0)) s4totToHere, max(if(score=s45,(1-s45pct)*thisCnt,0)) s4deduct,
       max(s56) s56, max(if(score<=s56,totalToHere,0)) s5totToHere, max(if(score=s56,(1-s56pct)*thisCnt,0)) s5deduct,
       max(s67) s67, max(if(score<=s67,totalToHere,0)) s6totToHere, max(if(score=s67,(1-s67pct)*thisCnt,0)) s6deduct,
       max(s78) s78, max(if(score<=s78,totalToHere,0)) s7totToHere, max(if(score=s78,(1-s78pct)*thisCnt,0)) s7deduct,
       max(s89) s89, max(if(score<=s89,totalToHere,0)) s8totToHere, max(if(score=s89,(1-s89pct)*thisCnt,0)) s8deduct,
       max(totalToHere) s9totToHere,
       max(q12) q12, max(if(score<=q12,totalToHere,0)) q1totToHere, max(if(score=q12,(1-q12pct)*thisCnt,0)) q1deduct,
       max(q23) q23, max(if(score<=q23,totalToHere,0)) q2totToHere, max(if(score=q23,(1-q23pct)*thisCnt,0)) q2deduct,
       max(q34) q34, max(if(score<=q34,totalToHere,0)) q3totToHere, max(if(score=q34,(1-q34pct)*thisCnt,0)) q3deduct,
       max(totalToHere) q4totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessemIsats, b.cnt from (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where mIsat>0 and mIsat is not null  and  test='ISAT' and (9=9)
      group by mIsat,year,gradeLevel) a
     left join (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where mIsat>0 and mIsat is not null  and  test='ISAT' and (9=9)
       group by mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=if(d.year<2006,2001,2006) and s.gradeLevel=d.gradeLevel and s.label='ISAT Mathematics')
   left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='ISAT Mathematics')
group by d.year, d.gradeLevel
) g
union
select g.*,'8=8' q, 'ISAT' test,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount, 
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
  if(totalnotMeeting13>0,round((s9totToHere-totalNotMeeting13)/s9totToHere*100,1),null) pme13, 
  totalNotBelow13 totalWarning13, totalNotMeeting13-totalNotBelow13 totalBelow13,totalNotExceeding13-totalNotMeeting13 totalMeet13, if(totalNotExceeding13>0,s9totToHere-totalNotExceeding13,0) totalExceed13,
   round(if(avgScore<s12,-(s12-avgScore)/(s12-minScore)*1.5-1.75,
    if(avgScore<s23,((avgScore-s23)/(s23-s12)*.5-1.25),
     if(avgScore<s34,((avgScore-s34)/(s34-s23)*.5-.75),
      if(avgScore<s45,((avgScore-s45)/(s45-s34)*.5-.25),
       if(avgScore<s56,((avgScore-s56)/(s56-s45)*.5+.25),
        if(avgScore<s67,((avgScore-s67)/(s67-s56)*.5+.75),
         if(avgScore<s78,((avgScore-s78)/(s78-s67)*.5+1.25),
          if(avgScore<s89,((avgScore-s89)/(s89-s78)*.5+1.75),
           ((avgScore-s89)/(maxScore-s89)*1.5+1.75)
   )))))))),3) zscore,
   round(if(avgScore<s12,(avgScore-minScore)/(s12-minScore)*4,
    if(avgScore<s23,((avgScore-s12)/(s23-s12)*7+4),
     if(avgScore<s34,((avgScore-s23)/(s34-s23)*12+11),
      if(avgScore<s45,((avgScore-s34)/(s45-s34)*17+23),
       if(avgScore<s56,((avgScore-s45)/(s56-s45)*20+40),
        if(avgScore<s67,((avgScore-s56)/(s67-s56)*17+60),
         if(avgScore<s78,((avgScore-s67)/(s78-s67)*12+77),
          if(avgScore<s89,((avgScore-s78)/(s89-s78)*7+89),
           ((avgScore-s89)/(maxScore-s89)*4+96)
   )))))))),1) oldPctEquiv,
   if(avgScore<s12,1,if(avgScore<s23,2, if(avgScore<s34,3, if(avgScore<s45,4, if(avgScore<s56,5,
     if(avgScore<s67,6,  if(avgScore<s78,7,  if(avgScore<s89,8,9)))))))) oldstanineEquivalent,
   round((s1totToHere-s1deduct)/s9totToHere*100,1) s1pct,
   round((s2totToHere-s2deduct-s1totToHere+s1deduct)/s9totToHere*100,1) s2pct,
   round((s3totToHere-s3deduct-s2totToHere+s2deduct)/s9totToHere*100,1) s3pct,
   round((s4totToHere-s4deduct-s3totToHere+s3deduct)/s9totToHere*100,1) s4pct,
   round((s5totToHere-s5deduct-s4totToHere+s4deduct)/s9totToHere*100,1) s5pct,
   round((s6totToHere-s6deduct-s5totToHere+s5deduct)/s9totToHere*100,1) s6pct,
   round((s7totToHere-s7deduct-s6totToHere+s6deduct)/s9totToHere*100,1) s7pct,
   round((s8totToHere-s8deduct-s7totToHere+s7deduct)/s9totToHere*100,1) s8pct,
   round((s9totToHere-s8totToHere+s8deduct)/s9totToHere*100,1) s9pct,
   round((q1totToHere-q1deduct)/q4totToHere*100,1) q1pct,
   round((q2totToHere-q2deduct-q1totToHere+q1deduct)/q4totToHere*100,1) q2pct,
   round((q3totToHere-q3deduct-q2totToHere+q2deduct)/q4totToHere*100,1) q3pct,
   round((q4totToHere-q3totToHere+q3deduct)/q4totToHere*100,1) q4pct,
   round(s1totToHere-s1deduct,1) s1cnt,
   round(s2totToHere-s2deduct-s1totToHere+s1deduct,1) s2cnt,
   round(s3totToHere-s3deduct-s2totToHere+s2deduct,1) s3cnt,
   round(s4totToHere-s4deduct-s3totToHere+s3deduct,1) s4cnt,
   round(s5totToHere-s5deduct-s4totToHere+s4deduct,1) s5cnt,
   round(s6totToHere-s6deduct-s5totToHere+s5deduct,1) s6cnt,
   round(s7totToHere-s7deduct-s6totToHere+s6deduct,1) s7cnt,
   round(s8totToHere-s8deduct-s7totToHere+s7deduct,1) s8cnt,
   round(s9totToHere-s8totToHere+s8deduct,1)  s9cnt,
   round(q1totToHere-q1deduct,1) q1cnt,
   round(q2totToHere-q2deduct-q1totToHere+q1deduct,1) q2cnt,
   round(q3totToHere-q3deduct-q2totToHere+q2deduct,1) q3cnt,
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt
from (
select d.year, d.gradeLevel,d.year-d.gradeLevel+12 cohort,
       max(s.label) label, max(s.subject) subject, max(s.below) belowScore, max(s.meet) meetScore, max(s.exceed) exceedScore,
       max(if(score<s.below,totalToHere,0)) totalNotBelow,
       max(if(score<s.meet,totalToHere,0)) totalNotMeeting,
       max(if(score<s.exceed,totalToHere,0)) totalNotExceeding,
       max(s13.below) belowScore13, max(s13.meet) meetScore13, max(s13.exceed) exceedScore13,
       max(if(score<s13.below,totalToHere,0)) totalNotBelow13,
       max(if(score<s13.meet,totalToHere,0)) totalNotMeeting13,
       max(if(score<s13.exceed,totalToHere,0)) totalNotExceeding13,
       max(score) maxScore, min(score) minScore,
       sum(score*thisCnt)/sum(thisCnt) avgScore,
       max(s12) s12, max(if(score<=s12,totalToHere,0)) s1totToHere, max(if(score=s12,(1-s12pct)*thisCnt,0)) s1deduct,
       max(s23) s23, max(if(score<=s23,totalToHere,0)) s2totToHere, max(if(score=s23,(1-s23pct)*thisCnt,0)) s2deduct,
       max(s34) s34, max(if(score<=s34,totalToHere,0)) s3totToHere, max(if(score=s34,(1-s34pct)*thisCnt,0)) s3deduct,
       max(s45) s45, max(if(score<=s45,totalToHere,0)) s4totToHere, max(if(score=s45,(1-s45pct)*thisCnt,0)) s4deduct,
       max(s56) s56, max(if(score<=s56,totalToHere,0)) s5totToHere, max(if(score=s56,(1-s56pct)*thisCnt,0)) s5deduct,
       max(s67) s67, max(if(score<=s67,totalToHere,0)) s6totToHere, max(if(score=s67,(1-s67pct)*thisCnt,0)) s6deduct,
       max(s78) s78, max(if(score<=s78,totalToHere,0)) s7totToHere, max(if(score=s78,(1-s78pct)*thisCnt,0)) s7deduct,
       max(s89) s89, max(if(score<=s89,totalToHere,0)) s8totToHere, max(if(score=s89,(1-s89pct)*thisCnt,0)) s8deduct,
       max(totalToHere) s9totToHere,
       max(q12) q12, max(if(score<=q12,totalToHere,0)) q1totToHere, max(if(score=q12,(1-q12pct)*thisCnt,0)) q1deduct,
       max(q23) q23, max(if(score<=q23,totalToHere,0)) q2totToHere, max(if(score=q23,(1-q23pct)*thisCnt,0)) q2deduct,
       max(q34) q34, max(if(score<=q34,totalToHere,0)) q3totToHere, max(if(score=q34,(1-q34pct)*thisCnt,0)) q3deduct,
       max(totalToHere) q4totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lesserIsats, b.cnt from (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where rIsat>0 and rIsat is not null and  test='ISAT'  and (9=9)
      group by rIsat,year,gradeLevel) a
     left join (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where rIsat>0 and rIsat is not null  and  test='ISAT' and (9=9)
       group by rIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=if(d.year<2006,2001,2006) and s.gradeLevel=d.gradeLevel and s.label='ISAT Reading')
   left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='ISAT Reading')
group by d.year, d.gradeLevel
) g
) h 
left join ztopconversion zp1 on (zp1.z>=h.zscore and zp1.z<h.zscore+0.006)
left join ztopconversion zp2 on zp2.z=zp1.z+0.006
order by label, gradeLevel desc, year desc
UINQ;

//,{"sTitle":"Old stanineAvgSS","field":"oldstanineEquivalent"},{"sTitle":"Old %ileAvgSS","field":"oldPctEquiv"}
        $colnames=<<<UINQ
[{"sTitle":"Query","field":"q"},{"sTitle":"cdts","field":"cdts"},{"sTitle":"group","field":"label"},{"sTitle":"subject","field":"subject"},{"sTitle":"test","field":"test"},{"sTitle":"cohort","field":"cohort"},{"sTitle":"grade","field":"gradeLevel"},{"sTitle":"maxScore","field":"maxScore"},{"sTitle":"minScore","field":"minScore"},
    {"sTitle":"avgScore","field":"avgScore"},{"sTitle":"zscore","field":"zscore"},{"sTitle":"stanineAvgSS","field":"stanineEquivalent"},
    {"sTitle":"year","field":"year"},{"sTitle":"#Tst","field":"totalCount"},{"sTitle":"%ME","field":"pme"},{"sTitle":"%ME13","field":"pme13"},{"sTitle":"%AAAvg","field":"paaavg"},{"sTitle":"%ileAvgSS","field":"percentileEquivalent"}
,{"sTitle":"%BQ","field":"q1pct"},{"sTitle":"%2Q","field":"q2pct"},{"sTitle":"%3Q","field":"q3pct"},{"sTitle":"%TQ","field":"q4pct"}
,{"sTitle":"%AW","field":"awPct"},{"sTitle":"%Blw","field":"blPct"},{"sTitle":"%Mt","field":"mtPct"},{"sTitle":"%Ex","field":"exPct"}
,{"sTitle":"%AW13","field":"awPct13"},{"sTitle":"%Blw13","field":"blPct13"},{"sTitle":"%Mt13","field":"mtPct13"},{"sTitle":"%Ex13","field":"exPct13"}
,{"sTitle":"%stn1","field":"s1pct"},{"sTitle":"%stn2","field":"s2pct"},{"sTitle":"%stn3","field":"s3pct"},{"sTitle":"%stn4","field":"s4pct"},{"sTitle":"%stn5","field":"s5pct"},{"sTitle":"%stn6","field":"s6pct"},{"sTitle":"%stn7","field":"s7pct"},{"sTitle":"%stn8","field":"s8pct"},{"sTitle":"%stn9","field":"s9pct"}
,{"sTitle":"#BQ","field":"q1cnt"},{"sTitle":"#2Q","field":"q2cnt"},{"sTitle":"#3Q","field":"q3cnt"},{"sTitle":"#TQ","field":"q4cnt"}
,{"sTitle":"#AW","field":"totalWarning"},{"sTitle":"#Blw","field":"totalBelow"},{"sTitle":"#Mt","field":"totalMeet"},{"sTitle":"#Ex","field":"totalExceed"}
,{"sTitle":"#AW13","field":"totalWarning13"},{"sTitle":"#Blw13","field":"totalBelow13"},{"sTitle":"#Mt13","field":"totalMeet13"},{"sTitle":"#Ex13","field":"totalExceed13"}
,{"sTitle":"s1cnt","field":"s1cnt"},{"sTitle":"s2cnt","field":"s2cnt"},{"sTitle":"s3cnt","field":"s3cnt"},{"sTitle":"s4cnt","field":"s4cnt"},{"sTitle":"s5cnt","field":"s5cnt"},{"sTitle":"s6cnt","field":"s6cnt"},{"sTitle":"s7cnt","field":"s7cnt"},{"sTitle":"s8cnt","field":"s8cnt"},{"sTitle":"s9cnt","field":"s9cnt"}
,{"sTitle":"q12Score","field":"q12"},{"sTitle":"q23Score","field":"q23"},{"sTitle":"q34Score","field":"q34"}
,{"sTitle":"belowScore","field":"belowScore"},{"sTitle":"meetScore","field":"meetScore"},{"sTitle":"exceedScore","field":"exceedScore"}
,{"sTitle":"belowScore13","field":"belowScore13"},{"sTitle":"meetScore13","field":"meetScore13"},{"sTitle":"exceedScore13","field":"exceedScore13"}
,{"sTitle":"s12Score","field":"s12"},{"sTitle":"s23Score","field":"s23"},{"sTitle":"s34Score","field":"s34"},{"sTitle":"s45Score","field":"s45"},{"sTitle":"s56Score","field":"s56"},{"sTitle":"s67Score","field":"s67"},{"sTitle":"s78Score","field":"s78"},{"sTitle":"s89Score","field":"s89"}
,{"sTitle":"q1deduct","field":"q1deduct"},{"sTitle":"q2deduct","field":"q2deduct"},{"sTitle":"q3deduct","field":"q3deduct"}
,{"sTitle":"s1deduct","field":"s1deduct"},{"sTitle":"s2deduct","field":"s2deduct"},{"sTitle":"s3deduct","field":"s3deduct"},{"sTitle":"s4deduct","field":"s4deduct"},{"sTitle":"s5deduct","field":"s5deduct"},{"sTitle":"s6deduct","field":"s6deduct"},{"sTitle":"s7deduct","field":"s7deduct"},{"sTitle":"s8deduct","field":"s8deduct"}]
UINQ;
	$q=str_replace("8=8",$schName,$q);
	$q=queryReplace9s($q,$searchStr);
	$output.=makeDS("schISBE", $q, $colnames,'isbe');
	$output.="var schname='".$schName."';";
	$output.='var searchStr="'.$searchStr.'";/*  '.$q.'  */';
};//end schID detail request....

 header('Content-Type: text/javascript; charset=utf-8');
 echo $output;
 exit();


?>