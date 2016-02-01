var async = require('async')

var data = [];
for (var i = 0; i < 100; i = i + 5) {
    data.push(i);
}
console.log('Our Inital Array<br/>');
console.log('====================<br/>');
for (var i = 0; i < 100; i = i + 5) {
    console.log(i + "<br/>");
}
console.log('====================' + '<br/>');
console.log('Lets start Parallel Processing' + '<br/>');
async.each(data, processData, function (err) {
    if (err) {
        console.log('OOPS! How is this possible?' + "<br/>");
    }
    console.log('Parallel Processing Done<br/>');
    console.log('====================' + '<br/>');
    console.log('Lets Start Same Operation In Series');
    async.eachSeries(data, processData, function (err) {
        if (err) {
            console.log('OOPS! How is this possible?' + "<br/>");
        }
        console.log('Series Processing Done<br/>');
        console.log('====================' + '<br/>');
        console.log('Lets Start Same Operation In Series But With 5 at time');
        async.eachLimit(data, 5, processData, function (err) {
            if (err) {
                console.log('OOPS! How is this possible?' + "<br/>");
            }
            console.log('Series Processing Done<br/>');
            console.log('====================' + '<br/>');
        });
    });
});

function processData(item, callback) {
    //we are just diving the number by 5
    //but we can actually do a very long process here
    setTimeout(function () {
        var date = new Date();
        console.log((item / 5) + ' Finished At ' + date.getHours() + ":" + +date.getMinutes() + ":" + +date.getSeconds() + '<br/>');
        callback(null); //no error
        //incase of error pass the error in callback function
    }, 1000);
}
