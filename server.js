const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static('public'));

// 模拟知识库数据
const knowledgeBase = [
  {
    id: 'q1',
    question: '如何查看我的保养进度？',
    answer: '您可以在APP首页点击"我的车辆"进入详情页面，在"保养状态"卡片中查看各项保养进度。包括制动液、冷却液、空调滤芯等项目的剩余里程和时间。'
  },
  {
    id: 'q2',
    question: '保险即将到期如何续保？',
    answer: '当您的保险即将到期（前30天）时，我们会在APP首页提醒您续保。您可以点击提醒进入续保页面，选择保险公司和险种，也可以联系专属服务顾问协助办理。'
  },
  {
    id: 'q3',
    question: '车机系统如何升级？',
    answer: '当有新版本OTA推送时，车辆联网后会自动下载升级包。您可以在APP的"车辆设置-系统更新"中查看升级进度。升级过程大约需要30分钟，建议在停车状态下进行。'
  },
  {
    id: 'q4',
    question: '如何预约试驾？',
    answer: '您可以在APP首页点击"预约试驾"，选择心仪的车型和试驾门店，选择预约时间后提交即可。我们的工作人员会在24小时内与您确认预约详情。'
  },
  {
    id: 'q5',
    question: '车辆有故障报警怎么办？',
    answer: '当车辆发生碰撞或故障报警时，系统会第一时间推送消息到您的APP。您可以点击查看具体报警信息，如有需要可以一键联系道路救援或专属服务顾问。'
  },
  {
    id: 'q6',
    question: '如何绑定我的车辆？',
    answer: '提车后，使用购车时绑定的手机号登录APP，在"添加车辆"页面输入车架号（VIN码）即可完成绑定。VIN码位于行驶证或副驾驶座椅下方。'
  },
  {
    id: 'q7',
    question: '充电桩如何安装？',
    answer: '如果您需要安装家用充电桩，可以在APP"我的订单-充电桩安装"中提交申请。我们的工作人员会联系您确认安装条件，并安排专业人员上门安装。'
  },
  {
    id: 'q8',
    question: '专属服务群是什么？',
    answer: '专属服务群是为您配置的专属客服团队群组，包含服务顾问、技术专家等成员。您可以在APP"我的-专属服务"中查看和联系您的专属服务团队。'
  },
  {
    id: 'q9',
    question: '如何查看我的维修进度？',
    answer: '车辆进店维修后，您可以在APP"服务-我的工单"中实时查看维修进度。当状态更新时，系统会推送消息通知您。'
  },
  {
    id: 'q10',
    question: 'app如何远程控车？',
    answer: '在APP的"车辆控制"页面，您可以远程开关车门、空调、鸣笛寻车等。首次使用需要在车内中控屏上进行授权确认。'
  },
  {
    id: 'q11',
    question: '如何查看车辆位置？',
    answer: '在APP地图页面点击"车辆位置"即可查看车辆当前位置。该功能需要车辆处于联网状态，每分钟更新一次位置信息。'
  },
  {
    id: 'q12',
    question: '积分有什么用？',
    answer: '您可以通过APP签到、完成任务、社区互动等方式获得积分。积分可以兑换充电额度、周边礼品、维保优惠券等。详情请查看"我的-积分商城"。'
  },
  {
    id: 'q13',
    question: '如何联系专属顾问？',
    answer: '在APP"我的-专属服务"中，您可以一键拨打专属顾问电话或在专属服务群中留言。您的专属顾问会第一时间响应您的需求。'
  },
  {
    id: 'q14',
    question: '车险多少钱？',
    answer: '车险价格根据车型、投保险种、是否有出险记录等因素综合确定。您可以在APP"保险-车险报价"中输入信息获取精准报价，也可以联系专属顾问协助办理。'
  },
  {
    id: 'q15',
    question: '什么时候可以提车？',
    answer: '提车时间会根据您的订单情况和生产进度确定。您可以在APP"订单-交付计划"中查看预计交付时间，或联系您的交付顾问了解具体进度。'
  }
];

// 根据用户特征模拟推荐算法
function recommendQuestions(userFeatures) {
  const { carModel, userStage, hasServiceOrder, hasWarning, daysToExpiry } = userFeatures;
  
  let scores = knowledgeBase.map(q => ({ ...q, score: 0 }));
  
  // 车型相关问题
  if (carModel) {
    scores.forEach(q => {
      if (q.question.includes('保养') || q.question.includes('保险') || q.question.includes('车机')) {
        q.score += 10;
      }
    });
  }
  
  // 用户阶段相关
  if (userStage === 'new') {
    // 新用户
    scores.forEach(q => {
      if (q.question.includes('绑定') || q.question.includes('试驾') || q.question.includes('提车')) {
        q.score += 15;
      }
      if (q.question.includes('充电桩') || q.question.includes('远程')) {
        q.score += 10;
      }
    });
  } else if (userStage === 'old') {
    // 老用户
    scores.forEach(q => {
      if (q.question.includes('保养') || q.question.includes('维修') || q.question.includes('保险')) {
        q.score += 15;
      }
    });
  }
  
  // 有未完成服务单
  if (hasServiceOrder) {
    scores.forEach(q => {
      if (q.question.includes('维修') || q.question.includes('进度')) {
        q.score += 20;
      }
    });
  }
  
  // 有故障报警
  if (hasWarning) {
    scores.forEach(q => {
      if (q.question.includes('故障') || q.question.includes('报警')) {
        q.score += 25;
      }
    });
  }
  
  // 保险即将到期
  if (daysToExpiry && daysToExpiry <= 30) {
    scores.forEach(q => {
      if (q.question.includes('保险')) {
        q.score += 25;
      }
    });
  }
  
  // 按分数排序，返回前10条
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((q, index) => ({ ...q, rank: index + 1 }));
}

// API: 获取用户特征（模拟）
app.get('/api/user-features', (req, res) => {
  // 模拟不同用户
  const users = [
    { id: 'user1', name: '新用户 SU7', features: { carModel: 'su7', userStage: 'new', hasServiceOrder: false, hasWarning: false, daysToExpiry: null } },
    { id: 'user2', name: '老用户 SU7 Max', features: { carModel: 'su7 Max', userStage: 'old', hasServiceOrder: true, hasWarning: false, daysToExpiry: null } },
    { id: 'user3', name: '有报警用户', features: { carModel: 'yu7', userStage: 'old', hasServiceOrder: false, hasWarning: true, daysToExpiry: null } },
    { id: 'user4', name: '保险到期用户', features: { carModel: 'su7', userStage: 'old', hasServiceOrder: false, hasWarning: false, daysToExpiry: 15 } },
  ];
  
  res.json(users);
});

// API: 推荐问题
app.post('/api/recommend', (req, res) => {
  const userFeatures = req.body || {};
  const recommendations = recommendQuestions(userFeatures);
  res.json({ success: true, data: recommendations });
});

// API: 获取问题答案
app.get('/api/question/:id', (req, res) => {
  const { id } = req.params;
  const q = knowledgeBase.find(item => item.id === id);
  if (q) {
    res.json({ success: true, data: q });
  } else {
    res.status(404).json({ success: false, error: '问题不存在' });
  }
});

// API: 模拟发送消息
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  // 模拟AI回复
  const responses = [
    '感谢您的咨询，这个问题我帮您转接专属顾问处理。',
    '您可以尝试在APP中查看相关功能入口。',
    '关于这个问题，我为您推荐以下解决方案...',
    '您可以拨打我们的客服热线400-XXX-XXXX获取帮助。'
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({
    success: true,
    data: {
      type: 'agent',
      content: randomResponse,
      timestamp: new Date().toISOString()
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`猜你想问 Demo 服务已启动:`);
  console.log(`- Local:   http://localhost:${PORT}`);
  console.log(`- Network: http://10.220.35.85:${PORT}`);
});
