import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // <-- Ajout
import App from './App.jsx'
import './index.css'

// Création de la racine
const root = createRoot(document.getElementById('root'))

// Création du QueryClient
const queryClient = new QueryClient()

// Rendu de l'application avec QueryClientProvider
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
