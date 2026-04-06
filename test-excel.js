const fs = require('fs-extra');
const path = require('path');
const excelService = require('./src/services/excelService');

// 测试 Excel 分析功能
async function testExcelAnalysis() {
  try {
    console.log('开始分析 Excel 文件...');
    
    // 读取 Excel 文件
    const filePath = path.join(__dirname, '南宁市涉水环境企业污染源执法监测202510130100 (1).xlsx');
    
    if (!await fs.pathExists(filePath)) {
      console.error('文件不存在:', filePath);
      return;
    }
    
    console.log('文件存在，开始读取...');
    
    // 使用 Excel 服务读取文件
    const data = await excelService.readExcel(filePath);
    
    console.log('文件读取成功，开始分析...');
    
    // 分析数据
    const analysis = excelService.analyzeExcelData(data);
    
    console.log('分析完成，结果如下:');
    console.log(JSON.stringify(analysis, null, 2));
    
    // 导出分析结果
    const exportData = {
      '分析结果': Object.entries(analysis).map(([sheetName, sheetAnalysis]) => ({
        '工作表': sheetName,
        '总行数': sheetAnalysis.totalRows,
        '列数': sheetAnalysis.columns.length,
        '列名': sheetAnalysis.columns.join(', ')
      }))
    };
    
    const exportPath = await excelService.exportToExcel(exportData, 'analysis_result.xlsx');
    console.log('分析结果已导出到:', exportPath);
    
  } catch (error) {
    console.error('分析过程中出现错误:', error);
  }
}

// 运行测试
testExcelAnalysis();