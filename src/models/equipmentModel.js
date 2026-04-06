// 设备信息数据模型
class Equipment {
  constructor(id, name, type, model, serialNumber, location, status, manufacturer, purchaseDate, maintenanceDate, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.model = model;
    this.serialNumber = serialNumber;
    this.location = location;
    this.status = status;
    this.manufacturer = manufacturer;
    this.purchaseDate = purchaseDate;
    this.maintenanceDate = maintenanceDate;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }
}

module.exports = Equipment;