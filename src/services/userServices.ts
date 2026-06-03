import bcrypt from 'bcryptjs';
import UserDAO from '../dao/UserDAO';
import jwt from 'jsonwebtoken';
import fs from "fs";
import path from 'path';
import { UserRole } from '../models/User';
import { TOKEN_BALANCE_DEFAULT } from '../models/User';
import { signJWT } from '../middleware/JWTAuth';
import { JwtPayload } from '../middleware/JWTAuth';
import * as Errors from '../middleware/errors/errorsClass';

/*
const private_key = fs.readFileSync(
  path.resolve(__dirname, 'jwtRS256.key'), 'utf8'
);
*/

export class UserService {

    async login(email: string, password: string) {
        const user = await UserDAO.findByEmail(email);

        if (!user) {
            throw new Errors.UnauthorizedError('Credenziali non valide');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new Errors.UnauthorizedError('Password errata');
        }

        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const token = signJWT(payload);

        return { token };
    }

    async register(data: {
        email: string;
        password: string;
        role?: UserRole;
    }) {

        const existing = await UserDAO.findByEmail(data.email);
        if (existing) {
            throw new Errors.ConflictError('Email già registrata');
        }

        const passwordTrimmed = data.password.trim();

        const passwordHash = await bcrypt.hash(passwordTrimmed, 10);

        const user = await UserDAO.create({
            email: data.email,
            passwordHash,
            role: data.role ?? 'user',
            tokenBalance: (data.role === 'user') ? TOKEN_BALANCE_DEFAULT : 0,
        });

        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const token = signJWT(payload);

        return { token };

    }

    async chargeTokens(userId: number, amount: number) {
        const user = await UserDAO.findById(userId);
        if (!user) {
            throw new Errors.NotFoundError('Utente non trovato');
        }

        if(user.role !== 'user') {
            throw new Errors.BadRequestError('Solo gli utenti di tipo "user" possono avere un saldo di token');
        }

        const newBalance = user.tokenBalance + amount;
        await UserDAO.updateTokenBalance(userId, newBalance);

        return { tokenBalance: newBalance };
    }

}

/*

export const login = async (email: string, password: string) => {
    const user = await UserDAO.findByEmail(email);

    if (!user) {
        throw new Errors.UnauthorizedError('Credenziali non valide');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new Errors.UnauthorizedError('Password errata');
    }

    const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };

    const token = signJWT(payload);

    return { token };
};


export const register = async (data: {
    email: string;
    password: string;
    role?: UserRole;
}) => {
    const existing = await UserDAO.findByEmail(data.email);
    if (existing) {
        throw new Errors.ConflictError('Email già registrata');
    }

    const passwordTrimmed = data.password.trim();

    const passwordHash = await bcrypt.hash(passwordTrimmed, 10);

    const user = await UserDAO.create({
        email: data.email,
        passwordHash,
        role: data.role ?? 'user',
        tokenBalance: (data.role === 'user') ? TOKEN_BALANCE_DEFAULT : 0,
    });

    const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };

    const token = signJWT(payload);

    return { token };
};*/