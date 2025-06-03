'use client';
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw, Play, Info } from 'lucide-react';

// Mock quiz data - replace with your API call
const mockQuizData = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    explanation: "Paris is the capital and largest city of France, known for landmarks like the Eiffel Tower and Louvre Museum."
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    explanation: "Mars is called the Red Planet due to iron oxide (rust) on its surface, giving it a reddish appearance."
  },
  {
    id: 3,
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
    correctAnswer: 1,
    explanation: "The Blue Whale is the largest animal ever known to have lived on Earth, reaching lengths of up to 100 feet."
  },
  {
    id: 4,
    question: "In which year did World War II end?",
    options: ["1944", "1945", "1946", "1947"],
    correctAnswer: 1,
    explanation: "World War II ended in 1945 with the surrender of Japan in September, following the atomic bombings and Soviet invasion."
  },
  {
    id: 5,
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    explanation: "Au comes from the Latin word 'aurum' meaning gold. It's element 79 on the periodic table."
  }
];

const QuizApp = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questions] = useState(mockQuizData);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimeUp();
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft]);

  const startQuiz = () => {
    setIsActive(true);
    setTimeLeft(20);
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const handleTimeUp = () => {
    setIsActive(false);
    setShowResult(true);
    if (selectedAnswer !== null) {
      handleAnswerSubmit();
    } else {
      // Auto move to next question if no answer selected
      setTimeout(() => {
        moveToNext();
      }, 2000);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isActive || showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;
    
    setIsActive(false);
    setShowResult(true);
    
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const moveToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(20);
      setIsActive(true);
      setShowResult(false);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
      setIsActive(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setTimeLeft(20);
    setIsActive(false);
    setScore(0);
    setQuizCompleted(false);
    setShowResult(false);
    setShowExplanation(false);
  };

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(2, '0');
  };

  const getTimerColor = () => {
    if (timeLeft <= 5) return 'text-red-500';
    if (timeLeft <= 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressWidth = () => {
    return ((20 - timeLeft) / 20) * 100;
  };

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-gray-300">
              You scored {Math.round((score / questions.length) * 100)}%
            </p>
          </div>
          
          <button
            onClick={resetQuiz}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isActive && currentQuestion === 0 && !showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Quiz Challenge</h1>
            <p className="text-gray-300 mb-6">
              Test your knowledge with {questions.length} questions. You have 20 seconds per question!
            </p>
          </div>
          
          <button
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
          >
            <Play className="w-6 h-6" />
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-white">
            <span className="text-sm opacity-75">Question</span>
            <div className="text-xl font-bold">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>
          
          {/* Countdown Timer */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getTimerColor()} flex items-center gap-2`}>
              <Clock className="w-8 h-8" />
              {formatTime(timeLeft)}
            </div>
            <div className="w-24 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${getProgressWidth()}%` }}
              />
            </div>
          </div>
          
          <div className="text-white text-right">
            <span className="text-sm opacity-75">Score</span>
            <div className="text-xl font-bold">{score}</div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
            {questions[currentQuestion].question}
          </h2>
          
          {/* Options */}
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => {
              let buttonClass = "w-full p-4 text-left rounded-xl transition-all duration-300 transform hover:scale-105 ";
              
              if (showResult) {
                if (index === questions[currentQuestion].correctAnswer) {
                  buttonClass += "bg-green-500/30 border-2 border-green-400 text-green-100";
                } else if (index === selectedAnswer && index !== questions[currentQuestion].correctAnswer) {
                  buttonClass += "bg-red-500/30 border-2 border-red-400 text-red-100";
                } else {
                  buttonClass += "bg-white/5 border border-white/20 text-gray-300";
                }
              } else {
                if (selectedAnswer === index) {
                  buttonClass += "bg-blue-500/30 border-2 border-blue-400 text-blue-100";
                } else {
                  buttonClass += "bg-white/10 border border-white/20 text-white hover:bg-white/20";
                }
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium">{option}</span>
                    {showResult && index === questions[currentQuestion].correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                    )}
                    {showResult && index === selectedAnswer && index !== questions[currentQuestion].correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!showResult && selectedAnswer !== null && (
            <button
              onClick={handleAnswerSubmit}
              className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Submit Answer
            </button>
          )}
          
          {showResult && (
            <>
              <button
                onClick={toggleExplanation}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Info className="w-5 h-5" />
                {showExplanation ? 'Hide' : 'Show'} Explanation
              </button>
              
              <button
                onClick={moveToNext}
                className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </>
          )}
        </div>

        {/* Explanation */}
        {showResult && showExplanation && (
          <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">Explanation:</h3>
            <p className="text-gray-300 leading-relaxed">
              {questions[currentQuestion].explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizApp;