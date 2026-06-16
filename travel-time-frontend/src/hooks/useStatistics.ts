import { useState, useEffect, useMemo, useCallback } from 'react';
import { statsService } from '../services/StatsService';
import { StatsResponse } from '../types/stats.types';
import { format, subMonths, subDays, subYears, differenceInDays } from 'date-fns';

export const useStatistics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [selectedPreset, setSelectedPreset] = useState('month');
    
    const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const dynamicDaysCount = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const diff = differenceInDays(new Date(endDate), new Date(startDate));
        return diff < 0 ? 0 : diff + 1; 
    }, [startDate, endDate]);

    const fetchStats = async (start: string, end: string) => {
        setLoading(true);
        try {
            const data = await statsService.getBusinessStats({ start, end });
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const start = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
        const end = format(new Date(), 'yyyy-MM-dd');
        fetchStats(start, end);
    }, []); 

    const loadData = useCallback(() => {
        fetchStats(startDate, endDate);
    }, [startDate, endDate]);

    const handlePresetChange = (event: any) => {
        const val = event.target.value;
        setSelectedPreset(val);
        
        if (val === 'custom') return;

        const now = new Date();
        let start = now;
        
        if (val === 'day') start = now;
        else if (val === 'week') start = subDays(now, 6); 
        else if (val === 'month') start = subMonths(now, 1);
        else if (val === 'year') start = subYears(now, 1);
        else if (val === '5years') start = subYears(now, 5);

        const sStr = format(start, 'yyyy-MM-dd');
        const eStr = format(now, 'yyyy-MM-dd');
        
        setStartDate(sStr);
        setEndDate(eStr);

    };

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        if (!value) return; 
        
        if (type === 'start') {
            setStartDate(value);
            if (value > endDate) setEndDate(value);
        } else {
            if (value < startDate) setEndDate(startDate);
            else setEndDate(value);
        }
        setSelectedPreset('custom');
    };

    return {
        loading, stats, selectedPreset, startDate, endDate, dynamicDaysCount,
        handlePresetChange, handleDateChange, loadData
    };
};