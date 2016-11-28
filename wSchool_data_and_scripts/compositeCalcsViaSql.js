function create_files(i) {
  return function() {
    var config = require('./config.js');
    var mysql = require('mysql');
    var connection = mysql.createConnection(config);
    connection.connect(function(err, con) {
      if(err) console.log("Connection error for " + con + ":" + err);
    });

    var request = countyDataRequests[i];
    var query = fullQuery.replace(/\|query\|/g, request.query)
    query = query.replace("|cdts|", request.cdts).replace("|label|", request.label)
    console.log("creating " + request.file + (new Date().toLocaleString()) )
    connection.query(query, function(err, data) {
      console.log("creating " + request.file)
      if (err) console.log("ERROR:"+err);
      else create_file(request, data)
    });
    connection.end()
  }
}

function create_file(request, data) {
  var fs = require("fs");
  var heading = "q,cdts,label,subject,test,year,gradelevel,cohort,totalcount,maxscore,minscore,avgscore,zscore,stanineequivalent,paaavg,percentileequivalent,q1pct,q2pct,q3pct,q4pct,mss,paamed,paa60,paa68,s1pct,s2pct,s3pct,s4pct,s5pct,s6pct,s7pct,s8pct,s9pct,p1pct,p2pct,p3pct,p4pct,p5pct,pme,pme13,awpct,blpct,mtpct,expct,awpct13,blpct13,mtpct13,expct13,q1cnt,q2cnt,q3cnt,q4cnt,cntaa50,cntaa60,cntaa68,s1cnt,s2cnt,s3cnt,s4cnt,s5cnt,s6cnt,s7cnt,s8cnt,s9cnt,p1cnt,p2cnt,p3cnt,p4cnt,p5cnt,totalwarning,totalbelow,totalmeet,totalexceed,totalwarning13,totalbelow13,totalmeet13,totalexceed13,q12,q23,q34,s12,s23,s34,s45,s56,s67,s78,s89,p12,p23,p34,p45,belowscore,meetscore,exceedscore,belowscore13,meetscore13,exceedscore13,q1deduct,q2deduct,q3deduct,s1deduct,s2deduct,s3deduct,s4deduct,s5deduct,s6deduct,s7deduct,s8deduct,p1deduct,p2deduct,p3deduct,p4deduct";
  var headingArray = heading.split(",")
  var output = heading, sep = "";
  for (var i = 0; i < data.length; i++) {
    output += "\n";
    for (var j = 0; j < headingArray.length; j++) {
      if (j<5) {
        output += sep + '"' + data[i][headingArray[j]] +'"';
      }
      else {
        output += sep + data[i][headingArray[j]];
      }
      sep = ",";
    };
    sep = "";
  };
  fs.writeFile(request.file + '.csv', output, function (err) {
    if (err) throw err;
        console.log('Saved!' + (new Date().toLocaleString()) );
    }
  );
}

var countyDataRequests = [
  {file: "mchenry_like_063", label: "'McHenry County'", cdts: "'x063%'", query: "cdts like 'x063%'"},
  {file: "lake_like_049", label: "'Lake County'", cdts: "'x049%'", query: "cdts like 'x049%'"},
  {file: "kane_like_045", label: "'Kane County'", cdts: "'x045%'", query: "cdts like 'x045%'"},
  {file: "dupage_like_022", label: "'DuPage County'", cdts: "'x022%'", query: "cdts like 'x022%'"},
  {file: "cook_like_016", label: "'Cook County'", cdts: "'x016%'", query: "cdts like 'x016%'"},
  {file: "will_like_99", label: "'Will County'", cdts: "'x099%'", query: "cdts like 'x099%'"},
  {file: "cps_like_016299", label: "'CPS Only'", cdts: "'x016299%'", query: "cdts like 'x016299%'"},
  {file: "suburban_cook_wo_cps_like_016_not_299", label: "'Cook wo CPS'", cdts: "'x016% not 299'", query: "cdts like 'x016%' and cdts not like 'x016299%'"},
  {file: "state_wo_cps_not_299", label: "'State wo CPS County'", cdts: "'not x016299%'", query: "cdts not like 'x016299%'"}
]

var compositeTypes = `select if(test_group + subject_group + grade_group >0, 'Composite ', '') composite, concat_ws(', ', testlabel, subjlabel, grlabel) comp_label,
   matching_test, matching_subject, matching_gradelevel, testlabel, subjlabel, grlabel
from (
	select 0 test_group, tl testlabel, tl matching_test from (
	SELECT
	distinct (test) tl FROM isbe_tests) tl
	union
	select 1 test_group, 'All Tests' testlabel, tl matching_test from (
	SELECT
	distinct (test) tl FROM isbe_tests) tl
) test
join
(
	select 0 subject_group, sl subjlabel, sl matching_subject from (
	SELECT
	distinct (subject) sl FROM isbe_tests) sl
	union
	select 1 subject_group, 'Math and Reading' subjlabel, sl matching_subject from (
	SELECT
	distinct (subject) sl FROM isbe_tests where subject !='Science') sl
) subject
join
(
	select 0 grade_group, gl grlabel, gl matching_gradelevel from (
	SELECT
	distinct(gradeLevel) gl FROM pnet.isbe_tests) gl
	union
	select 1 grade_group, 'All Grades' grlabel, gl matching_gradelevel from (
	SELECT
	distinct(gradeLevel) gl FROM pnet.isbe_tests) gl
	union
	select 1 grade_group, 'Gr 3 to 5' grlabel, gl matching_gradelevel from (
	SELECT
	distinct(gradeLevel) gl FROM pnet.isbe_tests where gradeLevel in ('03', '04', '05')) gl
	union
	select 1 grade_group, 'Gr 6 to 8' grlabel, gl matching_gradelevel from (
	SELECT
	distinct(gradeLevel) gl FROM pnet.isbe_tests where gradeLevel in ('06', '07', '08')) gl
  union
	select 1 grade_group, 'Gr 3 to 8' grlabel, gl matching_gradelevel from (
	SELECT
	distinct(gradeLevel) gl FROM pnet.isbe_tests where gradeLevel in ('03', '04', '05', '06', '07', '08')) gl
	union
	select 1 grade_group, 'Gr HS' grlabel, gl matching_gradelevel from (
	SELECT
	distinct(gradeLevel) gl FROM pnet.isbe_tests where gradeLevel not in ('03', '04', '05', '06', '07', '08')) gl
) grlevel`;


var fullQuery = `select |label| q, |cdts| cdts, if(composite is null, max(z.label), concat(composite, comp_label)) label, c.subjlabel subject, c.testlabel test, year, c.grlabel gradelevel,
  if(count(distinct cohort)=1, max(cohort), '') cohort,
  sum(totalcount) totalcount,
  if(composite is null,max(maxscore), '') maxscore,
  if(composite is null,max(minscore), '') minscore,
  if(composite is null,max(avgscore), '') avgscore,
  if(composite is null, max(zscore), sum(zscore*totalcount)/sum(totalcount)) zscore,
  if(composite is null, max(stanineequivalent), sum(stanineequivalent*totalcount)/sum(totalcount)) stanineequivalent,
  if(composite is null, max(paaavg), sum(paaavg*totalcount)/sum(totalcount)) paaavg,
  if(composite is null, max(percentileequivalent), sum(percentileequivalent*totalcount)/sum(totalcount)) percentileequivalent,
  if(composite is null, max(q1pct), sum(q1pct*totalcount)/sum(totalcount)) q1pct,
  if(composite is null, max(q2pct), sum(q2pct*totalcount)/sum(totalcount)) q2pct,
  if(composite is null, max(q3pct), sum(q3pct*totalcount)/sum(totalcount)) q3pct,
  if(composite is null, max(q4pct), sum(q4pct*totalcount)/sum(totalcount)) q4pct,
  if(composite is null, max(mss), '') mss,
  if(composite is null, max(paamed), sum(paamed*totalcount)/sum(totalcount)) paamed,
  if(composite is null, max(paa60), sum(paa60*totalcount)/sum(totalcount)) paa60,
  if(composite is null, max(paa68), sum(paa68*totalcount)/sum(totalcount)) paa68,
  if(composite is null, max(s1pct), sum(s1pct*totalcount)/sum(totalcount)) s1pct,
  if(composite is null, max(s2pct), sum(s2pct*totalcount)/sum(totalcount)) s2pct,
  if(composite is null, max(s3pct), sum(s3pct*totalcount)/sum(totalcount)) s3pct,
  if(composite is null, max(s4pct), sum(s4pct*totalcount)/sum(totalcount)) s4pct,
  if(composite is null, max(s5pct), sum(s5pct*totalcount)/sum(totalcount)) s5pct,
  if(composite is null, max(s6pct), sum(s6pct*totalcount)/sum(totalcount)) s6pct,
  if(composite is null, max(s7pct), sum(s7pct*totalcount)/sum(totalcount)) s7pct,
  if(composite is null, max(s8pct), sum(s8pct*totalcount)/sum(totalcount)) s8pct,
  if(composite is null, max(s9pct), sum(s9pct*totalcount)/sum(totalcount)) s9pct,
  if(composite is null, max(p1pct), sum(p1pct*totalcount)/sum(totalcount)) p1pct,
  if(composite is null, max(p2pct), sum(p2pct*totalcount)/sum(totalcount)) p2pct,
  if(composite is null, max(p3pct), sum(p3pct*totalcount)/sum(totalcount)) p3pct,
  if(composite is null, max(p4pct), sum(p4pct*totalcount)/sum(totalcount)) p4pct,
  if(composite is null, max(p5pct), sum(p5pct*totalcount)/sum(totalcount)) p5pct,
  if(composite is null, max(pme), sum(pme*totalcount)/sum(totalcount)) pme,
  if(composite is null, max(pme13), sum(pme13*totalcount)/sum(totalcount)) pme13,
  if(composite is null, max(awpct), sum(awpct*totalcount)/sum(totalcount)) awpct,
  if(composite is null, max(blpct), sum(blpct*totalcount)/sum(totalcount)) blpct,
  if(composite is null, max(mtpct), sum(mtpct*totalcount)/sum(totalcount)) mtpct,
  if(composite is null, max(expct), sum(expct*totalcount)/sum(totalcount)) expct,
  if(composite is null, max(awpct13), sum(awpct13*totalcount)/sum(totalcount)) awpct13,
  if(composite is null, max(blpct13), sum(blpct13*totalcount)/sum(totalcount)) blpct13,
  if(composite is null, max(mtpct13), sum(mtpct13*totalcount)/sum(totalcount)) mtpct13,
  if(composite is null, max(expct13), sum(expct13*totalcount)/sum(totalcount)) expct13,
  sum(q1cnt) q1cnt,
  sum(q2cnt) q2cnt,
  sum(q3cnt) q3cnt,
  sum(q4cnt) q4cnt,
  sum(cntaa50) cntaa50,
  sum(cntaa60) cntaa60,
  sum(cntaa68) cntaa68,
  sum(s1cnt) s1cnt,
  sum(s2cnt) s2cnt,
  sum(s3cnt) s3cnt,
  sum(s4cnt) s4cnt,
  sum(s5cnt) s5cnt,
  sum(s6cnt) s6cnt,
  sum(s7cnt) s7cnt,
  sum(s8cnt) s8cnt,
  sum(s9cnt) s9cnt,
  sum(p1cnt) p1cnt,
  sum(p2cnt) p2cnt,
  sum(p3cnt) p3cnt,
  sum(p4cnt) p4cnt,
  sum(p5cnt) p5cnt,
  sum(totalwarning) totalwarning,
  sum(totalbelow) totalbelow,
  sum(totalmeet) totalmeet,
  sum(totalexceed) totalexceed,
  sum(totalwarning13) totalwarning13,
  sum(totalbelow13) totalbelow13,
  sum(totalmeet13) totalmeet13,
  sum(totalexceed13) totalexceed13,
  if(composite is null, max(q12), '') q12,
  if(composite is null, max(q23), '') q23,
  if(composite is null, max(q34), '') q34,
  if(composite is null, max(s12), '') s12,
  if(composite is null, max(s23), '') s23,
  if(composite is null, max(s34), '') s34,
  if(composite is null, max(s45), '') s45,
  if(composite is null, max(s56), '') s56,
  if(composite is null, max(s67), '') s67,
  if(composite is null, max(s78), '') s78,
  if(composite is null, max(s89), '') s89,
  if(composite is null, max(p12), '') p12,
  if(composite is null, max(p23), '') p23,
  if(composite is null, max(p34), '') p34,
  if(composite is null, max(p45), '') p45,
  if(composite is null, max(belowscore), '') belowscore,
  if(composite is null, max(meetscore), '') meetscore,
  if(composite is null, max(exceedscore), '') exceedscore,
  if(composite is null, max(belowscore13), '') belowscore13,
  if(composite is null, max(meetscore13), '') meetscore13,
  if(composite is null, max(exceedscore13), '') exceedscore13,
  if(composite is null, max(q1deduct), '') q1deduct,
  if(composite is null, max(q2deduct), '') q2deduct,
  if(composite is null, max(q3deduct), '') q3deduct,
  if(composite is null, max(s1deduct), '') s1deduct,
  if(composite is null, max(s2deduct), '') s2deduct,
  if(composite is null, max(s3deduct), '') s3deduct,
  if(composite is null, max(s4deduct), '') s4deduct,
  if(composite is null, max(s5deduct), '') s5deduct,
  if(composite is null, max(s6deduct), '') s6deduct,
  if(composite is null, max(s7deduct), '') s7deduct,
  if(composite is null, max(s8deduct), '') s8deduct,
  if(composite is null, max(p1deduct), '') p1deduct,
  if(composite is null, max(p2deduct), '') p2deduct,
  if(composite is null, max(p3deduct), '') p3deduct,
  if(composite is null, max(p4deduct), '') p4deduct
from (
select h.*, q3pct+q4pct paaavg,
  round(totalWarning/totalCount*100,1) awPct, round(totalBelow/totalCount*100,1) blPct,
        round(totalMeet/totalCount*100,1) mtPct, round(totalExceed/totalCount*100,1) exPct, 'x0162990252886' cdts,
            if(zp1.z is not null and zp2.z is not null,round((zscore-zp1.z)/(zp2.z-zp1.z)*(zp2.p-zp1.p)+zp1.p,1),0) percentileEquivalent,
    if(totalWarning13>0,round(totalWarning13/totalCount*100,1),null) awPct13, if(totalWarning13>0,round(totalBelow13/totalCount*100,1),null) blPct13,
        if(totalWarning13>0,round(totalMeet13/totalCount*100,1),null) mtPct13, if(totalWarning13>0,round(totalExceed13/totalCount*100,1),null) exPct13,
            round(5.5+zscore*2,2) stanineEquivalent
 from (
select g.*,'Chavez' q, 'ISAT' test,
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
   round(100 - (60thtotToHere-60thdeduct)/s9totToHere*100,1) paa60,
   round(100 - (68thtotToHere-68thdeduct)/s9totToHere*100,1) paa68,
   round((q4totToHere - q2totToHere+q2deduct)/q4totToHere*100,1) paamed,
   q23 mss,
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
   round((p1totToHere-p1deduct)/p5totToHere*100,1) p1pct,
   round((p2totToHere-p2deduct-p1totToHere+p1deduct)/p5totToHere*100,1) p2pct,
   round((p3totToHere-p3deduct-p2totToHere+p2deduct)/p5totToHere*100,1) p3pct,
   round((p4totToHere-p4deduct-p3totToHere+p3deduct)/p5totToHere*100,1) p4pct,
   round((p5totToHere-p4totToHere+p4deduct)/p5totToHere*100,1) p5pct,
   round(s9totToHere - 60thtotToHere+60thdeduct,1) cntaa60,
   round(s9totToHere - 68thtotToHere+68thdeduct,1) cntaa68,
   round(q4totToHere - q2totToHere+q2deduct,1) cntaa50,
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
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt,
   round(p1totToHere-p1deduct,1) p1cnt,
   round(p2totToHere-p2deduct-p1totToHere+p1deduct,1) p2cnt,
   round(p3totToHere-p3deduct-p2totToHere+p2deduct,1) p3cnt,
   round(p4totToHere-p4deduct-p3totToHere+p3deduct,1) p4cnt,
   round(p5totToHere-p4totToHere+p4deduct,1) p5cnt
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
       max(60th) 60th, max(if(score<=60th,totalToHere,0)) 60thtotToHere, max(if(score=60th,(1-60thpct)*thisCnt,0)) 60thdeduct,
       max(68th) 68th, max(if(score<=68th,totalToHere,0)) 68thtotToHere, max(if(score=68th,(1-68thpct)*thisCnt,0)) 68thdeduct,
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
       max(totalToHere) q4totToHere,
       max(p12) p12, max(if(score<=p12,totalToHere,0)) p1totToHere, max(if(score=p12,(1-p12pct)*thisCnt,0)) p1deduct,
       max(p23) p23, max(if(score<=p23,totalToHere,0)) p2totToHere, max(if(score=p23,(1-p23pct)*thisCnt,0)) p2deduct,
       max(p34) p34, max(if(score<=p34,totalToHere,0)) p3totToHere, max(if(score=p34,(1-p34pct)*thisCnt,0)) p3deduct,
       max(p45) p45, max(if(score<=p45,totalToHere,0)) p4totToHere, max(if(score=p45,(1-p45pct)*thisCnt,0)) p4deduct,
       max(totalToHere) p5totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.cnt from (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where mIsat>0 and mIsat is not null and  test='ISAT'  and (|query|)
      group by mIsat,year,gradeLevel) a
     left join (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where mIsat>0 and mIsat is not null  and  test='ISAT' and (|query|)
       group by mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='ISAT Mathematics')
   left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='ISAT Mathematics')
group by d.year, d.gradeLevel
) g union select g.*,'Chavez' q, 'ISAT' test,
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
   round(100 - (60thtotToHere-60thdeduct)/s9totToHere*100,1) paa60,
   round(100 - (68thtotToHere-68thdeduct)/s9totToHere*100,1) paa68,
   round((q4totToHere - q2totToHere+q2deduct)/q4totToHere*100,1) paamed,
   q23 mss,
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
   round((p1totToHere-p1deduct)/p5totToHere*100,1) p1pct,
   round((p2totToHere-p2deduct-p1totToHere+p1deduct)/p5totToHere*100,1) p2pct,
   round((p3totToHere-p3deduct-p2totToHere+p2deduct)/p5totToHere*100,1) p3pct,
   round((p4totToHere-p4deduct-p3totToHere+p3deduct)/p5totToHere*100,1) p4pct,
   round((p5totToHere-p4totToHere+p4deduct)/p5totToHere*100,1) p5pct,
   round(s9totToHere - 60thtotToHere+60thdeduct,1) cntaa60,
   round(s9totToHere - 68thtotToHere+68thdeduct,1) cntaa68,
   round(q4totToHere - q2totToHere+q2deduct,1) cntaa50,
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
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt,
   round(p1totToHere-p1deduct,1) p1cnt,
   round(p2totToHere-p2deduct-p1totToHere+p1deduct,1) p2cnt,
   round(p3totToHere-p3deduct-p2totToHere+p2deduct,1) p3cnt,
   round(p4totToHere-p4deduct-p3totToHere+p3deduct,1) p4cnt,
   round(p5totToHere-p4totToHere+p4deduct,1) p5cnt
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
       max(60th) 60th, max(if(score<=60th,totalToHere,0)) 60thtotToHere, max(if(score=60th,(1-60thpct)*thisCnt,0)) 60thdeduct,
       max(68th) 68th, max(if(score<=68th,totalToHere,0)) 68thtotToHere, max(if(score=68th,(1-68thpct)*thisCnt,0)) 68thdeduct,
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
       max(totalToHere) q4totToHere,
       max(p12) p12, max(if(score<=p12,totalToHere,0)) p1totToHere, max(if(score=p12,(1-p12pct)*thisCnt,0)) p1deduct,
       max(p23) p23, max(if(score<=p23,totalToHere,0)) p2totToHere, max(if(score=p23,(1-p23pct)*thisCnt,0)) p2deduct,
       max(p34) p34, max(if(score<=p34,totalToHere,0)) p3totToHere, max(if(score=p34,(1-p34pct)*thisCnt,0)) p3deduct,
       max(p45) p45, max(if(score<=p45,totalToHere,0)) p4totToHere, max(if(score=p45,(1-p45pct)*thisCnt,0)) p4deduct,
       max(totalToHere) p5totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.cnt from (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where rIsat>0 and rIsat is not null and  test='ISAT'  and (|query|)
      group by rIsat,year,gradeLevel) a
     left join (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where rIsat>0 and rIsat is not null  and  test='ISAT' and (|query|)
       group by rIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='ISAT Reading')
   left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='ISAT Reading')
group by d.year, d.gradeLevel
) g union select g.*,'Chavez' q, 'ISAT' test,
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
   round(100 - (60thtotToHere-60thdeduct)/s9totToHere*100,1) paa60,
   round(100 - (68thtotToHere-68thdeduct)/s9totToHere*100,1) paa68,
   round((q4totToHere - q2totToHere+q2deduct)/q4totToHere*100,1) paamed,
   q23 mss,
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
   round((p1totToHere-p1deduct)/p5totToHere*100,1) p1pct,
   round((p2totToHere-p2deduct-p1totToHere+p1deduct)/p5totToHere*100,1) p2pct,
   round((p3totToHere-p3deduct-p2totToHere+p2deduct)/p5totToHere*100,1) p3pct,
   round((p4totToHere-p4deduct-p3totToHere+p3deduct)/p5totToHere*100,1) p4pct,
   round((p5totToHere-p4totToHere+p4deduct)/p5totToHere*100,1) p5pct,
   round(s9totToHere - 60thtotToHere+60thdeduct,1) cntaa60,
   round(s9totToHere - 68thtotToHere+68thdeduct,1) cntaa68,
   round(q4totToHere - q2totToHere+q2deduct,1) cntaa50,
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
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt,
   round(p1totToHere-p1deduct,1) p1cnt,
   round(p2totToHere-p2deduct-p1totToHere+p1deduct,1) p2cnt,
   round(p3totToHere-p3deduct-p2totToHere+p2deduct,1) p3cnt,
   round(p4totToHere-p4deduct-p3totToHere+p3deduct,1) p4cnt,
   round(p5totToHere-p4totToHere+p4deduct,1) p5cnt
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
       max(60th) 60th, max(if(score<=60th,totalToHere,0)) 60thtotToHere, max(if(score=60th,(1-60thpct)*thisCnt,0)) 60thdeduct,
       max(68th) 68th, max(if(score<=68th,totalToHere,0)) 68thtotToHere, max(if(score=68th,(1-68thpct)*thisCnt,0)) 68thdeduct,
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
       max(totalToHere) q4totToHere,
       max(p12) p12, max(if(score<=p12,totalToHere,0)) p1totToHere, max(if(score=p12,(1-p12pct)*thisCnt,0)) p1deduct,
       max(p23) p23, max(if(score<=p23,totalToHere,0)) p2totToHere, max(if(score=p23,(1-p23pct)*thisCnt,0)) p2deduct,
       max(p34) p34, max(if(score<=p34,totalToHere,0)) p3totToHere, max(if(score=p34,(1-p34pct)*thisCnt,0)) p3deduct,
       max(p45) p45, max(if(score<=p45,totalToHere,0)) p4totToHere, max(if(score=p45,(1-p45pct)*thisCnt,0)) p4deduct,
       max(totalToHere) p5totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.cnt from (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where sciIsat>0 and sciIsat is not null and  test='ISAT'  and (|query|)
      group by sciIsat,year,gradeLevel) a
     left join (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where sciIsat>0 and sciIsat is not null  and  test='ISAT' and (|query|)
       group by sciIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='ISAT Science')
   left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='ISAT Science')
group by d.year, d.gradeLevel
) g union select g.*,'Chavez' q, 'PSAE' test,
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
   round(100 - (60thtotToHere-60thdeduct)/s9totToHere*100,1) paa60,
   round(100 - (68thtotToHere-68thdeduct)/s9totToHere*100,1) paa68,
   round((q4totToHere - q2totToHere+q2deduct)/q4totToHere*100,1) paamed,
   q23 mss,
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
   round((p1totToHere-p1deduct)/p5totToHere*100,1) p1pct,
   round((p2totToHere-p2deduct-p1totToHere+p1deduct)/p5totToHere*100,1) p2pct,
   round((p3totToHere-p3deduct-p2totToHere+p2deduct)/p5totToHere*100,1) p3pct,
   round((p4totToHere-p4deduct-p3totToHere+p3deduct)/p5totToHere*100,1) p4pct,
   round((p5totToHere-p4totToHere+p4deduct)/p5totToHere*100,1) p5pct,
   round(s9totToHere - 60thtotToHere+60thdeduct,1) cntaa60,
   round(s9totToHere - 68thtotToHere+68thdeduct,1) cntaa68,
   round(q4totToHere - q2totToHere+q2deduct,1) cntaa50,
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
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt,
   round(p1totToHere-p1deduct,1) p1cnt,
   round(p2totToHere-p2deduct-p1totToHere+p1deduct,1) p2cnt,
   round(p3totToHere-p3deduct-p2totToHere+p2deduct,1) p3cnt,
   round(p4totToHere-p4deduct-p3totToHere+p3deduct,1) p4cnt,
   round(p5totToHere-p4totToHere+p4deduct,1) p5cnt
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
       max(60th) 60th, max(if(score<=60th,totalToHere,0)) 60thtotToHere, max(if(score=60th,(1-60thpct)*thisCnt,0)) 60thdeduct,
       max(68th) 68th, max(if(score<=68th,totalToHere,0)) 68thtotToHere, max(if(score=68th,(1-68thpct)*thisCnt,0)) 68thdeduct,
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
       max(totalToHere) q4totToHere,
       max(p12) p12, max(if(score<=p12,totalToHere,0)) p1totToHere, max(if(score=p12,(1-p12pct)*thisCnt,0)) p1deduct,
       max(p23) p23, max(if(score<=p23,totalToHere,0)) p2totToHere, max(if(score=p23,(1-p23pct)*thisCnt,0)) p2deduct,
       max(p34) p34, max(if(score<=p34,totalToHere,0)) p3totToHere, max(if(score=p34,(1-p34pct)*thisCnt,0)) p3deduct,
       max(p45) p45, max(if(score<=p45,totalToHere,0)) p4totToHere, max(if(score=p45,(1-p45pct)*thisCnt,0)) p4deduct,
       max(totalToHere) p5totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.cnt from (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where mIsat>0 and mIsat is not null and  test='PSAE'  and (|query|)
      group by mIsat,year,gradeLevel) a
     left join (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where mIsat>0 and mIsat is not null  and  test='PSAE' and (|query|)
       group by mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='PSAE Mathematics')
   left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='PSAE Mathematics')
group by d.year, d.gradeLevel
) g union select g.*,'Chavez' q, 'PSAE' test,
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
   round(100 - (60thtotToHere-60thdeduct)/s9totToHere*100,1) paa60,
   round(100 - (68thtotToHere-68thdeduct)/s9totToHere*100,1) paa68,
   round((q4totToHere - q2totToHere+q2deduct)/q4totToHere*100,1) paamed,
   q23 mss,
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
   round((p1totToHere-p1deduct)/p5totToHere*100,1) p1pct,
   round((p2totToHere-p2deduct-p1totToHere+p1deduct)/p5totToHere*100,1) p2pct,
   round((p3totToHere-p3deduct-p2totToHere+p2deduct)/p5totToHere*100,1) p3pct,
   round((p4totToHere-p4deduct-p3totToHere+p3deduct)/p5totToHere*100,1) p4pct,
   round((p5totToHere-p4totToHere+p4deduct)/p5totToHere*100,1) p5pct,
   round(s9totToHere - 60thtotToHere+60thdeduct,1) cntaa60,
   round(s9totToHere - 68thtotToHere+68thdeduct,1) cntaa68,
   round(q4totToHere - q2totToHere+q2deduct,1) cntaa50,
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
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt,
   round(p1totToHere-p1deduct,1) p1cnt,
   round(p2totToHere-p2deduct-p1totToHere+p1deduct,1) p2cnt,
   round(p3totToHere-p3deduct-p2totToHere+p2deduct,1) p3cnt,
   round(p4totToHere-p4deduct-p3totToHere+p3deduct,1) p4cnt,
   round(p5totToHere-p4totToHere+p4deduct,1) p5cnt
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
       max(60th) 60th, max(if(score<=60th,totalToHere,0)) 60thtotToHere, max(if(score=60th,(1-60thpct)*thisCnt,0)) 60thdeduct,
       max(68th) 68th, max(if(score<=68th,totalToHere,0)) 68thtotToHere, max(if(score=68th,(1-68thpct)*thisCnt,0)) 68thdeduct,
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
       max(totalToHere) q4totToHere,
       max(p12) p12, max(if(score<=p12,totalToHere,0)) p1totToHere, max(if(score=p12,(1-p12pct)*thisCnt,0)) p1deduct,
       max(p23) p23, max(if(score<=p23,totalToHere,0)) p2totToHere, max(if(score=p23,(1-p23pct)*thisCnt,0)) p2deduct,
       max(p34) p34, max(if(score<=p34,totalToHere,0)) p3totToHere, max(if(score=p34,(1-p34pct)*thisCnt,0)) p3deduct,
       max(p45) p45, max(if(score<=p45,totalToHere,0)) p4totToHere, max(if(score=p45,(1-p45pct)*thisCnt,0)) p4deduct,
       max(totalToHere) p5totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.cnt from (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where rIsat>0 and rIsat is not null and  test='PSAE'  and (|query|)
      group by rIsat,year,gradeLevel) a
     left join (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where rIsat>0 and rIsat is not null  and  test='PSAE' and (|query|)
       group by rIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='PSAE Reading')
   left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='PSAE Reading')
group by d.year, d.gradeLevel
) g union select g.*,'Chavez' q, 'PSAE' test,
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
   round(100 - (60thtotToHere-60thdeduct)/s9totToHere*100,1) paa60,
   round(100 - (68thtotToHere-68thdeduct)/s9totToHere*100,1) paa68,
   round((q4totToHere - q2totToHere+q2deduct)/q4totToHere*100,1) paamed,
   q23 mss,
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
   round((p1totToHere-p1deduct)/p5totToHere*100,1) p1pct,
   round((p2totToHere-p2deduct-p1totToHere+p1deduct)/p5totToHere*100,1) p2pct,
   round((p3totToHere-p3deduct-p2totToHere+p2deduct)/p5totToHere*100,1) p3pct,
   round((p4totToHere-p4deduct-p3totToHere+p3deduct)/p5totToHere*100,1) p4pct,
   round((p5totToHere-p4totToHere+p4deduct)/p5totToHere*100,1) p5pct,
   round(s9totToHere - 60thtotToHere+60thdeduct,1) cntaa60,
   round(s9totToHere - 68thtotToHere+68thdeduct,1) cntaa68,
   round(q4totToHere - q2totToHere+q2deduct,1) cntaa50,
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
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt,
   round(p1totToHere-p1deduct,1) p1cnt,
   round(p2totToHere-p2deduct-p1totToHere+p1deduct,1) p2cnt,
   round(p3totToHere-p3deduct-p2totToHere+p2deduct,1) p3cnt,
   round(p4totToHere-p4deduct-p3totToHere+p3deduct,1) p4cnt,
   round(p5totToHere-p4totToHere+p4deduct,1) p5cnt
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
       max(60th) 60th, max(if(score<=60th,totalToHere,0)) 60thtotToHere, max(if(score=60th,(1-60thpct)*thisCnt,0)) 60thdeduct,
       max(68th) 68th, max(if(score<=68th,totalToHere,0)) 68thtotToHere, max(if(score=68th,(1-68thpct)*thisCnt,0)) 68thdeduct,
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
       max(totalToHere) q4totToHere,
       max(p12) p12, max(if(score<=p12,totalToHere,0)) p1totToHere, max(if(score=p12,(1-p12pct)*thisCnt,0)) p1deduct,
       max(p23) p23, max(if(score<=p23,totalToHere,0)) p2totToHere, max(if(score=p23,(1-p23pct)*thisCnt,0)) p2deduct,
       max(p34) p34, max(if(score<=p34,totalToHere,0)) p3totToHere, max(if(score=p34,(1-p34pct)*thisCnt,0)) p3deduct,
       max(p45) p45, max(if(score<=p45,totalToHere,0)) p4totToHere, max(if(score=p45,(1-p45pct)*thisCnt,0)) p4deduct,
       max(totalToHere) p5totToHere
  from (
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.cnt from (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where sciIsat>0 and sciIsat is not null and  test='PSAE'  and (|query|)
      group by sciIsat,year,gradeLevel) a
     left join (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where sciIsat>0 and sciIsat is not null  and  test='PSAE' and (|query|)
       group by sciIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
    ) c
    group by score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='PSAE Science')
   left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='PSAE Science')
group by d.year, d.gradeLevel
) g union select g.*,'Chavez' q, 'PARCC' test,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
  0 pme13,
  0 totalWarning13, 0 totalBelow13, 0 totalMeet13, 0 totalExceed13,
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
   round(100 - (60thtotToHere-60thdeduct)/s9totToHere*100,1) paa60,
   round(100 - (68thtotToHere-68thdeduct)/s9totToHere*100,1) paa68,
   round((q4totToHere - q2totToHere+q2deduct)/q4totToHere*100,1) paamed,
   q23 mss,
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
   round((p1totToHere-p1deduct)/p5totToHere*100,1) p1pct,
   round((p2totToHere-p2deduct-p1totToHere+p1deduct)/p5totToHere*100,1) p2pct,
   round((p3totToHere-p3deduct-p2totToHere+p2deduct)/p5totToHere*100,1) p3pct,
   round((p4totToHere-p4deduct-p3totToHere+p3deduct)/p5totToHere*100,1) p4pct,
   round((p5totToHere-p4totToHere+p4deduct)/p5totToHere*100,1) p5pct,
   round(s9totToHere - 60thtotToHere+60thdeduct,1) cntaa60,
   round(s9totToHere - 68thtotToHere+68thdeduct,1) cntaa68,
   round(q4totToHere - q2totToHere+q2deduct,1) cntaa50,
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
   round(q4totToHere-q3totToHere+q3deduct,1) q4cnt,
   round(p1totToHere-p1deduct,1) p1cnt,
   round(p2totToHere-p2deduct-p1totToHere+p1deduct,1) p2cnt,
   round(p3totToHere-p3deduct-p2totToHere+p2deduct,1) p3cnt,
   round(p4totToHere-p4deduct-p3totToHere+p3deduct,1) p4cnt,
   round(p5totToHere-p4totToHere+p4deduct,1) p5cnt
from (
select d.year, s.gradeLevel,if(s.gradeLevel = 'HS', null, d.year-s.gradeLevel+12) cohort,
       ptest label, max(s.subject) subject, max(s.below) belowScore, max(s.meet) meetScore, max(s.exceed) exceedScore,
       max(if(score<s.below,totalToHere,0)) totalNotBelow,
       max(if(score<s.meet,totalToHere,0)) totalNotMeeting,
       max(if(score<s.exceed,totalToHere,0)) totalNotExceeding,
       0 belowScore13, 0 meetScore13, 0 exceedScore13, 0 totalNotBelow13, 0 totalNotMeeting13, 0 totalNotExceeding13,
       max(score) maxScore, min(score) minScore,
       sum(score*thisCnt)/sum(thisCnt) avgScore,
       max(60th) 60th, max(if(score<=60th,totalToHere,0)) 60thtotToHere, max(if(score=60th,(1-60thpct)*thisCnt,0)) 60thdeduct,
       max(68th) 68th, max(if(score<=68th,totalToHere,0)) 68thtotToHere, max(if(score=68th,(1-68thpct)*thisCnt,0)) 68thdeduct,
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
       max(totalToHere) q4totToHere,
       max(p12) p12, max(if(score<=p12,totalToHere,0)) p1totToHere, max(if(score=p12,(1-p12pct)*thisCnt,0)) p1deduct,
       max(p23) p23, max(if(score<=p23,totalToHere,0)) p2totToHere, max(if(score=p23,(1-p23pct)*thisCnt,0)) p2deduct,
       max(p34) p34, max(if(score<=p34,totalToHere,0)) p3totToHere, max(if(score=p34,(1-p34pct)*thisCnt,0)) p3deduct,
       max(p45) p45, max(if(score<=p45,totalToHere,0)) p4totToHere, max(if(score=p45,(1-p45pct)*thisCnt,0)) p4deduct,
       max(totalToHere) p5totToHere
  from (
   /* d) score groups with preceding totals per year and grade */
   select ptest, year, score, thisCnt, sum(cnt) totalToHere from (
    /* c) scores attached to each preceding score per year and grade */
    select a.score, a.ptest, a.year, a.cnt thisCnt, b.cnt from (
     /* a) score groups per year and grade */
     SELECT pscore score, ptest, year, count(*) cnt FROM parccdetails i
      where pscore>0 and pscore is not null and (|query|)
      group by pscore,year,ptest) a
     left join (
     /* b) preceding scores to count */
     SELECT pscore score, ptest, year, count(*) cnt FROM parccdetails i2
      where pscore>0 and pscore is not null and (|query|)
       group by pscore,year,ptest) b
     on (a.score>=b.score and a.year=b.year and a.ptest=b.ptest)
    ) c
    group by score, thisCnt, ptest, year) d
   inner join isbe_tests s on (s.year=d.year and s.label=concat('PARCC ',d.ptest))
  group by d.year, s.gradeLevel, d.ptest
) g
) h
left join ztopconversion zp1 on (zp1.z>=h.zscore and zp1.z<h.zscore+0.006)
left join ztopconversion zp2 on zp2.z=zp1.z+0.006
order by label, gradeLevel desc, year desc
) z
left join (
  select if(test_group + subject_group + grade_group >0, 'Composite ', null) composite, concat_ws(', ', testlabel, subjlabel, grlabel) comp_label,
     matching_test, matching_subject, matching_gradelevel, testlabel, subjlabel, grlabel
  from (
  	select 0 test_group, tl testlabel, tl matching_test from (
  	SELECT
  	distinct (test) tl FROM isbe_tests) tl
  	union
  	select 1 test_group, 'All Tests' testlabel, tl matching_test from (
  	SELECT
  	distinct (test) tl FROM isbe_tests) tl
  ) test
  join
  (
  	select 0 subject_group, sl subjlabel, sl matching_subject from (
  	SELECT
  	distinct (subject) sl FROM isbe_tests) sl
  	union
    select 1 subject_group, 'Math and Reading' subjlabel, sl matching_subject from (
  	SELECT
  	distinct (subject) sl FROM isbe_tests where subject !='Science') sl
  ) subject
  join
  (
  	select 0 grade_group, gl grlabel, gl matching_gradelevel from (
  	SELECT
  	distinct(gradeLevel) gl FROM pnet.isbe_tests) gl
  	union
  	select 1 grade_group, 'Gr 3 to 5' grlabel, gl matching_gradelevel from (
  	SELECT
  	distinct(gradeLevel) gl FROM pnet.isbe_tests where gradeLevel in ('03', '04', '05')) gl
  	union
  	select 1 grade_group, 'Gr 6 to 8' grlabel, gl matching_gradelevel from (
  	SELECT
  	distinct(gradeLevel) gl FROM pnet.isbe_tests where gradeLevel in ('06', '07', '08')) gl
    union
  	select 1 grade_group, 'Elem 3 to 8' grlabel, gl matching_gradelevel from (
  	SELECT
  	distinct(gradeLevel) gl FROM pnet.isbe_tests where gradeLevel in ('03', '04', '05', '06', '07', '08')) gl
  	union
  	select 1 grade_group, 'Gr HS' grlabel, gl matching_gradelevel from (
  	SELECT
  	distinct(gradeLevel) gl FROM pnet.isbe_tests where gradeLevel not in ('03', '04', '05', '06', '07', '08')) gl
  ) grlevel
) c on (z.test = cast(c.matching_test AS CHAR CHARACTER SET utf8) and z.subject=cast(c.matching_subject AS CHAR CHARACTER SET utf8) and z.gradelevel = cast(c.matching_gradelevel AS CHAR CHARACTER SET utf8))
group by q, cdts, c.composite, c.comp_label, z.year, c.testlabel, c.subjlabel, c.grlabel`;

for (var i = 0; i < countyDataRequests.length; i++) {
  create_files(i)()
}
