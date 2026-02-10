
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/Card';
import { getIncomeRecords, addIncomeRecord, updateIncomeRecord, deleteIncomeRecord, uploadIncomeCSV } from '../../services/mockApi';
import { IncomeRecord, SummaryCardData } from '../../types';
import Modal from '../../components/Modal';
import IncomeForm from './IncomeForm';
import Button from '../../components/Button';
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, CalendarIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-700 p-2 border border-gray-600 rounded">
                <p className="label text-white">{`${label} : ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

const IncomeDashboard: React.FC = () => {
    const [allIncomeRecords, setAllIncomeRecords] = useState<IncomeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filters, setFilters] = useState<{ year: string, month: string }>({ year: 'all', month: 'all' });

/*
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getIncomeRecords();
            setAllIncomeRecords(data);
            if (filters.year === 'all' && data.length > 0) {
                const latestYear = Math.max(...data.map(r => new Date(r.date).getFullYear()));
                setFilters(prev => ({ ...prev, year: String(latestYear) }));
            }
        } catch (error) {
            console.error("Failed to fetch income records:", error);
        } finally {
            setLoading(false);
        }
    }, [filters.year]);
*/

    const fetchData = useCallback(async (isInitial = false) => {
        setLoading(true);
        const data = await getIncomeRecords();
        setAllIncomeRecords(data);
        if (isInitial && data.length > 0) {
            const latestYear = Math.max(...data.map(r => new Date(r.date).getFullYear()));
            setFilters(prev => ({ ...prev, year: String(latestYear) }));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const availableYears = useMemo(() => {
        const years = new Set(allIncomeRecords.map(r => new Date(r.date).getFullYear()));
        return Array.from(years).sort((a: number, b: number) => b - a);
    }, [allIncomeRecords]);

    const filteredRecords = useMemo(() => {
        return allIncomeRecords.filter(record => {
            const date = new Date(record.date);
            const yearMatch = filters.year === 'all' || date.getFullYear() === parseInt(filters.year);
            const monthMatch = filters.month === 'all' || date.getMonth() === parseInt(filters.month);
            return yearMatch && monthMatch;
        });
    }, [allIncomeRecords, filters]);

    const handleAdd = () => {
        setEditingRecord(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record: IncomeRecord) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            await deleteIncomeRecord(id);
            fetchData();
        }
    };

    const handleFormSubmit = async (recordData: Omit<IncomeRecord, '_id' | 'userId'> | Omit<IncomeRecord, 'userId'>) => {
        if ('_id' in recordData) {
            await updateIncomeRecord(recordData);
        } else {
            await addIncomeRecord(recordData);
        }
        fetchData();
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setLoading(true);
            const reader = new FileReader();
            reader.onload = async (e) => {
                const csv = e.target?.result as string;
                if (csv) {
                    try {
                        await uploadIncomeCSV(csv);
                        await fetchData();
                    } catch (error) {
                        console.error("Error uploading CSV:", error);
                        alert("Failed to upload CSV file.");
                        setLoading(false);
                    }
                }
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                alert("Failed to read file.");
                setLoading(false);
            };
            reader.readAsText(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };
    
    const summaryData: SummaryCardData[] = useMemo(() => {
        const totalIncome = filteredRecords.reduce((acc, r) => acc + r.amount, 0);

        const latestYearInData = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();
        const ytdRecords = allIncomeRecords.filter(r => new Date(r.date).getFullYear() === latestYearInData);
        const ytdIncome = ytdRecords.reduce((acc, r) => acc + r.amount, 0);

	const yearToConsider = filters.year === 'all' ? latestYearInData : parseInt(filters.year);
	const yearRecords = allIncomeRecords.filter(r => new Date(r.date).getFullYear() === yearToConsider);
        const totalYearIncome = yearRecords.reduce((acc, r) => acc + r.amount, 0);
        const monthsInYear = new Set(yearRecords.map(r => new Date(r.date).getMonth())).size;
        const avgMonthly = monthsInYear > 0 ? totalYearIncome / monthsInYear : 0;
        
        const latestMonthInYear = ytdRecords.length > 0 ? Math.max(...ytdRecords.map(r => new Date(r.date).getMonth())) + 1 : 0;
        const projected = ytdIncome > 0 && latestMonthInYear > 0 ? (ytdIncome / latestMonthInYear) * 12 : 0;

        const monthlySums: { [key: number]: number } = {};
        yearRecords.forEach(r => {
            const month = new Date(r.date).getMonth();
            monthlySums[month] = (monthlySums[month] || 0) + r.amount;
        });
        const amounts = Object.values(monthlySums);
        const highestMonth = amounts.length > 0 ? Math.max(...amounts) : 0;
        const lowestMonth = amounts.length > 0 ? Math.min(...amounts) : 0;

        return [
            { title: `Total Income (${filters.year})`, value: `₹${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { title: `YTD Income (${latestYearInData})`, value: `₹${ytdIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { title: 'Avg. Monthly Income', value: `₹${avgMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { title: 'Projected Annual Income', value: `₹${projected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { title: 'Monthly Extremes', value: `H: ₹${highestMonth.toFixed(0)} / L: ₹${lowestMonth.toFixed(0)}` },
        ];
    }, [filteredRecords, allIncomeRecords, filters.year, availableYears]);

   
/* const areaChartData = useMemo(() => {
        const dataMap: { [key: string]: number } = {};
	const groupingFormat = filters.year === 'all' ? { year: 'numeric' } : { year: '2-digit', month: 'short' }; 
        filteredRecords.forEach(record => {
            const month = new Date(record.date).toLocaleDateString('en-US', { year: '2-digit', month: 'short' });
            dataMap[month] = (dataMap[month] || 0) + record.amount;
        });
        return Object.entries(dataMap).map(([name, income]) => ({ name, income })).reverse();
    }, [filteredRecords]);
*/

    const areaChartData = useMemo(() => {
        const dataMap: { [key: string]: number } = {};
        const groupingFormat = filters.year === 'all' ? { year: 'numeric' } : { year: '2-digit', month: 'short' };
        filteredRecords.forEach(record => {
            const key = new Date(record.date).toLocaleDateString('en-US', groupingFormat as Intl.DateTimeFormatOptions);
            dataMap[key] = (dataMap[key] || 0) + record.amount;
        });

        const sortedData = Object.entries(dataMap).map(([name, income]) => ({ name, income, date: new Date(name) }));
        sortedData.sort((a,b) => a.date.getTime() - b.date.getTime());

        return sortedData.map(({name, income}) => ({name, income}));
    }, [filteredRecords, filters.year]);

    const pieChartData = useMemo(() => {
        const dataMap: { [key: string]: number } = {};
        filteredRecords.forEach(record => {
            dataMap[record.source] = (dataMap[record.source] || 0) + record.amount;
        });
        return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
    }, [filteredRecords]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {summaryData.map((data, index) => <Card key={index} data={data} />)}
            </div>

             <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <CalendarIcon className="text-gray-400" />
                    <select value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value, month: 'all' })} className="bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                        <option value="all">All Years</option>
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <select value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} className="bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                        <option value="all">All Months</option>
                        {MONTHS.map((month, index) => <option key={index} value={index}>{month}</option>)}
                    </select>
                </div>
                 <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
                    <Button variant="secondary" onClick={handleFileUploadClick}><UploadIcon className="mr-2" /> Upload CSV</Button>
                    <Button onClick={handleAdd}><PlusIcon className="mr-2" /> Add Record</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 h-96">
                    <h3 className="text-lg font-semibold text-white mb-4">Monthly Income Overview</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={areaChartData}>
                            <defs><linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="income" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 h-96">
                     <h3 className="text-lg font-semibold text-white mb-4">Income Breakdown</h3>
                     <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                     </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Income Records</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Source</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                <th scope="col" className="px-6 py-3">Notes</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record) => (
                                <tr key={record._id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-white">{record.source}</td>
                                    <td className="px-6 py-4">{record.category}</td>
                                    <td className="px-6 py-4 text-right text-green-400 font-semibold">₹{record.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 max-w-xs truncate">{record.notes}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleEdit(record)} className="text-blue-400 hover:text-blue-300 p-1"><EditIcon /></button>
                                            <button onClick={() => handleDelete(record._id)} className="text-red-400 hover:text-red-300 p-1"><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRecord ? 'Edit Income Record' : 'Add New Income Record'}>
                <IncomeForm onSubmit={handleFormSubmit} record={editingRecord} />
            </Modal>
        </div>
    );
};

export default IncomeDashboard;
