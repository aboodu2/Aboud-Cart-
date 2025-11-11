// ... (الكود بالكامل كما هو، مع التعديل على الجزئية التالية فقط)

/**
 * معالجة إرسال نموذج تسجيل الدخول
 */
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('login-message');
    
    // إزالة تنسيقات الخطأ السابقة
    messageEl.classList.add('hidden');
    messageEl.classList.remove('bg-red-700', 'text-white'); // تم تحديث هذه التنسيقات

    try {
        // إظهار شاشة التحميل
        document.getElementById('loading-screen').classList.remove('hidden');

        const result = await apiCall('/auth/login', { email, password });
        
        // تخزين بيانات المستخدم في الجلسة
        const user = { ...result.data.user, email: email };
        sessionStorage.setItem('user', JSON.stringify(user));
        userSession = user;
        
        // التبديل إلى واجهة المستخدم أو المدير
        switchMainView(user.role);

    } catch (error) {
        messageEl.textContent = error.message;
        messageEl.classList.remove('hidden');
        // **الآن نستخدم تنسيقات مناسبة للخلفية الداكنة**
        messageEl.classList.add('bg-red-700', 'text-white'); 
    } finally {
        // إخفاء شاشة التحميل
        document.getElementById('loading-screen').classList.add('hidden');
    }
});

// ... (بقية الكود لم يتغير)
