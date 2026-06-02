import ForbiddenAreaDAO from "../dao/ForbiddenAreaDAO";
import { CreateForbiddenAreaInput, UpdateForbiddenAreaInput } from "../validation/validator";
import * as Errors from '../middleware/errors/errorsClass';

export class ForbiddenAreaService {

    async getForbiddenAreas() {
        console.log('Fetching forbidden areas from service...');
        return await ForbiddenAreaDAO.findAll();
    }

    async createForbiddenArea(data: CreateForbiddenAreaInput, operatorId: number) {
        return await ForbiddenAreaDAO.create({ ...data, createdBy: operatorId });
    }

    async updateForbiddenArea(areaId: number, data: UpdateForbiddenAreaInput, operatorId: number) {

        console.log(data);

        const area = await ForbiddenAreaDAO.findById(areaId);
        if (!area) {
            throw new Errors.NotFoundError('Forbidden area not found');
        }

        if (area.createdBy !== operatorId) {
            throw new Errors.ForbiddenError('Non hai i permessi per modificare quest\'area');
        }

        if (data.latMin !== undefined && data.latMin >= (data.latMax ?? area.latMax)) {
            throw new Errors.BadRequestError('latMin deve essere minore di latMax');
        }

        if (data.latMax !== undefined && data.latMax <= (data.latMin ?? area.latMin)) {
            throw new Errors.BadRequestError('latMax deve essere maggiore di latMin');
        }

        if (data.lonMin !== undefined && data.lonMin >= (data.lonMax ?? area.lonMax)) {
            throw new Errors.BadRequestError('lonMin deve essere minore di lonMax');
        }

        if (data.lonMax !== undefined && data.lonMax <= (data.lonMin ?? area.lonMin)) {
            throw new Errors.BadRequestError('lonMax deve essere maggiore di lonMin');
        }

        await ForbiddenAreaDAO.update(areaId, data);
        return await ForbiddenAreaDAO.findById(areaId);

    }

    async deleteForbiddenArea(areaId: number, operatorId: number) {
        const area = await ForbiddenAreaDAO.findById(areaId);
        if (!area) {
            throw new Errors.NotFoundError('Forbidden area not found');
        }

        if (area.createdBy !== operatorId) {
            throw new Errors.ForbiddenError('Non hai i permessi per eliminare quest\'area');
        }
        await ForbiddenAreaDAO.deleteById(areaId);
    }


}