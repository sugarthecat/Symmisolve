import { useParams } from 'react-router-dom'
function AccountPage() {
    const { userId } = useParams();
    return (
        <div>
            <p>
            User {userId}
            </p>
        </div>
    )
}

export default AccountPage
