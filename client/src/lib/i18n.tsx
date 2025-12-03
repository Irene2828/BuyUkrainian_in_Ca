import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ua';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    "header.about": "About the Project",
    "header.howItWorks": "How It Works",
    "header.faq": "FAQ",
    "header.addProduct": "Add a New Product",
    "header.addProductShort": "Add Product",
    "header.exploreMap": "Explore the Map",
    "header.about.short": "About",

    // Home page
    "home.hero.title": "Discover Ukrainian Products Across Canada",
    "home.hero.subtitle": "Find authentic Ukrainian-made products in stores near you. Support Ukrainian businesses and connect with the diaspora community.",
    "home.hero.explore": "Explore the Map",
    "home.hero.addLocation": "Add a Location",
    "home.stats.locations": "Locations",
    "home.stats.products": "Products",
    "home.stats.community": "Community",
    "home.featured.title": "Featured Locations",
    "home.featured.subtitle": "Discover popular Ukrainian stores and products across Canada",
    "home.featured.viewAll": "View All on Map",

    // Map page
    "map.title": "Explore the Map",
    "map.subtitle": "Find Ukrainian products and businesses across Canada. Click on any pin to see details, or add a new location to help grow our community.",
    "map.search.placeholder": "Search stores, products, locations...",
    "map.search.try": "Try:",
    "map.clearFilters": "Clear filters",
    "map.viewMap": "Map View",
    "map.viewList": "List View",
    "map.findNearMe": "Find Near Me",
    "map.finding": "Finding...",
    "map.clearLocation": "Clear location",
    "map.noResults": "No results found. Try adjusting your filters or search terms.",
    "map.showing": "Showing",
    "map.store": "store",
    "map.stores": "stores",
    "map.noStoresFound": "No stores found matching your criteria",
    "map.recentlyAdded": "Recently Added",
    "map.recentlyAddedSubtitle": "Click on any product to see location details on the map",
    "map.addLocation": "Add Location",
    "map.fullCanada": "Full Canada",

    // Store modal
    "modal.pendingReview": "Pending Review",
    "modal.products": "Products",
    "modal.location": "Location",
    "modal.copy": "Copy",
    "modal.email": "Email",
    "modal.seeOnMap": "See on Map",
    "modal.share": "Share",
    "modal.aiShareText": "AI Share Text",
    "modal.readyToPost": "Ready-to-post texts",
    "modal.addressCopied": "Address Copied",
    "modal.addressCopiedDesc": "The address has been copied to your clipboard.",
    "modal.copied": "Copied!",
    "modal.shareTextCopied": "Share text for {platform} copied to clipboard.",

    // Add store form
    "form.title": "Add a Location",
    "form.addLocation": "Add a Location",
    "form.uploadPhoto": "Click to upload a photo",
    "form.uploadHint": "Optional - JPG, PNG up to 5MB",
    "form.uploadOptional": "(nice to add, but optional)",
    "form.storeName": "Store Name",
    "form.storeNamePlaceholder": "e.g. Kyiv Market",
    "form.category": "Category",
    "form.categoryRetail": "Retail Store",
    "form.categoryFood": "Food & Dining",
    "form.categoryOther": "Other",
    "form.description": "Description",
    "form.descriptionPlaceholder": "Tell us which MADE IN UKRAINE goods this store sells...",
    "form.products": "Products (comma separated)",
    "form.productsPlaceholder": "e.g. Varenyky, Honey, Ceramics",
    "form.address": "Address",
    "form.addressPlaceholder": "Full street address",
    "form.email": "Email (optional)",
    "form.emailPlaceholder": "Get notified when approved",
    "form.submit": "Submit for Review",
    "form.submitForReview": "Submit for Review",
    "form.submitting": "Submitting...",
    "form.submitted": "Submitted for Review!",
    "form.submittedTitle": "Submitted for Review!",
    "form.submittedMessage": "To prevent spam, your submission will be reviewed by fellow Ukrainian site managers. We'll notify you by email about the status.",
    "form.submittedDesc": "To prevent spam, your submission will be reviewed by fellow Ukrainian site managers. We'll notify you by email about the status.",
    "form.thanks": "Thanks for supporting #madeinUkraine",
    "form.thankYou": "Thanks for supporting #madeinUkraine 🇺🇦",
    "form.addAnother": "Add Another Location",
    "form.error": "Error",
    "form.submitFailed": "Failed to submit store",
    "form.existingStores": "Similar stores already on map:",
    "form.storeExists": "Store already exists",
    "form.storeExistsDesc": "This store is already on our map. You can view it there.",

    // How it works
    "howItWorks.title": "How It Works",
    "howItWorks.subtitle": "Join our community and help Ukrainians across Canada discover authentic products from home",
    "howItWorks.step1.title": "Find a Location",
    "howItWorks.step1.desc": "Know a store selling Ukrainian products? Share it with the community.",
    "howItWorks.step2.title": "Submit Details",
    "howItWorks.step2.desc": "Add the store name, products, and address. Upload a photo if you have one.",
    "howItWorks.step3.title": "Community Review",
    "howItWorks.step3.desc": "Fellow Ukrainians verify submissions to ensure quality and accuracy.",
    "howItWorks.step4.title": "Help Others Discover",
    "howItWorks.step4.desc": "Your submission helps the community find authentic Ukrainian products.",
    "howItWorks.cta": "Add Your First Location",

    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.q1": "What is BlueYellow.ca?",
    "faq.a1": "BlueYellow.ca is a community-driven platform that helps people discover Ukrainian-made products sold across Canada. We connect the Ukrainian diaspora with local businesses and authentic products from home.",
    "faq.q2": "How can I add a store?",
    "faq.a2": "Click the \"Add a Location\" button, fill in the store details including name, products, and address. Your submission will be reviewed by our community moderators before appearing on the map.",
    "faq.q3": "Why do submissions need review?",
    "faq.a3": "To maintain quality and prevent spam, all submissions are reviewed by fellow Ukrainian community members. This ensures the information is accurate and helpful.",
    "faq.q4": "Can I suggest edits to existing listings?",
    "faq.a4": "Currently, you can contact us to suggest corrections. We're working on a feature to allow community edits in the future.",
    "faq.q5": "Is this service free?",
    "faq.a5": "Yes! BlueYellow.ca is completely free to use. We're a community project dedicated to supporting Ukrainian businesses in Canada.",

    // Footer
    "footer.tagline": "Connecting Ukrainians across Canada with authentic products from home.",
    "footer.navigation": "Navigation",
    "footer.home": "Home",
    "footer.map": "Explore Map",
    "footer.about": "About",
    "footer.resources": "Resources",
    "footer.howItWorks": "How It Works",
    "footer.faq": "FAQ",
    "footer.addLocation": "Add Location",
    "footer.legal": "Legal",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Use",
    "footer.copyright": "© {year} BlueYellow.ca. Made with 💙💛 for the Ukrainian community.",

    // About page
    "about.title": "About BlueYellow.ca",
    "about.subtitle": "Connecting Ukrainians across Canada with authentic products from home",
    "about.mission.title": "Our Mission",
    "about.mission.text": "BlueYellow.ca was created to help the Ukrainian diaspora in Canada discover and support local businesses selling authentic Ukrainian products. Whether you're looking for traditional foods, crafts, or other products from home, our community-driven platform makes it easy to find what you need.",
    "about.how.title": "How It Works",
    "about.how.text": "Anyone can submit a location selling Ukrainian products. Our community of volunteers reviews each submission to ensure accuracy and quality. Once approved, the location appears on our interactive map for everyone to discover.",
    "about.community.title": "Community Driven",
    "about.community.text": "This project is built by and for the Ukrainian community. We rely on contributions from people like you to grow our database of locations. Every submission helps fellow Ukrainians find a piece of home.",
    "about.contribute": "Want to Contribute?",
    "about.contributeText": "Help grow our community by adding locations you know about.",
    "about.addLocation": "Add a Location",
    "about.exploreMap": "Explore the Map",

    // Admin
    "admin.login.title": "Admin Login",
    "admin.login.description": "Enter your credentials to access the dashboard",
    "admin.login.password": "Password",
    "admin.login.passwordPlaceholder": "Enter admin password",
    "admin.login.submit": "Sign In",
    "admin.login.loggingIn": "Signing in...",
    "admin.login.error": "Invalid password",

    "admin.dashboard.title": "Admin Dashboard",
    "admin.dashboard.viewLive": "View Live Site",
    "admin.dashboard.logout": "Logout",
    "admin.dashboard.pending": "Pending",
    "admin.dashboard.approved": "Approved",
    "admin.dashboard.rejected": "Rejected",
    "admin.dashboard.all": "All",
    "admin.dashboard.noStores": "No stores to display",
    "admin.dashboard.address": "Address",
    "admin.dashboard.products": "Products",
    "admin.dashboard.approve": "Approve",
    "admin.dashboard.reject": "Reject",
    "admin.dashboard.pendingReview": "Pending Review",
    "admin.dashboard.liveLocations": "Live Locations",
    "admin.dashboard.totalSubmissions": "Total Submissions",
    "admin.dashboard.loading": "Loading...",
    "admin.dashboard.noPending": "No pending submissions.",
    "admin.dashboard.noApproved": "No approved stores yet.",
    "admin.dashboard.noRejected": "No rejected submissions.",
    "admin.dashboard.sessionExpired": "Session expired",
    "admin.dashboard.pleaseLogin": "Please log in again.",
    "admin.dashboard.storeApproved": "Store Approved",
    "admin.dashboard.storeApprovedDesc": "The location is now live on the map.",
    "admin.dashboard.storeRejected": "Store Rejected",
    "admin.dashboard.storeDeleted": "Store Deleted",
    "admin.dashboard.storeDeletedDesc": "The location has been removed from the platform.",
    "admin.dashboard.deleteStore": "Delete Store",
    "admin.dashboard.deleteConfirm": "Are you sure you want to permanently delete \"{name}\"? This action cannot be undone and the store will be removed from the platform.",
    "admin.dashboard.cancel": "Cancel",
    "admin.dashboard.delete": "Delete",
    "admin.dashboard.live": "Live",
    "admin.dashboard.submitted": "Submitted:",
    "admin.dashboard.today": "Today",

    // Errors
    "error.notFound.title": "Page Not Found",
    "error.notFound.message": "The page you're looking for doesn't exist or has been moved.",
    "error.notFound.home": "Go Home",
    "error.notFound.map": "Explore Map",

    // Toast messages
    "toast.locationFound": "Location Found",
    "toast.locationFoundDesc": "Showing stores near your location.",
    "toast.locationOutside": "Location Outside Canada",
    "toast.locationOutsideDesc": "We currently only show stores in Canada.",
    "toast.locationError": "Location Error",
    "toast.locationErrorDesc": "Unable to get your location. Please try again.",
    "toast.locationNotSupported": "Location Not Supported",
    "toast.locationNotSupportedDesc": "Your browser doesn't support geolocation.",
    "toast.error": "Error",
    "toast.submitError": "Failed to submit store",

    // Share texts (AI generated)
    "share.twitter": "Just discovered {name} - they sell authentic Ukrainian products like {products}! Support local Ukrainian businesses in Canada 🇺🇦💙💛 #MadeInUkraine #BlueYellow #SupportUkraine",
    "share.facebook": "I found this amazing Ukrainian store called {name}! 🇺🇦\n\nThey sell: {products}\n📍 {address}\n\n{description}\n\nSupport Ukrainian businesses in Canada! Find more at BlueYellow.ca 💙💛",
    "share.instagram": "🇺🇦 DISCOVER UKRAINIAN PRODUCTS 🇺🇦\n\n📍 {name}\n\n{description}\n\n✨ Products: {products}\n📍 Location: {shortAddress}\n\n#MadeInUkraine #UkrainianProducts #SupportUkraine #BlueYellow #UkrainianBusiness #ShopLocal #UkrainianFood #CanadaUkraine #UkrainianCommunity #SlavaUkraini 💙💛",
  },
  ua: {
    // Header
    "header.about": "Про проєкт",
    "header.howItWorks": "Як це працює",
    "header.faq": "Питання",
    "header.addProduct": "Додати новий продукт",
    "header.addProductShort": "Додати",
    "header.exploreMap": "Переглянути карту",
    "header.about.short": "Про нас",

    // Home page
    "home.hero.title": "Відкрийте українські товари по всій Канаді",
    "home.hero.subtitle": "Знайдіть автентичні українські товари в магазинах поруч. Підтримуйте український бізнес та спілкуйтеся з діаспорою.",
    "home.hero.explore": "Переглянути карту",
    "home.hero.addLocation": "Додати локацію",
    "home.stats.locations": "Локації",
    "home.stats.products": "Товари",
    "home.stats.community": "Спільнота",
    "home.featured.title": "Популярні локації",
    "home.featured.subtitle": "Відкрийте популярні українські магазини та товари по всій Канаді",
    "home.featured.viewAll": "Переглянути всі на карті",

    // Map page
    "map.title": "Переглянути карту",
    "map.subtitle": "Знайдіть українські товари та бізнеси по всій Канаді. Натисніть на будь-яку мітку, щоб побачити деталі, або додайте нову локацію.",
    "map.search.placeholder": "Пошук магазинів, товарів, локацій...",
    "map.search.try": "Спробуйте:",
    "map.clearFilters": "Очистити фільтри",
    "map.viewMap": "Карта",
    "map.viewList": "Список",
    "map.findNearMe": "Поруч зі мною",
    "map.finding": "Шукаємо...",
    "map.clearLocation": "Очистити локацію",
    "map.noResults": "Нічого не знайдено. Спробуйте змінити фільтри або пошуковий запит.",
    "map.showing": "Показано",
    "map.store": "магазин",
    "map.stores": "магазинів",
    "map.noStoresFound": "Магазинів за вашими критеріями не знайдено",
    "map.recentlyAdded": "Нещодавно додані",
    "map.recentlyAddedSubtitle": "Натисніть на будь-який товар, щоб побачити деталі на карті",
    "map.addLocation": "Додати локацію",
    "map.fullCanada": "Вся Канада",

    // Store modal
    "modal.pendingReview": "На перевірці",
    "modal.products": "Товари",
    "modal.location": "Розташування",
    "modal.copy": "Копіювати",
    "modal.email": "Ел. пошта",
    "modal.seeOnMap": "На карті",
    "modal.share": "Поділитися",
    "modal.aiShareText": "ШІ текст",
    "modal.readyToPost": "Готові тексти для публікації",
    "modal.addressCopied": "Адресу скопійовано",
    "modal.addressCopiedDesc": "Адресу скопійовано в буфер обміну.",
    "modal.copied": "Скопійовано!",
    "modal.shareTextCopied": "Текст для {platform} скопійовано.",

    // Add store form
    "form.title": "Додати локацію",
    "form.addLocation": "Додати локацію",
    "form.uploadPhoto": "Натисніть, щоб завантажити фото",
    "form.uploadHint": "Необов'язково - JPG, PNG до 5МБ",
    "form.uploadOptional": "(бажано, але необов'язково)",
    "form.storeName": "Назва магазину",
    "form.storeNamePlaceholder": "напр. Київ Маркет",
    "form.category": "Категорія",
    "form.categoryRetail": "Роздрібний магазин",
    "form.categoryFood": "Їжа та ресторани",
    "form.categoryOther": "Інше",
    "form.description": "Опис",
    "form.descriptionPlaceholder": "Розкажіть які товари MADE IN UKRAINE продає цей магазин...",
    "form.products": "Товари (через кому)",
    "form.productsPlaceholder": "напр. Вареники, Мед, Кераміка",
    "form.address": "Адреса",
    "form.addressPlaceholder": "Повна адреса",
    "form.email": "Ел. пошта (необов'язково)",
    "form.emailPlaceholder": "Отримуйте сповіщення про схвалення",
    "form.submit": "Надіслати на перевірку",
    "form.submitForReview": "Надіслати на перевірку",
    "form.submitting": "Надсилаємо...",
    "form.submitted": "Надіслано на перевірку!",
    "form.submittedTitle": "Надіслано на перевірку!",
    "form.submittedMessage": "Для запобігання спаму ваша заявка буде перевірена модераторами. Ми повідомимо вас електронною поштою про статус.",
    "form.submittedDesc": "Для запобігання спаму ваша заявка буде перевірена модераторами. Ми повідомимо вас електронною поштою про статус.",
    "form.thanks": "Дякуємо за підтримку #madeinUkraine",
    "form.thankYou": "Дякуємо за підтримку #madeinUkraine 🇺🇦",
    "form.addAnother": "Додати ще локацію",
    "form.error": "Помилка",
    "form.submitFailed": "Не вдалося надіслати магазин",
    "form.existingStores": "Схожі магазини вже на карті:",
    "form.storeExists": "Магазин вже існує",
    "form.storeExistsDesc": "Цей магазин вже є на нашій карті. Ви можете переглянути його там.",

    // How it works
    "howItWorks.title": "Як це працює",
    "howItWorks.subtitle": "Приєднуйтесь до нашої спільноти та допоможіть українцям по всій Канаді знайти автентичні товари з дому",
    "howItWorks.step1.title": "Знайдіть локацію",
    "howItWorks.step1.desc": "Знаєте магазин з українськими товарами? Поділіться ним зі спільнотою.",
    "howItWorks.step2.title": "Надішліть деталі",
    "howItWorks.step2.desc": "Додайте назву магазину, товари та адресу. Завантажте фото, якщо маєте.",
    "howItWorks.step3.title": "Перевірка спільнотою",
    "howItWorks.step3.desc": "Українці перевіряють заявки для забезпечення якості та точності.",
    "howItWorks.step4.title": "Допоможіть іншим відкрити",
    "howItWorks.step4.desc": "Ваша заявка допомагає спільноті знайти автентичні українські товари.",
    "howItWorks.cta": "Додати першу локацію",

    // FAQ
    "faq.title": "Часті запитання",
    "faq.q1": "Що таке BlueYellow.ca?",
    "faq.a1": "BlueYellow.ca — це платформа спільноти, яка допомагає людям відкривати українські товари по всій Канаді. Ми з'єднуємо українську діаспору з місцевим бізнесом та автентичними товарами з дому.",
    "faq.q2": "Як я можу додати магазин?",
    "faq.a2": "Натисніть кнопку \"Додати локацію\", заповніть деталі магазину, включаючи назву, товари та адресу. Вашу заявку перевірять модератори перед появою на карті.",
    "faq.q3": "Чому заявки потребують перевірки?",
    "faq.a3": "Для підтримки якості та запобігання спаму всі заявки перевіряються членами української спільноти. Це гарантує точність та корисність інформації.",
    "faq.q4": "Чи можу я запропонувати виправлення?",
    "faq.a4": "Наразі ви можете зв'язатися з нами для пропозиції виправлень. Ми працюємо над функцією редагування спільнотою.",
    "faq.q5": "Чи це безкоштовно?",
    "faq.a5": "Так! BlueYellow.ca повністю безкоштовний. Ми — проєкт спільноти для підтримки українського бізнесу в Канаді.",

    // Footer
    "footer.tagline": "З'єднуємо українців по всій Канаді з автентичними товарами з дому.",
    "footer.navigation": "Навігація",
    "footer.home": "Головна",
    "footer.map": "Карта",
    "footer.about": "Про нас",
    "footer.resources": "Ресурси",
    "footer.howItWorks": "Як це працює",
    "footer.faq": "Питання",
    "footer.addLocation": "Додати локацію",
    "footer.legal": "Правова інформація",
    "footer.privacy": "Політика конфіденційності",
    "footer.terms": "Умови використання",
    "footer.copyright": "© {year} BlueYellow.ca. Створено з 💙💛 для української спільноти.",

    // About page
    "about.title": "Про BlueYellow.ca",
    "about.subtitle": "З'єднуємо українців по всій Канаді з автентичними товарами з дому",
    "about.mission.title": "Наша місія",
    "about.mission.text": "BlueYellow.ca створено для допомоги українській діаспорі в Канаді відкривати та підтримувати місцевий бізнес з автентичними українськими товарами. Чи шукаєте традиційну їжу, ремесла чи інші товари з дому, наша платформа спільноти допоможе знайти потрібне.",
    "about.how.title": "Як це працює",
    "about.how.text": "Будь-хто може надіслати локацію з українськими товарами. Наша спільнота волонтерів перевіряє кожну заявку для забезпечення точності та якості. Після схвалення локація з'являється на інтерактивній карті.",
    "about.community.title": "Спільнотою для спільноти",
    "about.community.text": "Цей проєкт створений українською спільнотою для спільноти. Ми покладаємося на внески таких людей як ви для зростання бази локацій. Кожна заявка допомагає українцям знайти шматочок дому.",
    "about.contribute": "Хочете допомогти?",
    "about.contributeText": "Допоможіть зростанню спільноти, додавши відомі вам локації.",
    "about.addLocation": "Додати локацію",
    "about.exploreMap": "Переглянути карту",

    // Admin
    "admin.login.title": "Вхід адміністратора",
    "admin.login.description": "Введіть облікові дані для доступу до панелі",
    "admin.login.password": "Пароль",
    "admin.login.passwordPlaceholder": "Введіть пароль адміністратора",
    "admin.login.submit": "Увійти",
    "admin.login.loggingIn": "Входимо...",
    "admin.login.error": "Невірний пароль",

    "admin.dashboard.title": "Панель адміністратора",
    "admin.dashboard.viewLive": "Переглянути сайт",
    "admin.dashboard.logout": "Вийти",
    "admin.dashboard.pending": "На перевірці",
    "admin.dashboard.approved": "Схвалені",
    "admin.dashboard.rejected": "Відхилені",
    "admin.dashboard.all": "Всі",
    "admin.dashboard.noStores": "Немає магазинів для відображення",
    "admin.dashboard.address": "Адреса",
    "admin.dashboard.products": "Товари",
    "admin.dashboard.approve": "Схвалити",
    "admin.dashboard.reject": "Відхилити",
    "admin.dashboard.pendingReview": "На перевірці",
    "admin.dashboard.liveLocations": "Активні локації",
    "admin.dashboard.totalSubmissions": "Всього заявок",
    "admin.dashboard.loading": "Завантаження...",
    "admin.dashboard.noPending": "Немає заявок на перевірці.",
    "admin.dashboard.noApproved": "Ще немає схвалених магазинів.",
    "admin.dashboard.noRejected": "Немає відхилених заявок.",
    "admin.dashboard.sessionExpired": "Сесія закінчилась",
    "admin.dashboard.pleaseLogin": "Будь ласка, увійдіть знову.",
    "admin.dashboard.storeApproved": "Магазин схвалено",
    "admin.dashboard.storeApprovedDesc": "Локація тепер відображається на карті.",
    "admin.dashboard.storeRejected": "Магазин відхилено",
    "admin.dashboard.storeDeleted": "Магазин видалено",
    "admin.dashboard.storeDeletedDesc": "Локацію видалено з платформи.",
    "admin.dashboard.deleteStore": "Видалити магазин",
    "admin.dashboard.deleteConfirm": "Ви впевнені, що хочете назавжди видалити \"{name}\"? Цю дію неможливо скасувати, і магазин буде видалено з платформи.",
    "admin.dashboard.cancel": "Скасувати",
    "admin.dashboard.delete": "Видалити",
    "admin.dashboard.live": "Активний",
    "admin.dashboard.submitted": "Надіслано:",
    "admin.dashboard.today": "Сьогодні",

    // Errors
    "error.notFound.title": "Сторінку не знайдено",
    "error.notFound.message": "Сторінка, яку ви шукаєте, не існує або була переміщена.",
    "error.notFound.home": "На головну",
    "error.notFound.map": "Переглянути карту",

    // Toast messages
    "toast.locationFound": "Локацію знайдено",
    "toast.locationFoundDesc": "Показуємо магазини поруч з вами.",
    "toast.locationOutside": "Локація за межами Канади",
    "toast.locationOutsideDesc": "Наразі ми показуємо лише магазини в Канаді.",
    "toast.locationError": "Помилка локації",
    "toast.locationErrorDesc": "Не вдалося отримати вашу локацію. Спробуйте ще раз.",
    "toast.locationNotSupported": "Локація не підтримується",
    "toast.locationNotSupportedDesc": "Ваш браузер не підтримує геолокацію.",
    "toast.error": "Помилка",
    "toast.submitError": "Не вдалося надіслати магазин",

    // Share texts (AI generated)
    "share.twitter": "Щойно відкрив(ла) {name} — вони продають автентичні українські товари: {products}! Підтримуйте український бізнес в Канаді 🇺🇦💙💛 #MadeInUkraine #BlueYellow #SupportUkraine",
    "share.facebook": "Знайшов(ла) чудовий український магазин {name}! 🇺🇦\n\nВони продають: {products}\n📍 {address}\n\n{description}\n\nПідтримуйте український бізнес в Канаді! Більше на BlueYellow.ca 💙💛",
    "share.instagram": "🇺🇦 ВІДКРИЙТЕ УКРАЇНСЬКІ ТОВАРИ 🇺🇦\n\n📍 {name}\n\n{description}\n\n✨ Товари: {products}\n📍 Локація: {shortAddress}\n\n#MadeInUkraine #UkrainianProducts #SupportUkraine #BlueYellow #УкраїнськийБізнес #ShopLocal #УкраїнськаЇжа #CanadaUkraine #УкраїнськаСпільнота #СлаваУкраїні 💙💛",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved === 'en' || saved === 'ua') return saved;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language === 'ua' ? 'uk' : 'en';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const trans = translations[language] as Record<string, string>;
    return trans[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function generateLocalizedShareTexts(store: { name: string; products: string[]; address: string; description: string; category: string }, language: Language) {
  const products = store.products.slice(0, 3).join(', ');
  const emoji = store.category === 'food' ? '🍞' : store.category === 'retail' ? '🛍️' : '🇺🇦';
  const shortAddress = store.address.split(',')[0];
  
  if (language === 'ua') {
    return {
      twitter: `${emoji} Щойно відкрив(ла) ${store.name} — вони продають автентичні українські товари: ${products}! Підтримуйте український бізнес в Канаді 🇺🇦💙💛 #MadeInUkraine #BlueYellow #SupportUkraine`,
      facebook: `Знайшов(ла) чудовий український магазин ${store.name}! 🇺🇦\n\nВони продають: ${products}\n📍 ${store.address}\n\n${store.description}\n\nПідтримуйте український бізнес в Канаді! Більше на BlueYellow.ca 💙💛`,
      instagram: `🇺🇦 ВІДКРИЙТЕ УКРАЇНСЬКІ ТОВАРИ 🇺🇦\n\n📍 ${store.name}\n\n${store.description}\n\n✨ Товари: ${products}\n📍 Локація: ${shortAddress}\n\n#MadeInUkraine #UkrainianProducts #SupportUkraine #BlueYellow #УкраїнськийБізнес #ShopLocal #УкраїнськаЇжа #CanadaUkraine #УкраїнськаСпільнота #СлаваУкраїні 💙💛`,
    };
  }
  
  return {
    twitter: `${emoji} Just discovered ${store.name} - they sell authentic Ukrainian products like ${products}! Support local Ukrainian businesses in Canada 🇺🇦💙💛 #MadeInUkraine #BlueYellow #SupportUkraine`,
    facebook: `I found this amazing Ukrainian store called ${store.name}! 🇺🇦\n\nThey sell: ${products}\n📍 ${store.address}\n\n${store.description}\n\nSupport Ukrainian businesses in Canada! Find more at BlueYellow.ca 💙💛`,
    instagram: `🇺🇦 DISCOVER UKRAINIAN PRODUCTS 🇺🇦\n\n📍 ${store.name}\n\n${store.description}\n\n✨ Products: ${products}\n📍 Location: ${shortAddress}\n\n#MadeInUkraine #UkrainianProducts #SupportUkraine #BlueYellow #UkrainianBusiness #ShopLocal #UkrainianFood #CanadaUkraine #UkrainianCommunity #SlavaUkraini 💙💛`,
  };
}
