const fs = require('fs-extra');
const path = require('path');
const excelService = require('./src/services/excelService');

// 测试 SQL 功能
async function testSQLFeatures() {
  try {
    console.log('开始测试 SQL 功能...');
    
    // 读取 Excel 文件
    const filePath = path.join(__dirname, '南宁市涉水环境企业污染源执法监测202510130100 (1).xlsx');
    
    if (!await fs.pathExists(filePath)) {
      console.error('文件不存在:', filePath);
      return;
    }
    
    console.log('文件存在，开始读取...');
    
    // 使用 Excel 服务读取文件
    const data = await excelService.readExcel(filePath);
    const sheetName = Object.keys(data)[0];
    console.log(`工作表名称: ${sheetName}`);
    
    // 测试 1: 基本 SQL 查询
    console.log('\n测试 1: 基本 SQL 查询');
    const sql1 = `SELECT 企业名称, 监测项目, 排放浓度 FROM ${sheetName} WHERE 排放浓度 > 10 LIMIT 5`;
    console.log(`SQL: ${sql1}`);
    const result1 = excelService.executeSQL(data, sql1);
    console.log('结果:', JSON.stringify(result1, null, 2));
    
    // 测试 2: 分组和聚合
    console.log('\n测试 2: 分组和聚合');
    const sql2 = `SELECT 企业名称, COUNT(*) as 监测次数 FROM ${sheetName} GROUP BY 企业名称 ORDER BY 监测次数 DESC LIMIT 10`;
    console.log(`SQL: ${sql2}`);
    const result2 = excelService.executeSQL(data, sql2);
    console.log('结果:', JSON.stringify(result2, null, 2));
    
    // 测试 3: 高级查询选项
    console.log('\n测试 3: 高级查询选项');
    const queryOptions = {
      sheetName: sheetName,
      select: '企业名称, 监测项目, 排放浓度',
      where: {
        '排放浓度': ['>', '50']
      },
      orderBy: {
        '排放浓度': 'desc'
      },
      limit: 10
    };
    console.log('查询选项:', JSON.stringify(queryOptions, null, 2));
    const result3 = excelService.query(data, queryOptions);
    console.log('结果:', JSON.stringify(result3, null, 2));
    
    // 测试 4: 聚合函数
    console.log('\n测试 4: 聚合函数');
    const sql4 = `SELECT 企业名称, AVG(排放浓度) as 平均排放浓度, MAX(排放浓度) as 最大排放浓度 FROM ${sheetName} GROUP BY 企业名称 LIMIT 10`;
    console.log(`SQL: ${sql4}`);
    const result4 = excelService.executeSQL(data, sql4);
    console.log('结果:', JSON.stringify(result4, null, 2));
    
    console.log('\n所有测试完成！');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

// 运行测试
testSQLFeatures();