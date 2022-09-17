import React, { useState } from 'react';
import { Button } from 'ui';

const App: React.FC = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="App">
            <Button />
        </div>
    );
};

export default App;
