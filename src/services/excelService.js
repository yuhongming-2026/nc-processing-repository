const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const fs = require('fs-extra');
const path = require('path');

// Excel 处理服务
class ExcelService {
  // 读取 Excel 文件
  async readExcel(filePath) {
    try {
      // 使用 xlsx 库读取 Excel 文件
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const result = {};

      // 读取每个工作表
      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        result[sheetName] = data;
      }

      return result;
    } catch (error) {
      console.error('Error reading Excel file:', error);
      throw error;
    }
  }

  // 使用 ExcelJS 读取 Excel 文件（支持更多功能）
  async readExcelWithExcelJS(filePath) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const result = {};

      // 读取每个工作表
      workbook.eachSheet((worksheet, sheetName) => {
        const data = [];
        worksheet.eachRow((row, rowNumber) => {
          // 跳过表头
          if (rowNumber === 1) return;
          
          const rowData = {};
          worksheet.eachColumn((column, columnNumber) => {
            const header = worksheet.getRow(1).getCell(columnNumber).value;
            const cellValue = row.getCell(columnNumber).value;
            rowData[header] = cellValue;
          });
          data.push(rowData);
        });
        result[sheetName] = data;
      });

      return result;
    } catch (error) {
      console.error('Error reading Excel file with ExcelJS:', error);
      throw error;
    }
  }

  // 分析 Excel 数据
  analyzeExcelData(data) {
    try {
      const analysis = {};

      // 分析每个工作表
      for (const [sheetName, sheetData] of Object.entries(data)) {
        if (sheetData.length === 0) {
          analysis[sheetName] = { message: 'No data found' };
          continue;
        }

        const sheetAnalysis = {
          totalRows: sheetData.length,
          columns: Object.keys(sheetData[0]),
          dataTypes: {},
          statistics: {}
        };

        // 分析每列的数据类型和统计信息
        for (const column of sheetAnalysis.columns) {
          const values = sheetData.map(row => row[column]).filter(value => value !== null && value !== undefined);
          
          // 分析数据类型
          const types = values.map(value => typeof value);
          const uniqueTypes = [...new Set(types)];
          sheetAnalysis.dataTypes[column] = uniqueTypes;

          // 计算统计信息（仅对数值类型）
          if (uniqueTypes.includes('number')) {
            const numericValues = values.filter(value => typeof value === 'number');
            if (numericValues.length > 0) {
              const sum = numericValues.reduce((acc, val) => acc + val, 0);
              const avg = sum / numericValues.length;
              const min = Math.min(...numericValues);
              const max = Math.max(...numericValues);
              
              sheetAnalysis.statistics[column] = {
                sum,
                average: avg,
                min,
                max,
                count: numericValues.length
              };
            }
          } else if (uniqueTypes.includes('string')) {
            // 对字符串类型统计唯一值
            const uniqueValues = [...new Set(values)];
            sheetAnalysis.statistics[column] = {
              uniqueCount: uniqueValues.length,
              sampleValues: uniqueValues.slice(0, 5) // 只显示前5个样本
            };
          }
        }

        analysis[sheetName] = sheetAnalysis;
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing Excel data:', error);
      throw error;
    }
  }

  // SQL 类似的查询功能
  query(data, options) {
    try {
      const {
        sheetName,
        select = '*',
        where = null,
        groupBy = null,
        orderBy = null,
        limit = null,
        offset = 0
      } = options;

      // 获取指定工作表的数据
      const sheetData = data[sheetName];
      if (!sheetData) {
        throw new Error(`Sheet ${sheetName} not found`);
      }

      // 过滤数据
      let filteredData = sheetData;
      if (where) {
        filteredData = this.filterData(filteredData, where);
      }

      // 排序
      if (orderBy) {
        filteredData = this.sortData(filteredData, orderBy);
      }

      // 分组和聚合
      if (groupBy) {
        return this.groupByData(filteredData, groupBy, select);
      }

      // 选择列
      if (select !== '*') {
        const columns = select.split(',').map(col => col.trim());
        filteredData = filteredData.map(row => {
          const newRow = {};
          columns.forEach(col => {
            if (row[col]) {
              newRow[col] = row[col];
            }
          });
          return newRow;
        });
      }

      // 分页
      if (limit) {
        filteredData = filteredData.slice(offset, offset + limit);
      }

      return filteredData;
    } catch (error) {
      console.error('Error querying data:', error);
      throw error;
    }
  }

  // 过滤数据
  filterData(data, where) {
    return data.filter(row => {
      for (const [column, condition] of Object.entries(where)) {
        const [operator, value] = condition;
        const rowValue = row[column];

        switch (operator) {
          case '=':
            if (rowValue !== value) return false;
            break;
          case '!=':
            if (rowValue === value) return false;
            break;
          case '>':
            if (parseFloat(rowValue) <= parseFloat(value)) return false;
            break;
          case '<':
            if (parseFloat(rowValue) >= parseFloat(value)) return false;
            break;
          case '>=':
            if (parseFloat(rowValue) < parseFloat(value)) return false;
            break;
          case '<=':
            if (parseFloat(rowValue) > parseFloat(value)) return false;
            break;
          case 'like':
            if (!rowValue || !rowValue.toString().includes(value)) return false;
            break;
          default:
            break;
        }
      }
      return true;
    });
  }

  // 排序数据
  sortData(data, orderBy) {
    return data.sort((a, b) => {
      for (const [column, direction] of Object.entries(orderBy)) {
        const aValue = a[column];
        const bValue = b[column];

        if (aValue < bValue) {
          return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return direction === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });
  }

  // 分组数据并聚合
  groupByData(data, groupBy, select) {
    const groups = {};

    // 分组
    data.forEach(row => {
      const key = groupBy.map(col => row[col]).join('|');
      if (!groups[key]) {
        groups[key] = {
          keys: groupBy.map(col => row[col]),
          data: []
        };
      }
      groups[key].data.push(row);
    });

    // 处理选择和聚合
    const result = [];
    Object.values(groups).forEach(group => {
      const groupResult = {};
      
      // 设置分组键值
      groupBy.forEach((col, index) => {
        groupResult[col] = group.keys[index];
      });

      // 处理聚合函数
      if (select !== '*') {
        const columns = select.split(',').map(col => col.trim());
        columns.forEach(col => {
          // 检查是否是聚合函数
          if (col.includes('(') && col.includes(')')) {
            const match = col.match(/(\w+)\((\w+)\)/);
            if (match) {
              const [, functionName, columnName] = match;
              groupResult[col] = this.calculateAggregation(group.data, columnName, functionName);
            }
          }
        });
      } else {
        // 默认为每个组计算计数
        groupResult.count = group.data.length;
      }

      result.push(groupResult);
    });

    return result;
  }

  // 计算聚合函数
  calculateAggregation(data, column, functionName) {
    const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
    
    switch (functionName.toLowerCase()) {
      case 'sum':
        return values.reduce((acc, val) => acc + val, 0);
      case 'avg':
        return values.length > 0 ? values.reduce((acc, val) => acc + val, 0) / values.length : 0;
      case 'count':
        return values.length;
      case 'max':
        return values.length > 0 ? Math.max(...values) : 0;
      case 'min':
        return values.length > 0 ? Math.min(...values) : 0;
      default:
        return 0;
    }
  }

  // 执行 SQL 风格的查询
  executeSQL(data, sql) {
    try {
      // 简单的 SQL 解析
      const parsed = this.parseSQL(sql);
      return this.query(data, parsed);
    } catch (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
  }

  // 简单的 SQL 解析
  parseSQL(sql) {
    // 这是一个简化的 SQL 解析器，仅支持基本语法
    const normalizedSQL = sql.toLowerCase().trim();
    
    // 提取 SELECT 子句
    const selectMatch = normalizedSQL.match(/select (.*?) from/i);
    const select = selectMatch ? selectMatch[1].trim() : '*';
    
    // 提取 FROM 子句
    const fromMatch = normalizedSQL.match(/from (\w+)/i);
    const sheetName = fromMatch ? fromMatch[1] : Object.keys(data)[0];
    
    // 提取 WHERE 子句
    const whereMatch = normalizedSQL.match(/where (.*?)( group by| order by| limit|$)/i);
    let where = null;
    if (whereMatch) {
      where = {};
      const conditions = whereMatch[1].split(' and ');
      conditions.forEach(condition => {
        const [col, op, val] = condition.trim().split(/\s+/);
        where[col] = [op, val.replace(/['"]/g, '')];
      });
    }
    
    // 提取 GROUP BY 子句
    const groupByMatch = normalizedSQL.match(/group by (.*?)( order by| limit|$)/i);
    const groupBy = groupByMatch ? groupByMatch[1].split(',').map(col => col.trim()) : null;
    
    // 提取 ORDER BY 子句
    const orderByMatch = normalizedSQL.match(/order by (.*?)( limit|$)/i);
    let orderBy = null;
    if (orderByMatch) {
      orderBy = {};
      const orderConditions = orderByMatch[1].split(',');
      orderConditions.forEach(condition => {
        const [col, dir] = condition.trim().split(/\s+/);
        orderBy[col] = dir || 'asc';
      });
    }
    
    // 提取 LIMIT 子句
    const limitMatch = normalizedSQL.match(/limit (\d+)( offset (\d+))?/i);
    const limit = limitMatch ? parseInt(limitMatch[1]) : null;
    const offset = limitMatch && limitMatch[3] ? parseInt(limitMatch[3]) : 0;
    
    return {
      sheetName,
      select,
      where,
      groupBy,
      orderBy,
      limit,
      offset
    };
  }

  // 处理上传的 Excel 文件
  async processUploadedFile(file) {
    try {
      // 读取文件
      const data = await this.readExcel(file.path);
      
      // 分析数据
      const analysis = this.analyzeExcelData(data);
      
      // 删除临时文件
      await fs.unlink(file.path);
      
      return {
        data,
        analysis
      };
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      throw error;
    }
  }

  // 导出数据到 Excel
  async exportToExcel(data, fileName) {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'CNC Processing Repository';
      workbook.lastModifiedBy = 'CNC Processing Repository';
      workbook.created = new Date();
      workbook.modified = new Date();

      // 为每个数据集创建一个工作表
      for (const [sheetName, sheetData] of Object.entries(data)) {
        const worksheet = workbook.addWorksheet(sheetName);
        
        if (sheetData.length > 0) {
          // 添加表头
          const headers = Object.keys(sheetData[0]);
          worksheet.addRow(headers);
          
          // 添加数据行
          for (const rowData of sheetData) {
            const row = headers.map(header => rowData[header]);
            worksheet.addRow(row);
          }
        }
      }

      // 保存文件
      const filePath = path.join(__dirname, '../../data', fileName);
      await workbook.xlsx.writeFile(filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }
}

module.exports = new ExcelService();