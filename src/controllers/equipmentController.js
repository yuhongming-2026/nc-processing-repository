const equipmentService = require('../services/equipmentService');

// 设备信息控制器
class EquipmentController {
  // 创建设备信息
  async createEquipment(req, res) {
    try {
      const { name, type, model, serialNumber, location, status, manufacturer, purchaseDate, maintenanceDate } = req.body;
      
      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }

      const equipment = await equipmentService.createEquipment(name, type, model, serialNumber, location, status, manufacturer, purchaseDate, maintenanceDate);
      res.status(201).json(equipment);
    } catch (error) {
      console.error('Error creating equipment:', error);
      res.status(500).json({ error: 'Failed to create equipment' });
    }
  }

  // 获取所有设备信息
  async getAllEquipment(req, res) {
    try {
      const equipment = await equipmentService.getAllEquipment();
      res.status(200).json(equipment);
    } catch (error) {
      console.error('Error getting equipment:', error);
      res.status(500).json({ error: 'Failed to get equipment' });
    }
  }

  // 根据ID获取设备信息
  async getEquipmentById(req, res) {
    try {
      const { id } = req.params;
      const equipment = await equipmentService.getEquipmentById(id);
      
      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      res.status(200).json(equipment);
    } catch (error) {
      console.error('Error getting equipment:', error);
      res.status(500).json({ error: 'Failed to get equipment' });
    }
  }

  // 更新设备信息
  async updateEquipment(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const equipment = await equipmentService.updateEquipment(id, updates);
      res.status(200).json(equipment);
    } catch (error) {
      console.error('Error updating equipment:', error);
      res.status(500).json({ error: 'Failed to update equipment' });
    }
  }

  // 删除设备信息
  async deleteEquipment(req, res) {
    try {
      const { id } = req.params;
      const success = await equipmentService.deleteEquipment(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      res.status(200).json({ message: 'Equipment deleted successfully' });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      res.status(500).json({ error: 'Failed to delete equipment' });
    }
  }

  // 根据类型获取设备信息
  async getEquipmentByType(req, res) {
    try {
      const { type } = req.params;
      const equipment = await equipmentService.getEquipmentByType(type);
      res.status(200).json(equipment);
    } catch (error) {
      console.error('Error getting equipment by type:', error);
      res.status(500).json({ error: 'Failed to get equipment' });
    }
  }

  // 根据状态获取设备信息
  async getEquipmentByStatus(req, res) {
    try {
      const { status } = req.params;
      const equipment = await equipmentService.getEquipmentByStatus(status);
      res.status(200).json(equipment);
    } catch (error) {
      console.error('Error getting equipment by status:', error);
      res.status(500).json({ error: 'Failed to get equipment' });
    }
  }
}

module.exports = new EquipmentController();