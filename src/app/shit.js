"use client";

import { useState, useEffect } from 'react';
import { mathQuestions, categories } from './data';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Component to render text with LaTeX support
const LatexText = ({ text, className = "" }) => {
    if (typeof text !== 'string') return text;

    // Split text by LaTeX delimiters ($...$)
    const parts = text.split(/(\$[^$]*\$)/g);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    // Remove the $ delimiters and render as LaTeX
                    const latex = part.slice(1, -1);
                    return <InlineMath key={index} math={latex} />;
                }
                return part;
            })}
        </span>
    );
};

export default function MathQuiz() {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

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
    };

    const handleAnswerSelect = (answer) => {
        if (selectedAnswer !== null) return; // Prevent multiple selections

        setSelectedAnswer(answer);
        const correct = answer === currentQuestion.correctAnswer;
        setIsCorrect(correct);

        if (correct) {
            setScore(score + 1);
        }

        setTimeout(() => {
            const nextIndex = questionCount + 1;
            if (nextIndex < questions.length) {
                setCurrentQuestion(questions[nextIndex]);
                setQuestionCount(nextIndex);
                setSelectedAnswer(null);
                setIsCorrect(null);
            } else {
                setShowResults(true);
            }
        }, 1500);
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const shuffleAnswers = (question) => {
        if (!question) return [];
        const allAnswers = [...question.wrongAnswers, question.correctAnswer];
        return allAnswers.sort(() => Math.random() - 0.5);
    };

    if (showResults) {
        const percentage = (score / questions.length) * 100;
        let message = "Keep practicing! 💪";
        let emoji = "📚";

        if (percentage === 100) {
            message = "Perfect score! 🎉";
            emoji = "🏆";
        } else if (percentage >= 80) {
            message = "Excellent work! 👍";
            emoji = "⭐";
        } else if (percentage >= 70) {
            message = "Good job! 👏";
            emoji = "✅";
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-6xl mb-4">{emoji}</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-6">Quiz Complete!</h1>
                    <div className="text-6xl font-bold text-green-600 mb-4">{score}/{questions.length}</div>
                    <div className="text-2xl text-gray-600 mb-2">{percentage.toFixed(1)}%</div>
                    <div className="text-xl text-gray-600 mb-8">{message}</div>
                    <button
                        onClick={startQuiz}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Math Quiz</h1>

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Select Categories</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map(category => (
                                <label key={category.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => toggleCategory(category.id)}
                                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className="ml-3">
                                        <div className="font-medium text-gray-900">{category.name}</div>
                                        <div className="text-sm text-gray-500">{category.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={startQuiz}
                        disabled={selectedCategories.length === 0}
                        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                    >
                        Start Quiz ({questions.length} questions)
                    </button>
                </div>
            </div>
        );
    }

    const answers = shuffleAnswers(currentQuestion);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-2xl mx-auto">
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

                    <h2 className="text-2xl font-semibold text-gray-800 mb-8 leading-relaxed text-center">
                        <LatexText text={currentQuestion.question} />
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {answers.map((answer, index) => {
                            let buttonClass = "bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-transparent";

                            if (selectedAnswer !== null) {
                                if (answer === selectedAnswer) {
                                    buttonClass = isCorrect
                                        ? "bg-green-500 text-white border-green-600"
                                        : "bg-red-500 text-white border-red-600";
                                } else if (answer === currentQuestion.correctAnswer) {
                                    buttonClass = "bg-green-500 text-white border-green-600";
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(answer)}
                                    disabled={selectedAnswer !== null}
                                    className={`p-4 rounded-lg font-medium text-lg transition-all duration-200 ${buttonClass} disabled:cursor-not-allowed min-h-[80px] flex items-center justify-center text-center`}
                                >
                                    <LatexText text={answer} className="text-lg" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {isCorrect !== null && (
                    <div className={`text-center p-4 rounded-lg mb-8 ${isCorrect ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {isCorrect ? '✅ Correct! Well done!' : '❌ Incorrect! Better luck next time!'}
                    </div>
                )}
            </div>
        </div>
    );
}