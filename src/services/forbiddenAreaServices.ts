import ForbiddenAreaDAO from "../dao/ForbiddenAreaDAO";
import {CreateForbiddenAreaInput} from "../validation/validator";

export class ForbiddenAreaService {

    async getForbiddenAreas() {
        console.log('Fetching forbidden areas from service...');
        return await ForbiddenAreaDAO.findAll();
    }

    async createForbiddenArea(data: CreateForbiddenAreaInput, operatorId : number) {
        return await ForbiddenAreaDAO.create({...data, createdBy: operatorId});
    }

    
}