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
