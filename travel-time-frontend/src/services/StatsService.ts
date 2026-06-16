import axiosClient from '../api/axiosClient';
import { StatsResponse } from '../types/stats.types';

export const statsService = {
    async getBusinessStats(range: { start: string; end: string }): Promise<StatsResponse> {
        const { data } = await axiosClient.get<StatsResponse>('/admin/stats', {
            params: { 
                from: range.start,
                to: range.end 
            }
        });
        
        return data;
    }
};