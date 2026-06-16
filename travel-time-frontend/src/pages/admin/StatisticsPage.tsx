import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, IconButton, Stack, MenuItem, Select, 
    FormControl, CircularProgress, Tooltip as MuiTooltip,
    TextField, Button, Grid
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon, 
    InfoOutlined as InfoIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import {
    ComposedChart, Line, Bar, Brush, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart
} from 'recharts';
import { format, parseISO } from 'date-fns'; 
import { uk } from 'date-fns/locale';

import { useStatistics } from '../../hooks/useStatistics';

const UI_STYLE = {
    bg: '#F8FAFC', primary: '#2563EB', textMain: '#0F172A', textSub: '#64748B',
    success: '#10B981', warning: '#F59E0B', shadow: '0 4px 20px rgba(0, 0, 0, 0.05)', radius: '16px'
};

const STATUS_COLORS: Record<string, string> = {
    'На перевірці': '#3B82F6',
    'Очікує повернення': '#F97316',
    'Очікують оплати': '#F59E0B',
    'Оплачені': '#10B981',
    'Скасовано (оплачені)': '#BE123C',
    'Повернені': '#64748B',
    'Скасовані': '#EF4444'
};

const DEMO_COLORS: Record<string, string> = {
    'Дорослі': '#3B82F6',
    'Підлітки (13-17)': '#8B5CF6',
    'Діти (0-12)': '#10B981'
};

const LOYALTY_COLORS = ["#94A3B8", "#3B82F6", "#6366F1", "#8B5CF6", "#F59E0B"];
const TRANSPORT_COLOR = "#6366F1";
const COUNTRY_COLOR = "#14B8A6";
const HOTEL_COLOR = "#3B82F6";

const getDaysLabel = (days: number) => {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    if (lastDigit === 1 && lastTwoDigits !== 11) return 'день';
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return 'дні';
    return 'днів';
};

const getDeclension = (num: number, one: string, few: string, many: string) => {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastDigit === 1 && lastTwoDigits !== 11) return one;
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return few;
    return many;
};

const formatCurrency = (val: number) => 
    new Intl.NumberFormat('uk-UA', { style: 'decimal', maximumFractionDigits: 0 }).format(val) + ' ₴';

const truncateName = (name: string) => name.length > 15 ? name.substring(0, 15) + '...' : name;

const statusDescriptions: Record<string, string> = {
    'На перевірці': 'Замовлення створене клієнтом, очікує підтвердження адміна',
    'Очікує повернення': 'Клієнт подав запит на скасування, кошти ще не повернуті',
    'Очікують оплати': 'Замовлення підтверджено, очікується надходження коштів',
    'Оплачені': 'Успішно оплачене замовлення',
    'Скасовано (оплачені)': 'Оплачені замовлення скасовані за менше ніж 14 днів до початку туру',
    'Повернені': 'Повернуті кошти клієнту за скасоване замовлення',
    'Скасовані': 'Замовлення скасовано без оплати',
};

const CustomTooltip = ({ active, payload, label, unit = '' }: any) => {
    if (active && payload && payload.length) {
        return (
            <Paper sx={{ p: 1.5, border: '1px solid #e2e8f0', boxShadow: UI_STYLE.shadow }}>
                <Typography variant="body2" fontWeight={700} color={UI_STYLE.textMain}>{label}</Typography>
                {payload.map((entry: any, index: number) => {
                    let displayName = entry.name;
                    let displayUnit = unit;
                    if (entry.name === 'loyalty') { displayName = 'Клієнтів'; displayUnit = getDeclension(entry.value, 'клієнт', 'клієнти', 'клієнтів'); } 
                    else if (entry.name === 'value') { displayName = 'Показник'; } 
                    else if (entry.name === 'sales') { displayName = 'Кількість бронювань'; } 
                    else if (entry.name === 'revenue' || entry.name === 'Дохід') { displayName = 'Дохід'; } 
                    else if (entry.name === 'Tresnd' || entry.name === 'Тренд') { displayName = 'Тренд'; }

                    return (
                        <Typography key={index} variant="body2" sx={{ color: entry.fill || entry.color || UI_STYLE.textSub }}>
                            {displayName}: <b>{entry.value.toLocaleString()} {displayUnit}</b>
                        </Typography>
                    );
                })}
            </Paper>
        );
    }
    return null;
};

const CustomPieLegend = (props: any) => {
    const { payload } = props;
    return (
        <Box sx={{ mt: 3, width: '100%' }}>
            <Grid container spacing={2} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
                {payload.map((entry: any, index: number) => {
                    const desc = statusDescriptions[entry.value] || 'Статус замовлення';
                    return (
                        <Grid key={`item-${index}`} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <MuiTooltip title={desc} arrow placement="top">
                                <Stack direction="column" alignItems="center" spacing={0.5} sx={{ cursor: 'help' }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
                                        <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>
                                            {entry.value}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" fontWeight={800} color={UI_STYLE.textMain}>{entry.payload.value}</Typography>
                                </Stack>
                            </MuiTooltip>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

const CustomYAxisTick = ({ x, y, payload }: any) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <foreignObject x={-120} y={-10} width={110} height={20}>
                <MuiTooltip title={payload.value} arrow placement="right">
                    <Typography 
                        variant="caption" noWrap display="block" 
                        sx={{ fontSize: 11, fontWeight: 600, color: UI_STYLE.textSub, textAlign: 'right', cursor: 'help', lineHeight: '20px' }}
                    >
                        {truncateName(payload.value)}
                    </Typography>
                </MuiTooltip>
            </foreignObject>
        </g>
    );
};

const StatCard = ({ title, value, helpText }: any) => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: UI_STYLE.radius, boxShadow: UI_STYLE.shadow, height: '100%', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Typography variant="body2" sx={{ color: UI_STYLE.textSub, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
            <MuiTooltip title={helpText} arrow><InfoIcon sx={{ fontSize: 16, color: UI_STYLE.textSub, cursor: 'help', opacity: 0.7 }} /></MuiTooltip>
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 800, color: UI_STYLE.textMain }}>{value}</Typography>
    </Paper>
);

const StatisticsPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        loading, stats, selectedPreset, startDate, endDate, dynamicDaysCount,
        handlePresetChange, handleDateChange, loadData
    } = useStatistics();
    
    const today = format(new Date(), 'yyyy-MM-dd');

    const chartData = useMemo(() => {
        if (!stats) return null;

        const bookingStatus = stats.charts.bookingStatus.map(item => ({
            ...item,
            color: STATUS_COLORS[item.name] || '#CBD5E1'
        }));

        const demographics = stats.charts.demographics.map(item => ({
            ...item,
            color: DEMO_COLORS[item.name] || '#CBD5E1'
        }));

        const userLoyalty = stats.charts.userLoyalty.map((item, index) => ({
            ...item,
            color: LOYALTY_COLORS[index % LOYALTY_COLORS.length]
        }));

        return {
            ...stats.charts,
            bookingStatus,
            demographics,
            userLoyalty
        };
    }, [stats]);

    const transportData = useMemo(() => {
        if (!stats?.charts.transportUsage) return [];
        return [...stats.charts.transportUsage]
            .sort((a: any, b: any) => b.value - a.value)
            .slice(0, 6);
    }, [stats?.charts.transportUsage]);

    if (loading && !stats) return <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: UI_STYLE.bg }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: UI_STYLE.bg, minHeight: '100vh' }}>
            <Stack direction={{ xs: 'column', xl: 'row' }} justifyContent="space-between" alignItems={{ xs: 'start', xl: 'center' }} spacing={3} sx={{ mb: 5 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton onClick={() => navigate('/')} sx={{ p: 1 }}>
                        <ArrowBackIcon sx={{ color: UI_STYLE.textMain }} />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Аналітика</Typography>
                </Stack>

                <Paper elevation={0} sx={{ px: 3, py: 1.5, borderRadius: '12px', bgcolor: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', flexWrap: 'wrap' }}>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">Статистика за:</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <TextField type="date" size="small" value={startDate} onChange={(e) => handleDateChange('start', e.target.value)} inputProps={{ max: endDate < today ? endDate : today }} sx={{ '& fieldset': { border: 'none' }, '& input': { fontWeight: 800, color: UI_STYLE.primary, p: 0, width: 130, cursor: 'pointer' } }} />
                        <Box component="span" sx={{ bgcolor: '#F1F5F9', px: 1.5, py: 0.5, borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, color: UI_STYLE.textSub, whiteSpace: 'nowrap' }}>{dynamicDaysCount} {getDaysLabel(dynamicDaysCount)}</Box>
                        <TextField type="date" size="small" value={endDate} onChange={(e) => handleDateChange('end', e.target.value)} inputProps={{ min: startDate, max: today }} sx={{ '& fieldset': { border: 'none' }, '& input': { fontWeight: 800, color: UI_STYLE.primary, p: 0, width: 130, cursor: 'pointer', textAlign: 'right' } }} />
                    </Stack>
                </Paper>

                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <Select value={selectedPreset} onChange={handlePresetChange} sx={{ borderRadius: '12px', bgcolor: 'white' }}>
                            <MenuItem value="day">Сьогодні</MenuItem>
                            <MenuItem value="week">Тиждень</MenuItem>
                            <MenuItem value="month">Місяць</MenuItem>
                            <MenuItem value="year">Рік</MenuItem>
                            <MenuItem value="5years">5 років</MenuItem>
                            <MenuItem value="custom" sx={{ fontWeight: 700, color: UI_STYLE.primary }}>Свій період...</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" onClick={loadData} disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <RefreshIcon />} sx={{ borderRadius: '10px', boxShadow: 'none', height: 40, px: 3, fontWeight: 700, textTransform: 'none', bgcolor: UI_STYLE.primary, '&:hover': { bgcolor: '#1D4ED8' } }}>Оновити</Button>
                </Stack>
            </Stack>

            {/* KPI Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
                <StatCard title="Дохід" value={formatCurrency(stats?.kpi.totalRevenue || 0)} helpText="Загальний виторг від успішних оплат" />
                <StatCard title="Кількість замовлень" value={stats?.kpi.totalBookings || 0} helpText="Кількість всіх створених заявок" />
                <StatCard title="Середній чек" value={formatCurrency(stats?.kpi.averageCheck || 0)} helpText="Середня вартість одного оплаченого туру" />
                <StatCard title="Куплено за" value={`${stats?.kpi.averageLeadTime} ${getDaysLabel(stats?.kpi.averageLeadTime || 0)}`} helpText="Середній час від моменту оплати до початку туру" />
            </Box>

            <Paper sx={{ p: 3, borderRadius: UI_STYLE.radius, border: '1px solid #e2e8f0', boxShadow: UI_STYLE.shadow, mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box><Typography variant="h6" fontWeight={800} sx={{ color: UI_STYLE.textMain }}>Динаміка доходів</Typography></Box>
                    {stats?.periodInfo && <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: '#F1F5F9', px: 2, py: 1, borderRadius: '10px', border: '1px solid #E2E8F0' }}><Typography variant="caption" sx={{ color: UI_STYLE.textSub, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>Період:</Typography><Typography variant="body2" sx={{ color: UI_STYLE.textMain, fontWeight: 800 }}>{format(parseISO(stats.periodInfo.startDate), 'd MMM', { locale: uk })} — {format(parseISO(stats.periodInfo.endDate), 'd MMM yyyy', { locale: uk })}</Typography></Stack>}
                </Stack>
                <Box sx={{ height: 420, width: '100%' }}>
                    <ResponsiveContainer>
                        <ComposedChart data={chartData?.revenueTimeline || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs><linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={UI_STYLE.primary} stopOpacity={0.3}/><stop offset="100%" stopColor={UI_STYLE.primary} stopOpacity={0.1}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: UI_STYLE.textSub, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} minTickGap={30} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 11, fill: UI_STYLE.textSub, fontWeight: 600 }} tickFormatter={(v) => `₴${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} axisLine={false} tickLine={false} width={60} />
                            <Tooltip content={<CustomTooltip unit="₴" />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                            <Bar dataKey="value" name="Дохід" barSize={12} fill="url(#colorBar)" radius={[10, 10, 0, 0]} />
                            <Line type="monotone" dataKey="value" name="Тренд" stroke={UI_STYLE.primary} strokeWidth={3} dot={false} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: UI_STYLE.primary }} />
                            <Brush dataKey="name" height={30} stroke="#CBD5E1" fill="#F8FAFC" tickFormatter={() => ''} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }}>
                <Paper sx={{ p: 3, borderRadius: UI_STYLE.radius, flex: 1, border: '1px solid #e2e8f0', boxShadow: UI_STYLE.shadow }}>
                    <Typography variant="h6" fontWeight={800} mb={2}>Статус замовлень</Typography>
                    <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData?.bookingStatus || []} innerRadius={80} outerRadius={110} dataKey="value" nameKey="name" paddingAngle={3}>
                                    {(chartData?.bookingStatus || []).map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip unit="шт." />} />
                                <Legend content={<CustomPieLegend />} verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: UI_STYLE.radius, flex: 1, border: '1px solid #e2e8f0', boxShadow: UI_STYLE.shadow }}>
                    <Typography variant="h6" fontWeight={800} mb={2}>Популярні Тури</Typography>
                    <Box sx={{ height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart layout="vertical" data={stats?.charts.topTours || []} margin={{ left: 10, right: 30 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} tick={<CustomYAxisTick />} />
                                <Tooltip content={<CustomTooltip unit="" />} />
                                <Bar dataKey="sales" name="sales" fill={UI_STYLE.primary} radius={[0, 6, 6, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
                <Paper sx={{ p: 3, borderRadius: UI_STYLE.radius, border: '1px solid #e2e8f0', boxShadow: UI_STYLE.shadow }}>
                    <Typography variant="h6" fontWeight={800} mb={2}>Географія доходів</Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats?.charts.revenueByCountry || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip unit="₴" />} />
                                <Bar dataKey="value" name="revenue" fill={COUNTRY_COLOR} radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: UI_STYLE.radius, border: '1px solid #e2e8f0', boxShadow: UI_STYLE.shadow }}>
                    <Typography variant="h6" fontWeight={800} mb={2}>Демографія</Typography>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                        {(chartData?.demographics || []).map((item) => (
                            <Stack key={item.name} direction="row" justifyContent="space-between" sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px' }}>
                                <Box>
                                    <Typography variant="caption" fontWeight={700} display="block">{item.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{item.count} осіб</Typography>
                                </Box>
                                <Typography variant="body2" fontWeight={800} color={item.color}>{formatCurrency(item.revenue)}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                    <Box sx={{ height: 120 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={chartData?.demographics || []} dataKey="revenue" innerRadius={35} outerRadius={50}>
                                    {(chartData?.demographics || []).map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip unit="₴" />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: UI_STYLE.radius, border: '1px solid #e2e8f0', boxShadow: UI_STYLE.shadow }}>
                    <Typography variant="h6" fontWeight={800} mb={2}>Усі категорії готелів</Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats?.charts.hotelPreferences || []} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fontWeight: 700 }} />
                                <Tooltip content={<CustomTooltip unit="брон." />} />
                                <Bar dataKey="value" name="sales" fill={HOTEL_COLOR} radius={[0, 8, 8, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Paper sx={{ p: 3, borderRadius: UI_STYLE.radius, flex: 1, border: '1px solid #e2e8f0', boxShadow: UI_STYLE.shadow }}>
                    <Typography variant="h6" fontWeight={800} mb={2}>Транспорт (Топ-6)</Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={transportData}>
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip unit="турів" />} />
                                <Bar dataKey="value" name="value" fill={TRANSPORT_COLOR} radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: UI_STYLE.radius, flex: 1, border: '1px solid #e2e8f0', boxShadow: UI_STYLE.shadow }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <Typography variant="h6" fontWeight={800}>Розподіл за кількістю замовлень</Typography>
                        <MuiTooltip title="Розподіл покупців за кількістю їхніх успішних замовлень" arrow><InfoIcon sx={{ fontSize: 18, color: UI_STYLE.textSub, cursor: 'help' }} /></MuiTooltip>
                    </Stack>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart layout="vertical" data={chartData?.userLoyalty || []} margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 700, fill: UI_STYLE.textMain }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" name="loyalty" radius={[0, 6, 6, 0]} barSize={35}>
                                    {(chartData?.userLoyalty || []).map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Stack>
        </Box>
    );
};

export default StatisticsPage;