const fs = require('fs-extra');
const path = require('path');
const excelService = require('./src/services/excelService');
const feishuService = require('./src/services/feishuService');

// 分析 Excel 数据并创建飞书文档
async function createFeishuReport() {
  try {
    console.log('开始分析 Excel 数据并创建飞书文档...');
    
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
    
    // 分析数据
    console.log('开始分析数据...');
    
    // 1. 基本信息统计
    const sql1 = `SELECT COUNT(DISTINCT 企业名称) as 企业数量, COUNT(DISTINCT 监测项目) as 监测项目数量, COUNT(DISTINCT 监测日期) as 监测日期数量 FROM ${sheetName}`;
    const overviewResult = excelService.executeSQL(data, sql1);
    const overview = {
      dataSize: `${data[sheetName].length} 行 × 23 列`,
      companyCount: overviewResult[0]['企业数量'] || 0,
      monitoringItemsCount: overviewResult[0]['监测项目数量'] || 0,
      dateCount: overviewResult[0]['监测日期数量'] || 0
    };
    
    // 2. 企业监测次数排名
    const sql2 = `SELECT 企业名称, COUNT(*) as 监测次数 FROM ${sheetName} GROUP BY 企业名称 ORDER BY 监测次数 DESC LIMIT 10`;
    const companyRankingResult = excelService.executeSQL(data, sql2);
    const companyRanking = companyRankingResult.map(item => ({
      companyName: item['企业名称'],
      count: item['监测次数']
    }));
    
    // 3. 主要监测项目分布
    const sql3 = `SELECT 监测项目, COUNT(*) as 监测次数 FROM ${sheetName} GROUP BY 监测项目 ORDER BY 监测次数 DESC LIMIT 10`;
    const monitoringItemsResult = excelService.executeSQL(data, sql3);
    const monitoringItems = monitoringItemsResult.map(item => ({
      item: item['监测项目'],
      count: item['监测次数']
    }));
    
    // 4. 排放浓度统计
    const sql4 = `SELECT 监测项目, AVG(排放浓度) as 平均浓度, MAX(排放浓度) as 最大浓度, MIN(排放浓度) as 最小浓度 FROM ${sheetName} WHERE 排放浓度 > 0 GROUP BY 监测项目 ORDER BY 平均浓度 DESC LIMIT 10`;
    const emissionStatisticsResult = excelService.executeSQL(data, sql4);
    const emissionStatistics = emissionStatisticsResult.map(item => ({
      item: item['监测项目'],
      avg: item['平均浓度'] ? item['平均浓度'].toFixed(2) : '0',
      max: item['最大浓度'] ? item['最大浓度'].toFixed(2) : '0',
      min: item['最小浓度'] ? item['最小浓度'].toFixed(2) : '0'
    }));
    
    // 5. 行业分布分析
    const sql5 = `SELECT 行业类别, COUNT(DISTINCT 企业名称) as 企业数量 FROM ${sheetName} GROUP BY 行业类别 ORDER BY 企业数量 DESC LIMIT 10`;
    const industryDistributionResult = excelService.executeSQL(data, sql5);
    const industryDistribution = industryDistributionResult.map(item => ({
      industry: item['行业类别'],
      count: item['企业数量']
    }));
    
    // 6. 受纳水体分析
    const sql6 = `SELECT 受纳水体, COUNT(DISTINCT 企业名称) as 企业数量 FROM ${sheetName} GROUP BY 受纳水体 ORDER BY 企业数量 DESC LIMIT 10`;
    const waterBodiesResult = excelService.executeSQL(data, sql6);
    const waterBodies = waterBodiesResult.map(item => ({
      waterBody: item['受纳水体'],
      count: item['企业数量']
    }));
    
    // 7. 执行标准分析
    const sql7 = `SELECT 执行标准名称, COUNT(DISTINCT 企业名称) as 企业数量 FROM ${sheetName} GROUP BY 执行标准名称 ORDER BY 企业数量 DESC LIMIT 10`;
    const standardsResult = excelService.executeSQL(data, sql7);
    const standards = standardsResult.map(item => ({
      standard: item['执行标准名称'],
      count: item['企业数量']
    }));
    
    // 准备分析数据
    const analysisData = {
      overview,
      companyRanking,
      monitoringItems,
      emissionStatistics,
      industryDistribution,
      waterBodies,
      standards
    };
    
    console.log('数据分析完成，开始生成飞书文档...');
    
    // 生成飞书文档内容
    const content = feishuService.generateEnvironmentReportContent(analysisData);
    
    // 创建飞书文档
    const document = await feishuService.createDocument(
      `南宁市涉水环境企业污染源执法监测数据分析 - ${new Date().toISOString().split('T')[0]}`,
      content
    );
    
    console.log('飞书文档创建成功！');
    console.log('文档链接:', `https://bytedance.larkoffice.com/docx/${document.document_token}`);
    console.log('文档标题:', document.title);
    
  } catch (error) {
    console.error('创建飞书文档过程中出现错误:', error);
  }
}

// 运行脚本
createFeishuReport();