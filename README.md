# CNC Processing Repository

企业数控处理储存库 - 基于 Node.js 和 Express 的环境监测数据分析系统

## 项目简介

本项目是一个企业数控处理储存库，主要用于：
- 管理数控程序文件
- 管理设备信息
- 管理生产任务
- 分析环境监测数据
- 与飞书集成，发送通知和创建文档

## 核心功能

### 1. 数控程序管理
- 创建、查询、更新、删除数控程序
- 支持程序版本管理
- 按设备ID筛选程序

### 2. 设备信息管理
- 管理设备基本信息
- 按类型和状态筛选设备

### 3. 生产任务管理
- 创建和管理生产任务
- 按设备、状态、优先级和负责人筛选任务

### 4. Excel 数据分析
- 上传和分析 Excel 文件
- 支持 SQL 风格的查询
- 数据过滤、分组、聚合
- 生成美观的分析报告

### 5. 飞书集成
- 发送消息通知
- 创建审批流程
- 发送业务通知

## 技术栈

- **后端**：Node.js + Express.js
- **数据库**：文件系统存储（可扩展为 MongoDB 或 MySQL）
- **飞书集成**：@larksuiteoapi/node-sdk
- **Excel 处理**：xlsx + exceljs
- **前端**：HTML + Bootstrap + Chart.js

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置飞书应用

1. 在 `config.js` 文件中配置飞书应用信息：

```javascript
// 飞书应用配置
module.exports = {
  appId: 'your_app_id',
  appSecret: 'your_app_secret',
  scope: 'user_info,im:message',
  redirectUri: 'http://localhost:3000/callback'
};
```

### 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动

## API 端点

### 数控程序
- `GET /api/nc-programs` - 获取所有数控程序
- `GET /api/nc-programs/:id` - 获取单个数控程序
- `POST /api/nc-programs` - 创建数控程序
- `PUT /api/nc-programs/:id` - 更新数控程序
- `DELETE /api/nc-programs/:id` - 删除数控程序

### 设备信息
- `GET /api/equipment` - 获取所有设备
- `GET /api/equipment/:id` - 获取单个设备
- `POST /api/equipment` - 创建设备
- `PUT /api/equipment/:id` - 更新设备
- `DELETE /api/equipment/:id` - 删除设备

### 生产任务
- `GET /api/tasks` - 获取所有任务
- `GET /api/tasks/:id` - 获取单个任务
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

### Excel 处理
- `POST /api/excel/upload` - 上传并分析 Excel 文件
- `POST /api/excel/analyze` - 分析数据
- `POST /api/excel/export` - 导出数据
- `POST /api/excel/sql` - 执行 SQL 查询
- `POST /api/excel/query` - 执行高级查询

### 飞书集成
- `POST /api/feishu/messages/text` - 发送文本消息
- `POST /api/feishu/messages/card` - 发送卡片消息
- `POST /api/feishu/approvals` - 创建审批
- `GET /api/feishu/approvals/:id` - 获取审批状态

## 环境监测数据分析

本项目包含强大的 Excel 数据分析功能，可以：

1. **上传分析**：上传 Excel 文件并自动分析
2. **SQL 查询**：使用 SQL 语句查询数据
3. **高级分析**：支持过滤、分组、聚合
4. **报告生成**：生成美观的 HTML 报告

### 分析示例

```bash
# 运行环境监测数据分析
node analyze-environment-data.js

# 生成 HTML 报告
node generate-report.js
```

报告将在 `http://localhost:3000/report.html` 访问

## 项目结构

```
cnc-processing-repository/
├── src/
│   ├── controllers/          # 控制器
│   ├── models/               # 数据模型
│   ├── routes/               # API路由
│   ├── services/             # 业务逻辑服务
│   └── index.js              # 主入口文件
├── public/                   # 静态文件
├── data/                     # 数据文件
├── config.js                 # 配置文件
├── package.json              # 项目配置
└── README.md                 # 项目说明
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

MIT License

## 联系方式

- 作者：yuhongming-2026
- 邮箱：hongming@isrc.iscas.ac.cn
- GitHub：[yuhongming-2026/nc-processing-repository](https://github.com/yuhongming-2026/nc-processing-repository)