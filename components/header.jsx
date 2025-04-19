import { Clock } from "lucide-react"

const Header = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center">
        <div className="flex items-center justify-center w-8 h-8 mr-2 bg-white rounded-md overflow-hidden">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="10" height="10" fill="#4285F4" />
            <rect x="11" width="10" height="10" fill="#EA4335" />
            <rect x="22" width="10" height="10" fill="#FBBC05" />
            <rect y="11" width="10" height="10" fill="#34A853" />
            <rect x="11" y="11" width="10" height="10" fill="#4285F4" />
            <rect x="22" y="11" width="10" height="10" fill="#EA4335" />
            <rect y="22" width="10" height="10" fill="#FBBC05" />
            <rect x="11" y="22" width="10" height="10" fill="#34A853" />
            <rect x="22" y="22" width="10" height="10" fill="#4285F4" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-medium">Form Builder</h1>
          <p className="text-xs text-gray-500">Add and customize forms for your needs</p>
        </div>
      </div>
      <div className="flex items-center text-xs text-gray-500">
        <span>Changes saved 2 mins ago</span>
        <Clock className="w-4 h-4 ml-2 text-blue-500" />
      </div>
    </div>
  )
}

export default Header