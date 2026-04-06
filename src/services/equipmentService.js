const { v4: uuidv4 } = require('uuid');
const Equipment = require('../models/equipmentModel');
const storageService = require('./storageService');

// 设备信息服务
class EquipmentService {
  // 创建设备信息
  async createEquipment(name, type, model, serialNumber, location, status, manufacturer, purchaseDate, maintenanceDate) {
    try {
      const id = uuidv4();
      const equipment = new Equipment(
        id,
        name,
        type,
        model,
        serialNumber,
        location,
        status,
        manufacturer,
        purchaseDate,
        maintenanceDate
      );

      // 保存设备信息
      await storageService.saveData('equipment', equipment);

      return equipment;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  }

  // 获取所有设备信息
  async getAllEquipment() {
    try {
      return await storageService.getAllData('equipment');
    } catch (error) {
      console.error('Error getting all equipment:', error);
      return [];
    }
  }

  // 根据ID获取设备信息
  async getEquipmentById(id) {
    try {
      return await storageService.getDataById('equipment', id);
    } catch (error) {
      console.error('Error getting equipment by id:', error);
      return null;
    }
  }

  // 更新设备信息
  async updateEquipment(id, updates) {
    try {
      const existingEquipment = await storageService.getDataById('equipment', id);
      if (!existingEquipment) {
        throw new Error('Equipment not found');
      }

      const updatedEquipment = new Equipment(
        id,
        updates.name || existingEquipment.name,
        updates.type || existingEquipment.type,
        updates.model || existingEquipment.model,
        updates.serialNumber || existingEquipment.serialNumber,
        updates.location || existingEquipment.location,
        updates.status || existingEquipment.status,
        updates.manufacturer || existingEquipment.manufacturer,
        updates.purchaseDate || existingEquipment.purchaseDate,
        updates.maintenanceDate || existingEquipment.maintenanceDate,
        existingEquipment.createdAt
      );

      // 保存更新后的设备信息
      await storageService.saveData('equipment', updatedEquipment);

      return updatedEquipment;
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  }

  // 删除设备信息
  async deleteEquipment(id) {
    try {
      return await storageService.deleteData('equipment', id);
    } catch (error) {
      console.error('Error deleting equipment:', error);
      return false;
    }
  }

  // 根据类型获取设备信息
  async getEquipmentByType(type) {
    try {
      const allEquipment = await storageService.getAllData('equipment');
      return allEquipment.filter(equipment => equipment.type === type);
    } catch (error) {
      console.error('Error getting equipment by type:', error);
      return [];
    }
  }

  // 根据状态获取设备信息
  async getEquipmentByStatus(status) {
    try {
      const allEquipment = await storageService.getAllData('equipment');
      return allEquipment.filter(equipment => equipment.status === status);
    } catch (error) {
      console.error('Error getting equipment by status:', error);
      return [];
    }
  }
}

module.exports = new EquipmentService();