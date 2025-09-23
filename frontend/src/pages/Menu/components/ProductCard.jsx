import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from '@mui/material';

// Uma imagem placeholder para produtos que não têm uma
const placeholderImage = 'https://via.placeholder.com/300x200.png?text=Sabor+Digital';

const ProductCard = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={product.image_url || placeholderImage}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          {formattedPrice}
        </Typography>
      </Box>
    </Card>
  );
};

export default ProductCard;