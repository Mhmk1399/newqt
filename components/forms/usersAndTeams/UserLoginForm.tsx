'use client';

import React from 'react';
import DynamicForm from '../DynamicForm';
import { FormConfig } from '@/types/form';

interface UserLoginFormProps {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
}

const UserLoginForm: React.FC<UserLoginFormProps> = ({ onSuccess, onError }) => {
  const handleLoginSuccess = (data: {
    data: {
      success: boolean;
      token: string;
      user: {
        _id: string;
        name: string;
        email: string;
      };
    };
  }) => {
    console.log('Login successful:', data);
    
    // Store the token in localStorage
    if (data.data && data.data.token) {
      localStorage.setItem('userToken', data.data.token);
      console.log('Token stored successfully');
    }
    
    if (onSuccess) {
      onSuccess(data.data.user.name);
    }
  };

  const handleLoginError = (error: string) => {
    console.error('Login failed:', error);
    if (onError) {
      onError(error);
    }
  };

  const userLoginFormConfig: FormConfig = {
    title: 'User Login',
    description: 'Sign in to your account',
    endpoint: '/api/users/login',
    method: 'POST',
    submitButtonText: 'Sign In',
    onSuccess: handleLoginSuccess,
    onError: handleLoginError,
    fields: [
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter your email address',
        required: true,
        validation: {
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        },
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
        required: true,
        validation: {
          minLength: 8,
        },
      },
    ],
  };

  return <DynamicForm config={userLoginFormConfig} />;
};

export default UserLoginForm;
