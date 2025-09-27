"use client";

import { useState, useEffect, useRef } from 'react';
import { mathQuestions, categories } from './data';

export default function MathQuiz() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [needsFloatingButton, setNeedsFloatingButton] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Check if we need floating button
  useEffect(() => {
    const checkLayout = () => {
      if (containerRef.current && contentRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const contentHeight = contentRef.current.scrollHeight;
        const viewportHeight = window.innerHeight;

        // Need floating button if content is taller than viewport
        setNeedsFloatingButton(contentHeight > viewportHeight);
      }
    };

    checkLayout();
    window.addEventListener('resize', checkLayout);

    return () => window.removeEventListener('resize', checkLayout);
  }, [currentQuestion, showResults, selectedCategories, questions, showNextPrompt]);

  // Shuffle answers only when question changes
  useEffect(() => {
    if (currentQuestion) {
      const allAnswers = [...currentQuestion.wrongAnswers, currentQuestion.correctAnswer];
      setShuffledAnswers(allAnswers.sort(() => Math.random() - 0.5));
    }
  }, [currentQuestion]);

  // Initialize categories from localStorage or select all
  useEffect(() => {
    const savedCategories = localStorage.getItem('mathQuizCategories');
    if (savedCategories) {
      setSelectedCategories(JSON.parse(savedCategories));
    } else {
      const allCategories = categories.map(cat => cat.id);
      setSelectedCategories(allCategories);
    }
  }, []);

  // Save categories to localStorage when they change
  useEffect(() => {
    if (selectedCategories.length > 0) {
      localStorage.setItem('mathQuizCategories', JSON.stringify(selectedCategories));
    }
  }, [selectedCategories]);

  // Filter questions based on selected categories
  useEffect(() => {
    const filtered = mathQuestions.filter(q => selectedCategories.includes(q.category));
    setQuestions(filtered);
  }, [selectedCategories]);

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
    setShowNextPrompt(false);
  };

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    setShowNextPrompt(true);
  };

  const handleNextQuestion = () => {
    const nextIndex = questionCount + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestion(questions[nextIndex]);
      setQuestionCount(nextIndex);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowNextPrompt(false);
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

  if (showResults) {
    return (
      <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Quiz Complete!</h1>
          <div className="text-6xl font-bold text-green-600 mb-4">{score}/{questions.length}</div>
          <div className="text-2xl text-gray-600 mb-8">
            {score === questions.length ? "Perfect score! 🎉" :
              score >= questions.length * 0.7 ? "Great job! 👍" :
                "Keep practicing! 💪"}
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setCurrentQuestion(null);
                setShowResults(false);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-3xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Menu
            </button>
            <button
              onClick={startQuiz}
              className="bg-green-600 text-white px-6 py-3 rounded-3xl font-semibold hover:bg-green-700 transition-colors"
            >
              Restart Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div
        ref={containerRef}
        className="font-sans min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col"
      >
        <div
          ref={contentRef}
          className="max-w-2xl mx-auto w-full flex-grow p-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-8">Math Quiz</h1>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Select Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(category => (
                <label key={category.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-500">{category.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Start Quiz Button */}
        <div className={`max-w-2xl mx-auto w-full p-8 ${needsFloatingButton ? 'fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-t from-blue-50 to-transparent pt-16 pb-8' : 'flex-grow-0'}`}>
          <button
            onClick={startQuiz}
            disabled={selectedCategories.length === 0}
            className={`w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors ${needsFloatingButton ? 'shadow-2xl' : ''}`}
          >
            Start Quiz ({questions.length} questions)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col"
      onClick={showNextPrompt ? handleNextQuestion : undefined}
    >
      <div
        ref={contentRef}
        className="max-w-2xl mx-auto w-full flex-grow p-8"
      >
        {/* Progress Bar */}
        <div className="bg-white rounded-full shadow mb-8">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((questionCount) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              Question {questionCount + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              Score: {score}
            </span>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shuffledAnswers.map((answer, index) => {
              let buttonClass = "bg-gray-100 hover:bg-gray-200 text-gray-800";

              if (selectedAnswer !== null) {
                if (answer === selectedAnswer) {
                  buttonClass = isCorrect
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white";
                } else if (answer === currentQuestion.correctAnswer) {
                  buttonClass = "bg-green-500 text-white";
                } else {
                  buttonClass = "bg-gray-300 text-gray-600 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(answer)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-lg font-medium text-lg transition-all duration-200 ${buttonClass} disabled:cursor-not-allowed`}
                >
                  {answer}
                </button>
              );
            })}
          </div>
        </div>

        {isCorrect !== null && !showNextPrompt && (
          <div className={`text-center p-4 rounded-lg mb-4 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
          </div>
        )}
      </div>

      {/* Next Question Prompt */}
      {showNextPrompt && (
        <div className={`max-w-2xl mx-auto w-full ${needsFloatingButton ? 'fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-t from-blue-50 to-transparent pt-16 pb-8 px-8' : 'p-8 flex-grow-0'}`}>
          <div className={`text-center p-4 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} ${needsFloatingButton ? 'shadow-2xl' : ''}`}>
            {isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
            <div className="mt-2 text-lg font-semibold animate-pulse">
              {needsFloatingButton ? 'Click anywhere to continue...' : 'Click anywhere or press any key to continue...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}