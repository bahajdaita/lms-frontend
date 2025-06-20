import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Grade,
  Visibility,
  Download,
  Send,
  CheckCircle,
  Schedule,
  Assignment,
  AttachFile
} from '@mui/icons-material';
import { assignmentAPI, submissionAPI } from '../services/api';
import toast from 'react-hot-toast';

const SubmissionGrader = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: ''
  });
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentData();
    }
  }, [assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      
      // Fetch assignment details
      const assignmentRes = await assignmentAPI.getAssignmentById(assignmentId);
      setAssignment(assignmentRes.data.data || assignmentRes.data);
      
      // Fetch submissions for this assignment
      const submissionsRes = await submissionAPI.getAssignmentSubmissions(assignmentId);
      const submissionsData = submissionsRes.data.data || submissionsRes.data || [];
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
      
    } catch (error) {
      console.error('Error fetching assignment data:', error);
      toast.error('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    });
    setGradeDialogOpen(true);
  };

  const submitGrade = async () => {
    if (!gradeForm.grade) {
      toast.error('Grade is required');
      return;
    }

    const grade = parseFloat(gradeForm.grade);
    if (isNaN(grade) || grade < 0 || grade > assignment.max_points) {
      toast.error(`Grade must be between 0 and ${assignment.max_points}`);
      return;
    }

    try {
      setGrading(true);

      const gradeData = {
        grade: grade,
        feedback: gradeForm.feedback.trim() || null
      };

      await submissionAPI.gradeSubmission(selectedSubmission.id, gradeData);
      
      toast.success('Submission graded successfully! 🎉');
      setGradeDialogOpen(false);
      setSelectedSubmission(null);
      setGradeForm({ grade: '', feedback: '' });
      
      // Refresh submissions to show updated grades
      await fetchAssignmentData();
      
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  const getSubmissionStatus = (submission) => {
    if (submission.grade !== null) {
      return {
        label: `Graded: ${submission.grade}/${assignment.max_points}`,
        color: 'success',
        icon: <CheckCircle />
      };
    }
    
    if (submission.is_late) {
      return {
        label: 'Late Submission',
        color: 'warning',
        icon: <Schedule />
      };
    }
    
    return {
      label: 'Pending Review',
      color: 'info',
      icon: <Schedule />
    };
  };

  const getGradePercentage = (grade, maxPoints) => {
    return Math.round((grade / maxPoints) * 100);
  };

  const calculateStats = () => {
    const total = submissions.length;
    const graded = submissions.filter(s => s.grade !== null).length;
    const pending = total - graded;
    const avgGrade = graded > 0 
      ? submissions
          .filter(s => s.grade !== null)
          .reduce((sum, s) => sum + s.grade, 0) / graded
      : 0;

    return { total, graded, pending, avgGrade };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading submissions...</Typography>
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" color="error">Assignment not found</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  const stats = calculateStats();

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2, color: '#1865f2' }}
        >
          Back to Course Management
        </Button>
        
        <Typography variant="h3" fontWeight="bold" color="text.primary" mb={1}>
          📋 {assignment.title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Grade student submissions and provide feedback
        </Typography>
      </Box>

      {/* Assignment Info & Stats */}
      <Card sx={{ mb: 4, borderRadius: 4, border: '2px solid #e8f5e8' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justify="space-between" gap={4}>
            {/* Assignment Details */}
            <Box flex={2}>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Assignment Details
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>
                {assignment.description}
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip
                  icon={<Grade />}
                  label={`${assignment.max_points} Points`}
                  color="primary"
                  variant="outlined"
                />
                {assignment.due_date && (
                  <Chip
                    label={`Due: ${new Date(assignment.due_date).toLocaleDateString()}`}
                    color="info"
                    variant="outlined"
                  />
                )}
                {assignment.allow_late_submission && (
                  <Chip
                    label={`Late penalty: ${assignment.late_penalty_percent}%`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </Box>

            {/* Stats */}
            <Box flex={1}>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Submission Stats
              </Typography>
              <Box display="flex" gap={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold" color="#1865f2">
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold" color="#00a60e">
                    {stats.graded}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Graded
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold" color="#ff8c00">
                    {stats.pending}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
                {stats.graded > 0 && (
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                      {stats.avgGrade.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg Grade
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card sx={{ borderRadius: 4, border: '1px solid #e8f5e8' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Student Submissions ({submissions.length})
          </Typography>

          {submissions.length > 0 ? (
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>Submitted</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Grade</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => {
                    const status = getSubmissionStatus(submission);
                    return (
                      <TableRow key={submission.id} hover>
                        <TableCell>
                          <Typography variant="body1" fontWeight="600">
                            {submission.student_name || `Student ${submission.student_id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {submission.student_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(submission.submitted_at).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={status.icon}
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {submission.grade !== null ? (
                            <Box>
                              <Typography variant="body1" fontWeight="600">
                                {submission.grade}/{assignment.max_points}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getGradePercentage(submission.grade, assignment.max_points)}%
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not graded
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Submission">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  // You can implement a view submission dialog here
                                  toast.info('View submission feature - coming soon!');
                                }}
                                sx={{ color: '#1865f2' }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            {submission.file_path && (
                              <Tooltip title="Download File">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    // Implement file download
                                    toast.info('File download feature - coming soon!');
                                  }}
                                  sx={{ color: '#00a60e' }}
                                >
                                  <Download />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Grade Submission">
                              <IconButton
                                size="small"
                                onClick={() => handleGradeSubmission(submission)}
                                sx={{ color: '#ff8c00' }}
                              >
                                <Grade />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={6}>
              <Assignment sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={1}>
                No submissions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students haven't submitted their assignments yet.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Grade Submission Dialog */}
      <Dialog 
        open={gradeDialogOpen} 
        onClose={() => setGradeDialogOpen(false)}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4 }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            📝 Grade Submission
          </Typography>
          {selectedSubmission && (
            <Typography variant="body2" color="text.secondary">
              Student: {selectedSubmission.student_name || `Student ${selectedSubmission.student_id}`}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          {selectedSubmission && (
            <Box>
              {/* Submission Content */}
              <Typography variant="h6" fontWeight="600" mb={2}>
                Student Submission:
              </Typography>
              
              {selectedSubmission.content && (
                <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', borderRadius: 3 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedSubmission.content}
                  </Typography>
                </Paper>
              )}

              {selectedSubmission.file_path && (
                <Box mb={3}>
                  <Typography variant="subtitle2" fontWeight="600" mb={1}>
                    Uploaded File:
                  </Typography>
                  <Chip
                    icon={<AttachFile />}
                    label={selectedSubmission.file_path}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Grading Section */}
              <Typography variant="h6" fontWeight="600" mb={2}>
                Grade this submission:
              </Typography>

              <Box display="flex" gap={2} mb={3}>
                <TextField
                  label="Grade"
                  type="number"
                  value={gradeForm.grade}
                  onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
                  inputProps={{ min: 0, max: assignment.max_points, step: 0.5 }}
                  sx={{ width: 150 }}
                  helperText={`Out of ${assignment.max_points} points`}
                />
                
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Quick Grade:
                  </Typography>
                  <Box display="flex" gap={1}>
                    {[100, 90, 80, 70, 60, 50].map(percent => {
                      const points = Math.round((percent / 100) * assignment.max_points);
                      return (
                        <Button
                          key={percent}
                          size="small"
                          variant="outlined"
                          onClick={() => setGradeForm(prev => ({ ...prev, grade: points.toString() }))}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          {points}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Feedback (Optional)"
                placeholder="Provide feedback to help the student improve..."
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setGradeDialogOpen(false)} size="large">
            Cancel
          </Button>
          <Button 
            onClick={submitGrade}
            variant="contained"
            startIcon={<Send />}
            disabled={grading || !gradeForm.grade}
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #00a60e, #4caf50)',
              borderRadius: 3
            }}
          >
            {grading ? 'Saving...' : 'Submit Grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubmissionGrader;