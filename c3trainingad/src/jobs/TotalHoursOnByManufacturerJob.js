/**
 * Process a batch of {@link SmartBulb}s and return the total hours the smart 
 * bulbs were on grouped by manufacturer.
 */
function map(batch, objs, job) {
    var intermediaryGroup = {};
    var manufacturers = objs.pluck("manufacturer").unique();
    var bulbs = objs.pluck("id");

    manufacturers.each(function (manufacturer) {
        var metricResults = SmartBulb.rollupMetrics({
            filter: Filter.eq('manufacturer', manufacturer).and().intersects('id', bulbs), 
            start: job.startDate, 
            end: job.endDate, 
            interval: job.interval, 
            rollupFunc: "SUM", 
            expressions: ["DurationOnInHours"]
        });
    
        var data = metricResults.get("DurationOnInHours").data().last();
        intermediaryGroup[manufacturer] = data;
    });

    return intermediaryGroup;
}

/**
 * Persists the total hours on of a {@link SmartBulb} for a manufacturer for a given time range
 */
function reduce(outKey, interValues, job) {
    var mfg = outKey;
    var total = interValues.sum();

    var totalHours = TotalHoursOnByManufacturer.make({
        manufacturer: mfg,
        start: job.startDate,
        end: job.endDate,
        totalHours: total
    });

    totalHours.create();

    return total;
}