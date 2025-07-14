import { useState } from 'react';
import { registerApi } from '@/apis/auth/registerApis';

interface DriverRegisterFormData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export function useDriverRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const registerDriver = async (formData: DriverRegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Map form fields to API fields and add type: 'DRIVER'
      const payload = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        type: 'DRIVER',
      };
      const result = await registerApi(payload);
      
      if (result.success || result.status === 'success') {
        setRegisteredEmail(formData.email);
        setShowVerificationModal(true);
      }
      return result; 
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    setRegisteredEmail('');
    // You can add navigation logic here if needed
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setRegisteredEmail('');
  };

  return { 
    registerDriver, 
    isLoading, 
    error,
    showVerificationModal,
    registeredEmail,
    handleVerificationSuccess,
    closeVerificationModal
  };
}
