import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userServices';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e password obbligatori' });
      return;
    }

    const result = await userService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const prova = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.json({ message: "prova ok" });
}



export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e password obbligatori' });
      return;
    }

    const result = await userService.register({ email, password, role });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
