import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { checkAndVerifyJWT } from '../middleware/JWTAuth';

// mock delle variabili d'ambiente
process.env.JWT_PUBLIC_KEY = 'test_public_key';

// mock di jsonwebtoken
jest.mock('jsonwebtoken');

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (authHeader?: string) => {
  return {
    headers: {
      authorization: authHeader,
    },
  } as unknown as Request;
};

describe('checkAndVerifyJWT', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dovrebbe restituire 401 se il token non è presente', () => {
    const req = mockReq();
    const res = mockRes();

    checkAndVerifyJWT(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Auth token non disponibile nell\'header' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('dovrebbe restituire 401 se il token non è nel formato Bearer', () => {
    const req = mockReq('InvalidToken');
    const res = mockRes();

    checkAndVerifyJWT(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'L\'auth token non è nel formato corretto' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('dovrebbe restituire 401 se il token è scaduto o non valido', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Token scaduto');
    });

    const req = mockReq('Bearer token_non_valido');
    const res = mockRes();

    checkAndVerifyJWT(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token non valido o scaduto' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('dovrebbe chiamare next e impostare req.user se il token è valido', () => {
    const payload = { userId: 1, email: 'user@test.com', role: 'user' };
    (jwt.verify as jest.Mock).mockReturnValue(payload);

    const req = mockReq('Bearer token_valido');
    const res = mockRes();

    checkAndVerifyJWT(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect((req as any).user).toEqual(payload);
  });

});