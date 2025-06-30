// AveragePowerCustomFunction.js
function averagePowerForBuilding(id) {

    var buildingId = id;

    var metricName = 'AveragePower';

    
    
    // Evaluate the metric to get the average wattage
    var result = Building.evalMetrics({
        ids: [buildingId],
        expressions: ['AveragePower'],
        start: DateTime.now().minusMonths(1),
        end: DateTime.now(),
        interval: 'DAY'
    });


    var avgWattage = result.result.get(buildingId).get(metricName)._data;

    if (!avgWattage || avgWattage.length === 0 || _.every(avgWattage, isNaN)) {
        return 0;
    }

    var avgPower = _.mean(avgWattage);
    
    return avgPower;
}



function averageEfficiencyForBuilding(id) {
    var buildingId = id;

    var metricName = 'AverageEfficiency';
    
    
    // Evaluate the metric to get the average wattage
    var result = Building.evalMetrics({
        ids: [buildingId],
        expressions: ['AverageEfficiency'],
        start: DateTime.now().minusMonths(1),
        end: DateTime.now(),
        interval: 'DAY'
    });


    var averageEfficiency = result.result.get(buildingId).get(metricName)._data;

    if (!averageEfficiency || averageEfficiency.length === 0 || _.every(averageEfficiency, isNaN)) {
        return 0;
    }

    var avgEff = _.mean(averageEfficiency);
    
    return avgEff;
}