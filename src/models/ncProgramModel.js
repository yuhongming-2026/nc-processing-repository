// 数控程序数据模型
class NCProgram {
  constructor(id, name, description, content, equipmentId, version, creator, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.content = content;
    this.equipmentId = equipmentId;
    this.version = version;
    this.creator = creator;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }
}

module.exports = NCProgram;