import { StatusCodes } from "http-status-codes";
import  {ForbiddenAreaService} from "../services/forbiddenAreaServices";

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

export const getForbiddenArea = async(req: any, res: any, next: any) => {
    try {
        const areas = await forbiddenAreaService.getForbiddenAreas();
        res.status(StatusCodes.OK).json(areas);
    } catch (err) {
        next(err);
    }
}