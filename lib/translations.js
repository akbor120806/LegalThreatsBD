// Central place for the strings that are translated when the person
// switches languages with the EN/BN toggle. Add more keys here any time a
// new piece of UI needs to support both languages — components look them
// up with t('key') from useLanguage().
const translations = {
  // Nav
  nav_home: { en: 'Home', bn: 'হোম' },
  nav_find_lawyer: { en: 'Find a Lawyer', bn: 'আইনজীবী খুঁজুন' },
  nav_legal_knowledge: { en: 'Legal Knowledge', bn: 'আইনি জ্ঞান' },
  nav_documents: { en: 'Documents', bn: 'ডকুমেন্ট' },
  nav_about: { en: 'About', bn: 'আমাদের সম্পর্কে' },
  nav_login: { en: 'Login', bn: 'লগইন' },
  nav_register: { en: 'Register', bn: 'রেজিস্টার' },
  nav_dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  nav_logout: { en: 'Logout', bn: 'লগআউট' },

  // Homepage hero
  hero_title: { en: 'Trusted Lawyers, in One Place', bn: 'এক জায়গায় বিশ্বস্ত আইনজীবী' },
  hero_subtitle: {
    en: 'Search for legal topics, verified lawyers, or services across Bangladesh — get guidance you can rely on.',
    bn: 'বাংলাদেশ জুড়ে আইনি বিষয়, যাচাইকৃত আইনজীবী বা সেবা খুঁজুন — নির্ভরযোগ্য দিকনির্দেশনা পান।',
  },
  hero_search_placeholder: {
    en: 'Search for legal topics, lawyers or services...',
    bn: 'আইনি বিষয়, আইনজীবী বা সেবা খুঁজুন...',
  },
  hero_search_btn: { en: 'Search', bn: 'খুঁজুন' },
  hero_find_lawyer_btn: { en: 'Find a Lawyer', bn: 'আইনজীবী খুঁজুন' },
  hero_explore_btn: { en: 'Explore Legal Knowledge', bn: 'আইনি জ্ঞান দেখুন' },

  // Core services section
  services_title: { en: 'Our Core Services', bn: 'আমাদের প্রধান সেবাসমূহ' },
  services_subtitle: {
    en: 'Providing trusted legal guidance, lawyer consultation, and reliable legal resources in one platform.',
    bn: 'এক প্ল্যাটফর্মে বিশ্বস্ত আইনি দিকনির্দেশনা, আইনজীবী পরামর্শ এবং নির্ভরযোগ্য আইনি রিসোর্স।',
  },
  service_find_lawyer_title: { en: 'Find a Lawyer', bn: 'আইনজীবী খুঁজুন' },
  service_find_lawyer_desc: {
    en: 'Browse verified lawyer profiles and book online or offline appointments in a few clicks.',
    bn: 'যাচাইকৃত আইনজীবী প্রোফাইল দেখুন এবং কয়েক ক্লিকেই অনলাইন বা অফলাইন অ্যাপয়েন্টমেন্ট বুক করুন।',
  },
  service_documents_title: { en: 'Legal Documents', bn: 'আইনি ডকুমেন্ট' },
  service_documents_desc: {
    en: 'Access summaries of important acts, download notices, and understand legal forms.',
    bn: 'গুরুত্বপূর্ণ আইনের সারসংক্ষেপ দেখুন, নোটিশ ডাউনলোড করুন এবং আইনি ফর্ম বুঝুন।',
  },
  service_knowledge_title: { en: 'Legal Knowledge', bn: 'আইনি জ্ঞান' },
  service_knowledge_desc: {
    en: 'Empowering citizens with clear, simplified knowledge of their legal rights.',
    bn: 'সহজ ও স্পষ্ট ভাষায় নাগরিকদের আইনি অধিকার সম্পর্কে সচেতন করা।',
  },

  // Find a lawyer section
  find_lawyer_title: { en: 'Find a Lawyer', bn: 'আইনজীবী খুঁজুন' },
  find_lawyer_subtitle: {
    en: 'Connect with trusted and experienced lawyers across Bangladesh.',
    bn: 'বাংলাদেশ জুড়ে বিশ্বস্ত ও অভিজ্ঞ আইনজীবীদের সাথে যুক্ত হন।',
  },
  category_all: { en: 'All', bn: 'সব' },
  showing_lawyers_in: { en: 'Showing lawyers in', bn: 'যেসব আইনজীবী দেখানো হচ্ছে' },
  hero_district_placeholder: { en: '📍 Select your district', bn: '📍 আপনার জেলা বাছাই করুন' },
  no_lawyers_selected_district: {
    en: 'No verified lawyers are available in this district yet.',
    bn: 'এই জেলায় এখনও কোনো যাচাইকৃত আইনজীবী নেই।',
  },
  showing_top_rated: { en: 'Showing our top-rated lawyers', bn: 'আমাদের শীর্ষ-রেটেড আইনজীবীরা দেখানো হচ্ছে' },
  no_lawyers_in_district: {
    en: "No verified lawyers in your district yet — showing our top-rated lawyers instead.",
    bn: 'আপনার জেলায় এখনও কোনো যাচাইকৃত আইনজীবী নেই — এর পরিবর্তে আমাদের শীর্ষ-রেটেড আইনজীবীরা দেখানো হচ্ছে।',
  },

  // Call-back band
  callback_title: { en: 'Request a Call Back', bn: 'কল ব্যাক অনুরোধ করুন' },
  callback_subtitle: {
    en: "Not sure where to start? Leave your details and one of our legal coordinators will call you back to guide you to the right lawyer.",
    bn: 'কোথা থেকে শুরু করবেন বুঝতে পারছেন না? আপনার তথ্য দিন, আমাদের একজন সমন্বয়কারী আপনাকে কল করে সঠিক আইনজীবীর কাছে পৌঁছে দেবে।',
  },

  // Footer
  footer_tagline: {
    en: 'Connecting citizens of Bangladesh with verified lawyers, legal knowledge, and secure digital case management.',
    bn: 'বাংলাদেশের নাগরিকদের যাচাইকৃত আইনজীবী, আইনি জ্ঞান এবং নিরাপদ ডিজিটাল কেস ম্যানেজমেন্টের সাথে সংযুক্ত করা।',
  },

  // AI Assistant
  ai_title: { en: 'AI Legal Assistant', bn: 'এআই লিগ্যাল অ্যাসিস্ট্যান্ট' },
  ai_subtitle: {
    en: 'Ask a general legal question and get a plain-language explanation. This is general information, not legal advice.',
    bn: 'একটি সাধারণ আইনি প্রশ্ন করুন এবং সহজ ভাষায় ব্যাখ্যা পান। এটি সাধারণ তথ্য, আইনি পরামর্শ নয়।',
  },
  ai_placeholder: { en: 'Type your legal question here...', bn: 'এখানে আপনার আইনি প্রশ্ন লিখুন...' },
  ai_send: { en: 'Ask', bn: 'জিজ্ঞাসা করুন' },
  ai_thinking: { en: 'Thinking...', bn: 'চিন্তা করা হচ্ছে...' },
  ai_disclaimer: {
    en: 'AI-generated answers may be incomplete or incorrect. For anything important, please consult a verified lawyer through this platform.',
    bn: 'এআই-উত্তর অসম্পূর্ণ বা ভুল হতে পারে। গুরুত্বপূর্ণ বিষয়ে এই প্ল্যাটফর্মের মাধ্যমে একজন যাচাইকৃত আইনজীবীর পরামর্শ নিন।',
  },
};

export function translate(key, lang) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}

export default translations;
