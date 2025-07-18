import { useState } from "react";

function AdminPanelPage({ updateUser }) {
    const [user, setUser] = useState(null);
    const accessLevels = ["Regular User", "Researcher", "Admin"];
    return (
        <div>
            <h1>Admin Panel</h1>
            <h2>User Access Level Editor</h2>
            {user !== null && (
                <>
                    {user.username},{user.access_level}
                </>
            )}
        </div>
    );
}

export default AdminPanelPage;
