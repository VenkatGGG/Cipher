import { Provider } from 'react-redux';
import { store } from './store';
import ChatInterface from './ChatInterface';

function App() {
    return (
        <Provider store={store}>
            <ChatInterface />
        </Provider>
    );
}

export default App;
