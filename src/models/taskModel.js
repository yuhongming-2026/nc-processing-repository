// 生产任务数据模型
class Task {
  constructor(id, name, description, ncProgramId, equipmentId, quantity, priority, status, startDate, endDate, assignee, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.ncProgramId = ncProgramId;
    this.equipmentId = equipmentId;
    this.quantity = quantity;
    this.priority = priority;
    this.status = status;
    this.startDate = startDate;
    this.endDate = endDate;
    this.assignee = assignee;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }
}

module.exports = Task;