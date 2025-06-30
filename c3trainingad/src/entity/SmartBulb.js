function lifeSpanInYears() {
    var startTime, defectTime, lifespan;
    startTime = this.startDate;
 
    defectFilter = "status == 1 && lumens == 0 && parent.id == '" + 'SBMS_serialNo_' + this.id + "'";
    defectDatum = SmartBulbMeasurement.fetch({filter: defectFilter});
 
    defectTime = defectDatum.objs[0].start;
    lifespan = defectTime.millis - startTime.millis;
    lsYears = lifespan / (1000 * 60 * 60 * 24 * 365);
    return lsYears;
}

function averageTemperatureMonth(endDate) {

    var avgTemp, output

    var spec = {  
        ids: [this.id],  
        expressions: ['AverageTemperature'],  
        start: endDate, 
        end: endDate,  
        interval: 'MONTH'
    }

    output = SmartBulb.evalMetrics(spec);

    JSData.make({
        id: 'output',
        data: output
    }).merge();

    avgTemp = output.result.get(this.id).get('AverageTemperature').expandedData()[0];

    return avgTemp

}


function averageLifeSpan(){

    var lightBulbs, sum, avg, span;
    lightBulbs = SmartBulb.fetch({include: ['id', 'startDate'], limit:-1}).objs;
    sum = 0;

    // Calculate total lifespan
    for (var i = 0; i < lightBulbs.length; i++) {
        sum += lightBulbs[i].lifeSpanInYears();
    }

    // Compute average lifespan
    avg = sum / lightBulbs.length;

    // Return average lifespan
    return avg;
}

function shortestLifeSpan() {
    var map = {};
    var lightBulbs, min, minId, span;
    lightBulbs = SmartBulb.fetch({include: ['id', 'startDate'], limit:-1}).objs;
    min = Number.MAX_VALUE;
    minId = null;  
    
    // Calculate total lifespan
    for (var i = 0; i < lightBulbs.length; i++) {
        span = lightBulbs[i].lifeSpanInYears();
        if (span < min) {
            min = span;
            minId = lightBulbs[i].id;
        }
    }

     // TBD implement method 
    map[minId] = min
    return map;
}