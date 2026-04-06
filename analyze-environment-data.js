const fs = require('fs-extra');
const path = require('path');
const excelService = require('./src/services/excelService');

// 分析环境监测数据
async function analyzeEnvironmentData() {
  try {
    console.log('开始分析南宁市涉水环境企业污染源执法监测数据...');
    
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
    console.log(`数据总行数: ${data[sheetName].length}`);
    
    // 测试 1: 基本信息统计
    console.log('\n=== 1. 基本信息统计 ===');
    const sql1 = `SELECT COUNT(DISTINCT 企业名称) as 企业数量, COUNT(DISTINCT 监测项目) as 监测项目数量, COUNT(DISTINCT 监测日期) as 监测日期数量 FROM ${sheetName}`;
    console.log(`SQL: ${sql1}`);
    const result1 = excelService.executeSQL(data, sql1);
    console.log('结果:', JSON.stringify(result1, null, 2));
    
    // 测试 2: 企业监测次数排名
    console.log('\n=== 2. 企业监测次数排名 ===');
    const sql2 = `SELECT 企业名称, COUNT(*) as 监测次数 FROM ${sheetName} GROUP BY 企业名称 ORDER BY 监测次数 DESC LIMIT 10`;
    console.log(`SQL: ${sql2}`);
    const result2 = excelService.executeSQL(data, sql2);
    console.log('结果:', JSON.stringify(result2, null, 2));
    
    // 测试 3: 主要监测项目分布
    console.log('\n=== 3. 主要监测项目分布 ===');
    const sql3 = `SELECT 监测项目, COUNT(*) as 监测次数 FROM ${sheetName} GROUP BY 监测项目 ORDER BY 监测次数 DESC LIMIT 10`;
    console.log(`SQL: ${sql3}`);
    const result3 = excelService.executeSQL(data, sql3);
    console.log('结果:', JSON.stringify(result3, null, 2));
    
    // 测试 4: 排放浓度统计
    console.log('\n=== 4. 排放浓度统计 ===');
    const sql4 = `SELECT 监测项目, AVG(排放浓度) as 平均浓度, MAX(排放浓度) as 最大浓度, MIN(排放浓度) as 最小浓度 FROM ${sheetName} WHERE 排放浓度 > 0 GROUP BY 监测项目 ORDER BY 平均浓度 DESC LIMIT 10`;
    console.log(`SQL: ${sql4}`);
    const result4 = excelService.executeSQL(data, sql4);
    console.log('结果:', JSON.stringify(result4, null, 2));
    
    // 测试 5: 超标企业分析
    console.log('\n=== 5. 超标企业分析 ===');
    const sql5 = `SELECT 企业名称, 监测项目, 排放浓度, 上限 FROM ${sheetName} WHERE 排放浓度 > 上限 LIMIT 10`;
    console.log(`SQL: ${sql5}`);
    const result5 = excelService.executeSQL(data, sql5);
    console.log('结果:', JSON.stringify(result5, null, 2));
    
    // 测试 6: 行业分布分析
    console.log('\n=== 6. 行业分布分析 ===');
    const sql6 = `SELECT 行业类别, COUNT(DISTINCT 企业名称) as 企业数量 FROM ${sheetName} GROUP BY 行业类别 ORDER BY 企业数量 DESC LIMIT 10`;
    console.log(`SQL: ${sql6}`);
    const result6 = excelService.executeSQL(data, sql6);
    console.log('结果:', JSON.stringify(result6, null, 2));
    
    // 测试 7: 受纳水体分析
    console.log('\n=== 7. 受纳水体分析 ===');
    const sql7 = `SELECT 受纳水体, COUNT(DISTINCT 企业名称) as 企业数量 FROM ${sheetName} GROUP BY 受纳水体 ORDER BY 企业数量 DESC LIMIT 10`;
    console.log(`SQL: ${sql7}`);
    const result7 = excelService.executeSQL(data, sql7);
    console.log('结果:', JSON.stringify(result7, null, 2));
    
    // 测试 8: 执行标准分析
    console.log('\n=== 8. 执行标准分析 ===');
    const sql8 = `SELECT 执行标准名称, COUNT(DISTINCT 企业名称) as 企业数量 FROM ${sheetName} GROUP BY 执行标准名称 ORDER BY 企业数量 DESC LIMIT 10`;
    console.log(`SQL: ${sql8}`);
    const result8 = excelService.executeSQL(data, sql8);
    console.log('结果:', JSON.stringify(result8, null, 2));
    
    // 测试 9: 高级查询 - 按行业和监测项目分析
    console.log('\n=== 9. 高级查询 - 按行业和监测项目分析 ===');
    const queryOptions = {
      sheetName: sheetName,
      select: '行业类别, 监测项目, COUNT(*) as 监测次数, AVG(排放浓度) as 平均浓度',
      groupBy: ['行业类别', '监测项目'],
      orderBy: {
        '监测次数': 'desc'
      },
      limit: 15
    };
    console.log('查询选项:', JSON.stringify(queryOptions, null, 2));
    const result9 = excelService.query(data, queryOptions);
    console.log('结果:', JSON.stringify(result9, null, 2));
    
    console.log('\n=== 分析完成 ===');
    console.log('使用 SQL 功能成功分析了南宁市涉水环境企业污染源执法监测数据！');
    
  } catch (error) {
    console.error('分析过程中出现错误:', error);
  }
}

// 运行分析
analyzeEnvironmentData();