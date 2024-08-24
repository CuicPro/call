import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
    const [groupId, setGroupId] = useState('');
    const [userId, setUserId] = useState('');
    const [isInCall, setIsInCall] = useState(false);

    const createGroup = async () => {
        const response = await fetch('http://localhost:5000/create-group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maxParticipants: 4 }) // Remplacez par une valeur dynamique
        });
        const data = await response.json();
        setGroupId(data.groupId);
    };

    const joinGroup = async () => {
        const response = await fetch('http://localhost:5000/join-group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId })
        });
        const data = await response.json();
        if (data.success) {
            socket.emit('join', { groupId, userId: socket.id });
            setIsInCall(true);
        } else {
            alert(data.message);
        }
    };

    return (
        <div>
            <h1>Call System</h1>
            {!isInCall ? (
                <div>
                    <button onClick={createGroup}>Create Group</button>
                    <input type="text" value={groupId} onChange={e => setGroupId(e.target.value)} placeholder="Group ID" />
                    <button onClick={joinGroup}>Join Group</button>
                </div>
            ) : (
                <h2>In Call: {groupId}</h2>
            )}
        </div>
    );
}

export default App;
