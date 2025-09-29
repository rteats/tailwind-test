"use client";

import { useState, useEffect, useRef } from 'react';
import { mathQuestions, categories } from './data';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Component to render text with LaTeX support
const LatexText = ({ text, className = "" }) => {
  if (typeof text !== 'string') return text;

  const parts = text.split(/(\$\$[^$]*\$\$|\$[^$]*\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const latex = part.slice(2, -2);
          return <BlockMath key={index} math={latex} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const latex = part.slice(1, -1);
          return <InlineMath key={index} math={latex} />;
        }
        return part;
      })}
    </span>
  );
};

// Utility functions
const getCategoryPath = (categoryId) => {
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      if (subcategory.id === categoryId) {
        return `${category.name} → ${subcategory.name}`;
      }
    }
  }
  return 'Unknown Category';
};

const getAllCategoryIds = () => {
  return categories.flatMap(category =>
    category.subcategories.map(sub => sub.id)
  );
};

// Main component
export default function MathQuiz() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);

  // Common styles
  const styles = {
    container: "min-h-screen p-4 md:p-8",
    card: "bg-white rounded-xl shadow-lg p-6",
    button: {
      primary: "px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md",
      secondary: "px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors",
      success: "px-6 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors",
      danger: "px-6 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
    },
    badge: "px-3 py-1 rounded-full text-sm font-medium",
    answerButton: {
      base: "p-4 rounded-lg font-medium text-lg transition-all duration-200 text-left",
      normal: "bg-gray-100/80 hover:bg-gray-200/80 text-gray-900",
      correct: "bg-green-600/80 text-white",
      incorrect: "bg-red-600/80 text-white",
      disabled: "bg-gray-300/60 text-gray-600 cursor-not-allowed"
    }
  };

  // Initialize categories
  useEffect(() => {
    const saved = localStorage.getItem('mathQuizCategories');
    setSelectedCategories(saved ? JSON.parse(saved) : getAllCategoryIds());
  }, []);

  // Save categories
  useEffect(() => {
    if (selectedCategories.length > 0) {
      localStorage.setItem('mathQuizCategories', JSON.stringify(selectedCategories));
    }
  }, [selectedCategories]);

  // Filter questions
  useEffect(() => {
    const filtered = mathQuestions.filter(q => selectedCategories.includes(q.category));
    setQuestions(filtered);
  }, [selectedCategories]);

  // Shuffle answers
  useEffect(() => {
    if (currentQuestion) {
      const allAnswers = [...currentQuestion.wrongAnswers, currentQuestion.correctAnswer];
      setShuffledAnswers(allAnswers.sort(() => Math.random() - 0.5));
    }
  }, [currentQuestion]);

  const startQuiz = () => {
    if (questions.length === 0) return;

    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQuestion(shuffled[0]);
    setScore(0);
    setQuestionCount(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);
  };

  const handleNextQuestion = () => {
    const nextIndex = questionCount + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestion(questions[nextIndex]);
      setQuestionCount(nextIndex);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setShowResults(true);
    }
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleMainCategory = (mainCategoryId) => {
    const mainCategory = categories.find(cat => cat.id === mainCategoryId);
    if (!mainCategory) return;

    const subcategoryIds = mainCategory.subcategories.map(sub => sub.id);
    const allSelected = subcategoryIds.every(id => selectedCategories.includes(id));

    setSelectedCategories(prev =>
      allSelected
        ? prev.filter(id => !subcategoryIds.includes(id))
        : [...new Set([...prev, ...subcategoryIds])]
    );
  };

  // Results Screen
  if (showResults) {
    return (
      <main className={`${styles.container} flex items-center justify-center`}>
        <section className={`${styles.card} text-center max-w-md w-full`}>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Тренажёр пройден!</h1>
          <div className="text-5xl font-bold text-green-600 mb-4">{score}/{questions.length}</div>
          <p className="text-xl text-gray-600 mb-8">
            {score === questions.length ? "Заебись!" :
              score >= questions.length * 0.7 ? "Тоже недурно!" :
                "А ну по новой, далбаеб!"}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setCurrentQuestion(null)} className={styles.button.secondary}>
              Назад в Меню
            </button>
            <button onClick={startQuiz} className={styles.button.success}>
              Начать заново
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Category Selection Screen
  if (!currentQuestion) {
    return (
      <main className={`${styles.container} `}>
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Тренажёр по матану</h1>
          <p className="text-gray-600">Выбери категории вопросов для тренировки</p>
        </header>

        <section className={styles.card}>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Категории вопросов</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {categories.map(category => {
              const subcategoryIds = category.subcategories.map(sub => sub.id);
              const selectedCount = subcategoryIds.filter(id => selectedCategories.includes(id)).length;
              const allSelected = selectedCount === subcategoryIds.length;

              return (
                <article key={category.id} className={`border rounded-lg p-4 ${allSelected ? 'bg-blue-50/60 border-blue-200' : 'border-gray-200'}`}>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => toggleMainCategory(category.id)}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <header>
                        <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </header>
                      <p className="text-xs text-gray-500 mt-1">
                        Выбрано {selectedCount} из {subcategoryIds.length} тематик
                      </p>

                      <div className="mt-3 space-y-2">
                        {category.subcategories.map(subcategory => (
                          <label key={subcategory.id} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(subcategory.id)}
                              onChange={() => toggleCategory(subcategory.id)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm">
                              {subcategory.name}
                              <span className="text-gray-400 ml-1">
                                ({mathQuestions.filter(q => q.category === subcategory.id).length})
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </label>
                </article>
              );
            })}
          </div>

          <button
            onClick={startQuiz}
            disabled={selectedCategories.length === 0}
            className={`w-full sticky py-4 rounded-xl font-semibold text-lg transition-all ${selectedCategories.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              }`}
          >
            Тренироваться ({questions.length} вопросов)
          </button>
        </section>
      </main>
    );
  }

  // Quiz Screen
  const getAnswerButtonClass = (answer) => {
    if (selectedAnswer === null) {
      return `${styles.answerButton.base} ${styles.answerButton.normal}`;
    }

    if (answer === currentQuestion.correctAnswer) {
      return `${styles.answerButton.base} ${styles.answerButton.correct}`;
    }

    if (answer === selectedAnswer) {
      return `${styles.answerButton.base} ${styles.answerButton.incorrect}`;
    }

    return `${styles.answerButton.base} ${styles.answerButton.disabled}`;
  };

  return (
    <main className={styles.container}>
      <section className={`${styles.card} max-w-2xl mx-auto`}>
        <header className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className={`${styles.badge} bg-blue-100/80 text-blue-700`}>
              Вопрос {questionCount + 1} из {questions.length}
            </span>
            <span className="text-lg font-medium text-gray-700">
              Счёт: {score}
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            {getCategoryPath(currentQuestion.category)}
          </p>
        </header>

        <article className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            <LatexText text={currentQuestion.question} />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shuffledAnswers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(answer)}
                disabled={selectedAnswer !== null}
                className={getAnswerButtonClass(answer)}
              >
                <LatexText text={answer} />
              </button>
            ))}
          </div>
        </article>

        {selectedAnswer !== null && (
          <footer className="flex justify-between gap-4 items-center">
            <div className={`p-4 flex-auto rounded-lg  ${isCorrect ? 'bg-green-100/80 text-green-800' : 'bg-red-100/80 text-red-800'
              }`}>
              <p className="font-semibold text-lg">
                {isCorrect ? '✅ Праильно!' : '❌ Чудик!'}
              </p>

            </div>
            <button
              onClick={handleNextQuestion}
              className={styles.button.primary}
            >
              {questionCount + 1 < questions.length ? 'Следующий вопрос' : 'Посмотреть результаты'}
            </button>
          </footer>
        )}
      </section>
    </main>
  );
}