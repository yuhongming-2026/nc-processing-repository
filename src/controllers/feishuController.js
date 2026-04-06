const feishuService = require('../services/feishuService');

// 飞书控制器
class FeishuController {
  // 发送文本消息
  async sendTextMessage(req, res) {
    try {
      const { receiveId, receiveIdType, content } = req.body;
      
      if (!receiveId || !receiveIdType || !content) {
        return res.status(400).json({ error: 'receiveId, receiveIdType, and content are required' });
      }

      const result = await feishuService.sendTextMessage(receiveId, receiveIdType, content);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error sending text message:', error);
      res.status(500).json({ error: 'Failed to send text message' });
    }
  }

  // 发送卡片消息
  async sendCardMessage(req, res) {
    try {
      const { receiveId, receiveIdType, card } = req.body;
      
      if (!receiveId || !receiveIdType || !card) {
        return res.status(400).json({ error: 'receiveId, receiveIdType, and card are required' });
      }

      const result = await feishuService.sendCardMessage(receiveId, receiveIdType, card);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error sending card message:', error);
      res.status(500).json({ error: 'Failed to send card message' });
    }
  }

  // 创建审批
  async createApproval(req, res) {
    try {
      const { approvalCode, approvers, form } = req.body;
      
      if (!approvalCode || !approvers || !form) {
        return res.status(400).json({ error: 'approvalCode, approvers, and form are required' });
      }

      const result = await feishuService.createApproval(approvalCode, approvers, form);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error creating approval:', error);
      res.status(500).json({ error: 'Failed to create approval' });
    }
  }

  // 获取审批状态
  async getApprovalStatus(req, res) {
    try {
      const { instanceId } = req.params;
      
      if (!instanceId) {
        return res.status(400).json({ error: 'instanceId is required' });
      }

      const result = await feishuService.getApprovalStatus(instanceId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting approval status:', error);
      res.status(500).json({ error: 'Failed to get approval status' });
    }
  }

  // 发送数控程序更新通知
  async sendNCProgramUpdateNotification(req, res) {
    try {
      const { programName, operator, recipients } = req.body;
      
      if (!programName || !operator || !recipients) {
        return res.status(400).json({ error: 'programName, operator, and recipients are required' });
      }

      const result = await feishuService.sendNCProgramUpdateNotification(programName, operator, recipients);
      res.status(200).json({ success: result });
    } catch (error) {
      console.error('Error sending NC program update notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  }

  // 发送生产任务分配通知
  async sendTaskAssignmentNotification(req, res) {
    try {
      const { taskName, assignee, equipmentName } = req.body;
      
      if (!taskName || !assignee || !equipmentName) {
        return res.status(400).json({ error: 'taskName, assignee, and equipmentName are required' });
      }

      const result = await feishuService.sendTaskAssignmentNotification(taskName, assignee, equipmentName);
      res.status(200).json({ success: result });
    } catch (error) {
      console.error('Error sending task assignment notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  }

  // 发送设备维护提醒
  async sendEquipmentMaintenanceReminder(req, res) {
    try {
      const { equipmentName, maintenanceDate, recipients } = req.body;
      
      if (!equipmentName || !maintenanceDate || !recipients) {
        return res.status(400).json({ error: 'equipmentName, maintenanceDate, and recipients are required' });
      }

      const result = await feishuService.sendEquipmentMaintenanceReminder(equipmentName, maintenanceDate, recipients);
      res.status(200).json({ success: result });
    } catch (error) {
      console.error('Error sending equipment maintenance reminder:', error);
      res.status(500).json({ error: 'Failed to send reminder' });
    }
  }
}

module.exports = new FeishuController();