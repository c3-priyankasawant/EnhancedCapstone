function monthlyBill(month, year) {
  var durationOn = this.evalMetric({
    expression: 'DurationOnInHours',
    start: DateTime.fromYearMonthDay(year, month, 1),
    end: DateTime.fromYearMonthDay(year, month + 1, 1),
    interval: 'HOUR'
  });

  var energyConsumption = this.wattage * (durationOn / 1000) * this.efficiencyFactor;
  var electricityRate = CityRateConfig.getConfig().rateByCity.get(this.location);
  return energyConsumption * electricityRate;
}