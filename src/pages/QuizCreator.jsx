import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  Close
} from '@mui/icons-material';
import { quizAPI } from '../services/api';
import toast from 'react-hot-toast';

// Add this debug check at component load
console.log('🐛 DEBUG: QuizCreator loaded, checking quizAPI import...');
console.log('🐛 DEBUG: quizAPI object:', quizAPI);
console.log('🐛 DEBUG: Available methods:', Object.keys(quizAPI));

const QuizCreator = ({ open, onClose, lessonId, onQuizCreated }) => {
  const [questions, setQuestions] = useState([{
    id: Date.now(),
    question: '',
    quiz_type: 'multiple_choice',
    options: ['', '', '', ''],
    answer: '',
    points: 1
  }]);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setQuestions([{
      id: Date.now(),
      question: '',
      quiz_type: 'multiple_choice',
      options: ['', '', '', ''],
      answer: '',
      points: 1
    }]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      quiz_type: 'multiple_choice',
      options: ['', '', '', ''],
      answer: '',
      points: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    
    // Reset answer when quiz type changes
    if (field === 'quiz_type') {
      updated[index].answer = '';
      if (value === 'multiple_choice') {
        updated[index].options = ['', '', '', ''];
      }
    }
    
    setQuestions(updated);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.push('');
    setQuestions(updated);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options.splice(optionIndex, 1);
      // Reset answer if it was the removed option
      if (updated[questionIndex].answer === updated[questionIndex].options[optionIndex]) {
        updated[questionIndex].answer = '';
      }
    }
    setQuestions(updated);
  };

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      // Check question length (backend requires 10-1000 characters)
      if (!q.question.trim() || q.question.trim().length < 10) {
        toast.error(`Question ${i + 1}: Question must be at least 10 characters long`);
        return false;
      }
      
      if (q.question.trim().length > 1000) {
        toast.error(`Question ${i + 1}: Question cannot exceed 1000 characters`);
        return false;
      }
      
      // Check answer length (backend requires 1-500 characters)
      if (!q.answer.trim() || q.answer.trim().length > 500) {
        toast.error(`Question ${i + 1}: Answer must be 1-500 characters`);
        return false;
      }
      
      // Check points (backend requires 1-100)
      if (q.points < 1 || q.points > 100) {
        toast.error(`Question ${i + 1}: Points must be between 1 and 100`);
        return false;
      }
      
      // Validate quiz type
      if (!['multiple_choice', 'true_false', 'text'].includes(q.quiz_type)) {
        toast.error(`Question ${i + 1}: Invalid quiz type`);
        return false;
      }
      
      if (q.quiz_type === 'multiple_choice') {
        const validOptions = q.options.filter(opt => opt && opt.trim());
        if (validOptions.length < 2) {
          toast.error(`Question ${i + 1}: At least 2 options required for multiple choice`);
          return false;
        }
        
        if (!validOptions.includes(q.answer.trim())) {
          toast.error(`Question ${i + 1}: Answer must match one of the options exactly`);
          return false;
        }
      }
      
      if (q.quiz_type === 'true_false' && !['true', 'false'].includes(q.answer.toLowerCase().trim())) {
        toast.error(`Question ${i + 1}: True/False answer must be exactly 'true' or 'false'`);
        return false;
      }
    }
    return true;
  };

  const saveQuiz = async () => {
    if (!validateQuestions()) return;

    try {
      setSaving(true);
      
      console.log('🐛 DEBUG: Starting quiz creation...');
      console.log('🐛 DEBUG: lessonId:', lessonId, 'type:', typeof lessonId);
      console.log('🐛 DEBUG: questions array:', questions);
      
      // Create each question individually
      for (const [index, question] of questions.entries()) {
        let quizData;
        
        if (question.quiz_type === 'multiple_choice') {
          // Special handling for multiple choice
          const validOptions = question.options.filter(opt => opt && opt.trim());
          console.log('🐛 DEBUG: Multiple choice - validOptions:', validOptions);
          console.log('🐛 DEBUG: Backend expects Array.isArray(options) = true');
          console.log('🐛 DEBUG: Sending options as array (not JSON string):', validOptions);
          
          if (validOptions.length < 2) {
            throw new Error(`Question ${index + 1}: Need at least 2 options for multiple choice`);
          }

          quizData = {
            lesson_id: parseInt(lessonId),
            question: question.question.trim(),
            answer: question.answer.trim(),
            quiz_type: 'multiple_choice',
            options: validOptions, // Send as array, NOT JSON string
            points: parseInt(question.points) || 1
          };
          
        } else {
          // For true_false and text questions
          quizData = {
            lesson_id: parseInt(lessonId),
            question: question.question.trim(),
            answer: question.answer.trim(),
            quiz_type: question.quiz_type,
            options: null, // Explicitly null for non-multiple choice
            points: parseInt(question.points) || 1
          };
        }
        
        console.log(`🐛 DEBUG: Question ${index + 1} final data:`, quizData);
        console.log('🐛 DEBUG: Options value:', quizData.options);
        console.log('🐛 DEBUG: Options type:', typeof quizData.options);
        console.log('🐛 DEBUG: Is options an array?', Array.isArray(quizData.options));
        console.log('🐛 DEBUG: Request payload that will be sent:', JSON.stringify(quizData, null, 2));
        
        // Check if the function exists before calling
        if (typeof quizAPI.createQuiz !== 'function') {
          console.error('🚨 ERROR: quizAPI.createQuiz is not a function!');
          console.log('🐛 DEBUG: Available quizAPI methods:', Object.keys(quizAPI));
          throw new Error('quizAPI.createQuiz is not defined');
        }
        
        console.log('🐛 DEBUG: Making API call now...');
        const response = await quizAPI.createQuiz(quizData);
        console.log('🐛 DEBUG: API response:', response);
      }
      
      toast.success(`${questions.length} quiz question(s) created successfully! 🎉`);
      onQuizCreated?.();
      handleClose();
      
    } catch (error) {
      console.error('🚨 Error creating quiz:', error);
      console.error('🚨 Error response:', error.response?.data);
      console.error('🚨 Error status:', error.response?.status);
      console.error('🚨 Full error object:', error);
      
      // Show specific error message from backend
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          'Failed to create quiz';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4 }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            📝 Create Quiz for Lesson
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 0 }}>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
          Create quiz questions for this lesson. Students will see these when they click the Quiz tab.
        </Alert>

        {questions.map((question, questionIndex) => (
          <Card key={question.id} sx={{ mb: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  Question {questionIndex + 1}
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <Chip 
                    label={`${question.points} point${question.points !== 1 ? 's' : ''}`} 
                    size="small" 
                    color="primary" 
                  />
                  {questions.length > 1 && (
                    <IconButton 
                      onClick={() => removeQuestion(questionIndex)}
                      color="error"
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Question Text */}
              <TextField
                fullWidth
                label="Question"
                placeholder="Enter your question here (minimum 10 characters)..."
                value={question.question}
                onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                multiline
                rows={2}
                sx={{ mb: 2 }}
                helperText={`${question.question.length}/1000 characters`}
              />

              <Box display="flex" gap={2} mb={2}>
                {/* Question Type */}
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={question.quiz_type}
                    label="Question Type"
                    onChange={(e) => updateQuestion(questionIndex, 'quiz_type', e.target.value)}
                  >
                    <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                    <MenuItem value="true_false">True/False</MenuItem>
                    <MenuItem value="text">Text Answer</MenuItem>
                  </Select>
                </FormControl>

                {/* Points */}
                <TextField
                  label="Points"
                  type="number"
                  value={question.points}
                  onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                  sx={{ width: 100 }}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Box>

              {/* Multiple Choice Options */}
              {question.quiz_type === 'multiple_choice' && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" mb={2} color="primary">
                    ⚠️ Answer Options: (Fill in at least 2 options)
                  </Typography>
                  {question.options.map((option, optionIndex) => (
                    <Box key={optionIndex} display="flex" gap={1} mb={1}>
                      <TextField
                        fullWidth
                        label={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                        size="small"
                        placeholder={`Enter option ${optionIndex + 1}...`}
                        required={optionIndex < 2}
                      />
                      {question.options.length > 2 && (
                        <IconButton 
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <Button
                    startIcon={<Add />}
                    onClick={() => addOption(questionIndex)}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Option
                  </Button>
                  
                  {/* Show current valid options count */}
                  <Box mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      Valid options: {question.options.filter(opt => opt && opt.trim()).length}/4 minimum
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* True/False Info */}
              {question.quiz_type === 'true_false' && (
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  Students will see True/False options automatically.
                </Alert>
              )}

              {/* Answer */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight="600" mb={1}>
                Correct Answer:
              </Typography>
              
              {question.quiz_type === 'multiple_choice' && (
                <FormControl fullWidth>
                  <InputLabel>Select Correct Answer</InputLabel>
                  <Select
                    value={question.answer}
                    label="Select Correct Answer"
                    onChange={(e) => updateQuestion(questionIndex, 'answer', e.target.value)}
                  >
                    {question.options.filter(opt => opt && opt.trim()).map((option, index) => (
                      <MenuItem key={index} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {question.quiz_type === 'true_false' && (
                <FormControl fullWidth>
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={question.answer}
                    label="Correct Answer"
                    onChange={(e) => updateQuestion(questionIndex, 'answer', e.target.value)}
                  >
                    <MenuItem value="true">True</MenuItem>
                    <MenuItem value="false">False</MenuItem>
                  </Select>
                </FormControl>
              )}

              {question.quiz_type === 'text' && (
                <TextField
                  fullWidth
                  label="Model Answer"
                  placeholder="Enter the expected answer or key points (max 500 characters)..."
                  value={question.answer}
                  onChange={(e) => updateQuestion(questionIndex, 'answer', e.target.value)}
                  multiline
                  rows={2}
                  helperText={`${question.answer.length}/500 characters`}
                />
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          startIcon={<Add />}
          onClick={addQuestion}
          variant="outlined"
          size="large"
          fullWidth
          sx={{
            borderRadius: 3,
            borderStyle: 'dashed',
            py: 2,
            mb: 3
          }}
        >
          Add Another Question
        </Button>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} size="large">
          Cancel
        </Button>
        <Button 
          onClick={saveQuiz}
          variant="contained"
          startIcon={<Save />}
          disabled={saving || questions.some(q => {
            const questionValid = q.question.trim() && q.question.trim().length >= 10;
            const answerValid = q.answer.trim();
            const optionsValid = q.quiz_type !== 'multiple_choice' || 
                                q.options.filter(opt => opt && opt.trim()).length >= 2;
            
            console.log('🐛 DEBUG: Button validation check:', {
              questionIndex: questions.indexOf(q),
              question: q.question,
              questionLength: q.question.trim().length,
              questionValid,
              answer: q.answer,
              answerValid,
              quizType: q.quiz_type,
              options: q.options,
              validOptions: q.options.filter(opt => opt && opt.trim()),
              optionsValid,
              overall: !questionValid || !answerValid || !optionsValid
            });
            
            return !questionValid || !answerValid || !optionsValid;
          })}
          size="large"
          sx={{
            background: 'linear-gradient(45deg, #00a60e, #4caf50)',
            borderRadius: 3,
            px: 4
          }}
        >
          {saving ? 'Creating...' : `Create ${questions.length} Question${questions.length > 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizCreator;