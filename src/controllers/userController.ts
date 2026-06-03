import { Request, Response, NextFunction } from 'express';
import {UserService} from '../services/userServices';
import * as Errors from '../middleware/errors/errorsClass';
import { StatusCodes } from 'http-status-codes';
import { ChargeTokensInput } from '../validation/validator';

const userService = new UserService();

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Errors.BadRequestError('Email e password obbligatori');
    }

    const result = await userService.login(email, password);
    res.status(StatusCodes.OK).json(result);
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
      throw new Errors.BadRequestError('Email e password obbligatori');
    }    

    const result = await userService.register({ email, password, role });
    res.status(StatusCodes.CREATED).json(result);
  } catch (err) {
    next(err);
  }
};


export const chargeTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = req.body as ChargeTokensInput;

        if (!data.amount || data.amount <= 0) {
            throw new Errors.BadRequestError('Amount deve essere un numero positivo');
        }

        const result = await userService.chargeTokens(data.userId, data.amount);
        res.status(StatusCodes.OK).json(result);
    } catch (err) {
        next(err);
    }
}