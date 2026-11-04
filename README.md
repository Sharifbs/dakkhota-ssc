# Dakkhota | SSC ব্যবসায় শিক্ষা

SSC (ব্যবসায় শিক্ষা) হিসাববিজ্ঞান, ফিন্যান্স ও ব্যাংকিং এবং ব্যবসায় উদ্যোগের অধ্যায়ভিত্তিক ডিজিটাল বই।

এটি একটি static website। কোনো build বা server লাগে না।

## Vercel-এ deploy
1. এই ফোল্ডারটি একটি GitHub repository-তে upload করুন।
2. vercel.com → Add New → Project → repository টি Import করুন।
3. Framework Preset: **Other**। Build Command ও Output Directory খালি রাখুন।
4. Deploy চাপুন।

## ফোল্ডার
- `index.html`, `style.css`, `app.js`: ওয়েবসাইট
- `data/books.js`: বই ও অধ্যায়ের তালিকা
- `data/acc/chNN.js`: প্রতিটি অধ্যায়ের কনটেন্ট
- `img/`: লোগো ও বইয়ের পাতা

## মোবাইল অ্যাপ (PWA)
- সাইট খুললে উপরে "📲 অ্যাপ ইনস্টল" বাটন আসে (Android/Chrome)। iPhone-এ Safari → Share → Add to Home Screen।
- একবার খোলার পর সব অধ্যায়ের লেখা অফলাইনেও পড়া যায়; বইয়ের পাতার ছবি যেগুলো দেখা হয়েছে সেগুলো অফলাইনে থাকে।

## আপডেট দেওয়ার নিয়ম
1. নতুন/পরিবর্তিত ফাইল GitHub-এ আপলোড করুন (যেমন `data/acc/ch03.js`)।
2. `sw.js` ফাইলের প্রথম দিকে `VERSION` এর মান একটু বদলে দিন (যেমন `dk-2026-11-04-1` → `dk-2026-11-20-1`) এবং সেটিও আপলোড করুন।
3. ব্যবহারকারীরা অ্যাপ খুললেই "🔄 নতুন আপডেট এসেছে · আপডেট করো" দেখবে।
