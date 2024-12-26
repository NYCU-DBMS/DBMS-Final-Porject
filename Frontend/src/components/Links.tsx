import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <div className='bg-[#1b2434]'>
      <nav>
        <div className='flex gap-10 justify-center items-center border-b-[1px] border-gray-600 h-14'>
          <Link to="/" className="text-white hover:text-blue-300 transition-colors">Home</Link>
          <Link to="/favorites" className="text-white hover:text-blue-300 transition-colors">Favorites</Link>
        </div>
      </nav>
    </div>
  )
}