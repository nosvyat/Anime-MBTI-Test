function createAssetUrls(name) {
  const short = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const encodedName = encodeURIComponent(name);

  return {
    iconUrl: `https://placehold.co/96x96/18233f/eef3ff?text=${short}`,
    imageUrl: `https://placehold.co/720x880/0e162d/f4f7ff?text=${encodedName}%0AAnime+MBTI`
  };
}

const CHARACTER_GROUPS = Object.freeze({
  INTJ: {
    main: { name: "Lelouch Lamperouge", anime: "Code Geass", description: "Холодный стратег с длинным горизонтом мышления и привычкой всегда держать запасной план.", traits: ["Стратегия", "Амбиция", "Контроль"] },
    others: [
      { name: "Light Yagami", anime: "Death Note", description: "Рациональный и расчетливый интеллектуал.", traits: ["Аналитика", "Воля", "Системность"] },
      { name: "Kurisu Makise", anime: "Steins;Gate", description: "Умная и собранная исследовательница.", traits: ["Логика", "Сдержанность", "Глубина"] },
      { name: "Senku Ishigami", anime: "Dr. Stone", description: "Гениальный тактик, который строит будущее шаг за шагом.", traits: ["Интеллект", "Изобретательность", "Фокус"] }
    ]
  },
  INTP: {
    main: { name: "L Lawliet", anime: "Death Note", description: "Экстраординарный наблюдатель, которому важнее докопаться до истины, чем следовать нормам.", traits: ["Аналитика", "Любопытство", "Нестандартность"] },
    others: [
      { name: "Maomao", anime: "The Apothecary Diaries", description: "Спокойная исследовательница с сильной внутренней логикой.", traits: ["Наблюдательность", "Разбор", "Ирония"] },
      { name: "Armin Arlert", anime: "Attack on Titan", description: "Интеллектуал, который видит путь там, где остальные видят тупик.", traits: ["Стратегия", "Идеи", "Гибкость"] },
      { name: "Shikamaru Nara", anime: "Naruto", description: "Ленивый снаружи, но очень точный мыслитель.", traits: ["Логика", "Спокойствие", "Предвидение"] }
    ]
  },
  ENTJ: {
    main: { name: "Erwin Smith", anime: "Attack on Titan", description: "Харизматичный лидер, умеющий превращать неопределенность в курс действий.", traits: ["Лидерство", "Решительность", "Масштаб"] },
    others: [
      { name: "Satsuki Kiryuin", anime: "Kill la Kill", description: "Жесткий лидер с железной дисциплиной.", traits: ["Власть", "Дисциплина", "Воля"] },
      { name: "Roy Mustang", anime: "Fullmetal Alchemist", description: "Амбициозный командир с ясной целью.", traits: ["Тактика", "Харизма", "Контроль"] },
      { name: "Kaguya Shinomiya", anime: "Kaguya-sama: Love Is War", description: "Сильный стратег с высоким уровнем самоконтроля.", traits: ["Стратегия", "Холодный ум", "Амбиция"] }
    ]
  },
  ENTP: {
    main: { name: "Gojo Satoru", anime: "Jujutsu Kaisen", description: "Яркий и блестящий импровизатор, который умеет быть одновременно легким, умным и опасным.", traits: ["Остроумие", "Харизма", "Импровизация"] },
    others: [
      { name: "Hisoka", anime: "Hunter x Hunter", description: "Хаотичный и провокационный игрок.", traits: ["Игра", "Непредсказуемость", "Драйв"] },
      { name: "Oikawa Tooru", anime: "Haikyuu!!", description: "Харизматичный соревновательный ум с быстрой адаптацией.", traits: ["Обаяние", "Смекалка", "Амбиция"] },
      { name: "Kaito Kid", anime: "Magic Kaito 1412", description: "Легкий на подъем трюкач с любовью к эффектным решениям.", traits: ["Шарм", "Изобретательность", "Игра"] }
    ]
  },
  INFJ: {
    main: { name: "Itachi Uchiha", anime: "Naruto", description: "Молчаливый идеалист с глубокой внутренней системой ценностей и тяжелым чувством ответственности.", traits: ["Глубина", "Интуиция", "Самопожертвование"] },
    others: [
      { name: "Suguru Geto", anime: "Jujutsu Kaisen", description: "Идеолог, которого ведет мощная внутренняя картина мира.", traits: ["Видение", "Убеждения", "Харизма"] },
      { name: "Chrollo Lucilfer", anime: "Hunter x Hunter", description: "Тихий лидер с гипнотической глубиной.", traits: ["Спокойствие", "Смысл", "Контроль"] },
      { name: "Riza Hawkeye", anime: "Fullmetal Alchemist", description: "Верная и очень собранная защитница.", traits: ["Лояльность", "Сдержанность", "Точность"] }
    ]
  },
  INFP: {
    main: { name: "Ken Kaneki", anime: "Tokyo Ghoul", description: "Рефлексирующий идеалист, который остро переживает внутренние конфликты и ищет свою правду.", traits: ["Чувствительность", "Самопоиск", "Глубина"] },
    others: [
      { name: "Yuta Okkotsu", anime: "Jujutsu Kaisen", description: "Тихий герой с мягким сердцем.", traits: ["Эмпатия", "Сила", "Искренность"] },
      { name: "Shinji Ikari", anime: "Neon Genesis Evangelion", description: "Сложный и ранимый персонаж с богатым внутренним миром.", traits: ["Уязвимость", "Рефлексия", "Чувства"] },
      { name: "Izuku Midoriya", anime: "My Hero Academia", description: "Идеалист, который не теряет веру в добро.", traits: ["Сострадание", "Рост", "Настойчивость"] }
    ]
  },
  ENFJ: {
    main: { name: "Tanjiro Kamado", anime: "Demon Slayer", description: "Сильный эмпат, который ведет людей вперед не только силой, но и сердцем.", traits: ["Тепло", "Лидерство", "Сострадание"] },
    others: [
      { name: "All Might", anime: "My Hero Academia", description: "Вдохновляющий символ надежды.", traits: ["Воодушевление", "Мужество", "Забота"] },
      { name: "Maes Hughes", anime: "Fullmetal Alchemist", description: "Теплый человек, который делает пространство живым.", traits: ["Доброта", "Поддержка", "Открытость"] },
      { name: "Tohru Honda", anime: "Fruits Basket", description: "Мягкая объединяющая сила для окружающих.", traits: ["Эмпатия", "Терпение", "Свет"] }
    ]
  },
  ENFP: {
    main: { name: "Naruto Uzumaki", anime: "Naruto", description: "Неугомонный источник энергии, который умеет вдохновлять других своей верой и упорством.", traits: ["Энергия", "Оптимизм", "Вдохновение"] },
    others: [
      { name: "Natsu Dragneel", anime: "Fairy Tail", description: "Взрывной и очень живой герой.", traits: ["Драйв", "Лояльность", "Огонь"] },
      { name: "Atsushi Nakajima", anime: "Bungo Stray Dogs", description: "Сердечный и растущий герой с сильной эмпатией.", traits: ["Чуткость", "Рост", "Воодушевление"] },
      { name: "Anya Forger", anime: "Spy x Family", description: "Хаотично-обаятельный источник эмоций.", traits: ["Веселье", "Импульс", "Обаяние"] }
    ]
  },
  ISTJ: {
    main: { name: "Kento Nanami", anime: "Jujutsu Kaisen", description: "Надежный профессионал с сильным чувством долга и очень взрослым отношением к хаосу.", traits: ["Надежность", "Структура", "Ответственность"] },
    others: [
      { name: "Levi Ackerman", anime: "Attack on Titan", description: "Точный и дисциплинированный исполнитель.", traits: ["Контроль", "Собранность", "Долг"] },
      { name: "Giyu Tomioka", anime: "Demon Slayer", description: "Сдержанный защитник, который делает то, что должен.", traits: ["Спокойствие", "Честь", "Выдержка"] },
      { name: "Tenya Iida", anime: "My Hero Academia", description: "Правильный и организованный лидер порядка.", traits: ["Порядок", "Ответственность", "Дисциплина"] }
    ]
  },
  ISFJ: {
    main: { name: "Hinata Hyuga", anime: "Naruto", description: "Тихая, внимательная и очень преданная героиня, которая растет через внутреннюю силу.", traits: ["Преданность", "Мягкость", "Рост"] },
    others: [
      { name: "Ochaco Uraraka", anime: "My Hero Academia", description: "Добрая и практичная поддержка для команды.", traits: ["Забота", "Тепло", "Искренность"] },
      { name: "Chise Hatori", anime: "The Ancient Magus' Bride", description: "Чуткая героиня с глубоким внутренним миром.", traits: ["Чувствительность", "Терпение", "Нежность"] },
      { name: "Yor Forger", anime: "Spy x Family", description: "Заботливая защитница с тихой преданностью.", traits: ["Защита", "Лояльность", "Тепло"] }
    ]
  },
  ESTJ: {
    main: { name: "Tenya Iida", anime: "My Hero Academia", description: "Организованный, прямой и очень надежный лидер, который уважает порядок и правила.", traits: ["Порядок", "Темп", "Ответственность"] },
    others: [
      { name: "Vegeta", anime: "Dragon Ball", description: "Жесткий и целеустремленный боец.", traits: ["Сила", "Гордость", "Результат"] },
      { name: "Olivier Armstrong", anime: "Fullmetal Alchemist", description: "Жесткий управленец без лишней романтики.", traits: ["Контроль", "Суровость", "Дисциплина"] },
      { name: "Nobara Kugisaki", anime: "Jujutsu Kaisen", description: "Уверенная и решительная героиня.", traits: ["Прямота", "Сила", "Самоуважение"] }
    ]
  },
  ESFJ: {
    main: { name: "Momo Yaoyorozu", anime: "My Hero Academia", description: "Заботливая организаторша, которая старается быть полезной людям и держать всё под контролем.", traits: ["Поддержка", "Организация", "Забота"] },
    others: [
      { name: "Winry Rockbell", anime: "Fullmetal Alchemist", description: "Практичная и очень теплая опора.", traits: ["Забота", "Практичность", "Лояльность"] },
      { name: "Kobeni Higashiyama", anime: "Chainsaw Man", description: "Переживающая, но социально настроенная героиня.", traits: ["Чувства", "Люди", "Реактивность"] },
      { name: "Orihime Inoue", anime: "Bleach", description: "Светлая и сердечная поддержка.", traits: ["Доброта", "Нежность", "Оптимизм"] }
    ]
  },
  ISTP: {
    main: { name: "Levi Ackerman", anime: "Attack on Titan", description: "Минимум слов, максимум точности: спокойный и эффективный мастер действия.", traits: ["Точность", "Холодная голова", "Практика"] },
    others: [
      { name: "Roronoa Zoro", anime: "One Piece", description: "Надежный и самостоятельный боец.", traits: ["Сила", "Самостоятельность", "Фокус"] },
      { name: "Toji Fushiguro", anime: "Jujutsu Kaisen", description: "Опасный прагматик, который действует быстро и четко.", traits: ["Инстинкт", "Скорость", "Практичность"] },
      { name: "Mikasa Ackerman", anime: "Attack on Titan", description: "Собранная защитница с сильной концентрацией.", traits: ["Действие", "Верность", "Тишина"] }
    ]
  },
  ISFP: {
    main: { name: "Megumi Fushiguro", anime: "Jujutsu Kaisen", description: "Сдержанный и внутренне принципиальный персонаж, который редко выставляет чувства напоказ.", traits: ["Сдержанность", "Принципы", "Самостоятельность"] },
    others: [
      { name: "Bocchi Hitori", anime: "Bocchi the Rock!", description: "Ранимая, но искренняя героиня с ярким внутренним миром.", traits: ["Чувствительность", "Творчество", "Искренность"] },
      { name: "Saber", anime: "Fate/stay night", description: "Благородная и сдержанная воительница.", traits: ["Честь", "Грация", "Выдержка"] },
      { name: "Kenshin Himura", anime: "Rurouni Kenshin", description: "Спокойный защитник с сильным моральным кодексом.", traits: ["Мир", "Принципы", "Сдержанность"] }
    ]
  },
  ESTP: {
    main: { name: "Joseph Joestar", anime: "JoJo's Bizarre Adventure", description: "Быстрый на реакцию, дерзкий и очень живой герой, который обожает риск и игру.", traits: ["Смелость", "Импровизация", "Драйв"] },
    others: [
      { name: "Yusuke Urameshi", anime: "Yu Yu Hakusho", description: "Прямой и резкий герой действия.", traits: ["Энергия", "Смелость", "Напор"] },
      { name: "Inosuke Hashibira", anime: "Demon Slayer", description: "Инстинктивный и хаотичный боец.", traits: ["Импульс", "Сила", "Свобода"] },
      { name: "Reigen Arataka", anime: "Mob Psycho 100", description: "Обаятельный импровизатор с молниеносной реакцией.", traits: ["Шарм", "Гибкость", "Быстрый ум"] }
    ]
  },
  ESFP: {
    main: { name: "Ryuko Matoi", anime: "Kill la Kill", description: "Яркая и эмоциональная героиня, которая живет на высокой энергии и не боится быть собой.", traits: ["Эмоции", "Храбрость", "Яркость"] },
    others: [
      { name: "Power", anime: "Chainsaw Man", description: "Хаотичная и очень эффектная энергия.", traits: ["Хаос", "Эмоции", "Сцена"] },
      { name: "Denji", anime: "Chainsaw Man", description: "Прямолинейный герой момента.", traits: ["Жизнелюбие", "Импульс", "Простота"] },
      { name: "Nami", anime: "One Piece", description: "Яркая и живая героиня с сильным чувством момента.", traits: ["Обаяние", "Гибкость", "Энергия"] }
    ]
  }
});

const CHARACTER_SEED = Object.entries(CHARACTER_GROUPS).flatMap(([mbtiType, group]) => {
  const mainAssets = createAssetUrls(group.main.name);
  const mainRow = {
    code: `${mbtiType.toLowerCase()}-main`,
    name: group.main.name,
    anime: group.main.anime,
    mbtiType,
    roleType: "main",
    iconUrl: mainAssets.iconUrl,
    imageUrl: mainAssets.imageUrl,
    description: group.main.description,
    traits: group.main.traits,
    priority: 1
  };

  const supportRows = group.others.map((character, index) => {
    const assets = createAssetUrls(character.name);
    return {
      code: `${mbtiType.toLowerCase()}-support-${index + 1}`,
      name: character.name,
      anime: character.anime,
      mbtiType,
      roleType: "support",
      iconUrl: assets.iconUrl,
      imageUrl: assets.imageUrl,
      description: character.description,
      traits: character.traits,
      priority: index + 1
    };
  });

  return [mainRow, ...supportRows];
});

module.exports = {
  CHARACTER_GROUPS,
  CHARACTER_SEED
};
