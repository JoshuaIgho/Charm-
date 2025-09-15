import './style.css';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <img src={user.picture} alt={user.name} className="user-avatar" />
            <span>Welcome, {user.name}</span>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Users</h3>
            <p className="stat-number">1,248</p>
            <p className="stat-change">+12% from last week</p>
          </div>
          <div className="stat-card">
            <h3>Revenue</h3>
            <p className="stat-number">$24,894</p>
            <p className="stat-change">+8% from last week</p>
          </div>
          <div className="stat-card">
            <h3>Conversion Rate</h3>
            <p className="stat-number">24.3%</p>
            <p className="stat-change">+3% from last week</p>
          </div>
          <div className="stat-card">
            <h3>Pending Actions</h3>
            <p className="stat-number">12</p>
            <p className="stat-change">Require attention</p>
          </div>
        </div>
        
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">✓</div>
              <div className="activity-details">
                <p>User registration completed</p>
                <span>10 minutes ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">⚠</div>
              <div className="activity-details">
                <p>Server load is high</p>
                <span>45 minutes ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🔄</div>
              <div className="activity-details">
                <p>Database backup completed</p>
                <span>2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;