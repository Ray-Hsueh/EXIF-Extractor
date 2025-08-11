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

  // i18n
  const MESSAGES = {
    'en': {
      title: 'EXIF Extractor',
      subtitle: 'All parsing happens locally. No photos are uploaded.',
      dropTitle: 'Drag photos here',
      or: 'or',
      chooseFiles: 'Choose files',
      hint: 'Supports JPG, PNG, HEIC, AVIF, TIFF… Recommended single file ≤ 50MB.',
      clear: 'Clear results',
      exifrLoadFail: 'Failed to load exifr. Please check your network and retry.',
      statusNoExif: 'No EXIF data found',
      camera: 'Camera', lens: 'Lens', time: 'Time', iso: 'ISO', aperture: 'Aperture', shutter: 'Shutter', focal: 'Focal length', gps: 'GPS', error: 'Error',
      map: 'Open in Google Maps',
      copy: 'Copy JSON', copied: 'Copied!', copyFail: 'Copy failed', jsonSummary: 'View full JSON',
    },
    'zh-Hant': {
      title: 'EXIF 解析器',
      subtitle: '所有解析在瀏覽器本地進行，不會上傳照片。',
      dropTitle: '拖曳照片到這裡',
      or: '或',
      chooseFiles: '點擊選取檔案',
      hint: '支援 JPG、PNG、HEIC、AVIF、TIFF… 建議單檔 ≤ 50MB。',
      clear: '清除結果',
      exifrLoadFail: 'exifr 載入失敗，請檢查網路或稍後再試。',
      statusNoExif: '找不到 EXIF 資料',
      camera: '相機', lens: '鏡頭', time: '時間', iso: 'ISO', aperture: '光圈', shutter: '快門', focal: '焦距', gps: 'GPS', error: '錯誤',
      map: '在 Google Maps 開啟',
      copy: '複製 JSON', copied: '已複製!', copyFail: '複製失敗', jsonSummary: '查看完整 JSON',
    }
  }
  let currentLang = 'en'

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
    if (langToggleButton) langToggleButton.textContent = currentLang === 'en' ? '中文' : 'EN'
    if (dropzoneElement) dropzoneElement.setAttribute('aria-label', currentLang === 'en' ? 'Drag and drop or click to upload photos' : '拖曳或點擊上傳照片')
  }

  applyStaticTexts()

  if (langToggleButton) {
    langToggleButton.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'zh-Hant' : 'en'
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

    meta.appendChild(nameEl)
    meta.appendChild(sizeEl)

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

    return { article, header, img, meta, kv, actions, jsonPre }
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
      ['Camera', 'camera'], ['相機', 'camera'],
      ['Lens', 'lens'], ['鏡頭', 'lens'],
      ['Time', 'time'], ['時間', 'time'],
      ['ISO', 'iso'],
      ['Aperture', 'aperture'], ['光圈', 'aperture'],
      ['Shutter', 'shutter'], ['快門', 'shutter'],
      ['Focal length', 'focal'], ['焦距', 'focal'],
      ['GPS', 'gps'],
      ['Error', 'error'], ['錯誤', 'error'],
      ['Status', 'status'], ['狀態', 'status'],
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
        case 'status': el.textContent = currentLang === 'en' ? 'Status' : '狀態'; break
        default: break
      }
    })
    // 更新 map 與 copy 按鈕文字、JSON summary
    resultsElement.querySelectorAll('.card .actions .btn').forEach(btn => {
      if (btn.href && btn.href.includes('google.com/maps')) btn.textContent = t('map')
      else btn.textContent = t('copy')
    })
    resultsElement.querySelectorAll('.json-block > summary').forEach(s => s.textContent = t('jsonSummary'))
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

  async function parseOneFile(file) {
    const ui = createCardSkeleton(file)
    resultsElement.prepend(ui.article)

    try {
      const [exifrResult, rotation] = await Promise.all([
        exifrLib.parse(file, true).catch(() => undefined),
        exifrLib.rotation(file).catch(() => undefined),
      ])

      if (rotation && rotation.css) {
        ui.img.style.transform = `rotate(${rotation.deg}deg) scale(${rotation.scaleX}, ${rotation.scaleY})`
      }

      // Try ExifReader fallback if needed
      let exif = exifrResult
      let fallback = undefined
      let gps = {
        latitude: exifrResult?.latitude ?? exifrResult?.GPSLatitude,
        longitude: exifrResult?.longitude ?? exifrResult?.GPSLongitude,
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
        addKV(ui.kv, currentLang === 'en' ? 'Status' : '狀態', t('statusNoExif'))
        return
      }

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
      addKV(ui.kv, t('aperture'), fnum ? `f/${Number(fnum).toFixed(1)}` : '')
      addKV(ui.kv, t('shutter'), formatExposureTime(typeof exposure === 'number' ? exposure : Number(exposure)))
      addKV(ui.kv, t('focal'), focal ? `${String(focal)} mm` : '')

      if (typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
        const mapLink = document.createElement('a')
        mapLink.className = 'btn'
        mapLink.href = `https://www.google.com/maps/search/?api=1&query=${gps.latitude},${gps.longitude}`
        mapLink.target = '_blank'
        mapLink.rel = 'noopener'
        mapLink.textContent = t('map')
        ui.actions.appendChild(mapLink)
        addKV(ui.kv, t('gps'), `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`)
      } else {
        addKV(ui.kv, t('gps'), '—')
      }

      const copyBtn = document.createElement('button')
      copyBtn.className = 'btn'
      copyBtn.textContent = t('copy')
      copyBtn.addEventListener('click', async () => {
        try {
          const payload = { exifr: toSerializableTrimmed(exifrResult), exifreader: toSerializableTrimmed(fallback) }
          await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
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
  dropzoneElement.addEventListener('click', () => fileInputElement.click())
  dropzoneElement.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); fileInputElement.click() }
  })

  // File input
  fileInputElement.addEventListener('change', e => {
    const input = e.target
    if (input && input.files) handleFiles(input.files)
    // keep selection so user can add more without clearing
  })

  // Clear results
  clearButtonElement.addEventListener('click', () => {
    resultsElement.innerHTML = ''
    clearButtonElement.disabled = true
  })
})() 