import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import Swal from 'sweetalert2';

const db = getFirestore();

const Exams = ({ isDark }) => {
  const { user, role } = useAuth();
  const [availableExams, setAvailableExams] = useState([]);
  const [userExams, setUserExams] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [tutorialSuggestions, setTutorialSuggestions] = useState([]);

  useEffect(() => {
    if (user) {
      fetchExams();
      fetchUserExams();
    }
  }, [user]);

  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const fetchExams = async () => {
    try {
      const examsSnap = await getDocs(collection(db, 'exams'));
      const examsData = examsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableExams(examsData);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserExams = async () => {
    try {
      const userExamsSnap = await getDocs(query(collection(db, 'userExams'), where('userId', '==', user.uid)));
      const userExamsData = userExamsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserExams(userExamsData);
    } catch (error) {
      console.error('Error fetching user exams:', error);
    }
  };

  const startExam = (exam) => {
    setCurrentExam(exam);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(exam.duration * 60); // Convert minutes to seconds
    setExamStarted(true);
    setExamCompleted(false);
    setResults(null);
    setTutorialSuggestions([]);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < currentExam.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    const score = calculateScore();
    const passed = score >= currentExam.passingScore;
    
    setResults({
      score,
      totalQuestions: currentExam.questions.length,
      passed,
      percentage: Math.round((score / currentExam.questions.length) * 100)
    });

    // Save exam result
    try {
      await addDoc(collection(db, 'userExams'), {
        userId: user.uid,
        examId: currentExam.id,
        examTitle: currentExam.title,
        score,
        totalQuestions: currentExam.questions.length,
        passed,
        answers,
        completedAt: serverTimestamp()
      });

      // Generate tutorial suggestions for failed requirements
      if (!passed) {
        generateTutorialSuggestions();
      }
    } catch (error) {
      console.error('Error saving exam result:', error);
    }

    setExamCompleted(true);
    setExamStarted(false);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    currentExam.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const generateTutorialSuggestions = () => {
    const failedTopics = [];
    currentExam.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer !== question.correctAnswer && question.topic) {
        failedTopics.push(question.topic);
      }
    });

    const uniqueFailedTopics = [...new Set(failedTopics)];
    const suggestions = uniqueFailedTopics.map(topic => ({
      topic,
      tutorials: getTutorialsForTopic(topic)
    }));

    setTutorialSuggestions(suggestions);
  };

  const getTutorialsForTopic = (topic) => {
    const tutorialMap = {
      'React': [
        { title: 'React Fundamentals', url: 'https://react.dev/learn', platform: 'React Docs' },
        { title: 'React Hooks Tutorial', url: 'https://www.youtube.com/watch?v=dpw9EHDh2bM', platform: 'YouTube' },
        { title: 'React State Management', url: 'https://redux.js.org/tutorials/essentials/part-1-overview-concepts', platform: 'Redux Docs' }
      ],
      'Node.js': [
        { title: 'Node.js Crash Course', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', platform: 'YouTube' },
        { title: 'Express.js Tutorial', url: 'https://expressjs.com/en/starter/installing.html', platform: 'Express Docs' },
        { title: 'Node.js API Development', url: 'https://www.udemy.com/course/nodejs-api-masterclass/', platform: 'Udemy' }
      ],
      'Python': [
        { title: 'Python for Beginners', url: 'https://www.python.org/about/gettingstarted/', platform: 'Python Docs' },
        { title: 'Django Tutorial', url: 'https://docs.djangoproject.com/en/4.2/intro/tutorial01/', platform: 'Django Docs' },
        { title: 'Flask Web Development', url: 'https://flask.palletsprojects.com/en/2.3.x/quickstart/', platform: 'Flask Docs' }
      ],
      'JavaScript': [
        { title: 'JavaScript Fundamentals', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', platform: 'MDN' },
        { title: 'ES6+ Features', url: 'https://www.youtube.com/watch?v=WZQc7RUAg18', platform: 'YouTube' },
        { title: 'Async JavaScript', url: 'https://javascript.info/async', platform: 'JavaScript.info' }
      ],
      'Database': [
        { title: 'SQL Basics', url: 'https://www.w3schools.com/sql/', platform: 'W3Schools' },
        { title: 'MongoDB Tutorial', url: 'https://docs.mongodb.com/manual/tutorial/', platform: 'MongoDB Docs' },
        { title: 'PostgreSQL Guide', url: 'https://www.postgresql.org/docs/current/tutorial.html', platform: 'PostgreSQL Docs' }
      ]
    };

    return tutorialMap[topic] || [
      { title: 'General Programming', url: 'https://www.freecodecamp.org/', platform: 'freeCodeCamp' }
    ];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl font-bold">Loading exams...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access exams</h2>
          <p className="text-gray-600 dark:text-gray-400">Exams are only available for registered users</p>
        </div>
      </div>
    );
  }

  if (examStarted && currentExam) {
    const question = currentExam.questions[currentQuestion];
    
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Exam Header */}
          <div className={`p-6 rounded-xl shadow-lg mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">{currentExam.title}</h1>
              <div className="text-right">
                <div className="text-lg font-semibold text-red-600">Time: {formatTime(timeLeft)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Question {currentQuestion + 1} of {currentExam.questions.length}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / currentExam.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className={`p-6 rounded-xl shadow-lg mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <label key={index} className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswerSelect(question.id, option)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className={`px-6 py-2 rounded-lg font-semibold ${
                currentQuestion === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            
            {currentQuestion === currentExam.questions.length - 1 ? (
              <button
                onClick={handleSubmitExam}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (examCompleted && results) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Results */}
          <div className={`p-6 rounded-xl shadow-lg mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <h1 className="text-2xl font-bold mb-4">Exam Results</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{results.score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{results.percentage}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {results.passed ? 'PASSED' : 'FAILED'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
              </div>
            </div>
            
            {!results.passed && tutorialSuggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Recommended Tutorials</h3>
                <div className="space-y-4">
                  {tutorialSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        Improve your {suggestion.topic} skills:
                      </h4>
                      <div className="space-y-2">
                        {suggestion.tutorials.map((tutorial, tIndex) => (
                          <a
                            key={tIndex}
                            href={tutorial.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 bg-white dark:bg-gray-700 rounded border hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="font-medium">{tutorial.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{tutorial.platform}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => {
                setCurrentExam(null);
                setExamCompleted(false);
                setResults(null);
                setTutorialSuggestions([]);
              }}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Online Screening Exams</h1>
        
        {/* Available Exams */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Available Exams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableExams.map((exam) => {
              const userExam = userExams.find(ue => ue.examId === exam.id);
              return (
                <div key={exam.id} className={`p-6 rounded-xl shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{exam.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span>{exam.duration} minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Questions:</span>
                      <span>{exam.questions.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Passing Score:</span>
                      <span>{exam.passingScore}/{exam.questions.length}</span>
                    </div>
                  </div>

                  {userExam ? (
                    <div className="text-center">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        userExam.passed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userExam.passed ? 'PASSED' : 'FAILED'} - {userExam.score}/{userExam.totalQuestions}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startExam(exam)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Start Exam
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Exam History */}
        {userExams.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Exam History</h2>
            <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="text-left py-2">Exam</th>
                      <th className="text-left py-2">Score</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userExams.map((userExam) => (
                      <tr key={userExam.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="py-2">{userExam.examTitle}</td>
                        <td className="py-2">{userExam.score}/{userExam.totalQuestions}</td>
                        <td className="py-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            userExam.passed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {userExam.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="py-2 text-sm text-gray-600 dark:text-gray-400">
                          {userExam.completedAt?.toDate().toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Exams; 