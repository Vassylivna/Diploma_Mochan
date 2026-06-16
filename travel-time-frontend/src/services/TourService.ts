import axiosClient from '../api/axiosClient';
import { 
    TourCard, 
    TourDetails, 
    TourRequest, 
    TourSearchCriteria, 
    GuideTourView 
} from '../types/tour.types';
import { PageResponse } from '../types/pagination.types';

const BASE_URL = '/tours';

export const TourService = {
    getAll: async (
        criteria: TourSearchCriteria, 
        page: number = 1, 
        size: number = 9
    ) => {
        const params = {
            ...criteria,
            page: page - 1, 
            size,
            sort: 'startDate,asc' 
        };
        const { data } = await axiosClient.get<PageResponse<TourCard>>(BASE_URL, { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await axiosClient.get<TourDetails>(`${BASE_URL}/${id}`);
        return data;
    },

    getGuideView: async (id: number) => {
        const { data } = await axiosClient.get<GuideTourView>(`${BASE_URL}/${id}/guide-view`);
        return data;
    },

    create: async (payload: TourRequest) => {
        const { data } = await axiosClient.post<TourDetails>(BASE_URL, payload);
        return data;
    },

    update: async (id: number, payload: TourRequest) => {
        const { data } = await axiosClient.put<TourDetails>(`${BASE_URL}/${id}`, payload);
        return data;
    },

    delete: async (id: number) => {
        await axiosClient.delete(`${BASE_URL}/${id}`);
    },

    toggleArchive: async (id: number) => {
        const { data } = await axiosClient.patch<TourCard>(`${BASE_URL}/${id}/archive`);
        return data; 
    },

    getActiveForGuide: async () => {
        const { data } = await axiosClient.get<TourCard | ''>(`${BASE_URL}/active`);
        return data || null;
    },

    toggleHidden: async (id: number) => {
        const { data } = await axiosClient.patch<TourCard>(`${BASE_URL}/${id}/hide`);
        return data; 
    }
};