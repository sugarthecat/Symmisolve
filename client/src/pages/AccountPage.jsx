import { useState } from 'react';
import { useParams } from 'react-router-dom'
function AccountPage() {
    const { username } = useParams();
    const updateData = async () => {
        //TODO: fetch and update visible data
    }
    useState(() => {
        updateData();
    });
    return (
        <div>
            <p>
            User {username}
            </p>
        </div>
    )
}

export default AccountPage
