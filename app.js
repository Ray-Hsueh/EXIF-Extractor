(() => {
  'use strict'

  /** @type {any} */
  const exifrLib = window.exifr
  /** @type {any} */
  const ExifReader = window.ExifReader

  const dropzoneElement = document.getElementById('dropzone')
  const fileInputElement = document.getElementById('file-input')
  const resultsElement = document.getElementById('results')
  const clearButtonElement = document.getElementById('clear-button')
  const langToggleButton = document.getElementById('lang-toggle')
  const urlInputElement = document.getElementById('url-input')
  const analyzeUrlButton = document.getElementById('analyze-url')
  const pasteButton = document.getElementById('paste-button')
  const exportJsonButton = document.getElementById('export-json')
  const exportCsvButton = document.getElementById('export-csv')
  const exportPdfButton = document.getElementById('export-pdf')
  const browseLabelElement = document.querySelector('.browse-button')
  const langSegmentButtons = Array.from(document.querySelectorAll('.segmented .segment'))

  // i18n
  const MESSAGES = {
    'en': {
      title: 'EXIF Extractor',
      subtitle: 'All parsing happens locally. No photos are uploaded.',
      dropTitle: 'Drag photos here',
      or: 'or',
      chooseFiles: 'Choose files',
      hint: 'Supports JPG, PNG, HEIC, AVIF, TIFF, NEF… Recommended single file ≤ 50MB.',
      clear: 'Clear results',
      exifrLoadFail: 'Failed to load exifr. Please check your network and retry.',
      statusNoExif: 'No EXIF data found',
      camera: 'Camera', lens: 'Lens', time: 'Time', iso: 'ISO', aperture: 'Aperture', shutter: 'Shutter', focal: 'Focal length', gps: 'GPS', error: 'Error',
      map: 'Open in Google Maps',
      copy: 'Copy JSON', copied: 'Copied!', copyFail: 'Copy failed', jsonSummary: 'View full JSON',
      ariaDropzone: 'Drag and drop or click to upload photos',
      analyzeUrl: 'Analyze URL', pasteImage: 'Paste image', urlPlaceholder: 'Paste image URL',
      urlEmpty: 'Please enter an image URL', urlFetchFail: 'Failed to fetch image. The server may block CORS.',
      pasteNotAllowed: 'Clipboard image access was denied or unsupported.',
      exportJSON: 'Export JSON', exportCSV: 'Export CSV',
      // added for status badge
      edited: 'Edited',
      original: 'Original',
      noExifShort: 'No EXIF',
      // new labels
      software: 'Software',
      rawInfo: 'RAW details', bitDepth: 'Bit depth', compression: 'Compression', whiteBalance: 'White balance',
      makerNote: 'MakerNote',
      hashMD5: 'MD5', hashSHA256: 'SHA-256',
      digitalSignature: 'Digital signature', signaturePresent: 'Present', signatureAbsent: 'Not detected',
      exportPDF: 'Export PDF',
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
      removeCard: 'Remove card',
      copyCoords: 'Copy coords',
      copyMain: 'Copy summary',
    },
    'zh-Hant': {
      title: 'EXIF 解析器',
      subtitle: '所有解析在瀏覽器本地進行，不會上傳照片。',
      dropTitle: '拖曳照片到這裡',
      or: '或',
      chooseFiles: '點擊選取檔案',
      hint: '支援 JPG、PNG、HEIC、AVIF、TIFF、NEF… 建議單檔 ≤ 50MB。',
      clear: '清除結果',
      exifrLoadFail: 'exifr 載入失敗，請檢查網路或稍後再試。',
      statusNoExif: '找不到 EXIF 資料',
      camera: '相機', lens: '鏡頭', time: '時間', iso: 'ISO', aperture: '光圈', shutter: '快門', focal: '焦距', gps: 'GPS', error: '錯誤',
      map: '在 Google Maps 開啟',
      copy: '複製 JSON', copied: '已複製!', copyFail: '複製失敗', jsonSummary: '查看完整 JSON',
      ariaDropzone: '拖曳或點擊上傳照片',
      analyzeUrl: '分析網址', pasteImage: '貼上圖片', urlPlaceholder: '貼上圖片網址',
      urlEmpty: '請輸入圖片網址', urlFetchFail: '圖片下載失敗，來源可能未允許跨來源存取（CORS）。',
      pasteNotAllowed: '無法讀取剪貼簿圖片，可能是權限被拒或瀏覽器不支援。',
      exportJSON: '匯出 JSON', exportCSV: '匯出 CSV',
      // added for status badge
      edited: '已修改',
      original: '原始',
      noExifShort: '無 EXIF',
      // new labels
      software: '軟體',
      rawInfo: 'RAW 詳細', bitDepth: '位元深度', compression: '壓縮模式', whiteBalance: '白平衡',
      makerNote: 'MakerNote',
      hashMD5: 'MD5', hashSHA256: 'SHA-256',
      digitalSignature: '數位簽章', signaturePresent: '已偵測', signatureAbsent: '未偵測',
      exportPDF: '匯出 PDF',
      expandAll: '全部展開',
      collapseAll: '全部收起',
      removeCard: '刪除卡片',
      copyCoords: '複製座標',
      copyMain: '複製主要欄位',
    },
    'es': {
      title: 'Extractor EXIF',
      subtitle: 'Todo el análisis se realiza localmente. No se suben fotos.',
      dropTitle: 'Arrastra fotos aquí',
      or: 'o',
      chooseFiles: 'Elegir archivos',
      hint: 'Compatible con JPG, PNG, HEIC, AVIF, TIFF, NEF… Se recomienda archivo individual ≤ 50 MB.',
      clear: 'Limpiar resultados',
      exifrLoadFail: 'No se pudo cargar exifr. Verifica tu red e inténtalo de nuevo.',
      statusNoExif: 'No se encontraron datos EXIF',
      camera: 'Cámara', lens: 'Objetivo', time: 'Hora', iso: 'ISO', aperture: 'Apertura', shutter: 'Obturación', focal: 'Longitud focal', gps: 'GPS', error: 'Error',
      map: 'Abrir en Google Maps',
      copy: 'Copiar JSON', copied: '¡Copiado!', copyFail: 'Error al copiar', jsonSummary: 'Ver JSON completo',
      ariaDropzone: 'Arrastra y suelta o haz clic para subir fotos',
      analyzeUrl: 'Analizar URL', pasteImage: 'Pegar imagen', urlPlaceholder: 'Pega la URL de la imagen',
      urlEmpty: 'Ingresa una URL de imagen', urlFetchFail: 'Error al descargar imagen. El servidor podría bloquear CORS.',
      pasteNotAllowed: 'No se pudo acceder al portapapeles o no es compatible.',
      exportJSON: 'Exportar JSON', exportCSV: 'Exportar CSV',
      // added for status badge
      edited: 'Editado',
      original: 'Original',
      noExifShort: 'Sin EXIF',
      // new labels
      software: 'Software',
      rawInfo: 'Detalles RAW', bitDepth: 'Profundidad de bits', compression: 'Compresión', whiteBalance: 'Balance de blancos',
      makerNote: 'MakerNote',
      hashMD5: 'MD5', hashSHA256: 'SHA-256',
      digitalSignature: 'Firma digital', signaturePresent: 'Presente', signatureAbsent: 'No detectado',
      exportPDF: 'Exportar PDF',
      expandAll: 'Expandir todo',
      collapseAll: 'Contraer todo',
      removeCard: 'Eliminar tarjeta',
      copyCoords: 'Copiar coordenadas',
      copyMain: 'Copiar resumen',
    },
    'fr': {
      title: 'Extracteur EXIF',
      subtitle: 'Toutes les analyses sont effectuées localement. Aucune photo n\'est envoyée.',
      dropTitle: 'Glissez des photos ici',
      or: 'ou',
      chooseFiles: 'Choisir des fichiers',
      hint: 'Prend en charge JPG, PNG, HEIC, AVIF, TIFF, NEF… Fichier unique recommandé ≤ 50 Mo.',
      clear: 'Effacer les résultats',
      exifrLoadFail: "Échec du chargement d'exifr. Vérifiez votre réseau et réessayez.",
      statusNoExif: 'Aucune donnée EXIF trouvée',
      camera: 'Appareil photo', lens: 'Objectif', time: 'Heure', iso: 'ISO', aperture: 'Ouverture', shutter: 'Vitesse', focal: 'Distance focale', gps: 'GPS', error: 'Erreur',
      map: 'Ouvrir dans Google Maps',
      copy: 'Copier le JSON', copied: 'Copié !', copyFail: 'Échec de la copie', jsonSummary: 'Voir le JSON complet',
      ariaDropzone: 'Glissez-déposez ou cliquez pour importer des photos',
      analyzeUrl: 'Analyser l\'URL', pasteImage: 'Coller l\'image', urlPlaceholder: 'Coller l\'URL de l\'image',
      urlEmpty: 'Veuillez entrer une URL d\'image', urlFetchFail: 'Échec du chargement de l\'image. Le serveur peut bloquer CORS.',
      pasteNotAllowed: 'Accès au presse‑papiers refusé ou non pris en charge.',
      exportJSON: 'Exporter le JSON', exportCSV: 'Exporter le CSV',
      edited: 'Modifié',
      original: 'Original',
      noExifShort: 'Sans EXIF',
      software: 'Logiciel',
      rawInfo: 'Détails RAW', bitDepth: 'Profondeur de bits', compression: 'Compression', whiteBalance: 'Balance des blancs',
      makerNote: 'MakerNote',
      hashMD5: 'MD5', hashSHA256: 'SHA-256',
      digitalSignature: 'Signature numérique', signaturePresent: 'Présente', signatureAbsent: 'Non détectée',
      exportPDF: 'Exporter en PDF',
      expandAll: 'Tout développer',
      collapseAll: 'Tout réduire',
      removeCard: 'Supprimer la carte',
      copyCoords: 'Copier les coordonnées',
      copyMain: 'Copier le résumé',
    },
    'ar': {
      title: 'مستخرج EXIF',
      subtitle: 'تتم جميع المعالجة محليًا. لا يتم رفع أي صور.',
      dropTitle: 'اسحب الصور هنا',
      or: 'أو',
      chooseFiles: 'اختر الملفات',
      hint: 'يدعم JPG وPNG وHEIC وAVIF وTIFF وNEF… يُنصح بأن يكون حجم الملف الواحد ≤ 50 ميجابايت.',
      clear: 'مسح النتائج',
      exifrLoadFail: 'فشل تحميل exifr. يرجى التحقق من الشبكة والمحاولة مرة أخرى.',
      statusNoExif: 'لا توجد بيانات EXIF',
      camera: 'الكاميرا', lens: 'العدسة', time: 'الوقت', iso: 'ISO', aperture: 'فتحة العدسة', shutter: 'سرعة الغالق', focal: 'البعد البؤري', gps: 'GPS', error: 'خطأ',
      map: 'افتح في خرائط Google',
      copy: 'نسخ JSON', copied: 'تم النسخ!', copyFail: 'فشل النسخ', jsonSummary: 'عرض JSON الكامل',
      ariaDropzone: 'اسحب وأفلت أو انقر لرفع الصور',
      analyzeUrl: 'تحليل الرابط', pasteImage: 'لصق الصورة', urlPlaceholder: 'ألصق رابط الصورة',
      urlEmpty: 'يرجى إدخال رابط صورة', urlFetchFail: 'فشل جلب الصورة. قد يمنع الخادم CORS.',
      pasteNotAllowed: 'الوصول إلى الحافظة مرفوض أو غير مدعوم.',
      exportJSON: 'تصدير JSON', exportCSV: 'تصدير CSV',
      edited: 'معدّل',
      original: 'أصلي',
      noExifShort: 'بدون EXIF',
      software: 'البرنامج',
      rawInfo: 'تفاصيل RAW', bitDepth: 'عمق البت', compression: 'الضغط', whiteBalance: 'توازن اللون الأبيض',
      makerNote: 'MakerNote',
      hashMD5: 'MD5', hashSHA256: 'SHA-256',
      digitalSignature: 'التوقيع الرقمي', signaturePresent: 'موجود', signatureAbsent: 'غير موجود',
      exportPDF: 'تصدير PDF',
      expandAll: 'توسيع الكل',
      collapseAll: 'طي الكل',
      removeCard: 'إزالة البطاقة',
      copyCoords: 'نسخ الإحداثيات',
      copyMain: 'نسخ الملخص',
    },
    'hi': {
      title: 'EXIF एक्सट्रैक्टर',
      subtitle: 'सारी प्रोसेसिंग आपके ब्राउज़र में स्थानीय रूप से होती है। कोई फोटो अपलोड नहीं होती।',
      dropTitle: 'फोटो यहाँ खींचें',
      or: 'या',
      chooseFiles: 'फ़ाइलें चुनें',
      hint: 'JPG, PNG, HEIC, AVIF, TIFF, NEF… समर्थित। एकल फ़ाइल ≤ 50MB सुझाव।',
      clear: 'परिणाम साफ़ करें',
      exifrLoadFail: 'exifr लोड विफल। कृपया नेटवर्क जाँचें और पुनः प्रयास करें।',
      statusNoExif: 'EXIF डेटा नहीं मिला',
      camera: 'कैमरा', lens: 'लेंस', time: 'समय', iso: 'ISO', aperture: 'एपर्चर', shutter: 'शटर', focal: 'फोकल लंबाई', gps: 'GPS', error: 'त्रुटि',
      map: 'Google Maps में खोलें',
      copy: 'JSON कॉपी करें', copied: 'कॉपी हो गया!', copyFail: 'कॉपी विफल', jsonSummary: 'पूर्ण JSON देखें',
      ariaDropzone: 'ड्रैग-एंड-ड्रॉप करें या क्लिक कर अपलोड करें',
      analyzeUrl: 'URL विश्लेषण', pasteImage: 'चित्र चिपकाएँ', urlPlaceholder: 'चित्र URL चिपकाएँ',
      urlEmpty: 'कृपया चित्र URL दर्ज करें', urlFetchFail: 'चित्र लाने में विफल। सर्वर CORS अवरोधित कर सकता है।',
      pasteNotAllowed: 'क्लिपबोर्ड एक्सेस अस्वीकृत या असमर्थित।',
      exportJSON: 'JSON निर्यात', exportCSV: 'CSV निर्यात',
      edited: 'संशोधित',
      original: 'मूल',
      noExifShort: 'EXIF नहीं',
      software: 'सॉफ्टवेयर',
      rawInfo: 'RAW विवरण', bitDepth: 'बिट गहराई', compression: 'कंप्रेशन', whiteBalance: 'व्हाइट बैलेंस',
      makerNote: 'MakerNote',
      hashMD5: 'MD5', hashSHA256: 'SHA-256',
      digitalSignature: 'डिजिटल हस्ताक्षर', signaturePresent: 'मौजूद', signatureAbsent: 'नहीं मिला',
      exportPDF: 'PDF निर्यात',
      expandAll: 'सभी फैलाएँ',
      collapseAll: 'सभी समेटें',
      removeCard: 'कार्ड हटाएँ',
      copyCoords: 'निर्देशांक कॉपी करें',
      copyMain: 'सार कॉपी करें',
    },
    'ur': {
      title: 'EXIF استخراج کنندہ',
      subtitle: 'تمام پراسیسنگ مقامی طور پر براؤزر میں ہوتی ہے۔ کوئی تصاویر اپ لوڈ نہیں ہوتیں۔',
      dropTitle: 'تصاویر یہاں کھینچیں',
      or: 'یا',
      chooseFiles: 'فائلیں منتخب کریں',
      hint: 'JPG، PNG، HEIC، AVIF، TIFF، NEF… معاون۔ ایک فائل ≤ 50MB کی سفارش۔',
      clear: 'نتائج صاف کریں',
      exifrLoadFail: 'exifr لوڈ کرنے میں ناکامی۔ براہ کرم نیٹ ورک چیک کریں اور دوبارہ کوشش کریں۔',
      statusNoExif: 'EXIF ڈیٹا نہیں ملا',
      camera: 'کیمرہ', lens: 'لینس', time: 'وقت', iso: 'ISO', aperture: 'اپرچر', shutter: 'شٹر', focal: 'فوکل لمبائی', gps: 'GPS', error: 'خرابی',
      map: 'Google Maps میں کھولیں',
      copy: 'JSON نقل کریں', copied: 'نقل ہو گیا!', copyFail: 'نقل ناکام', jsonSummary: 'مکمل JSON دیکھیں',
      ariaDropzone: 'ڈریگ اینڈ ڈراپ کریں یا اپ لوڈ کیلئے کلک کریں',
      analyzeUrl: 'URL کا تجزیہ', pasteImage: 'تصویر چسپاں کریں', urlPlaceholder: 'تصویر کا URL چسپاں کریں',
      urlEmpty: 'براہ کرم تصویر کا URL درج کریں', urlFetchFail: 'تصویر حاصل کرنے میں ناکامی۔ سرور CORS روک سکتا ہے۔',
      pasteNotAllowed: 'کلپ بورڈ رسائی مسترد یا غیر معاون۔',
      exportJSON: 'JSON برآمد کریں', exportCSV: 'CSV برآمد کریں',
      edited: 'ترمیم شدہ',
      original: 'اصلی',
      noExifShort: 'بغیر EXIF',
      software: 'سافٹ ویئر',
      rawInfo: 'RAW تفصیل', bitDepth: 'بٹ گہرائی', compression: 'کمپریشن', whiteBalance: 'وائٹ بیلنس',
      makerNote: 'MakerNote',
      hashMD5: 'MD5', hashSHA256: 'SHA-256',
      digitalSignature: 'ڈیجیٹل دستخط', signaturePresent: 'موجود', signatureAbsent: 'نہیں ملا',
      exportPDF: 'PDF برآمد',
      expandAll: 'سب پھیلا دیں',
      collapseAll: 'سب سمیٹ دیں',
      removeCard: 'کارڈ حذف کریں',
      copyCoords: 'کو آرڈینیٹس نقل کریں',
      copyMain: 'خلاصہ نقل کریں',
    },
    'ja': {
      title: 'EXIF エクストラクター',
      subtitle: '解析はすべてローカルで実行され、写真はアップロードされません。',
      dropTitle: 'ここに写真をドラッグ',
      or: 'または',
      chooseFiles: 'ファイルを選択',
      hint: 'JPG、PNG、HEIC、AVIF、TIFF、NEF… に対応。推奨: 単一ファイル ≤ 50MB。',
      clear: '結果をクリア',
      exifrLoadFail: 'exifr の読み込みに失敗しました。ネットワークを確認して再試行してください。',
      statusNoExif: 'EXIF データが見つかりません',
      camera: 'カメラ', lens: 'レンズ', time: '時刻', iso: 'ISO', aperture: '絞り', shutter: 'シャッター', focal: '焦点距離', gps: 'GPS', error: 'エラー',
      map: 'Google マップで開く',
      copy: 'JSON をコピー', copied: 'コピーしました', copyFail: 'コピーに失敗', jsonSummary: 'JSON を表示',
      ariaDropzone: 'ドラッグ＆ドロップ、またはクリックして写真をアップロード',
      analyzeUrl: 'URL を解析', pasteImage: '画像を貼り付け', urlPlaceholder: '画像の URL を貼り付け',
      urlEmpty: '画像 URL を入力してください', urlFetchFail: '画像の取得に失敗しました。サーバーが CORS をブロックしている可能性があります。',
      pasteNotAllowed: 'クリップボード画像へのアクセスが拒否された、または未対応です。',
      exportJSON: 'JSON を出力', exportCSV: 'CSV を出力',
      edited: '編集済み',
      original: 'オリジナル',
      noExifShort: 'EXIF なし',
      software: 'ソフトウェア',
      rawInfo: 'RAW 詳細', bitDepth: 'ビット深度', compression: '圧縮方式', whiteBalance: 'ホワイトバランス',
      makerNote: 'MakerNote',
      hashMD5: 'MD5', hashSHA256: 'SHA-256',
      digitalSignature: 'デジタル署名', signaturePresent: 'あり', signatureAbsent: 'なし',
      exportPDF: 'PDF を出力',
      expandAll: 'すべて展開',
      collapseAll: 'すべて折りたたむ',
      removeCard: 'カードを削除',
      copyCoords: '座標をコピー',
      copyMain: '概要をコピー',
    },
  }
  let currentLang = detectPreferredLang()
  const parsedResults = []

  function t(key) { return MESSAGES[currentLang][key] || key }

  function detectPreferredLang() {
    try {
      const saved = localStorage.getItem('exif_lang')
      if (saved && MESSAGES[saved]) return saved
    } catch {}
    const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']).map(s => String(s || '').toLowerCase())
    for (const s of langs) {
      if (s.startsWith('zh') && (s.includes('hant') || s.endsWith('-tw') || s.endsWith('-hk') || s.endsWith('-mo'))) return 'zh-Hant'
      if (s.startsWith('es')) return 'es'
      if (s.startsWith('fr')) return 'fr'
      if (s.startsWith('ar')) return 'ar'
      if (s.startsWith('hi')) return 'hi'
      if (s.startsWith('ur')) return 'ur'
      if (s.startsWith('ja')) return 'ja'
      if (s.startsWith('en')) return 'en'
    }
    return 'en'
  }

  function saveLangPreference(lang) {
    try { localStorage.setItem('exif_lang', lang) } catch {}
  }

  function applyStaticTexts() {
    const ids = {
      title: 'title', subtitle: 'subtitle', dropTitle: 'dz-title', or: 'dz-or', chooseFiles: 'browse-label', hint: 'dz-hint'
    }
    for (const [k, id] of Object.entries(ids)) {
      const el = document.getElementById(id)
      if (el) el.textContent = t(k)
    }
    if (clearButtonElement) clearButtonElement.textContent = t('clear')
    // button shows the NEXT language to switch to
    const seq = ['en','zh-Hant','es','fr','ar','hi','ur','ja']
    const nextLang = seq[(Math.max(0, seq.indexOf(currentLang)) + 1) % seq.length]
    if (langToggleButton) {
      langToggleButton.textContent = (
        nextLang === 'zh-Hant' ? '中文' :
        nextLang === 'es' ? 'ES' :
        nextLang === 'fr' ? 'FR' :
        nextLang === 'ar' ? 'العربية' :
        nextLang === 'hi' ? 'हिन्दी' :
        nextLang === 'ur' ? 'اردو' :
        nextLang === 'ja' ? '日本語' :
        'EN'
      )
    }
    if (dropzoneElement) dropzoneElement.setAttribute('aria-label', t('ariaDropzone'))
    // reflect current lang on <html>
    try { document.documentElement.lang = currentLang } catch {}
    try { document.documentElement.dir = (currentLang === 'ar' || currentLang === 'ur' ? 'rtl' : 'ltr') } catch {}

    // URL/Paste/Export controls text
    if (analyzeUrlButton) analyzeUrlButton.textContent = t('analyzeUrl')
    if (pasteButton) pasteButton.textContent = t('pasteImage')
    if (urlInputElement) urlInputElement.placeholder = t('urlPlaceholder')
    if (exportJsonButton) exportJsonButton.textContent = t('exportJSON')
    if (exportCsvButton) exportCsvButton.textContent = t('exportCSV')
    if (exportPdfButton) exportPdfButton.textContent = t('exportPDF')
    // tooltip content for supported formats
    const dzTooltip = document.getElementById('dz-tooltip')
    if (dzTooltip) dzTooltip.textContent = t('hint')

    // Expand/Collapse all buttons
    const expAll = document.getElementById('expand-all')
    if (expAll) { expAll.textContent = t('expandAll'); expAll.setAttribute('aria-label', t('expandAll')) }
    const colAll = document.getElementById('collapse-all')
    if (colAll) { colAll.textContent = t('collapseAll'); colAll.setAttribute('aria-label', t('collapseAll')) }

    // Refresh stats text to current language
    updateStats()
  }

  applyStaticTexts()

  if (langToggleButton) {
    langToggleButton.addEventListener('click', () => {
      const seq = ['en','zh-Hant','es','fr','ar','hi','ur','ja']
      const nextLang = seq[(Math.max(0, seq.indexOf(currentLang)) + 1) % seq.length]
      currentLang = nextLang
      applyStaticTexts()
      // 重新渲染目前結果卡片的欄位名稱
      rerenderAllCardsLabels()
      updateLangSegmentsActive()
      saveLangPreference(currentLang)
      updateStats()
    })
  }

  function updateLangSegmentsActive() {
    if (!langSegmentButtons || langSegmentButtons.length === 0) return
    langSegmentButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-lang') === currentLang
      btn.classList.toggle('is-active', isActive)
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false')
    })
  }

  function setupLangSegments() {
    if (!langSegmentButtons || langSegmentButtons.length === 0) return
    langSegmentButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang') || 'en'
        if (lang === currentLang) return
        currentLang = lang
        applyStaticTexts()
        rerenderAllCardsLabels()
        updateLangSegmentsActive()
        saveLangPreference(currentLang)
        updateStats()
      })
    })
    updateLangSegmentsActive()
  }

  setupLangSegments()

  function formatFileSize(bytes) {
    if (!Number.isFinite(bytes)) return ''
    const units = ['B','KB','MB','GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
  }

  function formatDate(value) {
    try {
      if (!value) return ''
      if (value instanceof Date) return value.toLocaleString(currentLang)
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString(currentLang)
    } catch { return String(value ?? '') }
  }

  function formatExposureTime(secondsValue) {
    if (!secondsValue || typeof secondsValue !== 'number') return ''
    if (secondsValue >= 1) return `${secondsValue.toFixed(2)} s`
    const denom = Math.round(1 / secondsValue)
    return `1/${denom}`
  }

  // Heuristics: detect if image likely edited (time delta, software tag)
  function isLikelyEdited(exif, fallback) {
    try {
      const dto = exif?.DateTimeOriginal || exif?.CreateDate
      const mdt = exif?.ModifyDate
      if (dto instanceof Date && mdt instanceof Date) {
        const delta = mdt.getTime() - dto.getTime()
        // 閾值：2 分鐘以上的時間差，視為曾修改（避免相機寫入的毫秒級差異）
        if (Number.isFinite(delta) && Math.abs(delta) > 2 * 60 * 1000) return true
      }
      const softwareRaw = exif?.Software || exif?.ProcessingSoftware || fallback?.exif?.Software?.description || fallback?.exif?.ProcessingSoftware?.description
      const software = typeof softwareRaw === 'string' ? softwareRaw : String(softwareRaw || '')
      const editorKeywords = ['Adobe', 'Lightroom', 'Photoshop', 'GIMP', 'Affinity', 'Pixelmator', 'Snapseed', 'WhatsApp', 'Instagram', 'LINE', 'VSCO', 'Afterlight', 'Canva']
      if (software && editorKeywords.some(k => software.includes(k))) return true
      return false
    } catch { return false }
  }

  // Try to extract an embeddable preview from RAW using ExifReader
  async function trySetRawPreviewFromFallback(ui, fallback) {
    try {
      if (!fallback) return
      const candidates = [
        fallback?.exif?.JpgFromRaw?.value,
        fallback?.exif?.PreviewImage?.value,
        fallback?.thumbnail?.ThumbnailImage?.value,
      ]
      let bytes = candidates.find(v => v && (v.byteLength || (Array.isArray(v) && v.length) || (v.buffer && v.byteLength !== undefined)))
      if (!bytes) return
      if (bytes instanceof ArrayBuffer) bytes = new Uint8Array(bytes)
      else if (bytes.buffer instanceof ArrayBuffer && bytes.byteLength !== undefined) bytes = new Uint8Array(bytes.buffer, bytes.byteOffset || 0, bytes.byteLength)
      if (!bytes || !bytes.byteLength) return
      const blob = new Blob([bytes], { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      const existingFallback = ui.header.querySelector('.file-thumb-fallback')
      const existingImg = ui.header.querySelector('img.file-thumb')
      const newImg = document.createElement('img')
      newImg.className = 'file-thumb'
      newImg.alt = existingImg?.alt || ''
      newImg.src = url
      newImg.addEventListener('load', () => setTimeout(() => URL.revokeObjectURL(url), 1000), { once: true })
      if (existingFallback) existingFallback.replaceWith(newImg)
      else if (existingImg && existingImg.naturalWidth === 0) existingImg.replaceWith(newImg)
    } catch {}
  }

  // Compute hashes for integrity checks
  async function computeHashesFromArrayBuffer(ab) {
    const md5 = (window.SparkMD5 && window.SparkMD5.ArrayBuffer) ? window.SparkMD5.ArrayBuffer.hash(ab) : ''
    let sha256 = ''
    try {
      if (crypto && crypto.subtle && ab) {
        const digest = await crypto.subtle.digest('SHA-256', ab)
        sha256 = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
      }
    } catch {}
    return { md5, sha256 }
  }

  function createCardSkeleton(file) {
    const article = document.createElement('article')
    article.className = 'card'

    const header = document.createElement('div')
    header.className = 'card-header'

    const img = document.createElement('img')
    img.className = 'file-thumb'
    img.alt = file.name
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl
    img.addEventListener('load', () => URL.revokeObjectURL(objectUrl), { once: true })
    // Fallback for RAW/unsupported previews
    const ext = (file.name.split('.').pop() || '').toUpperCase()
    const fallback = document.createElement('div')
    fallback.className = 'file-thumb file-thumb-fallback'
    fallback.textContent = ext.slice(0, 4) || 'IMG'
    img.onerror = () => { try { URL.revokeObjectURL(objectUrl) } catch {} img.replaceWith(fallback) }

    const meta = document.createElement('div')
    meta.className = 'file-meta'

    const nameEl = document.createElement('div')
    nameEl.className = 'file-name'
    nameEl.textContent = file.name

    const sizeEl = document.createElement('div')
    sizeEl.className = 'file-size'
    sizeEl.textContent = `${formatFileSize(file.size)}`

    // 新增：狀態顯示容器
    const statusEl = document.createElement('div')
    statusEl.className = 'file-status'

    meta.appendChild(nameEl)
    meta.appendChild(sizeEl)
    meta.appendChild(statusEl)

    header.appendChild(img)
    header.appendChild(meta)

    const body = document.createElement('div')
    body.className = 'card-body'

    const kv = document.createElement('div')
    kv.className = 'kv'

    const actions = document.createElement('div')
    actions.className = 'actions'

    // Collapsible JSON block
    const jsonDetails = document.createElement('details')
    jsonDetails.className = 'json-block'
    const jsonSummary = document.createElement('summary')
    jsonSummary.textContent = t('jsonSummary')
    const jsonPre = document.createElement('pre')
    jsonPre.className = 'json'
    jsonDetails.appendChild(jsonSummary)
    jsonDetails.appendChild(jsonPre)

    body.appendChild(kv)
    body.appendChild(actions)
    body.appendChild(jsonDetails)

    article.appendChild(header)
    article.appendChild(body)

    return { article, header, img, meta, kv, actions, jsonPre, statusEl }
  }

  function setDropzoneBusy(isBusy) {
    const busy = Boolean(isBusy)
    dropzoneElement.classList.toggle('is-busy', busy)
    const dzBusy = document.getElementById('dz-busy')
    const dzBusyText = document.getElementById('dz-busy-text')
    if (dzBusy) dzBusy.setAttribute('aria-hidden', busy ? 'false' : 'true')
    if (dropzoneElement) dropzoneElement.setAttribute('aria-busy', busy ? 'true' : 'false')
    if (dzBusyText) dzBusyText.textContent = (
      currentLang === 'en' ? 'Processing…' :
      currentLang === 'zh-Hant' ? '處理中…' :
      currentLang === 'es' ? 'Procesando…' :
      currentLang === 'fr' ? 'Traitement…' :
      'جارٍ المعالجة…'
    )
  }

  function addKV(kv, key, value) {
    const k = document.createElement('div')
    k.className = 'key'
    k.textContent = key
    const v = document.createElement('div')
    v.className = 'val'
    v.textContent = value ?? ''
    kv.appendChild(k)
    kv.appendChild(v)
    return { k, v }
  }

  // Re-render keys on language change; keep values intact
  function rerenderAllCardsLabels() {
    const keyMap = new Map([
      ['Camera', 'camera'], ['相機', 'camera'], ['Cámara', 'camera'],
      ['Appareil photo', 'camera'], ['Caméra', 'camera'], ['الكاميرا', 'camera'],
      ['Lens', 'lens'], ['鏡頭', 'lens'], ['Objetivo', 'lens'],
      ['Objectif', 'lens'], ['العدسة', 'lens'],
      ['Time', 'time'], ['時間', 'time'], ['Hora', 'time'],
      ['Heure', 'time'], ['الوقت', 'time'],
      ['ISO', 'iso'],
      ['Aperture', 'aperture'], ['光圈', 'aperture'], ['Apertura', 'aperture'],
      ['Ouverture', 'aperture'], ['فتحة العدسة', 'aperture'],
      ['Shutter', 'shutter'], ['快門', 'shutter'], ['Obturación', 'shutter'],
      ['Vitesse', 'shutter'], ['سرعة الغالق', 'shutter'],
      ['Focal length', 'focal'], ['焦距', 'focal'], ['Longitud focal', 'focal'],
      ['Distance focale', 'focal'], ['البعد البؤري', 'focal'],
      ['GPS', 'gps'],
      ['Error', 'error'], ['錯誤', 'error'], ['Error', 'error'], ['Erreur', 'error'], ['خطأ', 'error'],
      ['Status', 'status'], ['狀態', 'status'], ['Estado', 'status'], ['Statut', 'status'], ['الحالة', 'status'],
      ['Software', 'software'], ['軟體', 'software'], ['Software', 'software'], ['Logiciel', 'software'], ['البرنامج', 'software'],
    ])
    resultsElement.querySelectorAll('.card .kv .key').forEach(el => {
      const key = keyMap.get(el.textContent) || el.textContent
      switch (key) {
        case 'camera': el.textContent = t('camera'); break
        case 'lens': el.textContent = t('lens'); break
        case 'time': el.textContent = t('time'); break
        case 'iso': el.textContent = t('iso'); break
        case 'aperture': el.textContent = t('aperture'); break
        case 'shutter': el.textContent = t('shutter'); break
        case 'focal': el.textContent = t('focal'); break
        case 'gps': el.textContent = t('gps'); break
        case 'error': el.textContent = t('error'); break
        case 'status': el.textContent = (
          currentLang === 'en' ? 'Status' :
          currentLang === 'zh-Hant' ? '狀態' :
          currentLang === 'es' ? 'Estado' :
          currentLang === 'fr' ? 'Statut' :
          'الحالة'
        ); break
        case 'software': el.textContent = t('software'); break
        default: break
      }
    })
    // 更新動作按鈕文字（依據 data-action）與 JSON 摺疊標題
    resultsElement.querySelectorAll('.card .actions .btn').forEach(btn => {
      const act = btn.dataset.action || ''
      if (act === 'map') btn.textContent = t('map')
      else if (act === 'copy-json') btn.textContent = t('copy')
      else if (act === 'copy-main') btn.textContent = t('copyMain')
      else if (act === 'copy-coords') btn.textContent = t('copyCoords')
      else if (act === 'remove-card') btn.textContent = t('removeCard')
    })
    resultsElement.querySelectorAll('.json-block > summary').forEach(s => s.textContent = t('jsonSummary'))
    // 新增：更新檔案狀態徽章的文字
    resultsElement.querySelectorAll('.file-status [data-status]')
      .forEach(s => {
        const st = s.getAttribute('data-status')
        if (st === 'edited') s.textContent = t('edited')
        else if (st === 'original') s.textContent = t('original')
        else if (st === 'no-exif') s.textContent = t('noExifShort')
      })
  }

  // Serialize with aggressive trimming (omit binary/huge fields)
  function toSerializableTrimmed(obj) {
    const OMIT_KEYS = new Set([
      'ApplicationNotes','XMLPacket','MakerNote','UserComment','Thumbnail','image','ImageData','ICC','ICCProfile','ICC_Profile',
    ].map(k => k.toLowerCase()))
    const MAX_NUM_ARRAY = 200
    function isNumericArray(val) { return Array.isArray(val) && val.length > 0 && val.every(n => typeof n === 'number') }
    return JSON.parse(JSON.stringify(obj, (key, val) => {
      if (val instanceof Date) return val.toISOString()
      if (typeof val === 'bigint') return val.toString()
      if (key && OMIT_KEYS.has(String(key).toLowerCase())) return undefined
      if (val && typeof val === 'object' && val.id === 700) return undefined
      if (isNumericArray(val) && val.length > MAX_NUM_ARRAY) return `[omitted ${val.length} bytes]`
      if (val && (val.buffer instanceof ArrayBuffer || val instanceof ArrayBuffer || val instanceof DataView)) {
        const len = val.byteLength ?? (val.buffer?.byteLength || 0)
        return `[omitted binary ${len} bytes]`
      }
      if (typeof val === 'string' && val.length > 5000) return `${val.slice(0, 5000)}… [truncated]`
      return val
    }))
  }

  function pickGpsFromExifReader(tags) {
    try {
      if (!tags) return undefined
      const gpsGroup = tags.gps || tags.GPS || undefined
      if (gpsGroup && (gpsGroup.Latitude?.description ?? gpsGroup.Latitude) != null && (gpsGroup.Longitude?.description ?? gpsGroup.Longitude) != null) {
        const lat = typeof gpsGroup.Latitude === 'object' ? gpsGroup.Latitude.description ?? gpsGroup.Latitude.value : gpsGroup.Latitude
        const lon = typeof gpsGroup.Longitude === 'object' ? gpsGroup.Longitude.description ?? gpsGroup.Longitude.value : gpsGroup.Longitude
        const numLat = Number(lat); const numLon = Number(lon)
        if (Number.isFinite(numLat) && Number.isFinite(numLon)) return { latitude: numLat, longitude: numLon }
      }
      const lat2 = tags.GPSLatitude?.description ?? tags.GPSLatitude?.value
      const lon2 = tags.GPSLongitude?.description ?? tags.GPSLongitude?.value
      if (lat2 != null && lon2 != null) {
        const numLat = Number(lat2); const numLon = Number(lon2)
        if (Number.isFinite(numLat) && Number.isFinite(numLon)) return { latitude: numLat, longitude: numLon }
      }
    } catch {}
    return undefined
  }

  // Export helpers
  function nowTimestamp() {
    const d = new Date()
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  }
  function downloadBlob(blob, filename) {
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  function toCsvCell(val) {
    if (val == null) return '""'
    let s = ''
    if (val instanceof Date) s = val.toISOString()
    else s = String(val)
    s = s.replace(/"/g, '""')
    return `"${s}` + `"`
  }
  function toCsvRow(arr) { return arr.map(toCsvCell).join(',') }
  function updateExportButtonsDisabledState() {
    const noParsed = parsedResults.length === 0
    const noCards = resultsElement.querySelectorAll('.card').length === 0
    if (exportJsonButton) exportJsonButton.disabled = noParsed
    if (exportCsvButton) exportCsvButton.disabled = noParsed
    if (exportPdfButton) exportPdfButton.disabled = noCards
  }

  // Ensure the busy overlay has a chance to render before heavy work starts
  function waitForNextFrame(times = 1) {
    return new Promise(resolve => {
      const tick = (n) => {
        if (n <= 0) return resolve()
        requestAnimationFrame(() => tick(n - 1))
      }
      tick(times)
    })
  }

  function composeStatsText(n, gps, edited) {
    try {
      if (currentLang === 'zh-Hant') return `已解析 ${n} 檔｜有 GPS ${gps} 檔｜判定已修改 ${edited} 檔`
      if (currentLang === 'es') return `Analizados ${n} | Con GPS ${gps} | Editados ${edited}`
      if (currentLang === 'fr') return `Analysés ${n} | GPS ${gps} | Modifiés ${edited}`
      if (currentLang === 'ar') return `تم التحليل ${n} | يحتوي على GPS ${gps} | معدَّلة ${edited}`
      if (currentLang === 'hi') return `अनुसरण किया ${n} | GPS ${gps} | संशोधित ${edited}`
      if (currentLang === 'ur') return `تحلیل کیا ہے ${n} | GPS ${gps} | ترمیم شدہ ${edited}`
      if (currentLang === 'ja') return `解析済み ${n} 件｜GPS あり ${gps} 件｜編集と判定 ${edited} 件`
      return `Parsed ${n} | GPS ${gps} | Edited ${edited}`
    } catch {
      return `Parsed ${n} | GPS ${gps} | Edited ${edited}`
    }
  }

  function updateStats() {
    const el = document.getElementById('stats')
    if (!el) return
    const cards = Array.from(resultsElement.querySelectorAll('.card'))
    const n = cards.length
    const gps = cards.filter(c => c.dataset.hasGps === 'true').length
    const edited = cards.filter(c => c.querySelector('.file-status [data-status="edited"]')).length
    el.textContent = composeStatsText(n, gps, edited)
  }

  async function exportAsJSON() {
    if (parsedResults.length === 0) return
    const blob = new Blob([JSON.stringify(parsedResults, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `exif-export-${nowTimestamp()}.json`)
  }
  function exportAsCSV() {
    if (parsedResults.length === 0) return
    const headers = ['FileName','FileSize','Make','Model','Lens','ISO','FNumber','ExposureTime','FocalLength','DateTimeOriginal','GPSLatitude','GPSLongitude']
    const rows = parsedResults.map(r => {
      const s = r.summary || {}
      return [
        s.fileName ?? r.fileName ?? '',
        s.fileSize ?? r.fileSize ?? '',
        s.make ?? '', s.model ?? '', s.lens ?? '',
        s.iso ?? '', s.fNumber ?? '', s.exposureTime ?? '',
        s.focalLength ?? '', s.dateTime ?? '',
        s.gpsLatitude ?? '', s.gpsLongitude ?? '',
      ]
    })
    const csv = [headers, ...rows].map(toCsvRow).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    downloadBlob(blob, `exif-export-${nowTimestamp()}.csv`)
  }
  async function exportAsPDF() {
    try {
      const cards = Array.from(document.querySelectorAll('.card'))
      if (!cards.length) return
      const jsPDF = window.jspdf && window.jspdf.jsPDF
      if (!jsPDF) { alert('jsPDF not loaded'); return }
      if (!window.html2canvas) { alert('html2canvas not loaded'); return }

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const margin = 24

      const root = document.getElementById('pdf-report-root')
      if (!root) { alert('root missing'); return }
      root.innerHTML = ''

      function mk(k, cls, text){ const el = document.createElement(k); if (cls) el.className = cls; if (text != null) el.textContent = text; return el }
      function line(k,v){
        const kEl = mk('div','key',k)
        const vEl = mk('div','val',v)
        return [kEl,vEl]
      }

      for (let idx = 0; idx < cards.length; idx++) {
        const card = cards[idx]
        // 讀取原卡片資訊
        const name = card.querySelector('.file-name')?.textContent || ''
        const size = card.querySelector('.file-size')?.textContent || ''
        const statusText = card.querySelector('.file-status .badge')?.textContent || ''
        const statusIsDanger = card.querySelector('.file-status .badge')?.classList.contains('danger')
        const imgEl = card.querySelector('img.file-thumb')

        const tablePairs = []
        const keys = Array.from(card.querySelectorAll('.kv .key')).map(k => k.textContent)
        const vals = Array.from(card.querySelectorAll('.kv .val')).map(v => v.textContent)
        for (let i=0;i<Math.min(keys.length, vals.length);i++) {
          const k = keys[i]; const v = vals[i]
          // 過濾掉 Status/JSON 之類不必要的
          if (!k || !v) continue
          tablePairs.push([k, v])
        }

        // 建立漂亮頁面 DOM
        const page = mk('div','pdf-page')
        const header = mk('div','pdf-header')
        header.appendChild(mk('div','pdf-title', t('title')))
        const meta = mk('div','pdf-meta', new Date().toLocaleString(currentLang))
        header.appendChild(meta)
        page.appendChild(header)

        const body = mk('div','pdf-body')
        const left = mk('div')
        // 縮圖
        if (imgEl) {
          const thumb = mk('img','pdf-thumb')
          try {
            const c = document.createElement('canvas')
            const w = imgEl.naturalWidth || 0
            const h = imgEl.naturalHeight || 0
            if (w > 0 && h > 0) {
              c.width = w; c.height = h
              const ctx = c.getContext('2d')
              if (ctx) { ctx.drawImage(imgEl, 0, 0, w, h); thumb.src = c.toDataURL('image/jpeg', 0.92) }
            } else {
              thumb.src = imgEl.src
            }
          } catch { thumb.src = imgEl.src }
          left.appendChild(thumb)
        }
        // 檔名/大小/狀態
        const fileinfo = mk('div','pdf-fileinfo', `${name}\n${size}`)
        left.appendChild(fileinfo)
        if (statusText) {
          const badge = mk('span',`pdf-badge ${statusIsDanger ? 'danger' : ''}`, statusText)
          left.appendChild(badge)
        }
        body.appendChild(left)

        const right = mk('div')
        const sec1 = mk('div','pdf-section')
        sec1.appendChild(mk('div','pdf-section-title','Metadata'))
        const table = mk('div','pdf-table')
        tablePairs.forEach(([k,v]) => { const [a,b] = line(k,v); table.appendChild(a); table.appendChild(b) })
        sec1.appendChild(table)
        right.appendChild(sec1)
        body.appendChild(right)

        const footer = mk('div','pdf-footer', `Generated by EXIF Extractor • ${location.href}`)

        page.appendChild(body)
        page.appendChild(footer)
        root.appendChild(page)

        // 轉為 canvas 並加入 PDF（同步逐頁）
        const canvas = await window.html2canvas(page, { backgroundColor: '#ffffff', scale: 2, useCORS: true, allowTaint: true })
        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const imgW = pageW - margin * 2
        const imgH = Math.min(pageH - margin * 2, Math.round(canvas.height * (imgW / canvas.width)))
        if (idx > 0) doc.addPage()
        doc.addImage(imgData, 'JPEG', margin, (pageH - imgH) / 2, imgW, imgH)
      }

      doc.save(`exif-report-${nowTimestamp()}.pdf`)
      root.innerHTML = ''
    } catch {}
  }

  async function parseOneFile(file) {
    // Build UI card first for immediate feedback
    const itemId = `id-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`
    const ui = createCardSkeleton(file)
    ui.article.dataset.id = itemId
    resultsElement.prepend(ui.article)

    // Always provide remove button
    const removeBtn = document.createElement('button')
    removeBtn.className = 'btn danger'
    removeBtn.textContent = t('removeCard')
    removeBtn.dataset.action = 'remove-card'
    removeBtn.addEventListener('click', () => {
      ui.article.remove()
      const idx = parsedResults.findIndex(r => r.id === itemId)
      if (idx >= 0) parsedResults.splice(idx, 1)
      updateExportButtonsDisabledState()
      updateStats()
    })
    ui.actions.appendChild(removeBtn)

    try {
      // Parse EXIF quickly, rotation, GPS, and file bytes in parallel
      const [exifrResult, rotation, exifrGps, fileAb] = await Promise.all([
        exifrLib.parse(file, true).catch(() => undefined),
        exifrLib.rotation(file).catch(() => undefined),
        exifrLib.gps ? exifrLib.gps(file).catch(() => undefined) : Promise.resolve(undefined),
        file.arrayBuffer().catch(() => undefined),
      ])

      if (rotation && rotation.css) {
        ui.img.style.transform = `rotate(${rotation.deg}deg) scale(${rotation.scaleX}, ${rotation.scaleY})`
      }

      // Use ExifReader as a fallback and also for RAW preview
      let exif = exifrResult
      let fallback = undefined
      let gps = {}
      if (exifrGps && exifrGps.latitude != null && exifrGps.longitude != null) {
        gps = { latitude: exifrGps.latitude, longitude: exifrGps.longitude }
      } else {
        gps = {
          latitude: exifrResult?.latitude ?? exifrResult?.GPSLatitude,
          longitude: exifrResult?.longitude ?? exifrResult?.GPSLongitude,
        }
      }

      const needsPreview = !!ui.header.querySelector('.file-thumb-fallback')
      if (((!exif || (gps.latitude == null || gps.longitude == null)) || needsPreview) && ExifReader) {
        try {
          const ab = fileAb || await file.arrayBuffer()
          fallback = await ExifReader.load(ab, { expanded: true })
          if (!exif) exif = fallback
          const gpsFromFallback = pickGpsFromExifReader(fallback)
          if (gpsFromFallback) gps = gpsFromFallback
          if (needsPreview) await trySetRawPreviewFromFallback(ui, fallback)
        } catch {}
      }

      if (!exif) {
        // No EXIF at all
        const badge = document.createElement('span')
        badge.className = 'badge'
        badge.setAttribute('data-status', 'no-exif')
        badge.textContent = t('noExifShort')
        ui.statusEl.appendChild(badge)
        addKV(
          ui.kv,
          currentLang === 'en' ? 'Status' :
          currentLang === 'zh-Hant' ? '狀態' :
          currentLang === 'es' ? 'Estado' :
          currentLang === 'fr' ? 'Statut' :
          'الحالة',
          t('statusNoExif')
        )
        // Update stats for cards without EXIF as well
        updateStats()
        return
      }

      // Edited/Original status badge
      const edited = isLikelyEdited(exif, fallback)
      const badge = document.createElement('span')
      badge.className = `badge ${edited ? 'danger' : 'success'}`
      badge.setAttribute('data-status', edited ? 'edited' : 'original')
      badge.textContent = edited ? t('edited') : t('original')
      ui.statusEl.appendChild(badge)
      ui.article.dataset.edited = String(edited)

      const make = exif.Make || exif.make || fallback?.exif?.Make?.description
      const model = exif.Model || exif.model || fallback?.exif?.Model?.description
      const lens = exif.LensModel || exif.Lens || exif.lensModel || fallback?.exif?.LensModel?.description
      const iso = exif.ISO || exif.iso || fallback?.exif?.ISO?.description
      const fnum = exif.FNumber || exif.ApertureValue || exif.fNumber || fallback?.exif?.FNumber?.description
      const exposure = exif.ExposureTime || exif.ShutterSpeedValue || exif.exposureTime || fallback?.exif?.ExposureTime?.description
      const focal = exif.FocalLengthIn35mmFormat || exif.FocalLength || exif.focalLength || fallback?.exif?.FocalLength?.description
      const dt = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate || fallback?.exif?.DateTimeOriginal?.description
      const softwareRaw = exif.Software || exif.ProcessingSoftware || fallback?.exif?.Software?.description || fallback?.exif?.ProcessingSoftware?.description
      const software = typeof softwareRaw === 'string' ? softwareRaw : String(softwareRaw || '')
      const dto = exif?.DateTimeOriginal || exif?.CreateDate
      const mdt = exif?.ModifyDate
      const timeSuspect = (dto instanceof Date && mdt instanceof Date) ? (Math.abs(mdt - dto) > 2 * 60 * 1000) : false
      const editorKeywords = ['Adobe', 'Lightroom', 'Photoshop', 'GIMP', 'Affinity', 'Pixelmator', 'Snapseed', 'WhatsApp', 'Instagram', 'LINE', 'VSCO', 'Afterlight', 'Canva']
      const swSuspect = software && editorKeywords.some(k => software.includes(k))

      addKV(ui.kv, t('camera'), [make, model].filter(Boolean).join(' '))
      addKV(ui.kv, t('lens'), lens || '')
      const timeRow = addKV(ui.kv, t('time'), formatDate(dt))
      if (timeSuspect) { timeRow.k.classList.add('is-suspect'); timeRow.v.classList.add('is-suspect'); timeRow.v.title = 'Modify time differs from original by > 2 min' }
      addKV(ui.kv, t('iso'), iso ? String(iso) : '')
      const exposureValue = (typeof exposure === 'number' ? exposure : Number(exposure))
      addKV(ui.kv, t('shutter'), formatExposureTime(exposureValue))
      addKV(ui.kv, t('focal'), focal ? `${String(focal)} mm` : '')
      if (software) {
        const swRow = addKV(ui.kv, t('software'), software)
        if (swSuspect) { swRow.k.classList.add('is-suspect'); swRow.v.classList.add('is-suspect'); swRow.v.title = 'Edited by software' }
      }

      const latNum = Number(gps.latitude)
      const lonNum = Number(gps.longitude)
      if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
        const mapLink = document.createElement('a')
        mapLink.className = 'btn'
        mapLink.href = `https://www.google.com/maps/search/?api=1&query=${latNum},${lonNum}`
        mapLink.target = '_blank'
        mapLink.rel = 'noopener'
        mapLink.textContent = t('map')
        mapLink.dataset.action = 'map'
        ui.actions.appendChild(mapLink)
        addKV(ui.kv, t('gps'), `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`)
        ui.article.dataset.hasGps = 'true'
        ui.article.dataset.lat = String(latNum)
        ui.article.dataset.lon = String(lonNum)
        const copyCoordsBtn = document.createElement('button')
        copyCoordsBtn.className = 'btn'
        copyCoordsBtn.textContent = t('copyCoords')
        copyCoordsBtn.dataset.action = 'copy-coords'
        copyCoordsBtn.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(`${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`); copyCoordsBtn.textContent = t('copied'); setTimeout(() => (copyCoordsBtn.textContent = t('copyCoords')), 1200) }
          catch { copyCoordsBtn.textContent = t('copyFail'); setTimeout(() => (copyCoordsBtn.textContent = t('copyCoords')), 1200) }
        })
        ui.actions.appendChild(copyCoordsBtn)
      } else {
        addKV(ui.kv, t('gps'), '—')
        ui.article.dataset.hasGps = 'false'
      }

      const copyBtn = document.createElement('button')
      copyBtn.className = 'btn'
      copyBtn.textContent = t('copy')
      copyBtn.dataset.action = 'copy-json'
      copyBtn.addEventListener('click', async () => {
        try {
          const payload2 = { exifr: toSerializableTrimmed(exifrResult), exifreader: toSerializableTrimmed(fallback) }
          await navigator.clipboard.writeText(JSON.stringify(payload2, null, 2))
          copyBtn.textContent = t('copied')
          setTimeout(() => (copyBtn.textContent = t('copy')), 1200)
        } catch {
          copyBtn.textContent = t('copyFail')
          setTimeout(() => (copyBtn.textContent = t('copy')), 1200)
        }
      })
      ui.actions.appendChild(copyBtn)

      const payload = { exifr: toSerializableTrimmed(exifrResult), exifreader: toSerializableTrimmed(fallback) }
      ui.jsonPre.textContent = JSON.stringify(payload, null, 2)

      // Summary for CSV/JSON export
      const summary = {
        fileName: file.name,
        fileSize: file.size,
        make: make || '',
        model: model || '',
        lens: lens || '',
        iso: iso ?? '',
        fNumber: (fnum != null ? Number(fnum) : ''),
        exposureTime: formatExposureTime(exposureValue),
        focalLength: (focal != null ? String(focal) : ''),
        dateTime: (dt instanceof Date ? dt.toISOString() : (dt ?? '')),
        gpsLatitude: (Number.isFinite(Number(gps.latitude)) ? Number(gps.latitude) : ''),
        gpsLongitude: (Number.isFinite(Number(gps.longitude)) ? Number(gps.longitude) : ''),
        software: software || ''
      }

      const copyMainBtn = document.createElement('button')
      copyMainBtn.className = 'btn'
      copyMainBtn.textContent = t('copyMain')
      copyMainBtn.dataset.action = 'copy-main'
      copyMainBtn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(JSON.stringify(summary, null, 2)); copyMainBtn.textContent = t('copied'); setTimeout(() => (copyMainBtn.textContent = t('copyMain')), 1200) }
        catch { copyMainBtn.textContent = t('copyFail'); setTimeout(() => (copyMainBtn.textContent = t('copyMain')), 1200) }
      })
      ui.actions.appendChild(copyMainBtn)

      parsedResults.push({ id: itemId, fileName: file.name, fileSize: file.size, summary, edited, exifr: payload.exifr, exifreader: payload.exifreader })

      // Hashes for file verification
      if (fileAb) {
        try {
          const { md5, sha256 } = await computeHashesFromArrayBuffer(fileAb)
          if (md5) addKV(ui.kv, 'MD5', md5)
          if (sha256) addKV(ui.kv, 'SHA-256', sha256)
        } catch {}
      }

      // RAW-only extras
      const ext = (file.name.split('.').pop() || '').toLowerCase()
      const isRaw = ['nef','cr2','cr3','arw','raf','rw2','orf','dng','srw','pef'].includes(ext)
      if (isRaw) {
        const bits = exif.BitsPerSample || fallback?.exif?.BitsPerSample?.description
        const bitDepth = Array.isArray(bits) ? Math.max(...bits.map(Number).filter(Number.isFinite)) : Number(bits)
        const comp = exif.Compression || fallback?.exif?.Compression?.description
        const wb = exif.WhiteBalance ?? fallback?.exif?.WhiteBalance?.description
        if (bitDepth) addKV(ui.kv, t('bitDepth'), String(bitDepth))
        if (comp != null) addKV(ui.kv, t('compression'), String(comp))
        if (wb != null) addKV(ui.kv, t('whiteBalance'), String(wb))
      }

      // Digital signature or digests presence
      const rawDigest = fallback?.exif?.OriginalRawFileDigest || exif?.OriginalRawFileDigest || fallback?.exif?.RawImageDigest || exif?.RawImageDigest
      addKV(ui.kv, t('digitalSignature'), rawDigest ? t('signaturePresent') : t('signatureAbsent'))

      // MakerNote snippet (first 64 bytes) and a few readable entries
      try {
        const mn = fallback?.exif?.MakerNote
        const val = mn?.value
        const bytes = val ? (val instanceof ArrayBuffer ? new Uint8Array(val) : (val.buffer ? new Uint8Array(val.buffer, val.byteOffset || 0, val.byteLength) : undefined)) : undefined
        let makerWrap = null
        if (bytes && bytes.byteLength) {
          makerWrap = document.createElement('div')
          makerWrap.className = 'makernote'
          const title = document.createElement('div')
          title.className = 'title'
          title.textContent = `${t('makerNote')} (${bytes.byteLength} bytes)`
          const pre = document.createElement('pre')
          const head = Array.from(bytes.slice(0, 64)).map(b => b.toString(16).padStart(2, '0')).join(' ')
          pre.textContent = `${head}${bytes.byteLength > 64 ? ' …' : ''}`
          makerWrap.appendChild(title)
          makerWrap.appendChild(pre)
        }
        const infoPairs = []
        const maybeGroups = [fallback?.makernote, fallback?.makerNote]
        for (const [gk, gv] of Object.entries(fallback || {})) {
          if (!gv || typeof gv !== 'object') continue
          const name = String(gk).toLowerCase()
          if (['exif','gps','thumbnail','interop','interoperability','iptc','xmp','icc','file'].includes(name)) continue
          if (name.includes('maker') || name.includes('canon') || name.includes('nikon') || name.includes('sony') || name.includes('fujifilm') || name.includes('panasonic') || name.includes('olympus') || name.includes('pentax') || name.includes('leica')) {
            maybeGroups.push(gv)
          }
        }
        const seen = new Set()
        for (const group of maybeGroups) {
          if (!group || typeof group !== 'object') continue
          for (const [k, v] of Object.entries(group)) {
            if (seen.has(k)) continue
            const desc = (v && (v.description != null ? v.description : v.value))
            if (desc == null) continue
            const valStr = Array.isArray(desc) ? desc.join(', ') : String(desc)
            if (valStr && valStr !== '[object Object]') {
              infoPairs.push([k, valStr])
              seen.add(k)
              if (infoPairs.length >= 30) break
            }
          }
          if (infoPairs.length >= 30) break
        }
        if (infoPairs.length > 0) {
          if (!makerWrap) {
            makerWrap = document.createElement('div')
            makerWrap.className = 'makernote'
            const title = document.createElement('div')
            title.className = 'title'
            title.textContent = t('makerNote')
            makerWrap.appendChild(title)
          }
          const table = document.createElement('div')
          table.className = 'info-table'
          for (const [k, v] of infoPairs) {
            const kk = document.createElement('div'); kk.className = 'key'; kk.textContent = k
            const vv = document.createElement('div'); vv.className = 'val'; vv.textContent = v
            table.appendChild(kk); table.appendChild(vv)
          }
          makerWrap.appendChild(table)
        }
        if (makerWrap) ui.article.querySelector('.card-body')?.appendChild(makerWrap)
      } catch {}

      updateExportButtonsDisabledState()
      updateStats()

    } catch (err) {
      addKV(ui.kv, t('error'), err?.message || 'Parse failed')
    }
  }

  async function handleFiles(files) {
    const fileArray = Array.from(files).filter(f => f && f.size > 0)
    if (fileArray.length === 0) return

    clearButtonElement.disabled = false
    setDropzoneBusy(true)
    // let overlay paint before heavy work starts
    try { await waitForNextFrame(2) } catch {}

    let completed = 0
    const total = fileArray.length
    const dzBusyText = document.getElementById('dz-busy-text')
    const baseText = (
      currentLang === 'en' ? 'Processing…' :
      currentLang === 'zh-Hant' ? '處理中…' :
      currentLang === 'es' ? 'Procesando…' :
      currentLang === 'fr' ? 'Traitement…' :
      'جارٍ المعالجة…'
    )
    const updateProgressLabel = () => { if (dzBusyText) dzBusyText.textContent = `${baseText} (${completed}/${total})` }
    updateProgressLabel()

    const maxConc = Math.max(1, Math.min(3, (navigator.hardwareConcurrency ? Math.floor(navigator.hardwareConcurrency / 2) : 3)))
    let index = 0
    async function worker() {
      while (true) {
        const i = index; index++
        if (i >= fileArray.length) break
        const f = fileArray[i]
        // eslint-disable-next-line no-await-in-loop
        await parseOneFile(f)
        completed++
        updateProgressLabel()
      }
    }
    const workers = Array.from({ length: Math.min(maxConc, total) }, () => worker())
    await Promise.all(workers)

    setDropzoneBusy(false)
  }

  function isLikelyImageResponse(resp, url) {
    const contentType = resp.headers.get('content-type') || ''
    const isImageType = contentType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|tif|tiff|heic|heif|avif)(\?|#|$)/i.test(url)
    return isImageType
  }

  async function handleUrlAnalyze(rawUrl) {
    const url = (rawUrl || '').trim()
    if (!url) { alert(t('urlEmpty')); return }
    try {
      setDropzoneBusy(true)
      const resp = await fetch(url, { mode: 'cors' })
      if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`)
      if (!isLikelyImageResponse(resp, url)) throw new Error('Not an image response')
      const blob = await resp.blob()
      const nameGuess = url.split('/').pop()?.split('?')[0] || 'image'
      const extFromType = (blob.type && blob.type.split('/')[1]) || (nameGuess.includes('.') ? '' : 'jpg')
      const file = new File([blob], nameGuess || `image.${extFromType}`, { type: blob.type || 'application/octet-stream' })
      await handleFiles([file])
    } catch (e) {
      console.error(e)
      alert(t('urlFetchFail'))
    } finally {
      setDropzoneBusy(false)
    }
  }

  async function handleClipboardPaste() {
    if (!navigator.clipboard || !navigator.clipboard.read) {
      alert(t('pasteNotAllowed'))
      return
    }
    try {
      setDropzoneBusy(true)
      const items = await navigator.clipboard.read()
      const files = []
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            const file = new File([blob], `pasted.${type.split('/')[1] || 'png'}`, { type })
            files.push(file)
          }
        }
      }
      if (files.length === 0) {
        alert(t('pasteNotAllowed'))
        return
      }
      await handleFiles(files)
    } catch (e) {
      console.error(e)
      alert(t('pasteNotAllowed'))
    } finally {
      setDropzoneBusy(false)
    }
  }

  // Wire URL analyze button
  if (analyzeUrlButton) {
    analyzeUrlButton.addEventListener('click', () => handleUrlAnalyze(urlInputElement?.value || ''))
  }
  if (urlInputElement) {
    urlInputElement.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleUrlAnalyze(urlInputElement.value)
    })
  }

  // Global paste: support traditional paste and Clipboard API when not typing
  if (pasteButton) pasteButton.addEventListener('click', () => handleClipboardPaste())
  window.addEventListener('paste', async e => {
    try {
      // If clipboard has files via traditional paste event
      const dt = e.clipboardData
      if (dt && dt.files && dt.files.length > 0) {
        e.preventDefault()
        await handleFiles(dt.files)
        return
      }
      // Otherwise try async clipboard API for images
      const active = document.activeElement
      const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)
      if (!isTyping) {
        e.preventDefault()
        await handleClipboardPaste()
      }
    } catch {}
  })

  // Drag & drop events
  ;['dragenter','dragover'].forEach(evt => {
    dropzoneElement.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); dropzoneElement.classList.add('is-dragover') })
  })
  ;['dragleave','drop'].forEach(evt => {
    dropzoneElement.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); dropzoneElement.classList.remove('is-dragover') })
  })
  dropzoneElement.addEventListener('drop', e => {
    const dt = e.dataTransfer
    if (dt?.files?.length) handleFiles(dt.files)
  })
  dropzoneElement.addEventListener('click', e => {
    if (e.target && e.target.closest && e.target.closest('.browse-button')) return
    fileInputElement.click()
  })
  dropzoneElement.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); fileInputElement.click() }
  })
  if (browseLabelElement) {
    browseLabelElement.addEventListener('click', e => { e.stopPropagation() })
  }

  // File input
  fileInputElement.addEventListener('change', e => {
    const input = e.target
    if (input && input.files) handleFiles(input.files)
    // keep selection so user can add more without clearing
  })

  // Export buttons
  if (exportJsonButton) exportJsonButton.addEventListener('click', exportAsJSON)
  if (exportCsvButton) exportCsvButton.addEventListener('click', exportAsCSV)
  if (exportPdfButton) exportPdfButton.addEventListener('click', exportAsPDF)
  updateExportButtonsDisabledState()

  // Expand/Collapse all JSON blocks
  const expandAllButton = document.getElementById('expand-all')
  if (expandAllButton) expandAllButton.addEventListener('click', () => {
    document.querySelectorAll('details.json-block').forEach(d => { try { d.setAttribute('open', '') } catch {} })
  })
  const collapseAllButton = document.getElementById('collapse-all')
  if (collapseAllButton) collapseAllButton.addEventListener('click', () => {
    document.querySelectorAll('details.json-block').forEach(d => { try { d.removeAttribute('open') } catch {} })
  })

  // Clear results
  clearButtonElement.addEventListener('click', () => {
    resultsElement.innerHTML = ''
    clearButtonElement.disabled = true
    parsedResults.length = 0
    updateExportButtonsDisabledState()
    updateStats()
  })

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .then(reg => { try { reg.update() } catch {} })
        .catch(() => {})
      let swRefreshing = false
      try {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (swRefreshing) return
          swRefreshing = true
          window.location.reload()
        })
      } catch {}
    })
  }
})() 