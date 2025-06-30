function startJob(options) {

    var job = SmartBulbIncrementalDataBatchJob.make({
        id: 'SmartBulbIncrementalDataBatchJob'
    }).upsert();

    // Start the batch job with provided options
    job.start(options);

    return job;
}


function doStart(job, options) {
    // var logger = Logger.for("SmartBulbIncrementalDataBatchJob");
    // JSData.make({ name: 'in do start:' }).upsert();

    var partFiles = FileSystem.gcs().listFiles("gcs://c3--gkev8c3apps/sawpriad2/c3trainingad/dl/IncrementalData/")
    // gcs://c3--gkev8c3apps/siecasaddoubleeverything/c3trainingad/dl
    var csvFiles = partFiles.files.filter(file => file.url.endsWith('.csv'));
    // logger.info("csvFiles files: " + csvFiles);

    // JSData.make({ name: 'files', files: csvFiles }).upsert();
    // CustomJSData.make({
    //     name: 'files',
    //     files: csvFiles
    // }).upsert();

    job.scheduleBatch({ files: csvFiles });
    // job.scheduleBatches({ files: csvFiles });

}


function extractPartNumber(str) {
  const match = str.match(/Part\d+/);
  return match ? match[0] : null;
}


function processBatch(batch, job) {
    //   var logger = Logger.for("SmartBulbIncrementalDataBatchJob");
    // JSData.make({ name: 'in processBatch:' }).upsert();
    
    batch.files.each(file => {
        const part = extractPartNumber(file.url)
        // CustomJSData.make({
        //     name: 'processBatch',
        //     files: [file]
        // }).upsert();

        // console.log(file)
        // Read CSV into dataframe
        var content = file.readString();
        var dataframe = content.split('\n').map(row => row.split(','));

        var { cleanedData, issues } = filterDataAndReportIssues(dataframe);

        createSourceFileForSmartBulbMeasurementSeries(cleanedData, part);

        // For SmartBulbMeasurement
        createSourceFileForSmartBulbMeasurement(cleanedData, part);
    });
}

function allComplete(job) {
    // Trigger DI on processed files
    //   C3.SourceFile.syncAll();

    var inbox_url = FileSourceCollection.forName('SmartBulbMeasurementSource').inboxUrl()
    //sync all the source files
    SourceFile.syncAll(inbox_url, {process: true})

    // var inbox_url_2 = FileSourceCollection.forName('SmartBulbMeasurementSeriesSource').inboxUrl()
    // SourceFile.syncAll(inbox_url_2, {process: true})
    // SourceFile.syncAll(inbox_url, {process: false})

    // //Process all the source files
    // var sfs = SourceFile.fetch({ filter: Filter.eq('sourceCollectionName', 'SmartBulbMeasurementSource') }).objs
    // var sfs = SourceFile.fetch().objs
    // SourceFile.processBatch(sfs);

    var inbox_url2 = FileSourceCollection.forName('SmartBulbMeasurementSeriesSource').inboxUrl()

    //sync all the source files
    SourceFile.syncAll(inbox_url2, {process: true})

    // //Process all the source files
    // var sfs2 = SourceFile.fetch({ filter: Filter.eq('sourceCollectionName', 'SmartBulbMeasurementSeriesSource') }).objs
    // SourceFile.processBatch(sfs2);
}

function filterDataAndReportIssues(data) {
    // 1. Filter data based on timestamp (> 2024-01-14 23:59:59)
    const cutoff = new Date('2024-01-14T23:59:59').getTime(); // UTC time

    // 2. Identify quality issues
    const issues = {
        missingValues: [],
        invalidTimestamps: [],
        emptyRows: []
    };
    
    const header = data[0];
    const rows = data.slice(1);

    const cleanedData = rows.filter((row, i) => {
        const [sn, timestamp, end, status, watts, lumens, temp, voltage] = row

        if (new Date(timestamp?.split(' ').join('T')).getTime() === NaN) {
            return false
        }

        // Keep this row if no issues found
        return true;
    });

    // JSData.make({
    //     data: cleanedData
    // }).create()
    // Filter the data
    const filteredData = cleanedData.filter(row => {
        const timestampString = row[1]?.split(' ').join('T');

        const rowDate = new Date(timestampString).getTime();
        return rowDate > cutoff;
    });

    // Return cleaned data and issues
    const result = {
        cleanedData: [header].concat(filteredData),
        issues: issues
    };

    return result
}


function createSourceFileForSmartBulbMeasurementSeries(cleanedData, part) {
    // Skip header row and extract smart bulb IDs
    const smartBulbs = new Set();

    cleanedData.slice(1).forEach((row, i) => {

        // }
        if (row[0]) {  // Only add if smartBulb is defined
            smartBulbs.add(row[0]);
        }
    });

    // Convert Set to array of objects
    const result = Array.from(smartBulbs).map(sn => `${sn},SBMS_serialNo_${sn}`);
    const addHeader = ['smartBulb,smartid'].concat(result)

    // JSData.make({
    //     data: { id: 'result', data: {
    //         result,
    //         isArray: Array.isArray(addHeader)
    //     } }
    // }).create() 


    // Convert DataFrame to CSV
    const csvContent = addHeader.join('\n');
    
    // Get FileSourceCollection inbox URL
    var inboxUrl = FileSourceCollection.forName('SmartBulbMeasurementSeriesSource').inboxUrl();
    const fileName = `${part}_` + 'SmartBulbMeasurementSeries_' + DateTime.now().toString() + '.csv';

    const fileUrl = inboxUrl + fileName;

    const file = C3.File.make({ url: fileUrl })
    file.writeString(csvContent);
}


function createSourceFileForSmartBulbMeasurement(cleanedData, part) {
    // Convert DataFrame to CSV
    const csvContent = cleanedData.join('\n');

    // Get FileSourceCollection inbox URL
    var inboxUrl = FileSourceCollection.forName('SmartBulbMeasurementSource').inboxUrl();
 
    const fileName =`${part}_` + 'SmartBulbMeasurement_' + DateTime.now().toString() + '.csv';

    const fileUrl = inboxUrl + fileName;

    const file = C3.File.make({ url: fileUrl })
    file.writeString(csvContent);
}

function testFunc() {
    return 5
}