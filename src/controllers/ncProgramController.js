const ncProgramService = require('../services/ncProgramService');

// 数控程序控制器
class NCProgramController {
  // 创建数控程序
  async createProgram(req, res) {
    try {
      const { name, description, content, equipmentId, creator } = req.body;
      
      if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
      }

      const program = await ncProgramService.createProgram(name, description, content, equipmentId, creator);
      res.status(201).json(program);
    } catch (error) {
      console.error('Error creating program:', error);
      res.status(500).json({ error: 'Failed to create program' });
    }
  }

  // 获取所有数控程序
  async getAllPrograms(req, res) {
    try {
      const programs = await ncProgramService.getAllPrograms();
      res.status(200).json(programs);
    } catch (error) {
      console.error('Error getting programs:', error);
      res.status(500).json({ error: 'Failed to get programs' });
    }
  }

  // 根据ID获取数控程序
  async getProgramById(req, res) {
    try {
      const { id } = req.params;
      const program = await ncProgramService.getProgramById(id);
      
      if (!program) {
        return res.status(404).json({ error: 'Program not found' });
      }

      res.status(200).json(program);
    } catch (error) {
      console.error('Error getting program:', error);
      res.status(500).json({ error: 'Failed to get program' });
    }
  }

  // 更新数控程序
  async updateProgram(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const { creator } = req.body;

      const program = await ncProgramService.updateProgram(id, updates, creator);
      res.status(200).json(program);
    } catch (error) {
      console.error('Error updating program:', error);
      res.status(500).json({ error: 'Failed to update program' });
    }
  }

  // 删除数控程序
  async deleteProgram(req, res) {
    try {
      const { id } = req.params;
      const success = await ncProgramService.deleteProgram(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Program not found' });
      }

      res.status(200).json({ message: 'Program deleted successfully' });
    } catch (error) {
      console.error('Error deleting program:', error);
      res.status(500).json({ error: 'Failed to delete program' });
    }
  }

  // 根据设备ID获取数控程序
  async getProgramsByEquipmentId(req, res) {
    try {
      const { equipmentId } = req.params;
      const programs = await ncProgramService.getProgramsByEquipmentId(equipmentId);
      res.status(200).json(programs);
    } catch (error) {
      console.error('Error getting programs by equipment:', error);
      res.status(500).json({ error: 'Failed to get programs' });
    }
  }
}

module.exports = new NCProgramController();