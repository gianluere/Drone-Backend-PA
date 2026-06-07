import { Response, NextFunction } from 'express';
import { checkRole } from '../middleware/checkRole';
import { AuthenticatedRequest } from '../middleware/JWTAuth';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../models/User';

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (role?: UserRole) => {
  return {
    user: role ? { userId: 1, email: 'test@test.com', role } : undefined,
  } as unknown as AuthenticatedRequest;
};

describe('checkRole', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dovrebbe restituire 401 se req.user non è presente', () => {
    const req = mockReq(); // nessun utente autenticato
    const res = mockRes();

    checkRole(UserRole.USER)(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({ error: 'Non autenticato' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('dovrebbe restituire 403 se il ruolo non è autorizzato', () => {
    const req = mockReq(UserRole.USER); // utente con ruolo user
    const res = mockRes();

    checkRole(UserRole.OPERATOR, UserRole.ADMIN)(req, res, mockNext); // richiede operator o admin

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({ error: 'Accesso negato: ruolo non autorizzato' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('dovrebbe chiamare next se il ruolo è autorizzato', () => {
    const req = mockReq(UserRole.OPERATOR);
    const res = mockRes();

    checkRole(UserRole.OPERATOR, UserRole.OPERATOR)(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('dovrebbe chiamare next se il ruolo corrisponde esattamente', () => {
    const req = mockReq(UserRole.USER);
    const res = mockRes();

    checkRole(UserRole.USER)(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('dovrebbe restituire 403 se admin accede a una rotta solo user', () => {
    const req = mockReq(UserRole.ADMIN);
    const res = mockRes();

    checkRole(UserRole.USER)(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(mockNext).not.toHaveBeenCalled();
  });

});