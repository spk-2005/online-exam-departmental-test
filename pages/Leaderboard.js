import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Award, Clock, Target, Users, Search, TrendingUp, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

const Leaderboard = () => {
    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTest, setSelectedTest] = useState('all');
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('percentage');
    const [sortOrder, setSortOrder] = useState('desc');

    // Helper to convert time string (MM:SS) to minutes for sorting
    const timeToMinutes = useCallback((timeStr) => {
        if (!timeStr) return 0;
        const [minutes, seconds] = timeStr.split(':').map(Number);
        return minutes + seconds / 60;
    }, []);

    // Fetch results from database
    const fetchResults = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // In a real app, this would be your API endpoint
            const response = await fetch('/api/results/results');

            if (!response.ok) {
                throw new Error(`Failed to fetch results: ${response.statusText}`);
            }

            const data = await response.json();
            const processedData = data.map(item => ({
                ...item,
                percentage: parseFloat(item.percentage) || 0,
                score: parseInt(item.score, 10) || 0,
                total: parseInt(item.total, 10) || 0,
                attempted: parseInt(item.attempted, 10) || 0,
            }));
            setResults(processedData);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching results:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    // Filter and sort results
    useEffect(() => {
        if (!Array.isArray(results)) {
            console.warn('Results is not an array:', results);
            setFilteredResults([]);
            return;
        }

        let currentFiltered = [...results];

        if (searchTerm) {
            currentFiltered = currentFiltered.filter(result =>
                result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                result.test.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (result.group && result.group.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedTest !== 'all') {
            currentFiltered = currentFiltered.filter(result => result.test === selectedTest);
        }

        if (selectedGroup !== 'all') {
            currentFiltered = currentFiltered.filter(result => result.group === selectedGroup);
        }

        currentFiltered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'timeTaken') {
                aVal = timeToMinutes(aVal);
                bVal = timeToMinutes(bVal);
            }

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }

            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });

        setFilteredResults(currentFiltered);
    }, [results, searchTerm, selectedTest, selectedGroup, sortBy, sortOrder, timeToMinutes]);


    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="w-5 h-5 xs:w-6 xs:h-6 text-yellow-500 fill-yellow-500" />;
        if (index === 1) return <Medal className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400 fill-gray-400" />;
        if (index === 2) return <Award className="w-5 h-5 xs:w-6 xs:h-6 text-amber-700 fill-amber-700" />;
        return <span className="w-5 h-5 xs:w-6 xs:h-6 flex items-center justify-center text-xs xs:text-sm font-bold text-gray-700">#{index + 1}</span>;
    };

    const getPercentageColor = (percentage) => {
        if (percentage >= 90) return 'text-green-700 bg-green-100';
        if (percentage >= 80) return 'text-blue-700 bg-blue-100';
        if (percentage >= 70) return 'text-yellow-700 bg-yellow-100';
        if (percentage >= 60) return 'text-orange-700 bg-orange-100';
        return 'text-red-700 bg-red-100';
    };

    const getResultBadge = (result) => {
        const baseClasses = 'px-1.5 py-0.5 rounded-full text-2xs xs:text-xs font-semibold whitespace-nowrap';
        if (result === 'Pass') {
            return `${baseClasses} bg-emerald-100 text-emerald-800`;
        }
        return `${baseClasses} bg-rose-100 text-rose-800`;
    };

    // Get unique values for filters
    const uniqueTests = Array.isArray(results) ? [...new Set(results.map(r => r.test))] : [];
    const uniqueGroups = Array.isArray(results) ? [...new Set(results.map(r => r.group))] : [];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[300px] bg-gray-50 p-4 rounded-lg"> {/* Min height for loading state */}
                <RefreshCw className="w-10 h-10 xs:w-12 xs:h-12 animate-spin text-blue-500 mb-3 xs:mb-4" />
                <p className="text-base xs:text-lg text-gray-700 font-semibold text-center">Loading leaderboard...</p>
                <p className="text-sm text-gray-500 mt-1 text-center">Fetching the latest results.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[300px] bg-gray-50 p-4 rounded-lg"> {/* Min height for error state */}
                <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center shadow-md max-w-sm w-full">
                    <p className="text-red-700 text-base xs:text-lg font-medium mb-3">Error loading results:</p>
                    <p className="text-red-600 text-sm mb-5">{error}</p>
                    <button
                        onClick={fetchResults}
                        className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
                    >
                        <RefreshCw className="inline-block mr-2 w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full  py-4 px-2 xs:px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-md p-4 xs:p-5 sm:p-6 mb-4 border border-gray-200">
                    <div className="flex flex-col xs:flex-row items-center justify-between gap-3 xs:gap-4">
                        <div className="flex items-center space-x-3">
                            <TrendingUp className="w-8 h-8 xs:w-9 xs:h-9 text-blue-600" />
                            <div>
                                <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight text-center xs:text-left">
                                    Exam Leaderboard
                                </h1>
                                <p className="text-xs xs:text-sm text-gray-600 mt-0.5 xs:mt-1 text-center xs:text-left">
                                    Track student performance.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchResults}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center space-x-1.5 shadow-sm hover:shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm w-full xs:w-auto justify-center"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow-md p-4 xs:p-5 sm:p-6 mb-4 border border-gray-200">
                    <h2 className="text-base xs:text-lg font-semibold text-gray-800 mb-3 flex items-center justify-center xs:justify-start">
                        <Search className="w-4 h-4 xs:w-5 xs:h-5 mr-2 text-gray-500" /> Filter & Sort
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 shadow-sm transition-all duration-200 text-xs xs:text-sm"
                            />
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>

                        {/* Test Filter */}
                        <div className="relative">
                            <select
                                value={selectedTest}
                                onChange={(e) => setSelectedTest(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700 shadow-sm transition-all duration-200 appearance-none bg-white pr-7 text-xs xs:text-sm"
                            >
                                <option value="all">All Tests</option>
                                {uniqueTests.map(test => (
                                    <option key={test} value={test}>{test}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                        </div>

                        {/* Group Filter */}
                        <div className="relative">
                            <select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700 shadow-sm transition-all duration-200 appearance-none bg-white pr-7 text-xs xs:text-sm"
                            >
                                <option value="all">All Groups</option>
                                {uniqueGroups.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                        </div>

                        {/* Sort Options */}
                        <div className="flex space-x-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700 shadow-sm transition-all duration-200 appearance-none bg-white pr-7 text-xs xs:text-sm"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="score">Score</option>
                                <option value="timeTaken">Time</option>
                                <option value="attempted">Attempts</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-600 shadow-sm text-xs xs:text-sm"
                                aria-label={`Sort order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                            >
                                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between border border-gray-200 transition-transform duration-200 hover:scale-[1.02]">
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-0.5">Total Results</p>
                            <p className="text-xl xs:text-2xl font-extrabold text-gray-900">{Array.isArray(results) ? results.length : 0}</p>
                        </div>
                        <Users className="w-8 h-8 xs:w-9 xs:h-9 text-blue-500 bg-blue-50 p-1.5 rounded-full" />
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between border border-gray-200 transition-transform duration-200 hover:scale-[1.02]">
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-0.5">Avg Percentage</p>
                            <p className="text-xl xs:text-2xl font-extrabold text-gray-900">
                                {Array.isArray(results) && results.length > 0 ? (results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(1) : 0}%
                            </p>
                        </div>
                        <Target className="w-8 h-8 xs:w-9 xs:h-9 text-green-500 bg-green-50 p-1.5 rounded-full" />
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between border border-gray-200 transition-transform duration-200 hover:scale-[1.02]">
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-0.5">Pass Rate</p>
                            <p className="text-xl xs:text-2xl font-extrabold text-gray-900">
                                {Array.isArray(results) && results.length > 0 ? ((results.filter(r => r.finalresult === 'Pass').length / results.length) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                        <Award className="w-8 h-8 xs:w-9 xs:h-9 text-yellow-600 bg-yellow-50 p-1.5 rounded-full" />
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between border border-gray-200 transition-transform duration-200 hover:scale-[1.02]">
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-0.5">Avg Time</p>
                            <p className="text-xl xs:text-2xl font-extrabold text-gray-900">
                                {Array.isArray(results) && results.length > 0 ? (results.reduce((acc, r) => acc + timeToMinutes(r.timeTaken), 0) / results.length).toFixed(1) : 0}m
                            </p>
                        </div>
                        <Clock className="w-8 h-8 xs:w-9 xs:h-9 text-purple-600 bg-purple-50 p-1.5 rounded-full" />
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    {/* Outer div to control height and enable scrolling */}
                    <div className="overflow-x-auto"> {/* Ensures horizontal scroll for small screens */}
                        <div className="max-h-[500px] overflow-y-auto"> {/* This sets the max height and enables vertical scroll */}
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10"> {/* Sticky header */}
                                    <tr>
                                        <th scope="col" className="px-2 py-2 text-left text-2xs xs:text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Rank</th>
                                        <th scope="col" className="px-2 py-2 text-left text-2xs xs:text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Student</th>
                                        <th scope="col" className="px-2 py-2 text-left text-2xs xs:text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Test & Group</th>
                                        <th scope="col" className="px-2 py-2 text-left text-2xs xs:text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Score</th>
                                        <th scope="col" className="px-2 py-2 text-left text-2xs xs:text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Percent</th>
                                        <th scope="col" className="px-2 py-2 text-left text-2xs xs:text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Time</th>
                                        <th scope="col" className="px-2 py-2 text-left text-2xs xs:text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Result</th>
                                        <th scope="col" className="px-2 py-2 text-left text-2xs xs:text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredResults.length > 0 ? (
                                        filteredResults.map((result, index) => (
                                            <tr key={result._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-2 py-3 whitespace-nowrap">
                                                    <div className="flex items-center justify-center">
                                                        {getRankIcon(index)}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-6 w-6 xs:h-7 xs:w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs mr-2">
                                                            {result.name ? result.name[0].toUpperCase() : 'N/A'}
                                                        </div>
                                                        <div className="text-xs xs:text-sm font-medium text-gray-900">{result.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3 whitespace-nowrap">
                                                    <div className="text-xs xs:text-sm text-gray-900 font-semibold">{result.test}</div>
                                                    <div className="text-2xs xs:text-xs text-gray-500">{result.group}</div>
                                                </td>
                                                <td className="px-2 py-3 whitespace-nowrap">
                                                    <div className="text-xs xs:text-sm text-gray-900">{result.score}/{result.total}</div>
                                                    <div className="text-2xs xs:text-xs text-gray-500">{result.attempted} att.</div>
                                                </td>
                                                <td className="px-2 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-2xs xs:text-xs font-semibold ${getPercentageColor(result.percentage)}`}>
                                                        {result.percentage}%
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3 whitespace-nowrap text-xs xs:text-sm text-gray-900">
                                                    {result.timeTaken}
                                                </td>
                                                <td className="px-2 py-3 whitespace-nowrap">
                                                    <span className={getResultBadge(result.finalresult)}>
                                                        {result.finalresult}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3 whitespace-nowrap text-2xs xs:text-xs text-gray-500">
                                                    {new Date(result.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-8 text-center text-gray-500 text-sm xs:text-base">
                                                No results found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;