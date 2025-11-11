// =============================================================
//              البيانات الوهمية (MOCK DATA)
// =============================================================

// بيانات المستخدمين الافتراضيين
const mockUsers = {
    // مستخدم عادي
    "user@test.com": { id: 101, password: "password123", role: "user", balance: 1197.50, name: "مستخدم تجريبي" },
    // مدير النظام (Admin)
    "aboabood2002r@gmail.com": { id: 201, password: "aboabood", role: "admin", name: "المدير العام" }
};

// بيانات الأقسام والمنتجات الافتراضية
let mockCategories = [
    { id: 1, name: "شحن الألعاب", icon: "https://i.ibb.co/6847c1T/game-icon.png", products: [
        { id: 11, name: "شدات ببجي 660", price: 9.50, currency: "$", image: "https://i.ibb.co/6H4yY9G/pubg.png", description: "شحن فوري عبر الـ ID، تصل الشدات خلال 5 دقائق." },
        { id: 12, name: "جواهر فري فاير 1000", price: 15.00, currency: "$", image: "https://i.ibb.co/h9s3QjY/freefire.png", description: "اشحن الآن واحصل على بونص إضافي من الجواهر." },
    ]},
    { id: 2, name: "أكواد رقمية", icon: "https://i.ibb.co/nC468gP/code-icon.png", products: [
        { id: 21, name: "بطاقة جوجل بلاي $50", price: 50.00, currency: "$", image: "https://i.ibb.co/P8F0b22/google-play.png", description: "بطاقة هدية أمريكية بقيمة 50 دولار." },
        { id: 22, name: "اشتراك شاهد VIP شهر", price: 5.99, currency: "$", image: "https://i.ibb.co/9v9n82x/shahid.png", description: "شهر كامل من المشاهدة بلا إعلانات." },
    ]},
    { id: 3, name: "بطاقات آيتونز", icon: "https://i.ibb.co/R4m03Xm/apple-icon.png", products: []},
];

// بيانات الطلبات الافتراضية
let mockOrders = [
    { id: 1001, userId: 101, productName: "شدات ببجي 660", price: 9.50, date: "2023-11-01", status: "تم التنفيذ", details: "ID: 12345678" },
    { id: 1002, userId: 101, productName: "بطاقة جوجل بلاي $50", price: 50.00, date: "2023-11-05", status: "قيد المراجعة", details: "تم الدفع" },
    { id: 1003, userId: 201, productName: "جواهر فري فاير 1000", price: 15.00, date: "2023-11-10", status: "ملغى", details: "رصيد غير كافٍ" },
];


// =============================================================
//              منطق محاكاة الـ API (MOCK API)
// =============================================================

/**
 * محاكاة طلب API مع تأخير زمني.
 * @param {string} endpoint - مسار العملية (مثل: /auth/login, /user/balance).
 * @param {object} data - البيانات المرسلة في الطلب.
 * @returns {Promise<object>} - وعد يُحل ببيانات الاستجابة.
 */
function apiCall(endpoint, data = {}) {
    return new Promise((resolve, reject) => {
        // محاكاة تأخير شبكة عشوائي (بين 500 و 1500 مللي ثانية)
        const delay = Math.random() * 1000 + 500;
        setTimeout(() => {
            let response = { success: false, message: "حدث خطأ غير معروف." };
            const userEmail = data.email || (sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')).email : null);
            let currentUser = userEmail ? mockUsers[userEmail] : null;

            switch (endpoint) {
                case '/auth/login':
                    const user = mockUsers[data.email];
                    if (user && user.password === data.password) {
                        response = { success: true, data: { user: { id: user.id, name: user.name, role: user.role, balance: user.balance } } };
                    } else {
                        response.message = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
                    }
                    break;
                
                case '/user/data':
                    if (currentUser) {
                        response = { success: true, data: { balance: currentUser.balance, name: currentUser.name } };
                    } else {
                        response.message = "غير مصرح بالوصول.";
                    }
                    break;

                case '/store/categories':
                    response = { success: true, data: mockCategories.map(c => ({ id: c.id, name: c.name, icon: c.icon })) };
                    break;
                
                case '/store/products':
                    const category = mockCategories.find(c => c.id === data.categoryId);
                    if (category) {
                        response = { success: true, data: category.products };
                    } else {
                        response.message = "القسم غير موجود.";
                    }
                    break;

                case '/admin/categories':
                    response = { success: true, data: mockCategories };
                    break;
                
                case '/admin/saveCategory':
                    const { id, name, image } = data;
                    if (id) {
                        // تعديل
                        const index = mockCategories.findIndex(c => c.id === id);
                        if (index !== -1) {
                            mockCategories[index].name = name;
                            mockCategories[index].icon = image;
                            response = { success: true, message: "تم تحديث القسم بنجاح.", data: mockCategories[index] };
                        } else {
                            response.message = "القسم غير موجود للتعديل.";
                        }
                    } else {
                        // إضافة
                        const newId = Math.max(...mockCategories.map(c => c.id)) + 1;
                        const newCategory = { id: newId, name: name, icon: image, products: [] };
                        mockCategories.push(newCategory);
                        response = { success: true, message: "تم إضافة القسم بنجاح.", data: newCategory };
                    }
                    break;
                
                case '/admin/deleteCategory':
                    const initialLength = mockCategories.length;
                    mockCategories = mockCategories.filter(c => c.id !== data.categoryId);
                    if (mockCategories.length < initialLength) {
                        response = { success: true, message: "تم حذف القسم بنجاح." };
                    } else {
                        response.message = "القسم غير موجود للحذف.";
                    }
                    break;
                
                case '/user/orders':
                    // فلترة الطلبات للمستخدم الحالي فقط
                    const userId = JSON.parse(sessionStorage.getItem('user')).id;
                    const userOrders = mockOrders.filter(o => o.userId === userId);
                    response = { success: true, data: userOrders.sort((a, b) => b.id - a.id) };
                    break;
                
                case '/admin/orders':
                    response = { success: true, data: mockOrders.sort((a, b) => b.id - a.id) };
                    break;
                
                case '/admin/updateOrderStatus':
                    const orderIndex = mockOrders.findIndex(o => o.id === data.orderId);
                    if (orderIndex !== -1) {
                        mockOrders[orderIndex].status = data.newStatus;
                        response = { success: true, message: `تم تحديث حالة الطلب #${data.orderId} إلى ${data.newStatus}.` };
                    } else {
                        response.message = "الطلب غير موجود.";
                    }
                    break;

                case '/store/buy':
                    const userToUpdate = mockUsers[userEmail];
                    const productToBuy = mockCategories.flatMap(c => c.products).find(p => p.id === data.productId);
                    
                    if (!userToUpdate) {
                        response.message = "يجب تسجيل الدخول لإتمام عملية الشراء.";
                        break;
                    }

                    if (!productToBuy) {
                        response.message = "المنتج غير موجود.";
                        break;
                    }

                    if (userToUpdate.balance < productToBuy.price) {
                        response.message = "الرصيد غير كافٍ لإتمام عملية الشراء.";
                        break;
                    }

                    // محاكاة خصم الرصيد
                    userToUpdate.balance = parseFloat((userToUpdate.balance - productToBuy.price).toFixed(2));
                    
                    // محاكاة إضافة الطلب
                    const newOrderId = Math.max(...mockOrders.map(o => o.id)) + 1;
                    mockOrders.push({
                        id: newOrderId,
                        userId: userToUpdate.id,
                        productName: productToBuy.name,
                        price: productToBuy.price,
                        date: new Date().toISOString().split('T')[0],
                        status: "قيد المراجعة",
                        details: `ملاحظة: ${data.notes || 'لا توجد'} - ID: ${data.extraField || 'N/A'}`
                    });
                    
                    // تحديث بيانات الجلسة
                    sessionStorage.setItem('user', JSON.stringify({ ...userToUpdate, email: userEmail }));

                    response = { success: true, message: `تم تأكيد عملية الشراء! خصم $${productToBuy.price.toFixed(2)} من رصيدك.`, data: { newBalance: userToUpdate.balance } };
                    break;
                    
                default:
                    response.message = `نقطة النهاية API غير مدعومة: ${endpoint}`;
            }

            if (response.success) {
                resolve(response);
            } else {
                reject(response);
            }
        }, delay);
    });
}


// =============================================================
//              منطق التنقل والواجهات (VIEWS & NAVIGATION)
// =============================================================
// تصدير الدالة لتكون متاحة عالمياً (لتشغيلها من HTML)
window.apiCall = apiCall;
window.logout = logout;
window.showUserView = showUserView;
window.showAdminView = showAdminView;
window.openBuyModal = openBuyModal;
window.closeBuyModal = closeBuyModal;
window.openAdminCategoryModal = openAdminCategoryModal;
window.closeAdminCategoryModal = closeAdminCategoryModal;
window.updateOrderStatus = updateOrderStatus;
window.deleteCategory = deleteCategory;


// حالة الجلسة الحالية
let userSession = JSON.parse(sessionStorage.getItem('user')) || null;
let currentView = userSession ? (userSession.role === 'admin' ? 'admin' : 'user') : 'login';


/**
 * تبديل عرض الواجهة الرئيسية (Login, User, Admin)
 */
function switchMainView(view) {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('user-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');

    if (view === 'user') {
        document.getElementById('user-view').classList.remove('hidden');
        // عرض شاشة المستخدم الافتراضية
        showUserView('home');
        updateUserDisplay();
    } else if (view === 'admin') {
        document.getElementById('admin-view').classList.remove('hidden');
        // عرض شاشة المدير الافتراضية
        showAdminView('dashboard');
    } else { // login
        document.getElementById('login-view').classList.remove('hidden');
    }
    currentView = view;
}

/**
 * تحديث بيانات المستخدم في واجهة المستخدم (الرصيد والاسم)
 */
function updateUserDisplay() {
    if (userSession && userSession.role === 'user') {
        const balanceEl = document.getElementById('user-balance');
        // تحديث الرصيد من الـ sessionStorage أو MockUsers ليعكس التغييرات الفورية
        const updatedUser = JSON.parse(sessionStorage.getItem('user'));
        if (updatedUser) {
            balanceEl.innerHTML = `
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V9a1 1 0 00-1-1H7m5 4v1a1 1 0 001 1h3m-4 5h4m-4 0a9 9 0 110-18 9 9 0 010 18z"></path></svg>
                الرصيد: $${updatedUser.balance.toFixed(2)}
            `;
        }
    }
}

/**
 * عرض رسالة نظام للمستخدم
 */
function showUserMessage(message, type = 'success') {
    const el = document.getElementById('user-messages');
    el.textContent = message;
    el.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800');
    
    if (type === 'error') {
        el.classList.add('bg-red-100', 'text-red-800');
    } else {
        el.classList.add('bg-green-100', 'text-green-800');
    }

    setTimeout(() => {
        el.classList.add('hidden');
    }, 5000);
}

/**
 * إظهار محتوى واجهة المستخدم (Home, Orders, Profile, etc.)
 */
function showUserView(view, data = {}) {
    const contentArea = document.getElementById('user-content-area');
    contentArea.innerHTML = '';
    // تحديث الأيقونة النشطة في شريط التنقل السفلي
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('border-gray-800', 'text-gray-800');
        btn.classList.add('text-gray-500');
    });
    const activeBtn = document.getElementById(`nav-${view}`);
    if(activeBtn) {
        activeBtn.classList.add('border-gray-800', 'text-gray-800');
        activeBtn.classList.remove('text-gray-500');
    }

    switch (view) {
        case 'home':
            renderUserHomeView(contentArea);
            break;
        case 'category':
            renderCategoryProducts(contentArea, data.categoryId, data.categoryName);
            break;
        case 'product':
            renderProductDetails(contentArea, data.productId);
            break;
        case 'orders':
            renderUserOrdersView(contentArea);
            break;
        case 'profile':
        case 'support':
            renderUnderDevelopmentView(contentArea, view);
            break;
        default:
            renderUserHomeView(contentArea);
    }
}

/**
 * إظهار محتوى لوحة المدير (Dashboard, Orders, Categories)
 */
function showAdminView(view) {
    const contentArea = document.getElementById('admin-content-area');
    contentArea.innerHTML = '';

    document.querySelectorAll('[id^="admin-nav-"]').forEach(btn => {
        btn.classList.remove('bg-gray-700', 'text-white');
        btn.classList.add('text-gray-300');
    });
    
    const activeBtn = document.getElementById(`admin-nav-${view}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-gray-700', 'text-white');
        activeBtn.classList.remove('text-gray-300');
    }

    switch (view) {
        case 'dashboard':
            renderAdminDashboard(contentArea);
            break;
        case 'orders':
            renderAdminOrdersView(contentArea);
            break;
        case 'categories':
            renderAdminCategoriesView(contentArea);
            break;
        case 'settings':
            renderUnderDevelopmentView(contentArea, view, true);
            break;
    }
}

/**
 * دالة موحدة لعرض رسالة "قيد التطوير"
 */
function renderUnderDevelopmentView(contentArea, viewName, isAdmin = false) {
    let title = isAdmin ? 'الإعدادات' : viewName === 'profile' ? 'حسابي' : 'الدعم الفني';
    let icon = isAdmin ? 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.82 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.82 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.82-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.82-3.31 2.37-2.37.996.608 2.227.608 3.223 0z' : viewName === 'profile' ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' : 'M18.364 5.636l-3.536 3.536m0 0a10.057 10.057 0 01-2.224.232l-2.071-.828a1.002 1.002 0 00-1.115.344l-1.42 1.42a1.002 1.002 0 00-.344 1.115l.828 2.07a10.057 10.057 0 01-.232 2.224m0 0l-3.536 3.536M4.5 4.5l7 7m0 0l7-7M4.5 19.5l7-7m0 0l7 7';

    contentArea.innerHTML = `
        <div class="p-8 text-center bg-white rounded-xl shadow-lg mt-10">
            <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icon}"></path></svg>
            <h2 class="text-2xl font-bold mt-4 text-gray-800">${title}</h2>
            <p class="mt-2 text-gray-600">هذه الصفحة قيد التطوير حاليًا وستتوفر قريباً.</p>
        </div>
    `;
}

// =============================================================
//              رندرة واجهة المستخدم (USER VIEWS)
// =============================================================

/**
 * رندرة شاشة الرئيسية للمستخدم
 */
async function renderUserHomeView(contentArea) {
    contentArea.innerHTML = '<h2 class="text-2xl font-bold text-gray-800 mb-6">الأقسام الرئيسية</h2><div id="categories-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>';
    const gridEl = document.getElementById('categories-grid');

    try {
        const result = await apiCall('/store/categories');
        
        result.data.forEach(category => {
            const card = `
                <div onclick="showUserView('category', {categoryId: ${category.id}, categoryName: '${category.name}'})" 
                    class="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out cursor-pointer text-center border-t-4 border-gray-800">
                    <img src="${category.icon}" alt="${category.name}" class="w-16 h-16 mx-auto mb-3 object-contain">
                    <h3 class="text-lg font-semibold text-gray-800">${category.name}</h3>
                </div>
            `;
            gridEl.innerHTML += card;
        });
    } catch (error) {
        gridEl.innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
    }
}

/**
 * رندرة قائمة المنتجات داخل قسم محدد
 */
async function renderCategoryProducts(contentArea, categoryId, categoryName) {
    contentArea.innerHTML = `
        <button onclick="showUserView('home')" class="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition duration-150">
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            <span>العودة للأقسام</span>
        </button>
        <h2 class="text-3xl font-bold text-gray-800 mb-6">${categoryName}</h2>
        <div id="products-list" class="space-y-4"></div>
    `;
    const listEl = document.getElementById('products-list');

    try {
        const result = await apiCall('/store/products', { categoryId });
        
        if (result.data.length === 0) {
            listEl.innerHTML = `<p class="text-gray-500 p-8 text-center bg-white rounded-lg shadow-md">لا توجد منتجات حاليًا في هذا القسم.</p>`;
            return;
        }

        result.data.forEach(product => {
            const card = `
                <div onclick="showUserView('product', {productId: ${product.id}})"
                    class="bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition duration-300 ease-in-out cursor-pointer flex items-center space-x-4 space-x-reverse">
                    <img src="${product.image}" alt="${product.name}" class="w-20 h-20 object-contain rounded-lg flex-shrink-0">
                    <div class="flex-grow">
                        <h3 class="text-xl font-semibold text-gray-800">${product.name}</h3>
                        <p class="text-sm text-gray-500 mt-1">${product.description.substring(0, 50)}...</p>
                    </div>
                    <div class="text-left flex flex-col items-center flex-shrink-0">
                        <span class="text-2xl font-bold text-green-600">${product.price.toFixed(2)} ${product.currency}</span>
                        <span class="text-xs text-gray-400">شراء الآن</span>
                    </div>
                </div>
            `;
            listEl.innerHTML += card;
        });

    } catch (error) {
        listEl.innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
    }
}

/**
 * رندرة شاشة تفاصيل المنتج ونافذة الشراء (Modal)
 */
function renderProductDetails(contentArea, productId) {
    const product = mockCategories.flatMap(c => c.products).find(p => p.id === productId);

    if (!product) {
        contentArea.innerHTML = '<p class="text-red-500 text-center mt-10">المنتج غير موجود.</p>';
        return;
    }

    // محاكاة حقل إضافي (مثلاً، ID للعبة)
    const extraFieldLabel = product.name.includes('ببجي') || product.name.includes('فري فاير') ? 'آيدي اللاعب/الحساب' : 'ملاحظات إضافية';
    const extraFieldPlaceholder = extraFieldLabel === 'آيدي اللاعب/الحساب' ? 'أدخل آيدي الحساب هنا...' : 'أي ملاحظات تريد إضافتها';

    contentArea.innerHTML = `
        <div class="bg-white rounded-xl shadow-lg p-6 lg:p-8">
            <button onclick="showUserView('home')" class="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition duration-150">
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                <span>العودة للمتجر</span>
            </button>
            
            <div class="flex flex-col md:flex-row gap-6 items-start">
                <div class="md:w-1/3 w-full flex justify-center">
                    <img src="${product.image}" alt="${product.name}" class="max-w-full h-auto max-h-64 object-contain rounded-xl border p-2">
                </div>
                
                <div class="md:w-2/3 w-full">
                    <h1 class="text-3xl font-extrabold text-gray-900 mb-3">${product.name}</h1>
                    <p class="text-xl font-bold text-green-600 mb-4">${product.price.toFixed(2)} ${product.currency}</p>
                    
                    <p class="text-gray-700 mb-6">${product.description}</p>

                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                        <h4 class="text-lg font-semibold text-gray-800 mb-2">تعليمات الشراء</h4>
                        <ul class="list-disc list-inside text-sm text-gray-600 space-y-1 pr-4">
                            <li>التسليم فوري أو خلال دقائق.</li>
                            <li>تأكد من إدخال البيانات المطلوبة بدقة.</li>
                        </ul>
                    </div>
                    
                    <form id="product-purchase-form" class="space-y-4 mb-6">
                        <div>
                            <label for="extra-field" class="block text-sm font-medium text-gray-700">${extraFieldLabel}</label>
                            <input type="text" id="extra-field" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-800 focus:ring-gray-800 sm:text-sm p-2" placeholder="${extraFieldPlaceholder}">
                        </div>
                        <div>
                            <label for="purchase-notes" class="block text-sm font-medium text-gray-700">ملاحظات الطلب (اختياري)</label>
                            <textarea id="purchase-notes" rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-800 focus:ring-gray-800 sm:text-sm p-2" placeholder="ملاحظات حول طريقة التسليم..."></textarea>
                        </div>
                        <input type="hidden" id="product-id" value="${product.id}">
                    </form>

                    <button onclick="openBuyModal(${product.id})" class="w-full py-3 px-4 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition duration-150 focus:outline-none focus:ring-4 focus:ring-gray-300">
                        شراء الآن (${product.price.toFixed(2)} ${product.currency})
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * رندرة شاشة طلبات المستخدم
 */
async function renderUserOrdersView(contentArea) {
    contentArea.innerHTML = `
        <h2 class="text-3xl font-bold text-gray-800 mb-6">طلباتي السابقة</h2>
        <div id="orders-list" class="space-y-4">
            <p class="text-gray-500 text-center p-4">جارٍ تحميل الطلبات...</p>
        </div>
    `;
    const listEl = document.getElementById('orders-list');

    try {
        const result = await apiCall('/user/orders');
        listEl.innerHTML = ''; // مسح رسالة التحميل

        if (result.data.length === 0) {
            listEl.innerHTML = `<p class="text-gray-500 p-8 text-center bg-white rounded-lg shadow-md">لم تقم بإجراء أي طلبات بعد.</p>`;
            return;
        }
        
        result.data.forEach(order => {
            let statusClass, statusText;
            if (order.status === 'تم التنفيذ') {
                statusClass = 'bg-green-100 text-green-800';
                statusText = 'تم التنفيذ';
            } else if (order.status === 'قيد المراجعة') {
                statusClass = 'bg-yellow-100 text-yellow-800';
                statusText = 'قيد المراجعة';
            } else {
                statusClass = 'bg-red-100 text-red-800';
                statusText = 'ملغى';
            }

            const card = `
                <div class="bg-white p-4 rounded-xl shadow-md border-r-4 border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">${order.productName}</h3>
                        <p class="text-sm text-gray-500">رقم الطلب: #${order.id} | تاريخ: ${order.date}</p>
                        <p class="text-sm text-gray-500 mt-1">${order.details}</p>
                    </div>
                    <div class="mt-3 md:mt-0 flex items-center space-x-4 space-x-reverse">
                        <span class="text-xl font-bold text-gray-800">${order.price.toFixed(2)} $</span>
                        <span class="text-xs font-medium px-3 py-1 rounded-full ${statusClass}">${statusText}</span>
                    </div>
                </div>
            `;
            listEl.innerHTML += card;
        });

    } catch (error) {
        listEl.innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
    }
}


// =============================================================
//              رندرة لوحة المدير (ADMIN VIEWS)
// =============================================================

/**
 * رندرة لوحة المدير الرئيسية (Dashboard)
 */
function renderAdminDashboard(contentArea) {
    contentArea.innerHTML = `
        <h2 class="text-3xl font-bold text-gray-800 mb-6">لوحة التحكم الرئيسية</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-lg border-b-4 border-blue-500">
                <p class="text-sm font-medium text-gray-500">إجمالي الطلبات</p>
                <p class="text-3xl font-bold text-gray-800 mt-1">${mockOrders.length}</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500">
                <p class="text-sm font-medium text-gray-500">طلبات مُنفّذة</p>
                <p class="text-3xl font-bold text-gray-800 mt-1">${mockOrders.filter(o => o.status === 'تم التنفيذ').length}</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-lg border-b-4 border-yellow-500">
                <p class="text-sm font-medium text-gray-500">أقسام المتجر</p>
                <p class="text-3xl font-bold text-gray-800 mt-1">${mockCategories.length}</p>
            </div>
        </div>
        <div class="mt-8 bg-white p-6 rounded-xl shadow-lg">
            <h3 class="text-xl font-bold text-gray-800 mb-4">أحدث 5 طلبات</h3>
            <div id="admin-latest-orders">
                ${renderAdminOrdersTable(mockOrders.slice(0, 5), true)}
            </div>
        </div>
    `;
}

/**
 * دالة مساعدة لإنشاء جدول الطلبات (تستخدم في لوحة التحكم وإدارة الطلبات)
 */
function renderAdminOrdersTable(orders, isSummary = false) {
    if (orders.length === 0) {
        return '<p class="text-gray-500 text-center py-4">لا توجد طلبات لعرضها.</p>';
    }
    
    return `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        ${!isSummary ? '<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البيانات الإضافية</th>' : ''}
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراء</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${orders.map(order => {
                        let statusClass;
                        if (order.status === 'تم التنفيذ') statusClass = 'bg-green-100 text-green-800';
                        else if (order.status === 'قيد المراجعة') statusClass = 'bg-yellow-100 text-yellow-800';
                        else statusClass = 'bg-red-100 text-red-800';

                        return `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${order.id}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${order.productName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${order.price.toFixed(2)} $</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                        ${order.status}
                                    </span>
                                </td>
                                ${!isSummary ? `<td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">${order.details}</td>` : ''}
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    ${order.status === 'قيد المراجعة' ? `
                                        <button onclick="updateOrderStatus(${order.id}, 'تم التنفيذ')" class="text-green-600 hover:text-green-900 ml-2">✅ إتمام</button>
                                        <button onclick="updateOrderStatus(${order.id}, 'ملغى')" class="text-red-600 hover:text-red-900">❌ إلغاء</button>
                                    ` : `<span class="text-gray-400">مُعالَج</span>`}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * رندرة شاشة إدارة الطلبات للمدير
 */
async function renderAdminOrdersView(contentArea) {
    contentArea.innerHTML = `
        <h2 class="text-3xl font-bold text-gray-800 mb-6">إدارة طلبات المتجر</h2>
        <div id="admin-orders-table-container" class="bg-white shadow-lg rounded-xl overflow-hidden">
            <p class="text-gray-500 text-center p-8">جارٍ تحميل الطلبات...</p>
        </div>
    `;
    const tableContainer = document.getElementById('admin-orders-table-container');

    try {
        const result = await apiCall('/admin/orders');
        tableContainer.innerHTML = renderAdminOrdersTable(result.data, false);
    } catch (error) {
        tableContainer.innerHTML = `<p class="text-red-500 text-center p-8">${error.message}</p>`;
    }
}

/**
 * تحديث حالة طلب معين (Admin Action)
 */
async function updateOrderStatus(orderId, newStatus) {
    try {
        const result = await apiCall('/admin/updateOrderStatus', { orderId, newStatus });
        showUserMessage(result.message);
        // إعادة تحميل جدول الطلبات
        renderAdminOrdersView(document.getElementById('admin-content-area'));
    } catch (error) {
        showUserMessage(error.message, 'error');
    }
}

/**
 * رندرة شاشة إدارة الأقسام للمدير
 */
async function renderAdminCategoriesView(contentArea) {
    contentArea.innerHTML = `
        <h2 class="text-3xl font-bold text-gray-800 mb-6">إدارة أقسام المتجر</h2>
        <button onclick="openAdminCategoryModal()" class="mb-6 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition duration-150 flex items-center">
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            <span>إضافة قسم جديد</span>
        </button>
        <div id="admin-categories-table-container" class="bg-white shadow-lg rounded-xl overflow-hidden">
            <p class="text-gray-500 text-center p-8">جارٍ تحميل الأقسام...</p>
        </div>
    `;
    const tableContainer = document.getElementById('admin-categories-table-container');

    try {
        const result = await apiCall('/admin/categories');
        
        const tableHtml = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد المنتجات</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${result.data.map(cat => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${cat.id}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <div class="flex items-center">
                                        <img src="${cat.icon}" class="w-8 h-8 ml-2 object-contain" alt="icon">
                                        <span>${cat.name}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${cat.products.length}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onclick="openAdminCategoryModal(${cat.id})" class="text-blue-600 hover:text-blue-900 ml-2">تعديل</button>
                                    <button onclick="deleteCategory(${cat.id}, '${cat.name}')" class="text-red-600 hover:text-red-900">حذف</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        tableContainer.innerHTML = tableHtml;

    } catch (error) {
        tableContainer.innerHTML = `<p class="text-red-500 text-center p-8">${error.message}</p>`;
    }
}

/**
 * فتح وإعداد نافذة إدارة الأقسام (Admin Modal)
 */
function openAdminCategoryModal(categoryId = null) {
    const modal = document.getElementById('admin-category-modal');
    const title = document.getElementById('admin-modal-title');
    const submitBtn = document.getElementById('admin-category-submit-btn');
    const idInput = document.getElementById('category-id');
    const nameInput = document.getElementById('category-name');
    const imageInput = document.getElementById('category-image');

    // تهيئة النموذج
    idInput.value = '';
    nameInput.value = '';
    imageInput.value = '';

    if (categoryId) {
        const category = mockCategories.find(c => c.id === categoryId);
        if (category) {
            title.textContent = `تعديل القسم: ${category.name}`;
            submitBtn.textContent = 'حفظ التعديلات';
            idInput.value = category.id;
            nameInput.value = category.name;
            imageInput.value = category.icon;
        }
    } else {
        title.textContent = 'إضافة قسم جديد';
        submitBtn.textContent = 'إضافة القسم';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

/**
 * إغلاق نافذة إدارة الأقسام (Admin Modal)
 */
function closeAdminCategoryModal() {
    document.getElementById('admin-category-modal').classList.add('hidden');
    document.getElementById('admin-category-modal').classList.remove('flex');
}

/**
 * معالجة إرسال نموذج إدارة الأقسام (Admin Form Submit)
 */
document.getElementById('admin-category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const categoryId = document.getElementById('category-id').value;
    const categoryName = document.getElementById('category-name').value;
    const categoryImage = document.getElementById('category-image').value;
    
    closeAdminCategoryModal();

    try {
        const result = await apiCall('/admin/saveCategory', { id: categoryId ? parseInt(categoryId) : null, name: categoryName, image: categoryImage });
        showUserMessage(result.message);
        // إعادة تحميل جدول الأقسام
        renderAdminCategoriesView(document.getElementById('admin-content-area'));
    } catch (error) {
        showUserMessage(error.message, 'error');
    }
});

/**
 * حذف قسم (Admin Action)
 */
async function deleteCategory(categoryId, categoryName) {
    if (!confirm(`هل أنت متأكد من حذف القسم "${categoryName}"؟ سيتم حذف جميع المنتجات التابعة له.`)) {
        return;
    }

    try {
        const result = await apiCall('/admin/deleteCategory', { categoryId });
        showUserMessage(result.message);
        // إعادة تحميل جدول الأقسام
        renderAdminCategoriesView(document.getElementById('admin-content-area'));
    } catch (error) {
        showUserMessage(error.message, 'error');
    }
}


// =============================================================
//              منطق نافذة الشراء (BUY MODAL LOGIC)
// =============================================================

/**
 * فتح نافذة تأكيد الشراء
 */
function openBuyModal(productId) {
    const product = mockCategories.flatMap(c => c.products).find(p => p.id === productId);
    const form = document.getElementById('product-purchase-form');
    const extraFieldInput = document.getElementById('extra-field');
    const notesInput = document.getElementById('purchase-notes');
    const currentBalance = JSON.parse(sessionStorage.getItem('user')).balance;

    if (!product || !form.checkValidity() || !userSession) {
        showUserMessage("خطأ: يرجى تسجيل الدخول وإدخال البيانات المطلوبة أولاً.", 'error');
        return;
    }

    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="space-y-3 text-sm">
            <p class="text-base font-semibold text-gray-800">تأكيد تفاصيل الطلب:</p>
            <p class="flex justify-between">
                <span class="font-medium text-gray-600">المنتج:</span>
                <span class="text-gray-900">${product.name}</span>
            </p>
            <p class="flex justify-between">
                <span class="font-medium text-gray-600">سعر المنتج:</span>
                <span class="text-red-600 font-bold">${product.price.toFixed(2)} $</span>
            </p>
            <p class="flex justify-between border-t pt-2 mt-2">
                <span class="font-bold text-gray-700">رصيدك الحالي:</span>
                <span class="font-bold text-blue-600">${currentBalance.toFixed(2)} $</span>
            </p>
            <p class="flex justify-between">
                <span class="font-bold text-gray-700">رصيدك بعد الشراء:</span>
                <span class="font-bold ${currentBalance >= product.price ? 'text-green-600' : 'text-red-600'}">
                    ${(currentBalance - product.price).toFixed(2)} $
                </span>
            </p>
            <div class="bg-yellow-50 border-r-4 border-yellow-400 p-3 mt-4">
                <p class="text-sm text-yellow-800">
                    <strong>البيانات المدخلة:</strong> ${extraFieldInput.placeholder.split('(')[0]}: ${extraFieldInput.value}
                </p>
            </div>
        </div>
    `;
    
    const confirmBtn = document.getElementById('confirm-buy-btn');
    if (currentBalance >= product.price) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'تأكيد الشراء';
        confirmBtn.onclick = () => confirmPurchase(productId, extraFieldInput.value, notesInput.value);
    } else {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'الرصيد غير كافٍ';
    }
    
    document.getElementById('buy-modal').classList.remove('hidden');
    document.getElementById('buy-modal').classList.add('flex');
}

/**
 * إغلاق نافذة تأكيد الشراء
 */
function closeBuyModal() {
    document.getElementById('buy-modal').classList.add('hidden');
    document.getElementById('buy-modal').classList.remove('flex');
}

/**
 * تنفيذ عملية الشراء الفعلية (بعد التأكيد)
 */
async function confirmPurchase(productId, extraField, notes) {
    closeBuyModal();
    try {
        const result = await apiCall('/store/buy', { productId, extraField, notes });
        
        // تحديث بيانات الجلسة والرصيد في واجهة المستخدم
        userSession.balance = result.data.newBalance;
        sessionStorage.setItem('user', JSON.stringify(userSession));
        updateUserDisplay();
        
        showUserMessage(result.message, 'success');
        // العودة للصفحة الرئيسية بعد الشراء
        showUserView('home');
    } catch (error) {
        showUserMessage(error.message, 'error');
    }
}


// =============================================================
//              منطق تسجيل الدخول والخروج (AUTH LOGIC)
// =============================================================

/**
 * معالجة إرسال نموذج تسجيل الدخول
 */
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('login-message');
    
    messageEl.classList.add('hidden');
    messageEl.classList.remove('bg-red-100', 'text-red-800');
    
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
        messageEl.classList.add('bg-red-100', 'text-red-800');
    } finally {
        // إخفاء شاشة التحميل
        document.getElementById('loading-screen').classList.add('hidden');
    }
});

/**
 * تسجيل الخروج
 */
function logout() {
    sessionStorage.removeItem('user');
    userSession = null;
    switchMainView('login');
    // مسح محتوى الواجهات لتجنب عرض بيانات مستخدم سابق
    document.getElementById('user-content-area').innerHTML = '';
    document.getElementById('admin-content-area').innerHTML = '';
}

// =============================================================
//              التهيئة الأولية (INITIALIZATION)
// =============================================================

/**
 * دالة يتم تشغيلها عند تحميل الصفحة بالكامل
 */
function initApp() {
    // إخفاء شاشة التحميل بعد التأكد من وجود البيانات الوهمية
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden-until-loaded');
    
    if (userSession) {
        switchMainView(userSession.role);
    } else {
        switchMainView('login');
    }
}

// بدء تشغيل التطبيق بعد تحميل DOM
document.addEventListener('DOMContentLoaded', () => {
     // محاكاة تحميل أولي لتجنب وميض المحتوى
     setTimeout(initApp, 100); 
});
