import { NavLink, Outlet } from 'react-router-dom'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link nav-link--active' : 'nav-link'
}

function Layout() {
  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">Rohit's Project</span>
        </div>
        <div className="nav-links">
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/analytics" className={navLinkClass}>
            Analytics Chat
          </NavLink>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

export default Layout
