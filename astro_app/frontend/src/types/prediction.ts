export interface Prediction {
    name: string;
    description: string;
    category: string;
    house: number;
    planet: string;
    daily_status: Record<string, 'good' | 'bad'>;
}

