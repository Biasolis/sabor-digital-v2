import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';

const CategoryList = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <>
      <List>
        {/* Item para mostrar todos os produtos */}
        <ListItem disablePadding>
          <ListItemButton
            selected={!selectedCategory}
            onClick={() => onSelectCategory(null)}
          >
            <ListItemText primary="Todas as Categorias" />
          </ListItemButton>
        </ListItem>

        {/* Mapeia e exibe cada categoria */}
        {categories.map((category) => (
          <ListItem key={category.id} disablePadding>
            <ListItemButton
              selected={selectedCategory === category.id}
              onClick={() => onSelectCategory(category.id)}
            >
              <ListItemText primary={category.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {categories.length === 0 && (
         <Typography sx={{ p: 2, color: 'text.secondary' }}>
            Nenhuma categoria encontrada.
        </Typography>
      )}
    </>
  );
};

export default CategoryList;