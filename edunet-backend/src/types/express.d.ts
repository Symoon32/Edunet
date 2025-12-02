import express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

interface IUserPayload {
  id: number | string;
  email?: string;
  correo?: string;
  rol?: number | string;
}
