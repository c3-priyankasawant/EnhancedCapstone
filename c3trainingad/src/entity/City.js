// In Building.js (or as a metric definition)
function defectiveBulbCount() {

  var defectiveBulbs, output

    var spec = {  
        ids: [this.id],
        expressions: ['IsDefectiveCity'],
        start: DateTime.now().minusMonths(1),
        end:DateTime.now(),
        interval: 'HOUR',
    }

    output = City.rollupMetrics(spec);
    defectiveBulbs = output.result.get(this.id).get('IsDefectiveCity').expandedData()[0];

    return defectiveBulbs

}


// In Building.js (or as a metric definition)
function averageEfficiency() {

  var averageEfficiency, output

    var spec = {  
        ids: [this.id],
        expressions: ['AverageEfficiency'],
        start: DateTime.now().minusMonths(1),
        end:DateTime.now(),
        interval: 'HOUR',
        
    }

    SmartBulb.rollupMetrics({
  
});

    output = City.evalMetrics(spec);

    JSData.make({
        id: 'output',
        data: output
    }).merge();

    averageEfficiency = output.result.get(this.id).get('AverageEfficiency').expandedData()[0];

    return averageEfficiency
}


function averagePower() {

  var avgPower, output

    var spec = {  
        ids: [this.id],
        expressions: ['AveragePower'],
        start: DateTime.now().minusMonths(1),
        end:DateTime.now(),
        interval: 'HOUR',
    }

    output = City.evalMetrics(spec);

    JSData.make({
        id: 'output',
        data: output
    }).merge();

    avgPower = output.result.get(this.id).get('AveragePower').expandedData()[0];

    return avgPower
}