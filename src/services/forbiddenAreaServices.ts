import ForibiddenAreaDAO from "../dao/ForibiddenAreaDAO";

export class ForbiddenAreaService {
    private forbiddenAreaDAO = ForibiddenAreaDAO;

    async getForbiddenAreas() {
        console.log('Fetching forbidden areas from service...');
        return await this.forbiddenAreaDAO.findAll();
    }

    async createForbiddenArea(data: {
        name: string;
        description?: string;
        latMin: number;
        lonMin: number;
        latMax: number;
        lonMax: number;
        createdBy: number;
    }) {
        return await this.forbiddenAreaDAO.create(data);
    }

    
}