// In Building.js (or as a metric definition)
function averageVoltage() {
  var avgVoltage, output

    var spec = {  
        ids: [this.id],
        expressions: ['AverageVoltage'],
        start: DateTime.now().minusMonths(2),
        end:DateTime.now(),
        interval: 'HOUR',
    }

    output = Building.evalMetrics(spec);

    JSData.make({
        id: 'output',
        data: output
    }).merge();

    avgVoltage = output.result.get(this.id).get('AverageVoltage').expandedData()[0];

    return avgVoltage
}


// In Building.js (or as a metric definition)
function averageTemperature() {

  var avgTemperature, output

    var spec = {  
        ids: [this.id],
        expressions: ['AverageTemperature'],
        start: DateTime.now().minusMonths(1),
        end:DateTime.now(),
        interval: 'HOUR',
    }

    output = Building.evalMetrics(spec);

    // JSData.make({
    //     id: 'output',
    //     data: output
    // }).merge();

    avgTemperature = output.result.get(this.id).get('AverageTemperature').expandedData()[0];

    return avgTemperature
}


function averageLumens() {

  var avgLumens, output

    var spec = {  
        ids: [this.id],
        expressions: ['AverageLumens'],
        start: DateTime.now().minusMonths(1),
        end:DateTime.now(),
        interval: 'HOUR',
    }

    output = Building.evalMetrics(spec);

    JSData.make({
        id: 'output',
        data: output
    }).merge();

    avgLumens = output.result.get(this.id).get('AverageLumens').expandedData()[0];

    return avgLumens
}


// function calculateEfficiency() {
//   // Calculate building efficiency (avg(lumens) / avg(power))
//   const metrics = SmartBulb.rollupMetrics({
//     filter: Filter.eq('building', this.id),
//     expressions: ['AverageLumens', 'AveragePower'],
//     start: DateTime.now().minusMonths(1),
//     end: DateTime.now(),
//     interval: 'DAY'
//   });

//   return metrics.get('AverageLumens').avg() / metrics.get('AveragePower').avg();
// }


function averagePower() {
    var buildingId = this.id;

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



function averageEfficiency() {
    var buildingId = this.id;

    var metricName = 'AverageEfficiency';
    
    
    // Evaluate the metric to get the average wattage
    var result = Building.evalMetrics({
        ids: [buildingId],
        expressions: ['AverageEfficiency'],
        start: '2025-04-01T00:00:00',
        end: '2025-05-25T00:00:00',
        interval: 'DAY'
    });


    var averageEfficiency = result.result.get(buildingId).get(metricName)._data;

    if (!averageEfficiency || averageEfficiency.length === 0 || _.every(averageEfficiency, isNaN)) {
        return 0;
    }

    var avgEff = _.mean(averageEfficiency);
    
    return avgEff;
}



function averagePowerForCity(city) {
    // Fetch all buildings in the specified city
    var buildings = Building.fetch({
        filter: Filter.eq('city', city),
        include: 'id'
    }).objs;

    JSData.make({
        id: 'buildings',
        data:  Object.keys(buildings)
    }).upsert();

    if (buildings.isEmpty()) {
        throw new Error(`No buildings found for city: ${city}`);
    }

    // Extract the IDs of the buildings in the city
    var buildingIds = buildings.pluck('id');

    JSData.make({
        id: 'buildingIds',
        data:  Object.keys(buildingIds)
    }).upsert();

    // Define the metric name
    var metricName = 'AveragePower';

    // Evaluate the metric for all buildings in the city
    var result = Building.evalMetrics({
        ids: buildingIds,
        expressions: [metricName],
        start: '2024-01-01T00:00:00',
        end: '2024-02-01T00:00:00',
        interval: 'DAY'
    });

    JSData.make({
        id: 'result',
        data:  Object.keys(result)
    }).upsert();

//     // Collect all the average wattage data into a single array
//     var allAvgWattage = [];
//     buildingIds.each(function (id) {
//         var avgWattage = result.result.get(id).get(metricName)._data;
//         allAvgWattage = allAvgWattage.concat(avgWattage);
//     });

//     // Calculate the mean of the collected data
//     var avgPower = _.mean(allAvgWattage);

//     return avgPower;
}



function fetchBuildingsWithAverages(spec) {
    // Fetch all buildings based on the provided spec
    var buildings = Building.fetch({
        include: 'id, name',
        limit: -1,
        filter: spec.filter,
        order: spec.order,
    }).objs;

    JSData.make({
        id: 'buildings',
        data:  buildings
    }).upsert();

    // Initialize an array to hold the result objects
    var result = [];

    // Iterate over each building to compute the averages using metrics
    buildings.each(function (building) {
        // Call the member functions to get the average values
        var avgEfficiency = building.averageEfficiency();
        var avgVoltage = building.averagePower();

        // Create a result object with the computed averages
        result.push({
            id: building.id,
            name: building.name,
            avgEfficiency: avgEfficiency,
            avgVoltage: avgVoltage,
        });
    });

    JSData.make({
        id: 'result',
        data:  result
    }).upsert();

    // Return the result as a FetchResult object
    return {
        objs: result,
        count: result.length,
        hasMore: false,
    };
}