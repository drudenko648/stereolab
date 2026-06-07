// Centralised UI strings. Default locale is Russian (the source users speak
// Russian); keep all user-facing text here so the app stays i18n-ready. Code,
// identifiers and comments stay in English.

const ru = {
  appTitle: 'Стереолаб',
  appSubtitle: 'Построение и экспорт стереометрических фигур',
  panel: {
    shape: 'Фигура',
    dimensions: 'Размеры',
    display: 'Отображение',
    camera: 'Камера',
    export: 'Экспорт',
  },
  shapes: {
    cube: 'Куб',
    cuboid: 'Параллелепипед',
    pyramid: 'Пирамида',
    prism: 'Призма',
    tetrahedron: 'Тетраэдр',
  },
  params: {
    size: 'Сторона',
    width: 'Ширина',
    height: 'Высота',
    depth: 'Глубина',
    baseSize: 'Сторона основания',
    base: 'Сторона основания',
  },
  display: {
    faces: 'Грани',
    edges: 'Рёбра',
    vertices: 'Вершины',
    labels: 'Обозначения',
  },
  camera: {
    reset: 'Сбросить вид',
    front: 'Спереди',
    top: 'Сверху',
    side: 'Сбоку',
    iso: 'Изометрия',
    lock: 'Зафиксировать вид',
    unlock: 'Разблокировать вид',
    locked: 'Вид зафиксирован',
  },
  export: {
    background: 'Фон',
    transparent: 'Прозрачный',
    white: 'Белый',
    dark: 'Тёмный',
    resolution: 'Разрешение',
    download: 'Скачать PNG',
  },
} as const

export type Strings = typeof ru

/** Active locale strings. A locale switch can be layered on top later. */
export const strings: Strings = ru
