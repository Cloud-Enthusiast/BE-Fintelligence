import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Customer, CreateCustomerInput, subscribeToCustomers, createCustomer } from '@/services/customerService';

export const useCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = subscribeToCustomers(
      user.uid,
      (data) => {
        setCustomers(data);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addCustomer = async (input: CreateCustomerInput): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    return createCustomer(user.uid, input);
  };

  return { customers, isLoading, addCustomer };
};
