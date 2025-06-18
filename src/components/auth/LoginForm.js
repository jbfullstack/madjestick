// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/LoginForm.css';

const LoginForm = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a small delay for better UX
    setTimeout(() => {
      const success = login(password);
      
      if (!success) {
        setError('Mot de passe incorrect');
        setPassword('');
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>🔐 Accès Administration</h2>
          <p>Entrez le mot de passe pour accéder à la Madjestitration</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Vérification...
              </>
            ) : (
              '🚪 Se connecter'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>💡 Accès réservé aux administrateurs</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;