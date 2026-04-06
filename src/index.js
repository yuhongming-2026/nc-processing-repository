const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

// 创建 Express 应用
const app = express();
const port = 3000;

// 配置中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 注册 API 路由
app.use('/api', apiRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CNC Processing Repository API is running' });
});

// 根路径
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to CNC Processing Repository API',
    endpoints: {
      health: '/health',
      api: '/api',
      ncPrograms: '/api/nc-programs',
      equipment: '/api/equipment',
      tasks: '/api/tasks',
      feishu: '/api/feishu'
    }
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`CNC Processing Repository API is running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`API base URL: http://localhost:${port}/api`);
});

module.exports = app;