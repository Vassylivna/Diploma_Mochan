import axiosClient from '../api/axiosClient';
import { Location, LocationRequest } from '../types/location.types';
import { PageResponse } from '../types/pagination.types';

const BASE_URL = '/locations';

export const LocationService = {
    getPaginated: async (page: number, size: number, searchTerm: string = '') => {
        const params = {
            page: page - 1,
            size,
            searchTerm: searchTerm || undefined,
            sort: 'locationId,desc'
        };
        const { data } = await axiosClient.get<PageResponse<Location>>(BASE_URL, { params });
        return data;
    },

    getAllActive: async () => {
        const { data } = await axiosClient.get<Location[]>(`${BASE_URL}/active`);
        return data;
    },

    create: async (payload: LocationRequest) => {
        const { data } = await axiosClient.post<Location>(BASE_URL, payload);
        return data;
    },

    update: async (id: number, payload: LocationRequest) => {
        const { data } = await axiosClient.put<Location>(`${BASE_URL}/${id}`, payload);
        return data;
    },

    delete: async (id: number) => {
        await axiosClient.delete(`${BASE_URL}/${id}`);
    }
};