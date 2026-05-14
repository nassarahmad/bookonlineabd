// ====================================
// API Configuration
// ====================================
// للتطوير المحلي: http://localhost:5000/api
// للإنتاج: https://bookonlineabd.onrender.com/api
const API_BASE_URL = 'https://bookonlineabd.onrender.com/api';

// ====================================
// User Functions (للزوار)
// ====================================

/**
 * إرسال رسالة جديدة
 */
async function sendMessageToAPI(text, name) {
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
      console.log('✅ تم إرسال الرسالة بنجاح:', data.message);
      alert('تم إرسال رسالتك بنجاح! 🎉');
      return data.message;
    } else {
      // معالجة الأخطاء
      if (response.status === 400) {
        alert('الرجاء التأكد من البيانات المدخلة');
      } else {
        alert('حدث خطأ، الرجاء المحاولة مرة أخرى');
      }
      return null;
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
    return null;
  }
}

// ====================================
// Admin Functions (للأدمن)
// ====================================

/**
 * تسجيل دخول الأدمن
 */
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
      console.log('✅ تم تسجيل الدخول بنجاح');
      alert('تم تسجيل الدخول بنجاح! 🎉');
      return data.token;
    } else {
      console.log('❌ كلمة المرور غير صحيحة');
      alert('كلمة المرور غير صحيحة ❌');
      return null;
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
    return null;
  }
}

/**
 * عرض جميع الرسائل (للأدمن فقط)
 */
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
      console.log(`✅ تم تحميل ${data.count} رسالة`);
      return data.messages;
    } else {
      if (response.status === 401 || response.status === 403) {
        alert('انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مرة أخرى');
        sessionStorage.removeItem('adminToken');
      }
      return null;
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
    return null;
  }
}

/**
 * حذف رسالة (للأدمن فقط)
 */
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
      console.log('✅ تم حذف الرسالة بنجاح');
      alert('تم حذف الرسالة بنجاح ✓');
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
    console.error('❌ خطأ في الاتصال:', error);
    alert('حدث خطأ في الاتصال بالسيرفر');
    return false;
  }
}

/**
 * تسجيل خروج الأدمن
 */
function adminLogout() {
  sessionStorage.removeItem('adminToken');
  console.log('✅ تم تسجيل الخروج');
  alert('تم تسجيل الخروج بنجاح');
}

/**
 * التحقق من تسجيل دخول الأدمن
 */
function isAdminLoggedIn() {
  return sessionStorage.getItem('adminToken') !== null;
}

// ====================================
// Export functions (if using modules)
// ====================================
// Uncomment if using ES6 modules
// export { sendMessageToAPI, adminLogin, getAllMessages, deleteMessage, adminLogout, isAdminLoggedIn };
