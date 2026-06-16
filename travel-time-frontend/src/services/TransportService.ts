import axiosClient from '../api/axiosClient';
import { Transport, TransportRequest } from '../types/transport.types';
import { PageResponse } from '../types/pagination.types';

const BASE_URL = '/transports';

export const TransportService = {
    getPaginated: async (page: number, size: number, searchTerm: string = '') => {
        const params = {
            page: page - 1,
            size,
            searchTerm: searchTerm || undefined,
            sort: 'transportId,desc'
        };
        const { data } = await axiosClient.get<PageResponse<Transport>>(BASE_URL, { params });
        return data;
    },

    getAllActive: async (startDate?: string, endDate?: string) => {
        const params = {
            startDate: startDate || undefined,
            endDate: endDate || undefined
        };
        const { data } = await axiosClient.get<Transport[]>(`${BASE_URL}/active`, { params });
        return data;
    },

    create: async (payload: TransportRequest) => {
        const { data } = await axiosClient.post<Transport>(BASE_URL, payload);
        return data;
    },

    update: async (id: number, payload: TransportRequest) => {
        const { data } = await axiosClient.put<Transport>(`${BASE_URL}/${id}`, payload);
        return data;
    },

    delete: async (id: number) => {
        await axiosClient.delete(`${BASE_URL}/${id}`);
    }
};