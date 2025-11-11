// المتغيرات العامة (Global Variables)
let userSession = null;
let categories = [];
let products = [];
let orders = [];

// ====================================
// 1. وظائف المساعدة العامة (Utility Functions)
// ====================================

/**
 * دالة لمحاكاة اتصال API
 * @param {string} endpoint - المسار المطلوب.
 * @param {object} data - البيانات المرسلة (إذا كانت موجودة).
 * @returns {Promise<object>} - وعد بقيمة الاستجابة.
 */
function apiCall(endpoint, data = null) {
    return new Promise((resolve, reject) => {
        // محاكاة تأخير الشبكة
        setTimeout(() => {
            if (endpoint === '/auth/login') {
                if (data.email === 'user@test.com' && data.password === '123456') {
                    resolve({ status: 'success', data: { user: { id: 1, role: 'user', balance: 100.50 } } });
                } else if (data.email === 'aboabood2002r@gmail.com' && data.password === '123456') {
                    resolve({ status: 'success', data: { user: { id: 2, role: 'admin', balance: 0.00 } } });
                } else {
                    reject(new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.'));
                }
            } else if (endpoint.startsWith('/categories')) {
                // محاكاة جلب الأقسام
                resolve({ status: 'success', data: categories });
            } else if (endpoint.startsWith('/products')) {
                // محاكاة جلب المنتجات (حسب القسم)
                if (endpoint.includes('category_id=1')) {
                     resolve({ status: 'success', data: products.filter(p => p.categoryId === 1) });
                } else {
                    resolve({ status: 'success', data: products });
                }
            } else if (endpoint === '/buy') {
                // محاكاة عملية الشراء
                const product = products.find(p => p.id === data.productId);
                if (product) {
                    if (userSession.balance >= product.price) {
                        userSession.balance -= product.price;
                        updateBalanceDisplay();
                        
                        // إضافة طلب جديد إلى قائمة الطلبات المحاكية
                        const newOrder = { 
                            id: orders.length + 1, 
                            productName: product.name, 
                            price: product.price, 
                            date: new Date().toLocaleDateString('ar-EG'),
                            status: 'Completed',
                            code: `CODE-${Math.floor(Math.random() * 900000) + 100000}`
                        };
                        orders.push(newOrder);

                        resolve({ status: 'success', message: 'تم الشراء بنجاح. الكود الخاص بك هو: ' + newOrder.code });
                    } else {
                        reject(new Error('رصيدك لا يكفي لإتمام هذه العملية.'));
                    }
                } else {
                    reject(new Error('المنتج غير موجود.'));
                }
            } else if (endpoint === '/orders') {
                // محاكاة جلب الطلبات
                resolve({ status: 'success', data: orders });
            } else if (endpoint === '/admin/categories') {
                // محاكاة إدارة الأقسام
                if (data && data.action === 'add') {
                    const newId = categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1;
                    const newCategory = { id: newId, name: data.name, imageUrl: data.image };
                    categories.push(newCategory);
                    resolve({ status: 'success', message: 'تم إضافة القسم بنجاح' });
                } else if (data && data.action === 'edit') {
                    const index = categories.findIndex(c => c.id === data.id);
                    if (index !== -1) {
                        categories[index].name = data.name;
                        categories[index].imageUrl = data.image;
                        resolve({ status: 'success', message: 'تم تعديل القسم بنجاح' });
                    } else {
                        reject(new Error('القسم غير موجود'));
                    }
                } else if (data && data.action === 'delete') {
                    categories = categories.filter(c => c.id !== data.id);
                    // يجب أيضاً حذف المنتجات التابعة، لكن سنكتفي هنا بحذف القسم للمحاكاة
                    resolve({ status: 'success', message: 'تم حذف القسم بنجاح' });
                } else {
                    resolve({ status: 'success', data: categories });
                }
            }
            
            // في حال لم يتم التعامل مع المسار
            reject(new Error('مسار API غير معروف أو غير مدعوم.'));

        }, 500); // 500ms محاكاة تحميل
    });
}

/**
 * وظيفة لعرض رسائل النظام للمستخدم
 * @param {string} message - الرسالة المراد عرضها.
 * @param {string} type - نوع الرسالة ('success', 'error', 'info').
 */
function showUserMessage(message, type = 'info') {
    const msgEl = document.getElementById('user-messages');
    msgEl.textContent = message;
    msgEl.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800', 'bg-blue-100', 'text-blue-800');
    
    if (type === 'error') {
        msgEl.classList.add('bg-red-100', 'text-red-800');
    } else if (type === 'success') {
        msgEl.classList.add('bg-green-100', 'text-green-800');
    } else {
        msgEl.classList.add('bg-blue-100', 'text-blue-800');
    }
    
    // إخفاء الرسالة تلقائياً بعد 5 ثواني
    setTimeout(() => {
        msgEl.classList.add('hidden');
    }, 5000);
}

/**
 * وظيفة لتحديث عرض الرصيد في الشريط العلوي
 */
function updateBalanceDisplay() {
    const balanceEl = document.getElementById('user-balance');
    if (userSession && userSession.role === 'user') {
        balanceEl.innerHTML = `
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V9a1 1 0 00-1-1H7m5 4v1a1 1 0 001 1h3m-4 5h4m-4 0a9 9 0 110-18 9 9 0 010 18z"></path></svg>
            الرصيد: $${userSession.balance.toFixed(2)}
        `;
    }
}


// ====================================
// 2. وظائف التحكم في واجهات العرض (View Switching)
// ====================================

/**
 * التبديل بين شاشات تسجيل الدخول والواجهات الرئيسية (المستخدم/المدير)
 * @param {string} role - دور المستخدم ('user' أو 'admin').
 */
function switchMainView(role) {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('user-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');

    if (role === 'user') {
        document.getElementById('user-view').classList.remove('hidden');
        updateBalanceDisplay();
        showUserView('home');
    } else if (role === 'admin') {
        document.getElementById('admin-view').classList.remove('hidden');
        showAdminView('dashboard');
    } else {
        // إذا لم يكن هناك دور، نعود لشاشة تسجيل الدخول
        document.getElementById('login-view').classList.remove('hidden');
    }
}

/**
 * التبديل بين محتويات واجهة المستخدم
 * @param {string} view - المحتوى المراد عرضه ('home', 'orders', 'support', 'profile', 'product', 'category').
 * @param {number} [id] - مُعرِّف (ID) إضافي للمنتج أو القسم.
 */
function showUserView(view, id = null) {
    const contentArea = document.getElementById('user-content-area');
    const navItems = document.querySelectorAll('.nav-item');
    
    // إزالة تفعيل جميع أزرار التنقل السفلية
    navItems.forEach(item => {
        item.classList.remove('border-b-2', 'border-gray-800');
        item.classList.add('text-gray-500');
    });

    // تفعيل الزر الحالي
    const activeNav = document.getElementById(`nav-${view === 'category' ? 'home' : view}`);
    if (activeNav) {
        activeNav.classList.add('border-b-2', 'border-gray-800');
        activeNav.classList.remove('text-gray-500');
    }

    // عرض المحتوى
    contentArea.innerHTML = ''; // تنظيف المحتوى السابق

    if (view === 'home') {
        renderHomeView(contentArea);
    } else if (view === 'category' && id !== null) {
        renderCategoryView(contentArea, id);
    } else if (view === 'product' && id !== null) {
        renderProductView(contentArea, id);
    } else if (view === 'orders') {
        renderOrdersView(contentArea);
    } else if (view === 'profile') {
        contentArea.innerHTML = renderProfileView();
    } else if (view === 'support') {
        contentArea.innerHTML = renderSupportView();
    }
}

/**
 * التبديل بين محتويات لوحة المدير
 * @param {string} view - المحتوى المراد عرضه ('dashboard', 'orders', 'categories', 'settings').
 */
function showAdminView(view) {
    const contentArea = document.getElementById('admin-content-area');
    const navItems = document.querySelectorAll('.admin-sidebar nav button');

    // إزالة تفعيل جميع أزرار التنقل الجانبية
    navItems.forEach(item => {
        item.classList.remove('bg-gray-700', 'text-white');
        item.classList.add('text-gray-300');
    });

    // تفعيل الزر الحالي
    const activeNav = document.getElementById(`admin-nav-${view}`);
    if (activeNav) {
        activeNav.classList.add('bg-gray-700', 'text-white');
        activeNav.classList.remove('text-gray-300');
    }

    contentArea.innerHTML = ''; // تنظيف المحتوى السابق

    if (view === 'dashboard') {
        contentArea.innerHTML = renderAdminDashboard();
    } else if (view === 'orders') {
        renderAdminOrdersView(contentArea);
    } else if (view === 'categories') {
        renderAdminCategoriesView(contentArea);
    } else if (view === 'settings') {
        contentArea.innerHTML = renderAdminSettings();
    }
}


// ====================================
// 3. وظائف معالجة البيانات (Data Handling)
// ====================================

/**
 * إعداد البيانات الأولية في بداية تشغيل التطبيق (محاكاة)
 */
function initializeData() {
    // الأقسام المحاكاة
    categories = [
        { id: 1, name: 'أكواد الألعاب', imageUrl: 'https://cdn.tailgrids.com/1.0/assets/images/cards/card-02/image-01.jpg' },
        { id: 2, name: 'تطبيقات البث', imageUrl: 'https://cdn.tailgrids.com/1.0/assets/images/cards/card-02/image-02.jpg' },
        { id: 3, name: 'العملات الرقمية', imageUrl: 'https://cdn.tailgrids.com/1.0/assets/images/cards/card-02/image-03.jpg' },
        { id: 4, name: 'بطاقات الهدايا', imageUrl: 'https://images.unsplash.com/photo-1549488344-f6b90740a6b1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    ];

    // المنتجات المحاكاة
    products = [
        { id: 101, categoryId: 1, name: 'بطاقة ببجي 600 UC', price: 10.99, description: 'شحن 600 شدة لـ PUBG Mobile. التسليم فوري.' },
        { id: 102, categoryId: 1, name: 'فورت نايت 1000 V-Bucks', price: 15.00, description: 'نقاط V-Bucks لمتجر فورت نايت. صالحة لجميع المنصات.' },
        { id: 201, categoryId: 2, name: 'اشتراك Netflix شهر', price: 12.50, description: 'حساب مشترك عالي الجودة لمدة 30 يوم.' },
        { id: 202, categoryId: 2, name: 'اشتراك IPTV سنة', price: 65.99, description: 'أفضل قنوات رياضية وترفيهية لمدة عام كامل.' },
        { id: 301, categoryId: 3, name: 'رصيد USDT بقيمة $50', price: 50.00, description: 'تحويل 50 دولار USDT على شبكة TRC20/BEP20.' },
        { id: 401, categoryId: 4, name: 'بطاقة Google Play $25', price: 25.00, description: 'بطاقة هدايا أمريكية لمتاجر Google Play.' },
    ];
    
    // الطلبات المحاكاة
    orders = [
        { id: 1, productName: 'بطاقة ببجي 600 UC', price: 10.99, date: '2025/11/01', status: 'Completed', code: 'CODE-873456' },
        { id: 2, productName: 'اشتراك Netflix شهر', price: 12.50, date: '2025/11/05', status: 'Pending', code: 'N/A' },
    ];
}


// ====================================
// 4. وظائف الإطلاق (Initialization)
// ====================================

/**
 * وظيفة تهيئة التطبيق عند تحميل الصفحة
 */
function initApp() {
    initializeData(); // إعداد البيانات الأولية

    // 1. محاولة استرداد الجلسة من sessionStorage
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
        userSession = JSON.parse(storedUser);
        switchMainView(userSession.role);
    } else {
        // 2. إذا لم يكن هناك مستخدم مسجل، تظهر شاشة تسجيل الدخول مباشرة (تم إزالة شاشة التحميل)
        switchMainView(null); 
    }
}

// ====================================
// 5. وظائف تسجيل الخروج (Logout)
// ====================================

function logout() {
    sessionStorage.removeItem('user');
    userSession = null;
    switchMainView(null);
    // إخفاء أي رسائل سابقة
    document.getElementById('user-messages').classList.add('hidden');
}


// ====================================
// 6. معالجات الأحداث (Event Handlers)
// ====================================

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
    messageEl.classList.remove('bg-red-700', 'text-white');

    // إظهار شاشة التحميل مؤقتاً لمحاكاة طلب الـ API
    // لاحظ: في هذا السيناريو لم نعد نستخدم شاشة التحميل الكاملة، لكن يمكننا استخدام سبينر صغير
    const loginButton = e.submitter;
    const originalText = loginButton.textContent;
    loginButton.disabled = true;
    loginButton.innerHTML = 'جاري...'; // يمكن استبدالها بسبينر CSS

    try {
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
        messageEl.classList.add('bg-red-700', 'text-white'); 
    } finally {
        // إعادة الزر إلى حالته الأصلية
        loginButton.disabled = false;
        loginButton.textContent = originalText;
    }
});


// ====================================
// 7. وظائف عرض محتوى واجهة المستخدم (User View Rendering)
// ====================================

function renderHomeView(container) {
    container.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">الأقسام الرئيسية</h1>
        <div id="categories-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4">
            </div>
    `;

    const grid = document.getElementById('categories-grid');
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer';
        categoryCard.setAttribute('onclick', `showUserView('category', ${category.id})`);
        categoryCard.innerHTML = `
            <img src="${category.imageUrl}" alt="${category.name}" class="w-full h-32 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-800 text-center">${category.name}</h3>
            </div>
        `;
        grid.appendChild(categoryCard);
    });
}

async function renderCategoryView(container, categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
        container.innerHTML = '<p class="text-red-500">القسم غير موجود.</p>';
        return;
    }
    
    container.innerHTML = `
        <button onclick="showUserView('home')" class="text-gray-600 hover:text-gray-900 mb-4 flex items-center">
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            العودة للأقسام
        </button>
        <h1 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">${category.name}</h1>
        <div id="products-list" class="space-y-4">
            <p class="text-gray-500 text-center">جاري تحميل المنتجات...</p>
        </div>
    `;

    try {
        const result = await apiCall(`/products?category_id=${categoryId}`);
        const productList = document.getElementById('products-list');
        productList.innerHTML = ''; // تنظيف رسالة التحميل

        if (result.data.length === 0) {
             productList.innerHTML = '<p class="text-gray-500 text-center py-10">لا توجد منتجات حالياً في هذا القسم.</p>';
             return;
        }

        result.data.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'bg-white p-4 rounded-lg shadow flex justify-between items-center hover:bg-gray-50 transition duration-150 cursor-pointer';
            productCard.setAttribute('onclick', `showUserView('product', ${product.id})`);
            
            productCard.innerHTML = `
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">${product.name}</h3>
                    <p class="text-gray-500 text-sm">${product.description.substring(0, 50)}...</p>
                </div>
                <div class="flex items-center space-x-2 space-x-reverse">
                    <span class="text-xl font-bold text-green-600 ml-3">$${product.price.toFixed(2)}</span>
                    <button class="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">شراء</button>
                </div>
            `;
            productList.appendChild(productCard);
        });

    } catch (error) {
        showUserMessage(error.message, 'error');
        document.getElementById('products-list').innerHTML = '<p class="text-red-500 text-center py-10">فشل في تحميل المنتجات.</p>';
    }
}

function renderProductView(container, productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        container.innerHTML = '<p class="text-red-500">المنتج غير موجود.</p>';
        return;
    }

    container.innerHTML = `
        <button onclick="showUserView('category', ${product.categoryId})" class="text-gray-600 hover:text-gray-900 mb-4 flex items-center">
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            العودة للمنتجات
        </button>
        <div class="bg-white p-6 rounded-lg shadow-xl">
            <h1 class="text-3xl font-bold text-gray-800 mb-4">${product.name}</h1>
            <p class="text-xl font-semibold text-green-600 mb-4">$${product.price.toFixed(2)}</p>
            <p class="text-gray-600 mb-6">${product.description}</p>
            
            <button onclick="openBuyModal(${product.id})" class="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-150 shadow-lg">
                شراء الآن
            </button>
        </div>
    `;
}

function renderOrdersView(container) {
    container.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">طلباتي (${orders.length})</h1>
        <div id="orders-list" class="space-y-4">
        </div>
    `;
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="text-gray-500 text-center py-10">لم تقم بإجراء أي طلبات حتى الآن.</p>';
        return;
    }

    orders.forEach(order => {
        const statusClass = order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        
        const orderCard = document.createElement('div');
        orderCard.className = 'bg-white p-4 rounded-lg shadow';
        orderCard.innerHTML = `
            <div class="flex justify-between items-center border-b pb-2 mb-2">
                <h3 class="text-lg font-semibold text-gray-800">${order.productName}</h3>
                <span class="${statusClass} text-xs font-medium px-2.5 py-0.5 rounded-full">${order.status === 'Completed' ? 'مكتمل' : 'قيد الانتظار'}</span>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
                <p><strong>المبلغ:</strong> $${order.price.toFixed(2)}</p>
                <p><strong>تاريخ الطلب:</strong> ${order.date}</p>
                <p><strong>كود المنتج:</strong> <span class="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">${order.code}</span></p>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

function renderProfileView() {
    return `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">حسابي الشخصي</h1>
        <div class="bg-white p-6 rounded-lg shadow-xl space-y-4">
            <p class="text-lg"><strong>الاسم:</strong> عبدالباسط العبود (محاكاة)</p>
            <p class="text-lg"><strong>البريد الإلكتروني:</strong> ${userSession.email}</p>
            <p class="text-lg"><strong>الدور:</strong> ${userSession.role === 'admin' ? 'مدير' : 'مستخدم'}</p>
            <p class="text-lg font-bold"><strong>الرصيد:</strong> <span class="text-green-600">$${userSession.balance.toFixed(2)}</span></p>
            
            <button onclick="showUserMessage('تم تحديث إعدادات الحساب بنجاح!', 'success')" class="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-150">تحديث الحساب</button>
        </div>
    `;
}

function renderSupportView() {
     return `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">الدعم والمساعدة</h1>
        <div class="bg-white p-6 rounded-lg shadow-xl space-y-4">
            <p class="text-gray-700">يمكنك التواصل معنا عبر القنوات التالية:</p>
            <ul class="list-disc list-inside space-y-2 text-blue-600">
                <li><a href="mailto:support@aboudcart.com" class="hover:underline">البريد الإلكتروني: support@aboudcart.com</a></li>
                <li><a href="https://wa.me/963999999999" class="hover:underline">واتساب: +963 99 999 9999</a></li>
                <li><a href="#" class="hover:underline">تذاكر الدعم عبر الموقع (محاكاة)</a></li>
            </ul>
        </div>
    `;
}

// ====================================
// 8. وظائف نافذة الشراء (Buy Modal)
// ====================================

function openBuyModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('buy-modal');
    const content = document.getElementById('modal-content');
    const confirmBtn = document.getElementById('confirm-buy-btn');

    content.innerHTML = `
        <div class="space-y-3">
            <p class="text-lg font-semibold text-gray-800">تأكيد شراء: ${product.name}</p>
            <p class="text-gray-600"><strong>السعر:</strong> <span class="text-green-600">$${product.price.toFixed(2)}</span></p>
            <p class="text-gray-600"><strong>رصيدك الحالي:</strong> $${userSession.balance.toFixed(2)}</p>
            <div id="buy-status" class="mt-2 text-sm font-medium"></div>
        </div>
    `;
    
    // تحديث زر التأكيد
    const statusEl = document.getElementById('buy-status');
    if (userSession.balance >= product.price) {
        confirmBtn.disabled = false;
        confirmBtn.onclick = () => confirmPurchase(productId, product.price);
        statusEl.innerHTML = `<span class="text-green-600">رصيدك كافٍ لإتمام العملية.</span>`;
    } else {
        confirmBtn.disabled = true;
        statusEl.innerHTML = `<span class="text-red-600">الرصيد غير كافٍ. تحتاج إلى $${(product.price - userSession.balance).toFixed(2)} إضافية.</span>`;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeBuyModal() {
    const modal = document.getElementById('buy-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function confirmPurchase(productId, price) {
    const confirmBtn = document.getElementById('confirm-buy-btn');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'جاري...';

    try {
        const result = await apiCall('/buy', { productId: productId, userId: userSession.id, price: price });
        showUserMessage(result.message, 'success');
        closeBuyModal();
        // إعادة عرض قائمة الطلبات إذا كان المستخدم فيها
        if (document.getElementById('nav-orders').classList.contains('border-b-2')) {
            showUserView('orders');
        }
    } catch (error) {
        document.getElementById('buy-status').innerHTML = `<span class="text-red-600">${error.message}</span>`;
        showUserMessage(error.message, 'error');
    } finally {
        confirmBtn.textContent = originalText;
        // لا نعيد تفعيل الزر هنا، يفضل إغلاق المودال أو إعادة فتحه لتحديث حالة الرصيد
    }
}


// ====================================
// 9. وظائف عرض محتوى لوحة المدير (Admin View Rendering)
// ====================================

function renderAdminDashboard() {
    return `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">لوحة التحكم الرئيسية 📊</h1>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <p class="text-sm text-gray-500">إجمالي الأقسام</p>
                <p class="text-4xl font-extrabold text-gray-800 mt-1">${categories.length}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <p class="text-sm text-gray-500">إجمالي المنتجات</p>
                <p class="text-4xl font-extrabold text-gray-800 mt-1">${products.length}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <p class="text-sm text-gray-500">الطلبات الأخيرة</p>
                <p class="text-4xl font-extrabold text-gray-800 mt-1">${orders.length}</p>
            </div>
        </div>
        
        <h2 class="text-2xl font-bold text-gray-800 mt-8 mb-4">أداء النظام (محاكاة)</h2>
        <div class="bg-white p-6 rounded-lg shadow-lg h-64 flex items-center justify-center">
            <p class="text-gray-500">مخطط بياني هنا...</p>
        </div>
    `;
}

async function renderAdminCategoriesView(container) {
    container.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">إدارة الأقسام 🏷️</h1>
        <button onclick="openAdminCategoryModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-700 transition duration-150 flex items-center">
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            إضافة قسم جديد
        </button>

        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">#ID</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنتجات</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="admin-categories-body" class="bg-white divide-y divide-gray-200">
                    </tbody>
            </table>
        </div>
    `;

    const tbody = document.getElementById('admin-categories-body');
    const currentCategories = await apiCall('/admin/categories'); // جلب البيانات المحدثة

    currentCategories.data.forEach(category => {
        const productCount = products.filter(p => p.categoryId === category.id).length;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${category.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${category.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${productCount}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
                <button onclick="openAdminCategoryModal(${category.id}, '${category.name}', '${category.imageUrl}')" class="text-indigo-600 hover:text-indigo-900">تعديل</button>
                <button onclick="deleteCategory(${category.id})" class="text-red-600 hover:text-red-900 ml-2">حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderAdminOrdersView(container) {
    container.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">إدارة الطلبات 🛒</h1>
        <div class="bg-white p-6 rounded-lg shadow-lg">
            <p class="text-gray-500 text-center">جدول إدارة الطلبات يظهر هنا (محاكاة)...</p>
        </div>
    `;
}

function renderAdminSettings() {
    return `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">إعدادات النظام ⚙️</h1>
        <div class="bg-white p-6 rounded-lg shadow-xl space-y-4">
            <p class="text-gray-700">هذه هي إعدادات لوحة المدير (محاكاة)...</p>
            <button onclick="showUserMessage('تم حفظ الإعدادات بنجاح!', 'success')" class="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-150">حفظ الإعدادات</button>
        </div>
    `;
}

// ====================================
// 10. وظائف إدارة الأقسام في لوحة المدير (Admin Category Modal)
// ====================================

function openAdminCategoryModal(id = null, name = '', image = '') {
    const modal = document.getElementById('admin-category-modal');
    const title = document.getElementById('admin-modal-title');
    const submitBtn = document.getElementById('admin-category-submit-btn');
    
    document.getElementById('category-id').value = id || '';
    document.getElementById('category-name').value = name;
    document.getElementById('category-image').value = image;

    if (id) {
        title.textContent = 'تعديل القسم';
        submitBtn.textContent = 'حفظ التعديلات';
    } else {
        title.textContent = 'إضافة قسم جديد';
        submitBtn.textContent = 'إضافة القسم';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeAdminCategoryModal() {
    const modal = document.getElementById('admin-category-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

document.getElementById('admin-category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const image = document.getElementById('category-image').value;
    
    const action = id ? 'edit' : 'add';
    const data = { action, name, image, id: id ? parseInt(id) : null };
    
    const submitBtn = document.getElementById('admin-category-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري الحفظ...';

    try {
        const result = await apiCall('/admin/categories', data);
        showUserMessage(result.message, 'success');
        closeAdminCategoryModal();
        renderAdminCategoriesView(document.getElementById('admin-content-area')); // تحديث العرض
    } catch (error) {
        showUserMessage(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

async function deleteCategory(id) {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع المنتجات التابعة له (محاكاة).')) return;

    try {
        const result = await apiCall('/admin/categories', { action: 'delete', id: id });
        showUserMessage(result.message, 'success');
        renderAdminCategoriesView(document.getElementById('admin-content-area')); // تحديث العرض
    } catch (error) {
        showUserMessage(error.message, 'error');
    }
}

// ====================================
// 11. إطلاق التطبيق (Run App)
// ====================================

// إطلاق التطبيق عند اكتمال تحميل DOM
document.addEventListener('DOMContentLoaded', initApp);
