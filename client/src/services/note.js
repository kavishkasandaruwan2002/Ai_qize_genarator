import API from './api';

export const uploadNote = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await API.post('/notes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  });
  return response.data;
};

export const getNotes = async () => {
  const response = await API.get('/notes');
  return response.data;
};

export const getNoteById = async (id) => {
  const response = await API.get(`/notes/${id}`);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await API.delete(`/notes/${id}`);
  return response.data;
};

export const toggleFavorite = async (id) => {
  const response = await API.patch(`/notes/${id}/favorite`);
  return response.data;
};

export const addQuizAttempt = async (id, score, totalQuestions) => {
  const response = await API.post(`/notes/${id}/quiz-attempt`, { score, totalQuestions });
  return response.data;
};

export const generateNoteQuizzes = async (id) => {
  const response = await API.post(`/notes/${id}/generate-quizzes`);
  return response.data;
};

