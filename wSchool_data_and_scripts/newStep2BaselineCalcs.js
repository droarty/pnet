var http = require('http');
var mysql = require('mysql');
var config = require('./config')

runBaselineCalcs = function() {
  var connection = mysql.createConnection(config);
  connection.connect(function(err, con) {
    if(err) console.log("Connection error for " + con + ":" + err);
  });

  connection.query(baseline_query, function(err, rows, fields){
    if(err||!rows){
      //then we skip this file...
      if(err) console.log("Error in query: "+err);
      else console.log("There were no new baseline tests created.");
    }
    else console.log("Baseline Tests Created: "+ rows.affectedRows + " --> " + JSON.stringify(rows)+"");
    baselineDone = true;
    if(allUpdatesDone()) connection.end();
    return;
  });
};

allUpdatesDone = function() {
  return baselineDone;
}

var baselineDone = false;
// query to generate all base lines for all parcc tests
var baseline_query = `
insert into isbe_tests (label,subject,tablename,fieldName, year,gradelevel,totalCnt,
  maxScore,minScore,s12,s12pct,s23,s23pct,s34,s34pct,s45,s45pct,s56,s56pct,s67,
  s67pct,s78,s78pct,s89,s89pct,
  60th, 60thpct, 68th, 68thpct,
  q12,q12pct,q23,q23pct,q34,q34pct)
select h.* from (
select concat('PARCC ', ptest) label, ptestcode subject, 'parccdetails' tableName,
'pscore' fieldName, year, ptestlevel gradelevel, max(totCnt) totalCnt,
max(maxScore) maxScore, min(minScore) minScore,
sum(if(stanine=1,score,0)) s12, sum(if(stanine=1,thisPct,0)) s12pct,
sum(if(stanine=2,score,0)) s23, sum(if(stanine=2,thisPct,0)) s23pct,
sum(if(stanine=3,score,0)) s34, sum(if(stanine=3,thisPct,0)) s34pct,
sum(if(stanine=4,score,0)) s45, sum(if(stanine=4,thisPct,0)) s45pct,
sum(if(stanine=5,score,0)) s56, sum(if(stanine=5,thisPct,0)) s56pct,
sum(if(stanine=6,score,0)) s67, sum(if(stanine=6,thisPct,0)) s67pct,
sum(if(stanine=7,score,0)) s78, sum(if(stanine=7,thisPct,0)) s78pct,
sum(if(stanine=8,score,0)) s89, sum(if(stanine=8,thisPct,0)) s89pct,
sum(if(stanine=60,score,0)) 60th, sum(if(stanine=60,thisPct,0)) 60thpct,
sum(if(stanine=68,score,0)) 68th, sum(if(stanine=68,thisPct,0)) 68thpct,
sum(if(stanine=11,score,0)) q12, sum(if(stanine=11,thisPct,0)) q12pct,
sum(if(stanine=12,score,0)) q23, sum(if(stanine=12,thisPct,0)) q23pct,
sum(if(stanine=13,score,0)) q34, sum(if(stanine=13,thisPct,0)) q34pct
from (
 /*#g) calculate thisPct...*/
 select *, (thisCnt-(totalToHere-stanineCutoff))/thisCnt thisPct from (
 /* #f) join with totalCount e, join with stanine s... determine cuttofff count... return only cutoff points..*/
  select *, topPct*totCnt/100 stanineCutoff  from (
/*   #d) collapse into aggregate totals...*/
   select ptest, year, score, thisCnt, sum(cnt) totalToHere from (
/*    #c) get list of scores joined with scores of equal or lower value for each grade/year...*/
    select a.score, a.ptest, a.year, a.cnt thisCnt, b.score lessepscores, b.cnt from (
     SELECT pscore score, ptest, year, count(*) cnt FROM parccdetails i where pscore>0
       group by pscore,year,ptest) a
     left join (
     SELECT pscore score, ptest, year, count(*) cnt FROM parccdetails i2 where pscore>0
           group by pscore,year,ptest) b
     on (a.score>=b.score and a.year=b.year and a.ptest=b.ptest) ) c
    group by score, thisCnt, ptest, year) d
   inner join (
    select year eyr, ptest egrd, ptestcode, ptestlevel, count(*) totCnt, min(pscore) minScore, max(pscore) maxScore FROM
     parccdetails where pscore>0 group by year, ptest, ptestcode, ptestlevel) e
   on (d.year=e.eyr and d.ptest=e.egrd)
   left join stanine s on (s.topPct*e.totCnt/100) between d.totalToHere-thisCnt and totalToHere) f
   where stanine is not null) g
 group by year, ptestlevel, ptestcode, ptest) h
left join isbe_tests i on (i.year=h.year and i.gradelevel=h.gradelevel and i.label=h.label)
where i.id is null`;

var backwardCompatibleParccLevelBoundariesQueryDone = false;
var backwardCompatibleParccLevelBoundariesQuery = `
insert into parcc_level_boundaries (ptestcode, ptestlevel, p12, p23, p34, p45)
select ptestcode, ptestlevel, p1/cnt*100 p12, (p1+p2)/cnt*100 p23, (p1+p2+p3)/cnt*100 p34, (p1+p2+p3+p4)/cnt*100 p45
from (SELECT ptestcode, ptestLevel, count(*) cnt, sum(if(plevel=1, 1, 0)) p1, sum(if(plevel=2, 1, 0)) p2, sum(if(plevel=3, 1, 0)) p3, sum(if(plevel=4, 1, 0)) p4, sum(if(plevel=5, 1, 0)) p5
FROM parccdetails
where ptestLevel in ('03', '04', '05', '06', '07', '08') and ptestcode in ('ELA', 'MAT')
group by ptestcode, ptestLevel) z
`;

runBaselineCalcs();

//ToDo - make this run...
var updateCdtsQuery = `update parccdetails set cdts = concat('x',substring(rcdts,3)) where cdts is null`
// and this one.. to update parcc levels
var updateParccLevelBoundaries = `update isbe_tests it
left join (
  select ptestcode, ptestlevel, year,
    min(if(plevel=2,pscore, null)) p12, 0 p12pct,
    min(if(plevel=3,pscore, null)) p23, 0 p23pct,
    min(if(plevel=4,pscore, null)) p34, 0 p34pct,
    min(if(plevel=5,pscore, null)) p45, 0 p45pct
  from parccdetails
  group by ptestcode, ptestlevel, year
) pd on (pd.ptestcode = it.subject and pd.ptestlevel = it.gradeLevel and pd.year = it.year)
set it.p12 = pd.p12, it.p12pct = 0, it.p23 = pd.p23, it.p23pct = 0,
  it.p34 = pd.p34, it.p34pct = 0, it.p45 = pd.p45, it.p45pct = 0
where tablename='parccdetails' and it.p12 is null`
// and fix the reading/math subject
var updateReading = `update isbe_tests set subject = 'Reading' where subject='ELA'`
var updateMath = `update isbe_tests set subject = 'Math' where subject='MAT'`
