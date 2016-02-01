var http = require('http');
var mysql = require('mysql');
// sudo /usr/local/Cellar/mysql/5.7.9/support-files/mysql.server start
var config = require('./config.js')
var async = require('async')

  console.log(config)

//need to Convert to js and make a function to pass in sch cdts
var processComposites = function() {
  var connection = mysql.createConnection(config);
  connection.connect(function(err, con) {
    if(err) console.log("Connection error for " + con + ":" + err);
  });

  console.log(config)
  var compositesQuery = getQuery()

  schoolsQuery=`
    select sch.*, tcnt, z.cdts zcdts, totComps
    from  (
      select cdts, sum(cnt) tcnt from (
        select cdts, count(*) cnt from isbedetails group by cdts
        union
        select cdts, count(*) cnt from parccdetails group by cdts
      ) y group by cdts
    ) z
    left join tblsitemaster sch
    on sch.cdts = z.cdts
    left join (
      select cdts, count(*) totComps from schwideComposites group by cdts
  ) cmp on cmp.cdts = z.cdts
    where (sch.cdts is not null and tcnt > 20 and cmp.totComps is null)
  `;  // edit the where statement above to determine which schools to process

  console.log("about to start schoolsQuery")
  var cnt =0

  connection.query(schoolsQuery, function(err, rows, fields){
    if (err) console.log(err)
      else console.log(`Processing ${rows.length} schools`)
    async.eachSeries(rows, function(row, callback) {
      cdts=row['cdts'];
      if (!cdts) {
        console.log(`Error: missing school for cdts code ${row['zcdts']}`)
        callback()
        return
      }
      console.log(`${cnt++}) Start ${cdts} at ${currTime()}`)
      searchStr = "cdts='" + cdts + "'";
      schName = row['shortlabel'] || "Missing Name"

      var q = compositesQuery
      q = q.replace(/8=8/g, schName)
           .replace(/9=9/g, searchStr)
           .replace(/\|cdts\|/g, cdts);
      connection.query(q, function(err, rows, fields) {
        if (err) console.log(`SchQuery Error: ${err} ->  q= ${q}`)
        else console.log(`Processed ${cdts} with ${rows['message']}  at ${currTime()}`)
        callback()
      })
      console.log(`End ${cdts} at ${currTime()}`)
    },
    function(err) {
      //done
      console.log(`Final Error: ${err}`)
      connection.end()
    })
  })

};//end processComposites...


var getQuery = function() {
  var query_for_isat_and_psae = `
    select g.*,'8=8' q, '|test|' test,
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
       round((p1totToHere-p1deduct)/p5totToHere*100,1) p1pct,
       round((p2totToHere-p2deduct-p1totToHere+p1deduct)/p5totToHere*100,1) p2pct,
       round((p3totToHere-p3deduct-p2totToHere+p2deduct)/p5totToHere*100,1) p3pct,
       round((p4totToHere-p4deduct-p3totToHere+p3deduct)/p5totToHere*100,1) p4pct,
       round((p5totToHere-p4totToHere+p4deduct)/p5totToHere*100,1) p5pct,
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
         SELECT |scoreField| score, gradeLevel, year, count(*) cnt FROM |scoreTable| i
          where |scoreField|>0 and |scoreField| is not null and  test='|test|'  and (9=9)
          group by |scoreField|,year,gradeLevel) a
         left join (
         SELECT |scoreField| score, gradeLevel, year, count(*) cnt FROM |scoreTable| i2
          where |scoreField|>0 and |scoreField| is not null  and  test='|test|' and (9=9)
           group by |scoreField|,year,gradeLevel) b
         on (a.score>=b.score and a.year=b.year and a.gradeLevel=b.gradeLevel)
        ) c
        group by score, thisCnt, gradeLevel, year) d
       left join isbe_tests s on (s.year=d.year and s.gradeLevel=d.gradeLevel and s.label='|label|')
       left join (select year, gradeLevel, label, below, meet, exceed from isbe_tests) s13 on (if(d.year between 2006 and 2012,s13.year=2113,s13.year=d.year+100) and s13.gradeLevel=d.gradeLevel and s13.label='|label|')
    group by d.year, d.gradeLevel
    ) g
  `;

  // replace |test|, |label|, |scoreField|, |scoreTable|
  var queries = "";
  var sep = "";

  // label, tname, fname
  var tests = [
    {test: 'ISAT', label: 'ISAT Mathematics', tname: 'isbedetails', fname: 'mIsat'},
    {test: 'ISAT', label: 'ISAT Reading', tname: 'isbedetails', fname: 'rIsat'},
    {test: 'ISAT', label: 'ISAT Science', tname: 'isbedetails', fname: 'sciIsat'},
    {test: 'PSAE', label: 'PSAE Mathematics', tname: 'isbedetails', fname: 'mIsat'},
    {test: 'PSAE', label: 'PSAE Reading', tname: 'isbedetails', fname: 'rIsat'},
    {test: 'PSAE', label: 'PSAE Science', tname: 'isbedetails', fname: 'sciIsat'}
  ]
  tests.forEach(function(rw) {
    var qt = query_for_isat_and_psae;
    var label = rw['label'];
    var test = rw['test']
    var scoreField = rw['fname'];
    console.log(JSON.stringify(rw))
    var scoreTable = rw['tname'];
    console.log("Score Table: "+scoreTable)
    qt = qt.replace(/\|test\|/g, test)
           .replace(/\|label\|/g, label)
           .replace(/\|scoreField\|/g, scoreField)
           .replace(/\|scoreTable\|/g, scoreTable);
    queries += sep + qt;
    sep = " union ";
  })

  query_for_parcc = `
    select g.*,'8=8' q, 'PARCC' test,
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
          where pscore>0 and pscore is not null and (9=9)
          group by pscore,year,ptest) a
         left join (
         /* b) preceding scores to count */
         SELECT pscore score, ptest, year, count(*) cnt FROM parccdetails i2
          where pscore>0 and pscore is not null and (9=9)
           group by pscore,year,ptest) b
         on (a.score>=b.score and a.year=b.year and a.ptest=b.ptest)
        ) c
        group by score, thisCnt, ptest, year) d
       inner join isbe_tests s on (s.year=d.year and s.label=concat('PARCC ',d.ptest))
      group by d.year, s.gradeLevel, d.ptest
    ) g
  `;

  queries += " union " + query_for_parcc;

  var q = `
  insert into schwideComposites
  (subj, rcdts, shortlabel, cdts, year, maxMaxScore, minMinScore, wAvgScore, totalCount, wAvgPercentileEquivalent,wAvgoldPctEquiv,wAvgZScore, stanine, PME, s1pct, s2pct, s3pct, s4pct, s5pct, s6pct, s7pct, s8pct, s9pct, q1pct, q2pct, q3pct, q4pct, p1pct, p2pct, p3pct, p4pct, p5pct, totalWarning, totalBelow, totalMeet, totalExceed, s1cnt, s2cnt, s3cnt, s4cnt, s5cnt, s6cnt, s7cnt, s8cnt, s9cnt, q1cnt, q2cnt, q3cnt, q4cnt, p1cnt, p2cnt, p3cnt, p4cnt, p5cnt)
  SELECT  'Composite', t.rcdts, t.shortlabel, h1.cdts, h1.year, max(maxscore) maxMaxScore, min(minscore) minMinScore,
  round(sum(avgScore*h1.totalCount)/sum(h1.totalCount),1) wAvgScore,sum(h1.totalCount) totalCount,
  round(sum(percentileequivalent*h1.totalCount)/sum(h1.totalCount),1) wAvgPercentileEquivalent,
  round(sum(oldPctEquiv*h1.totalCount)/sum(h1.totalCount),1) wAvgoldPctEquiv,
  round(sum(zscore*h1.totalCount)/sum(h1.totalCount),3) wAvgZScore,
  round(sum(stanineEquivalent*h1.totalCount)/sum(h1.totalCount),2) stanine,
  round((sum(h1.totalMeet)+sum(h1.totalExceed))/sum(h1.totalCount)*100,1) PME,
  round(sum(h1.s1cnt)/sum(h1.totalCount)*100,1) s1pct, round(sum(h1.s2cnt)/sum(h1.totalCount)*100,1) s2pct, round(sum(h1.s3cnt)/sum(h1.totalCount)*100,1) s3pct, round(sum(h1.s4cnt)/sum(h1.totalCount)*100,1) s4pct, round(sum(h1.s5cnt)/sum(h1.totalCount)*100,1) s5pct, round(sum(h1.s6cnt)/sum(h1.totalCount)*100,1) s6pct, round(sum(h1.s7cnt)/sum(h1.totalCount)*100,1) s7pct, round(sum(h1.s8cnt)/sum(h1.totalCount)*100,1) s8pct, round(sum(h1.s9cnt)/sum(h1.totalCount)*100,1) s9pct,
  round(sum(h1.q1cnt)/sum(h1.totalCount)*100,1) q1pct, round(sum(h1.q2cnt)/sum(h1.totalCount)*100,1) q2pct, round(sum(h1.q3cnt)/sum(h1.totalCount)*100,1) q3pct, round(sum(h1.q4cnt)/sum(h1.totalCount)*100,1) q4pct,
  round(sum(h1.p1cnt)/sum(h1.totalCount)*100,1) p1pct, round(sum(h1.p2cnt)/sum(h1.totalCount)*100,1) p2pct, round(sum(h1.p3cnt)/sum(h1.totalCount)*100,1) p3pct, round(sum(h1.p4cnt)/sum(h1.totalCount)*100,1) p4pct, round(sum(h1.p5cnt)/sum(h1.totalCount)*100,1) p5pct,
  sum(h1.totalWarning) totalWarning, sum(h1.totalBelow) totalBelow, sum(h1.totalMeet) totalMeet, sum(h1.totalExceed) totalExceed,
  sum(h1.s1cnt) s1cnt, sum(h1.s2cnt) s2cnt, sum(h1.s3cnt) s3cnt, sum(h1.s4cnt) s4cnt, sum(h1.s5cnt) s5cnt, sum(h1.s6cnt) s6cnt, sum(h1.s7cnt) s7cnt, sum(h1.s8cnt) s8cnt, sum(h1.s9cnt) s9cnt,
  sum(h1.q1cnt) q1cnt, sum(h1.q2cnt) q2cnt, sum(h1.q3cnt) q3cnt, sum(h1.q4cnt) q4cnt,
  sum(h1.p1cnt) p1cnt, sum(h1.p2cnt) p2cnt, sum(h1.p3cnt) p3cnt, sum(h1.p4cnt) p4cnt, sum(h1.p5cnt) p5cnt
  from (
    select h.*, q3pct+q4pct paaavg,
        round(totalWarning/totalCount*100,1) awPct, round(totalBelow/totalCount*100,1) blPct,
            round(totalMeet/totalCount*100,1) mtPct, round(totalExceed/totalCount*100,1) exPct, '|cdts|' cdts,
                if(zp1.z is not null and zp2.z is not null,round((zscore-zp1.z)/(zp2.z-zp1.z)*(zp2.p-zp1.p)+zp1.p,1),0) percentileEquivalent,
        if(totalWarning13>0,round(totalWarning13/totalCount*100,1),null) awPct13, if(totalWarning13>0,round(totalBelow13/totalCount*100,1),null) blPct13,
            if(totalWarning13>0,round(totalMeet13/totalCount*100,1),null) mtPct13, if(totalWarning13>0,round(totalExceed13/totalCount*100,1),null) exPct13,
                round(5.5+zscore*2,2) stanineEquivalent
     from (
      ${queries}
    ) h
    left join ztopconversion zp1 on (zp1.z>=h.zscore and zp1.z<h.zscore+0.006)
    left join ztopconversion zp2 on zp2.z=zp1.z+0.006
    where h.totalCount > 0 and h.subject != 'Science'
    order by label, gradeLevel desc, year desc
    )h1
  left join tblsitemaster t on h1.cdts=t.cdts
  left join schwideComposites swc on (h1.cdts=swc.cdts and h1.year=swc.year and subj='Composite')
  where swc.cdts is null and swc.year is null
  group by t.shortlabel, t.rcdts, h1.cdts,  h1.year

  union

    SELECT  h1.subject, t.rcdts, t.shortlabel, h1.cdts, h1.year, max(maxscore) maxMaxScore, min(minscore) minMinScore,
  round(sum(avgScore*h1.totalCount)/sum(h1.totalCount),1) wAvgScore,sum(h1.totalCount) totalCount,
  round(sum(percentileequivalent*h1.totalCount)/sum(h1.totalCount),1) wAvgPercentileEquivalent,
  round(sum(oldPctEquiv*h1.totalCount)/sum(h1.totalCount),1) wAvgoldPctEquiv,
  round(sum(zscore*h1.totalCount)/sum(h1.totalCount),3) wAvgZScore,
  round(sum(stanineEquivalent*h1.totalCount)/sum(h1.totalCount),2) stanine,
  round((sum(h1.totalMeet)+sum(h1.totalExceed))/sum(h1.totalCount)*100,1) PME,
  round(sum(h1.s1cnt)/sum(h1.totalCount)*100,1) s1pct, round(sum(h1.s2cnt)/sum(h1.totalCount)*100,1) s2pct, round(sum(h1.s3cnt)/sum(h1.totalCount)*100,1) s3pct, round(sum(h1.s4cnt)/sum(h1.totalCount)*100,1) s4pct, round(sum(h1.s5cnt)/sum(h1.totalCount)*100,1) s5pct, round(sum(h1.s6cnt)/sum(h1.totalCount)*100,1) s6pct, round(sum(h1.s7cnt)/sum(h1.totalCount)*100,1) s7pct, round(sum(h1.s8cnt)/sum(h1.totalCount)*100,1) s8pct, round(sum(h1.s9cnt)/sum(h1.totalCount)*100,1) s9pct,
  round(sum(h1.q1cnt)/sum(h1.totalCount)*100,1) q1pct, round(sum(h1.q2cnt)/sum(h1.totalCount)*100,1) q2pct, round(sum(h1.q3cnt)/sum(h1.totalCount)*100,1) q3pct, round(sum(h1.q4cnt)/sum(h1.totalCount)*100,1) q4pct,
  round(sum(h1.p1cnt)/sum(h1.totalCount)*100,1) p1pct, round(sum(h1.p2cnt)/sum(h1.totalCount)*100,1) p2pct, round(sum(h1.p3cnt)/sum(h1.totalCount)*100,1) p3pct, round(sum(h1.p4cnt)/sum(h1.totalCount)*100,1) p4pct, round(sum(h1.p5cnt)/sum(h1.totalCount)*100,1) p5pct,
  sum(h1.totalWarning) totalWarning, sum(h1.totalBelow) totalBelow, sum(h1.totalMeet) totalMeet, sum(h1.totalExceed) totalExceed,
  sum(h1.s1cnt) s1cnt, sum(h1.s2cnt) s2cnt, sum(h1.s3cnt) s3cnt, sum(h1.s4cnt) s4cnt, sum(h1.s5cnt) s5cnt, sum(h1.s6cnt) s6cnt, sum(h1.s7cnt) s7cnt, sum(h1.s8cnt) s8cnt, sum(h1.s9cnt) s9cnt,
  sum(h1.q1cnt) q1cnt, sum(h1.q2cnt) q2cnt, sum(h1.q3cnt) q3cnt, sum(h1.q4cnt) q4cnt,
  sum(h1.p1cnt) p1cnt, sum(h1.p2cnt) p2cnt, sum(h1.p3cnt) p3cnt, sum(h1.p4cnt) p4cnt, sum(h1.p5cnt) p5cnt
  from (
    select h.*, q3pct+q4pct paaavg,
        round(totalWarning/totalCount*100,1) awPct, round(totalBelow/totalCount*100,1) blPct,
            round(totalMeet/totalCount*100,1) mtPct, round(totalExceed/totalCount*100,1) exPct, '|cdts|' cdts,
                if(zp1.z is not null and zp2.z is not null,round((zscore-zp1.z)/(zp2.z-zp1.z)*(zp2.p-zp1.p)+zp1.p,1),0) percentileEquivalent,
        if(totalWarning13>0,round(totalWarning13/totalCount*100,1),null) awPct13, if(totalWarning13>0,round(totalBelow13/totalCount*100,1),null) blPct13,
            if(totalWarning13>0,round(totalMeet13/totalCount*100,1),null) mtPct13, if(totalWarning13>0,round(totalExceed13/totalCount*100,1),null) exPct13,
                round(5.5+zscore*2,2) stanineEquivalent
     from (
      ${queries}
    ) h
    left join ztopconversion zp1 on (zp1.z>=h.zscore and zp1.z<h.zscore+0.006)
    left join ztopconversion zp2 on zp2.z=zp1.z+0.006
    where h.totalCount > 0
    order by label, gradeLevel desc, year desc
    )h1
  left join tblsitemaster t on h1.cdts=t.cdts
  left join schwideComposites swc on (h1.cdts=swc.cdts and h1.year=swc.year and subj=h1.subject)
  where swc.cdts is null and swc.year is null
  group by t.shortlabel, t.rcdts, h1.cdts,  h1.year, h1.subject

  `;

  return q;
}

var currTime = function() {
  var dt = new Date();
  return dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds()
}

// used to fix schwide composites...
var compositeCorrection = `
  insert into schwideComposites
  (subj, rcdts, shortlabel, cdts, year, maxMaxScore, minMinScore, wAvgScore, totalCount, wAvgPercentileEquivalent,
    wAvgoldPctEquiv,wAvgZScore, stanine, PME, s1pct, s2pct, s3pct, s4pct, s5pct, s6pct, s7pct, s8pct, s9pct,
    q1pct, q2pct, q3pct, q4pct, p1pct, p2pct, p3pct, p4pct, p5pct, totalWarning, totalBelow, totalMeet, totalExceed,
    s1cnt, s2cnt, s3cnt, s4cnt, s5cnt, s6cnt, s7cnt, s8cnt, s9cnt, q1cnt, q2cnt, q3cnt, q4cnt, p1cnt, p2cnt, p3cnt,
    p4cnt, p5cnt)
  SELECT  'Composite', rcdts, shortlabel, h1.cdts, h1.year, max(maxMaxScore) maxMaxScore, min(minMinScore) minMinScore,
  round(sum(wAvgScore*h1.totalCount)/sum(h1.totalCount),1) wAvgScore,sum(h1.totalCount) totalCount,
  round(sum(wAvgPercentileEquivalent*h1.totalCount)/sum(h1.totalCount),1) wAvgPercentileEquivalent,
  round(sum(wAvgoldPctEquiv*h1.totalCount)/sum(h1.totalCount),1) wAvgoldPctEquiv,
  round(sum(wAvgZScore*h1.totalCount)/sum(h1.totalCount),3) wAvgZScore,
  round(sum(stanine*h1.totalCount)/sum(h1.totalCount),2) stanine,
  round((sum(h1.totalMeet)+sum(h1.totalExceed))/sum(h1.totalCount)*100,1) PME,
  round(sum(h1.s1cnt)/sum(h1.totalCount)*100,1) s1pct, round(sum(h1.s2cnt)/sum(h1.totalCount)*100,1) s2pct, round(sum(h1.s3cnt)/sum(h1.totalCount)*100,1) s3pct, round(sum(h1.s4cnt)/sum(h1.totalCount)*100,1) s4pct, round(sum(h1.s5cnt)/sum(h1.totalCount)*100,1) s5pct, round(sum(h1.s6cnt)/sum(h1.totalCount)*100,1) s6pct, round(sum(h1.s7cnt)/sum(h1.totalCount)*100,1) s7pct, round(sum(h1.s8cnt)/sum(h1.totalCount)*100,1) s8pct, round(sum(h1.s9cnt)/sum(h1.totalCount)*100,1) s9pct,
  round(sum(h1.q1cnt)/sum(h1.totalCount)*100,1) q1pct, round(sum(h1.q2cnt)/sum(h1.totalCount)*100,1) q2pct, round(sum(h1.q3cnt)/sum(h1.totalCount)*100,1) q3pct, round(sum(h1.q4cnt)/sum(h1.totalCount)*100,1) q4pct,
  round(sum(h1.p1cnt)/sum(h1.totalCount)*100,1) p1pct, round(sum(h1.p2cnt)/sum(h1.totalCount)*100,1) p2pct, round(sum(h1.p3cnt)/sum(h1.totalCount)*100,1) p3pct, round(sum(h1.p4cnt)/sum(h1.totalCount)*100,1) p4pct, round(sum(h1.p5cnt)/sum(h1.totalCount)*100,1) p5pct,
  sum(h1.totalWarning) totalWarning, sum(h1.totalBelow) totalBelow, sum(h1.totalMeet) totalMeet, sum(h1.totalExceed) totalExceed,
  sum(h1.s1cnt) s1cnt, sum(h1.s2cnt) s2cnt, sum(h1.s3cnt) s3cnt, sum(h1.s4cnt) s4cnt, sum(h1.s5cnt) s5cnt, sum(h1.s6cnt) s6cnt, sum(h1.s7cnt) s7cnt, sum(h1.s8cnt) s8cnt, sum(h1.s9cnt) s9cnt,
  sum(h1.q1cnt) q1cnt, sum(h1.q2cnt) q2cnt, sum(h1.q3cnt) q3cnt, sum(h1.q4cnt) q4cnt,
  sum(h1.p1cnt) p1cnt, sum(h1.p2cnt) p2cnt, sum(h1.p3cnt) p3cnt, sum(h1.p4cnt) p4cnt, sum(h1.p5cnt) p5cnt
    from schwideComposites h1
    where totalCount > 0 and subj != 'Science'
    group by shortlabel, rcdts, cdts,  year
`

//future detailed table info
var colnames=`
  [{"sTitle":"Query","field":"q"},{"sTitle":"cdts","field":"cdts"},{"sTitle":"group","field":"label"},{"sTitle":"subject","field":"subject"},{"sTitle":"test","field":"test"}
    ,{"sTitle":"year","field":"year"},{"sTitle":"grade","field":"gradeLevel"},{"sTitle":"cohort","field":"cohort"},{"sTitle":"maxScore","field":"maxScore"},{"sTitle":"minScore","field":"minScore"}
    ,{"sTitle":"avgScore","field":"avgScore"},{"sTitle":"zscore","field":"zscore"},{"sTitle":"stanineAvgSS","field":"stanineEquivalent"}
    ,{"sTitle":"#Tst","field":"totalCount"},{"sTitle":"%AAAvg","field":"paaavg"},{"sTitle":"%ileAvgSS","field":"percentileEquivalent"}
    ,{"sTitle":"%BQ","field":"q1pct"},{"sTitle":"%2Q","field":"q2pct"},{"sTitle":"%3Q","field":"q3pct"},{"sTitle":"%TQ","field":"q4pct"}
    ,{"sTitle":"%stn1","field":"s1pct"},{"sTitle":"%stn2","field":"s2pct"},{"sTitle":"%stn3","field":"s3pct"},{"sTitle":"%stn4","field":"s4pct"},{"sTitle":"%stn5","field":"s5pct"},{"sTitle":"%stn6","field":"s6pct"},{"sTitle":"%stn7","field":"s7pct"},{"sTitle":"%stn8","field":"s8pct"},{"sTitle":"%stn9","field":"s9pct"}
    ,{"sTitle":"%PLv1","field":"p1pct"},{"sTitle":"%PLv2","field":"p2pct"},{"sTitle":"%PLv3","field":"p3pct"},{"sTitle":"%PLv4","field":"p4pct"},{"sTitle":"%PLv5","field":"p5pct"}
    ,{"sTitle":"%ME","field":"pme"},{"sTitle":"%ME13","field":"pme13"},{"sTitle":"%AW","field":"awPct"},{"sTitle":"%Blw","field":"blPct"},{"sTitle":"%Mt","field":"mtPct"},{"sTitle":"%Ex","field":"exPct"}
    ,{"sTitle":"%AW13","field":"awPct13"},{"sTitle":"%Blw13","field":"blPct13"},{"sTitle":"%Mt13","field":"mtPct13"},{"sTitle":"%Ex13","field":"exPct13"}
    ,{"sTitle":"#BQ","field":"q1cnt"},{"sTitle":"#2Q","field":"q2cnt"},{"sTitle":"#3Q","field":"q3cnt"},{"sTitle":"#TQ","field":"q4cnt"}
    ,{"sTitle":"s1cnt","field":"s1cnt"},{"sTitle":"s2cnt","field":"s2cnt"},{"sTitle":"s3cnt","field":"s3cnt"},{"sTitle":"s4cnt","field":"s4cnt"},{"sTitle":"s5cnt","field":"s5cnt"},{"sTitle":"s6cnt","field":"s6cnt"},{"sTitle":"s7cnt","field":"s7cnt"},{"sTitle":"s8cnt","field":"s8cnt"},{"sTitle":"s9cnt","field":"s9cnt"}
    ,{"sTitle":"p1cnt","field":"p1cnt"},{"sTitle":"p2cnt","field":"p2cnt"},{"sTitle":"p3cnt","field":"p3cnt"},{"sTitle":"p4cnt","field":"p4cnt"},{"sTitle":"p5cnt","field":"p5cnt"}
    ,{"sTitle":"#AW","field":"totalWarning"},{"sTitle":"#Blw","field":"totalBelow"},{"sTitle":"#Mt","field":"totalMeet"},{"sTitle":"#Ex","field":"totalExceed"}
    ,{"sTitle":"#AW13","field":"totalWarning13"},{"sTitle":"#Blw13","field":"totalBelow13"},{"sTitle":"#Mt13","field":"totalMeet13"},{"sTitle":"#Ex13","field":"totalExceed13"}
    ,{"sTitle":"q12Score","field":"q12"},{"sTitle":"q23Score","field":"q23"},{"sTitle":"q34Score","field":"q34"}
    ,{"sTitle":"s12Score","field":"s12"},{"sTitle":"s23Score","field":"s23"},{"sTitle":"s34Score","field":"s34"},{"sTitle":"s45Score","field":"s45"},{"sTitle":"s56Score","field":"s56"},{"sTitle":"s67Score","field":"s67"},{"sTitle":"s78Score","field":"s78"},{"sTitle":"s89Score","field":"s89"}
    ,{"sTitle":"p12Score","field":"p12"},{"sTitle":"p23Score","field":"p23"},{"sTitle":"p34Score","field":"p34"},{"sTitle":"p45Score","field":"p45"}
    ,{"sTitle":"belowScore","field":"belowScore"},{"sTitle":"meetScore","field":"meetScore"},{"sTitle":"exceedScore","field":"exceedScore"}
    ,{"sTitle":"belowScore13","field":"belowScore13"},{"sTitle":"meetScore13","field":"meetScore13"},{"sTitle":"exceedScore13","field":"exceedScore13"}
    ,{"sTitle":"q1deduct","field":"q1deduct"},{"sTitle":"q2deduct","field":"q2deduct"},{"sTitle":"q3deduct","field":"q3deduct"}
    ,{"sTitle":"s1deduct","field":"s1deduct"},{"sTitle":"s2deduct","field":"s2deduct"},{"sTitle":"s3deduct","field":"s3deduct"},{"sTitle":"s4deduct","field":"s4deduct"},{"sTitle":"s5deduct","field":"s5deduct"},{"sTitle":"s6deduct","field":"s6deduct"},{"sTitle":"s7deduct","field":"s7deduct"},{"sTitle":"s8deduct","field":"s8deduct"}
    ,{"sTitle":"p1deduct","field":"p1deduct"},{"sTitle":"p2deduct","field":"p2deduct"},{"sTitle":"p3deduct","field":"p3deduct"},{"sTitle":"p4deduct","field":"p4deduct"}
  ]
`;

//getQuery()
processComposites()
