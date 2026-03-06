// 猜你想问 Demo - 前端逻辑

let currentQuestions = [];
let currentUserFeatures = null;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadUserFeatures();
  setupEventListeners();
});

// 加载用户特征
async function loadUserFeatures() {
  try {
    const response = await fetch('/api/user-features');
    const users = await response.json();
    
    // 默认选择第一个用户
    selectUser(0);
  } catch (error) {
    console.error('加载用户特征失败:', error);
  }
}

// 选择用户
async function selectUser(index) {
  try {
    const response = await fetch('/api/user-features');
    const users = await response.json();
    
    currentUserFeatures = users[index].features;
    console.log('当前用户特征:', currentUserFeatures);
    
    // 获取推荐问题
    await fetchRecommendations();
  } catch (error) {
    console.error('切换用户失败:', error);
  }
}

// 获取推荐问题
async function fetchRecommendations() {
  const questionList = document.getElementById('questionList');
  questionList.innerHTML = '<div class="loading">正在智能推荐...</div>';
  
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentUserFeatures)
    });
    
    const result = await response.json();
    
    if (result.success) {
      currentQuestions = result.data;
      renderQuestions(result.data);
    }
  } catch (error) {
    console.error('获取推荐失败:', error);
    questionList.innerHTML = '<div class="loading">加载失败，请刷新</div>';
  }
}

// 渲染问题列表
function renderQuestions(questions) {
  const questionList = document.getElementById('questionList');
  
  if (!questions || questions.length === 0) {
    questionList.innerHTML = '<div class="loading">暂无推荐问题</div>';
    return;
  }
  
  questionList.innerHTML = questions.map(q => `
    <div class="question-item" data-id="${q.id}" onclick="showAnswer('${q.id}')">
      <span class="question-rank">${q.rank}</span>
      <span class="question-text">${q.question}</span>
      <span class="question-arrow">›</span>
    </div>
  `).join('');
}

// 显示答案 - 在聊天框中以对话形式出现
async function showAnswer(questionId) {
  const question = currentQuestions.find(q => q.id === questionId);
  if (!question) return;
  
  const chatArea = document.getElementById('chatArea');
  
  // 添加用户点击的问题作为引用
  const questionRefDiv = document.createElement('div');
  questionRefDiv.className = 'message question-ref';
  questionRefDiv.innerHTML = `
    <div class="avatar"></div>
    <div class="bubble">
      <p>${question.question}</p>
    </div>
  `;
  chatArea.appendChild(questionRefDiv);
  
  // 滚动到底部
  scrollToBottom();
  
  // 添加助手回答（带头像）
  const answerDiv = document.createElement('div');
  answerDiv.className = 'message agent';
  answerDiv.innerHTML = `
    <div class="avatar">
      <div class="avatar-inner">
        <div class="avatar-hair"></div>
        <div class="avatar-face">
          <div class="avatar-eyes">
            <div class="avatar-eye"></div>
            <div class="avatar-eye"></div>
          </div>
          <div class="avatar-smile"></div>
        </div>
        <div class="avatar-ear left"></div>
        <div class="avatar-ear right"></div>
        <div class="avatar-body"></div>
      </div>
    </div>
    <div class="bubble">
      <div class="loading">正在思考...</div>
    </div>
  `;
  chatArea.appendChild(answerDiv);
  scrollToBottom();
  
  // 获取真实答案
  try {
    const response = await fetch(`/api/question/${questionId}`);
    const result = await response.json();
    
    if (result.success) {
      // 更新答案内容
      answerDiv.querySelector('.bubble').innerHTML = `<p>${result.data.answer}</p>`;
    } else {
      answerDiv.querySelector('.bubble').innerHTML = '<p>抱歉，答案加载失败</p>';
    }
  } catch (error) {
    console.error('获取答案失败:', error);
    answerDiv.querySelector('.bubble').innerHTML = '<p>网络错误，请稍后重试</p>';
  }
  
  scrollToBottom();
}

// 发送消息
async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // 添加用户消息
  addMessage(message, 'user');
  input.value = '';
  
  // 滚动到底部
  scrollToBottom();
  
  // 模拟助手正在输入
  const chatArea = document.getElementById('chatArea');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message agent';
  typingDiv.innerHTML = `
    <div class="avatar">
      <div class="avatar-inner">
        <div class="avatar-hair"></div>
        <div class="avatar-face">
          <div class="avatar-eyes">
            <div class="avatar-eye"></div>
            <div class="avatar-eye"></div>
          </div>
          <div class="avatar-smile"></div>
        </div>
        <div class="avatar-ear left"></div>
        <div class="avatar-ear right"></div>
        <div class="avatar-body"></div>
      </div>
    </div>
    <div class="bubble">
      <div class="loading">正在输入...</div>
    </div>
  `;
  chatArea.appendChild(typingDiv);
  scrollToBottom();
  
  // 模拟AI回复
  setTimeout(async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      const result = await response.json();
      
      // 移除正在输入提示
      typingDiv.remove();
      
      if (result.success) {
        addMessage(result.data.content, 'agent');
      } else {
        addMessage('抱歉，请稍后再试', 'agent');
      }
    } catch (error) {
      typingDiv.remove();
      addMessage('网络错误，请稍后重试', 'agent');
    }
    
    scrollToBottom();
  }, 800);
}

// 添加消息到聊天区域
function addMessage(content, type) {
  const chatArea = document.getElementById('chatArea');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  let avatarContent = '';
  if (type === 'agent') {
    avatarContent = `
      <div class="avatar">
        <div class="avatar-inner">
          <div class="avatar-hair"></div>
          <div class="avatar-face">
            <div class="avatar-eyes">
              <div class="avatar-eye"></div>
              <div class="avatar-eye"></div>
            </div>
            <div class="avatar-smile"></div>
          </div>
          <div class="avatar-ear left"></div>
          <div class="avatar-ear right"></div>
          <div class="avatar-body"></div>
        </div>
      </div>
    `;
  } else {
    avatarContent = '<div class="avatar"></div>';
  }
  
  messageDiv.innerHTML = `
    ${avatarContent}
    <div class="bubble">
      <p>${content}</p>
    </div>
  `;
  
  chatArea.appendChild(messageDiv);
}

// 滚动到聊天区域底部
function scrollToBottom() {
  const chatArea = document.getElementById('chatArea');
  setTimeout(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  }, 100);
}

// 设置事件监听
function setupEventListeners() {
  // 用户选择
  document.getElementById('userSelect').addEventListener('change', (e) => {
    selectUser(e.target.value);
  });
  
  // 刷新按钮 - 重新获取推荐
  document.getElementById('refreshBtn').addEventListener('click', () => {
    fetchRecommendations();
  });
  
  // 发送按钮
  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  
  // 回车发送
  document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}
