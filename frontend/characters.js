window.APP_CHARACTER_DATA = (() => {
  function assetUrls(name) {
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

  const typeProfiles = {
    INTJ: {
      code: "INTJ",
      name: "Стратег",
      summary: "Видит систему целиком, любит дальний план и редко тратит энергию впустую.",
      description: "Спокойный и собранный тип, который любит мыслить на несколько шагов вперёд и держать внутренний курс даже в хаосе.",
      strengths: ["стратегичность", "самостоятельность", "глубина анализа"],
      weaknesses: ["закрытость", "требовательность", "нетерпимость к хаосу"],
      communication: "Говорит по делу, ценит содержательные разговоры и уважение к личным границам.",
      relationships: "Открывается не сразу, но в близости очень надёжен и последователен.",
      workStudy: "Лучше всего проявляется там, где нужны системность, самостоятельность и длинный горизонт."
    },
    INTP: {
      code: "INTP",
      name: "Аналитик",
      summary: "Любит разбирать мир на идеи, связи и внутренние закономерности.",
      description: "Гибкий мыслитель, которому важно докопаться до сути и построить красивую внутреннюю модель происходящего.",
      strengths: ["любознательность", "логика", "гибкость мышления"],
      weaknesses: ["рассеянность", "сомнения", "отстранённость"],
      communication: "Любит обсуждать идеи, спорить о смысле и искать точные формулировки.",
      relationships: "Нуждается в свободе и понимании, но становится очень внимательным рядом с тем, кому доверяет.",
      workStudy: "Силен в исследовании, аналитике, концепциях и нестандартных решениях."
    },
    ENTJ: {
      code: "ENTJ",
      name: "Командир",
      summary: "Собирает хаос в понятный вектор и умеет вести людей к результату.",
      description: "Сильный лидерский тип, который любит скорость, ясность, ответственность и масштабные задачи.",
      strengths: ["решительность", "лидерство", "структурность"],
      weaknesses: ["жёсткость", "нетерпение", "контроль"],
      communication: "Говорит прямо, быстро и уверенно, ценит ясную позицию собеседника.",
      relationships: "Проявляет чувства через действие, защиту и готовность брать ответственность.",
      workStudy: "Хорош там, где нужно организовать процесс, задать темп и добиться результата."
    },
    ENTP: {
      code: "ENTP",
      name: "Полемист",
      summary: "Быстро видит возможности, любит игру идей и не боится неожиданных ходов.",
      description: "Живой, остроумный и экспериментирующий тип, который заряжается от новых связей, идей и интеллектуального азарта.",
      strengths: ["изобретательность", "харизма", "гибкость"],
      weaknesses: ["непоследовательность", "спор ради спора", "скука к рутине"],
      communication: "Легко втягивает людей в диалог, любит юмор, импровизацию и яркие идеи.",
      relationships: "Нуждается в свободе и искре, но рядом с близким человеком умеет быть очень вовлечённым.",
      workStudy: "Лучше всего раскрывается в динамичной среде, где можно придумывать и быстро тестировать новое."
    },
    INFJ: {
      code: "INFJ",
      name: "Провидец",
      summary: "Чувствует людей глубоко и видит смысл там, где другие замечают только поверхность.",
      description: "Тихий, интуитивный и цельный тип, который соединяет внутреннюю глубину с сильным ощущением предназначения.",
      strengths: ["эмпатия", "интуиция", "внутренняя цельность"],
      weaknesses: ["перегрузка чувствами", "закрытость", "идеализм"],
      communication: "Слушает внимательно, говорит мягко и тонко чувствует подтекст.",
      relationships: "Ищет глубокую близость, доверие и ощущение душевной связи.",
      workStudy: "Проявляется там, где можно сочетать смысл, заботу о людях и глубокое видение."
    },
    INFP: {
      code: "INFP",
      name: "Медиатор",
      summary: "Держится за внутренние ценности и ищет способ оставаться собой в любом мире.",
      description: "Мягкий и очень личный тип, который живёт изнутри, тонко чувствует красоту, смысл и внутреннюю правду.",
      strengths: ["искренность", "воображение", "чуткость"],
      weaknesses: ["ранимость", "уход в себя", "сложность с жёсткими рамками"],
      communication: "Осторожен в начале, но в доверии становится очень тёплым и настоящим.",
      relationships: "Ищет принятие, эмоциональную честность и ощущение безопасной близости.",
      workStudy: "Лучше раскрывается там, где важны ценности, креативность и индивидуальный подход."
    },
    ENFJ: {
      code: "ENFJ",
      name: "Наставник",
      summary: "Тонко чувствует людей и умеет вдохновлять их двигаться вперёд.",
      description: "Тёплый и собранный тип, который объединяет людей, задаёт тон и помогает другим расти.",
      strengths: ["вдохновение", "эмпатия", "организация"],
      weaknesses: ["эмоциональное выгорание", "чрезмерная ответственность", "зависимость от отклика"],
      communication: "Общается живо, поддерживающе и быстро считывает состояние собеседника.",
      relationships: "Очень вкладывается в близких и старается делать отношения тёплыми и надёжными.",
      workStudy: "Силен в командной работе, наставничестве, обучении и проектах с людьми."
    },
    ENFP: {
      code: "ENFP",
      name: "Вдохновитель",
      summary: "Живёт энергией возможностей, чувств и ярких человеческих историй.",
      description: "Искренний, подвижный и эмоционально живой тип, который любит пробовать новое и видеть в людях потенциал.",
      strengths: ["энергия", "воодушевление", "креативность"],
      weaknesses: ["хаотичность", "переключаемость", "сложность с доведением до конца"],
      communication: "Говорит легко, ярко и заразительно, быстро создаёт ощущение контакта.",
      relationships: "Ценит свободу, искру и живое эмоциональное движение в паре.",
      workStudy: "Лучше всего чувствует себя там, где можно общаться, придумывать и двигать идеи."
    },
    ISTJ: {
      code: "ISTJ",
      name: "Инспектор",
      summary: "Надёжен, точен и спокоен, когда есть порядок, ясные правила и ответственность.",
      description: "Собранный тип, который уважает систему, держит слово и предпочитает надёжность показной яркости.",
      strengths: ["надёжность", "дисциплина", "внимание к деталям"],
      weaknesses: ["ригидность", "осторожность", "сложность с быстрыми переменами"],
      communication: "Общается спокойно и сдержанно, не любит лишний шум и пустые обещания.",
      relationships: "Показывает любовь делом, стабильностью и верностью.",
      workStudy: "Очень хорош в процессах, ответственности, рутине и делах, где важна точность."
    },
    ISFJ: {
      code: "ISFJ",
      name: "Хранитель",
      summary: "Замечает потребности других и создаёт вокруг ощущение тишины, тепла и опоры.",
      description: "Мягкий и надёжный тип, который любит заботиться, сохранять гармонию и тихо держать всё на своих местах.",
      strengths: ["забота", "внимательность", "верность"],
      weaknesses: ["самопожертвование", "чувствительность к конфликтам", "сложность говорить о себе"],
      communication: "Общается деликатно, уважительно и очень внимательно к деталям.",
      relationships: "Нуждается в тёплой атмосфере и очень глубоко вкладывается в близких.",
      workStudy: "Проявляется там, где нужна помощь людям, устойчивость и внимание к мелочам."
    },
    ESTJ: {
      code: "ESTJ",
      name: "Управленец",
      summary: "Любит порядок, темп и ясную систему, в которой всё работает как надо.",
      description: "Практичный и собранный тип, который быстро организует пространство, людей и задачи вокруг цели.",
      strengths: ["организация", "ответственность", "напор"],
      weaknesses: ["жёсткость", "прямолинейность", "сложность с неопределённостью"],
      communication: "Говорит ясно, уверенно и любит, когда договорённости соблюдаются.",
      relationships: "Выражает заботу через действие, защиту и готовность брать на себя нагрузку.",
      workStudy: "Очень хорош в менеджменте, логистике, администрировании и дисциплине."
    },
    ESFJ: {
      code: "ESFJ",
      name: "Опора",
      summary: "Создаёт комфорт, держит контакт с людьми и замечает, когда кому-то нужна поддержка.",
      description: "Тёплый и социальный тип, который ценит близость, понятные отношения и ощущение общей гармонии.",
      strengths: ["доброжелательность", "социальность", "ответственность"],
      weaknesses: ["зависимость от оценки", "сложность с конфликтами", "чрезмерная забота"],
      communication: "Легко поддерживает разговор и старается сделать атмосферу мягкой и удобной для всех.",
      relationships: "Очень ориентирован на близость, участие и регулярное внимание друг к другу.",
      workStudy: "Силен в координации, сервисе, поддержке и командных задачах."
    },
    ISTP: {
      code: "ISTP",
      name: "Мастер",
      summary: "Спокоен, точен и включается тогда, когда нужны действие, навык и холодная голова.",
      description: "Независимый практик, которому ближе реальный опыт, личная свобода и точное действие без лишних слов.",
      strengths: ["практичность", "самообладание", "точность"],
      weaknesses: ["эмоциональная дистанция", "скрытность", "нежелание объясняться"],
      communication: "Лаконичен, не любит драму и предпочитает, чтобы слова что-то значили.",
      relationships: "Нуждается в свободе и уважении к личным границам, но очень надёжен в делах.",
      workStudy: "Раскрывается там, где нужны навык, реакция, техника и умение решать задачу на месте."
    },
    ISFP: {
      code: "ISFP",
      name: "Художник",
      summary: "Тонко чувствует атмосферу, любит жить искренне и выражать себя не громко, а точно.",
      description: "Чувствительный и свободный тип, который бережно относится к своим ценностям и выбирает путь, где можно оставаться собой.",
      strengths: ["эстетика", "искренность", "мягкость"],
      weaknesses: ["уход от давления", "скрытность", "сложность с жёсткими рамками"],
      communication: "Общается мягко и по-настоящему, не любит давить и не терпит фальшь.",
      relationships: "Ценит нежность, уважение и естественность без лишнего контроля.",
      workStudy: "Лучше всего проявляется там, где есть вкус, творчество, личный ритм и живая среда."
    },
    ESTP: {
      code: "ESTP",
      name: "Деятель",
      summary: "Любит движение, риск, момент и ощущение, что жизнь происходит прямо сейчас.",
      description: "Смелый и практичный тип, который быстро реагирует, легко входит в действие и чувствует себя живым в динамике.",
      strengths: ["смелость", "скорость", "адаптивность"],
      weaknesses: ["импульсивность", "нетерпение к рутине", "склонность к риску"],
      communication: "Общается прямо, бодро и без лишних сложностей, любит живой обмен энергией.",
      relationships: "Ищет искру, честность и свободу движения внутри связи.",
      workStudy: "Силен там, где важны реакция, практика, переговоры и быстрые решения."
    },
    ESFP: {
      code: "ESFP",
      name: "Артист",
      summary: "Несёт в пространство тепло, игру, эмоции и ощущение живого настоящего.",
      description: "Яркий и дружелюбный тип, который любит людей, красоту момента и умеет зажигать атмосферу без усилия.",
      strengths: ["обаяние", "жизнелюбие", "эмоциональная открытость"],
      weaknesses: ["рассеянность", "сложность с долгим планированием", "избегание тяжёлых разговоров"],
      communication: "Общается тепло, быстро и легко создаёт ощущение включённости.",
      relationships: "Ценит внимание, честность и эмоциональную живость в паре.",
      workStudy: "Проявляется там, где нужны контакт с людьми, сцена, сервис, движение и атмосфера."
    }
  };

  const groups = {
    INTJ: {
      main: {
        name: "Lelouch Lamperouge",
        anime: "Code Geass",
        description: "Холодный стратег с длинным горизонтом мышления и очень точным ощущением контроля.",
        traits: ["Стратегия", "Контроль", "Холодный ум"]
      },
      others: [
        { name: "Light Yagami", anime: "Death Note" },
        { name: "Kurisu Makise", anime: "Steins;Gate" },
        { name: "Senku Ishigami", anime: "Dr. Stone" }
      ]
    },
    INTP: {
      main: {
        name: "L Lawliet",
        anime: "Death Note",
        description: "Наблюдательный аналитик, который живёт логикой, странными связями и глубокими выводами.",
        traits: ["Анализ", "Наблюдательность", "Логика"]
      },
      others: [
        { name: "Maomao", anime: "The Apothecary Diaries" },
        { name: "Armin Arlert", anime: "Attack on Titan" },
        { name: "Shikamaru Nara", anime: "Naruto" }
      ]
    },
    ENTJ: {
      main: {
        name: "Erwin Smith",
        anime: "Attack on Titan",
        description: "Лидер, который умеет собрать хаос в цель, план и движение вперёд.",
        traits: ["Лидерство", "Решительность", "Масштаб"]
      },
      others: [
        { name: "Roy Mustang", anime: "Fullmetal Alchemist" },
        { name: "Satsuki Kiryuin", anime: "Kill la Kill" },
        { name: "Kaguya Shinomiya", anime: "Kaguya-sama: Love is War" }
      ]
    },
    ENTP: {
      main: {
        name: "Gojo Satoru",
        anime: "Jujutsu Kaisen",
        description: "Яркий импровизатор с колоссальной уверенностью, чувством игры и живым умом.",
        traits: ["Харизма", "Остроумие", "Импровизация"]
      },
      others: [
        { name: "Hisoka", anime: "Hunter x Hunter" },
        { name: "Oikawa Tooru", anime: "Haikyuu!!" },
        { name: "Kaito Kid", anime: "Magic Kaito 1412" }
      ]
    },
    INFJ: {
      main: {
        name: "Itachi Uchiha",
        anime: "Naruto",
        description: "Тихий идеалист с глубиной, внутренней дисциплиной и тяжёлым чувством ответственности.",
        traits: ["Интуиция", "Самоконтроль", "Глубина"]
      },
      others: [
        { name: "Suguru Geto", anime: "Jujutsu Kaisen" },
        { name: "Chrollo Lucilfer", anime: "Hunter x Hunter" },
        { name: "Riza Hawkeye", anime: "Fullmetal Alchemist" }
      ]
    },
    INFP: {
      main: {
        name: "Ken Kaneki",
        anime: "Tokyo Ghoul",
        description: "Очень внутренний и чувствительный герой, который ищет правду о себе и мире.",
        traits: ["Чувствительность", "Внутренний поиск", "Искренность"]
      },
      others: [
        { name: "Yuta Okkotsu", anime: "Jujutsu Kaisen" },
        { name: "Shinji Ikari", anime: "Neon Genesis Evangelion" },
        { name: "Izuku Midoriya", anime: "My Hero Academia" }
      ]
    },
    ENFJ: {
      main: {
        name: "Tanjiro Kamado",
        anime: "Demon Slayer",
        description: "Тёплый и сильный эмпат, который ведёт людей вперёд сердцем и волей.",
        traits: ["Сострадание", "Наставничество", "Сила"]
      },
      others: [
        { name: "All Might", anime: "My Hero Academia" },
        { name: "Maes Hughes", anime: "Fullmetal Alchemist" },
        { name: "Tohru Honda", anime: "Fruits Basket" }
      ]
    },
    ENFP: {
      main: {
        name: "Naruto Uzumaki",
        anime: "Naruto",
        description: "Источник живой энергии, веры в людей и движения вперёд даже после падений.",
        traits: ["Энергия", "Оптимизм", "Воодушевление"]
      },
      others: [
        { name: "Natsu Dragneel", anime: "Fairy Tail" },
        { name: "Atsushi Nakajima", anime: "Bungo Stray Dogs" },
        { name: "Anya Forger", anime: "Spy x Family" }
      ]
    },
    ISTJ: {
      main: {
        name: "Kento Nanami",
        anime: "Jujutsu Kaisen",
        description: "Надёжный профессионал, который держит слово, ритм и внутренний порядок.",
        traits: ["Надёжность", "Дисциплина", "Спокойствие"]
      },
      others: [
        { name: "Levi Ackerman", anime: "Attack on Titan" },
        { name: "Giyu Tomioka", anime: "Demon Slayer" },
        { name: "Tenya Iida", anime: "My Hero Academia" }
      ]
    },
    ISFJ: {
      main: {
        name: "Hinata Hyuga",
        anime: "Naruto",
        description: "Мягкая, верная и очень глубокая героиня, которая растёт через внутреннюю силу.",
        traits: ["Забота", "Преданность", "Нежность"]
      },
      others: [
        { name: "Ochaco Uraraka", anime: "My Hero Academia" },
        { name: "Chise Hatori", anime: "The Ancient Magus' Bride" },
        { name: "Yor Forger", anime: "Spy x Family" }
      ]
    },
    ESTJ: {
      main: {
        name: "Erza Scarlet",
        anime: "Fairy Tail",
        description: "Собранная и сильная управленческая энергия, которая держит команду и не боится ответственности.",
        traits: ["Порядок", "Сила", "Ответственность"]
      },
      others: [
        { name: "Vegeta", anime: "Dragon Ball" },
        { name: "Olivier Armstrong", anime: "Fullmetal Alchemist" },
        { name: "Nobara Kugisaki", anime: "Jujutsu Kaisen" }
      ]
    },
    ESFJ: {
      main: {
        name: "Momo Yaoyorozu",
        anime: "My Hero Academia",
        description: "Заботливая и очень организованная опора, которая хочет быть полезной людям рядом.",
        traits: ["Поддержка", "Организация", "Тепло"]
      },
      others: [
        { name: "Winry Rockbell", anime: "Fullmetal Alchemist" },
        { name: "Orihime Inoue", anime: "Bleach" },
        { name: "Kobeni Higashiyama", anime: "Chainsaw Man" }
      ]
    },
    ISTP: {
      main: {
        name: "Levi Ackerman",
        anime: "Attack on Titan",
        description: "Минимум слов, максимум точности, навыка и хладнокровного действия.",
        traits: ["Точность", "Самообладание", "Практика"]
      },
      others: [
        { name: "Roronoa Zoro", anime: "One Piece" },
        { name: "Toji Fushiguro", anime: "Jujutsu Kaisen" },
        { name: "Mikasa Ackerman", anime: "Attack on Titan" }
      ]
    },
    ISFP: {
      main: {
        name: "Megumi Fushiguro",
        anime: "Jujutsu Kaisen",
        description: "Сдержанный и принципиальный персонаж с сильным внутренним кодексом и тихой глубиной.",
        traits: ["Принципы", "Сдержанность", "Внутренняя сила"]
      },
      others: [
        { name: "Bocchi Hitori", anime: "Bocchi the Rock!" },
        { name: "Saber", anime: "Fate/stay night" },
        { name: "Kenshin Himura", anime: "Rurouni Kenshin" }
      ]
    },
    ESTP: {
      main: {
        name: "Joseph Joestar",
        anime: "JoJo's Bizarre Adventure",
        description: "Дерзкий и мгновенно реагирующий герой, который обожает азарт, игру и риск.",
        traits: ["Смелость", "Импровизация", "Скорость"]
      },
      others: [
        { name: "Yusuke Urameshi", anime: "Yu Yu Hakusho" },
        { name: "Inosuke Hashibira", anime: "Demon Slayer" },
        { name: "Reigen Arataka", anime: "Mob Psycho 100" }
      ]
    },
    ESFP: {
      main: {
        name: "Ryuko Matoi",
        anime: "Kill la Kill",
        description: "Яркая, живая и эмоциональная энергия, которая не боится быть собой на полную силу.",
        traits: ["Яркость", "Эмоции", "Храбрость"]
      },
      others: [
        { name: "Power", anime: "Chainsaw Man" },
        { name: "Denji", anime: "Chainsaw Man" },
        { name: "Nami", anime: "One Piece" }
      ]
    }
  };

  Object.values(groups).forEach((group) => {
    group.main = { ...group.main, ...assetUrls(group.main.name) };
    group.others = group.others.map((character) => ({ ...character, ...assetUrls(character.name) }));
  });

  const typeDetails = Object.fromEntries(
    Object.entries(typeProfiles).map(([code, profile]) => [
      code,
      {
        name: profile.name,
        description: profile.description
      }
    ])
  );

  return {
    typeProfiles,
    typeDetails,
    groups
  };
})();
