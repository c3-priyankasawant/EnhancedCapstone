function monthlyBill(month, year) {
    var id = this.id;
    // JSData.make({
    //     id: this.id,
    //     data: this
    // }).upsert()
    JSData.make({
        id: 'this',
        data: this
    }).upsert()
    let fixture = this.currentFixture
    JSData.make({
        id: 'fixture',
        data: fixture
    }).upsert()
    var city = fixture.apartment.building.city
    var efficiencyFactor = this.efficiencyFactor !== undefined ? this.efficiencyFactor : LEDBulb.meta().fieldType('efficiencyFactor').declaredDefault;
    // JSData.make({id:this.id,data: this.currentFixture.}).merge()
    
    // Calculate duration on using compound metric
    var durationOn = SmartBulb.evalMetric({
        id: id,
        expression: "DurationOnInHours",
        start: DateTime.fromString(year + "-" + month + "-01"),
        end: DateTime.fromString(year + "-" + (month + 1) + "-01"),
        interval: "MONTH"
    });

    // HOW this works? 
    let o = CityRateConfig.make();
    var electricityRate = o.getConfig().rateByCity.get(city)   
    // var electricityRate =  0.15;
    

    // Calculate energy consumption and bill
    var wattage = this.wattage;

    var energyConsumption = (wattage * durationOn.data()[0] * efficiencyFactor) / 1000;

    return energyConsumption * electricityRate;
}