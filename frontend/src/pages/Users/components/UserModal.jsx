import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const UserModal = ({ open, onClose, onSave, user }) => {
  const isEditing = !!user;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'garcom',
  });

  useEffect(() => {
    if (open) {
      if (isEditing) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'garcom',
          password: '', // Senha fica em branco por segurança
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'garcom',
        });
      }
    }
  }, [user, open, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Inclui o ID se estiver editando
    onSave({ ...formData, id: user?.id });
  };

  const userRoles = [
    { value: 'garcom', label: 'Garçom' },
    { value: 'caixa', label: 'Caixa' },
    { value: 'cozinha', label: 'Cozinha' },
    { value: 'auxiliar', label: 'Auxiliar' },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Nome Completo"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="email"
          label="Endereço de E-mail"
          type="email"
          fullWidth
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="password"
          label="Nova Senha"
          type="password"
          fullWidth
          variant="outlined"
          value={formData.password}
          onChange={handleChange}
          helperText={isEditing ? 'Deixe em branco para não alterar' : 'Senha provisória'}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel id="role-select-label">Função</InputLabel>
          <Select
            labelId="role-select-label"
            name="role"
            value={formData.role}
            label="Função"
            onChange={handleChange}
          >
            {userRoles.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;