export interface Transport {
    transportId: number;
    transportName: string;
    transportNumber: string;
    description: string;
    isDeleted?: boolean;
}

export interface TransportRequest {
    transportName: string;
    transportNumber: string;
    description: string;
}
