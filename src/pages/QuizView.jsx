import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  LinearProgress,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Quiz,
  CheckCircle,
  Timer,
  NavigateNext,
  NavigateBefore,
  Send
} from '@mui/icons-material';
import { quizAPI } from '../services/api';
import toast from 'react-hot-toast';

const QuizView = ({ lessonId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    console.log('QuizView: lessonId changed:', lessonId);
    fetchQuizzes();
  }, [lessonId]);

  useEffect(() => {
    if (timeLeft && timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, submitted]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      console.log('QuizView: Fetching quizzes for lesson:', lessonId);
      
      // Always use mock data for now to test the UI
      const mockQuizzes = [
        {
          id: 1,
          question: "What is React?",
          quiz_type: "multiple_choice",
          options: '["A JavaScript library", "A programming language", "A database", "An operating system"]',
          answer: "A JavaScript library",
          points: 1
        },
        {
          id: 2,
          question: "React components can have state.",
          quiz_type: "true_false",
          answer: "true",
          points: 1
        },
        {
          id: 3,
          question: "Explain what JSX is in your own words.",
          quiz_type: "text",
          answer: "JSX is a syntax extension for JavaScript",
          points: 2
        }
      ];
      
      console.log('QuizView: Setting mock quizzes:', mockQuizzes);
      setQuizzes(mockQuizzes);
      setTimeLeft(30 * 60); // 30 minutes
      
      // Try real API call but don't let it break the UI
      try {
        const response = await quizAPI.getLessonQuizzes(lessonId);
        console.log('QuizView: API response:', response);
        
        if (response.data.success && response.data.data.length > 0) {
          console.log('QuizView: Using real quiz data');
          setQuizzes(response.data.data);
        }
      } catch (apiError) {
        console.log('QuizView: API failed, using mock data:', apiError.message);
      }
      
    } catch (error) {
      console.error('QuizView: Error in fetchQuizzes:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (quizId, answer) => {
    console.log('QuizView: Answer changed:', quizId, answer);
    setAnswers(prev => ({
      ...prev,
      [quizId]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    let total = quizzes.length;

    quizzes.forEach(quiz => {
      const userAnswer = answers[quiz.id];
      if (userAnswer && userAnswer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
        correct++;
      }
    });

    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  };

  const handleSubmitQuiz = async () => {
    try {
      const score = calculateScore();
      setResults(score);
      setSubmitted(true);

      console.log('QuizView: Quiz submitted with score:', score);
      toast.success(`Quiz completed! Score: ${score.percentage}%`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  console.log('QuizView: Current state:', {
    loading,
    quizzesLength: quizzes.length,
    currentQuizIndex,
    currentQuiz: quizzes[currentQuizIndex],
    submitted,
    results
  });

  const currentQuiz = quizzes[currentQuizIndex];
  const progress = quizzes.length > 0 ? ((currentQuizIndex + 1) / quizzes.length) * 100 : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading quiz...</Typography>
      </Box>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card sx={{ borderRadius: 4, border: '2px dashed #e0e0e0' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Quiz sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No quiz available for this lesson
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Debug: lessonId = {lessonId}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (submitted && results) {
    return (
      <Card sx={{ borderRadius: 4, border: '2px solid #e8f5e8' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: '#00a60e', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Quiz Completed! 🎉
          </Typography>
          
          <Box mb={4}>
            <Typography variant="h2" fontWeight="bold" color="primary" mb={1}>
              {results.percentage}%
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={2}>
              {results.correct} out of {results.total} correct
            </Typography>
            
            <Chip
              label={results.percentage >= 80 ? 'Excellent!' : results.percentage >= 60 ? 'Good Job!' : 'Keep Learning!'}
              color={results.percentage >= 80 ? 'success' : results.percentage >= 60 ? 'primary' : 'warning'}
              size="large"
              sx={{ fontSize: '1rem', px: 2, py: 1 }}
            />
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={() => window.location.reload()}
            sx={{
              background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              mr: 2
            }}
          >
            Retake Quiz
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 3, px: 4, py: 1.5 }}
          >
            Back to Lesson
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuiz) {
    return (
      <Card sx={{ borderRadius: 4, border: '2px solid #ffeb3b' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Debug: No current quiz found
          </Typography>
          <Typography variant="body2">
            Total quizzes: {quizzes.length}<br/>
            Current index: {currentQuizIndex}<br/>
            LessonId: {lessonId}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Quiz Header */}
      <Card sx={{ borderRadius: 4, border: '2px solid #e8f5e8', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              📝 Lesson Quiz
            </Typography>
            {timeLeft && (
              <Chip
                icon={<Timer />}
                label={formatTime(timeLeft)}
                color={timeLeft < 300 ? 'error' : 'primary'}
                sx={{ fontSize: '1rem', px: 2 }}
              />
            )}
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#f0f0f0',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                borderRadius: 4
              }
            }}
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Question {currentQuizIndex + 1} of {quizzes.length}
          </Typography>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card sx={{ borderRadius: 4, border: '1px solid #e0e0e0', mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="600" mb={3}>
            {currentQuizIndex + 1}. {currentQuiz.question}
          </Typography>

          {/* Multiple Choice */}
          {currentQuiz.quiz_type === 'multiple_choice' && currentQuiz.options && (
            <RadioGroup
              value={answers[currentQuiz.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuiz.id, e.target.value)}
            >
              {JSON.parse(currentQuiz.options).map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                  sx={{
                    mb: 1,
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    margin: '8px 0',
                    '&:hover': {
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          )}

          {/* True/False */}
          {currentQuiz.quiz_type === 'true_false' && (
            <RadioGroup
              value={answers[currentQuiz.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuiz.id, e.target.value)}
            >
              <FormControlLabel
                value="true"
                control={<Radio />}
                label="True"
                sx={{
                  mb: 1,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  margin: '8px 0'
                }}
              />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="False"
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  margin: '8px 0'
                }}
              />
            </RadioGroup>
          )}

          {/* Text Input */}
          {currentQuiz.quiz_type === 'text' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter your answer here..."
              value={answers[currentQuiz.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuiz.id, e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Points: {currentQuiz.points || 1}
          </Typography>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          disabled={currentQuizIndex === 0}
          onClick={() => setCurrentQuizIndex(currentQuizIndex - 1)}
          sx={{ borderRadius: 3, px: 3, py: 1.5 }}
        >
          Previous
        </Button>

        <Box>
          {currentQuizIndex === quizzes.length - 1 ? (
            <Button
              variant="contained"
              endIcon={<Send />}
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length !== quizzes.length}
              sx={{
                background: 'linear-gradient(45deg, #00a60e, #4caf50)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 'bold'
              }}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<NavigateNext />}
              onClick={() => setCurrentQuizIndex(currentQuizIndex + 1)}
              sx={{
                background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
                borderRadius: 3,
                px: 3,
                py: 1.5
              }}
            >
              Next Question
            </Button>
          )}
        </Box>
      </Box>

      {/* Progress Alert */}
      {Object.keys(answers).length < quizzes.length && (
        <Alert severity="info" sx={{ mt: 3, borderRadius: 3 }}>
          Answer all questions before submitting. 
          ({Object.keys(answers).length} of {quizzes.length} answered)
        </Alert>
      )}
    </Box>
  );
};

export default QuizView;