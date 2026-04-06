const fs = require('fs-extra');
const path = require('path');
const excelService = require('./src/services/excelService');

// 生成美观的 HTML 报告
async function generateReport() {
  try {
    console.log('开始分析 Excel 数据并生成报告...');
    
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
    
    // 生成 HTML 报告
    console.log('数据分析完成，开始生成 HTML 报告...');
    
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>南宁市涉水环境企业污染源执法监测数据分析报告</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 1200px;
        }
        .header {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 40px 0;
            margin-bottom: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .card {
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            margin-bottom: 20px;
        }
        .card-header {
            background-color: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            border-radius: 10px 10px 0 0 !important;
        }
        .table {
            border-radius: 0 0 10px 10px;
            overflow: hidden;
        }
        .table thead {
            background-color: #007bff;
            color: white;
        }
        .stats-card {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            text-align: center;
        }
        .stats-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        .stats-label {
            font-size: 14px;
            color: #6c757d;
        }
        .chart-container {
            position: relative;
            height: 300px;
            margin-top: 20px;
        }
        .footer {
            margin-top: 40px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container mt-5">
        <div class="header text-center">
            <h1>南宁市涉水环境企业污染源执法监测数据分析报告</h1>
            <p class="mt-3">生成时间: ${new Date().toLocaleString()}</p>
        </div>
        
        <!-- 数据概览 -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-value">${overview.dataSize}</div>
                    <div class="stats-label">数据规模</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-value">${overview.companyCount}</div>
                    <div class="stats-label">企业数量</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-value">${overview.monitoringItemsCount}</div>
                    <div class="stats-label">监测项目</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stats-card">
                    <div class="stats-value">${overview.dateCount}</div>
                    <div class="stats-label">监测日期</div>
                </div>
            </div>
        </div>
        
        <!-- 企业监测次数排名 -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">企业监测次数排名</h2>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="companyRankingChart"></canvas>
                </div>
                <table class="table table-striped table-hover mt-4">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>企业名称</th>
                            <th>监测次数</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${companyRanking.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.companyName}</td>
                            <td>${item.count}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 主要监测项目分布 -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">主要监测项目分布</h2>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="monitoringItemsChart"></canvas>
                </div>
                <table class="table table-striped table-hover mt-4">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>监测项目</th>
                            <th>监测次数</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${monitoringItems.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.item}</td>
                            <td>${item.count}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 排放浓度统计 -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">排放浓度统计</h2>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="emissionChart"></canvas>
                </div>
                <table class="table table-striped table-hover mt-4">
                    <thead>
                        <tr>
                            <th>监测项目</th>
                            <th>平均浓度</th>
                            <th>最大浓度</th>
                            <th>最小浓度</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${emissionStatistics.map(item => `
                        <tr>
                            <td>${item.item}</td>
                            <td>${item.avg}</td>
                            <td>${item.max}</td>
                            <td>${item.min}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 行业分布分析 -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">行业分布分析</h2>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="industryChart"></canvas>
                </div>
                <table class="table table-striped table-hover mt-4">
                    <thead>
                        <tr>
                            <th>行业类别</th>
                            <th>企业数量</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${industryDistribution.map(item => `
                        <tr>
                            <td>${item.industry}</td>
                            <td>${item.count}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 受纳水体分析 -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">受纳水体分析</h2>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="waterBodiesChart"></canvas>
                </div>
                <table class="table table-striped table-hover mt-4">
                    <thead>
                        <tr>
                            <th>受纳水体</th>
                            <th>企业数量</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${waterBodies.map(item => `
                        <tr>
                            <td>${item.waterBody}</td>
                            <td>${item.count}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 执行标准分析 -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">执行标准分析</h2>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="standardsChart"></canvas>
                </div>
                <table class="table table-striped table-hover mt-4">
                    <thead>
                        <tr>
                            <th>执行标准名称</th>
                            <th>企业数量</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${standards.map(item => `
                        <tr>
                            <td>${item.standard}</td>
                            <td>${item.count}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- 分析总结 -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">分析总结</h2>
            </div>
            <div class="card-body">
                <p class="lead">本次分析共涉及 ${overview.companyCount} 家企业的 ${overview.dataSize} 条监测数据，涵盖了 ${overview.monitoringItemsCount} 个监测项目。</p>
                <p>从分析结果来看，医疗机构是监测次数最多的行业，主要监测项目包括化学需氧量、氨氮、总磷等指标。</p>
                <p>邕江是主要的受纳水体，有 ${waterBodies[0]?.count || 0} 家企业的废水排入其中。</p>
                <p>执行标准方面，医疗机构主要采用 GB18466-2005 标准，其他行业则根据各自特点采用不同的排放标准。</p>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2026 南宁市环境监测数据分析系统</p>
            <p>报告生成时间: ${new Date().toLocaleString()}</p>
        </div>
    </div>
    
    <script>
        // 企业监测次数排名图表
        const companyRankingCtx = document.getElementById('companyRankingChart').getContext('2d');
        new Chart(companyRankingCtx, {
            type: 'bar',
            data: {
                labels: [${companyRanking.map(item => `"${item.companyName}"`).join(', ')}],
                datasets: [{
                    label: '监测次数',
                    data: [${companyRanking.map(item => item.count).join(', ')}],
                    backgroundColor: 'rgba(0, 123, 255, 0.6)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // 监测项目分布图表
        const monitoringItemsCtx = document.getElementById('monitoringItemsChart').getContext('2d');
        new Chart(monitoringItemsCtx, {
            type: 'pie',
            data: {
                labels: [${monitoringItems.map(item => `"${item.item}"`).join(', ')}],
                datasets: [{
                    data: [${monitoringItems.map(item => item.count).join(', ')}],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(199, 199, 199, 0.6)',
                        'rgba(83, 102, 255, 0.6)',
                        'rgba(255, 99, 255, 0.6)',
                        'rgba(99, 255, 132, 0.6)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // 排放浓度统计图表
        const emissionCtx = document.getElementById('emissionChart').getContext('2d');
        new Chart(emissionCtx, {
            type: 'bar',
            data: {
                labels: [${emissionStatistics.map(item => `"${item.item}"`).join(', ')}],
                datasets: [
                    {
                        label: '平均浓度',
                        data: [${emissionStatistics.map(item => item.avg).join(', ')}],
                        backgroundColor: 'rgba(0, 123, 255, 0.6)'
                    },
                    {
                        label: '最大浓度',
                        data: [${emissionStatistics.map(item => item.max).join(', ')}],
                        backgroundColor: 'rgba(255, 99, 132, 0.6)'
                    },
                    {
                        label: '最小浓度',
                        data: [${emissionStatistics.map(item => item.min).join(', ')}],
                        backgroundColor: 'rgba(75, 192, 192, 0.6)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // 行业分布图表
        const industryCtx = document.getElementById('industryChart').getContext('2d');
        new Chart(industryCtx, {
            type: 'doughnut',
            data: {
                labels: [${industryDistribution.map(item => `"${item.industry}"`).join(', ')}],
                datasets: [{
                    data: [${industryDistribution.map(item => item.count).join(', ')}],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(199, 199, 199, 0.6)',
                        'rgba(83, 102, 255, 0.6)',
                        'rgba(255, 99, 255, 0.6)',
                        'rgba(99, 255, 132, 0.6)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // 受纳水体图表
        const waterBodiesCtx = document.getElementById('waterBodiesChart').getContext('2d');
        new Chart(waterBodiesCtx, {
            type: 'bar',
            data: {
                labels: [${waterBodies.map(item => `"${item.waterBody}"`).join(', ')}],
                datasets: [{
                    label: '企业数量',
                    data: [${waterBodies.map(item => item.count).join(', ')}],
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // 执行标准图表
        const standardsCtx = document.getElementById('standardsChart').getContext('2d');
        new Chart(standardsCtx, {
            type: 'bar',
            data: {
                labels: [${standards.map(item => `"${item.standard}"`).join(', ')}],
                datasets: [{
                    label: '企业数量',
                    data: [${standards.map(item => item.count).join(', ')}],
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>`;
    
    // 保存 HTML 报告
    const reportPath = path.join(__dirname, 'public', 'report.html');
    await fs.writeFile(reportPath, htmlContent);
    
    console.log('报告生成成功！');
    console.log('报告路径:', reportPath);
    console.log('访问地址:', 'http://localhost:3000/report.html');
    
  } catch (error) {
    console.error('生成报告过程中出现错误:', error);
  }
}

// 运行脚本
generateReport();