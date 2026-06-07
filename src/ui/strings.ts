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
    appearance: 'Оформление',
    naming: 'Обозначения вершин',
    camera: 'Камера',
    export: 'Экспорт',
  },
  shapes: {
    cube: 'Куб',
    cuboid: 'Параллелепипед',
    pyramid: 'Пирамида',
    prism: 'Призма',
    tetrahedron: 'Тетраэдр',
    cylinder: 'Цилиндр',
    cone: 'Конус',
    sphere: 'Сфера',
    truncatedPyramid: 'Усечённая пирамида',
    truncatedCone: 'Усечённый конус',
  },
  params: {
    size: 'Сторона',
    width: 'Ширина',
    height: 'Высота',
    depth: 'Глубина',
    baseSize: 'Сторона основания',
    base: 'Сторона основания',
    radius: 'Радиус',
    sides: 'Число сторон',
    segments: 'Сегменты',
    topRatio: 'Отношение верхнего основания',
  },
  display: {
    faces: 'Грани',
    edges: 'Рёбра',
    vertices: 'Вершины',
    labels: 'Обозначения',
  },
  appearance: {
    figureColor: 'Цвет фигуры',
    faceOpacity: 'Непрозрачность граней',
    edgeColor: 'Цвет рёбер',
    edgeWidth: 'Толщина рёбер',
    edgeStyle: 'Стиль рёбер',
    solid: 'Сплошные',
    dashed: 'Пунктирные',
    vertexColor: 'Цвет вершин',
    vertexSize: 'Размер вершин',
    labelColor: 'Цвет обозначений',
  },
  rename: {
    vertex: 'Вершина',
    name: 'Новое обозначение',
    apply: 'Применить',
    reset: 'Сбросить',
    errors: {
      empty: 'Обозначение не может быть пустым.',
      tooLong: 'Обозначение слишком длинное.',
      duplicate: 'Такое обозначение уже используется.',
    },
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
