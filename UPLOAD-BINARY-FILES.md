# آپ‌لود فایل‌های باینری

## ⚠️ فایل‌های زیر باید به صورت دستی آپ‌لود شوند:

### فایل‌های .ex5 (اجرایی)
1. **fibo.auto.ex5** (75 KB)
   - مقصد: `products/ea/fibo-auto/fibo.auto.ex5`
   
2. **FVG_MTF_Pro_v4.ex5** (92 KB)
   - مقصد: `products/indicators/fvg-mtf-pro/FVG_MTF_Pro_v4.ex5`
   
3. **MultiThemeCandleAndBG.ex5** (26 KB)
   - مقصد: `products/indicators/multi-theme-candle/MultiThemeCandleAndBG.ex5`

### تصاویر پیش‌نمایش
1. **preview.png** (Fibo Auto)
   - مقصد: `products/ea/fibo-auto/preview.png`
   
2. **preview.png** (FVG MTF Pro)
   - مقصد: `products/indicators/fvg-mtf-pro/preview.png`
   
3. **preview.png** (MultiTheme Candle)
   - مقصد: `products/indicators/multi-theme-candle/preview.png`
   
4. **preview.png** (Scalper Execution)
   - مقصد: `products/ea/scalper-execution/preview.png`

## روش آپ‌لود:

### Git CLI (پیشنهادی)
```bash
# Clone مخزن
git clone https://github.com/aminlore030-dot/mt5-free-tools.git
cd mt5-free-tools

# کپی فایل‌ها به مکان صحیح
cp fibo.auto.ex5 products/ea/fibo-auto/
cp FVG_MTF_Pro_v4.ex5 products/indicators/fvg-mtf-pro/
cp MultiThemeCandleAndBG.ex5 products/indicators/multi-theme-candle/

cp fibo.png products/ea/fibo-auto/preview.png
cp fvg.png products/indicators/fvg-mtf-pro/preview.png
cp multi.png products/indicators/multi-theme-candle/preview.png
cp scalper.png products/ea/scalper-execution/preview.png

# Commit و Push
git add products/
git commit -m "feat: add binary files and preview images"
git push origin main
```

### GitHub Web Interface
1. برو به [این لینک](https://github.com/aminlore030-dot/mt5-free-tools)
2. کلیک کن "Add file" > "Upload files"
3. فایل‌ها را drag-and-drop کن
4. در مسیر صحیح قرار بده
5. Commit کن

## وضعیت فعلی:

✅ product.json - تمام محصولات
✅ کد منبع (.mq5) - تمام فایل‌ها
❌ فایل‌های اجرایی (.ex5) - نیاز به آپ‌لود
❌ تصاویر پیش‌نمایش - نیاز به آپ‌لود

