"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Snowflake,
} from "lucide-react";
import emailjs from "@emailjs/browser";
import TechQuizHeader from "@/components/animated-header";
import { QuizQuestion } from "@/types/quiz";
import { mockQuizData } from "@/data/question";

// Shuffle array (Fisher-Yates algorithm)
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[i], shuffled[j]];
  }
  return shuffled;
};

// Decode HTML entities
const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const QuizApp = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS Public Key
  }, []);

  // Fetch session token (unchanged)
  const fetchSessionToken = useCallback(async () => {
    try {
      const cachedToken = localStorage.getItem("quizSessionToken");
      if (cachedToken) {
        setSessionToken(cachedToken);
        return cachedToken;
      }
      const response = await fetch(
        "https://opentdb.com/api_token.php?command=request"
      );
      const data = await response.json();
      if (data.response_code === 0) {
        localStorage.setItem("quizSessionToken", data.token);
        setSessionToken(data.token);
        return data.token;
      } else {
        console.error("Failed to fetch session token:", data);
        return null;
      }
    } catch (err) {
      console.error("Error fetching session token:", err);
      return null;
    }
  }, []);

  // Fetch questions (unchanged)
  const fetchQuestions = useCallback(
    async (retryCount = 0) => {
      const maxRetries = 3;
      const cacheDuration = 12 * 60 * 60 * 1000;
      setLoading(true);
      setError(null);
      const cachedQuestions = localStorage.getItem("quizQuestions");
      const cacheTime = localStorage.getItem("quizCacheTime");
      if (
        cachedQuestions &&
        cacheTime &&
        Date.now() - parseInt(cacheTime) < cacheDuration
      ) {
        const parsedQuestions = JSON.parse(cachedQuestions);
        setQuestions(shuffleArray(parsedQuestions));
        setLoading(false);
        return;
      }
      try {
        const token = sessionToken || (await fetchSessionToken());
        const baseUrl =
          "https://opentdb.com/api.php?amount=30&category=9&difficulty=medium&type=multiple";
        const apiUrl = token ? `${baseUrl}&token=${token}` : baseUrl;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          if (response.status === 429 && retryCount < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, 3000 * (retryCount + 1))
            );
            return fetchQuestions(retryCount + 1);
          }
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        if (data.response_code !== 0) {
          const errorMessages: { [key: number]: string } = {
            1: "No questions available for the selected category.",
            2: "Invalid parameters in API request.",
            3: "Session token not found. Fetching new token.",
            4: "Session token exhausted. Resetting token.",
            5: "Rate limit exceeded. Please try again later.",
          };
          if (data.response_code === 3 || data.response_code === 4) {
            localStorage.removeItem("quizSessionToken");
            const newToken = await fetchSessionToken();
            if (newToken && retryCount < maxRetries) {
              setSessionToken(newToken);
              return fetchQuestions(retryCount + 1);
            }
          }
          throw new Error(
            errorMessages[data.response_code as number] || "Unknown API error."
          );
        }
        const transformedQuestions = data.results.map(
          (item: {
            correct_answer: any;
            incorrect_answers: any[];
            question: any;
          }) => {
            const options = shuffleArray([
              decodeHtml(item.correct_answer),
              ...item.incorrect_answers.map(decodeHtml),
            ]);
            const correctAnswer = options.indexOf(
              decodeHtml(item.correct_answer)
            );
            return {
              question: decodeHtml(item.question),
              options,
              correctAnswer,
              explanation: "No explanation provided by the API.",
            };
          }
        );
        localStorage.setItem(
          "quizQuestions",
          JSON.stringify(transformedQuestions)
        );
        localStorage.setItem("quizCacheTime", Date.now().toString());
        setQuestions(shuffleArray(transformedQuestions));
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Fetch error:", errorMessage);
        if (retryCount < maxRetries) {
          setTimeout(
            () => fetchQuestions(retryCount + 1),
            3000 * (retryCount + 1)
          );
        } else {
          console.warn("Using mock data as fallback");
          setQuestions(shuffleArray(mockQuizData));
          setError("Failed to load API questions. Using mock data.");
        }
      } finally {
        setLoading(false);
      }
    },
    [sessionToken]
  );

  // Submit score via EmailJS
  const submitScoreViaEmail = async () => {
    if (!userName.trim()) {
      setSubmitMessage("Please enter your name.");
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      await emailjs.send(
        "service_irp932w", // Replace with your EmailJS Service ID
        "template_5zgtvar", // Replace with your EmailJS Template ID
        {
          name: userName,
          score: score,
          total: questions.length,
          percentage: Math.round((score / questions.length) * 100),
          to_email: "oparajitee4@gmail.com",
        },
        "tl7bPZzm7r77rZrKF" // Replace with your EmailJS Public Key
      );
      setSubmitMessage("Score submitted successfully!");
    } catch (err) {
      console.error("Email submission error:", err);
      setSubmitMessage("Error submitting score. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize quiz (unchanged)
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handle answer selection (unchanged)
  const handleAnswerSelect = useCallback(
    (answerIndex: number) => {
      if (!isActive || showResult) return;
      setSelectedAnswer(answerIndex);
    },
    [isActive, showResult]
  );

  // Handle answer submission (unchanged)
  const handleAnswerSubmit = useCallback(() => {
    if (selectedAnswer === null) return;
    setIsActive(false);
    setShowResult(true);
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
  }, [selectedAnswer, questions, currentQuestion]);

  // Move to next question (unchanged)
  const moveToNext = useCallback(() => {
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
  }, [currentQuestion, questions.length]);

  // Handle time up (unchanged)
  const handleTimeUp = useCallback(() => {
    setIsActive(false);
    setShowResult(true);
    if (selectedAnswer !== null) {
      handleAnswerSubmit();
    } else {
      setTimeout(() => {
        moveToNext();
      }, 2000);
    }
  }, [selectedAnswer, handleAnswerSubmit, moveToNext]);

  // Timer effect (unchanged)
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimeUp();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, handleTimeUp]);

  // Start quiz
  const startQuiz = useCallback(() => {
    setIsActive(true);
    setTimeLeft(20);
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setShowResult(false);
    setSelectedAnswer(null);
    setUserName("");
    setSubmitMessage("");
    setQuestions(shuffleArray(questions));
    console.log("Quiz started");
  }, [questions]);

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setTimeLeft(20);
    setIsActive(false);
    setScore(0);
    setQuizCompleted(false);
    setShowResult(false);
    setShowExplanation(false);
    setUserName("");
    setSubmitMessage("");
    localStorage.removeItem("quizQuestions");
    localStorage.removeItem("quizCacheTime");
    fetchQuestions();
    console.log("Quiz reset");
  }, [fetchQuestions]);

  // Toggle explanation (unchanged)
  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  // Format time (unchanged)
  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(2, "0");
  };

  // Get timer color (unchanged)
  const getTimerColor = () => {
    if (timeLeft <= 5) return "text-red-500";
    if (timeLeft <= 10) return "text-yellow-500";
    return "text-green-500";
  };

  // Get progress width (unchanged)
  const getProgressWidth = () => {
    return ((20 - timeLeft) / 20) * 100;
  };

  // Loading screen (unchanged)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-white/20">
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <p className="text-white text-lg">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-white/20">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => {
              setUserName("");
              setSubmitMessage("");
              resetQuiz();
            }}
            className="mt-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Quiz completed screen
  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    const showConfetti = percentage >= 80;

    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative ${
          showConfetti ? "animate-pulseLight" : ""
        }`}
      >
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <Snowflake
                key={i}
                className="absolute text-white/70 w-6 h-6 animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-white/20 relative z-10">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {showConfetti ? "Congratulations!" : "Quiz Completed!"}
            </h2>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-gray-300 text-lg">
              You scored {percentage}%{showConfetti ? " - Amazing job!" : ""}
            </p>
          </div>
          <div className="mb-6">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              onClick={submitScoreViaEmail}
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Score"}
            </button>
            {submitMessage && (
              <p
                className={`mt-2 text-sm ${
                  submitMessage.includes("Error")
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {submitMessage}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setUserName("");
              setSubmitMessage("");
              resetQuiz();
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Start screen (unchanged)
  if (!isActive && currentQuestion === 0 && !showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border border-white/20">
          <TechQuizHeader />
          <div className="mb-8 mt-4">
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Test your knowledge with{" "}
              <span className="text-purple-300 font-semibold">
                {questions.length} questions
              </span>
              .
              <br />
              You have{" "}
              <span className="text-blue-300 font-semibold">
                20 seconds
              </span>{" "}
              per question!
            </p>
            {error && (
              <p className="text-yellow-400 text-sm mb-4">
                {error} You can still play with mock data.
              </p>
            )}
          </div>
          <button
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-lg shadow-lg"
          >
            <Play className="w-6 h-6" />
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz in progress (unchanged)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-8">
          <div className="text-white">
            <span className="text-sm opacity-75">Question</span>
            <div className="text-xl font-bold">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-4xl font-bold ${getTimerColor()} flex items-center gap-2`}
            >
              <Clock className="w-8 h-8" />
              {formatTime(timeLeft)}
            </div>
            <div className="w-24 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 5
                    ? "bg-red-500"
                    : timeLeft <= 10
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${getProgressWidth()}%` }}
              />
            </div>
          </div>
          <div className="text-white text-right">
            <span className="text-sm opacity-75">Score</span>
            <div className="text-xl font-bold">{score}</div>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
            {questions[currentQuestion].question}
          </h2>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => {
              let buttonClass =
                "w-full p-4 text-left rounded-xl transition-all duration-300 transform hover:scale-105 ";
              if (showResult) {
                if (index === questions[currentQuestion].correctAnswer) {
                  buttonClass +=
                    "bg-green-500/30 border-2 border-green-400 text-green-100";
                } else if (
                  index === selectedAnswer &&
                  index !== questions[currentQuestion].correctAnswer
                ) {
                  buttonClass +=
                    "bg-red-500/30 border-2 border-red-400 text-red-100";
                } else {
                  buttonClass +=
                    "bg-white/5 border border-white/20 text-gray-300";
                }
              } else {
                if (selectedAnswer === index) {
                  buttonClass +=
                    "bg-blue-500/30 border-2 border-blue-400 text-blue-100";
                } else {
                  buttonClass +=
                    "bg-white/10 border border-white/20 text-white hover:bg-white/20";
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
                    {showResult &&
                      index === questions[currentQuestion].correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                      )}
                    {showResult &&
                      index === selectedAnswer &&
                      index !== questions[currentQuestion].correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                      )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
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
            <div className="container mx-auto flex gap-2 sm:gap-4">
              <button
                onClick={toggleExplanation}
                className="flex-1 bg-gradient-to-r text-center from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-1 sm:px-4 py-3 sm:py-4 transition-all duration-300 transform hover:scale-105"
              >
                {showExplanation ? "Hide Explanation" : "Show Explanation"}
              </button>
              <button
                onClick={moveToNext}
                className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-600 hover:to-blue-600 sm:px-4"
              >
                {currentQuestion === questions.length - 1
                  ? "Finish Quiz"
                  : "Next Question"}
              </button>
            </div>
          )}
        </div>
        {showResult && showExplanation && (
          <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">
              Explanation:
            </h3>
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
