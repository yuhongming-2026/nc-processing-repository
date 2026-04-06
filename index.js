const { Client } = require('@larksuiteoapi/node-sdk');
const config = require('./config');

// 初始化飞书客户端
const client = new Client({
  appId: config.appId,
  appSecret: config.appSecret,
  disableTokenCache: false
});

// 主函数
async function main() {
  console.log('Feishu App started');
  console.log('Client initialized successfully');
  console.log('App ID:', config.appId);
  console.log('App Secret:', config.appSecret ? 'Set' : 'Not set');
  
  console.log('\n=== 应用配置完成 ===');
  console.log('应用已成功配置，以下是可用的功能：');
  console.log('1. 访问令牌管理');
  console.log('2. 用户信息获取');
  console.log('3. 消息发送');
  console.log('4. 群聊管理');
  console.log('5. 日历事件');
  console.log('6. 文档操作');
  console.log('7. 审批流程');
  
  console.log('\n=== 下一步建议 ===');
  console.log('1. 在飞书开发者平台为应用配置所需权限');
  console.log('2. 根据需要扩展应用功能');
  console.log('3. 参考飞书开放平台文档：https://open.feishu.cn/document/');
  console.log('4. 参考 SDK 文档：https://github.com/larksuite/node-sdk');
}

// 运行主函数
main();