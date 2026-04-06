const taskService = require('../services/taskService');

// 生产任务控制器
class TaskController {
  // 创建生产任务
  async createTask(req, res) {
    try {
      const { name, description, ncProgramId, equipmentId, quantity, priority, status, startDate, endDate, assignee } = req.body;
      
      if (!name || !ncProgramId || !equipmentId) {
        return res.status(400).json({ error: 'Name, ncProgramId, and equipmentId are required' });
      }

      const task = await taskService.createTask(name, description, ncProgramId, equipmentId, quantity, priority, status, startDate, endDate, assignee);
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  // 获取所有生产任务
  async getAllTasks(req, res) {
    try {
      const tasks = await taskService.getAllTasks();
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  // 根据ID获取生产任务
  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(200).json(task);
    } catch (error) {
      console.error('Error getting task:', error);
      res.status(500).json({ error: 'Failed to get task' });
    }
  }

  // 更新生产任务
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const task = await taskService.updateTask(id, updates);
      res.status(200).json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  // 删除生产任务
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const success = await taskService.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  // 根据设备ID获取生产任务
  async getTasksByEquipmentId(req, res) {
    try {
      const { equipmentId } = req.params;
      const tasks = await taskService.getTasksByEquipmentId(equipmentId);
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error getting tasks by equipment:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  // 根据状态获取生产任务
  async getTasksByStatus(req, res) {
    try {
      const { status } = req.params;
      const tasks = await taskService.getTasksByStatus(status);
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  // 根据优先级获取生产任务
  async getTasksByPriority(req, res) {
    try {
      const { priority } = req.params;
      const tasks = await taskService.getTasksByPriority(priority);
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error getting tasks by priority:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  // 根据负责人获取生产任务
  async getTasksByAssignee(req, res) {
    try {
      const { assignee } = req.params;
      const tasks = await taskService.getTasksByAssignee(assignee);
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error getting tasks by assignee:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }
}

module.exports = new TaskController();