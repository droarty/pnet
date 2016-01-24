<?
//DR 11/26/12 changed stanineEquivalent to 50%=5.0 instead of 5.5 stanine...
//NOTE:  THIS FILE NEEDS TO GO IN THE ROOT FOLDER OF THE SITE!!!!!

include 'settings.php';


function makeDS($qname,$qstr, $aoColumns='', $ext='cte',$asObject=false){
  $r=makeDataSetInJS($qname,$qstr,$aoColumns,$ext,$asObject);
  return str_replace(array('</script>',"<script>","<script  type='text/javascript'>"),'',$r);
};

$output="...";
$schId=getURLParam('baselines');
if($schId){
  db_set_active('isbe');

	$q=<<<UINQ
insert into isbe_tests (label,subject,tablename,fieldName, year,gradeLevel,totalCnt,
  maxScore,minScore,s12,s12pct,s23,s23pct,s34,s34pct,s45,s45pct,s56,s56pct,s67,
  s67pct,s78,s78pct,s89,s89pct,q12,q12pct,q23,q23pct,q34,q34pct)
select h.* from (
select Convert('ISAT Reading' USING utf8) label, 'Reading' subject, 'isatReadingDetails' tableName,
'rIsat' fieldName, year, gradeLevel,max(totCnt) totalCnt,
max(maxScore) maxScore, min(minScore) minScore,
sum(if(stanine=1,score,0)) s12, sum(if(stanine=1,thisPct,0)) s12pct,
sum(if(stanine=2,score,0)) s23, sum(if(stanine=2,thisPct,0)) s23pct,
sum(if(stanine=3,score,0)) s34, sum(if(stanine=3,thisPct,0)) s34pct,
sum(if(stanine=4,score,0)) s45, sum(if(stanine=4,thisPct,0)) s45pct,
sum(if(stanine=5,score,0)) s56, sum(if(stanine=5,thisPct,0)) s56pct,
sum(if(stanine=6,score,0)) s67, sum(if(stanine=6,thisPct,0)) s67pct,
sum(if(stanine=7,score,0)) s78, sum(if(stanine=7,thisPct,0)) s78pct,
sum(if(stanine=8,score,0)) s89, sum(if(stanine=8,thisPct,0)) s89pct,
sum(if(stanine=11,score,0)) q12, sum(if(stanine=11,thisPct,0)) q12pct,
sum(if(stanine=12,score,0)) q23, sum(if(stanine=12,thisPct,0)) q23pct,
sum(if(stanine=13,score,0)) q34, sum(if(stanine=13,thisPct,0)) q34pct
from (
 /*#g) calculate thisPct...*/
 select *, (thisCnt-(totalToHere-stanineCutoff))/thisCnt thisPct from (
 /* #f) join with totalCount e, join with stanine s... determine cuttofff count... return only cutoff points..*/
  select *, topPct*totCnt/100 stanineCutoff  from (
/*   #d) collapse into aggregate totals...*/
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
/*    #c) get list of scores joined with scores of equal or lower value for each grade/year...*/
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lesserIsats, b.cnt from (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i where rIsat>0  and test='ISAT'     group by rIsat,year,gradeLevel) a
     left join (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2 where rIsat>0 and test='ISAT'
       group by rIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel) ) c
    group by score, thisCnt, gradeLevel, year) d
   inner join (
    select year eyr, gradeLevel egrd, count(*) totCnt, min(rIsat) minScore, max(rIsat) maxScore FROM
     isbedetails where rIsat>0 and test='ISAT'  group by year, gradeLevel) e
   on (d.year=e.eyr and d.gradeLevel=e.egrd)
   left join stanine s on (s.topPct*e.totCnt/100) between d.totalToHere-thisCnt and totalToHere) f
   where stanine is not null) g
 group by year, gradeLevel) h
left join isbe_tests i on (i.year=h.year and i.gradeLevel=h.gradeLevel and i.label=h.label)
where i.id is null
UINQ;
  db_query($q);

	$q=<<<UINQ
insert into isbe_tests (label,subject,tablename,fieldName, year,gradeLevel,totalCnt,
  maxScore,minScore,s12,s12pct,s23,s23pct,s34,s34pct,s45,s45pct,s56,s56pct,s67,
  s67pct,s78,s78pct,s89,s89pct,q12,q12pct,q23,q23pct,q34,q34pct)
select h.* from (
select Convert('ISAT Mathematics' USING utf8) label, 'Math' subject, 'isbedetails' tableName,
'mIsat' fieldName, year, gradeLevel,max(totCnt) totalCnt,
max(maxScore) maxScore, min(minScore) minScore,
sum(if(stanine=1,score,0)) s12, sum(if(stanine=1,thisPct,0)) s12pct,
sum(if(stanine=2,score,0)) s23, sum(if(stanine=2,thisPct,0)) s23pct,
sum(if(stanine=3,score,0)) s34, sum(if(stanine=3,thisPct,0)) s34pct,
sum(if(stanine=4,score,0)) s45, sum(if(stanine=4,thisPct,0)) s45pct,
sum(if(stanine=5,score,0)) s56, sum(if(stanine=5,thisPct,0)) s56pct,
sum(if(stanine=6,score,0)) s67, sum(if(stanine=6,thisPct,0)) s67pct,
sum(if(stanine=7,score,0)) s78, sum(if(stanine=7,thisPct,0)) s78pct,
sum(if(stanine=8,score,0)) s89, sum(if(stanine=8,thisPct,0)) s89pct,
sum(if(stanine=11,score,0)) q12, sum(if(stanine=11,thisPct,0)) q12pct,
sum(if(stanine=12,score,0)) q23, sum(if(stanine=12,thisPct,0)) q23pct,
sum(if(stanine=13,score,0)) q34, sum(if(stanine=13,thisPct,0)) q34pct
from (
 /*#g) calculate thisPct...*/
 select *, (thisCnt-(totalToHere-stanineCutoff))/thisCnt thisPct from (
 /* #f) join with totalCount e, join with stanine s... determine cuttofff count... return only cutoff points..*/
  select *, topPct*totCnt/100 stanineCutoff  from (
/*   #d) collapse into aggregate totals...*/
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
/*    #c) get list of scores joined with scores of equal or lower value for each grade/year...*/
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessemIsats, b.cnt from (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i where mIsat>0  and test='ISAT'     group by mIsat,year,gradeLevel) a
     left join (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2 where mIsat>0 and test='ISAT'
       group by mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel) ) c
    group by score, thisCnt, gradeLevel, year) d
   inner join (
    select year eyr, gradeLevel egrd, count(*) totCnt, min(mIsat) minScore, max(mIsat) maxScore FROM
     isbedetails where mIsat>0 and test='ISAT'  group by year, gradeLevel) e
   on (d.year=e.eyr and d.gradeLevel=e.egrd)
   left join stanine s on (s.topPct*e.totCnt/100) between d.totalToHere-thisCnt and totalToHere) f
   where stanine is not null) g
 group by year, gradeLevel) h
left join isbe_tests i on (i.year=h.year and i.gradeLevel=h.gradeLevel and i.label=h.label)
where i.id is null
UINQ;
  db_query($q);

	$q=<<<UINQ
insert into isbe_tests (label,subject,tablename,fieldName, year,gradeLevel,totalCnt,
  maxScore,minScore,s12,s12pct,s23,s23pct,s34,s34pct,s45,s45pct,s56,s56pct,s67,
  s67pct,s78,s78pct,s89,s89pct,q12,q12pct,q23,q23pct,q34,q34pct)
select h.* from (
select Convert('ISAT Science' USING utf8) label,  'Science' subject, 'isatScienceDetails' tableName,
'sciIsat' fieldName, year, gradeLevel,max(totCnt) totalCnt,
max(maxScore) maxScore, min(minScore) minScore,
sum(if(stanine=1,score,0)) s12, sum(if(stanine=1,thisPct,0)) s12pct,
sum(if(stanine=2,score,0)) s23, sum(if(stanine=2,thisPct,0)) s23pct,
sum(if(stanine=3,score,0)) s34, sum(if(stanine=3,thisPct,0)) s34pct,
sum(if(stanine=4,score,0)) s45, sum(if(stanine=4,thisPct,0)) s45pct,
sum(if(stanine=5,score,0)) s56, sum(if(stanine=5,thisPct,0)) s56pct,
sum(if(stanine=6,score,0)) s67, sum(if(stanine=6,thisPct,0)) s67pct,
sum(if(stanine=7,score,0)) s78, sum(if(stanine=7,thisPct,0)) s78pct,
sum(if(stanine=8,score,0)) s89, sum(if(stanine=8,thisPct,0)) s89pct,
sum(if(stanine=11,score,0)) q12, sum(if(stanine=11,thisPct,0)) q12pct,
sum(if(stanine=12,score,0)) q23, sum(if(stanine=12,thisPct,0)) q23pct,
sum(if(stanine=13,score,0)) q34, sum(if(stanine=13,thisPct,0)) q34pct
from (
 /*#g) calculate thisPct...*/
 select *, (thisCnt-(totalToHere-stanineCutoff))/thisCnt thisPct from (
 /* #f) join with totalCount e, join with stanine s... determine cuttofff count... return only cutoff points..*/
  select *, topPct*totCnt/100 stanineCutoff  from (
/*   #d) collapse into aggregate totals...*/
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
/*    #c) get list of scores joined with scores of equal or lower value for each grade/year...*/
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessesciIsats, b.cnt from (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i where sciIsat>0  and test='ISAT'     group by sciIsat,year,gradeLevel) a
     left join (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2 where sciIsat>0 and test='ISAT'
       group by sciIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel) ) c
    group by score, thisCnt, gradeLevel, year) d
   inner join (
    select year eyr, gradeLevel egrd, count(*) totCnt, min(sciIsat) minScore, max(sciIsat) maxScore FROM
     isbedetails where sciIsat>0 and test='ISAT'  group by year, gradeLevel) e
   on (d.year=e.eyr and d.gradeLevel=e.egrd)
   left join stanine s on (s.topPct*e.totCnt/100) between d.totalToHere-thisCnt and totalToHere) f
   where stanine is not null) g
 group by year, gradeLevel) h
left join isbe_tests i on (i.year=h.year and i.gradeLevel=h.gradeLevel and i.label=h.label)
where i.id is null
UINQ;
  db_query($q);

	$q=<<<UINQ
insert into isbe_tests (label,subject,tablename,fieldName, year,gradeLevel,totalCnt,
  maxScore,minScore,s12,s12pct,s23,s23pct,s34,s34pct,s45,s45pct,s56,s56pct,s67,
  s67pct,s78,s78pct,s89,s89pct,q12,q12pct,q23,q23pct,q34,q34pct)
select h.* from (
select Convert('PSAE Science' USING utf8) label,  'Science' subject, 'psaeDetails' tableName,
'psSci' fieldName, year, gradeLevel,max(totCnt) totalCnt,
max(maxScore) maxScore, min(minScore) minScore,
sum(if(stanine=1,score,0)) s12, sum(if(stanine=1,thisPct,0)) s12pct,
sum(if(stanine=2,score,0)) s23, sum(if(stanine=2,thisPct,0)) s23pct,
sum(if(stanine=3,score,0)) s34, sum(if(stanine=3,thisPct,0)) s34pct,
sum(if(stanine=4,score,0)) s45, sum(if(stanine=4,thisPct,0)) s45pct,
sum(if(stanine=5,score,0)) s56, sum(if(stanine=5,thisPct,0)) s56pct,
sum(if(stanine=6,score,0)) s67, sum(if(stanine=6,thisPct,0)) s67pct,
sum(if(stanine=7,score,0)) s78, sum(if(stanine=7,thisPct,0)) s78pct,
sum(if(stanine=8,score,0)) s89, sum(if(stanine=8,thisPct,0)) s89pct,
sum(if(stanine=11,score,0)) q12, sum(if(stanine=11,thisPct,0)) q12pct,
sum(if(stanine=12,score,0)) q23, sum(if(stanine=12,thisPct,0)) q23pct,
sum(if(stanine=13,score,0)) q34, sum(if(stanine=13,thisPct,0)) q34pct
from (
 /*#g) calculate thisPct...*/
 select *, (thisCnt-(totalToHere-stanineCutoff))/thisCnt thisPct from (
 /* #f) join with totalCount e, join with stanine s... determine cuttofff count... return only cutoff points..*/
  select *, topPct*totCnt/100 stanineCutoff  from (
/*   #d) collapse into aggregate totals...*/
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
/*    #c) get list of scores joined with scores of equal or lower value for each grade/year...*/
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessesciIsats, b.cnt from (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i where sciIsat>0  and test='PSAE'     group by sciIsat,year,gradeLevel) a
     left join (
     SELECT sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2 where sciIsat>0 and test='PSAE'
       group by sciIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel) ) c
    group by score, thisCnt, gradeLevel, year) d
   inner join (
    select year eyr, gradeLevel egrd, count(*) totCnt, min(sciIsat) minScore, max(sciIsat) maxScore FROM
     isbedetails where sciIsat>0 and test='PSAE'  group by year, gradeLevel) e
   on (d.year=e.eyr and d.gradeLevel=e.egrd)
   left join stanine s on (s.topPct*e.totCnt/100) between d.totalToHere-thisCnt and totalToHere) f
   where stanine is not null) g
 group by year, gradeLevel) h
left join isbe_tests i on (i.year=h.year and i.gradeLevel=h.gradeLevel and i.label=h.label)
where i.id is null
UINQ;
  db_query($q);

	$q=<<<UINQ
insert into isbe_tests (label,subject,tablename,fieldName, year,gradeLevel,totalCnt,
  maxScore,minScore,s12,s12pct,s23,s23pct,s34,s34pct,s45,s45pct,s56,s56pct,s67,
  s67pct,s78,s78pct,s89,s89pct,q12,q12pct,q23,q23pct,q34,q34pct)
select h.* from (
select Convert('PSAE Reading' USING utf8) label, 'Reading' subject, 'psaeDetails' tableName,
'psRead' fieldName, year, gradeLevel,max(totCnt) totalCnt,
max(maxScore) maxScore, min(minScore) minScore,
sum(if(stanine=1,score,0)) s12, sum(if(stanine=1,thisPct,0)) s12pct,
sum(if(stanine=2,score,0)) s23, sum(if(stanine=2,thisPct,0)) s23pct,
sum(if(stanine=3,score,0)) s34, sum(if(stanine=3,thisPct,0)) s34pct,
sum(if(stanine=4,score,0)) s45, sum(if(stanine=4,thisPct,0)) s45pct,
sum(if(stanine=5,score,0)) s56, sum(if(stanine=5,thisPct,0)) s56pct,
sum(if(stanine=6,score,0)) s67, sum(if(stanine=6,thisPct,0)) s67pct,
sum(if(stanine=7,score,0)) s78, sum(if(stanine=7,thisPct,0)) s78pct,
sum(if(stanine=8,score,0)) s89, sum(if(stanine=8,thisPct,0)) s89pct,
sum(if(stanine=11,score,0)) q12, sum(if(stanine=11,thisPct,0)) q12pct,
sum(if(stanine=12,score,0)) q23, sum(if(stanine=12,thisPct,0)) q23pct,
sum(if(stanine=13,score,0)) q34, sum(if(stanine=13,thisPct,0)) q34pct
from (
 /*#g) calculate thisPct...*/
 select *, (thisCnt-(totalToHere-stanineCutoff))/thisCnt thisPct from (
 /* #f) join with totalCount e, join with stanine s... determine cuttofff count... return only cutoff points..*/
  select *, topPct*totCnt/100 stanineCutoff  from (
/*   #d) collapse into aggregate totals...*/
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
/*    #c) get list of scores joined with scores of equal or lower value for each grade/year...*/
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lesserIsats, b.cnt from (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i where rIsat>0  and test='PSAE'     group by rIsat,year,gradeLevel) a
     left join (
     SELECT rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2 where rIsat>0 and test='PSAE'
       group by rIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel) ) c
    group by score, thisCnt, gradeLevel, year) d
   inner join (
    select year eyr, gradeLevel egrd, count(*) totCnt, min(rIsat) minScore, max(rIsat) maxScore FROM
     isbedetails where rIsat>0 and test='PSAE'  group by year, gradeLevel) e
   on (d.year=e.eyr and d.gradeLevel=e.egrd)
   left join stanine s on (s.topPct*e.totCnt/100) between d.totalToHere-thisCnt and totalToHere) f
   where stanine is not null) g
 group by year, gradeLevel) h
left join isbe_tests i on (i.year=h.year and i.gradeLevel=h.gradeLevel and i.label=h.label)
where i.id is null
UINQ;
  db_query($q);

	$q=<<<UINQ
insert into isbe_tests (label,subject,tablename,fieldName, year,gradeLevel,totalCnt,
  maxScore,minScore,s12,s12pct,s23,s23pct,s34,s34pct,s45,s45pct,s56,s56pct,s67,
  s67pct,s78,s78pct,s89,s89pct,q12,q12pct,q23,q23pct,q34,q34pct)
select h.* from (
select Convert('PSAE Mathematics' USING utf8) label,'Math' subject, 'psaeDetails' tableName,
'psMath' fieldName, year, gradeLevel,max(totCnt) totalCnt,
max(maxScore) maxScore, min(minScore) minScore,
sum(if(stanine=1,score,0)) s12, sum(if(stanine=1,thisPct,0)) s12pct,
sum(if(stanine=2,score,0)) s23, sum(if(stanine=2,thisPct,0)) s23pct,
sum(if(stanine=3,score,0)) s34, sum(if(stanine=3,thisPct,0)) s34pct,
sum(if(stanine=4,score,0)) s45, sum(if(stanine=4,thisPct,0)) s45pct,
sum(if(stanine=5,score,0)) s56, sum(if(stanine=5,thisPct,0)) s56pct,
sum(if(stanine=6,score,0)) s67, sum(if(stanine=6,thisPct,0)) s67pct,
sum(if(stanine=7,score,0)) s78, sum(if(stanine=7,thisPct,0)) s78pct,
sum(if(stanine=8,score,0)) s89, sum(if(stanine=8,thisPct,0)) s89pct,
sum(if(stanine=11,score,0)) q12, sum(if(stanine=11,thisPct,0)) q12pct,
sum(if(stanine=12,score,0)) q23, sum(if(stanine=12,thisPct,0)) q23pct,
sum(if(stanine=13,score,0)) q34, sum(if(stanine=13,thisPct,0)) q34pct
from (
 /*#g) calculate thisPct...*/
 select *, (thisCnt-(totalToHere-stanineCutoff))/thisCnt thisPct from (
 /* #f) join with totalCount e, join with stanine s... determine cuttofff count... return only cutoff points..*/
  select *, topPct*totCnt/100 stanineCutoff  from (
/*   #d) collapse into aggregate totals...*/
   select gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
/*    #c) get list of scores joined with scores of equal or lower value for each grade/year...*/
    select a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessemIsats, b.cnt from (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i where mIsat>0  and test='PSAE'     group by mIsat,year,gradeLevel) a
     left join (
     SELECT mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2 where mIsat>0 and test='PSAE'
       group by mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel) ) c
    group by score, thisCnt, gradeLevel, year) d
   inner join (
    select year eyr, gradeLevel egrd, count(*) totCnt, min(mIsat) minScore, max(mIsat) maxScore FROM
     isbedetails where mIsat>0 and test='PSAE'  group by year, gradeLevel) e
   on (d.year=e.eyr and d.gradeLevel=e.egrd)
   left join stanine s on (s.topPct*e.totCnt/100) between d.totalToHere-thisCnt and totalToHere) f
   where stanine is not null) g
 group by year, gradeLevel) h
left join isbe_tests i on (i.year=h.year and i.gradeLevel=h.gradeLevel and i.label=h.label)
where i.id is null
UINQ;
  db_query($q);
  echo $output;
  db_set_active();
  exit();
};//end baselines


$compRequest=getURLParam('composites');
if($compRequest){
     //this is a request for sch details...
//first do the Composites... then Math... then Reading...
    $qcomp=<<<UINQ
	insert into schwideComposites
(subj, shortlabel, cdts, year, maxMaxScore, minMinScore, wAvgScore, totalCount, wAvgPercentileEquivalent,wAvgoldPctEquiv,wAvgZScore, stanine, PME, s1pct, s2pct, s3pct, s4pct, s5pct, s6pct, s7pct, s8pct, s9pct, q1pct, q2pct, q3pct, q4pct, totalWarning, totalBelow, totalMeet, totalExceed, s1cnt, s2cnt, s3cnt, s4cnt, s5cnt, s6cnt, s7cnt, s8cnt, s9cnt, q1cnt, q2cnt, q3cnt, q4cnt)
SELECT  'Composite', t.shortlabel, h.cdts, h.year, max(maxscore) maxMaxScore, min(minscore) minMinScore,
round(sum(avgScore*h.totalCount)/sum(h.totalCount),1) wAvgScore,sum(h.totalCount) totalCount,
round(sum(percentileequivalent*h.totalCount)/sum(h.totalCount),1) wAvgPercentileEquivalent,
round(sum(oldPctEquiv*h.totalCount)/sum(h.totalCount),1) wAvgoldPctEquiv,
round(sum(zscore*h.totalCount)/sum(h.totalCount),3) wAvgZScore,
round(sum(stanineEquivalent*h.totalCount)/sum(h.totalCount),2) stanine,
round((sum(h.totalMeet)+sum(h.totalExceed))/sum(h.totalCount)*100,1) PME,
round(sum(h.s1cnt)/sum(h.totalCount)*100,1) s1pct, round(sum(h.s2cnt)/sum(h.totalCount)*100,1) s2pct, round(sum(h.s3cnt)/sum(h.totalCount)*100,1) s3pct, round(sum(h.s4cnt)/sum(h.totalCount)*100,1) s4pct, round(sum(h.s5cnt)/sum(h.totalCount)*100,1) s5pct, round(sum(h.s6cnt)/sum(h.totalCount)*100,1) s6pct, round(sum(h.s7cnt)/sum(h.totalCount)*100,1) s7pct, round(sum(h.s8cnt)/sum(h.totalCount)*100,1) s8pct, round(sum(h.s9cnt)/sum(h.totalCount)*100,1) s9pct, round(sum(h.q1cnt)/sum(h.totalCount)*100,1) q1pct, round(sum(h.q2cnt)/sum(h.totalCount)*100,1) q2pct, round(sum(h.q3cnt)/sum(h.totalCount)*100,1) q3pct, round(sum(h.q4cnt)/sum(h.totalCount)*100,1) q4pct,
sum(h.totalWarning) totalWarning, sum(h.totalBelow) totalBelow, sum(h.totalMeet) totalMeet, sum(h.totalExceed) totalExceed,
sum(h.s1cnt) s1cnt, sum(h.s2cnt) s2cnt, sum(h.s3cnt) s3cnt, sum(h.s4cnt) s4cnt, sum(h.s5cnt) s5cnt, sum(h.s6cnt) s6cnt, sum(h.s7cnt) s7cnt, sum(h.s8cnt) s8cnt, sum(h.s9cnt) s9cnt, sum(h.q1cnt) q1cnt, sum(h.q2cnt) q2cnt, sum(h.q3cnt) q3cnt, sum(h.q4cnt) q4cnt
from (select h1.*,
if(zp1.z is not null and zp2.z is not null,(zscore-zp1.z)/(zp2.z-zp1.z)*(zp2.p-zp1.p)+zp1.p,0) percentileEquivalent
,round(5.5+zscore*2,2) stanineEquivalent

from (
SELECT g.*,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
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
SELECT cdts,  d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(label) label, max(subject) subject, max(below) belowScore, max(meet) meetScore, max(exceed) exceedScore,
       max(if(score<below,totalToHere,0)) totalNotBelow,
       max(if(score<meet,totalToHere,0)) totalNotMeeting,
       max(if(score<exceed,totalToHere,0)) totalNotExceeding,
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
   SELECT cdts,  gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    SELECT a.cdts,  a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessepsReads, b.cnt from (
     SELECT cdts,  rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where rIsat>0 and rIsat is not null and  test='PSAE' and cdts ='%s' and year=%d
      group by cdts,  rIsat,year,gradeLevel) a
     left join (
     SELECT cdts,  rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where rIsat>0 and rIsat is not null  and  test='PSAE' and cdts ='%s' and year=%d
       group by cdts,  rIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel and a.cdts=b.cdts)
    ) c
    group by cdts,  score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='PSAE Reading')
group by cdts,  d.year, d.gradeLevel
) g

union
SELECT g.*,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
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
SELECT cdts,  d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(label) label, max(subject) subject, max(below) belowScore, max(meet) meetScore, max(exceed) exceedScore,
       max(if(score<below,totalToHere,0)) totalNotBelow,
       max(if(score<meet,totalToHere,0)) totalNotMeeting,
       max(if(score<exceed,totalToHere,0)) totalNotExceeding,
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
   SELECT cdts,  gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    SELECT a.cdts,  a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessepsMaths, b.cnt from (
     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where mIsat>0 and mIsat is not null and  test='PSAE' and cdts ='%s' and year=%d
      group by cdts,  mIsat,year,gradeLevel) a
     left join (
     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where mIsat>0 and mIsat is not null and  test='PSAE' and cdts ='%s' and year=%d
       group by cdts,  mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel and a.cdts=b.cdts)
    ) c
    group by cdts,  score, thisCnt, gradeLevel, year) d

   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='PSAE Mathematics')
group by cdts,  d.year, d.gradeLevel
) g
union
SELECT g.*,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
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
SELECT cdts,  d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(label) label, max(subject) subject, max(below) belowScore, max(meet) meetScore, max(exceed) exceedScore,
       max(if(score<below,totalToHere,0)) totalNotBelow,
       max(if(score<meet,totalToHere,0)) totalNotMeeting,
       max(if(score<exceed,totalToHere,0)) totalNotExceeding,
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
   SELECT cdts,  gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    SELECT a.cdts,  a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessepsScis, b.cnt from (
     SELECT cdts,  sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where sciIsat>0 and sciIsat is not null and  test='PSAE' and cdts ='%s' and year=%d
      group by cdts,  sciIsat,year,gradeLevel) a
     left join (
     SELECT cdts,  sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where sciIsat>0 and sciIsat is not null and  test='PSAE' and cdts ='%s' and year=%d
       group by cdts,  sciIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel and a.cdts=b.cdts)
    ) c
    group by cdts,  score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='PSAE Science')
group by cdts,  d.year, d.gradeLevel
) g
union
SELECT g.*,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
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
SELECT cdts,  d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(label) label, max(subject) subject, max(below) belowScore, max(meet) meetScore, max(exceed) exceedScore,
       max(if(score<below,totalToHere,0)) totalNotBelow,
       max(if(score<meet,totalToHere,0)) totalNotMeeting,
       max(if(score<exceed,totalToHere,0)) totalNotExceeding,
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
   SELECT cdts,  gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    SELECT a.cdts,  a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessesciIsats, b.cnt from (
     SELECT cdts,  sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where sciIsat>0 and sciIsat is not null and  test='ISAT' and cdts ='%s' and year=%d
      group by cdts,  sciIsat,year,gradeLevel) a
     left join (
     SELECT cdts,  sciIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where sciIsat>0 and sciIsat is not null  and  test='ISAT' and cdts ='%s' and year=%d
       group by cdts,  sciIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel and a.cdts=b.cdts)
    ) c
    group by cdts,  score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='ISAT Science')
group by cdts,  d.year, d.gradeLevel
) g
union
SELECT g.*,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
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
SELECT cdts,  d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(label) label, max(subject) subject, max(below) belowScore, max(meet) meetScore, max(exceed) exceedScore,
       max(if(score<below,totalToHere,0)) totalNotBelow,
       max(if(score<meet,totalToHere,0)) totalNotMeeting,
       max(if(score<exceed,totalToHere,0)) totalNotExceeding,
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
   SELECT cdts,  gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    SELECT a.cdts,  a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessemIsats, b.cnt from (
     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where mIsat>0 and mIsat is not null  and  test='ISAT' and cdts ='%s' and year=%d
      group by cdts,  mIsat,year,gradeLevel) a
     left join (

     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where mIsat>0 and mIsat is not null  and  test='ISAT' and cdts ='%s' and year=%d
       group by cdts,  mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel and a.cdts=b.cdts)
    ) c
    group by cdts,  score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='ISAT Mathematics')
group by cdts,  d.year, d.gradeLevel
) g
union
SELECT g.*,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
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
SELECT cdts,  d.year, d.gradeLevel,d.year-d.gradeLevel+12 cohort,
       max(label) label, max(subject) subject, max(below) belowScore, max(meet) meetScore, max(exceed) exceedScore,
       max(if(score<below,totalToHere,0)) totalNotBelow,
       max(if(score<meet,totalToHere,0)) totalNotMeeting,
       max(if(score<exceed,totalToHere,0)) totalNotExceeding,
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
   SELECT cdts,  gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    SELECT a.cdts,  a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lesserIsats, b.cnt from (
     SELECT cdts,  rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where rIsat>0 and rIsat is not null and  test='ISAT'  and cdts ='%s' and year=%d
      group by cdts,  rIsat,year,gradeLevel) a
     left join (
     SELECT cdts,  rIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where rIsat>0 and rIsat is not null  and  test='ISAT' and cdts ='%s' and year=%d
       group by cdts,  rIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel and a.cdts=b.cdts)
    ) c
    group by cdts,  score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='ISAT Reading')
group by cdts,  d.year, d.gradeLevel
) g
) h1
left join ztopconversion zp1 on (zp1.z>=h1.zscore and zp1.z<h1.zscore+0.006)
left join ztopconversion zp2 on zp2.z=zp1.z+0.006
) h
left join iamfroa5_cte.tblsitemaster t on h.cdts=t.cdts
left join schwideComposites swc on (h.cdts=swc.cdts and h.year=swc.year and subj='Composite')
where swc.cdts is null and swc.year is null
group by t.shortlabel, h.cdts,  h.year
UINQ;

	$q=<<<UINQ
select a.cdts, a.year yr from
(SELECT cdts, year, count(*) cnt FROM isbedetails i  group by cdts, year) a
left join schwideComposites s on (s.cdts=a.cdts and s.year=a.year and s.subj='Composite')
where s.year is null and cnt>10 and a.cdts is not null and a.cdts!=''
UINQ;
db_set_active('isbe');
$r=db_query($q);
$output.="...";

$i=0;
$cnt=db_result(db_query("SELECT count(*) cnt FROM schwideComposites where subj='Composite'"));
while($rw=db_fetch_array($r)){

 // $output.=" :".$rw['cdts'];
//  db_query($q2,$rw['cdts']);
  $nq=str_replace('%d',$rw['yr'],str_replace('%s',$rw['cdts'],$qcomp));
//print $nq;
//exit;
  db_query($nq);
//  if($i<1) $output.="<br>q=".$nq;
  if(db_error()) $output.="<br>Error: ".db_error();
  $i++;
};
$cnt2=db_result(db_query("SELECT count(*) cnt FROM schwideComposites where subj='Composite'"));
//if($i>298) $output.="<br> The maximum number of records was processed, keep running this command until all records have been created.";
$output.=" <br> School Compsites for ".$i." schools/years processed, ".$cnt." records before, ".$cnt2." records now.";







//now Math...
    $qcomp=<<<UINQ
	insert into schwideComposites
(subj, shortlabel, cdts, year, maxMaxScore, minMinScore, wAvgScore, totalCount, wAvgPercentileEquivalent,wAvgoldPctEquiv,wAvgZScore, stanine, PME, s1pct, s2pct, s3pct, s4pct, s5pct, s6pct, s7pct, s8pct, s9pct, q1pct, q2pct, q3pct, q4pct, totalWarning, totalBelow, totalMeet, totalExceed, s1cnt, s2cnt, s3cnt, s4cnt, s5cnt, s6cnt, s7cnt, s8cnt, s9cnt, q1cnt, q2cnt, q3cnt, q4cnt)
SELECT  'Math', t.shortlabel, h.cdts, h.year, max(maxscore) maxMaxScore, min(minscore) minMinScore,
round(sum(avgScore*h.totalCount)/sum(h.totalCount),1) wAvgScore,sum(h.totalCount) totalCount,
round(sum(percentileequivalent*h.totalCount)/sum(h.totalCount),1) wAvgPercentileEquivalent,
round(sum(oldPctEquiv*h.totalCount)/sum(h.totalCount),1) wAvgoldPctEquiv,
round(sum(zscore*h.totalCount)/sum(h.totalCount),3) wAvgZScore,
round(sum(stanineEquivalent*h.totalCount)/sum(h.totalCount),2) stanine,
round((sum(h.totalMeet)+sum(h.totalExceed))/sum(h.totalCount)*100,1) PME,
round(sum(h.s1cnt)/sum(h.totalCount)*100,1) s1pct, round(sum(h.s2cnt)/sum(h.totalCount)*100,1) s2pct, round(sum(h.s3cnt)/sum(h.totalCount)*100,1) s3pct, round(sum(h.s4cnt)/sum(h.totalCount)*100,1) s4pct, round(sum(h.s5cnt)/sum(h.totalCount)*100,1) s5pct, round(sum(h.s6cnt)/sum(h.totalCount)*100,1) s6pct, round(sum(h.s7cnt)/sum(h.totalCount)*100,1) s7pct, round(sum(h.s8cnt)/sum(h.totalCount)*100,1) s8pct, round(sum(h.s9cnt)/sum(h.totalCount)*100,1) s9pct, round(sum(h.q1cnt)/sum(h.totalCount)*100,1) q1pct, round(sum(h.q2cnt)/sum(h.totalCount)*100,1) q2pct, round(sum(h.q3cnt)/sum(h.totalCount)*100,1) q3pct, round(sum(h.q4cnt)/sum(h.totalCount)*100,1) q4pct,
sum(h.totalWarning) totalWarning, sum(h.totalBelow) totalBelow, sum(h.totalMeet) totalMeet, sum(h.totalExceed) totalExceed,
sum(h.s1cnt) s1cnt, sum(h.s2cnt) s2cnt, sum(h.s3cnt) s3cnt, sum(h.s4cnt) s4cnt, sum(h.s5cnt) s5cnt, sum(h.s6cnt) s6cnt, sum(h.s7cnt) s7cnt, sum(h.s8cnt) s8cnt, sum(h.s9cnt) s9cnt, sum(h.q1cnt) q1cnt, sum(h.q2cnt) q2cnt, sum(h.q3cnt) q3cnt, sum(h.q4cnt) q4cnt
from (select h1.*,
if(zp1.z is not null and zp2.z is not null,(zscore-zp1.z)/(zp2.z-zp1.z)*(zp2.p-zp1.p)+zp1.p,0) percentileEquivalent
,round(5.5+zscore*2,2) stanineEquivalent

from (
SELECT g.*,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
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
SELECT cdts,  d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(label) label, max(subject) subject, max(below) belowScore, max(meet) meetScore, max(exceed) exceedScore,
       max(if(score<below,totalToHere,0)) totalNotBelow,
       max(if(score<meet,totalToHere,0)) totalNotMeeting,
       max(if(score<exceed,totalToHere,0)) totalNotExceeding,
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
   SELECT cdts,  gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    SELECT a.cdts,  a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessepsMaths, b.cnt from (
     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where mIsat>0 and mIsat is not null and  test='PSAE' and cdts ='%s' and year=%d
      group by cdts,  mIsat,year,gradeLevel) a
     left join (
     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where mIsat>0 and mIsat is not null and  test='PSAE' and cdts ='%s' and year=%d
       group by cdts,  mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel and a.cdts=b.cdts)
    ) c
    group by cdts,  score, thisCnt, gradeLevel, year) d

   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='PSAE Mathematics')
group by cdts,  d.year, d.gradeLevel
) g
union
SELECT g.*,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
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
SELECT cdts,  d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(label) label, max(subject) subject, max(below) belowScore, max(meet) meetScore, max(exceed) exceedScore,
       max(if(score<below,totalToHere,0)) totalNotBelow,
       max(if(score<meet,totalToHere,0)) totalNotMeeting,
       max(if(score<exceed,totalToHere,0)) totalNotExceeding,
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
   SELECT cdts,  gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    SELECT a.cdts,  a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessemIsats, b.cnt from (
     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where mIsat>0 and mIsat is not null  and  test='ISAT' and cdts ='%s' and year=%d
      group by cdts,  mIsat,year,gradeLevel) a
     left join (

     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where mIsat>0 and mIsat is not null  and  test='ISAT' and cdts ='%s' and year=%d
       group by cdts,  mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel and a.cdts=b.cdts)
    ) c
    group by cdts,  score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='ISAT Mathematics')
group by cdts,  d.year, d.gradeLevel
) g

) h1
left join ztopconversion zp1 on (zp1.z>=h1.zscore and zp1.z<h1.zscore+0.006)
left join ztopconversion zp2 on zp2.z=zp1.z+0.006
) h
left join iamfroa5_cte.tblsitemaster t on h.cdts=t.cdts
left join schwideComposites swc on (h.cdts=swc.cdts and h.year=swc.year and subj='Math')
where swc.cdts is null and swc.year is null
group by t.shortlabel, h.cdts,  h.year
UINQ;

	$q=<<<UINQ
select a.cdts, a.year yr from
(SELECT cdts, year, count(*) cnt FROM isbedetails i  group by cdts, year) a
left join schwideComposites s on (s.cdts=a.cdts and s.year=a.year and s.subj='Math')
where s.year is null and cnt>10 and a.cdts is not null and a.cdts!=''
UINQ;
db_set_active('isbe');
$r=db_query($q);
$output.="...";

$i=0;
$cnt=db_result(db_query("SELECT count(*) cnt FROM schwideComposites where subj='Math'"));
while($rw=db_fetch_array($r)){

 // $output.=" :".$rw['cdts'];
//  db_query($q2,$rw['cdts']);
  $nq=str_replace('%d',$rw['yr'],str_replace('%s',$rw['cdts'],$qcomp));
//print $nq;
//exit;
  db_query($nq);
//  if($i<1) $output.="<br>q=".$nq;
  if(db_error()) $output.="<br>Error: ".db_error();
  $i++;
};
$cnt2=db_result(db_query("SELECT count(*) cnt FROM schwideComposites where subj='Math'"));
//if($i>298) $output.="<br> The maximum number of records was processed, keep running this command until all records have been created.";
$output.=" <br>  Math Composites for ".$i." schools/years processed, ".$cnt." records before, ".$cnt2." records now.";







//now Reading...
    $qcomp=<<<UINQ
	insert into schwideComposites
(subj, shortlabel, cdts, year, maxMaxScore, minMinScore, wAvgScore, totalCount, wAvgPercentileEquivalent,wAvgoldPctEquiv,wAvgZScore, stanine, PME, s1pct, s2pct, s3pct, s4pct, s5pct, s6pct, s7pct, s8pct, s9pct, q1pct, q2pct, q3pct, q4pct, totalWarning, totalBelow, totalMeet, totalExceed, s1cnt, s2cnt, s3cnt, s4cnt, s5cnt, s6cnt, s7cnt, s8cnt, s9cnt, q1cnt, q2cnt, q3cnt, q4cnt)
SELECT  'Reading', t.shortlabel, h.cdts, h.year, max(maxscore) maxMaxScore, min(minscore) minMinScore,
round(sum(avgScore*h.totalCount)/sum(h.totalCount),1) wAvgScore,sum(h.totalCount) totalCount,
round(sum(percentileequivalent*h.totalCount)/sum(h.totalCount),1) wAvgPercentileEquivalent,
round(sum(oldPctEquiv*h.totalCount)/sum(h.totalCount),1) wAvgoldPctEquiv,
round(sum(zscore*h.totalCount)/sum(h.totalCount),3) wAvgZScore,
round(sum(stanineEquivalent*h.totalCount)/sum(h.totalCount),2) stanine,
round((sum(h.totalMeet)+sum(h.totalExceed))/sum(h.totalCount)*100,1) PME,
round(sum(h.s1cnt)/sum(h.totalCount)*100,1) s1pct, round(sum(h.s2cnt)/sum(h.totalCount)*100,1) s2pct, round(sum(h.s3cnt)/sum(h.totalCount)*100,1) s3pct, round(sum(h.s4cnt)/sum(h.totalCount)*100,1) s4pct, round(sum(h.s5cnt)/sum(h.totalCount)*100,1) s5pct, round(sum(h.s6cnt)/sum(h.totalCount)*100,1) s6pct, round(sum(h.s7cnt)/sum(h.totalCount)*100,1) s7pct, round(sum(h.s8cnt)/sum(h.totalCount)*100,1) s8pct, round(sum(h.s9cnt)/sum(h.totalCount)*100,1) s9pct, round(sum(h.q1cnt)/sum(h.totalCount)*100,1) q1pct, round(sum(h.q2cnt)/sum(h.totalCount)*100,1) q2pct, round(sum(h.q3cnt)/sum(h.totalCount)*100,1) q3pct, round(sum(h.q4cnt)/sum(h.totalCount)*100,1) q4pct,
sum(h.totalWarning) totalWarning, sum(h.totalBelow) totalBelow, sum(h.totalMeet) totalMeet, sum(h.totalExceed) totalExceed,
sum(h.s1cnt) s1cnt, sum(h.s2cnt) s2cnt, sum(h.s3cnt) s3cnt, sum(h.s4cnt) s4cnt, sum(h.s5cnt) s5cnt, sum(h.s6cnt) s6cnt, sum(h.s7cnt) s7cnt, sum(h.s8cnt) s8cnt, sum(h.s9cnt) s9cnt, sum(h.q1cnt) q1cnt, sum(h.q2cnt) q2cnt, sum(h.q3cnt) q3cnt, sum(h.q4cnt) q4cnt
from (select h1.*,
if(zp1.z is not null and zp2.z is not null,(zscore-zp1.z)/(zp2.z-zp1.z)*(zp2.p-zp1.p)+zp1.p,0) percentileEquivalent
,round(5.5+zscore*2,2) stanineEquivalent

from (
SELECT g.*,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
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
SELECT cdts,  d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(label) label, max(subject) subject, max(below) belowScore, max(meet) meetScore, max(exceed) exceedScore,
       max(if(score<below,totalToHere,0)) totalNotBelow,
       max(if(score<meet,totalToHere,0)) totalNotMeeting,
       max(if(score<exceed,totalToHere,0)) totalNotExceeding,
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
   SELECT cdts,  gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    SELECT a.cdts,  a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessepsMaths, b.cnt from (
     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where mIsat>0 and mIsat is not null and  test='PSAE' and cdts ='%s' and year=%d
      group by cdts,  mIsat,year,gradeLevel) a
     left join (
     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where mIsat>0 and mIsat is not null and  test='PSAE' and cdts ='%s' and year=%d
       group by cdts,  mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel and a.cdts=b.cdts)
    ) c
    group by cdts,  score, thisCnt, gradeLevel, year) d

   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='PSAE Reading')
group by cdts,  d.year, d.gradeLevel
) g
union
SELECT g.*,
  round((s9totToHere-totalNotMeeting)/s9totToHere*100,1) pme, s9totToHere totalCount,
  totalNotBelow totalWarning, totalNotMeeting-totalNotBelow totalBelow,totalNotExceeding-totalNotMeeting totalMeet, s9totToHere-totalNotExceeding totalExceed,
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
SELECT cdts,  d.year, d.gradeLevel, d.year-d.gradeLevel+12 cohort,
       max(label) label, max(subject) subject, max(below) belowScore, max(meet) meetScore, max(exceed) exceedScore,
       max(if(score<below,totalToHere,0)) totalNotBelow,
       max(if(score<meet,totalToHere,0)) totalNotMeeting,
       max(if(score<exceed,totalToHere,0)) totalNotExceeding,
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
   SELECT cdts,  gradeLevel, year, score, thisCnt, sum(cnt) totalToHere from (
    SELECT a.cdts,  a.score, a.gradeLevel, a.year, a.cnt thisCnt, b.score lessemIsats, b.cnt from (
     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i
      where mIsat>0 and mIsat is not null  and  test='ISAT' and cdts ='%s' and year=%d
      group by cdts,  mIsat,year,gradeLevel) a
     left join (

     SELECT cdts,  mIsat score, gradeLevel, year, count(*) cnt FROM isbedetails i2
      where mIsat>0 and mIsat is not null  and  test='ISAT' and cdts ='%s' and year=%d
       group by cdts,  mIsat,year,gradeLevel) b
     on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel and a.cdts=b.cdts)
    ) c
    group by cdts,  score, thisCnt, gradeLevel, year) d
   left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='ISAT Reading')
group by cdts,  d.year, d.gradeLevel
) g

) h1
left join ztopconversion zp1 on (zp1.z>=h1.zscore and zp1.z<h1.zscore+0.006)
left join ztopconversion zp2 on zp2.z=zp1.z+0.006
) h
left join iamfroa5_cte.tblsitemaster t on h.cdts=t.cdts
left join schwideComposites swc on (h.cdts=swc.cdts and h.year=swc.year and subj='Reading')
where swc.cdts is null and swc.year is null
group by t.shortlabel, h.cdts,  h.year
UINQ;

	$q=<<<UINQ
select a.cdts, a.year yr from
(SELECT cdts, year, count(*) cnt FROM isbedetails i  group by cdts, year) a
left join schwideComposites s on (s.cdts=a.cdts and s.year=a.year and s.subj='Reading')
where s.year is null and cnt>10 and a.cdts is not null and a.cdts!=''
UINQ;
db_set_active('isbe');
$r=db_query($q);
$output.="...";

$i=0;
$cnt=db_result(db_query("SELECT count(*) cnt FROM schwideComposites where subj='Reading'"));
while($rw=db_fetch_array($r)){

 // $output.=" :".$rw['cdts'];
//  db_query($q2,$rw['cdts']);
  $nq=str_replace('%d',$rw['yr'],str_replace('%s',$rw['cdts'],$qcomp));
//print $nq;
//exit;
  db_query($nq);
//  if($i<1) $output.="<br>q=".$nq;
  if(db_error()) $output.="<br>Error: ".db_error();
  $i++;
};
$cnt2=db_result(db_query("SELECT count(*) cnt FROM schwideComposites where subj='Reading'"));
//if($i>298) $output.="<br> The maximum number of records was processed, keep running this command until all records have been created.";
$output.=" <br>  Reading Composites for ".$i." schools/years processed, ".$cnt." records before, ".$cnt2." records now.";

 echo $output;
 exit();

};//end composites





$grwRequest=getURLParam('growth');
if($grwRequest){
	$q=<<<UINQ
select max(year) from schwideComposites
UINQ;
db_set_active('isbe');
$yr=db_result(db_query($q));
$output.="<br>Done processing the schwideGrowth table for the $yr year.  There were ".db_result(db_query("select count(*) from schwideGrowth"))." records for all years before and now there are ";

    $q2=<<<UINQ
insert into schwideGrowth (shortLabel, cdts, subj, year, yrsGrowth, stanineStart, stanineEnd, stanineGrowth, stanineGrowthPerYear, pmeGrowth, percentileGrowth,
 mathStanineStart, mathStanineEnd, mathStanineGrowth, mathPmeGrowth, mathPercentileGrowth,
 readingStanineStart, readingStanineEnd, readingStanineGrowth, readingPmeGrowth, readingPercentileGrowth)
select  shortLabel, cdts, subj, year, yrsGrowth, stanineStart, stanineEnd, stanineGrowth, round(stanineGrowth/yrsGrowth*100)/100 stanineGrowthPerYear, pmeGrowth, percentileGrowth,
 mathStanineStart, mathStanineEnd, mathStanineGrowth, mathPmeGrowth, mathPercentileGrowth,
 readingStanineStart, readingStanineEnd, readingStanineGrowth, readingPmeGrowth, readingPercentileGrowth
 from
(SELECT s1.shortLabel,s1.cdts, s1.subj, s1.year, s1.year-s2.year yrsGrowth, s2.stanine stanineStart, s1.stanine stanineEnd,
round((s1.stanine-s2.stanine)*100)/100 stanineGrowth,round((s1.pme-s2.pme)*100)/100 pmeGrowth,
round((s1.wAvgPercentileEquivalent-s2.wAvgPercentileEquivalent)*100)/100 percentileGrowth
FROM schwideComposites s1
inner join schwideComposites s2 on (s1.cdts=s2.cdts and s1.subj=s2.subj and s1.year=s2.year+1)
where s1.year=2011 and s1.subj='Composite') c
left join
(SELECT s1.cdts mcdts, s2.stanine mathStanineStart, s1.stanine mathStanineEnd,
round((s1.stanine-s2.stanine)*100)/100 mathStanineGrowth,round((s1.pme-s2.pme)*100)/100 mathPmeGrowth,
round((s1.wAvgPercentileEquivalent-s2.wAvgPercentileEquivalent)*100)/100 mathPercentileGrowth
FROM schwideComposites s1
inner join schwideComposites s2 on (s1.cdts=s2.cdts and s1.subj=s2.subj and s1.year=s2.year+1)
where s1.year=2011 and s1.subj='Math') m on c.cdts=m.mcdts
left join
(SELECT s1.cdts rcdts, s2.stanine readingStanineStart, s1.stanine readingStanineEnd,
round((s1.stanine-s2.stanine)*100)/100 readingStanineGrowth,round((s1.pme-s2.pme)*100)/100 readingPmeGrowth,
round((s1.wAvgPercentileEquivalent-s2.wAvgPercentileEquivalent)*100)/100 readingPercentileGrowth
FROM schwideComposites s1
inner join schwideComposites s2 on (s1.cdts=s2.cdts and s1.subj=s2.subj and s1.year=s2.year+1)
where s1.year=2011 and s1.subj='Reading') r on c.cdts=r.rcdts
left join (select cdts ocdts, year oyear, yrsGrowth oyrsGrowth from schwideGrowth) g on (c.cdts=ocdts and c.year=oyear and c.yrsGrowth=oyrsGrowth) where ocdts is null
UINQ;
if($yr){
    $q3=str_replace("2011", $yr, $q2);
    $r=db_query($q3);
    for($i=2;$i<7;$i++){
        $q4=str_replace("year+1","year+".$i,$q3);
        $r=db_query($q4);
    }
};
    $output.=db_result(db_query("select count(*) from schwideGrowth"))." records.<br>$q4<br>";

   echo $output;
   exit();
};  //end growth









$schId=getURLParam('exceptions');
if($schId){

db_set_active('isbe');

	$q=<<<UINQ
SELECT a.year, a.gradelevel, detcnt, i.cntcnt, totcnt, hasMinN, aaacnt
  FROM ( select gradelevel, year, count(*) detcnt FROM isbedetails group by year, gradelevel) a
left join (select gradelevel, year, sum(if(fi='123',cnt,0)) cntcnt, sum(cnt) totcnt, sum(if(fi='123' and cnt!=minN,1,0)) hasMinN,sum(if(fi='',cnt,0)) aaacnt
  from isbecnts group by year, gradelevel) i
on (a.gradelevel=i.gradelevel and a.year=i.year)
UINQ;
$rr=db_query($q);
$output.="...";

//to create the '123' filter records...
	$q2d=<<<UINQ
delete from isbecnts where year=2000 and gradelevel='05'
UINQ;
	$q2=<<<UINQ
insert into isbecnts  (year, gradelevel, cdts, sex, eth, freelunch, cnt, schind, indind, minN, fi)
SELECT year, gradelevel,cdts,ifnull(sex,'') sex,ifnull(eth,'')  eth, ifnull(freelunch,'')  freelunch, count(*) cnt, concat(year,'_',gradelevel,'_',cdts) schind,
concat(ifnull(sex,''),'_',ifnull(eth,''),'_',ifnull(freelunch,'')) indind, count(*) minN, '123' fi
 FROM isbedetails i where year=2000 and gradelevel='05' group by test, year, gradelevel,cdts,sex, eth, freelunch
UINQ;

//to set the minN values on '123' filters....
	$q3=<<<UINQ
update isbecnts o inner join (
select id, year, gradelevel, cdts, schind, sex, eth, freelunch, cnt,
if(minN1>0 and minN1<cnt and (minN2=0 or minN1<minN2) and (minN3=0 or minN1<minN3),minN1,
 if(minN2>0 and minN2<cnt and (minN3=0 or minN2<minN3),minN2,
  if(minN3>0 and minN3<cnt,minN3,cnt))) minN, fi
from (
SELECT i.id, i.year, i.gradelevel, i.cdts, i.schind, i.sex,  i.eth, i.freelunch,
  min(thiscnt) cnt, sum(if(i.sex=i2.sex and i.eth=i2.eth,sibcnts,0)) minN1,
  sum(if(i.eth=i2.eth and i.freelunch=i2.freelunch,sibcnts,0)) minN2,
  sum(if(i.sex=i2.sex and i.freelunch=i2.freelunch,sibcnts,0)) minN3, '123' fi
FROM (select id, year, gradelevel, cdts, schind,sex,freelunch, eth, cnt thiscnt from isbecnts
  where fi='123'  and year=2000 and gradelevel='05') i
left join (select schind,sex,freelunch, eth, cnt sibcnts from isbecnts
  where fi='123' and cnt<10  and year=2000  and gradelevel='05') i2 on (i.schind=i2.schind)
group by  i.schind, i.sex,i.freelunch, i.eth
) c
) d
on (o.id=d.id)
set o.minN=d.minN where d.minN is not null
UINQ;

//to create the '1', '2', '3', '12', '13', '23' filters...
	$q4d=<<<UINQ
delete from isbecnts where year=2000 and gradelevel='05' and fi!='123'
UINQ;
	$q4=<<<UINQ
insert into isbecnts (year, gradelevel, cdts, schind, sex, eth, freelunch, cnt, minN, fi)
select year, gradelevel, cdts, schind, sex, eth, freelunch, cnt,
if(minN1>0 and minN1<cnt,minN1,cnt) minN, fi
from (
SELECT i.year, i.gradelevel, i.cdts, i.schind, i.sex,  'a' eth, 'a' freelunch,
  min(thiscnt) cnt, sum(sibcnts) minN1,
  '1' fi
FROM (select year, gradelevel, cdts, schind,sex, sum(cnt) thiscnt from isbecnts
  where fi='123' and year=2000 and gradelevel='05' group by schind,sex) i
left join (select schind,sex, sum(cnt) sibcnts from isbecnts
  where fi='123' and year=2000 and gradelevel='05' group by schind, sex) i2 on (i.schind=i2.schind and i2.sibcnts<10)
group by i.schind, i.sex
) c
union
select year, gradelevel, cdts, schind, sex, eth, freelunch, cnt,
if(minN1>0 and minN1<cnt,minN1,cnt) minN, fi
from (
SELECT i.year, i.gradelevel, i.cdts, i.schind, 'a' sex,  i.eth, 'a' freelunch,
  min(thiscnt) cnt, sum(sibcnts) minN1,
  '2' fi
FROM (select year, gradelevel, cdts, schind,eth, sum(cnt) thiscnt from isbecnts
  where fi='123'  and year=2000 and gradelevel='05' group by schind,eth) i
left join (select schind,eth, sum(cnt) sibcnts from isbecnts
  where fi='123'  and year=2000 and gradelevel='05' group by schind, eth) i2 on (i.schind=i2.schind and i2.sibcnts<10)
group by  i.schind, i.eth
) c
union
select year, gradelevel, cdts, schind, sex, eth, freelunch, cnt,
if(minN1>0 and minN1<cnt,minN1,cnt) minN, fi
from (
SELECT i.year, i.gradelevel, i.cdts, i.schind, 'a' sex,  'a' eth, i.freelunch,
  min(thiscnt) cnt, sum(sibcnts) minN1,
  '3' fi
FROM (select year, gradelevel, cdts, schind,freelunch, sum(cnt) thiscnt from isbecnts
  where fi='123'  and year=2000 and gradelevel='05' group by schind,freelunch) i
left join (select schind,freelunch, sum(cnt) sibcnts from isbecnts
  where fi='123'  and year=2000 and gradelevel='05' group by schind, freelunch) i2 on (i.schind=i2.schind and i2.sibcnts<10)
group by  i.schind, i.freelunch
) c
union
select year, gradelevel, cdts, schind, sex, eth, freelunch, cnt,
if(minN1>0 and minN1<cnt and (minN3=0 or minN1<minN3),minN1,if(minN3>0 and minN3<cnt,minN3,cnt)) minN, fi
from (
SELECT i.year, i.gradelevel, i.cdts, i.schind, i.sex,  i.eth, 'a' freelunch,
  min(thiscnt) cnt, sum(if(i.sex=i2.sex,sibcnts,0)) minN1,
  sum(if(i.eth=i2.eth,sibcnts,0)) minN3, '12' fi
FROM (select year, gradelevel, cdts, schind,sex, eth, sum(cnt) thiscnt from isbecnts
  where fi='123'  and year=2000 and gradelevel='05' group by schind,sex, eth) i
left join (select schind,sex, eth, sum(cnt) sibcnts from isbecnts
  where fi='123'  and year=2000 and gradelevel='05' group by schind, sex,eth) i2 on (i.schind=i2.schind and i2.sibcnts<10)
group by  i.schind, i.sex, i.eth
) c
union
select year, gradelevel, cdts, schind, sex, eth, freelunch, cnt,
if(minN1>0 and minN1<cnt and (minN3=0 or minN1)<minN3,minN1,if(minN3>0 and minN3<cnt,minN3,cnt)) minN, fi
from (
SELECT i.year, i.gradelevel, i.cdts, i.schind, i.sex,  'a' eth,i.freelunch,
  min(thiscnt) cnt, sum(if(i.sex=i2.sex,sibcnts,0)) minN1,
  sum(if(i.freelunch=i2.freelunch,sibcnts,0)) minN3, '13' fi
FROM (select year, gradelevel, cdts, schind,sex, freelunch, sum(cnt) thiscnt from isbecnts
  where fi='123'  and year=2000 and gradelevel='05' group by schind,sex, freelunch) i
left join (select schind,sex, freelunch, sum(cnt) sibcnts from isbecnts
  where fi='123'  and year=2000 and gradelevel='05' group by schind, sex,freelunch) i2 on (i.schind=i2.schind and i2.sibcnts<10)
group by  i.schind, i.sex, i.freelunch
) c
union
select year, gradelevel, cdts, schind, sex, eth, freelunch, cnt,
if(minN1>0 and minN1<cnt and (minN3=0 or minN1<minN3),minN1,if(minN3>0 and minN3<cnt,minN3,cnt)) minN, fi
from (
SELECT i.year, i.gradelevel, i.cdts, i.schind, 'a' sex,  i.eth, i.freelunch,
  min(thiscnt) cnt, sum(if(i.freelunch=i2.freelunch,sibcnts,0)) minN1,
  sum(if(i.eth=i2.eth,sibcnts,0)) minN3, '23' fi
FROM (select year, gradelevel, cdts, schind,freelunch, eth, sum(cnt) thiscnt from isbecnts
  where fi='123'  and year=2000 and gradelevel='05' group by schind,freelunch, eth) i
left join (select schind,freelunch, eth, sum(cnt) sibcnts from isbecnts
  where fi='123'  and year=2000 and gradelevel='05' group by schind, freelunch,eth) i2 on (i.schind=i2.schind and i2.sibcnts<10)
group by  i.schind, i.freelunch, i.eth
) c

UINQ;

//to create the 'a','a','a' filter or whole school filter....
	$q5d=<<<UINQ
delete from isbecnts where year=2000 and gradelevel='05' and fi=''
UINQ;
	$q5=<<<UINQ
insert into isbecnts (year, gradelevel, cdts, schind, sex, eth, freelunch, cnt, minN, fi)
select year, gradelevel, cdts, schind, sex, eth, freelunch, cnt,
cnt minN, fi
from (
SELECT i.year, i.gradelevel, i.cdts, i.schind, 'a' sex,  'a' eth, 'a' freelunch,
  min(thiscnt) cnt,  '' fi
FROM (select year, gradelevel, cdts, schind,sex, sum(cnt) thiscnt from isbecnts
  where fi='123' and year=2000 and gradelevel='05' group by schind) i
group by i.schind
) c
UINQ;

$i=0;
$added=0;
$strt=intval(time());
ob_clean();
ob_start();
echo "count= number of unique combinations of school, gender, race, freeLunch; hasMinN Count=number of records that have already been processed; total count=number of unique combinations and sub combinations that already exist...<br><br>\n";
while($r=db_fetch_object($rr)){
	echo (string)(intval(time())-$strt)."- Year: ".$r->year.", grade: ".$r->gradelevel.", count:".$r->detcnt. ", hasMinN count:".$r->hasMinN. ", total count:".$r->totcnt;
	if($r->detcnt==$r->cntcnt) {
		echo ", combinations already exists\n<br>";
		ob_flush();
	}
	else {

		$nq=str_replace('2000',$r->year,str_replace('05',$r->gradelevel,$q2d));//deletes any partially created grade/year combos...
		db_query($nq);
		$nq=str_replace('2000',$r->year,str_replace('05',$r->gradelevel,$q2));//creates grade/year combo exception list...
		db_query($nq);
		echo ", combinations added\n<br>";
		ob_flush();
		$added++;
	}
	if($r->hasMinN==0) {  //then minN has not been processed yet...

		$nq=str_replace('2000',$r->year,str_replace('05',$r->gradelevel,$q3));//update grade/year combo with minN...
		db_query($nq);
		echo (string)(intval(time())-$strt)."-  minN calculated\n<br>";
		ob_flush();
	}
	if($r->totcnt==$r->cntcnt) {  //then there are no sub-queries yet...

		$nq=str_replace('2000',$r->year,str_replace('05',$r->gradelevel,$q4d));//deletes any partially created grade/year sub-combos...
		db_query($nq);
		$nq=str_replace('2000',$r->year,str_replace('05',$r->gradelevel,$q4));//creates grade/year sub-combo exception list...
		db_query($nq);
		echo (string)(intval(time())-$strt)."-  sub combos added\n<br>";
		ob_flush();
	};
	if($r->aaacnt==0) {  //then there are no whole school filters yet...

		$nq=str_replace('2000',$r->year,str_replace('05',$r->gradelevel,$q5d));//deletes any partially created grade/year sub-combos...
		db_query($nq);
		$nq=str_replace('2000',$r->year,str_replace('05',$r->gradelevel,$q5));//creates grade/year sub-combo exception list...
		db_query($nq);
		echo (string)(intval(time())-$strt)."-  whole school filters added.\n<br>";
		ob_flush();
	};
	$i++;
};
$output.=" <br>  ".$i." grades/years checked, ".$added." grades/years processed (version b) ";

 echo $output;
 exit();

};//end exceptions


$schId=getURLParam('clearfilters');
if($schId){

db_set_active('isbe');

	$q=<<<UINQ
delete FROM isbefilters
UINQ;
$rr=db_query($q);
 echo "All Filters have been deleted...";
 exit();

};//end clearfilters

	  $colnames=<<<UINQ
[{"sTitle":"Filter","field":"filter"},{"sTitle":"Count","field":"cnt"}]
UINQ;
	$q="select filter, count(*) cnt from isbefilters group by filter";
	$output.=makeDS("noreport", $q, $colnames,'isbe');


// header('Content-Type: text/javascript; charset=utf-8');
?><html>
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

			</script>
</head>
<body>
    <a href="updatecomposites.php?baselines=t">Update Baselines</a>  This may take several minutes... but if it does not return, it is safe to rerun it.  This script will create the normalized stanine boundaries based on the data from the  entire state. It only does this for new data so if you added a year of raw data, it will create a baseline record in the isbe_tests table for each grade level and each test for that year. <b>Don't forget to add cutoff scores to isbe_tests after this step and before running composites...</b><br><br>
<a href="updatecomposites.php?composites=t">Update Composites</a>  Run this after running baselines... This may take several minutes... but if it does not return, it is safe to rerun it.  This script will calculate all the composites for each year for each school and then do the same for math and reading.  This is stored in the schwideComposites table.<br><br>
<a href="updatecomposites.php?growth=t">Update Growth Table</a>  Run this after updating composites.. this will generate the table of growth for the most recent year.  It will create a growth in composite, math, reading and going back one year, two, three, four, and five years.<br><br>
<a href="updatecomposites.php?exceptions=t">Update Exceptions</a>  Run this after running baselines and composites... This may take several minutes... but if it does not return, it is safe to rerun it.  This script will determine if any combinations of filters create a sub group smaller than 10... it is not currently used for anything but could be.<br><br>
<a href="updatecomposites.php?clearfilters=t">Clear all Filters</a>  Run this after running baselines and composites and Exceptions.. Every time you query from the public site, the new query will be run (and it may take a while) and will be stored in the filters table.  It is safe to rerun this any time.  This script dumps all old filters that are cached.<br><br>......
<script>
$(document).ready(function(){
	if(_dso.noreport){
		_dso.noreport.displayTable("noreportTable",{"sDom": 'lipt',"bAutoWidth": false});
	};
});
<?php
echo $output;
?>
</script>
       <div id="noreportTable">No records.</div>
</body></html>
