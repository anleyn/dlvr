const akhJS003Config = {
  UTMS_DEAL: true,
  UTMS_USER: true,
  DEBUG: false
}

// Селекторы и данные полей
const akhJS003BlockSelector = '.analytics'
const akhJS003DealFields = [
  ['utm_source', 10101887],
  ['utm_medium', 10101888],
  ['utm_campaign', 10101889],
  ['utm_content', 10101891],
  ['utm_term', 10101890],
  ['utm_group', 10101892],
  ['gcpc', 10101899]
]
const akhJS003UserFields = [
  ['sb_286940_id', 10101734],
  ['sb_294495_id', 10101735],
  ['sb_project', 10101736],
  ['tg_username', 10101732],
  ['tg_id', 10101768],
  ['utm_source', 10101812],
  ['utm_medium', 10101813],
  ['utm_campaign', 10101814],
  ['utm_content', 10101816],
  ['utm_term', 10101815],
  ['utm_group', 10101817]
]
const akhJS003UrlField = ['loc', 10101886]

/**
 * Выводит сообщения в консоль.
 * @param {string} message - Сообщение для вывода.
 * @param {boolean} isError - Является ли сообщение ошибкой.
 */
function akhJS003Log (message, isError = false) {
  if (akhJS003Config.DEBUG) {
    const logFunction = isError ? console.error : console.log
    logFunction(`AKh - js003: ${message}`)
  }
}

/**
 * Получает значение параметра из URL.
 * @param {string} name - Название параметра.
 * @returns {string|null} - Значение параметра.
 */
function akhJS003GetParamValue (name) {
  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.get(name)
}

/**
 * Создаёт скрытый элемент ввода.
 * @param {number} fieldId - ID поля.
 * @param {string} value - Значение для элемента ввода.
 * @param {string} type - Тип поля (например, 'dealCustomFields').
 * @returns {Element} - Созданный элемент ввода.
 */
function akhJS003CreateHiddenInput (fieldId, value, type) {
  const input = document.createElement('input')
  input.name = `formParams[${type}][${fieldId}]`
  input.type = 'hidden'
  input.value = value
  return input
}

/**
 * Заполняет пользовательские поля данными.
 * @param {Array} data - Поля и соответствующие значения.
 * @param {Element} parentElement - Родительский элемент для вставки элементов ввода.
 * @param {string} type - Тип поля (например, 'dealCustomFields').
 */
function akhJS003FillFields (data, parentElement, type) {
  data.forEach(([utm, fieldId]) => {
    const utmValue = akhJS003GetParamValue(utm)
    akhJS003Log(`Заполнение ${type} данных для поля с ID ${fieldId} используя UTM-параметр: ${utm} = ${utmValue}`)
    if (utmValue) {
      const inputElement = akhJS003CreateHiddenInput(fieldId, utmValue, type)
      parentElement.appendChild(inputElement)
      akhJS003Log(`Поле с ID ${fieldId} заполнено значением: ${utmValue}`)
    }
  })
}

/**
 * Заполняет данные URL-адреса страницы.
 * @param {Element} parentElement - Родительский элемент для вставки элемента ввода.
 */
function akhJS003FillPageUrl (parentElement) {
  const isInsideIframe = window !== window.top
  let rawUrl

  if (isInsideIframe) {
    const locValue = akhJS003GetParamValue('loc')
    if (locValue) {
      const decodedLoc = decodeURIComponent(locValue)
      const locUrl = new URL(decodedLoc)
      rawUrl = locUrl.origin + locUrl.pathname
    }
  }

  if (!rawUrl) {
    const currentUrl = new URL(window.location.href)
    rawUrl = currentUrl.origin + currentUrl.pathname
  }

  const inputElement = akhJS003CreateHiddenInput(akhJS003UrlField[1], rawUrl, 'dealCustomFields')
  parentElement.appendChild(inputElement)
  akhJS003Log(`Поле с ID ${akhJS003UrlField[1]} заполнено значением: ${rawUrl}`)
}

/**
 * Обрабатывает элементы для заполнения необходимыми данными.
 */
function akhJS003ProcessElements () {
  akhJS003Log('Скрипт запущен. Начало обработки элементов.')

  const forms = document.querySelectorAll('form')
  forms.forEach((form) => {
    const analyticsElement = form.closest(akhJS003BlockSelector)
    if (!analyticsElement) {
      return
    }

    const isDeal = !analyticsElement.classList.contains('no-deal')
    if (isDeal && akhJS003Config.UTMS_DEAL) {
      akhJS003FillPageUrl(form)
      akhJS003FillFields(akhJS003DealFields, form, 'dealCustomFields')
    }
    if (akhJS003Config.UTMS_USER) {
      akhJS003FillFields(akhJS003UserFields, form, 'userCustomFields')
    }
  })

  akhJS003Log('Обработка элементов завершена.')
}

function akhJS003Initialize () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', akhJS003ProcessElements)
  } else {
    akhJS003ProcessElements()
  }
}

akhJS003Initialize()
