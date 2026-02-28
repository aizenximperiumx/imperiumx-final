import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

interface AssignedUser {
  username: string;
  email: string;
}

export interface TicketNote {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: {
    username: string;
    email: string;
  };
}

interface Ticket {
  id: string;
  userId: string;
  type: string;
  status: string;
  subject?: string;
  description: string;
  orderId?: string;
  priority: string;
  lifetimeWarranty: boolean;
  createdAt: string;
  messages?: Message[];
  user?: {
    id: string;
    username: string;
    email: string;
  };
  assignedUser?: AssignedUser | null;
}

interface TicketContextType {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  fetchTickets: (opts?: { offset?: number; limit?: number }) => Promise<void>;
  fetchTicket: (id: string, opts?: { messagesLimit?: number }) => Promise<void>;
  createTicket: (data: any) => Promise<Ticket>;
  sendMessage: (ticketId: string, message: string) => Promise<void>;
  markOrderPaid: (ticketId: string) => Promise<void>;
  confirmPayment: (ticketId: string, amount: number, paymentMethod: string) => Promise<any>;
  closeTicket: (ticketId: string) => Promise<void>;
  setCurrentTicket: (ticket: Ticket | null) => void;
  assignTicket: (ticketId: string, userId: string | null) => Promise<void>;
  getNotes: (ticketId: string) => Promise<TicketNote[]>;
  addNote: (ticketId: string, content: string) => Promise<TicketNote>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const { token, isStaff } = useAuth();

  const fetchTickets = async (opts?: { offset?: number; limit?: number }) => {
    if (!token) return;
    try {
      setLoading(true);
      const limit = opts?.limit ?? 50;
      const offset = opts?.offset ?? 0;
      const data = await api.get(`/tickets?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicket = async (id: string, opts?: { messagesLimit?: number }) => {
    if (!token) return;
    try {
      setLoading(true);
      const messagesLimit = opts?.messagesLimit ?? 200;
      const data = await api.get(`/tickets/${id}?messagesLimit=${messagesLimit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentTicket(data);
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (data: any): Promise<Ticket> => {
    if (!token) {
      throw new Error('Not authenticated');
    }
    try {
      setLoading(true);
      const result = await api.post('/tickets', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Make sure we return a valid ticket object
      const ticket: Ticket = result.ticket || result;
      
      // Refresh tickets list
      await fetchTickets();
      
      return ticket;
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      throw new Error(error.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (ticketId: string, message: string) => {
    if (!token) return;
    try {
      await api.post(`/tickets/${ticketId}/messages`, { message }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTicket(ticketId);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const markOrderPaid = async (ticketId: string) => {
    if (!token) return;
    try {
      await api.post(`/tickets/${ticketId}/order-paid`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTicket(ticketId);
    } catch (error: any) {
      console.error('Failed to mark order paid:', error);
      throw error;
    }
  };

  const confirmPayment = async (ticketId: string, amount: number, paymentMethod: string) => {
    if (!token) return;
    try {
      const data = await api.post(`/tickets/${ticketId}/payment-confirmed`, {
        amount,
        paymentMethod,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTicket(ticketId);
      return data;
    } catch (error: any) {
      console.error('Failed to confirm payment:', error);
      throw error;
    }
  };

  const closeTicket = async (ticketId: string) => {
    if (!token) return;
    try {
      await api.post(`/tickets/${ticketId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTickets();
    } catch (error: any) {
      console.error('Failed to close ticket:', error);
      throw error;
    }
  };

  const assignTicket = async (ticketId: string, userId: string | null) => {
    if (!token) return;
    try {
      await api.patch(`/tickets/${ticketId}/assign`, { userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTicket(ticketId);
    } catch (error: any) {
      console.error('Failed to assign ticket:', error);
      throw error;
    }
  };

  const getNotes = async (ticketId: string): Promise<TicketNote[]> => {
    if (!token) return [];
    try {
      const notes = await api.get(`/tickets/${ticketId}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return Array.isArray(notes) ? notes : [];
    } catch (error: any) {
      console.error('Failed to get notes:', error);
      return [];
    }
  };

  const addNote = async (ticketId: string, content: string): Promise<TicketNote> => {
    if (!token) throw new Error('Not authenticated');
    try {
      const { note } = await api.post(`/tickets/${ticketId}/notes`, { content }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return note;
    } catch (error: any) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };

  const value = {
    tickets,
    currentTicket,
    loading,
    fetchTickets,
    fetchTicket,
    createTicket,
    sendMessage,
    markOrderPaid,
    confirmPayment,
    closeTicket,
    setCurrentTicket,
    assignTicket,
    getNotes,
    addNote,
  };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
