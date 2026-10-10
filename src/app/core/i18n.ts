import { Pipe, PipeTransform, inject } from '@angular/core';
import { SettingsService } from './settings.service';

export type Lang = 'en' | 'ar' | 'ur' | 'bn' | 'tr' | 'fr';
export const LANGS: { code: Lang; label: string; rtl: boolean }[] = [
  { code: 'en', label: 'English', rtl: false },
  { code: 'ar', label: 'العربية', rtl: true },
  { code: 'ur', label: 'اردو', rtl: true },
  { code: 'bn', label: 'বাংলা', rtl: false },
  { code: 'tr', label: 'Türkçe', rtl: false },
  { code: 'fr', label: 'Français', rtl: false },
];

type Dict = Record<string, string>;
const en: Dict = {
  ibadaat: 'Ibadaat', names: 'Asma-ul-Husna', shahadat: 'Shahadat', waqf: 'Rules of Stopping', pronunciation: 'Pronunciation Guide', flashcards: 'Flashcards',
  home: 'Home', library: 'Library', search: 'Search', more: 'More', quran: 'Quran', hadith: 'Hadith',
  duas: 'Duas & Azkar', prayer: 'Prayer Times', qibla: 'Qibla', tasbeeh: 'Tasbeeh', calendar: 'Islamic Calendar',
  audio: 'Audio', bookmarks: 'Bookmarks', notes: 'Notes', settings: 'Settings', continue: 'Continue', next: 'Next',
  skip: 'Skip', getStarted: 'Get Started', allowLocation: 'Allow Location', notNow: 'Not Now',
  nextPrayer: 'Next Prayer', remaining: 'remaining', viewAll: 'View All Prayer Times', selectLanguage: 'Select Language',
  selectMadhab: 'Select Madhab', welcome: 'Welcome to Islam 360', companion: 'Your all-in-one Islamic companion',
  tagline: 'Begin your journey with Quran & Sunnah', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
  add: 'Add', reset: 'Reset', today: 'Today', themes: 'Themes', downloads: 'Downloads', help: 'Help & Support',
  about: 'About Islam 360', profile: 'Profile', language: 'Language', madhab: 'Madhab', theme: 'Theme',
  notifications: 'Notifications', privacy: 'Privacy', security: 'Security', greeting: 'As-salamu alaikum',
  fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
  surah: 'Surah', juz: 'Juz', lastRead: 'Last Read', light: 'Light', dark: 'Dark', system: 'System',
  noResults: 'No results found', loading: 'Loading…', retry: 'Retry', back: 'Back', share: 'Share', copy: 'Copy',
  locationHelp: 'Enable location to get accurate Prayer Times and Qibla direction',
  madhabInfo: 'This affects the Asr prayer calculation.', timetable: 'Monthly Timetable',
  saved: 'Saved', recent: 'Recent Searches', clear: 'Clear', dailyAyah: 'Daily Ayah', continueReading: 'Continue Reading',
};
const ar: Dict = {
  ibadaat: 'العبادات', names: 'أسماء الله الحسنى', shahadat: 'الشهادة', waqf: 'أحكام الوقف', pronunciation: 'دليل النطق', flashcards: 'البطاقات التعليمية',
  home: 'الرئيسية', library: 'المكتبة', search: 'بحث', more: 'المزيد', quran: 'القرآن', hadith: 'الحديث',
  duas: 'الأدعية والأذكار', prayer: 'مواقيت الصلاة', qibla: 'القبلة', tasbeeh: 'التسبيح', calendar: 'التقويم الهجري',
  audio: 'الصوتيات', bookmarks: 'العلامات', notes: 'الملاحظات', settings: 'الإعدادات', continue: 'متابعة', next: 'التالي',
  skip: 'تخطي', getStarted: 'ابدأ', allowLocation: 'السماح بالموقع', notNow: 'ليس الآن',
  nextPrayer: 'الصلاة القادمة', remaining: 'متبقي', viewAll: 'عرض كل المواقيت', selectLanguage: 'اختر اللغة',
  selectMadhab: 'اختر المذهب', welcome: 'مرحباً بك في إسلام 360', companion: 'رفيقك الإسلامي المتكامل',
  tagline: 'ابدأ رحلتك مع القرآن والسنة', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل',
  add: 'إضافة', reset: 'إعادة', today: 'اليوم', themes: 'المظهر', downloads: 'التنزيلات', help: 'المساعدة والدعم',
  about: 'عن التطبيق', profile: 'الملف الشخصي', language: 'اللغة', madhab: 'المذهب', theme: 'المظهر',
  notifications: 'الإشعارات', privacy: 'الخصوصية', security: 'الأمان', greeting: 'السلام عليكم',
  fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
  surah: 'سورة', juz: 'جزء', lastRead: 'آخر قراءة', light: 'فاتح', dark: 'داكن', system: 'النظام',
  noResults: 'لا توجد نتائج', loading: '…جارٍ التحميل', retry: 'إعادة المحاولة', back: 'رجوع', share: 'مشاركة', copy: 'نسخ',
  locationHelp: 'فعّل الموقع للحصول على مواقيت الصلاة واتجاه القبلة بدقة',
  madhabInfo: 'يؤثر هذا على حساب وقت العصر.', timetable: 'الجدول الشهري',
  saved: 'تم الحفظ', recent: 'عمليات البحث الأخيرة', clear: 'مسح', dailyAyah: 'آية اليوم', continueReading: 'متابعة القراءة',
};
const ur: Dict = {
  ibadaat: 'عبادات', names: 'اسماءُ الحسنیٰ', shahadat: 'شہادت', waqf: 'وقف کے قواعد', pronunciation: 'تلفظ کی رہنمائی', flashcards: 'فلیش کارڈز',
  home: 'ہوم', library: 'لائبریری', search: 'تلاش', more: 'مزید', quran: 'قرآن', hadith: 'حدیث',
  duas: 'دعائیں اور اذکار', prayer: 'نماز کے اوقات', qibla: 'قبلہ', tasbeeh: 'تسبیح', calendar: 'اسلامی کیلنڈر',
  audio: 'آڈیو', bookmarks: 'بُک مارکس', notes: 'نوٹس', settings: 'سیٹنگز', continue: 'جاری رکھیں', next: 'اگلا',
  skip: 'چھوڑیں', getStarted: 'شروع کریں', allowLocation: 'مقام کی اجازت دیں', notNow: 'ابھی نہیں',
  nextPrayer: 'اگلی نماز', remaining: 'باقی', viewAll: 'تمام اوقات دیکھیں', selectLanguage: 'زبان منتخب کریں',
  selectMadhab: 'مسلک منتخب کریں', welcome: 'اسلام 360 میں خوش آمدید', companion: 'آپ کا مکمل اسلامی ساتھی',
  tagline: 'قرآن و سنت کے ساتھ اپنا سفر شروع کریں', save: 'محفوظ کریں', cancel: 'منسوخ', delete: 'حذف', edit: 'ترمیم',
  add: 'شامل کریں', reset: 'ری سیٹ', today: 'آج', themes: 'تھیمز', downloads: 'ڈاؤن لوڈز', help: 'مدد اور سپورٹ',
  about: 'اسلام 360 کے بارے میں', profile: 'پروفائل', language: 'زبان', madhab: 'مسلک', theme: 'تھیم',
  notifications: 'اطلاعات', privacy: 'پرائیویسی', security: 'سیکیورٹی', greeting: 'السلام علیکم',
  fajr: 'فجر', sunrise: 'طلوعِ آفتاب', dhuhr: 'ظہر', asr: 'عصر', maghrib: 'مغرب', isha: 'عشاء',
  surah: 'سورہ', juz: 'پارہ', lastRead: 'آخری مطالعہ', light: 'روشن', dark: 'گہرا', system: 'سسٹم',
  noResults: 'کوئی نتیجہ نہیں ملا', loading: '…لوڈ ہو رہا ہے', retry: 'دوبارہ کوشش', back: 'واپس', share: 'شیئر', copy: 'کاپی',
  locationHelp: 'درست نماز کے اوقات اور قبلہ کی سمت کے لیے مقام آن کریں',
  madhabInfo: 'یہ عصر کی نماز کے حساب پر اثر انداز ہوتا ہے۔', timetable: 'ماہانہ ٹائم ٹیبل',
  saved: 'محفوظ ہو گیا', recent: 'حالیہ تلاش', clear: 'صاف کریں', dailyAyah: 'آج کی آیت', continueReading: 'پڑھنا جاری رکھیں',
};
const bn: Dict = {
  home: 'হোম', library: 'লাইব্রেরি', search: 'অনুসন্ধান', more: 'আরও', quran: 'কুরআন', hadith: 'হাদীস',
  duas: 'দোয়া ও আযকার', prayer: 'নামাজের সময়', qibla: 'কিবলা', tasbeeh: 'তাসবিহ', calendar: 'ইসলামিক ক্যালেন্ডার',
  audio: 'অডিও', bookmarks: 'বুকমার্ক', notes: 'নোট', settings: 'সেটিংস', continue: 'চালিয়ে যান', next: 'পরবর্তী',
  skip: 'এড়িয়ে যান', getStarted: 'শুরু করুন', allowLocation: 'লোকেশন অনুমতি দিন', notNow: 'এখন নয়',
  nextPrayer: 'পরবর্তী নামাজ', remaining: 'বাকি', viewAll: 'সব সময় দেখুন', selectLanguage: 'ভাষা নির্বাচন করুন',
  selectMadhab: 'মাযহাব নির্বাচন করুন', welcome: 'ইসলাম ৩৬০-এ স্বাগতম', companion: 'আপনার সম্পূর্ণ ইসলামিক সঙ্গী',
  tagline: 'কুরআন ও সুন্নাহর সাথে আপনার যাত্রা শুরু করুন', save: 'সংরক্ষণ', cancel: 'বাতিল', delete: 'মুছুন', edit: 'সম্পাদনা',
  add: 'যোগ করুন', reset: 'রিসেট', today: 'আজ', themes: 'থিম', downloads: 'ডাউনলোড', help: 'সাহায্য ও সহায়তা',
  about: 'ইসলাম ৩৬০ সম্পর্কে', profile: 'প্রোফাইল', language: 'ভাষা', madhab: 'মাযহাব', theme: 'থিম',
  notifications: 'বিজ্ঞপ্তি', privacy: 'গোপনীয়তা', security: 'নিরাপত্তা', greeting: 'আসসালামু আলাইকুম',
  fajr: 'ফজর', sunrise: 'সূর্যোদয়', dhuhr: 'যোহর', asr: 'আসর', maghrib: 'মাগরিব', isha: 'ইশা',
  surah: 'সূরা', juz: 'পারা', lastRead: 'সর্বশেষ পাঠ', light: 'লাইট', dark: 'ডার্ক', system: 'সিস্টেম',
  noResults: 'কোনো ফলাফল নেই', loading: 'লোড হচ্ছে…', retry: 'আবার চেষ্টা', back: 'পিছনে', share: 'শেয়ার', copy: 'কপি',
  locationHelp: 'সঠিক নামাজের সময় ও কিবলার জন্য লোকেশন চালু করুন',
  madhabInfo: 'এটি আসরের নামাজের হিসাবে প্রভাব ফেলে।', timetable: 'মাসিক সময়সূচি',
  saved: 'সংরক্ষিত', recent: 'সাম্প্রতিক অনুসন্ধান', clear: 'মুছুন', dailyAyah: 'আজকের আয়াত', continueReading: 'পড়া চালিয়ে যান',
};
const tr: Dict = {
  home: 'Ana Sayfa', library: 'Kütüphane', search: 'Ara', more: 'Daha Fazla', quran: "Kur'an", hadith: 'Hadis',
  duas: 'Dualar ve Zikirler', prayer: 'Namaz Vakitleri', qibla: 'Kıble', tasbeeh: 'Tesbih', calendar: 'İslami Takvim',
  audio: 'Ses', bookmarks: 'Yer İşaretleri', notes: 'Notlar', settings: 'Ayarlar', continue: 'Devam', next: 'İleri',
  skip: 'Geç', getStarted: 'Başla', allowLocation: 'Konuma İzin Ver', notNow: 'Şimdi Değil',
  nextPrayer: 'Sonraki Namaz', remaining: 'kaldı', viewAll: 'Tüm Vakitleri Gör', selectLanguage: 'Dil Seçin',
  selectMadhab: 'Mezhep Seçin', welcome: "Islam 360'a Hoş Geldiniz", companion: 'Hepsi bir arada İslami yol arkadaşınız',
  tagline: "Kur'an ve Sünnet ile yolculuğunuza başlayın", save: 'Kaydet', cancel: 'İptal', delete: 'Sil', edit: 'Düzenle',
  add: 'Ekle', reset: 'Sıfırla', today: 'Bugün', themes: 'Temalar', downloads: 'İndirilenler', help: 'Yardım ve Destek',
  about: 'Islam 360 Hakkında', profile: 'Profil', language: 'Dil', madhab: 'Mezhep', theme: 'Tema',
  notifications: 'Bildirimler', privacy: 'Gizlilik', security: 'Güvenlik', greeting: 'Selamün aleyküm',
  fajr: 'İmsak', sunrise: 'Güneş', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı',
  surah: 'Sure', juz: 'Cüz', lastRead: 'Son Okunan', light: 'Açık', dark: 'Koyu', system: 'Sistem',
  noResults: 'Sonuç bulunamadı', loading: 'Yükleniyor…', retry: 'Tekrar Dene', back: 'Geri', share: 'Paylaş', copy: 'Kopyala',
  locationHelp: 'Doğru namaz vakitleri ve kıble yönü için konumu açın',
  madhabInfo: 'Bu, ikindi namazı hesabını etkiler.', timetable: 'Aylık Takvim',
  saved: 'Kaydedildi', recent: 'Son Aramalar', clear: 'Temizle', dailyAyah: 'Günün Ayeti', continueReading: 'Okumaya Devam',
};
const fr: Dict = {
  home: 'Accueil', library: 'Bibliothèque', search: 'Recherche', more: 'Plus', quran: 'Coran', hadith: 'Hadith',
  duas: 'Invocations et Adhkar', prayer: 'Heures de prière', qibla: 'Qibla', tasbeeh: 'Tasbih', calendar: 'Calendrier islamique',
  audio: 'Audio', bookmarks: 'Favoris', notes: 'Notes', settings: 'Paramètres', continue: 'Continuer', next: 'Suivant',
  skip: 'Passer', getStarted: 'Commencer', allowLocation: 'Autoriser la localisation', notNow: 'Pas maintenant',
  nextPrayer: 'Prochaine prière', remaining: 'restant', viewAll: 'Voir toutes les heures', selectLanguage: 'Choisir la langue',
  selectMadhab: 'Choisir le madhhab', welcome: 'Bienvenue sur Islam 360', companion: 'Votre compagnon islamique tout-en-un',
  tagline: 'Commencez votre voyage avec le Coran et la Sunna', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier',
  add: 'Ajouter', reset: 'Réinitialiser', today: "Aujourd'hui", themes: 'Thèmes', downloads: 'Téléchargements', help: 'Aide et support',
  about: "À propos d'Islam 360", profile: 'Profil', language: 'Langue', madhab: 'Madhhab', theme: 'Thème',
  notifications: 'Notifications', privacy: 'Confidentialité', security: 'Sécurité', greeting: 'As-salamu alaykum',
  fajr: 'Fajr', sunrise: 'Lever du soleil', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
  surah: 'Sourate', juz: 'Juz', lastRead: 'Dernière lecture', light: 'Clair', dark: 'Sombre', system: 'Système',
  noResults: 'Aucun résultat', loading: 'Chargement…', retry: 'Réessayer', back: 'Retour', share: 'Partager', copy: 'Copier',
  locationHelp: 'Activez la localisation pour des heures de prière et une Qibla précises',
  madhabInfo: "Cela influence le calcul de la prière d'Asr.", timetable: 'Horaires du mois',
  saved: 'Enregistré', recent: 'Recherches récentes', clear: 'Effacer', dailyAyah: 'Verset du jour', continueReading: 'Reprendre la lecture',
};
export const DICTS: Record<Lang, Dict> = { en, ar, ur, bn, tr, fr };

@Pipe({ name: 't', pure: false })
export class TPipe implements PipeTransform {
  private s = inject(SettingsService);
  transform(key: string): string { return DICTS[this.s.s().lang][key] ?? en[key] ?? key; }
}
