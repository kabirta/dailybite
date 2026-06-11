import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "en" | "bn";

const LANGUAGE_STORAGE_KEY = "nutrimed.language";

const bn: Record<string, string> = {
  "AI Assistant": "এআই সহকারী",
  Diary: "ডায়েরি",
  Reports: "রিপোর্ট",
  Store: "স্টোর",
  Doctor: "ডাক্তার",
  Profile: "প্রোফাইল",
  Orders: "অর্ডার",
  Search: "সার্চ",
  App: "অ্যাপ",
  Meals: "মিল",
  "AI Health Assistant": "এআই হেলথ সহকারী",
  "Premium Plan": "প্রিমিয়াম প্ল্যান",
  Recipes: "রেসিপি",
  "Protein Plus Shake": "প্রোটিন প্লাস শেক",
  "Green Detox Mix": "গ্রিন ডিটক্স মিক্স",
  "Omega Heart Capsules": "ওমেগা হার্ট ক্যাপসুল",
  "Calories, meal sections, water tracker, and daily summary": "ক্যালোরি, মিল সেকশন, পানি ট্র্যাকার ও দৈনিক সারাংশ",
  "Pick a date and review your diary by day": "তারিখ বেছে ডায়েরি দেখুন",
  "Calories, steps, macros, nutrients, and weekly trends": "ক্যালোরি, স্টেপ, ম্যাক্রো, নিউট্রিয়েন্ট ও সাপ্তাহিক ট্রেন্ড",
  "Browse NutriMed by CMC nutrition products": "নিউট্রিমেড বাই সিএমসি পুষ্টি পণ্য ব্রাউজ করুন",
  "Account, body snapshot, preferences, and sign out": "অ্যাকাউন্ট, বডি স্ন্যাপশট, প্রেফারেন্স ও সাইন আউট",
  "FAQs, troubleshooting, and contact support": "FAQ, সমস্যা সমাধান ও সাপোর্টে যোগাযোগ",
  "Upgrade for advanced insights and tailored plans": "অ্যাডভান্সড ইনসাইট ও কাস্টম প্ল্যানের জন্য আপগ্রেড",
  "Search and log foods for breakfast": "সকালের খাবার সার্চ ও লগ করুন",
  "Search and log foods for lunch": "দুপুরের খাবার সার্চ ও লগ করুন",
  "Search and log foods for dinner": "রাতের খাবার সার্চ ও লগ করুন",
  "Add Snacks": "স্ন্যাকস যোগ করুন",
  "Search and log snacks or other meals": "স্ন্যাকস বা অন্য মিল সার্চ ও লগ করুন",
  "Oatmeal bowl, egg salad, banana smoothie, avocado toast": "ওটমিল বোল, এগ সালাদ, বানানা স্মুদি, অ্যাভোকাডো টোস্ট",
  "High-protein recovery blend for lean muscle and steady energy": "লিন মাসল ও স্থির এনার্জির জন্য হাই-প্রোটিন ব্লেন্ড",
  "Daily greens powder with fiber, herbs, and digestive support": "ফাইবার, হার্বস ও ডাইজেস্টিভ সাপোর্টসহ ডেইলি গ্রিনস পাউডার",
  "Omega support for heart health and everyday wellness": "হার্ট হেলথ ও দৈনন্দিন ওয়েলনেসের জন্য ওমেগা সাপোর্ট",
  calories: "ক্যালোরি",
  breakfast: "সকালের খাবার",
  reports: "রিপোর্ট",
  water: "পানি",
  support: "সাপোর্ট",
  result: "রেজাল্ট",
  results: "রেজাল্ট",
  "No results found": "কোনো রেজাল্ট পাওয়া যায়নি",
  "Try searching for meals, calories, reports, products, profile, or support.":
    "মিল, ক্যালোরি, রিপোর্ট, পণ্য, প্রোফাইল বা সাপোর্ট সার্চ করে দেখুন।",
  "Go back": "পেছনে যান",
  Notifications: "নোটিফিকেশন",
  Calendar: "ক্যালেন্ডার",
  Breakfast: "সকালের খাবার",
  Lunch: "দুপুরের খাবার",
  Dinner: "রাতের খাবার",
  Snacks: "স্ন্যাকস",
  Calories: "ক্যালোরি",
  Protein: "প্রোটিন",
  Carbs: "কার্বস",
  Fat: "ফ্যাট",
  Fiber: "ফাইবার",
  Water: "পানি",
  Exercise: "ব্যায়াম",
  "Today's progress": "আজকের অগ্রগতি",
  "Today's Progress": "আজকের অগ্রগতি",
  "Meal plan": "মিল প্ল্যান",
  "Add food": "খাবার যোগ করুন",
  Food: "খাবার",
  item: "আইটেম",
  items: "আইটেম",
  Expand: "বড় করুন",
  Collapse: "ছোট করুন",
  "Calories Remaining": "বাকি ক্যালোরি",
  "Calories Consumed": "খাওয়া ক্যালোরি",
  "Log food to start a streak": "স্ট্রিক শুরু করতে খাবার লগ করুন",
  Balanced: "ব্যালান্সড",
  "High Protein": "হাই প্রোটিন",
  "Keto Diet": "কিটো ডায়েট",
  "Low Carb": "লো কার্ব",
  "Meal Plans by fatsecret": "ফ্যাটসিক্রেটের মিল প্ল্যান",
  "Add Breakfast": "সকালের খাবার যোগ করুন",
  "Add Lunch": "দুপুরের খাবার যোগ করুন",
  "Add Dinner": "রাতের খাবার যোগ করুন",
  "Add Snack": "স্ন্যাক যোগ করুন",
  "Medicines & wellness": "ওষুধ ও ওয়েলনেস",
  "NUTRIMED PHARMACY": "নিউট্রিমেড ফার্মেসি",
  "My Orders": "আমার অর্ডার",
  "Genuine products, secure payment, backend order tracking.": "আসল পণ্য, নিরাপদ পেমেন্ট, ব্যাকএন্ড অর্ডার ট্র্যাকিং।",
  "Search medicines, vitamins...": "ওষুধ, ভিটামিন সার্চ করুন...",
  All: "সব",
  "Loading pharmacy": "ফার্মেসি লোড হচ্ছে",
  "No products found": "কোনো পণ্য পাওয়া যায়নি",
  "Add matching products from the admin panel.": "অ্যাডমিন প্যানেল থেকে মিল থাকা পণ্য যোগ করুন।",
  off: "ছাড়",
  "Out of stock": "স্টক নেই",
  "View cart": "কার্ট দেখুন",
  "Add to cart": "কার্টে যোগ করুন",
  Cart: "কার্ট",
  "Your cart is empty": "আপনার কার্ট খালি",
  "Delivery address": "ডেলিভারি ঠিকানা",
  Fetching: "আনা হচ্ছে",
  "Use location": "লোকেশন ব্যবহার করুন",
  "Full name": "পূর্ণ নাম",
  Phone: "ফোন",
  "House / street address": "বাড়ি / রাস্তার ঠিকানা",
  City: "শহর",
  State: "রাজ্য",
  "PIN code": "পিন কোড",
  "Payment method": "পেমেন্ট পদ্ধতি",
  "Online payment": "অনলাইন পেমেন্ট",
  Subtotal: "সাবটোটাল",
  Delivery: "ডেলিভারি",
  Total: "মোট",
  "Place COD order": "COD অর্ডার করুন",
  "Pay online": "অনলাইনে পেমেন্ট",
  "Location update needed": "লোকেশন আপডেট প্রয়োজন",
  "Please install the latest app build to use automatic address detection.":
    "অটোমেটিক ঠিকানা শনাক্ত করতে সর্বশেষ অ্যাপ বিল্ড ইনস্টল করুন।",
  "Location permission needed": "লোকেশন পারমিশন প্রয়োজন",
  "Allow location access to auto-fill your delivery address.": "ডেলিভারি ঠিকানা পূরণ করতে লোকেশন অ্যাক্সেস দিন।",
  "Address not found": "ঠিকানা পাওয়া যায়নি",
  "We found your location, but could not convert it into an address.": "লোকেশন পাওয়া গেছে, কিন্তু ঠিকানায় রূপান্তর করা যায়নি।",
  "Could not fetch location": "লোকেশন আনা যায়নি",
  "Please enter address manually.": "ঠিকানা ম্যানুয়ালি লিখুন।",
  "Delivery details needed": "ডেলিভারি তথ্য প্রয়োজন",
  "Please enter your name, phone, and address.": "আপনার নাম, ফোন ও ঠিকানা লিখুন।",
  Order: "অর্ডার",
  "is confirmed for Cash on Delivery.": "ক্যাশ অন ডেলিভারির জন্য কনফার্ম হয়েছে।",
  "Order created": "অর্ডার তৈরি হয়েছে",
  "Razorpay keys are not configured yet. The order was saved in backend as pending payment.":
    "Razorpay কী এখনও কনফিগার হয়নি। অর্ডারটি পেন্ডিং পেমেন্ট হিসেবে সেভ হয়েছে।",
  "Order ready": "অর্ডার প্রস্তুত",
  "was created. Razorpay native checkout is unavailable in this build.":
    "তৈরি হয়েছে। এই বিল্ডে Razorpay native checkout নেই।",
  "Payment successful": "পেমেন্ট সফল",
  "Your order is confirmed.": "আপনার অর্ডার কনফার্ম হয়েছে।",
  "Checkout failed": "চেকআউট হয়নি",
  "Order details": "অর্ডার বিস্তারিত",
  "Order ID": "অর্ডার আইডি",
  Placed: "প্লেসড",
  Confirmed: "কনফার্মড",
  Packed: "প্যাকড",
  Shipped: "শিপড",
  Delivered: "ডেলিভারড",
  Active: "অ্যাক্টিভ",
  COD: "COD",
  "Payment pending": "পেমেন্ট পেন্ডিং",
  "Complete payment to confirm this order.": "অর্ডার কনফার্ম করতে পেমেন্ট সম্পন্ন করুন।",
  "Order confirmed": "অর্ডার কনফার্মড",
  "Payment received. Seller is preparing your order.": "পেমেন্ট পাওয়া গেছে। সেলার অর্ডার প্রস্তুত করছে।",
  Processing: "প্রসেসিং",
  "Your items are being packed for dispatch.": "আপনার আইটেম ডিসপ্যাচের জন্য প্যাক করা হচ্ছে।",
  "Your order is on the way.": "আপনার অর্ডার পথে আছে।",
  "Delivered successfully.": "সফলভাবে ডেলিভারি হয়েছে।",
  Cancelled: "বাতিল",
  "This order was cancelled.": "এই অর্ডার বাতিল হয়েছে।",
  "Payment failed": "পেমেন্ট ব্যর্থ",
  "Payment could not be verified.": "পেমেন্ট যাচাই করা যায়নি।",
  "Order placed": "অর্ডার হয়েছে",
  "We are checking the latest status.": "আমরা সর্বশেষ স্ট্যাটাস চেক করছি।",
  "Store order": "স্টোর অর্ডার",
  "more item": "আরও আইটেম",
  "more items": "আরও আইটেম",
  Payment: "পেমেন্ট",
  "Pay on delivery": "ডেলিভারিতে পেমেন্ট",
  "Paid online": "অনলাইনে পেইড",
  "Payment summary": "পেমেন্ট সারাংশ",
  "Items subtotal": "আইটেম সাবটোটাল",
  "Delivery fee": "ডেলিভারি ফি",
  Tax: "ট্যাক্স",
  "Order total": "অর্ডার মোট",
  "Delivery details": "ডেলিভারি বিস্তারিত",
  Customer: "কাস্টমার",
  "Delivery address not available": "ডেলিভারি ঠিকানা নেই",
  Standard: "স্ট্যান্ডার্ড",
  Items: "আইটেম",
  Details: "বিস্তারিত",
  "Less info": "কম তথ্য",
  "Shop again": "আবার কিনুন",
  Back: "ব্যাক",
  "Track every pharmacy order, payment, delivery address, and item in one place.":
    "সব ফার্মেসি অর্ডার, পেমেন্ট, ডেলিভারি ঠিকানা ও আইটেম এক জায়গায় ট্র্যাক করুন।",
  "Search by product, order ID, status...": "পণ্য, অর্ডার আইডি, স্ট্যাটাস দিয়ে সার্চ করুন...",
  "Loading orders": "অর্ডার লোড হচ্ছে",
  "Could not load orders": "অর্ডার লোড করা যায়নি",
  "Could not load your orders.": "আপনার অর্ডার লোড করা যায়নি।",
  "No matching orders": "ম্যাচিং অর্ডার নেই",
  "Try another search or filter to find your order.": "অর্ডার খুঁজতে অন্য সার্চ বা ফিল্টার চেষ্টা করুন।",
  "Shop now": "এখন কিনুন",
  "Cash on Delivery": "ক্যাশ অন ডেলিভারি",
  Online: "অনলাইন",
  processing: "প্রসেসিং",
  delivered: "ডেলিভারড",
  cancelled: "বাতিল",
  pending: "পেন্ডিং",
  "Body snapshot": "বডি স্ন্যাপশট",
  Age: "বয়স",
  Height: "উচ্চতা",
  Goal: "লক্ষ্য",
  "Active days": "অ্যাক্টিভ দিন",
  "Meals logged": "লগ করা মিল",
  Streak: "স্ট্রিক",
  "Help & Support": "হেল্প ও সাপোর্ট",
  Premium: "প্রিমিয়াম",
  "Smart Reminders": "স্মার্ট রিমাইন্ডার",
  "Diary Sync": "ডায়েরি সিঙ্ক",
  Hydration: "হাইড্রেশন",
  Sleep: "ঘুম",
  Move: "মুভ",
  Weight: "ওজন",
  "Custom ml": "কাস্টম মিলি",
  Hours: "ঘণ্টা",
  Min: "মিনিট",
  Log: "লগ",
  Add: "যোগ করুন",
  Delete: "ডিলিট",
  Remove: "মুছুন",
  "this item": "এই আইটেম",
  "from the diary?": "ডায়েরি থেকে?",
  "Undo Delete": "ডিলিট আনডু",
  "Meal Removed": "মিল মুছে দেওয়া হয়েছে",
  "Undo is available until you delete another meal": "আরেকটি মিল ডিলিট করার আগে পর্যন্ত আনডু করা যাবে",
  "Custom Meals": "কাস্টম মিল",
  "Save and log premium meal combinations": "প্রিমিয়াম মিল কম্বিনেশন সেভ ও লগ করুন",
  "Premium water, meal, sleep, and exercise nudges": "পানি, মিল, ঘুম ও ব্যায়ামের প্রিমিয়াম রিমাইন্ডার",
  "Daily Summary": "দৈনিক সারাংশ",
  "Start with one quick log today to build momentum.": "আজ একটি দ্রুত লগ দিয়ে শুরু করুন।",
  days: "দিন",
  "Water amount": "পানির পরিমাণ",
  "Enter a valid water amount.": "সঠিক পানির পরিমাণ লিখুন।",
  "Water log failed": "পানি লগ হয়নি",
  "Weight log failed": "ওজন লগ হয়নি",
  "Exercise log failed": "ব্যায়াম লগ হয়নি",
  "Sleep log failed": "ঘুম লগ হয়নি",
  "Enter a valid weight in kg.": "কেজিতে সঠিক ওজন লিখুন।",
  "Enter exercise duration in minutes.": "মিনিটে ব্যায়ামের সময় লিখুন।",
  "Enter sleep hours.": "ঘুমের ঘণ্টা লিখুন।",
  "Could not edit meal": "মিল এডিট করা যায়নি",
  "Could not delete meal": "মিল ডিলিট করা যায়নি",
  "Edit meal": "মিল এডিট",
  "Delete meal": "মিল ডিলিট",
  "Meal entry": "মিল এন্ট্রি",
  "Undo failed": "আনডু হয়নি",
  "Add your first weight log": "আপনার প্রথম ওজন লগ করুন",
  "Weight kg": "ওজন কেজি",
  "Please try again.": "আবার চেষ্টা করুন।",
  "My Appointments": "আমার অ্যাপয়েন্টমেন্ট",
  Account: "অ্যাকাউন্ট",
  Provider: "প্রোভাইডার",
  Plan: "প্ল্যান",
  Free: "ফ্রি",
  Joined: "যোগ দিয়েছেন",
  "Member since": "মেম্বার",
  "Your saved onboarding and profile details.": "আপনার সেভ করা অনবোর্ডিং ও প্রোফাইল তথ্য।",
  "A quick glance at today's baseline stats.": "আজকের মূল স্ট্যাট দ্রুত দেখে নিন।",
  "Smart reminders": "স্মার্ট রিমাইন্ডার",
  "Meal reminders and progress nudges throughout the day.": "দিনজুড়ে মিল রিমাইন্ডার ও প্রগ্রেস নাজ।",
  "Your signed-in identity and support tools.": "আপনার সাইন-ইন পরিচয় ও সাপোর্ট টুলস।",
  "Upgrade to Premium": "প্রিমিয়ামে আপগ্রেড করুন",
  "Unlock advanced insights and tailored plans": "অ্যাডভান্সড ইনসাইট ও কাস্টম প্ল্যান আনলক করুন",
  "Help and Support": "হেল্প ও সাপোর্ট",
  "FAQs, troubleshooting, and contact options": "FAQ, সমস্যা সমাধান ও যোগাযোগের অপশন",
  "Sign Out": "সাইন আউট",
  "Book Doctor": "ডাক্তার বুক করুন",
  "Ask about symptoms, nutrition, sleep, stress, and wellness":
    "লক্ষণ, পুষ্টি, ঘুম, স্ট্রেস ও ওয়েলনেস সম্পর্কে জিজ্ঞাসা করুন",
  "Search NutriMed by CMC": "নিউট্রিমেড বাই সিএমসি সার্চ করুন",
  "Good morning": "সুপ্রভাত",
  "Good afternoon": "শুভ দুপুর",
  "Good evening": "শুভ সন্ধ্যা",
  "Today": "আজ",
  "This week": "এই সপ্তাহ",
  "Save": "সেভ",
  "Cancel": "বাতিল",
  "Done": "সম্পন্ন",
  "Try again": "আবার চেষ্টা করুন",
  Loading: "লোড হচ্ছে",
  "No orders yet": "এখনও কোনো অর্ডার নেই",
  "Start shopping medicines and wellness products. Your order tracking will show here.":
    "ওষুধ ও ওয়েলনেস পণ্য কেনা শুরু করুন। আপনার অর্ডার ট্র্যাকিং এখানে দেখাবে।",
};

const dictionaries: Record<AppLanguage, Record<string, string>> = {
  en: {},
  bn,
};

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((storedLanguage) => {
        if (isMounted && (storedLanguage === "en" || storedLanguage === "bn")) {
          setLanguageState(storedLanguage);
        }
      })
      .catch(() => null);

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const toggleLanguage = useCallback(async () => {
    await setLanguage(language === "en" ? "bn" : "en");
  }, [language, setLanguage]);

  const t = useCallback(
    (text: string) => {
      if (!text) return text;
      return dictionaries[language][text] || text;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
