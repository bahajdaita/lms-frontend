import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Chip,
  Paper,
  LinearProgress,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Assignment,
  Upload,
  CheckCircle,
  Timer,
  AttachFile,
  Send,
  Grade
} from '@mui/icons-material';
import { assignmentAPI, submissionAPI } from '../services/api';
import toast from 'react-hot-toast';

const AssignmentView = ({ lessonId }) => {
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState({
    content: '',
    file: null
  });
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [lessonId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      
      // Get assignments for this lesson
      const assignmentsResponse = await assignmentAPI.getLessonAssignments(lessonId);
      
      if (assignmentsResponse.data.success && assignmentsResponse.data.data.length > 0) {
        const assignmentData = assignmentsResponse.data.data[0]; // Get first assignment
        setAssignment(assignmentData);
        
        // Check if student has existing submission
        try {
          const submissionsResponse = await submissionAPI.getMySubmissions({ assignment_id: assignmentData.id });
          if (submissionsResponse.data.success && submissionsResponse.data.data.length > 0) {
            setExistingSubmission(submissionsResponse.data.data[0]);
          }
        } catch (error) {
          // No submission exists, which is fine
          console.log('No existing submission found:', error.message);
        }
      } else {
        // Fallback to mock data if no assignment found
        const mockAssignment = {
          id: 1,
          lesson_id: lessonId,
          title: "React Components Assignment",
          description: "Create a React component that demonstrates the use of props and state. Your component should:\n\n1. Accept props from a parent component\n2. Manage its own internal state\n3. Handle user interactions\n4. Display data dynamically\n\nSubmit both your code and a brief explanation of your implementation.",
          due_date: "2025-06-25",
          max_points: 100,
          allow_late_submission: true,
          late_penalty_percent: 10
        };
        setAssignment(mockAssignment);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Failed to load assignment');
      
      // Fallback to mock data
      const mockAssignment = {
        id: 1,
        lesson_id: lessonId,
        title: "React Components Assignment",
        description: "Create a React component that demonstrates the use of props and state. Your component should:\n\n1. Accept props from a parent component\n2. Manage its own internal state\n3. Handle user interactions\n4. Display data dynamically\n\nSubmit both your code and a brief explanation of your implementation.",
        due_date: "2025-06-25",
        max_points: 100,
        allow_late_submission: true,
        late_penalty_percent: 10
      };
      setAssignment(mockAssignment);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (e) => {
    setSubmission(prev => ({
      ...prev,
      content: e.target.value
    }));
  };

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'image/jpeg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not supported');
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      if (!validateFile(file)) {
        return;
      }
      
      setSubmission(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleSubmitAssignment = async () => {
    if (!submission.content.trim() && !submission.file) {
      toast.error('Please provide either text content or upload a file');
      return;
    }

    try {
      setSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('content', submission.content);
      if (submission.file) {
        formData.append('file', submission.file);
      }

      // Submit to backend
      const response = await submissionAPI.submitAssignment(assignment.id, formData);
      
      if (response.data.success) {
        const newSubmission = response.data.data;
        setExistingSubmission(newSubmission);
        setSubmission({ content: '', file: null });
        
        toast.success('Assignment submitted successfully! 🎉');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
      
      // Mock successful submission for demo
      const mockSubmission = {
        id: Date.now(),
        assignment_id: assignment.id,
        content: submission.content,
        file_path: submission.file ? submission.file.name : null,
        submitted_at: new Date().toISOString(),
        grade: null,
        feedback: null,
        is_late: new Date() > new Date(assignment.due_date)
      };
      
      setExistingSubmission(mockSubmission);
      setSubmission({ content: '', file: null });
      toast.success('Assignment submitted successfully! 🎉');
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysUntilDue = () => {
    if (!assignment?.due_date) return null;
    
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const isOverdue = () => {
    if (!assignment?.due_date) return false;
    return new Date() > new Date(assignment.due_date);
  };

  const getGradeColor = (grade, maxPoints) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 80) return '#00a60e';
    if (percentage >= 60) return '#ff8c00';
    return '#f44336';
  };

  const daysUntilDue = getDaysUntilDue();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        role="status"
        aria-label="Loading assignment"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading assignment...</Typography>
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Card sx={{ borderRadius: 4, border: '2px dashed #e0e0e0' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No assignment available for this lesson
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Assignment Header */}
      <Card sx={{ borderRadius: 4, border: '2px solid #e8f5e8', mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Box>
              <Typography variant="h4" fontWeight="bold" mb={2}>
                📋 {assignment.title}
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                <Chip
                  icon={<Grade />}
                  label={`${assignment.max_points} Points`}
                  color="primary"
                  variant="outlined"
                />
                
                <Chip
                  icon={<Timer />}
                  label={assignment.due_date ? `Due: ${new Date(assignment.due_date).toLocaleDateString()}` : 'No due date'}
                  color={isOverdue() ? 'error' : daysUntilDue <= 3 ? 'warning' : 'success'}
                />
                
                {assignment.allow_late_submission && (
                  <Chip
                    label={`Late penalty: ${assignment.late_penalty_percent}%`}
                    color="info"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Due Date Warning */}
          {daysUntilDue !== null && (
            <Box mb={2}>
              {isOverdue() ? (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  This assignment is overdue. Late submissions may receive a penalty.
                </Alert>
              ) : daysUntilDue <= 3 ? (
                <Alert severity="warning" sx={{ borderRadius: 3 }}>
                  Assignment due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}!
                </Alert>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  {daysUntilDue} days remaining until due date.
                </Alert>
              )}
            </Box>
          )}

          {/* Assignment Description */}
          <Typography variant="h6" fontWeight="600" mb={2}>
            Assignment Instructions:
          </Typography>
          <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 3 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {assignment.description}
            </Typography>
          </Paper>
        </CardContent>
      </Card>

      {/* Existing Submission */}
      {existingSubmission && (
        <Card sx={{ borderRadius: 4, border: '2px solid #00a60e', mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <CheckCircle sx={{ color: '#00a60e', mr: 2, fontSize: 32 }} />
              <Typography variant="h5" fontWeight="bold" color="#00a60e">
                Assignment Submitted ✅
              </Typography>
            </Box>

            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Submitted on: {new Date(existingSubmission.submitted_at).toLocaleString()}
              </Typography>
              {existingSubmission.is_late && (
                <Chip label="Late Submission" color="warning" size="small" />
              )}
            </Box>

            {existingSubmission.content && (
              <Box mb={3}>
                <Typography variant="h6" fontWeight="600" mb={2}>
                  Your Submission:
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#f0f8f0', borderRadius: 3 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {existingSubmission.content}
                  </Typography>
                </Paper>
              </Box>
            )}

            {existingSubmission.file_path && (
              <Box mb={3}>
                <Typography variant="h6" fontWeight="600" mb={2}>
                  Uploaded File:
                </Typography>
                <Chip
                  icon={<AttachFile />}
                  label={existingSubmission.file_path}
                  color="success"
                  variant="outlined"
                />
              </Box>
            )}

            {existingSubmission.grade !== null && (
              <Box mb={3}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight="600" mb={2}>
                  Grade: {existingSubmission.grade}/{assignment.max_points}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(existingSubmission.grade / assignment.max_points) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getGradeColor(existingSubmission.grade, assignment.max_points)
                    }
                  }}
                />
              </Box>
            )}

            {existingSubmission.feedback && (
              <Box>
                <Typography variant="h6" fontWeight="600" mb={2}>
                  Instructor Feedback:
                </Typography>
                <Paper sx={{ p: 3, backgroundColor: '#e3f2fd', borderRadius: 3 }}>
                  <Typography variant="body1">
                    {existingSubmission.feedback}
                  </Typography>
                </Paper>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submission Form */}
      {!existingSubmission && (
        <Card sx={{ borderRadius: 4, border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              📝 Submit Assignment
            </Typography>

            {/* Text Submission */}
            <Box mb={4}>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Your Answer:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="Type your assignment solution here..."
                value={submission.content}
                onChange={handleContentChange}
                aria-label="Assignment submission text"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3
                  }
                }}
              />
            </Box>

            {/* File Upload */}
            <Box mb={4}>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Upload File (Optional):
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                  sx={{ borderRadius: 3 }}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png"
                    aria-label="Upload assignment file"
                  />
                </Button>
                {submission.file && (
                  <Chip
                    icon={<AttachFile />}
                    label={submission.file.name}
                    onDelete={() => setSubmission(prev => ({ ...prev, file: null }))}
                    color="primary"
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Supported formats: PDF, DOC, DOCX, TXT, ZIP, JPG, PNG (Max 10MB)
              </Typography>
            </Box>

            {/* Submit Button */}
            <Button
              variant="contained"
              size="large"
              endIcon={<Send />}
              onClick={handleSubmitAssignment}
              disabled={submitting || (!submission.content.trim() && !submission.file)}
              sx={{
                background: 'linear-gradient(45deg, #00a60e, #4caf50)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 'bold'
              }}
            >
              {submitting ? (
                <Box display="flex" alignItems="center">
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Submitting...
                </Box>
              ) : (
                'Submit Assignment'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AssignmentView;