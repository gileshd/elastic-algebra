import { useState } from 'react';

const Counter = () => {
    const [count, setCount] = useState(0);
    const increment = () => setCount(count + 1);
    const reset = () => setCount(0);
    
    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Counter Demo</h2>
                <div className="border rounded p-4">
                    <p className="text-2xl text-center mb-4">Count: {count}</p>
                    <button 
                        onClick={increment}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors mb-2"
                    >
                        Add
                    </button>
                    <button 
                        onClick={reset}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Counter;
