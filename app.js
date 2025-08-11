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
  const browseLabelElement = document.querySelector('.browse-button')

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
    }
  }
  let currentLang = 'en'
  const parsedResults = []

  function t(key) { return MESSAGES[currentLang][key] || key }

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
    const nextLang = currentLang === 'en' ? 'zh-Hant' : (currentLang === 'zh-Hant' ? 'es' : 'en')
    if (langToggleButton) langToggleButton.textContent = (nextLang === 'zh-Hant' ? '中文' : (nextLang === 'es' ? 'ES' : 'EN'))
    if (dropzoneElement) dropzoneElement.setAttribute('aria-label', t('ariaDropzone'))
    // reflect current lang on <html>
    try { document.documentElement.lang = currentLang } catch {}

    // URL/Paste/Export controls text
    if (analyzeUrlButton) analyzeUrlButton.textContent = t('analyzeUrl')
    if (pasteButton) pasteButton.textContent = t('pasteImage')
    if (urlInputElement) urlInputElement.placeholder = t('urlPlaceholder')
    if (exportJsonButton) exportJsonButton.textContent = t('exportJSON')
    if (exportCsvButton) exportCsvButton.textContent = t('exportCSV')
  }

  applyStaticTexts()

  if (langToggleButton) {
    langToggleButton.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'zh-Hant' : (currentLang === 'zh-Hant' ? 'es' : 'en')
      applyStaticTexts()
      // 重新渲染目前結果卡片的欄位名稱
      rerenderAllCardsLabels()
    })
  }

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
      if (value instanceof Date) return value.toLocaleString()
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString()
    } catch { return String(value ?? '') }
  }

  function formatExposureTime(secondsValue) {
    if (!secondsValue || typeof secondsValue !== 'number') return ''
    if (secondsValue >= 1) return `${secondsValue.toFixed(2)} s`
    const denom = Math.round(1 / secondsValue)
    return `1/${denom}`
  }

  // 新增：判斷是否「可能曾被修改」
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
    dropzoneElement.classList.toggle('is-busy', Boolean(isBusy))
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
  }

  // 重新渲染既有卡片的欄位名稱（值不變）
  function rerenderAllCardsLabels() {
    const keyMap = new Map([
      ['Camera', 'camera'], ['相機', 'camera'], ['Cámara', 'camera'],
      ['Lens', 'lens'], ['鏡頭', 'lens'], ['Objetivo', 'lens'],
      ['Time', 'time'], ['時間', 'time'], ['Hora', 'time'],
      ['ISO', 'iso'],
      ['Aperture', 'aperture'], ['光圈', 'aperture'], ['Apertura', 'aperture'],
      ['Shutter', 'shutter'], ['快門', 'shutter'], ['Obturación', 'shutter'],
      ['Focal length', 'focal'], ['焦距', 'focal'], ['Longitud focal', 'focal'],
      ['GPS', 'gps'],
      ['Error', 'error'], ['錯誤', 'error'], ['Error', 'error'],
      ['Status', 'status'], ['狀態', 'status'], ['Estado', 'status'],
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
        case 'status': el.textContent = (currentLang === 'en' ? 'Status' : (currentLang === 'zh-Hant' ? '狀態' : 'Estado')); break
        default: break
      }
    })
    // 更新 map 與 copy 按鈕文字、JSON summary
    resultsElement.querySelectorAll('.card .actions .btn').forEach(btn => {
      if (btn.href && btn.href.includes('google.com/maps')) btn.textContent = t('map')
      else btn.textContent = t('copy')
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

  // 序列化與過濾
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

  // 匯出輔助
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
    const disabled = parsedResults.length === 0
    if (exportJsonButton) exportJsonButton.disabled = disabled
    if (exportCsvButton) exportCsvButton.disabled = disabled
  }
  function exportAsJSON() {
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

  async function parseOneFile(file) {
    const ui = createCardSkeleton(file)
    resultsElement.prepend(ui.article)

    try {
      const [exifrResult, rotation, exifrGps] = await Promise.all([
        exifrLib.parse(file, true).catch(() => undefined),
        exifrLib.rotation(file).catch(() => undefined),
        exifrLib.gps ? exifrLib.gps(file).catch(() => undefined) : Promise.resolve(undefined),
      ])

      if (rotation && rotation.css) {
        ui.img.style.transform = `rotate(${rotation.deg}deg) scale(${rotation.scaleX}, ${rotation.scaleY})`
      }

      // Try ExifReader fallback if needed
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

      if ((!exif || (gps.latitude == null || gps.longitude == null)) && ExifReader) {
        try {
          fallback = await ExifReader.load(await file.arrayBuffer(), { expanded: true })
          if (!exif) exif = fallback
          const gpsFromFallback = pickGpsFromExifReader(fallback)
          if (gpsFromFallback) gps = gpsFromFallback
        } catch {}
      }

      if (!exif) {
        // 狀態徽章：無 EXIF
        const badge = document.createElement('span')
        badge.className = 'badge'
        badge.setAttribute('data-status', 'no-exif')
        badge.textContent = t('noExifShort')
        ui.statusEl.appendChild(badge)
        addKV(ui.kv, currentLang === 'en' ? 'Status' : (currentLang === 'zh-Hant' ? '狀態' : 'Estado'), t('statusNoExif'))
        return
      }

      // 狀態徽章：已修改 / 原始
      const edited = isLikelyEdited(exif, fallback)
      const badge = document.createElement('span')
      badge.className = `badge ${edited ? 'danger' : 'success'}`
      badge.setAttribute('data-status', edited ? 'edited' : 'original')
      badge.textContent = edited ? t('edited') : t('original')
      ui.statusEl.appendChild(badge)

      const make = exif.Make || exif.make || fallback?.exif?.Make?.description
      const model = exif.Model || exif.model || fallback?.exif?.Model?.description
      const lens = exif.LensModel || exif.Lens || exif.lensModel || fallback?.exif?.LensModel?.description
      const iso = exif.ISO || exif.iso || fallback?.exif?.ISO?.description
      const fnum = exif.FNumber || exif.ApertureValue || exif.fNumber || fallback?.exif?.FNumber?.description
      const exposure = exif.ExposureTime || exif.ShutterSpeedValue || exif.exposureTime || fallback?.exif?.ExposureTime?.description
      const focal = exif.FocalLengthIn35mmFormat || exif.FocalLength || exif.focalLength || fallback?.exif?.FocalLength?.description
      const dt = exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate || fallback?.exif?.DateTimeOriginal?.description

      addKV(ui.kv, t('camera'), [make, model].filter(Boolean).join(' '))
      addKV(ui.kv, t('lens'), lens || '')
      addKV(ui.kv, t('time'), formatDate(dt))
      addKV(ui.kv, t('iso'), iso ? String(iso) : '')
      const exposureValue = (typeof exposure === 'number' ? exposure : Number(exposure))
      addKV(ui.kv, t('shutter'), formatExposureTime(exposureValue))
      addKV(ui.kv, t('focal'), focal ? `${String(focal)} mm` : '')

      const latNum = Number(gps.latitude)
      const lonNum = Number(gps.longitude)
      if (Number.isFinite(latNum) && Number.isFinite(lonNum)) {
        const mapLink = document.createElement('a')
        mapLink.className = 'btn'
        mapLink.href = `https://www.google.com/maps/search/?api=1&query=${latNum},${lonNum}`
        mapLink.target = '_blank'
        mapLink.rel = 'noopener'
        mapLink.textContent = t('map')
        ui.actions.appendChild(mapLink)
        addKV(ui.kv, t('gps'), `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`)
      } else {
        addKV(ui.kv, t('gps'), '—')
      }

      const copyBtn = document.createElement('button')
      copyBtn.className = 'btn'
      copyBtn.textContent = t('copy')
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

      // 收集彙整資料供匯出
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
      }
      parsedResults.push({ fileName: file.name, fileSize: file.size, summary, exifr: payload.exifr, exifreader: payload.exifreader })
      updateExportButtonsDisabledState()

    } catch (err) {
      addKV(ui.kv, t('error'), err?.message || 'Parse failed')
    }
  }

  async function handleFiles(files) {
    const fileArray = Array.from(files).filter(f => f && f.size > 0)
    if (fileArray.length === 0) return

    clearButtonElement.disabled = false
    setDropzoneBusy(true)

    for (const file of fileArray) {
      // eslint-disable-next-line no-await-in-loop
      await parseOneFile(file)
    }

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

  // Wire paste button and global Ctrl+V when focus is not on input elements
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

  // Events: drag & drop
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
  updateExportButtonsDisabledState()

  // Clear results
  clearButtonElement.addEventListener('click', () => {
    resultsElement.innerHTML = ''
    clearButtonElement.disabled = true
    parsedResults.length = 0
    updateExportButtonsDisabledState()
  })
})() 