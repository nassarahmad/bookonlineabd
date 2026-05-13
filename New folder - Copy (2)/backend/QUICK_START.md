# دليل البدء السريع - Backend API

## 🚀 تشغيل السيرفر

```bash
cd backend
node server.js
```

السيرفر سيعمل على: `http://localhost:5000`

## 🔑 معلومات تسجيل الدخول

- **كلمة مرور الأدمن**: `admin123`
- **JWT Secret**: موجود في ملف `.env`

## 📡 الـ Endpoints المتاحة

### 1. فحص صحة السيرفر
```
GET http://localhost:5000/health
```

### 2. إنشاء رسالة جديدة (عام)
```
POST http://localhost:5000/api/messages
Content-Type: application/json

{
  "text": "مبروك التخرج!",
  "name": "أحمد"
}
```

### 3. تسجيل دخول الأدمن
```
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "password": "admin123"
}
```

**الرد:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### 4. عرض جميع الرسائل (أدمن فقط)
```
GET http://localhost:5000/api/messages
Authorization: Bearer YOUR_TOKEN_HERE
```

### 5. حذف رسالة (أدمن فقط)
```
DELETE http://localhost:5000/api/messages/MESSAGE_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🧪 اختبار سريع باستخدام PowerShell

### إنشاء رسالة:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/messages" -Method Post -ContentType "application/json" -Body '{"text":"مبروك التخرج!","name":"أحمد"}'
```

### تسجيل دخول الأدمن:
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/login" -Method Post -ContentType "application/json" -Body '{"password":"admin123"}'
$token = $response.token
```

### عرض جميع الرسائل:
```powershell
$headers = @{"Authorization" = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:5000/api/messages" -Method Get -Headers $headers
```

### حذف رسالة:
```powershell
$headers = @{"Authorization" = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:5000/api/messages/MESSAGE_ID" -Method Delete -Headers $headers
```

## 📝 ملاحظات مهمة

1. **MongoDB**: تأكد من تشغيل MongoDB قبل تشغيل السيرفر
2. **ملف .env**: جميع الإعدادات موجودة في ملف `.env`
3. **منع التكرار**: كل IP يمكنه إرسال رسالة واحدة فقط
4. **Rate Limiting**: 100 طلب كل 15 دقيقة لكل IP
5. **Token Expiration**: الـ token صالح لمدة 24 ساعة

## 🔧 تغيير كلمة مرور الأدمن

لتوليد hash جديد لكلمة المرور:

```bash
node -e "console.log(require('bcryptjs').hashSync('كلمة_المرور_الجديدة', 10))"
```

ثم ضع الـ hash في ملف `.env` في متغير `ADMIN_PASSWORD_HASH`

## ✅ التحقق من عمل السيرفر

جميع الـ endpoints تم اختبارها وتعمل بنجاح:
- ✅ Health check
- ✅ إنشاء رسالة
- ✅ تسجيل دخول الأدمن
- ✅ عرض الرسائل (بصلاحيات)
- ✅ حذف رسالة (بصلاحيات)
- ✅ منع التكرار من نفس الـ IP
- ✅ Rate limiting
- ✅ CORS
- ✅ JWT Authentication

## 🌐 للنشر على الإنترنت

راجع ملف `README.md` للحصول على تعليمات النشر على:
- MongoDB Atlas (قاعدة البيانات)
- Heroku / Railway / Vercel (السيرفر)
