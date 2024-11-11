import { Link } from 'react-router-dom'

export default function NavBar() {
	return (
		<div className='dark:bg-slate-700'>
			<nav>
				<div className='flex gap-10 justify-center items-center border-b-[1px] h-14'>
					<Link to="/">Home</Link>
					<Link to="/login">Login</Link>
					<Link to="/logout">Logout</Link>
					<Link to="/favorites">Favorites</Link>
				</div>
			</nav>
		</div>
	)
}
