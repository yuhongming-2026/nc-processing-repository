const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const NCProgram = require('../models/ncProgramModel');
const storageService = require('./storageService');

// 数控程序服务
class NCProgramService {
  // 创建数控程序
  async createProgram(name, description, content, equipmentId, creator) {
    try {
      const id = uuidv4();
      const program = new NCProgram(
        id,
        name,
        description,
        content,
        equipmentId,
        1, // 初始版本
        creator
      );

      // 保存程序文件
      await storageService.saveNCProgramFile(id, content);

      // 保存程序信息
      await storageService.saveData('nc_programs', program);

      return program;
    } catch (error) {
      console.error('Error creating NC program:', error);
      throw error;
    }
  }

  // 获取所有数控程序
  async getAllPrograms() {
    try {
      return await storageService.getAllData('nc_programs');
    } catch (error) {
      console.error('Error getting all NC programs:', error);
      return [];
    }
  }

  // 根据ID获取数控程序
  async getProgramById(id) {
    try {
      const program = await storageService.getDataById('nc_programs', id);
      if (program) {
        // 读取程序文件内容
        const content = await storageService.readNCProgramFile(id);
        return { ...program, content };
      }
      return null;
    } catch (error) {
      console.error('Error getting NC program by id:', error);
      return null;
    }
  }

  // 更新数控程序
  async updateProgram(id, updates, creator) {
    try {
      const existingProgram = await storageService.getDataById('nc_programs', id);
      if (!existingProgram) {
        throw new Error('Program not found');
      }

      // 检查是否需要更新版本
      let version = existingProgram.version;
      if (updates.content && updates.content !== existingProgram.content) {
        version += 1;
        // 保存新的程序文件
        await storageService.saveNCProgramFile(id, updates.content);
      }

      const updatedProgram = new NCProgram(
        id,
        updates.name || existingProgram.name,
        updates.description || existingProgram.description,
        updates.content || existingProgram.content,
        updates.equipmentId || existingProgram.equipmentId,
        version,
        creator,
        existingProgram.createdAt
      );

      // 保存更新后的程序信息
      await storageService.saveData('nc_programs', updatedProgram);

      return updatedProgram;
    } catch (error) {
      console.error('Error updating NC program:', error);
      throw error;
    }
  }

  // 删除数控程序
  async deleteProgram(id) {
    try {
      // 删除程序文件
      const filePath = path.join(__dirname, '../../data/nc_programs', `${id}.nc`);
      if (await fs.pathExists(filePath)) {
        await fs.unlink(filePath);
      }

      // 删除程序信息
      return await storageService.deleteData('nc_programs', id);
    } catch (error) {
      console.error('Error deleting NC program:', error);
      return false;
    }
  }

  // 根据设备ID获取数控程序
  async getProgramsByEquipmentId(equipmentId) {
    try {
      const allPrograms = await storageService.getAllData('nc_programs');
      return allPrograms.filter(program => program.equipmentId === equipmentId);
    } catch (error) {
      console.error('Error getting programs by equipment id:', error);
      return [];
    }
  }
}

module.exports = new NCProgramService();