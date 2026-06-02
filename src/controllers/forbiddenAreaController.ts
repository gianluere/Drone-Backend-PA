import { StatusCodes } from "http-status-codes";
import { ForbiddenAreaService } from "../services/forbiddenAreaServices";
import { CreateForbiddenAreaInput, UpdateForbiddenAreaInput } from "../validation/validator";

/*
export class ForbiddenAreaController {
    constructor(private forbiddenAreaService: ForbiddenAreaService) {}

    getForbiddenAreas = async(req: any, res: any, next: any) => {
        try {
            console.log('Received request to get forbidden areas');
            const areas = await this.forbiddenAreaService.getForbiddenAreas()
            res.status(StatusCodes.OK).json(areas);
        } catch (err) {
            next(err);
        }
    }
}
*/
const forbiddenAreaService = new ForbiddenAreaService();

export const getForbiddenArea = async (req: any, res: any, next: any) => {
    try {
        const areas = await forbiddenAreaService.getForbiddenAreas();
        res.status(StatusCodes.OK).json(areas);
    } catch (err) {
        next(err);
    }
}

export const createForbiddenArea = async (req: any, res: any, next: any) => {
    try {
        const data = req.body as CreateForbiddenAreaInput;
        const area = await forbiddenAreaService.createForbiddenArea(
            data,
            req.user!.userId
        );
        res.status(StatusCodes.CREATED).json({ success: true, data: area });
    } catch (err) {
        next(err);
    }
}

export const updateForbiddenArea = async (req: any, res: any, next: any) => {
    try {
        const areaId = parseInt(req.params.id);
        const data = req.body as UpdateForbiddenAreaInput;
        const area = await forbiddenAreaService.updateForbiddenArea(
            areaId,
            data,
            req.user!.userId
        );
        res.status(StatusCodes.OK).json({ success: true, data: area });
    } catch (err) {
        next(err);
    }
}

export const deleteForbiddenArea = async (req: any, res: any, next: any) => {
    try {
        const areaId = parseInt(req.params.id);
        await forbiddenAreaService.deleteForbiddenArea(areaId, req.user!.userId);
        res.status(StatusCodes.NO_CONTENT).send({ message: 'Forbidden area eliminata correttamente' });
    } catch (err) {
        next(err);
    }
}