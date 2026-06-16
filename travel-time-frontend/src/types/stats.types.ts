export interface PeriodInfo {
    startDate: string;
    endDate: string;
    daysCount: number;
}

export interface KPI {
    totalRevenue: number;
    totalBookings: number;
    averageCheck: number;
    activeUsers: number;
    conversionRate: number;
    averageLeadTime: number;
}

export interface TimelineItem {
    name: string;
    value: number;
    fullDate: string;
}

export interface ChartItem {
    name: string;
    value: number;
}

export interface TopTourItem {
    name: string;
    sales: number;
    revenue: number;
}

export interface DemographicItem {
    name: string;
    count: number;
    revenue: number;
}

export interface Charts {
    revenueTimeline: TimelineItem[];
    bookingStatus: ChartItem[];
    topTours: TopTourItem[];
    demographics: DemographicItem[];
    transportUsage: ChartItem[];
    revenueByCountry: ChartItem[];
    hotelPreferences: ChartItem[];
    userLoyalty: ChartItem[];
}

export interface StatsResponse {
    periodInfo: PeriodInfo;
    kpi: KPI;
    charts: Charts;
}