import React from 'react';
import Calculator from './components/Calculator';

export default function App() {
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center mb-8">UK Housing Calculator: Rent vs Buy</h1>
                <p className="text-center mb-8 text-gray-600">
                    Compare the costs of renting versus buying a property over time, with adjustable variables for property price, interest rates, and more.
                </p>
                <Calculator />
            </div>
        </div>
    );
}