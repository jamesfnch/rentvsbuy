import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Calculator = () => {
    // State for all input variables
    const [inputs, setInputs] = useState({
        propertyPrice: 300000,
        deposit: 30000,
        mortgageRate: 4.5,
        mortgageLength: 25, // New parameter for mortgage length
        propertyAppreciationRate: 3,
        monthlyRent: 1200,
        rentIncreaseRate: 3,
        councilTax: 150,
        maintenanceCosts: 100,
        numBedrooms: 2,
        roomRentalIncome: 600,
        timeframe: 25,
    });

    // Calculate monthly mortgage payment
    const calculateMortgagePayment = (principal, annualRate, years) => {
        const monthlyRate = annualRate / 100 / 12;
        const numPayments = years * 12;
        return (
            (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
            (Math.pow(1 + monthlyRate, numPayments) - 1)
        );
    };

    // Generate comparison data for chart
    const comparisonData = useMemo(() => {
        const data = [];
        const loanAmount = inputs.propertyPrice - inputs.deposit;
        const monthlyMortgage = calculateMortgagePayment(
            loanAmount,
            inputs.mortgageRate,
            inputs.mortgageLength // Use mortgage length instead of timeframe
        );

        let totalBuyingCost = inputs.deposit;
        let totalRentingCost = 0;
        let currentRent = inputs.monthlyRent;
        let propertyValue = inputs.propertyPrice;
        let monthlyRoomIncome = inputs.numBedrooms > 1 ? inputs.roomRentalIncome : 0;
        let remainingMortgage = loanAmount;
        let totalInterestPaid = 0;
        let totalPrincipalPaid = 0;

        for (let year = 0; year <= inputs.timeframe; year++) {
            // Buying costs
            const yearlyMaintenance = inputs.maintenanceCosts * 12;
            const yearlyCouncilTax = inputs.councilTax * 12;
            const yearlyRoomIncome = monthlyRoomIncome * 12;

            // Calculate mortgage payments only if still within mortgage term
            let yearlyMortgage = 0;
            let yearlyInterest = 0;
            let yearlyPrincipal = 0;

            if (year < inputs.mortgageLength) {
                yearlyMortgage = monthlyMortgage * 12;
                // Calculate interest portion of the payment
                yearlyInterest = remainingMortgage * (inputs.mortgageRate / 100);
                // Principal is the total payment minus the interest
                yearlyPrincipal = yearlyMortgage - yearlyInterest;

                totalInterestPaid += yearlyInterest;
                totalPrincipalPaid += yearlyPrincipal;
                remainingMortgage = Math.max(0, remainingMortgage - yearlyPrincipal);
            }

            totalBuyingCost += yearlyMortgage + yearlyMaintenance + yearlyCouncilTax - yearlyRoomIncome;
            propertyValue *= (1 + inputs.propertyAppreciationRate / 100);

            // Renting costs
            const yearlyRent = currentRent * 12;
            totalRentingCost += yearlyRent;
            currentRent *= (1 + inputs.rentIncreaseRate / 100);

            // Net position for buying (including property value)
            const netBuyingPosition = totalBuyingCost - (propertyValue - inputs.propertyPrice);

            data.push({
                year,
                buyingCost: Math.round(totalBuyingCost),
                rentingCost: Math.round(totalRentingCost),
                netBuyingPosition: Math.round(netBuyingPosition),
                propertyValue: Math.round(propertyValue),
                remainingMortgage: Math.round(remainingMortgage),
                totalInterestPaid: Math.round(totalInterestPaid),
                yearlyInterestPaid: Math.round(yearlyInterest),
                yearlyPrincipalPaid: Math.round(yearlyPrincipal),
            });
        }
        return data;
    }, [inputs]);

    const handleInputChange = (name, value) => {
        setInputs(prev => ({
            ...prev,
            [name]: Number(value),
            // Ensure mortgage length doesn't exceed timeframe
            ...(name === 'timeframe' && prev.mortgageLength > value
                ? { mortgageLength: value }
                : {}),
        }));
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold mb-4">Property Details</h2>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Property Price (£)</label>
                                <Input
                                    type="number"
                                    value={inputs.propertyPrice}
                                    onChange={(e) => handleInputChange('propertyPrice', e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Deposit (£)</label>
                                <Input
                                    type="number"
                                    value={inputs.deposit}
                                    onChange={(e) => handleInputChange('deposit', e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mortgage Rate (%)</label>
                                <div className="flex items-center space-x-4">
                                    <Slider
                                        value={[inputs.mortgageRate]}
                                        onValueChange={([value]) => handleInputChange('mortgageRate', value)}
                                        max={10}
                                        step={0.1}
                                        className="flex-1"
                                    />
                                    <span className="w-12 text-right">{inputs.mortgageRate}%</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mortgage Length (Years)</label>
                                <div className="flex items-center space-x-4">
                                    <Slider
                                        value={[inputs.mortgageLength]}
                                        onValueChange={([value]) => handleInputChange('mortgageLength', value)}
                                        max={Math.min(35, inputs.timeframe)}
                                        min={5}
                                        step={1}
                                        className="flex-1"
                                    />
                                    <span className="w-12 text-right">{inputs.mortgageLength}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Property Appreciation Rate (%)</label>
                                <div className="flex items-center space-x-4">
                                    <Slider
                                        value={[inputs.propertyAppreciationRate]}
                                        onValueChange={([value]) => handleInputChange('propertyAppreciationRate', value)}
                                        max={10}
                                        step={0.1}
                                        className="flex-1"
                                    />
                                    <span className="w-12 text-right">{inputs.propertyAppreciationRate}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold mb-4">Rental Details</h2>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Monthly Rent (£)</label>
                                <Input
                                    type="number"
                                    value={inputs.monthlyRent}
                                    onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rent Increase Rate (%)</label>
                                <div className="flex items-center space-x-4">
                                    <Slider
                                        value={[inputs.rentIncreaseRate]}
                                        onValueChange={([value]) => handleInputChange('rentIncreaseRate', value)}
                                        max={10}
                                        step={0.1}
                                        className="flex-1"
                                    />
                                    <span className="w-12 text-right">{inputs.rentIncreaseRate}%</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Number of Bedrooms</label>
                                <Input
                                    type="number"
                                    value={inputs.numBedrooms}
                                    onChange={(e) => handleInputChange('numBedrooms', e.target.value)}
                                    min={1}
                                    max={10}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Potential Room Rental Income (£/month)</label>
                                <Input
                                    type="number"
                                    value={inputs.roomRentalIncome}
                                    onChange={(e) => handleInputChange('roomRentalIncome', e.target.value)}
                                    disabled={inputs.numBedrooms <= 1}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        <h2 className="text-2xl font-bold">Additional Costs</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Monthly Council Tax (£)</label>
                                <Input
                                    type="number"
                                    value={inputs.councilTax}
                                    onChange={(e) => handleInputChange('councilTax', e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Monthly Maintenance (£)</label>
                                <Input
                                    type="number"
                                    value={inputs.maintenanceCosts}
                                    onChange={(e) => handleInputChange('maintenanceCosts', e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Timeframe (Years)</label>
                                <div className="flex items-center space-x-4">
                                    <Slider
                                        value={[inputs.timeframe]}
                                        onValueChange={([value]) => handleInputChange('timeframe', value)}
                                        min={5}
                                        max={35}
                                        step={1}
                                        className="flex-1"
                                    />
                                    <span className="w-12 text-right">{inputs.timeframe}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Cost Comparison Over Time</h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={comparisonData}
                                margin={{ top: 20, right: 30, left: 60, bottom: 50 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="year"
                                    label={{ value: 'Years', position: 'insideBottom', offset: -25 }}
                                    tick={{ dy: 10 }}
                                />
                                <YAxis
                                    label={{
                                        value: 'Total Cost (£)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: -40
                                    }}
                                    tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                                    tick={{ dx: -5 }}
                                />
                                <Tooltip
                                    formatter={(value) => `£${new Intl.NumberFormat().format(value)}`}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rentingCost"
                                    name="Total Renting Cost"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="netBuyingPosition"
                                    name="Net Buying Position"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="propertyValue"
                                    name="Property Value"
                                    stroke="#ffc658"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="remainingMortgage"
                                    name="Remaining Mortgage"
                                    stroke="#ff7f7f"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Understanding the Metrics</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-semibold text-purple-700 mb-2">Total Renting Cost</h3>
                            <p className="text-sm text-gray-600">
                                The cumulative amount spent on rent over time, including annual rent increases.
                                This includes all monthly rent payments from the start date, adjusted by your specified
                                annual rent increase rate. This is money that you won&apos;t get back.
                            </p>
                        </div>

                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-semibold text-green-700 mb-2">Net Buying Position</h3>
                            <div className="text-sm text-gray-600">
                                <p className="mb-2">
                                    The total cost of buying minus the capital gains from property appreciation. This includes:
                                </p>
                                <ul className="list-disc ml-4 mb-2">
                                    <li>Initial deposit</li>
                                    <li>All mortgage payments</li>
                                    <li>Maintenance costs</li>
                                    <li>Council tax</li>
                                    <li>Minus any rental income from rooms</li>
                                    <li>Minus the increase in property value</li>
                                </ul>
                                <p>
                                    A lower net buying position is better, as it means your property value gains are offsetting more of your costs.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-semibold text-yellow-700 mb-2">Property Value</h3>
                            <p className="text-sm text-gray-600">
                                The estimated future value of the property based on your specified appreciation rate.
                                Starting from the initial property price, this shows how the property value grows over time.
                                This is your asset value if you choose to buy, but remember you can only realize this value
                                by selling or borrowing against the property.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">After {inputs.timeframe} years:</h3>
                            <p>Total Renting Cost: £{new Intl.NumberFormat().format(comparisonData[comparisonData.length - 1].rentingCost)}</p>
                            <p>Total Buying Cost: £{new Intl.NumberFormat().format(comparisonData[comparisonData.length - 1].buyingCost)}</p>
                            <p>Property Value: £{new Intl.NumberFormat().format(comparisonData[comparisonData.length - 1].propertyValue)}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Monthly Costs (Initial):</h3>
                            <p>Monthly Mortgage: £{new Intl.NumberFormat().format(Math.round(calculateMortgagePayment(inputs.propertyPrice - inputs.deposit, inputs.mortgageRate, inputs.timeframe)))}</p>
                            <p>Monthly Rent: £{new Intl.NumberFormat().format(inputs.monthlyRent)}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Property Details:</h3>
                            <p>Loan Amount: £{new Intl.NumberFormat().format(inputs.propertyPrice - inputs.deposit)}</p>
                            <p>Loan to Value: {((1 - inputs.deposit / inputs.propertyPrice) * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Calculator;