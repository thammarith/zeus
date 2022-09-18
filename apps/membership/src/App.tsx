import React, { useState } from 'react';
import { Button } from 'ui';

const App: React.FC = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="App">
            <h1 className="text-3xl font-bold underline font-display">Hello world!</h1>
            <Button />
        </div>
    );
};

export default App;
