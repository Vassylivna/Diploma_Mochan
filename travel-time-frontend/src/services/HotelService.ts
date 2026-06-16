import axiosClient from '../api/axiosClient';
import { Hotel, HotelRequest } from '../types/hotel.types';
import { PageResponse } from '../types/pagination.types';

const BASE_URL = '/hotels';

export const HotelService = {
    getPaginated: async (page: number, size: number, searchTerm: string = '') => {
        const params = {
            page: page - 1,
            size,
            searchTerm: searchTerm || undefined,
            sort: 'hotelId,desc'
        };
        const { data } = await axiosClient.get<PageResponse<Hotel>>(BASE_URL, { params });
        return data;
    },

    getAllActive: async () => {
        const { data } = await axiosClient.get<Hotel[]>(`${BASE_URL}/active`);
        return data;
    },

    create: async (payload: HotelRequest) => {
        const { data } = await axiosClient.post<Hotel>(BASE_URL, payload);
        return data;
    },

    update: async (id: number, payload: HotelRequest) => {
        const { data } = await axiosClient.put<Hotel>(`${BASE_URL}/${id}`, payload);
        return data;
    },

    delete: async (id: number) => {
        await axiosClient.delete(`${BASE_URL}/${id}`);
    }
};