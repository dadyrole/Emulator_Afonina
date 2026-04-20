// Типы данных для банка вопросов тренажёра ССТКС
// Один источник истины. questions.json должен валидироваться против этих типов.

export type SectionId =
  | "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX"
  | "X" | "XI" | "XII" | "XIII" | "XIV" | "XV" | "XVI" | "XVII";

export const SECTIONS: Record<SectionId, string> = {
  I:    "Общие положения ГМССБ",
  II:   "Морские районы и состав оборудования",
  III:  "Цифровой избирательный вызов (ЦИВ)",
  IV:   "Радиоустановки УКВ, ПВ, КВ",
  V:    "Радиотелекс (УБПЧ)",
  VI:   "Спутниковые системы связи",
  VII:  "Система КОСПАС-САРСАТ и АРБ",
  VIII: "Радиооборудование спасательных средств",
  IX:   "Информация по безопасности мореплавания (ИБМ)",
  X:    "Антенны и электропитание",
  XI:   "Техническое обслуживание",
  XII:  "Документация, дипломы, идентификация",
  XIII: "Обязанности вахтенного радиооператора",
  XIV:  "Оплата услуг связи",
  XV:   "Процедуры связи при бедствии",
  XVI:  "Процедуры срочности и безопасности",
  XVII: "Поиск и спасание",
};

export type Difficulty = "easy" | "medium" | "hard";
export type Pool = "standard" | "extended";
// standard = строго по формулировке Афонина (116 вопросов 1:1)
// extended = standard + прикладные задачи-сценарии, вариации

export interface QuestionBase {
  id: string;                    // "q-standard-045", стабильный
  sourceQuestions: number[];     // номера вопросов Афонина (1-116)
  section: SectionId;
  difficulty: Difficulty;
  pool: Pool;
  topic: string;                 // slug: "distress_procedure_A1"
  prompt: string;                // текст вопроса, показываемый пользователю
  explanation: string;           // разбор ответа (показывается после ответа)
  lectureRef?: string;           // "п. 2.4.1" — пункт учебного пособия
  tags?: string[];               // для фильтрации, напр. ["А1", "УКВ", "ЦИВ"]
}

// ===== SINGLE CHOICE =====
export interface SingleChoice extends QuestionBase {
  type: "single_choice";
  options: { id: string; text: string }[];
  correct: string;               // id единственного правильного варианта
}

// ===== MULTI CHOICE =====
export interface MultiChoice extends QuestionBase {
  type: "multi_choice";
  options: { id: string; text: string }[];
  correct: string[];             // id всех правильных
  // Оценка: 100% при точном совпадении; частичное = (правильных - лишних*0.2)/N*100, не ниже 0
}

// ===== TEXT INPUT =====
export interface TextInput extends QuestionBase {
  type: "text_input";
  acceptedAnswers: string[];     // все допустимые варианты после нормализации
  normalization?: {
    caseSensitive?: boolean;     // default false
    stripSpaces?: boolean;       // default true
    stripPunctuation?: boolean;  // default true
  };
  regex?: string;                // опциональная дополнительная проверка
  placeholder?: string;          // плейсхолдер в поле ввода
  // Fallback: если пользователь нажал "показать варианты", балл режется вдвое
  fallbackOptions?: {
    options: { id: string; text: string }[];
    correct: string;
  };
}

// ===== FORMAT CHECK =====
// Дано сообщение (MAYDAY/PAN PAN/SÉCURITÉ) с ошибками. Пользователь кликает на ошибочные фрагменты.
export interface FormatCheck extends QuestionBase {
  type: "format_check";
  // Сообщение разбивается на токены. Каждый токен либо правильный, либо ошибочный.
  tokens: {
    id: string;
    text: string;
    isError: boolean;
    errorReason?: string;        // короткое пояснение, показывается при клике/hover
  }[];
  minErrorsToFind?: number;      // порог для зачёта (если не все ошибки найдены)
  // Оценка: (найдено_ошибок/всего_ошибок)*100 - ложные_срабатывания*10, не ниже 0
}

// ===== MATCHING =====
export interface Matching extends QuestionBase {
  type: "matching";
  leftLabel: string;             // заголовок левого столбца, напр. "Частота"
  rightLabel: string;            // заголовок правого столбца, напр. "Назначение"
  pairs: { id: string; left: string; right: string }[];
  // UI перемешивает правые элементы; пользователь соединяет пары
}

// ===== WORD MATCH =====
// Для аббревиатур и расшифровок. Пользователь вводит ответ свободно, тренажёр
// разбивает введённый текст и эталон на слова и показывает какие совпали (зелёным).
// Оценка: (кол-во совпавших слов / кол-во слов в эталоне) × 100%, без штрафа за лишние.
// Нормализация слов: lowercase, trim, убрать знаки препинания, дефисы → пробел.
export interface WordMatch extends QuestionBase {
  type: "word_match";
  // Эталонный ответ (каноничная расшифровка из лекций)
  correctAnswer: string;
  // Допустимые альтернативы (например "side band" == "side-band" == "sideband")
  // для продвинутой проверки соответствия
  acceptedAlternatives?: string[];
  // Ключевые слова, без которых ответ не засчитывается ни в какой степени
  // (например для SSB без слова "single" — ответ 0%)
  requiredKeywords?: string[];
  placeholder?: string;
  // Разрешить ли ответ на русском (например "однополосный" для SSB)
  allowRussian?: boolean;
  russianAnswer?: string;  // русский эквивалент, если allowRussian
}

export type Question = SingleChoice | MultiChoice | TextInput | FormatCheck | Matching | WordMatch;

// ===== META =====
// Карта соответствия: номер вопроса Афонина → id тренажёрных вопросов
export interface SourceQuestionEntry {
  number: number;                // 1..116
  afoninText: string;            // точная формулировка из списка Афонина
  section: SectionId;
  trainerQuestions: string[];    // id вопросов тренажёра, относящихся к этому номеру
}

export interface QuestionBank {
  version: string;               // "1.0.0"
  lastUpdated: string;           // ISO date
  questions: Question[];
  sourceList: SourceQuestionEntry[];  // все 116 вопросов Афонина
}
