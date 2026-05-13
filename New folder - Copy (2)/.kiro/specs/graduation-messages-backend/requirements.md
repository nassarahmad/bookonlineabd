# Requirements Document

## Introduction

هذا المستند يحدد متطلبات إضافة backend لموقع حفل التخرج باستخدام Node.js و MongoDB. الهدف هو استبدال نظام التخزين المحلي (localStorage) بنظام تخزين دائم على الخادم يسمح بمشاركة الرسائل عبر المتصفحات والأجهزة المختلفة، مع الحفاظ على نظام المصادقة للأدمن والتحكم في عدد الرسائل لكل مستخدم.

## Glossary

- **API_Server**: خادم Node.js/Express الذي يوفر REST API endpoints
- **Database**: قاعدة بيانات MongoDB لتخزين الرسائل
- **Message**: رسالة تهنئة تحتوي على نص، اسم اختياري، ووقت الإرسال
- **Admin**: مستخدم مصادق يمتلك صلاحيات عرض وحذف جميع الرسائل
- **Visitor**: مستخدم عادي يمكنه إرسال رسالة واحدة فقط
- **Client_IP**: عنوان IP الخاص بالزائر لتتبع عدد الرسائل
- **Admin_Token**: رمز JWT يُستخدم للمصادقة والتحقق من صلاحيات الأدمن
- **Frontend**: التطبيق الأمامي (HTML/JavaScript) الموجود حالياً
- **CORS_Middleware**: وسيط Express للسماح بالطلبات من نطاقات مختلفة

## Requirements

### Requirement 1: إنشاء REST API Server

**User Story:** كمطور، أريد إنشاء REST API server باستخدام Node.js و Express، حتى يتمكن الـ frontend من التواصل مع الـ backend لإدارة الرسائل.

#### Acceptance Criteria

1. THE API_Server SHALL استخدام Express framework للتعامل مع HTTP requests
2. THE API_Server SHALL الاستماع على port قابل للتكوين عبر environment variables
3. THE API_Server SHALL تسجيل جميع الطلبات الواردة في console مع timestamp
4. WHEN THE API_Server يبدأ بنجاح، THE API_Server SHALL طباعة رسالة تأكيد تحتوي على رقم الـ port
5. THE API_Server SHALL استخدام JSON كصيغة لتبادل البيانات

### Requirement 2: الاتصال بقاعدة البيانات MongoDB

**User Story:** كمطور، أريد الاتصال بقاعدة بيانات MongoDB، حتى يتم تخزين الرسائل بشكل دائم.

#### Acceptance Criteria

1. THE API_Server SHALL الاتصال بـ MongoDB باستخدام Mongoose library
2. THE API_Server SHALL قراءة connection string من environment variables
3. WHEN الاتصال بـ Database ينجح، THE API_Server SHALL طباعة رسالة تأكيد
4. IF الاتصال بـ Database يفشل، THEN THE API_Server SHALL طباعة رسالة خطأ وإيقاف التشغيل
5. THE Database SHALL دعم MongoDB Atlas (cloud) و MongoDB محلي

### Requirement 3: تعريف Message Schema

**User Story:** كمطور، أريد تعريف schema للرسائل في MongoDB، حتى يتم تخزين البيانات بشكل منظم ومتسق.

#### Acceptance Criteria

1. THE Message Schema SHALL تحتوي على حقل name من نوع String (اختياري)
2. THE Message Schema SHALL تحتوي على حقل text من نوع String (إلزامي)
3. THE Message Schema SHALL تحتوي على حقل timestamp من نوع Date (إلزامي، قيمة افتراضية: الوقت الحالي)
4. THE Message Schema SHALL تحتوي على حقل ipAddress من نوع String (إلزامي)
5. THE Message Schema SHALL التحقق من أن حقل text لا يتجاوز 500 حرف
6. THE Message Schema SHALL التحقق من أن حقل name لا يتجاوز 50 حرف

### Requirement 4: إضافة رسالة جديدة (POST Endpoint)

**User Story:** كزائر، أريد إرسال رسالة تهنئة، حتى أشارك الخريج فرحته.

#### Acceptance Criteria

1. THE API_Server SHALL توفير POST endpoint على المسار `/api/messages`
2. WHEN طلب POST يُرسل إلى `/api/messages`، THE API_Server SHALL استخراج Client_IP من الطلب
3. WHEN طلب POST يُرسل من Client_IP قام بإرسال رسالة من قبل، THE API_Server SHALL إرجاع status code 403 مع رسالة خطأ
4. WHEN طلب POST يحتوي على text فارغ، THE API_Server SHALL إرجاع status code 400 مع رسالة خطأ
5. WHEN طلب POST يحتوي على text أطول من 500 حرف، THE API_Server SHALL إرجاع status code 400 مع رسالة خطأ
6. WHEN طلب POST صالح يُرسل، THE API_Server SHALL حفظ Message في Database
7. WHEN Message يُحفظ بنجاح، THE API_Server SHALL إرجاع status code 201 مع بيانات Message المحفوظة
8. IF حدث خطأ أثناء الحفظ، THEN THE API_Server SHALL إرجاع status code 500 مع رسالة خطأ

### Requirement 5: جلب جميع الرسائل (GET Endpoint للأدمن)

**User Story:** كأدمن، أريد عرض جميع الرسائل المرسلة، حتى أتمكن من مراجعتها.

#### Acceptance Criteria

1. THE API_Server SHALL توفير GET endpoint على المسار `/api/messages`
2. WHEN طلب GET يُرسل إلى `/api/messages` بدون Admin_Token، THE API_Server SHALL إرجاع status code 401 مع رسالة خطأ
3. WHEN طلب GET يُرسل إلى `/api/messages` مع Admin_Token غير صالح، THE API_Server SHALL إرجاع status code 403 مع رسالة خطأ
4. WHEN طلب GET يُرسل إلى `/api/messages` مع Admin_Token صالح، THE API_Server SHALL جلب جميع Messages من Database
5. THE API_Server SHALL ترتيب Messages حسب timestamp بترتيب تنازلي (الأحدث أولاً)
6. WHEN Messages يتم جلبها بنجاح، THE API_Server SHALL إرجاع status code 200 مع array من Messages
7. IF حدث خطأ أثناء الجلب، THEN THE API_Server SHALL إرجاع status code 500 مع رسالة خطأ

### Requirement 6: حذف رسالة (DELETE Endpoint للأدمن)

**User Story:** كأدمن، أريد حذف رسالة غير مناسبة، حتى أحافظ على جودة المحتوى.

#### Acceptance Criteria

1. THE API_Server SHALL توفير DELETE endpoint على المسار `/api/messages/:id`
2. WHEN طلب DELETE يُرسل بدون Admin_Token، THE API_Server SHALL إرجاع status code 401 مع رسالة خطأ
3. WHEN طلب DELETE يُرسل مع Admin_Token غير صالح، THE API_Server SHALL إرجاع status code 403 مع رسالة خطأ
4. WHEN طلب DELETE يُرسل مع message ID غير موجود، THE API_Server SHALL إرجاع status code 404 مع رسالة خطأ
5. WHEN طلب DELETE يُرسل مع Admin_Token صالح و message ID صالح، THE API_Server SHALL حذف Message من Database
6. WHEN Message يُحذف بنجاح، THE API_Server SHALL إرجاع status code 200 مع رسالة تأكيد
7. IF حدث خطأ أثناء الحذف، THEN THE API_Server SHALL إرجاع status code 500 مع رسالة خطأ

### Requirement 7: نظام مصادقة الأدمن

**User Story:** كأدمن، أريد تسجيل الدخول بكلمة سر، حتى أحصل على صلاحيات إدارة الرسائل.

#### Acceptance Criteria

1. THE API_Server SHALL توفير POST endpoint على المسار `/api/admin/login`
2. WHEN طلب POST يُرسل إلى `/api/admin/login` مع password صحيحة، THE API_Server SHALL إنشاء Admin_Token باستخدام JWT
3. THE Admin_Token SHALL يحتوي على role: "admin" و expiration time
4. THE Admin_Token SHALL يكون صالحاً لمدة 24 ساعة
5. WHEN password صحيحة، THE API_Server SHALL إرجاع status code 200 مع Admin_Token
6. WHEN password غير صحيحة، THE API_Server SHALL إرجاع status code 401 مع رسالة خطأ
7. THE API_Server SHALL قراءة admin password من environment variables
8. THE API_Server SHALL استخدام bcrypt لمقارنة passwords بشكل آمن

### Requirement 8: Middleware للتحقق من Admin Token

**User Story:** كمطور، أريد middleware للتحقق من Admin_Token، حتى أحمي endpoints الخاصة بالأدمن.

#### Acceptance Criteria

1. THE API_Server SHALL توفير middleware function للتحقق من Admin_Token
2. WHEN طلب يحتوي على Authorization header بصيغة "Bearer [token]"، THE Middleware SHALL استخراج token
3. WHEN token غير موجود، THE Middleware SHALL إرجاع status code 401 مع رسالة خطأ
4. WHEN token غير صالح أو منتهي الصلاحية، THE Middleware SHALL إرجاع status code 403 مع رسالة خطأ
5. WHEN token صالح، THE Middleware SHALL إضافة بيانات Admin إلى request object والسماح بالمتابعة
6. THE Middleware SHALL استخدام JWT library للتحقق من token

### Requirement 9: تفعيل CORS

**User Story:** كمطور، أريد تفعيل CORS، حتى يتمكن الـ frontend من إرسال طلبات إلى الـ API من نطاق مختلف.

#### Acceptance Criteria

1. THE API_Server SHALL استخدام CORS_Middleware من cors package
2. THE CORS_Middleware SHALL السماح بالطلبات من جميع النطاقات في بيئة التطوير
3. WHERE في بيئة الإنتاج، THE CORS_Middleware SHALL السماح بالطلبات من نطاقات محددة فقط
4. THE CORS_Middleware SHALL السماح بـ HTTP methods: GET, POST, DELETE, OPTIONS
5. THE CORS_Middleware SHALL السماح بـ headers: Content-Type, Authorization

### Requirement 10: تتبع عدد الرسائل لكل مستخدم

**User Story:** كمطور، أريد منع المستخدمين من إرسال أكثر من رسالة واحدة، حتى أحافظ على جودة المحتوى.

#### Acceptance Criteria

1. WHEN طلب POST يُرسل إلى `/api/messages`، THE API_Server SHALL استخراج Client_IP
2. THE API_Server SHALL البحث في Database عن Messages مرسلة من نفس Client_IP
3. WHEN يوجد Message مرسلة من نفس Client_IP، THE API_Server SHALL إرجاع status code 403 مع رسالة "لقد قمت بإرسال رسالة من قبل"
4. WHEN لا يوجد Message مرسلة من نفس Client_IP، THE API_Server SHALL السماح بإضافة Message جديدة
5. THE API_Server SHALL استخدام header `x-forwarded-for` أو `req.ip` لاستخراج Client_IP

### Requirement 11: تعديل Frontend للاتصال بالـ API

**User Story:** كمطور، أريد تعديل الـ frontend ليتصل بالـ API بدلاً من localStorage، حتى تُحفظ الرسائل بشكل دائم.

#### Acceptance Criteria

1. THE Frontend SHALL استبدال localStorage.setItem بـ fetch POST request إلى `/api/messages`
2. THE Frontend SHALL استبدال localStorage.getItem بـ fetch GET request إلى `/api/messages`
3. WHEN Admin يسجل الدخول، THE Frontend SHALL حفظ Admin_Token في sessionStorage
4. WHEN Admin يطلب عرض الرسائل، THE Frontend SHALL إرسال Admin_Token في Authorization header
5. WHEN طلب POST ينجح، THE Frontend SHALL عرض رسالة نجاح
6. WHEN طلب POST يفشل بسبب "رسالة مرسلة من قبل"، THE Frontend SHALL عرض رسالة تنبيه مناسبة
7. WHEN طلب GET أو POST يفشل، THE Frontend SHALL عرض رسالة خطأ مناسبة
8. THE Frontend SHALL التعامل مع حالات الخطأ في الشبكة (network errors)

### Requirement 12: متغيرات البيئة (Environment Variables)

**User Story:** كمطور، أريد استخدام environment variables للإعدادات الحساسة، حتى أحافظ على أمان التطبيق.

#### Acceptance Criteria

1. THE API_Server SHALL قراءة PORT من environment variable (قيمة افتراضية: 5000)
2. THE API_Server SHALL قراءة MONGODB_URI من environment variable
3. THE API_Server SHALL قراءة ADMIN_PASSWORD من environment variable
4. THE API_Server SHALL قراءة JWT_SECRET من environment variable
5. THE API_Server SHALL قراءة NODE_ENV من environment variable (development أو production)
6. THE API_Server SHALL استخدام dotenv package لتحميل environment variables من ملف .env
7. WHEN environment variable مطلوبة غير موجودة، THE API_Server SHALL طباعة رسالة خطأ وإيقاف التشغيل

### Requirement 13: معالجة الأخطاء العامة

**User Story:** كمطور، أريد معالجة الأخطاء بشكل مركزي، حتى يتم التعامل مع جميع الأخطاء بشكل متسق.

#### Acceptance Criteria

1. THE API_Server SHALL توفير error handling middleware
2. WHEN خطأ يحدث في أي endpoint، THE Error_Middleware SHALL التقاط الخطأ
3. THE Error_Middleware SHALL تسجيل تفاصيل الخطأ في console
4. WHILE NODE_ENV يساوي "development"، THE Error_Middleware SHALL إرجاع stack trace في response
5. WHILE NODE_ENV يساوي "production"، THE Error_Middleware SHALL إرجاع رسالة خطأ عامة فقط
6. THE Error_Middleware SHALL إرجاع status code مناسب (400, 401, 403, 404, 500)

### Requirement 14: التحقق من صحة البيانات (Validation)

**User Story:** كمطور، أريد التحقق من صحة البيانات المرسلة، حتى أمنع إدخال بيانات غير صالحة.

#### Acceptance Criteria

1. WHEN طلب POST يُرسل إلى `/api/messages` بدون حقل text، THE API_Server SHALL إرجاع status code 400
2. WHEN طلب POST يحتوي على text فارغ أو يحتوي على مسافات فقط، THE API_Server SHALL إرجاع status code 400
3. WHEN طلب POST يحتوي على text أطول من 500 حرف، THE API_Server SHALL إرجاع status code 400
4. WHEN طلب POST يحتوي على name أطول من 50 حرف، THE API_Server SHALL إرجاع status code 400
5. THE API_Server SHALL استخدام express-validator أو Joi للتحقق من البيانات
6. WHEN validation يفشل، THE API_Server SHALL إرجاع array من رسائل الأخطاء

### Requirement 15: توثيق API (API Documentation)

**User Story:** كمطور، أريد توثيق API endpoints، حتى يسهل فهم واستخدام الـ API.

#### Acceptance Criteria

1. THE Project SHALL يحتوي على ملف README.md يشرح كيفية تشغيل الـ API
2. THE README SHALL يحتوي على قائمة بجميع endpoints مع HTTP methods
3. THE README SHALL يحتوي على أمثلة لـ request و response لكل endpoint
4. THE README SHALL يشرح كيفية إعداد environment variables
5. THE README SHALL يشرح كيفية تشغيل الـ API في بيئة التطوير والإنتاج
6. THE README SHALL يحتوي على معلومات حول المصادقة وكيفية الحصول على Admin_Token

### Requirement 16: هيكل المشروع (Project Structure)

**User Story:** كمطور، أريد هيكل مشروع منظم، حتى يسهل صيانة وتطوير الكود.

#### Acceptance Criteria

1. THE Project SHALL يحتوي على مجلد `backend` منفصل عن الـ frontend
2. THE Backend SHALL يحتوي على مجلد `models` لـ Mongoose schemas
3. THE Backend SHALL يحتوي على مجلد `routes` لـ API endpoints
4. THE Backend SHALL يحتوي على مجلد `middleware` لـ authentication و error handling
5. THE Backend SHALL يحتوي على مجلد `config` لإعدادات Database
6. THE Backend SHALL يحتوي على ملف `server.js` كنقطة دخول رئيسية
7. THE Backend SHALL يحتوي على ملف `.env.example` كمثال لـ environment variables
8. THE Backend SHALL يحتوي على ملف `.gitignore` يستثني `node_modules` و `.env`

### Requirement 17: Dependencies و Package.json

**User Story:** كمطور، أريد ملف package.json يحتوي على جميع dependencies، حتى يسهل تثبيت المشروع.

#### Acceptance Criteria

1. THE Backend SHALL يحتوي على ملف `package.json`
2. THE package.json SHALL يحتوي على dependencies: express, mongoose, cors, dotenv, jsonwebtoken, bcryptjs
3. THE package.json SHALL يحتوي على devDependencies: nodemon
4. THE package.json SHALL يحتوي على script "start" لتشغيل الـ server
5. THE package.json SHALL يحتوي على script "dev" لتشغيل الـ server مع nodemon
6. THE package.json SHALL يحتوي على معلومات المشروع: name, version, description, author

### Requirement 18: الأمان (Security)

**User Story:** كمطور، أريد تطبيق ممارسات أمان أساسية، حتى أحمي الـ API من الهجمات الشائعة.

#### Acceptance Criteria

1. THE API_Server SHALL استخدام helmet middleware لإضافة security headers
2. THE API_Server SHALL تحديد rate limiting لمنع spam requests
3. THE API_Server SHALL تنظيف user input لمنع XSS attacks
4. THE API_Server SHALL عدم إرجاع stack traces في بيئة الإنتاج
5. THE Admin_Password SHALL تُخزن كـ hash باستخدام bcrypt
6. THE JWT_SECRET SHALL يكون string عشوائي قوي (32 حرف على الأقل)
7. THE API_Server SHALL استخدام HTTPS في بيئة الإنتاج

### Requirement 19: اختبار الـ API (API Testing)

**User Story:** كمطور، أريد اختبار الـ API endpoints، حتى أتأكد من عملها بشكل صحيح.

#### Acceptance Criteria

1. THE Developer SHALL اختبار POST `/api/messages` باستخدام Postman أو curl
2. THE Developer SHALL اختبار GET `/api/messages` مع و بدون Admin_Token
3. THE Developer SHALL اختبار DELETE `/api/messages/:id` مع Admin_Token
4. THE Developer SHALL اختبار POST `/api/admin/login` مع password صحيحة و خاطئة
5. THE Developer SHALL اختبار إرسال رسالتين من نفس IP والتحقق من رفض الثانية
6. THE Developer SHALL اختبار validation errors (text فارغ، text طويل جداً)
7. THE Developer SHALL التحقق من أن CORS يعمل بشكل صحيح

### Requirement 20: النشر (Deployment)

**User Story:** كمطور، أريد نشر الـ API على خادم، حتى يتمكن المستخدمون من الوصول إليه.

#### Acceptance Criteria

1. THE API_Server SHALL يكون قابل للنشر على Heroku أو Vercel أو Railway
2. THE Developer SHALL إنشاء MongoDB Atlas cluster للإنتاج
3. THE Developer SHALL تكوين environment variables على منصة النشر
4. THE Developer SHALL تحديث Frontend ليشير إلى API URL الخاص بالإنتاج
5. THE Developer SHALL اختبار الـ API بعد النشر للتأكد من عمله
6. THE README SHALL يحتوي على تعليمات النشر
