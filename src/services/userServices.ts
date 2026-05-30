import bcrypt from 'bcryptjs';
import UserDAO from '../dao/UserDAO';
import jwt from 'jsonwebtoken';
import fs from "fs";
import path from 'path';
import { UserRole } from '../models/User';
import { TOKEN_BALANCE_DEFAULT } from '../models/User';
import { signJWT } from '../middleware/JWTAuth';
import { JwtPayload } from '../middleware/JWTAuth';

/*
const private_key = fs.readFileSync(
  path.resolve(__dirname, 'jwtRS256.key'), 'utf8'
);
*/
export const login = async (email: string, password: string) => {
    const user = await UserDAO.findByEmail(email);

    if (!user) {
        throw { status: 401, message: 'Credenziali non valide' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw { status: 401, message: 'Credenziali non valide' };
    }

    /*const token = jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role,
    }, process.env.JWT_PRIVATE_KEY!.replace(/\\n/g, '\n'), {
        algorithm: 'RS256',
        expiresIn: '1h'
    });
    */
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
        throw { status: 409, message: 'Email già registrata' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await UserDAO.create({
        email: data.email,
        passwordHash,
        role: data.role ?? 'user',
        tokenBalance: (data.role === 'user')? TOKEN_BALANCE_DEFAULT : 0,
    });

    const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };

    const token = signJWT(payload);

    return { token };
};