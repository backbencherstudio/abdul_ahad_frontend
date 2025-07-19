import { useState } from 'react';
import { registerApi } from '@/apis/auth/registerApis';

interface GarageRegisterFormData {
  nameOfGarage: string;
  vtsNumber: string;
  primaryContactPerson: string;
  email: string;
  contactNumber: string;
  password: string;
}

export function useGarageRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const registerGarage = async (formData: GarageRegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Map form fields to API fields and add type: 'GARAGE'
      const payload = {
        garage_name: formData.nameOfGarage,
        vts_number: formData.vtsNumber,
        primary_contact: formData.primaryContactPerson,
        email: formData.email,
        phone_number: formData.contactNumber,
        password: formData.password,
        type: 'GARAGE',
        name: formData.primaryContactPerson,
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
    registerGarage, 
    isLoading, 
    error,
    showVerificationModal,
    registeredEmail,
    handleVerificationSuccess,
    closeVerificationModal
  };
} 