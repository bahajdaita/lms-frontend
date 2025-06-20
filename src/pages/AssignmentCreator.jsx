import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import {
  Save,
  Close,
  Assignment,
  CalendarToday,
  Grade
} from '@mui/icons-material';
import { assignmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const AssignmentCreator = ({ open, onClose, lessonId, onAssignmentCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    max_points: 100,
    allow_late_submission: true,
    late_penalty_percent: 10
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      max_points: 100,
      allow_late_submission: true,
      late_penalty_percent: 10
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    // Check title length (backend requires 3-200 characters)
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      toast.error('Assignment title must be at least 3 characters long');
      return false;
    }

    if (formData.title.trim().length > 200) {
      toast.error('Assignment title cannot exceed 200 characters');
      return false;
    }

    // Check description length (backend allows max 2000 characters)
    if (!formData.description.trim()) {
      toast.error('Assignment description is required');
      return false;
    }

    if (formData.description.trim().length > 2000) {
      toast.error('Description cannot exceed 2000 characters');
      return false;
    }

    // Check points (backend requires 1-1000)
    if (formData.max_points < 1 || formData.max_points > 1000) {
      toast.error('Maximum points must be between 1 and 1000');
      return false;
    }

    // Check late penalty (backend requires 0-100%)
    if (formData.allow_late_submission && (formData.late_penalty_percent < 0 || formData.late_penalty_percent > 100)) {
      toast.error('Late penalty must be between 0 and 100 percent');
      return false;
    }

    return true;
  };

  const saveAssignment = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const assignmentData = {
        lesson_id: parseInt(lessonId), // Ensure it's an integer
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: formData.due_date || null,
        max_points: parseInt(formData.max_points), // Ensure it's an integer
        allow_late_submission: formData.allow_late_submission,
        late_penalty_percent: formData.allow_late_submission ? parseInt(formData.late_penalty_percent) : 0
      };
      
      console.log('Sending assignment data:', assignmentData); // Debug log
      
      await assignmentAPI.createAssignment(assignmentData);
      
      toast.success('Assignment created successfully! 🎉');
      onAssignmentCreated?.();
      handleClose();
      
    } catch (error) {
      console.error('Error creating assignment:', error);
      console.error('Error response:', error.response?.data); // More detailed error
      
      // Show specific error message from backend
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create assignment';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

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
          <Box display="flex" alignItems="center" gap={2}>
            <Assignment sx={{ color: '#1865f2', fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Create Assignment for Lesson
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 0 }}>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
          Create an assignment for this lesson. Students will be able to submit text answers and upload files.
        </Alert>

        {/* Assignment Title */}
        <TextField
          fullWidth
          label="Assignment Title"
          placeholder="e.g., React Components Practice Exercise"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          margin="normal"
          required
          sx={{ mb: 2 }}
          helperText={`${formData.title.length}/200 characters`}
        />

        {/* Assignment Description */}
        <TextField
          fullWidth
          multiline
          rows={6}
          label="Assignment Description & Instructions"
          placeholder="Provide detailed instructions for the assignment. What should students create or submit? Include any requirements, guidelines, or resources they need..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          margin="normal"
          required
          sx={{ mb: 3 }}
          helperText={`${formData.description.length}/2000 characters`}
        />

        {/* Assignment Settings Row 1 */}
        <Box display="flex" gap={2} mb={3}>
          {/* Due Date */}
          <TextField
            label="Due Date (Optional)"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange('due_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: <CalendarToday sx={{ color: '#1865f2', mr: 1 }} />
            }}
          />

          {/* Max Points */}
          <TextField
            label="Maximum Points"
            type="number"
            value={formData.max_points}
            onChange={(e) => handleChange('max_points', parseInt(e.target.value) || 100)}
            inputProps={{ min: 1, max: 1000 }}
            sx={{ width: 150 }}
            InputProps={{
              startAdornment: <Grade sx={{ color: '#00a60e', mr: 1 }} />
            }}
          />
        </Box>

        {/* Late Submission Settings */}
        <Box 
          sx={{ 
            p: 3, 
            border: '1px solid #e0e0e0', 
            borderRadius: 3, 
            backgroundColor: '#f8f9fa',
            mb: 2
          }}
        >
          <Typography variant="h6" fontWeight="600" mb={2}>
            Late Submission Policy
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={formData.allow_late_submission}
                onChange={(e) => handleChange('allow_late_submission', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight="600">
                  Allow Late Submissions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Students can submit after the due date with a penalty
                </Typography>
              </Box>
            }
          />

          {formData.allow_late_submission && (
            <Box mt={2}>
              <TextField
                label="Late Penalty Percentage"
                type="number"
                value={formData.late_penalty_percent}
                onChange={(e) => handleChange('late_penalty_percent', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 100 }}
                sx={{ width: 200 }}
                helperText="Percentage deducted from final grade for late submissions"
              />
            </Box>
          )}
        </Box>

        {/* Assignment Preview */}
        <Box 
          sx={{ 
            p: 3, 
            border: '2px dashed #e0e0e0', 
            borderRadius: 3, 
            backgroundColor: '#fafafa' 
          }}
        >
          <Typography variant="h6" fontWeight="600" mb={2}>
            📋 Assignment Preview
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <Chip
              icon={<Grade />}
              label={`${formData.max_points} Points`}
              color="primary"
              variant="outlined"
            />
            
            {formData.due_date && (
              <Chip
                icon={<CalendarToday />}
                label={`Due: ${new Date(formData.due_date).toLocaleDateString()}`}
                color="info"
                variant="outlined"
              />
            )}
            
            {formData.allow_late_submission && (
              <Chip
                label={`Late penalty: ${formData.late_penalty_percent}%`}
                color="warning"
                variant="outlined"
                size="small"
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary">
            Students will be able to submit both text answers and file uploads for this assignment.
            {formData.due_date && ` Assignment is due on ${new Date(formData.due_date).toLocaleDateString()}.`}
            {formData.allow_late_submission && ` Late submissions will receive a ${formData.late_penalty_percent}% penalty.`}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={handleClose} size="large">
          Cancel
        </Button>
        <Button 
          onClick={saveAssignment}
          variant="contained"
          startIcon={<Save />}
          disabled={saving || !formData.title.trim() || !formData.description.trim() || formData.title.trim().length < 3}
          size="large"
          sx={{
            background: 'linear-gradient(45deg, #1865f2, #42a5f5)',
            borderRadius: 3,
            px: 4
          }}
        >
          {saving ? 'Creating...' : 'Create Assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentCreator;