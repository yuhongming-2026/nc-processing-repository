const express = require('express');
const router = express.Router();

// 导入控制器
const ncProgramController = require('../controllers/ncProgramController');
const equipmentController = require('../controllers/equipmentController');
const taskController = require('../controllers/taskController');
const feishuController = require('../controllers/feishuController');
const excelController = require('../controllers/excelController');

// 数控程序路由
router.post('/nc-programs', ncProgramController.createProgram);
router.get('/nc-programs', ncProgramController.getAllPrograms);
router.get('/nc-programs/:id', ncProgramController.getProgramById);
router.put('/nc-programs/:id', ncProgramController.updateProgram);
router.delete('/nc-programs/:id', ncProgramController.deleteProgram);
router.get('/nc-programs/equipment/:equipmentId', ncProgramController.getProgramsByEquipmentId);

// 设备信息路由
router.post('/equipment', equipmentController.createEquipment);
router.get('/equipment', equipmentController.getAllEquipment);
router.get('/equipment/:id', equipmentController.getEquipmentById);
router.put('/equipment/:id', equipmentController.updateEquipment);
router.delete('/equipment/:id', equipmentController.deleteEquipment);
router.get('/equipment/type/:type', equipmentController.getEquipmentByType);
router.get('/equipment/status/:status', equipmentController.getEquipmentByStatus);

// 生产任务路由
router.post('/tasks', taskController.createTask);
router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/:id', taskController.getTaskById);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.get('/tasks/equipment/:equipmentId', taskController.getTasksByEquipmentId);
router.get('/tasks/status/:status', taskController.getTasksByStatus);
router.get('/tasks/priority/:priority', taskController.getTasksByPriority);
router.get('/tasks/assignee/:assignee', taskController.getTasksByAssignee);

// 飞书集成路由
router.post('/feishu/messages/text', feishuController.sendTextMessage);
router.post('/feishu/messages/card', feishuController.sendCardMessage);
router.post('/feishu/approvals', feishuController.createApproval);
router.get('/feishu/approvals/:instanceId', feishuController.getApprovalStatus);
router.post('/feishu/notifications/nc-program-update', feishuController.sendNCProgramUpdateNotification);
router.post('/feishu/notifications/task-assignment', feishuController.sendTaskAssignmentNotification);
router.post('/feishu/notifications/equipment-maintenance', feishuController.sendEquipmentMaintenanceReminder);

// Excel 处理路由
router.post('/excel/upload', excelController.uploadAndAnalyze);
router.post('/excel/analyze', excelController.analyzeData);
router.post('/excel/export', excelController.exportToExcel);
router.post('/excel/sql', excelController.executeSQL);
router.post('/excel/query', excelController.advancedQuery);

module.exports = router;