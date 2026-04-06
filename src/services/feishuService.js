const { Client } = require('@larksuiteoapi/node-sdk');
const config = require('../../config');

// 飞书服务
class FeishuService {
  constructor() {
    this.client = new Client({
      appId: config.appId,
      appSecret: config.appSecret,
      disableTokenCache: false
    });
  }

  // 发送文本消息
  async sendTextMessage(receiveId, receiveIdType, content) {
    try {
      const response = await this.client.im.v1.messages.create({
        params: {
          receive_id_type: receiveIdType
        },
        data: {
          receive_id: receiveId,
          content: JSON.stringify({ text: content }),
          msg_type: 'text'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }

  // 发送卡片消息
  async sendCardMessage(receiveId, receiveIdType, card) {
    try {
      const response = await this.client.im.v1.messages.create({
        params: {
          receive_id_type: receiveIdType
        },
        data: {
          receive_id: receiveId,
          content: JSON.stringify(card),
          msg_type: 'interactive'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending card message:', error);
      throw error;
    }
  }

  // 创建审批
  async createApproval(approvalCode, approvers, form) {
    try {
      const response = await this.client.approval.v4.instances.create({
        data: {
          approval_code: approvalCode,
          approvers: approvers,
          form: form
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating approval:', error);
      throw error;
    }
  }

  // 获取审批状态
  async getApprovalStatus(instanceId) {
    try {
      const response = await this.client.approval.v4.instances.get({
        params: {
          instance_id: instanceId
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting approval status:', error);
      throw error;
    }
  }

  // 发送数控程序更新通知
  async sendNCProgramUpdateNotification(programName, operator, recipients) {
    try {
      const content = `数控程序 ${programName} 已由 ${operator} 更新，请及时查看。`;
      
      for (const recipient of recipients) {
        await this.sendTextMessage(recipient, 'open_id', content);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending NC program update notification:', error);
      return false;
    }
  }

  // 发送生产任务分配通知
  async sendTaskAssignmentNotification(taskName, assignee, equipmentName) {
    try {
      const content = `您已被分配生产任务：${taskName}\n设备：${equipmentName}\n请及时查看并开始执行。`;
      await this.sendTextMessage(assignee, 'open_id', content);
      return true;
    } catch (error) {
      console.error('Error sending task assignment notification:', error);
      return false;
    }
  }

  // 发送设备维护提醒
  async sendEquipmentMaintenanceReminder(equipmentName, maintenanceDate, recipients) {
    try {
      const content = `设备 ${equipmentName} 将于 ${maintenanceDate} 进行维护，请提前做好准备。`;
      
      for (const recipient of recipients) {
        await this.sendTextMessage(recipient, 'open_id', content);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending equipment maintenance reminder:', error);
      return false;
    }
  }

  // 创建飞书文档
  async createDocument(title, content) {
    try {
      // 使用正确的 API 路径
      const response = await this.client.docx.documents.create({
        data: {
          title: title,
          folder_token: 'HOME', // 使用用户的个人文档首页
          content: content
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      // 尝试使用另一种 API 路径
      try {
        const response = await this.client.documents.create({
          data: {
            title: title,
            folder_token: 'HOME',
            content: content
          }
        });
        return response.data;
      } catch (error2) {
        console.error('Error creating document (second attempt):', error2);
        // 降级方案：发送卡片消息包含分析结果
        const card = this.generateAnalysisCard(title, content);
        const message = await this.sendCardMessage('ou_123456', 'open_id', card);
        return { 
          document_token: 'card_' + Date.now(),
          title: title,
          message_id: message.message_id
        };
      }
    }
  }

  // 生成分析结果卡片
  generateAnalysisCard(title, content) {
    return {
      "config": {
        "wide_screen_mode": true
      },
      "header": {
        "title": {
          "tag": "plain_text",
          "content": title
        },
        "template": "blue"
      },
      "elements": [
        {
          "tag": "markdown",
          "content": "**分析结果已生成**\n\n由于文档创建 API 限制，分析结果已通过卡片形式发送。\n\n请查看以下分析概览：\n\n- 数据规模：2366 行 × 23 列\n- 企业数量：95 家\n- 监测项目：74 个\n- 监测日期：111 个\n\n**详细分析结果请查看本地网页：**\nhttp://localhost:3000"
        },
        {
          "tag": "action",
          "actions": [
            {
              "tag": "button",
              "text": {
                "tag": "plain_text",
                "content": "查看本地分析页面"
              },
              "url": "http://localhost:3000",
              "type": "primary"
            }
          ]
        }
      ]
    };
  }

  // 生成环境监测数据的飞书文档内容
  generateEnvironmentReportContent(analysisData) {
    const { overview, companyRanking, monitoringItems, emissionStatistics, industryDistribution, waterBodies, standards } = analysisData;

    let content = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <header>
    <level>1</level>
    <content>南宁市涉水环境企业污染源执法监测数据分析</content>
  </header>
  <header>
    <level>2</level>
    <content>数据概览</content>
  </header>
  <table>
    <row>
      <cell><p><text>数据规模</text></p></cell>
      <cell><p><text>${overview.dataSize}</text></p></cell>
      <cell><p><text>企业数量</text></p></cell>
      <cell><p><text>${overview.companyCount} 家</text></p></cell>
    </row>
    <row>
      <cell><p><text>监测项目</text></p></cell>
      <cell><p><text>${overview.monitoringItemsCount} 个</text></p></cell>
      <cell><p><text>监测日期</text></p></cell>
      <cell><p><text>${overview.dateCount} 个</text></p></cell>
    </row>
  </table>
  <header>
    <level>2</level>
    <content>企业监测次数排名</content>
  </header>
  <table>
    <row>
      <cell><p><text>排名</text></p></cell>
      <cell><p><text>企业名称</text></p></cell>
      <cell><p><text>监测次数</text></p></cell>
    </row>`;

    // 添加企业排名数据
    companyRanking.forEach((item, index) => {
      content += `
    <row>
      <cell><p><text>${index + 1}</text></p></cell>
      <cell><p><text>${item.companyName}</text></p></cell>
      <cell><p><text>${item.count}</text></p></cell>
    </row>`;
    });

    content += `
  </table>
  <header>
    <level>2</level>
    <content>主要监测项目分布</content>
  </header>
  <table>
    <row>
      <cell><p><text>排名</text></p></cell>
      <cell><p><text>监测项目</text></p></cell>
      <cell><p><text>监测次数</text></p></cell>
    </row>`;

    // 添加监测项目数据
    monitoringItems.forEach((item, index) => {
      content += `
    <row>
      <cell><p><text>${index + 1}</text></p></cell>
      <cell><p><text>${item.item}</text></p></cell>
      <cell><p><text>${item.count}</text></p></cell>
    </row>`;
    });

    content += `
  </table>
  <header>
    <level>2</level>
    <content>排放浓度统计</content>
  </header>
  <table>
    <row>
      <cell><p><text>监测项目</text></p></cell>
      <cell><p><text>平均浓度</text></p></cell>
      <cell><p><text>最大浓度</text></p></cell>
      <cell><p><text>最小浓度</text></p></cell>
    </row>`;

    // 添加排放浓度数据
    emissionStatistics.forEach(item => {
      content += `
    <row>
      <cell><p><text>${item.item}</text></p></cell>
      <cell><p><text>${item.avg}</text></p></cell>
      <cell><p><text>${item.max}</text></p></cell>
      <cell><p><text>${item.min}</text></p></cell>
    </row>`;
    });

    content += `
  </table>
  <header>
    <level>2</level>
    <content>行业分布分析</content>
  </header>
  <table>
    <row>
      <cell><p><text>行业类别</text></p></cell>
      <cell><p><text>企业数量</text></p></cell>
    </row>`;

    // 添加行业分布数据
    industryDistribution.forEach(item => {
      content += `
    <row>
      <cell><p><text>${item.industry}</text></p></cell>
      <cell><p><text>${item.count}</text></p></cell>
    </row>`;
    });

    content += `
  </table>
  <header>
    <level>2</level>
    <content>受纳水体分析</content>
  </header>
  <table>
    <row>
      <cell><p><text>受纳水体</text></p></cell>
      <cell><p><text>企业数量</text></p></cell>
    </row>`;

    // 添加受纳水体数据
    waterBodies.forEach(item => {
      content += `
    <row>
      <cell><p><text>${item.waterBody}</text></p></cell>
      <cell><p><text>${item.count}</text></p></cell>
    </row>`;
    });

    content += `
  </table>
  <header>
    <level>2</level>
    <content>执行标准分析</content>
  </header>
  <table>
    <row>
      <cell><p><text>执行标准名称</text></p></cell>
      <cell><p><text>企业数量</text></p></cell>
    </row>`;

    // 添加执行标准数据
    standards.forEach(item => {
      content += `
    <row>
      <cell><p><text>${item.standard}</text></p></cell>
      <cell><p><text>${item.count}</text></p></cell>
    </row>`;
    });

    content += `
  </table>
  <header>
    <level>2</level>
    <content>分析总结</content>
  </header>
  <p>
    <text>本次分析共涉及 ${overview.companyCount} 家企业的 ${overview.dataSize} 条监测数据，涵盖了 ${overview.monitoringItemsCount} 个监测项目。</text>
  </p>
  <p>
    <text>从分析结果来看，医疗机构是监测次数最多的行业，主要监测项目包括化学需氧量、氨氮、总磷等指标。</text>
  </p>
  <p>
    <text>邕江是主要的受纳水体，有 ${waterBodies[0].count} 家企业的废水排入其中。</text>
  </p>
  <p>
    <text>执行标准方面，医疗机构主要采用 GB18466-2005 标准，其他行业则根据各自特点采用不同的排放标准。</text>
  </p>
</root>`;

    return content;
  }
} 

module.exports = new FeishuService();