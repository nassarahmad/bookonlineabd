# دليل ربط الفرونت إند مع الـ Backend

## 📋 نظرة عامة

هذا الدليل يشرح كيفية ربط الفرونت إند الموجود مع الـ Backend API.

## 🔗 Base URL

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 📝 أمثلة الاستخدام في JavaScript

### 1. إرسال رسالة جديدة

```javascript
async function sendMessage(text, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        name: name || undefined
      })
    });

    const data = await response.json();

    if (data.success) {
      alert('تم إرسال رسالتك بنجاح!');
      return data.message;
    } else {
      // معالجة الأخطاء
      if (response.status === 403) {
        alert('لقد أرسلت رسالة من قبل!');
      } else if (response.status === 400) {
        alert('الرجاء التأكد من البيانات المدخلة');
      } else {
        alert('حدث خطأ، الرجاء المحاولة مرة أخرى');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
  }
}
```

### 2. تسجيل دخول الأدمن

```javascript
async function adminLogin(password) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (data.success) {
      // حفظ الـ token في sessionStorage
      sessionStorage.setItem('adminToken', data.token);
      alert('تم تسجيل الدخول بنجاح!');
      return data.token;
    } else {
      alert('كلمة المرور غير صحيحة');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
    return null;
  }
}
```

### 3. عرض جميع الرسائل (للأدمن)

```javascript
async function getAllMessages() {
  try {
    const token = sessionStorage.getItem('adminToken');
    
    if (!token) {
      alert('الرجاء تسجيل الدخول أولاً');
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      return data.messages;
    } else {
      if (response.status === 401 || response.status === 403) {
        alert('انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مرة أخرى');
        sessionStorage.removeItem('adminToken');
      }
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
    return null;
  }
}
```

### 4. حذف رسالة (للأدمن)

```javascript
async function deleteMessage(messageId) {
  try {
    const token = sessionStorage.getItem('adminToken');
    
    if (!token) {
      alert('الرجاء تسجيل الدخول أولاً');
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      alert('تم حذف الرسالة بنجاح');
      return true;
    } else {
      if (response.status === 404) {
        alert('الرسالة غير موجودة');
      } else if (response.status === 401 || response.status === 403) {
        alert('انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مرة أخرى');
        sessionStorage.removeItem('adminToken');
      }
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
    return false;
  }
}
```

### 5. التحقق من تسجيل دخول الأدمن

```javascript
function isAdminLoggedIn() {
  const token = sessionStorage.getItem('adminToken');
  return token !== null;
}

function logout() {
  sessionStorage.removeItem('adminToken');
  alert('تم تسجيل الخروج بنجاح');
}
```

## 🎨 مثال كامل لنموذج إرسال رسالة

```html
<form id="messageForm">
  <input type="text" id="nameInput" placeholder="الاسم (اختياري)" maxlength="50">
  <textarea id="textInput" placeholder="رسالتك" maxlength="500" required></textarea>
  <button type="submit">إرسال</button>
</form>

<script>
const API_BASE_URL = 'http://localhost:5000/api';

document.getElementById('messageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('nameInput').value.trim();
  const text = document.getElementById('textInput').value.trim();
  
  if (!text) {
    alert('الرجاء كتابة رسالة');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        name: name || undefined
      })
    });

    const data = await response.json();

    if (data.success) {
      alert('تم إرسال رسالتك بنجاح! 🎉');
      document.getElementById('messageForm').reset();
    } else {
      if (response.status === 403) {
        alert('لقد أرسلت رسالة من قبل! ❌');
      } else if (response.status === 400) {
        alert('الرجاء التأكد من البيانات المدخلة');
      } else {
        alert('حدث خطأ، الرجاء المحاولة مرة أخرى');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
  }
});
</script>
```

## 🔐 مثال كامل لصفحة الأدمن

```html
<!-- صفحة تسجيل الدخول -->
<div id="loginSection">
  <h2>تسجيل دخول الأدمن</h2>
  <form id="loginForm">
    <input type="password" id="passwordInput" placeholder="كلمة المرور" required>
    <button type="submit">دخول</button>
  </form>
</div>

<!-- صفحة عرض الرسائل -->
<div id="messagesSection" style="display: none;">
  <h2>الرسائل</h2>
  <button id="logoutBtn">تسجيل خروج</button>
  <div id="messagesList"></div>
</div>

<script>
const API_BASE_URL = 'http://localhost:5000/api';

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const password = document.getElementById('passwordInput').value;
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (data.success) {
      sessionStorage.setItem('adminToken', data.token);
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('messagesSection').style.display = 'block';
      loadMessages();
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
  }
});

// تحميل الرسائل
async function loadMessages() {
  const token = sessionStorage.getItem('adminToken');
  
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      displayMessages(data.messages);
    } else {
      alert('حدث خطأ في تحميل الرسائل');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
  }
}

// عرض الرسائل
function displayMessages(messages) {
  const messagesList = document.getElementById('messagesList');
  messagesList.innerHTML = '';
  
  if (messages.length === 0) {
    messagesList.innerHTML = '<p>لا توجد رسائل</p>';
    return;
  }
  
  messages.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.innerHTML = `
      <p><strong>${message.name || 'مجهول'}</strong></p>
      <p>${message.text}</p>
      <p><small>${new Date(message.timestamp).toLocaleString('ar-EG')}</small></p>
      <button onclick="deleteMessage('${message._id}')">حذف</button>
    `;
    messagesList.appendChild(messageDiv);
  });
}

// حذف رسالة
async function deleteMessage(messageId) {
  if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
    return;
  }
  
  const token = sessionStorage.getItem('adminToken');
  
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      alert('تم حذف الرسالة بنجاح');
      loadMessages(); // إعادة تحميل الرسائل
    } else {
      alert('حدث خطأ في حذف الرسالة');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
  }
}

// تسجيل الخروج
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('adminToken');
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('messagesSection').style.display = 'none';
  alert('تم تسجيل الخروج بنجاح');
});

// التحقق من تسجيل الدخول عند تحميل الصفحة
window.addEventListener('load', () => {
  const token = sessionStorage.getItem('adminToken');
  if (token) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('messagesSection').style.display = 'block';
    loadMessages();
  }
});
</script>
```

## ⚠️ ملاحظات مهمة

1. **CORS**: السيرفر مُعد للسماح بجميع الطلبات في وضع التطوير
2. **Base URL**: غيّر `http://localhost:5000/api` إلى URL السيرفر الفعلي عند النشر
3. **Token Storage**: الـ token محفوظ في `sessionStorage` (يُحذف عند إغلاق المتصفح)
4. **Error Handling**: تأكد من معالجة جميع الأخطاء المحتملة
5. **Validation**: السيرفر يتحقق من صحة البيانات، لكن من الأفضل إضافة validation في الفرونت إند أيضاً

## 🚀 للنشر على الإنترنت

عند النشر، غيّر الـ Base URL إلى:

```javascript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

وتأكد من تحديث متغير `FRONTEND_URL` في ملف `.env` على السيرفر.
