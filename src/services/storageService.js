const fs = require('fs-extra');
const path = require('path');

// 数据存储服务
class StorageService {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
  }

  // 保存数据到文件
  async saveData(dataType, data) {
    try {
      const filePath = path.join(this.dataDir, `${dataType}.json`);
      let existingData = [];
      
      // 检查文件是否存在
      if (await fs.pathExists(filePath)) {
        const fileContent = await fs.readFile(filePath, 'utf8');
        existingData = JSON.parse(fileContent);
      }

      // 检查是否已存在相同ID的数据
      const index = existingData.findIndex(item => item.id === data.id);
      if (index !== -1) {
        // 更新现有数据
        existingData[index] = { ...data, updatedAt: new Date().toISOString() };
      } else {
        // 添加新数据
        existingData.push(data);
      }

      // 写入文件
      await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf8');
      return data;
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  // 获取所有数据
  async getAllData(dataType) {
    try {
      const filePath = path.join(this.dataDir, `${dataType}.json`);
      
      if (await fs.pathExists(filePath)) {
        const fileContent = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContent);
      }
      return [];
    } catch (error) {
      console.error('Error getting data:', error);
      return [];
    }
  }

  // 根据ID获取数据
  async getDataById(dataType, id) {
    try {
      const allData = await this.getAllData(dataType);
      return allData.find(item => item.id === id);
    } catch (error) {
      console.error('Error getting data by id:', error);
      return null;
    }
  }

  // 删除数据
  async deleteData(dataType, id) {
    try {
      const filePath = path.join(this.dataDir, `${dataType}.json`);
      
      if (await fs.pathExists(filePath)) {
        const fileContent = await fs.readFile(filePath, 'utf8');
        let existingData = JSON.parse(fileContent);
        
        // 过滤掉要删除的数据
        existingData = existingData.filter(item => item.id !== id);
        
        // 写入文件
        await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf8');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting data:', error);
      return false;
    }
  }

  // 保存数控程序文件
  async saveNCProgramFile(programId, content) {
    try {
      const filePath = path.join(this.dataDir, 'nc_programs', `${programId}.nc`);
      await fs.writeFile(filePath, content, 'utf8');
      return filePath;
    } catch (error) {
      console.error('Error saving NC program file:', error);
      throw error;
    }
  }

  // 读取数控程序文件
  async readNCProgramFile(programId) {
    try {
      const filePath = path.join(this.dataDir, 'nc_programs', `${programId}.nc`);
      
      if (await fs.pathExists(filePath)) {
        return await fs.readFile(filePath, 'utf8');
      }
      return null;
    } catch (error) {
      console.error('Error reading NC program file:', error);
      return null;
    }
  }
}

module.exports = new StorageService();