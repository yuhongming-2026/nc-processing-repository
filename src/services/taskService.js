const { v4: uuidv4 } = require('uuid');
const Task = require('../models/taskModel');
const storageService = require('./storageService');

// 生产任务服务
class TaskService {
  // 创建生产任务
  async createTask(name, description, ncProgramId, equipmentId, quantity, priority, status, startDate, endDate, assignee) {
    try {
      const id = uuidv4();
      const task = new Task(
        id,
        name,
        description,
        ncProgramId,
        equipmentId,
        quantity,
        priority,
        status,
        startDate,
        endDate,
        assignee
      );

      // 保存任务信息
      await storageService.saveData('tasks', task);

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // 获取所有生产任务
  async getAllTasks() {
    try {
      return await storageService.getAllData('tasks');
    } catch (error) {
      console.error('Error getting all tasks:', error);
      return [];
    }
  }

  // 根据ID获取生产任务
  async getTaskById(id) {
    try {
      return await storageService.getDataById('tasks', id);
    } catch (error) {
      console.error('Error getting task by id:', error);
      return null;
    }
  }

  // 更新生产任务
  async updateTask(id, updates) {
    try {
      const existingTask = await storageService.getDataById('tasks', id);
      if (!existingTask) {
        throw new Error('Task not found');
      }

      const updatedTask = new Task(
        id,
        updates.name || existingTask.name,
        updates.description || existingTask.description,
        updates.ncProgramId || existingTask.ncProgramId,
        updates.equipmentId || existingTask.equipmentId,
        updates.quantity || existingTask.quantity,
        updates.priority || existingTask.priority,
        updates.status || existingTask.status,
        updates.startDate || existingTask.startDate,
        updates.endDate || existingTask.endDate,
        updates.assignee || existingTask.assignee,
        existingTask.createdAt
      );

      // 保存更新后的任务信息
      await storageService.saveData('tasks', updatedTask);

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // 删除生产任务
  async deleteTask(id) {
    try {
      return await storageService.deleteData('tasks', id);
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // 根据设备ID获取生产任务
  async getTasksByEquipmentId(equipmentId) {
    try {
      const allTasks = await storageService.getAllData('tasks');
      return allTasks.filter(task => task.equipmentId === equipmentId);
    } catch (error) {
      console.error('Error getting tasks by equipment id:', error);
      return [];
    }
  }

  // 根据状态获取生产任务
  async getTasksByStatus(status) {
    try {
      const allTasks = await storageService.getAllData('tasks');
      return allTasks.filter(task => task.status === status);
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      return [];
    }
  }

  // 根据优先级获取生产任务
  async getTasksByPriority(priority) {
    try {
      const allTasks = await storageService.getAllData('tasks');
      return allTasks.filter(task => task.priority === priority);
    } catch (error) {
      console.error('Error getting tasks by priority:', error);
      return [];
    }
  }

  // 根据负责人获取生产任务
  async getTasksByAssignee(assignee) {
    try {
      const allTasks = await storageService.getAllData('tasks');
      return allTasks.filter(task => task.assignee === assignee);
    } catch (error) {
      console.error('Error getting tasks by assignee:', error);
      return [];
    }
  }
}

module.exports = new TaskService();